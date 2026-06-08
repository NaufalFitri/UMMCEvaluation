"""Two-input CXR quality evaluation using image processing + fuzzy logic.

This version intentionally uses only two image-derived inputs:
- rotation_angle (OpenCV-based image geometry estimate)
- exposure_index (mean grayscale intensity)

The fuzzy system is Mamdani-style (skfuzzy ControlSystem) with explicit
membership functions, inference rules, and centroid defuzzification.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

try:
    import cv2
except ImportError as exc:  # pragma: no cover - import guard for local setup issues
    raise ImportError(
        "opencv-python is required for this script. Install it with `pip install opencv-python`."
    ) from exc


ROTATION_RANGE = np.arange(0.0, 15.1, 0.1)  # degrees, 0 is best
EXPOSURE_RANGE = np.arange(0.0, 255.1, 1.0)  # grayscale mean
QUALITY_SCORE_RANGE = np.arange(0.0, 101.0, 1.0)


def load_grayscale_image(image_path: str | Path) -> np.ndarray:
    image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    return image


def estimate_rotation_angle_degrees(gray_image: np.ndarray) -> float:
    """Estimate global image tilt angle in degrees using contour orientation."""

    blurred = cv2.GaussianBlur(gray_image, (5, 5), 0)
    _, mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Keep the largest foreground contour as the primary chest silhouette proxy.
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return 15.0

    largest = max(contours, key=cv2.contourArea)
    if len(largest) < 5:
        return 15.0

    rect = cv2.minAreaRect(largest)
    angle = rect[-1]

    # OpenCV angle normalization to closest absolute tilt from horizontal/vertical.
    if angle < -45:
        angle = 90 + angle
    absolute_angle = abs(float(angle))

    return float(np.clip(absolute_angle, 0.0, 15.0))


def estimate_exposure_index(gray_image: np.ndarray) -> float:
    """Estimate exposure via mean grayscale intensity (0..255)."""

    return float(np.mean(gray_image))


def _define_rotation_input() -> ctrl.Antecedent:
    rotation = ctrl.Antecedent(ROTATION_RANGE, "rotation_angle")
    rotation["aligned"] = fuzz.trapmf(ROTATION_RANGE, [0.0, 0.0, 1.5, 3.5])
    rotation["mild"] = fuzz.trimf(ROTATION_RANGE, [2.0, 5.0, 8.0])
    rotation["severe"] = fuzz.trapmf(ROTATION_RANGE, [6.0, 10.0, 15.0, 15.0])
    return rotation


def _define_exposure_input() -> ctrl.Antecedent:
    exposure = ctrl.Antecedent(EXPOSURE_RANGE, "exposure_index")
    exposure["underexposed"] = fuzz.trapmf(EXPOSURE_RANGE, [0.0, 0.0, 70.0, 110.0])
    exposure["optimal"] = fuzz.trimf(EXPOSURE_RANGE, [90.0, 128.0, 166.0])
    exposure["overexposed"] = fuzz.trapmf(EXPOSURE_RANGE, [145.0, 185.0, 255.0, 255.0])
    return exposure


def _define_output() -> ctrl.Consequent:
    quality = ctrl.Consequent(QUALITY_SCORE_RANGE, "cxr_quality_score")
    quality["poor"] = fuzz.trimf(QUALITY_SCORE_RANGE, [0.0, 0.0, 35.0])
    quality["fair"] = fuzz.trimf(QUALITY_SCORE_RANGE, [25.0, 45.0, 60.0])
    quality["good"] = fuzz.trimf(QUALITY_SCORE_RANGE, [50.0, 70.0, 85.0])
    quality["excellent"] = fuzz.trimf(QUALITY_SCORE_RANGE, [75.0, 90.0, 100.0])
    return quality


def build_quality_assessment_system() -> tuple[ctrl.ControlSystem, Dict[str, ctrl.Antecedent | ctrl.Consequent]]:
    """Create a 2-input Mamdani FIS for CXR quality assessment."""

    rotation = _define_rotation_input()
    exposure = _define_exposure_input()
    quality = _define_output()

    rules = [
        ctrl.Rule(rotation["aligned"] & exposure["optimal"], quality["excellent"]),
        ctrl.Rule(rotation["aligned"] & exposure["underexposed"], quality["good"]),
        ctrl.Rule(rotation["aligned"] & exposure["overexposed"], quality["good"]),
        ctrl.Rule(rotation["mild"] & exposure["optimal"], quality["good"]),
        ctrl.Rule(rotation["mild"] & exposure["underexposed"], quality["fair"]),
        ctrl.Rule(rotation["mild"] & exposure["overexposed"], quality["fair"]),
        ctrl.Rule(rotation["severe"] & exposure["optimal"], quality["poor"]),
        ctrl.Rule(rotation["severe"] & exposure["underexposed"], quality["poor"]),
        ctrl.Rule(rotation["severe"] & exposure["overexposed"], quality["poor"]),
    ]

    system = ctrl.ControlSystem(rules)
    variables: Dict[str, ctrl.Antecedent | ctrl.Consequent] = {
        "rotation_angle": rotation,
        "exposure_index": exposure,
        "cxr_quality_score": quality,
    }
    return system, variables


def create_quality_assessment_simulation() -> tuple[ctrl.ControlSystemSimulation, Dict[str, ctrl.Antecedent | ctrl.Consequent]]:
    system, variables = build_quality_assessment_system()
    return ctrl.ControlSystemSimulation(system), variables


def run_quality_assessment(
    simulation: ctrl.ControlSystemSimulation,
    rotation_angle: float,
    exposure_index: float,
) -> float:
    """Run one fuzzy simulation and return crisp CXR quality score (0..100)."""

    simulation.reset()
    simulation.input["rotation_angle"] = float(np.clip(rotation_angle, 0.0, 15.0))
    simulation.input["exposure_index"] = float(np.clip(exposure_index, 0.0, 255.0))
    simulation.compute()
    return float(simulation.output["cxr_quality_score"])


def quality_category(score: float) -> str:
    if score < 35:
        return "Poor"
    if score < 60:
        return "Fair"
    if score < 80:
        return "Good"
    return "Excellent"


def evaluate_cxr_image(image_path: str | Path) -> Dict[str, float | str]:
    """Extract two image-processing inputs and evaluate CXR quality via fuzzy rules."""

    gray = load_grayscale_image(image_path)
    rotation_angle = estimate_rotation_angle_degrees(gray)
    exposure_index = estimate_exposure_index(gray)

    simulation, _ = create_quality_assessment_simulation()
    score = run_quality_assessment(
        simulation=simulation,
        rotation_angle=rotation_angle,
        exposure_index=exposure_index,
    )

    return {
        "rotation_angle": rotation_angle,
        "exposure_index": exposure_index,
        "cxr_quality_score": score,
        "quality_category": quality_category(score),
    }


def demo_mock_inputs() -> None:
    """Demonstrate fuzzy behavior without requiring a real image file."""

    simulation, _ = create_quality_assessment_simulation()
    demo_cases: Iterable[tuple[str, float, float]] = [
        ("Case 1: aligned + optimal exposure", 1.2, 130.0),
        ("Case 2: mild rotation + underexposed", 5.5, 85.0),
        ("Case 3: severe rotation + overexposed", 12.0, 210.0),
    ]

    for label, rotation, exposure in demo_cases:
        score = run_quality_assessment(simulation, rotation, exposure)
        print(
            f"{label}\n"
            f"  rotation_angle={rotation:.1f}°, exposure_index={exposure:.1f} -> "
            f"cxr_quality_score={score:.1f} ({quality_category(score)})\n"
        )


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Two-input CXR quality evaluator")
    parser.add_argument(
        "--image",
        type=str,
        default=None,
        help="Optional path to a CXR image. If omitted, mock input demo is used.",
    )
    args = parser.parse_args()

    if args.image:
        result = evaluate_cxr_image(args.image)
        print("CXR quality evaluation from image-processing inputs:")
        print(
            f"  rotation_angle={result['rotation_angle']:.2f}°, "
            f"exposure_index={result['exposure_index']:.2f}"
        )
        print(
            f"  cxr_quality_score={result['cxr_quality_score']:.1f} "
            f"({result['quality_category']})"
        )
    else:
        print("Running mock-input demo for 2-input fuzzy CXR evaluation...\n")
        demo_mock_inputs()


if __name__ == "__main__":
    main()
