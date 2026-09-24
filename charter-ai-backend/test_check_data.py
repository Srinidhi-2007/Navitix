"""
Pytest suite for check_data.py
Tests clean dataset validation and ensures deliberate schema mutations/errors are caught.
"""

import json
from pathlib import Path
import pytest
from check_data import check_data

BASE_DIR = Path(__file__).parent


@pytest.fixture
def clean_data_dir(tmp_path):
    # Copy clean ports.json and vessels.json to tmp_path
    ports_content = (BASE_DIR / "ports.json").read_text(encoding="utf-8")
    vessels_content = (BASE_DIR / "vessels.json").read_text(encoding="utf-8")

    (tmp_path / "ports.json").write_text(ports_content, encoding="utf-8")
    (tmp_path / "vessels.json").write_text(vessels_content, encoding="utf-8")
    return tmp_path


def test_clean_data_has_no_errors(clean_data_dir):
    result = check_data(str(clean_data_dir))
    assert result["errors"] == []
    # Verify unverified mock ports warning is present
    assert any("Unverified mock ports" in w for w in result["warnings"])


def test_duplicate_port_id_detected(clean_data_dir):
    with open(clean_data_dir / "ports.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    # Duplicate first port
    data["ports"].append(data["ports"][0])
    with open(clean_data_dir / "ports.json", "w", encoding="utf-8") as f:
        json.dump(data, f)

    result = check_data(str(clean_data_dir))
    assert len(result["errors"]) > 0
    assert any("Duplicate port id" in e for e in result["errors"])


def test_missing_vessel_field_detected(clean_data_dir):
    with open(clean_data_dir / "vessels.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    # Remove designLadenDraftM from first vessel
    del data["vesselTypes"][0]["designLadenDraftM"]
    with open(clean_data_dir / "vessels.json", "w", encoding="utf-8") as f:
        json.dump(data, f)

    result = check_data(str(clean_data_dir))
    assert len(result["errors"]) > 0
    assert any("missing required field 'designLadenDraftM'" in e for e in result["errors"])
