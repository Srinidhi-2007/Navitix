"""
Charter AI — Voyage Cost Engine
File: cost.py

Prices each candidate vessel returned by rules.evaluate_candidate_vessels().
Adds costBreakdownCr, costBreakdownUSD, waitingDays, voyageDays, voyageCount fields
to each candidate dict (mutates a deep-copy).

All numeric constants are ASSUMPTIONS unless otherwise noted.
"""

import json
from math import ceil
from pathlib import Path
from typing import Any, Dict, List

# -- ASSUMPTION: class-typical spot rates at reference distance --------------
BASE_RATE_USD_PER_MT: Dict[str, float] = {
    "handysize": 37.8,
    "supramax":  32.1,
    "panamax":   28.5,
    "capesize":  22.4,
}

# Rates above calibrated at this haul; scale linearly with actual distance
REFERENCE_DISTANCE_NM: float = 4620  # Hay Point -> Paradip (dashboard mock)

# ASSUMPTION: minimum billable fraction of vessel capacity (deadfreight floor)
MIN_LOT_FRACTION: float = 0.60

# ASSUMPTION: port + agency misc per voyage (USD)
MISC_USD_PER_VOYAGE: Dict[str, float] = {
    "handysize": 25_000,
    "supramax":  30_000,
    "panamax":   35_000,
    "capesize":  50_000,
}

INR_CR: float = 1e7  # 1 Crore = 10,000,000 INR


def _load_vessels_map(data_dir: Path) -> Dict[str, Any]:
    with open(data_dir / "vessels.json", encoding="utf-8") as f:
        return {v["id"]: v for v in json.load(f)["vesselTypes"]}


def _round_components_to_total(components: Dict[str, float], total: float) -> Dict[str, float]:
    """
    Rounds each component to 2 dp and adjusts the last one so they sum exactly to total.
    Prevents invariant-3 violations (sum != total).
    """
    keys = list(components.keys())
    rounded = {k: round(v, 2) for k, v in components.items()}
    drift = round(total - sum(rounded.values()), 2)
    rounded[keys[-1]] = round(rounded[keys[-1]] + drift, 2)
    return rounded


def price_candidates(
    rules_result: List[Dict[str, Any]],
    cargo_mt: float,
    origin_id: str,
    destination_id: str,
    assumptions: Dict[str, Any],
    data_dir: str = ".",
) -> List[Dict[str, Any]]:
    """
    Adds cost fields to each candidate dict (shallow-extends in place, returns same list).

    assumptions keys expected:
        usdToInr             float   e.g. 83.2
        demurrageUSDPerDay   float   e.g. 5000
        bunkerFuelPricePerMT float   e.g. 620
        distanceNM           float   actual route distance
        originCongestionDays float   loading waiting days
        destCongestionDays   float   discharge waiting days
    """
    base = Path(data_dir)
    vessels_map = _load_vessels_map(base)

    usd_to_inr       = float(assumptions.get("usdToInr", 83.2))
    dem_usd_day      = float(assumptions.get("demurrageUSDPerDay", 5_000))
    bunker_price     = float(assumptions.get("bunkerFuelPricePerMT", 620))
    distance_nm      = float(assumptions.get("distanceNM", REFERENCE_DISTANCE_NM))
    load_cong        = float(assumptions.get("originCongestionDays", 1.4))
    disch_cong       = float(assumptions.get("destCongestionDays", 1.8))

    for cand in rules_result:
        v_id     = cand["id"]
        capacity = cand["capacityMT"]

        # Number of voyages needed
        voyages = max(1, ceil(cargo_mt / capacity))
        cargo_per_voyage = cargo_mt / voyages

        # Speed / bunker from vessels.json
        vessel_raw = vessels_map.get(v_id, {})
        assm       = vessel_raw.get("assumptions", {})
        speed_kn   = float(assm.get("serviceSpeedKnots", 14.0))
        cons_mt_d  = float(assm.get("bunkerConsumptionMTPerDay", 30.0))

        # -- Freight --------------------------------------------------------
        # Rate scales linearly with distance vs reference and by index movement (rateScale)
        rate_scale   = float(assumptions.get("rateScale", 1.0))
        base_rate    = BASE_RATE_USD_PER_MT.get(v_id, 28.5)
        scaled_rate  = base_rate * (distance_nm / REFERENCE_DISTANCE_NM) * rate_scale
        billable_mt  = max(cargo_per_voyage, MIN_LOT_FRACTION * capacity)
        freight_usd  = scaled_rate * billable_mt * voyages

        # -- Bunker ---------------------------------------------------------
        sea_days     = distance_nm / (speed_kn * 24)
        bunker_usd   = voyages * sea_days * cons_mt_d * bunker_price

        # -- Demurrage / Port Waiting ----------------------------------------
        total_wait_days  = load_cong + disch_cong
        demurrage_usd    = voyages * total_wait_days * dem_usd_day

        # -- Misc ------------------------------------------------------------
        misc_usd = voyages * MISC_USD_PER_VOYAGE.get(v_id, 35_000)

        total_usd = freight_usd + bunker_usd + demurrage_usd + misc_usd

        def to_cr(usd: float) -> float:
            return usd * usd_to_inr / INR_CR

        # Compute raw Cr values then round so components sum exactly to total
        total_cr = round(to_cr(total_usd), 2)
        raw_cr = {
            "freight":         to_cr(freight_usd),
            "waitingDemurrage": to_cr(demurrage_usd),
            "bunkerFuel":      to_cr(bunker_usd),
            "portCanalMisc":   to_cr(misc_usd),
        }
        cr_parts = _round_components_to_total(raw_cr, total_cr)

        cand["voyageCount"]        = voyages
        cand["freightRatePerMT"]   = round(scaled_rate, 2)
        cand["voyageDays"]         = round(sea_days, 1)
        cand["waitingDays"]        = {
            "loading":   round(load_cong, 1),
            "discharge": round(disch_cong, 1),
            "total":     round(total_wait_days, 1),
        }
        cand["costBreakdownUSD"] = {
            "freight":          round(freight_usd, 0),
            "waitingDemurrage": round(demurrage_usd, 0),
            "bunkerFuel":       round(bunker_usd, 0),
            "portCanalMisc":    round(misc_usd, 0),
            "total":            round(total_usd, 0),
        }
        cand["costBreakdownCr"] = {**cr_parts, "total": total_cr}

    return rules_result


def build_cost_analysis(
    priced_candidates: List[Dict[str, Any]],
    recommended_id: str,
    usd_to_inr: float = 83.2,
) -> Dict[str, Any]:
    """
    Builds the costAnalysis block matching contract.json shape:
      recommendedItemized, comparisonMatrix, waitingTimeBreakdown
    """
    rec = next((c for c in priced_candidates if c["id"] == recommended_id), priced_candidates[0])
    cr  = rec["costBreakdownCr"]

    COLORS = {
        "freight":          "#F47B3A",
        "waitingDemurrage": "#D9A441",
        "bunkerFuel":       "#4FA69A",
        "portCanalMisc":    "#82949A",
    }
    LABELS = {
        "freight":          "Ocean Freight",
        "waitingDemurrage": "Port Waiting / Demurrage",
        "bunkerFuel":       "Bunker Fuel (VLSFO)",
        "portCanalMisc":    "Port Dues & Agency Misc",
    }

    total_cr = cr["total"]
    recommended_itemized = [
        {
            "label":    LABELS[k],
            "amountCr": cr[k],
            "pct":      round(cr[k] / total_cr * 100, 1) if total_cr else 0,
            "color":    COLORS[k],
            "note":     "",
        }
        for k in ["freight", "waitingDemurrage", "bunkerFuel", "portCanalMisc"]
    ]

    # Comparison matrix — only include vessels that appear in priced_candidates
    cands_by_id = {c["id"]: c for c in priced_candidates}
    matrix_rows = []
    for comp_key in ["freight", "waitingDemurrage", "bunkerFuel", "portCanalMisc"]:
        row = {"item": LABELS[comp_key]}
        for v_id in ["panamax", "supramax", "handysize"]:
            if v_id in cands_by_id:
                row[v_id] = cands_by_id[v_id]["costBreakdownCr"].get(comp_key, 0)
        matrix_rows.append(row)
    total_row = {"item": "Total Voyage Cost", "isTotal": True}
    for v_id in ["panamax", "supramax", "handysize"]:
        if v_id in cands_by_id:
            total_row[v_id] = cands_by_id[v_id]["costBreakdownCr"]["total"]
    matrix_rows.append(total_row)

    waiting_breakdown = [
        {
            "vessel":      c["name"],
            "loadingDays": c["waitingDays"]["loading"],
            "dischargeDays": c["waitingDays"]["discharge"],
            "totalDays":   c["waitingDays"]["total"],
            "costCr":      c["costBreakdownCr"]["waitingDemurrage"],
            "status":      "Recommended" if c["id"] == recommended_id else "",
        }
        for c in priced_candidates
        if c.get("isFeasible") and c["id"] in {"panamax", "supramax", "handysize"}
    ]

    return {
        "unitCurrency":        "₹ Cr",
        "totalCostRecommended": total_cr,
        "recommendedItemized": recommended_itemized,
        "comparisonMatrix":    matrix_rows,
        "waitingTimeBreakdown": waiting_breakdown,
    }


# -- CLI: sanity check on primary route --------------------------------------
if __name__ == "__main__":
    import json
    from rules import evaluate_candidate_vessels
    from routes import get_distance_nm

    base = Path(__file__).parent
    with open(base / "ports.json", encoding="utf-8") as f:
        ALL_PORTS = {p["id"]: p for p in json.load(f)["ports"]}
    with open(base / "vessels.json", encoding="utf-8") as f:
        ALL_VESSELS = json.load(f)["vesselTypes"]

    CASES = [
        ("Coking Coal",      50000, "hay-point",   "paradip"),
        ("Iron Ore Fines",   70000, "port-hedland", "qingdao"),
        ("Soybeans in Bulk", 38000, "santos",       "alexandria"),
    ]

    for cargo_type, cargo_mt, o_id, d_id in CASES:
        origin = ALL_PORTS[o_id]
        dest   = ALL_PORTS[d_id]
        dist   = get_distance_nm(o_id, d_id, data_dir=str(base))

        assumptions = {
            "usdToInr":             83.2,
            "demurrageUSDPerDay":    5_000,
            "bunkerFuelPricePerMT":  620,
            "distanceNM":           dist["distanceNM"],
            "originCongestionDays": origin.get("defaultCongestionDays", 1.5),
            "destCongestionDays":   dest.get("defaultCongestionDays", 1.5),
        }

        candidates = evaluate_candidate_vessels(ALL_VESSELS, origin, dest, cargo_mt, cargo_type)
        priced     = price_candidates(candidates, cargo_mt, o_id, d_id, assumptions, data_dir=str(base))

        print(f"\n{'='*88}")
        print(f"Route : {o_id} -> {d_id}  |  {cargo_type}  {cargo_mt:,} MT  |  {dist['distanceNM']:.0f} NM ({dist['method']})")
        print(f"{'-'*88}")
        print(f"{'Vessel':<22} {'Voyages':>7} {'Rate$/MT':>9} {'Freight Cr':>11} {'Demurr Cr':>10} {'Bunker Cr':>10} {'Misc Cr':>8} {'TOTAL Cr':>9}  Feasible")
        print(f"{'-'*88}")
        for c in priced:
            cr = c["costBreakdownCr"]
            print(
                f"{c['name']:<22} {c['voyageCount']:>7} {c['freightRatePerMT']:>9.2f}"
                f" {cr['freight']:>11.2f} {cr['waitingDemurrage']:>10.2f}"
                f" {cr['bunkerFuel']:>10.2f} {cr['portCanalMisc']:>8.2f}"
                f" {cr['total']:>9.2f}  {'OK' if c['isFeasible'] else 'NO (infeasible)'}"
            )
        print(f"{'='*88}")
