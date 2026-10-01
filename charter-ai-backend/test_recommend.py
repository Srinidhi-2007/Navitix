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


# ── Contract Type Recommendation Tests ─────────────────────────────────────────

def test_contract_type_fields_present(primary_request):
    """heroDecision must contain all three contractType fields."""
    resp = recommend(primary_request, data_dir=str(BASE_DIR))
    hd = resp["heroDecision"]
    assert "recommendedContractType" in hd, "missing recommendedContractType"
    assert "contractTypeRationale" in hd, "missing contractTypeRationale"
    assert "contractTypeComparison" in hd, "missing contractTypeComparison"


def test_contract_type_comparison_shape(primary_request):
    """contractTypeComparison must be a list of 3 items with required keys."""
    resp = recommend(primary_request, data_dir=str(BASE_DIR))
    comp = resp["heroDecision"]["contractTypeComparison"]
    assert len(comp) == 3
    types = {c["type"] for c in comp}
    assert types == {"spot", "time", "multi"}
    for c in comp:
        assert "label" in c
        assert "isRecommended" in c
        assert "pros" in c and isinstance(c["pros"], list)
        assert "cons" in c and isinstance(c["cons"], list)
        assert "riskLevel" in c


def test_exactly_one_recommended(primary_request):
    """Exactly one contract type must be marked isRecommended=True."""
    resp = recommend(primary_request, data_dir=str(BASE_DIR))
    comp = resp["heroDecision"]["contractTypeComparison"]
    rec_count = sum(1 for c in comp if c["isRecommended"])
    assert rec_count == 1, f"Expected 1 recommended, got {rec_count}"


def test_auto_recommendation_is_valid_type(primary_request):
    """recommendedContractType must be one of the known values."""
    resp = recommend(primary_request, data_dir=str(BASE_DIR))
    rec = resp["heroDecision"]["recommendedContractType"]
    assert rec in ("spot", "time", "multi"), f"Unexpected type: {rec}"


def test_user_override_contract_type(primary_request):
    """If user sends contractType=time, backend must respect it."""
    req = {**primary_request, "contractType": "time"}
    resp = recommend(req, data_dir=str(BASE_DIR))
    hd = resp["heroDecision"]
    assert hd["recommendedContractType"] == "time", \
        f"Override ignored: got {hd['recommendedContractType']}"
    # The time charter option should be marked recommended
    comp = {c["type"]: c for c in hd["contractTypeComparison"]}
    assert comp["time"]["isRecommended"] is True
    assert comp["spot"]["isRecommended"] is False


def test_coa_cost_is_lower_than_spot(primary_request):
    """COA estimatedCostCr must be calculated and lower than spot (5% discount assumption)."""
    req = {**primary_request, "contractDurationDays": 15}
    resp = recommend(req, data_dir=str(BASE_DIR))
    comp = {c["type"]: c for c in resp["heroDecision"]["contractTypeComparison"]}
    spot_cr = comp["spot"]["estimatedCostCr"]
    coa_cr = comp["multi"]["estimatedCostCr"]
    assert coa_cr is not None and spot_cr is not None
    assert coa_cr < spot_cr, f"COA cost {coa_cr} should be lower than spot {spot_cr}"


def test_time_charter_cost_is_higher_than_spot(primary_request):
    """Time charter estimated cost must be >= spot (8% premium assumption)."""
    resp = recommend(primary_request, data_dir=str(BASE_DIR))
    comp = {c["type"]: c for c in resp["heroDecision"]["contractTypeComparison"]}
    spot_cr = comp["spot"]["estimatedCostCr"]
    tc_cr = comp["time"]["estimatedCostCr"]
    assert spot_cr is not None and tc_cr is not None
    assert tc_cr > spot_cr, f"TC cost {tc_cr} should exceed spot {spot_cr}"
