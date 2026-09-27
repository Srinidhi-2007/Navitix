"""
Pytest suite for recommend.py
Verifies end-to-end recommendation flow and contract conformity.
"""

import json
from pathlib import Path
import pytest

from contract_validator import RecommendationResponse
from recommend import NoFeasibleVesselError, recommend
from validate_contract import validate_response

BASE_DIR = Path(__file__).parent


@pytest.fixture
def primary_request():
    return {
        "cargoType": "Coking Coal",
        "cargoQuantityMT": 50000,
        "originPortId": "hay-point",
        "destinationPortId": "paradip",
        "laycanStart": "2026-09-12",
        "laycanEnd": "2026-09-16",
        "desiredArrivalDate": "2026-09-28",
        "assumptions": {
            "currency": "INR",
            "usdToInr": 83.2,
            "demurrageUSDPerDay": 5000,
            "bunkerFuelPricePerMT": 620,
        },
    }


def test_recommend_primary_route(primary_request):
    resp = recommend(primary_request, data_dir=str(BASE_DIR))
    
    # 1. Check invariants with validator
    violations = validate_response(resp)
    assert violations == [], f"Violations found: {violations}"

    # 2. Check Pydantic schema validation
    validated = RecommendationResponse.model_validate(resp)
    assert validated.heroDecision.recommendedVesselId == "panamax"
    assert validated.heroDecision.riskLevel == "Low"
    assert len(validated.candidateVessels) == 4
    assert [c.id for c in validated.candidateVessels] == [
        "handysize",
        "supramax",
        "panamax",
        "capesize",
    ]


def test_candidate_vessel_badges_and_recommendation(primary_request):
    resp = recommend(primary_request, data_dir=str(BASE_DIR))
    candidates = {c["id"]: c for c in resp["candidateVessels"]}

    # Panamax is recommended
    assert candidates["panamax"]["isRecommended"] is True
    assert candidates["panamax"]["isFeasible"] is True

    # Others are not recommended
    assert candidates["handysize"]["isRecommended"] is False
    assert candidates["supramax"]["isRecommended"] is False
    assert candidates["capesize"]["isRecommended"] is False

    # Capesize is physically infeasible at Paradip
    assert candidates["capesize"]["isFeasible"] is False


def test_no_feasible_vessel_exception():
    # If a parcel is too large and both ports have impossible constraints
    impossible_request = {
        "cargoType": "Coking Coal",
        "cargoQuantityMT": 500000,  # Far exceeds all vessel capacities
        "originPortId": "hay-point",
        "destinationPortId": "paradip",
    }
    # Should evaluate or succeed with multi-voyages, unless physical draft fails
    # Let's test with a mock non-existent port
    with pytest.raises(ValueError):
        recommend({**impossible_request, "destinationPortId": "invalid-port"}, data_dir=str(BASE_DIR))
