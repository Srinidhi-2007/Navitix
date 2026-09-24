"""
Pytest suite for validate_contract.py
Verifies that:
1. The sample response from contract.json passes with 0 violations.
2. Breaking the payload four distinct ways results in detected invariant violations:
   - Two recommended vessels
   - Wrong costBreakdownCr sum
   - Unsorted freightForecast.timeSeries
   - Band inversion (lowerBand <= forecastRate <= upperBand violated)
"""

import copy
import json
from pathlib import Path
import pytest

from validate_contract import validate_response


CONTRACT_PATH = Path(__file__).parent / "contract.json"


@pytest.fixture
def sample_response() -> dict:
    with open(CONTRACT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["response"]


def test_sample_passes(sample_response):
    """Proves the canonical sample response from contract.json passes with zero violations."""
    violations = validate_response(sample_response)
    assert violations == [], f"Expected 0 violations on sample, got: {violations}"


def test_break_two_recommended_vessels(sample_response):
    """Break 1: Two candidates marked isRecommended=True must be detected."""
    mutated = copy.deepcopy(sample_response)
    # Supramax also marked recommended alongside Panamax
    mutated["candidateVessels"][1]["isRecommended"] = True

    violations = validate_response(mutated)
    assert len(violations) > 0
    assert any("isRecommended" in v for v in violations), f"Violations: {violations}"


def test_break_wrong_cost_sum(sample_response):
    """Break 2: Components of costBreakdownCr differing from total by > 0.01 must be detected."""
    mutated = copy.deepcopy(sample_response)
    # Tamper total on first candidate
    mutated["candidateVessels"][0]["costBreakdownCr"]["total"] += 1.50

    violations = validate_response(mutated)
    assert len(violations) > 0
    assert any("costBreakdownCr" in v for v in violations), f"Violations: {violations}"


def test_break_unsorted_timeseries(sample_response):
    """Break 3: timeSeries not sorted by dayOffset must be detected."""
    mutated = copy.deepcopy(sample_response)
    ts = mutated["freightForecast"]["timeSeries"]
    # Swap the first two points so offsets are out of order
    ts[0], ts[1] = ts[1], ts[0]

    violations = validate_response(mutated)
    assert len(violations) > 0
    assert any("sorted" in v for v in violations), f"Violations: {violations}"


def test_break_band_inversion(sample_response):
    """Break 4: Forecast point where lowerBand <= forecastRate <= upperBand is violated must be detected."""
    mutated = copy.deepcopy(sample_response)
    # Invert bands on the first non-historical forecast point
    for pt in mutated["freightForecast"]["timeSeries"]:
        if pt.get("forecastRate") is not None:
            # Set lowerBand higher than forecastRate
            pt["lowerBand"] = pt["forecastRate"] + 5.0
            break

    violations = validate_response(mutated)
    assert len(violations) > 0
    assert any("band" in v.lower() for v in violations), f"Violations: {violations}"
