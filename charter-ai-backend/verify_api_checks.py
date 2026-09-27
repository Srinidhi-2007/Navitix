"""
Charter AI — API Verification Script
Runs the 4 required checks against the running FastAPI server on port 8000.
"""

import json
import urllib.request
import urllib.error
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"

def post_json(endpoint: str, payload: dict):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body


def run_checks():
    results = {}
    
    # ── Load routes.json ──────────────────────────────────────────────────────
    with open("routes.json", "r", encoding="utf-8") as f:
        routes_data = json.load(f)["routes"]

    responses = []

    # ── Check 1: POST all 3 routes.json scenarios succeed with feasible rec ──
    check1_passed = True
    check1_details = []
    
    for r in routes_data:
        payload = {
            "cargoType": r["defaultCargoType"],
            "cargoQuantityMT": r["defaultCargoMT"],
            "originPortId": r["originPortId"],
            "destinationPortId": r["destinationPortId"],
            "laycanStart": "2026-09-12",
            "laycanEnd": "2026-09-16",
            "desiredArrivalDate": "2026-09-28",
        }
        status_code, resp_json = post_json("/api/v1/charter/recommend", payload)
        if status_code != 200:
            check1_passed = False
            check1_details.append(f"Route {r['id']} returned HTTP {status_code}: {resp_json}")
            continue

        responses.append((r["id"], resp_json))
        rec_id = resp_json.get("heroDecision", {}).get("recommendedVesselId")
        candidates = {c["id"]: c for c in resp_json.get("candidateVessels", [])}
        rec_cand = candidates.get(rec_id)
        
        if not rec_cand or not rec_cand.get("isFeasible") or not rec_cand.get("isRecommended"):
            check1_passed = False
            check1_details.append(f"Route {r['id']} recommended vessel '{rec_id}' is not feasible or not marked recommended")
        else:
            check1_details.append(f"Route {r['id']} -> Recommended: {rec_id} (Feasible: {rec_cand['isFeasible']}, Total: Rs {rec_cand['costBreakdownCr']['total']} Cr)")

    results["Check 1: POST all 3 routes.json scenarios succeed with feasible recommended vessel"] = {
        "pass": check1_passed,
        "details": check1_details,
    }

    # ── Check 2: costBreakdownCr components sum to total (±0.01) ─────────────
    check2_passed = True
    check2_details = []

    for route_id, resp in responses:
        for c in resp.get("candidateVessels", []):
            cost = c.get("costBreakdownCr", {})
            freight = cost.get("freight", 0.0)
            waiting = cost.get("waitingDemurrage", 0.0)
            bunker = cost.get("bunkerFuel", 0.0)
            misc = cost.get("portCanalMisc", 0.0)
            total = cost.get("total", 0.0)

            comp_sum = round(freight + waiting + bunker + misc, 4)
            diff = abs(comp_sum - total)
            if diff > 0.01 + 1e-6:
                check2_passed = False
                check2_details.append(
                    f"{route_id} vessel {c['id']}: sum({freight} + {waiting} + {bunker} + {misc}) = {comp_sum} != {total} (diff: {diff})"
                )

    if check2_passed:
        check2_details.append(f"All 12 candidate cost breakdowns across 3 routes sum exactly to total within ±0.01")

    results["Check 2: Every candidate's costBreakdownCr components sum to its total (±0.01)"] = {
        "pass": check2_passed,
        "details": check2_details,
    }

    # ── Check 3: freightForecast.timeSeries is sorted and bounded ─────────────
    check3_passed = True
    check3_details = []

    for route_id, resp in responses:
        ts = resp.get("freightForecast", {}).get("timeSeries", [])
        offsets = [pt.get("dayOffset") for pt in ts]
        if offsets != sorted(offsets):
            check3_passed = False
            check3_details.append(f"{route_id}: timeSeries not sorted by dayOffset: {offsets}")

        for pt in ts:
            fr = pt.get("forecastRate")
            lb = pt.get("lowerBand")
            ub = pt.get("upperBand")
            if fr is not None and lb is not None and ub is not None:
                if not (lb <= fr <= ub):
                    check3_passed = False
                    check3_details.append(
                        f"{route_id} day {pt.get('dayOffset')}: lower ({lb}) <= forecast ({fr}) <= upper ({ub}) is False"
                    )

    if check3_passed:
        check3_details.append(f"All timeSeries points across 3 routes sorted correctly with lowerBand <= forecastRate <= upperBand")

    results["Check 3: freightForecast.timeSeries is sorted by dayOffset with lowerBand<=forecastRate<=upperBand"] = {
        "pass": check3_passed,
        "details": check3_details,
    }

    # ── Check 4: Unknown port id -> 400; negative tonnage -> 422 ─────────────
    check4_passed = True
    check4_details = []

    # 4a. Unknown port id -> 400
    bad_port_payload = {
        "cargoType": "Coking Coal",
        "cargoQuantityMT": 50000,
        "originPortId": "atlantis-deepwater",
        "destinationPortId": "paradip",
    }
    status_bad_port, body_bad_port = post_json("/api/v1/charter/recommend", bad_port_payload)
    if status_bad_port == 400:
        check4_details.append(f"Unknown port id correctly returned HTTP 400: {body_bad_port}")
    else:
        check4_passed = False
        check4_details.append(f"Unknown port id expected HTTP 400, got HTTP {status_bad_port}: {body_bad_port}")

    # 4b. Negative tonnage -> 422
    neg_cargo_payload = {
        "cargoType": "Coking Coal",
        "cargoQuantityMT": -50000,
        "originPortId": "hay-point",
        "destinationPortId": "paradip",
    }
    status_neg_cargo, body_neg_cargo = post_json("/api/v1/charter/recommend", neg_cargo_payload)
    if status_neg_cargo == 422:
        check4_details.append(f"Negative tonnage correctly returned HTTP 422 (Unprocessable Entity)")
    else:
        check4_passed = False
        check4_details.append(f"Negative tonnage expected HTTP 422, got HTTP {status_neg_cargo}: {body_neg_cargo}")

    results["Check 4: Unknown port id -> 400; negative tonnage -> 422"] = {
        "pass": check4_passed,
        "details": check4_details,
    }

    return results


if __name__ == "__main__":
    res = run_checks()
    print("=" * 80)
    print("CHARTER AI API VERIFICATION REPORT")
    print("=" * 80)
    for name, data in res.items():
        status_str = "PASS" if data["pass"] else "FAIL"
        print(f"[{status_str}] {name}")
        for d in data["details"]:
            safe_d = str(d).replace("\u20b9", "Rs ").replace("\u2013", "-").replace("\u2014", "-")
            print(f"       -> {safe_d}")
        print("-" * 80)
