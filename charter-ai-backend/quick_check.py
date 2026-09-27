"""
quick_check.py — Runs evaluate_candidate_vessels for 3 demo routes and prints one line each.
"""

import json
from pathlib import Path
from rules import evaluate_candidate_vessels

BASE_DIR = Path(__file__).parent

with open(BASE_DIR / "ports.json", encoding="utf-8") as f:
    ALL_PORTS = {p["id"]: p for p in json.load(f)["ports"]}

with open(BASE_DIR / "vessels.json", encoding="utf-8") as f:
    ALL_VESSELS = json.load(f)["vesselTypes"]

CASES = [
    ("Coking Coal",       50000, "hay-point",    "paradip"),
    ("Iron Ore Fines",    70000, "port-hedland",  "qingdao"),
    ("Soybeans in Bulk",  38000, "santos",        "alexandria"),
]

for cargo_type, cargo_mt, origin_id, dest_id in CASES:
    try:
        origin = ALL_PORTS[origin_id]
        dest   = ALL_PORTS[dest_id]
        results = evaluate_candidate_vessels(ALL_VESSELS, origin, dest, cargo_mt, cargo_type)
        summary = "  ".join(
            f"{c['id']}={'OK' if c['isFeasible'] else 'NO'}({c['draftMeters']}m)"
            for c in results
        )
        print(f"{cargo_type:<24} {cargo_mt:>6}MT  {origin_id}->{dest_id}: {summary}")
    except Exception as exc:
        print(f"{cargo_type:<24} {cargo_mt:>6}MT  {origin_id}->{dest_id}: ERROR — {exc}")
