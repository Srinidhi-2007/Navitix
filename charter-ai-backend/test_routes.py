"""
Pytest suite for routes.py
Verifies override lookups in both directions, great-circle haversine fallback estimates,
and error handling for unknown ports.
"""

from pathlib import Path
import pytest
from routes import get_distance_nm

BASE_DIR = str(Path(__file__).parent)


def test_hay_point_paradip_override_both_directions():
    # Forward direction
    fwd = get_distance_nm("hay-point", "paradip", data_dir=BASE_DIR)
    assert fwd["distanceNM"] == 4620.0
    assert fwd["method"] == "override"

    # Reverse direction
    rev = get_distance_nm("paradip", "hay-point", data_dir=BASE_DIR)
    assert rev["distanceNM"] == 4620.0
    assert rev["method"] == "override"


def test_port_hedland_qingdao_haversine_estimate():
    result = get_distance_nm("port-hedland", "qingdao", data_dir=BASE_DIR)
    assert result["method"] == "haversine_estimate"
    assert 2500 <= result["distanceNM"] <= 5000


def test_unknown_port_raises_value_error():
    with pytest.raises(ValueError, match="Unknown"):
        get_distance_nm("unknown-port-id", "paradip", data_dir=BASE_DIR)

    with pytest.raises(ValueError, match="Unknown"):
        get_distance_nm("hay-point", "unknown-dest-port", data_dir=BASE_DIR)
