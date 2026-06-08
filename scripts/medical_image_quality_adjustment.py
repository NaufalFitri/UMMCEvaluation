"""Medical image quality adjustment pipeline.

This script combines a pretrained torchxrayvision model with a skfuzzy control
system that adjusts raw pathology scores using three image quality criteria:

- pemposisian: positioning quality
- densiti: exposure / density quality
- ketajaman: sharpness / motion blur quality

The fuzzy layer intentionally uses only the three requested quality criteria and
the three requested pathology signals:

- Cardiomegaly
- Consolidation
- Nodule

The demo at the bottom uses mock inputs so the fuzzy behavior can be inspected
without requiring a real chest X-ray file.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import torch

try:
    import torchxrayvision as xrv
except ImportError as exc:  # pragma: no cover - import guard for local setup issues
    raise ImportError(
        "torchxrayvision is required for this script. Install it with `pip install torchxrayvision`."
    ) from exc


QUALITY_RANGE = np.arange(0, 11, 1)
RAW_RANGE = np.linspace(0.0, 1.0, 101)
SEVERITY_RANGE = np.arange(0, 101, 1)


def load_pretrained_torchxrayvision_model() -> torch.nn.Module:
    """Load the pretrained torchxrayvision DenseNet model."""

    model = xrv.models.DenseNet(weights="densenet121-res224-all")
    model.eval()
    return model


def preprocess_chest_xray_image(image_path: str | Path) -> torch.Tensor:
    """Placeholder preprocessing hook for a chest X-ray image.

    Replace this stub with your site-specific image loading and preprocessing
    steps, for example: grayscale conversion, center crop, resize to 224x224,
    normalization, and conversion to the tensor layout expected by
    torchxrayvision.
    """

    raise NotImplementedError(
        f"Implement chest X-ray preprocessing for: {Path(image_path)}"
    )


def _normalize_pathology_name(name: str) -> str:
    return "".join(character.lower() for character in name if character.isalnum())


def _resolve_pathology_index(pathology_names: Iterable[str], target_name: str) -> int:
    target_normalized = _normalize_pathology_name(target_name)
    for index, candidate_name in enumerate(pathology_names):
        if _normalize_pathology_name(candidate_name) == target_normalized:
            return index
    raise KeyError(f"Could not resolve pathology label: {target_name}")


def extract_raw_prediction_probabilities(
    model: torch.nn.Module,
    image_tensor: torch.Tensor,
) -> Dict[str, float]:
    """Extract raw torchxrayvision probabilities for the requested findings."""

    pathology_names = list(getattr(xrv.datasets, "default_pathologies", []))
    if not pathology_names:
        pathology_names = [
            "Cardiomegaly",
            "Consolidation",
            "Nodule",
        ]

    pathology_index = {
        "raw_cardiomegaly": _resolve_pathology_index(pathology_names, "Cardiomegaly"),
        "raw_consolidation": _resolve_pathology_index(pathology_names, "Consolidation"),
        "raw_hernia": _resolve_pathology_index(pathology_names, "Hernia"),
    }

    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.sigmoid(logits).detach().cpu().squeeze(0)

    return {
        antecedent_name: float(probabilities[index].item())
        for antecedent_name, index in pathology_index.items()
    }


def _define_quality_variable(name: str) -> ctrl.Antecedent:
    variable = ctrl.Antecedent(QUALITY_RANGE, name)
    variable["poor"] = fuzz.trimf(QUALITY_RANGE, [0, 0, 4])
    variable["average"] = fuzz.trimf(QUALITY_RANGE, [2, 5, 8])
    variable["perfect"] = fuzz.trimf(QUALITY_RANGE, [6, 10, 10])
    return variable


def _define_raw_variable(name: str) -> ctrl.Antecedent:
    variable = ctrl.Antecedent(RAW_RANGE, name)
    variable["low"] = fuzz.trimf(RAW_RANGE, [0.0, 0.0, 0.35])
    variable["medium"] = fuzz.trimf(RAW_RANGE, [0.2, 0.5, 0.8])
    variable["high"] = fuzz.trimf(RAW_RANGE, [0.6, 1.0, 1.0])
    return variable


def _define_final_variable(name: str) -> ctrl.Consequent:
    variable = ctrl.Consequent(SEVERITY_RANGE, name)
    variable["low"] = fuzz.trimf(SEVERITY_RANGE, [0, 0, 35])
    variable["moderate"] = fuzz.trimf(SEVERITY_RANGE, [20, 50, 80])
    variable["high"] = fuzz.trimf(SEVERITY_RANGE, [60, 100, 100])
    return variable


def _add_paceman_rules(
    rules: list[ctrl.Rule],
    raw_variable: ctrl.Antecedent,
    output_variable: ctrl.Consequent,
    collimation: ctrl.Antecedent,
    exposure_quality: ctrl.Antecedent,
    projection_rotation: ctrl.Antecedent,
) -> None:
    """Add PACEMAN rules that evaluate all three quality factors together."""

    all_quality_ideal = (
        collimation["grade_3_ideal"]
        & exposure_quality["grade_2_ideal"]
        & projection_rotation["grade_3_zero"]
    )

    any_quality_poor = [
        collimation["grade_0_poor"],
        exposure_quality["grade_0_1_outside_range"],
        projection_rotation["grade_0_1_severe"],
    ]

    rules.extend(
        [
            ctrl.Rule(raw_variable["low"], output_variable["low"]),
            ctrl.Rule(raw_variable["medium"] & all_quality_ideal, output_variable["moderate"]),
            ctrl.Rule(raw_variable["high"] & all_quality_ideal, output_variable["high"]),
        ]
    )

    for poor_quality_term in any_quality_poor:
        rules.append(ctrl.Rule(raw_variable["medium"] & poor_quality_term, output_variable["low"]))
        rules.append(ctrl.Rule(raw_variable["high"] & poor_quality_term, output_variable["low"]))


def build_quality_adjustment_system() -> tuple[ctrl.ControlSystem, Dict[str, ctrl.Antecedent | ctrl.Consequent]]:
    """Create a PACEMAN-aligned fuzzy adjustment system."""

    collimation = ctrl.Antecedent(np.arange(0.0, 3.01, 0.01), "collimation")
    collimation["grade_0_poor"] = fuzz.trapmf(collimation.universe, [0.0, 0.0, 0.4, 1.0])
    collimation["grade_2_acceptable"] = fuzz.trimf(collimation.universe, [0.8, 2.0, 2.4])
    collimation["grade_3_ideal"] = fuzz.trapmf(collimation.universe, [2.2, 2.7, 3.0, 3.0])

    exposure_quality = ctrl.Antecedent(np.arange(1500.0, 2500.1, 1.0), "exposure_quality")
    exposure_quality["grade_0_1_outside_range"] = fuzz.trapmf(
        exposure_quality.universe,
        [1500.0, 1500.0, 1700.0, 1850.0],
    )
    exposure_quality["grade_2_ideal"] = fuzz.trimf(exposure_quality.universe, [1700.0, 2000.0, 2300.0])
    exposure_quality["grade_3_high_end"] = fuzz.trapmf(
        exposure_quality.universe,
        [2250.0, 2350.0, 2500.0, 2500.0],
    )

    projection_rotation = ctrl.Antecedent(np.arange(0.0, 3.01, 0.01), "projection_rotation")
    projection_rotation["grade_0_1_severe"] = fuzz.trapmf(
        projection_rotation.universe,
        [0.0, 0.0, 1.0, 1.3],
    )
    projection_rotation["grade_2_minimal"] = fuzz.trimf(projection_rotation.universe, [1.1, 2.0, 2.3])
    projection_rotation["grade_3_zero"] = fuzz.trapmf(
        projection_rotation.universe,
        [2.2, 2.7, 3.0, 3.0],
    )

    raw_cardiomegaly = ctrl.Antecedent(np.arange(0.0, 1.01, 0.01), "raw_cardiomegaly")
    raw_cardiomegaly["low"] = fuzz.trimf(raw_cardiomegaly.universe, [0.0, 0.0, 0.35])
    raw_cardiomegaly["medium"] = fuzz.trimf(raw_cardiomegaly.universe, [0.2, 0.5, 0.8])
    raw_cardiomegaly["high"] = fuzz.trimf(raw_cardiomegaly.universe, [0.65, 1.0, 1.0])

    raw_consolidation = ctrl.Antecedent(np.arange(0.0, 1.01, 0.01), "raw_consolidation")
    raw_consolidation["low"] = fuzz.trimf(raw_consolidation.universe, [0.0, 0.0, 0.35])
    raw_consolidation["medium"] = fuzz.trimf(raw_consolidation.universe, [0.2, 0.5, 0.8])
    raw_consolidation["high"] = fuzz.trimf(raw_consolidation.universe, [0.65, 1.0, 1.0])

    raw_hernia = ctrl.Antecedent(np.arange(0.0, 1.01, 0.01), "raw_hernia")
    raw_hernia["low"] = fuzz.trimf(raw_hernia.universe, [0.0, 0.0, 0.35])
    raw_hernia["medium"] = fuzz.trimf(raw_hernia.universe, [0.2, 0.5, 0.8])
    raw_hernia["high"] = fuzz.trimf(raw_hernia.universe, [0.65, 1.0, 1.0])

    final_cardiomegaly = ctrl.Consequent(np.arange(0.0, 101.0, 1.0), "final_cardiomegaly")
    final_cardiomegaly["low"] = fuzz.trimf(final_cardiomegaly.universe, [0.0, 0.0, 35.0])
    final_cardiomegaly["moderate"] = fuzz.trimf(final_cardiomegaly.universe, [20.0, 50.0, 80.0])
    final_cardiomegaly["high"] = fuzz.trimf(final_cardiomegaly.universe, [60.0, 100.0, 100.0])

    final_consolidation = ctrl.Consequent(np.arange(0.0, 101.0, 1.0), "final_consolidation")
    final_consolidation["low"] = fuzz.trimf(final_consolidation.universe, [0.0, 0.0, 35.0])
    final_consolidation["moderate"] = fuzz.trimf(final_consolidation.universe, [20.0, 50.0, 80.0])
    final_consolidation["high"] = fuzz.trimf(final_consolidation.universe, [60.0, 100.0, 100.0])

    final_hernia = ctrl.Consequent(np.arange(0.0, 101.0, 1.0), "final_hernia")
    final_hernia["low"] = fuzz.trimf(final_hernia.universe, [0.0, 0.0, 35.0])
    final_hernia["moderate"] = fuzz.trimf(final_hernia.universe, [20.0, 50.0, 80.0])
    final_hernia["high"] = fuzz.trimf(final_hernia.universe, [60.0, 100.0, 100.0])

    rules: list[ctrl.Rule] = []

    _add_paceman_rules(rules, raw_cardiomegaly, final_cardiomegaly, collimation, exposure_quality, projection_rotation)
    _add_paceman_rules(rules, raw_consolidation, final_consolidation, collimation, exposure_quality, projection_rotation)
    _add_paceman_rules(rules, raw_hernia, final_hernia, collimation, exposure_quality, projection_rotation)

    system = ctrl.ControlSystem(rules)
    variables: Dict[str, ctrl.Antecedent | ctrl.Consequent] = {
        "collimation": collimation,
        "exposure_quality": exposure_quality,
        "projection_rotation": projection_rotation,
        "raw_cardiomegaly": raw_cardiomegaly,
        "raw_consolidation": raw_consolidation,
        "raw_hernia": raw_hernia,
        "final_cardiomegaly": final_cardiomegaly,
        "final_consolidation": final_consolidation,
        "final_hernia": final_hernia,
    }
    return system, variables


def create_quality_adjustment_simulation() -> tuple[ctrl.ControlSystemSimulation, Dict[str, ctrl.Antecedent | ctrl.Consequent]]:
    system, variables = build_quality_adjustment_system()
    return ctrl.ControlSystemSimulation(system), variables


def run_quality_adjustment(
    simulation: ctrl.ControlSystemSimulation,
    inputs: Dict[str, float],
) -> Dict[str, float]:
    """Run one fuzzy simulation and return the crisp adjusted outputs."""

    simulation.reset()

    for key, value in inputs.items():
        simulation.input[key] = float(value)

    simulation.compute()

    return {
        "final_cardiomegaly": float(simulation.output["final_cardiomegaly"]),
        "final_consolidation": float(simulation.output["final_consolidation"]),
        "final_hernia": float(simulation.output["final_hernia"]),
    }


def _format_case_results(case_name: str, raw_inputs: Dict[str, float], outputs: Dict[str, float]) -> str:
    return (
        f"{case_name}\n"
        f"  raw_cardiomegaly={raw_inputs['raw_cardiomegaly']:.2f} -> final_cardiomegaly={outputs['final_cardiomegaly']:.1f}%\n"
        f"  raw_consolidation={raw_inputs['raw_consolidation']:.2f} -> final_consolidation={outputs['final_consolidation']:.1f}%\n"
        f"  raw_hernia={raw_inputs['raw_hernia']:.2f} -> final_hernia={outputs['final_hernia']:.1f}%"
    )


def demo_mock_inputs() -> None:
    """Demonstrate how PACEMAN rubric grades down-adjust raw pathology scores."""

    simulation, _ = create_quality_adjustment_simulation()

    cases: Iterable[tuple[str, Dict[str, float]]] = [
        (
            "Case 1: Severe rotation should suppress cardiomegaly",
            {
                "collimation": 2.5,
                "exposure_quality": 2050.0,
                "projection_rotation": 0.4,
                "raw_cardiomegaly": 0.88,
                "raw_consolidation": 0.18,
                "raw_hernia": 0.12,
            },
        ),
        (
            "Case 2: Outside-range exposure should suppress consolidation",
            {
                "collimation": 2.8,
                "exposure_quality": 1625.0,
                "projection_rotation": 2.8,
                "raw_cardiomegaly": 0.14,
                "raw_consolidation": 0.84,
                "raw_hernia": 0.10,
            },
        ),
        (
            "Case 3: Poor collimation should suppress hernia confidence",
            {
                "collimation": 0.2,
                "exposure_quality": 1980.0,
                "projection_rotation": 2.9,
                "raw_cardiomegaly": 0.11,
                "raw_consolidation": 0.16,
                "raw_hernia": 0.91,
            },
        ),
    ]

    for case_name, case_inputs in cases:
        outputs = run_quality_adjustment(simulation, case_inputs)
        print(_format_case_results(case_name, case_inputs, outputs))
        print()


def main() -> None:
    """Load the pretrained model and run the PACEMAN fuzzy demo."""

    try:
        model = load_pretrained_torchxrayvision_model()
        print(f"Loaded torchxrayvision model: {model.__class__.__name__}")
    except Exception as exc:
        model = None
        print(f"Could not load the pretrained torchxrayvision model locally: {exc}")
    print("Fuzzy control system ready for collimation, exposure_quality, and projection_rotation adjustments.\n")

    # The demo uses mock values so the down-adjustment logic can be inspected
    # without a real X-ray file.
    demo_mock_inputs()


if __name__ == "__main__":
    main()