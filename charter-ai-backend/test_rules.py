"""
Pytest suite for rules.py
Verifies vessel feasibility checks, draft estimation, and port constraint evaluation.
"""

import json
from pathlib import Path
import pytest

from rules import (
    estimate_vessel_draft,
    check_vessel_port_feasibility,
    evaluate_candidate_vessels,
    build_draft_comparison,
)

BASE_DIR = Path(__file__).parent


@pytest.fixture
def ports_data():
    with (BASE_DIR / "ports.json").open("r", encoding="utf-8") as f:
        return json.load(f)["ports"]


@pytest.fixture
def vessels_data():
    with (BASE_DIR / "vessels.json").open("r", encoding="utf-8") as f:
        return json.load(f)["vesselTypes"]


def test_estimate_vessel_draft():
    # Full cargo -> design laden draft
    draft_full = estimate_vessel_draft(75000, 76000, 14.2)
    assert draft_full == pytest.approx(14.2, abs=0.2)

    # Empty cargo -> ballast draft (approx 45%)
    draft_empty = estimate_vessel_draft(0, 76000, 14.2)
    assert draft_empty == pytest.approx(14.2 * 0.45, abs=0.1)


def test_capesize_draft_infeasible_at_paradip(ports_data, vessels_data):
    paradip = next(p for p in ports_data if p["id"] == "paradip")
    capesize = next(v for v in vessels_data if v["id"] == "capesize")

    is_feas, reason, draft = check_vessel_port_feasibility(capesize, paradip, cargo_mt=50000)
    # Capesize design draft 18.2m > Paradip 14.5m limit
    assert is_feas is False
    assert "Draft exceeds" in reason


def test_panamax_feasible_at_paradip(ports_data, vessels_data):
    paradip = next(p for p in ports_data if p["id"] == "paradip")
    panamax = next(v for v in vessels_data if v["id"] == "panamax")

    is_feas, reason, draft = check_vessel_port_feasibility(panamax, paradip, cargo_mt=50000)
    # Panamax design draft 14.2m <= Paradip 14.5m limit
    assert is_feas is True
    assert "Compliant" in reason


def test_evaluate_candidate_vessels_order(ports_data, vessels_data):
    hay_point = next(p for p in ports_data if p["id"] == "hay-point")
    paradip = next(p for p in ports_data if p["id"] == "paradip")

    candidates = evaluate_candidate_vessels(vessels_data, hay_point, paradip, cargo_mt=50000)
    candidate_ids = [c["id"] for c in candidates]
    assert candidate_ids == ["handysize", "supramax", "panamax", "capesize"]


def test_build_draft_comparison(ports_data, vessels_data):
    paradip = next(p for p in ports_data if p["id"] == "paradip")
    chart = build_draft_comparison(vessels_data, paradip)
    assert len(chart) == 4
    capesize_row = next(r for r in chart if r["vessel"].lower() == "capesize")
    assert capesize_row["status"] == "restricted"
    assert capesize_row["clearance"] < 0
