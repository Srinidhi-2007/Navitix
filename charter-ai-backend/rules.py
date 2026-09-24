"""
Charter AI — Vessel Feasibility & Port Constraint Rules Engine
File: rules.py

Evaluates vessel physical suitability against origin and destination port envelopes
and berth constraints (draft, LOA, beam, and cargo capacity).

Data Status:
- Port and vessel dimensions are sourced from ports.json and vessels.json.
- Ballast draft ratio and linear draft scaling formula are ASSUMPTIONS (indicative).
"""

from typing import Any, Dict, List, Optional, Tuple


# ASSUMPTION / INDICATIVE: Typical ballast draft ratio relative to design laden draft
BALLAST_DRAFT_RATIO = 0.45


def estimate_vessel_draft(cargo_mt: float, reference_dwt: float, design_laden_draft_m: float) -> float:
    """
    Estimates actual operating draft based on cargo tonnage carried.
    ASSUMPTION: Linear interpolation between ballast draft and design laden draft.
    """
    if reference_dwt <= 0:
        return design_laden_draft_m
    
    cargo_fraction = min(max(cargo_mt / reference_dwt, 0.0), 1.0)
    ballast_draft = design_laden_draft_m * BALLAST_DRAFT_RATIO
    estimated_draft = ballast_draft + (design_laden_draft_m - ballast_draft) * cargo_fraction
    return round(estimated_draft, 2)


def check_vessel_port_feasibility(
    vessel: Dict[str, Any],
    port: Dict[str, Any],
    cargo_mt: float,
    cargo_type: Optional[str] = None
) -> Tuple[bool, str, float]:
    """
    Evaluates whether a vessel can call at a given port based on portEnvelope and berth constraints.
    Returns: (is_feasible, reason, effective_draft)
    """
    envelope = port.get("portEnvelope", {})
    max_port_draft = envelope.get("maxDraftM", 99.0)
    max_port_loa = envelope.get("maxLoaM", 999.0)
    max_port_beam = envelope.get("maxBeamM", 99.0)

    # Use vessel design specs
    design_draft = vessel.get("designLadenDraftM", vessel.get("draftMeters", 12.0))
    loa = vessel.get("loaM", vessel.get("loaMeters", 200.0))
    beam = vessel.get("beamM", vessel.get("beamMeters", 32.0))
    ref_dwt = vessel.get("referenceDwt", vessel.get("dwt", 60000.0))

    # Calculate operating draft for this cargo parcel
    effective_draft = design_draft  # Conservative baseline
    
    # Check draft clearance
    if effective_draft > max_port_draft:
        clearance = round(max_port_draft - effective_draft, 2)
        return (
            False,
            f"Draft exceeds {port.get('name', 'port')} limit: {effective_draft}m > {max_port_draft}m (clearance: {clearance}m).",
            effective_draft
        )

    # Check LOA
    if loa > max_port_loa:
        return (
            False,
            f"LOA exceeds {port.get('name', 'port')} envelope: {loa}m > {max_port_loa}m.",
            effective_draft
        )

    # Check Beam
    if beam > max_port_beam:
        return (
            False,
            f"Beam exceeds {port.get('name', 'port')} envelope: {beam}m > {max_port_beam}m.",
            effective_draft
        )

    return (
        True,
        f"Compliant with {port.get('name', 'port')} envelope (draft {effective_draft}m <= {max_port_draft}m).",
        effective_draft
    )


def evaluate_candidate_vessels(
    vessels_data: List[Dict[str, Any]],
    origin_port: Dict[str, Any],
    destination_port: Dict[str, Any],
    cargo_mt: float,
    cargo_type: str = "Coking Coal"
) -> List[Dict[str, Any]]:
    """
    Evaluates feasibility for the four standard vessel classes:
    handysize, supramax, panamax, capesize.
    
    Invariant: Always returns candidates in order: handysize, supramax, panamax, capesize.
    """
    order = ["handysize", "supramax", "panamax", "capesize"]
    vessel_map = {v.get("id"): v for v in vessels_data}
    results = []

    for v_id in order:
        vessel = vessel_map.get(v_id)
        if not vessel:
            continue

        capacity = vessel.get("cargoCapacityMT", vessel.get("capacityMT", 50000))
        design_draft = vessel.get("designLadenDraftM", vessel.get("draftMeters", 12.0))
        
        # Origin check
        origin_feas, origin_reason, _ = check_vessel_port_feasibility(vessel, origin_port, cargo_mt, cargo_type)
        # Destination check
        dest_feas, dest_reason, _ = check_vessel_port_feasibility(vessel, destination_port, cargo_mt, cargo_type)

        is_physically_feasible = origin_feas and dest_feas
        
        # Capacity evaluation
        if cargo_mt > capacity:
            # Can still be physically feasible but requires split parcel
            is_feasible = is_physically_feasible
            feasibility_reason = f"Capacity insufficient ({capacity:,} MT) without a split shipment."
            badge_text = "UNECONOMICAL (SPLIT PARCEL)"
        elif not is_physically_feasible:
            is_feasible = False
            feasibility_reason = dest_reason if not dest_feas else origin_reason
            badge_text = "❌ INFEASIBLE"
        else:
            is_feasible = True
            feasibility_reason = "Fully compliant with loading & discharge draft, berth length, and parcel size."
            badge_text = "FEASIBLE"

        results.append({
            "id": v_id,
            "name": vessel.get("name", v_id.capitalize()),
            "capacityMT": capacity,
            "draftMeters": design_draft,
            "beamMeters": vessel.get("beamM", vessel.get("beamMeters", 32.0)),
            "loaMeters": vessel.get("loaM", vessel.get("loaMeters", 200.0)),
            "dwt": vessel.get("referenceDwt", vessel.get("dwt", 60000)),
            "isFeasible": is_feasible,
            "badgeText": badge_text,
            "feasibilityReason": feasibility_reason,
        })

    return results


def build_draft_comparison(
    vessels_data: List[Dict[str, Any]],
    destination_port: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Builds the draftComparisonChart array for portConstraints in RecommendationResponse.
    """
    port_limit = destination_port.get("portEnvelope", {}).get("maxDraftM", 14.5)
    order = ["handysize", "supramax", "panamax", "capesize"]
    vessel_map = {v.get("id"): v for v in vessels_data}
    chart = []

    for v_id in order:
        vessel = vessel_map.get(v_id)
        if not vessel:
            continue
        req_draft = vessel.get("designLadenDraftM", vessel.get("draftMeters", 12.0))
        clearance = round(port_limit - req_draft, 2)
        chart.append({
            "vessel": vessel.get("name", v_id.capitalize()),
            "requiredDraft": req_draft,
            "portLimit": port_limit,
            "clearance": clearance,
            "status": "compliant" if clearance >= 0 else "restricted"
        })

    return chart


if __name__ == "__main__":
    import json
    from pathlib import Path

    base_dir = Path(__file__).parent
    ports_path = base_dir / "ports.json"
    vessels_path = base_dir / "vessels.json"

    if ports_path.exists() and vessels_path.exists():
        with open(ports_path, "r", encoding="utf-8") as f:
            ports = json.load(f)["ports"]
        with open(vessels_path, "r", encoding="utf-8") as f:
            vessels = json.load(f)["vesselTypes"]

        # Default route: Hay Point -> Paradip, 50,000 MT Coking Coal
        origin = next((p for p in ports if p["id"] == "hay-point"), ports[0])
        destination = next((p for p in ports if p["id"] == "paradip"), ports[1])
        cargo_qty = 50000.0
        cargo_name = "Coking Coal"

        candidates = evaluate_candidate_vessels(vessels, origin, destination, cargo_qty, cargo_name)

        print("=" * 96)
        print("CHARTER AI - VESSEL FEASIBILITY EVALUATION (DEFAULT ROUTE)")
        print(f"Origin: {origin.get('name')} | Destination: {destination.get('name')}")
        print(f"Parcel: {cargo_qty:,.0f} MT {cargo_name} | Paradip Max Draft: {destination.get('portEnvelope', {}).get('maxDraftM')}m")
        print("=" * 96)
        print(f"{'Vessel':<12} {'Draft':<8} {'LOA':<8} {'Beam':<8} {'Capacity MT':<14} {'Status':<12} {'Reason'}")
        print("-" * 96)
        for c in candidates:
            status = "FEASIBLE" if c["isFeasible"] else "RESTRICTED"
            draft_str = f"{c['draftMeters']}m"
            loa_str = f"{c['loaMeters']}m"
            beam_str = f"{c['beamMeters']}m"
            cap_str = f"{c['capacityMT']:,}"
            print(f"{c['name']:<12} {draft_str:<8} {loa_str:<8} {beam_str:<8} {cap_str:<14} {status:<12} {c['feasibilityReason']}")
        print("=" * 96)
    else:
        print("ports.json or vessels.json not found in rules.py directory.")
