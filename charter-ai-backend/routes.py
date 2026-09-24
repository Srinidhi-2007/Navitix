"""
Charter AI - Route Distance & Waypoint Module
File: routes.py

Computes voyage distance in Nautical Miles (NM) between origin and destination ports.
Prioritizes curated distance overrides from routes.json. Falls back to a great-circle
Haversine formula adjusted by SEA_FACTOR.

Data & Modeling Notes:
- SEA_FACTOR = 1.2 is an ASSUMPTION/ESTIMATE to approximate maritime routing detours.
- Haversine estimate is a rough direct great-circle estimate, NOT an actual shipping-lane
  bathymetric routing distance (does not account for straits, canals, or landmass evasion).
"""

import json
import math
from pathlib import Path
from typing import Any, Dict, Optional, Tuple


# ASSUMPTION: 20% average detour factor over great-circle distance for nautical navigation
SEA_FACTOR = 1.2

# Earth mean radius in Nautical Miles (6,371.0 km / 1.852 km/NM = ~3,440.065 NM)
EARTH_RADIUS_NM = 3440.065


def haversine_distance_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in Nautical Miles."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_NM * c


def get_distance_nm(origin_id: str, destination_id: str, data_dir: str = ".") -> Dict[str, Any]:
    """
    Returns the voyage distance in nautical miles between origin_id and destination_id.
    Returns: {"distanceNM": float, "method": "override" | "haversine_estimate"}
    Raises ValueError if origin_id or destination_id is not found in ports.json.
    """
    base_dir = Path(data_dir)
    routes_path = base_dir / "routes.json"
    ports_path = base_dir / "ports.json"

    # 1. Check routes.json overrides (in either direction)
    if routes_path.exists():
        with open(routes_path, "r", encoding="utf-8") as f:
            routes_data = json.load(f).get("routes", [])

        for r in routes_data:
            o_id = r.get("originPortId")
            d_id = r.get("destinationPortId")
            dist = r.get("distanceNM")

            if dist is not None:
                if (o_id == origin_id and d_id == destination_id) or (
                    o_id == destination_id and d_id == origin_id
                ):
                    return {"distanceNM": float(dist), "method": "override"}

    # 2. Check ports.json for GPS coordinates
    if not ports_path.exists():
        raise FileNotFoundError(f"ports.json not found in {data_dir}")

    with open(ports_path, "r", encoding="utf-8") as f:
        ports_list = json.load(f).get("ports", [])

    ports_map = {p.get("id"): p for p in ports_list}

    if origin_id not in ports_map:
        raise ValueError(f"Unknown origin port: '{origin_id}'")
    if destination_id not in ports_map:
        raise ValueError(f"Unknown destination port: '{destination_id}'")

    origin = ports_map[origin_id]
    destination = ports_map[destination_id]

    lat1, lon1 = origin.get("lat"), origin.get("lon")
    lat2, lon2 = destination.get("lat"), destination.get("lon")

    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        raise ValueError(
            f"Missing coordinates for route '{origin_id}' ({lat1}, {lon1}) -> '{destination_id}' ({lat2}, {lon2})"
        )

    # Compute rough great-circle estimate adjusted by SEA_FACTOR
    gc_dist = haversine_distance_nm(lat1, lon1, lat2, lon2)
    estimated_distance = round(gc_dist * SEA_FACTOR, 1)

    return {"distanceNM": estimated_distance, "method": "haversine_estimate"}


if __name__ == "__main__":
    demo_pairs = [
        ("hay-point", "paradip"),
        ("port-hedland", "qingdao"),
        ("santos", "alexandria"),
    ]
    print("Charter AI - Route Distance Calculations:")
    for o, d in demo_pairs:
        try:
            res = get_distance_nm(o, d)
            print(f"  {o} -> {d}: {res['distanceNM']:.1f} NM ({res['method']})")
        except Exception as e:
            print(f"  {o} -> {d}: Error - {e}")
