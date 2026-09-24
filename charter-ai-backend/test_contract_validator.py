"""
Pytest suite for contract_validator.py
Verifies request/response schema validation and all 5 contract invariants.
"""

import copy
import json
from pathlib import Path
import pytest
from pydantic import ValidationError

from contract_validator import (
    validate_contract_file,
    validate_contract_request,
    validate_contract_response,
    validate_invariants_dict,
    RecommendationRequest,
    RecommendationResponse,
    REQUIRED_CANDIDATE_ORDER,
)


CONTRACT_PATH = Path(__file__).parent / "contract.json"


@pytest.fixture
def sample_contract_data():
    with CONTRACT_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def test_contract_json_file_validates(sample_contract_data):
    """The embedded contract.json must pass full request and response validation."""
    assert validate_contract_file(CONTRACT_PATH) is True


def test_request_validation_success(sample_contract_data):
    req_dict = sample_contract_data["request"]
    model = validate_contract_request(req_dict)
    assert model.cargoQuantityMT == 50000
    assert model.originPortId == "hay-point"
    assert model.destinationPortId == "paradip"


def test_request_validation_missing_field():
    with pytest.raises(ValidationError):
        RecommendationRequest.model_validate({"cargoType": "Coal"})


def test_invariant_1_candidate_order(sample_contract_data):
    resp = copy.deepcopy(sample_contract_data["response"])
    # Put candidates in strict order
    id_map = {c["id"]: c for c in resp["candidateVessels"]}
    resp["candidateVessels"] = [id_map[i] for i in REQUIRED_CANDIDATE_ORDER]
    assert validate_invariants_dict(resp, strict_order=True) == []

    # Corrupt order or miss one
    resp["candidateVessels"] = [id_map["panamax"], id_map["handysize"]]
    errors = validate_invariants_dict(resp, strict_order=True)
    assert any("Invariant 1 failed" in e for e in errors)


def test_invariant_2_single_recommended_and_feasible(sample_contract_data):
    resp = copy.deepcopy(sample_contract_data["response"])
    # Corrupt: recommend two vessels
    for c in resp["candidateVessels"]:
        c["isRecommended"] = True
    errors = validate_invariants_dict(resp, strict_order=False)
    assert any("Invariant 2 failed" in e for e in errors)

    # Corrupt: recommend an infeasible vessel
    for c in resp["candidateVessels"]:
        c["isRecommended"] = False
    capesize = next(c for c in resp["candidateVessels"] if c["id"] == "capesize")
    capesize["isRecommended"] = True
    capesize["isFeasible"] = False
    errors = validate_invariants_dict(resp, strict_order=False)
    assert any("Invariant 2 failed" in e and "must have isFeasible=True" in e for e in errors)


def test_invariant_3_cost_breakdown_sum(sample_contract_data):
    resp = copy.deepcopy(sample_contract_data["response"])
    # Corrupt: mismatch total cost
    resp["candidateVessels"][0]["costBreakdownCr"]["total"] = 999.0
    errors = validate_invariants_dict(resp, strict_order=False)
    assert any("Invariant 3 failed" in e for e in errors)


def test_invariant_4_time_series_sorted_and_bounded(sample_contract_data):
    resp = copy.deepcopy(sample_contract_data["response"])
    # Corrupt: make forecastRate exceed upperBand
    for p in resp["freightForecast"]["timeSeries"]:
        if not p.get("isHistorical"):
            p["forecastRate"] = 100.0
            p["upperBand"] = 50.0
            break
    errors = validate_invariants_dict(resp, strict_order=False)
    assert any("Invariant 4 failed" in e for e in errors)


def test_invariant_5_confidence_score_range(sample_contract_data):
    resp = copy.deepcopy(sample_contract_data["response"])
    resp["riskAndConfidence"]["confidenceScore"] = 150
    errors = validate_invariants_dict(resp, strict_order=False)
    assert any("Invariant 5 failed" in e for e in errors)
