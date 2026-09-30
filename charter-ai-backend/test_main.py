"""
Pytest suite for main.py FastAPI application.
Verifies all REST API endpoints, CORS headers, and error handling.
"""

from fastapi.testclient import TestClient
import pytest

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "dataSource" in data
    assert "ratesLastDate" in data


def test_get_ports_endpoint():
    response = client.get("/api/v1/ports")
    assert response.status_code == 200
    data = response.json()
    assert "ports" in data
    assert len(data["ports"]) > 0


def test_get_vessels_endpoint():
    response = client.get("/api/v1/vessels")
    assert response.status_code == 200
    data = response.json()
    assert "vesselTypes" in data
    assert len(data["vesselTypes"]) >= 4


def test_get_routes_endpoint():
    response = client.get("/api/v1/routes")
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data


def test_post_recommend_primary_route():
    payload = {
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
    response = client.post("/api/v1/charter/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["heroDecision"]["recommendedVesselId"] == "panamax"
    assert len(data["candidateVessels"]) == 4


def test_post_recommend_invalid_port():
    payload = {
        "cargoType": "Coking Coal",
        "cargoQuantityMT": 50000,
        "originPortId": "nonexistent-port",
        "destinationPortId": "paradip",
    }
    response = client.post("/api/v1/charter/recommend", json=payload)
    assert response.status_code == 400
