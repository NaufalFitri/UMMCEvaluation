from __future__ import annotations

import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Lock

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from scripts.medical_image_quality_adjustment import (
    create_quality_assessment_simulation,
    estimate_exposure_index,
    estimate_rotation_angle_degrees,
    load_grayscale_image,
    quality_category,
    run_quality_assessment,
)

SIMULATION = None
SIMULATION_LOCK = Lock()


def initialize_pipeline() -> None:
    global SIMULATION
    if SIMULATION is None:
        SIMULATION, _ = create_quality_assessment_simulation()


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_pipeline()
    yield


app = FastAPI(title="CXR Quality Evaluation API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/evaluate-quality")
async def evaluate_quality(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename.")

    suffix = Path(file.filename).suffix or ".png"
    temp_path: str | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        gray_image = load_grayscale_image(temp_path)
        rotation_angle = estimate_rotation_angle_degrees(gray_image)
        exposure_index = estimate_exposure_index(gray_image)

        if SIMULATION is None:
            with SIMULATION_LOCK:
                if SIMULATION is None:
                    initialize_pipeline()

        with SIMULATION_LOCK:
            score = run_quality_assessment(
                simulation=SIMULATION,
                rotation_angle=rotation_angle,
                exposure_index=exposure_index,
            )

        return {
            "status": "success",
            "extracted_metrics": {
                "rotation_angle_degrees": round(rotation_angle, 4),
                "exposure_mean_intensity": round(exposure_index, 4),
            },
            "fuzzy_evaluation": {
                "quality_score": round(score, 4),
                "category": quality_category(score),
            },
        }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Quality evaluation failed: {exc}") from exc
    finally:
        await file.close()
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False)
