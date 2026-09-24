"""
Charter AI - Data Integrity & Validation Module
File: check_data.py

Validates ports.json and vessels.json data structures, physical constraints,
and identifies warnings for unverified or incomplete fields.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Set


REQUIRED_VESSEL_IDS = {"handysize", "supramax", "panamax", "capesize"}


def check_data(data_dir: str = ".") -> Dict[str, List[str]]:
    """
    Validates ports.json and vessels.json in data_dir.
    Returns a dict with 'errors' and 'warnings' lists.
    """
    errors: List[str] = []
    warnings: List[str] = []
    dir_path = Path(data_dir)

    ports_path = dir_path / "ports.json"
    vessels_path = dir_path / "vessels.json"

    if not ports_path.exists():
        errors.append(f"Missing ports.json in {data_dir}")
        return {"errors": errors, "warnings": warnings}
    if not vessels_path.exists():
        errors.append(f"Missing vessels.json in {data_dir}")
        return {"errors": errors, "warnings": warnings}

    with open(ports_path, "r", encoding="utf-8") as f:
        ports_data = json.load(f)
    with open(vessels_path, "r", encoding="utf-8") as f:
        vessels_data = json.load(f)

    # 1. Validate Ports
    ports_list = ports_data.get("ports", [])
    seen_port_ids: Set[str] = set()
    unverified_ports: List[str] = []

    for port in ports_list:
        p_id = port.get("id")
        if not p_id:
            errors.append("Port found without an 'id'")
            continue

        if p_id in seen_port_ids:
            errors.append(f"Duplicate port id found: '{p_id}'")
        seen_port_ids.add(p_id)

        # Check verified flag
        if not port.get("verified", False):
            unverified_ports.append(p_id)

        # Check port envelope vs direct limits
        envelope = port.get("portEnvelope", {})
        has_envelope = bool(envelope.get("maxDraftM") and envelope.get("maxLoaM"))
        has_direct = bool(port.get("maxDraftM") and port.get("maxLoaM"))
        berths = port.get("berths", [])

        if not berths and not (has_envelope or has_direct):
            errors.append(f"Port '{p_id}' has neither 'berths' nor maxDraftM/maxLoaM")

        # Warning checks on port level
        if port.get("maxBeamM") is None and envelope.get("maxBeamM") is None:
            warnings.append(f"Port '{p_id}' has maxBeamM null")
        if port.get("berthLengthM") is None:
            warnings.append(f"Port '{p_id}' has berthLengthM null")

        # Check dimensions for non-negative / non-zero
        for key in ["maxDraftM", "maxLoaM", "maxBeamM", "berthLengthM"]:
            val = port.get(key)
            if val is not None and val <= 0:
                errors.append(f"Port '{p_id}' has invalid non-positive dimension {key}={val}")

        for key in ["maxDraftM", "maxLoaM", "maxBeamM", "maxDwt"]:
            val = envelope.get(key)
            if val is not None and val <= 0:
                errors.append(f"Port '{p_id}' envelope has invalid non-positive {key}={val}")

        # Check berths
        env_max_draft = envelope.get("maxDraftM")
        env_max_loa = envelope.get("maxLoaM")
        env_max_beam = envelope.get("maxBeamM")

        for b in berths:
            b_id = b.get("id", "unnamed")
            # Required fields
            for req_field in ["maxLoaM", "maxBeamM", "maxDraftM", "cargoClass"]:
                if b.get(req_field) is None:
                    errors.append(f"Port '{p_id}' berth '{b_id}' is missing required field '{req_field}'")

            # Non-positive dimensions
            for dim in ["maxLoaM", "maxBeamM", "maxDraftM", "minLoaM"]:
                val = b.get(dim)
                if val is not None and val <= 0:
                    errors.append(f"Port '{p_id}' berth '{b_id}' has invalid non-positive dimension {dim}={val}")

            # Warning: Berth limit exceeds portEnvelope
            if env_max_draft is not None and b.get("maxDraftM") is not None and b.get("maxDraftM") > env_max_draft:
                warnings.append(
                    f"Port '{p_id}' berth '{b_id}' maxDraftM ({b['maxDraftM']}m) exceeds portEnvelope ({env_max_draft}m)"
                )
            if env_max_loa is not None and b.get("maxLoaM") is not None and b.get("maxLoaM") > env_max_loa:
                warnings.append(
                    f"Port '{p_id}' berth '{b_id}' maxLoaM ({b['maxLoaM']}m) exceeds portEnvelope ({env_max_loa}m)"
                )
            if env_max_beam is not None and b.get("maxBeamM") is not None and b.get("maxBeamM") > env_max_beam:
                warnings.append(
                    f"Port '{p_id}' berth '{b_id}' maxBeamM ({b['maxBeamM']}m) exceeds portEnvelope ({env_max_beam}m)"
                )

    if unverified_ports:
        warnings.append(f"Unverified mock ports (verified=false): {', '.join(unverified_ports)}")

    # 2. Validate Vessels
    vessels_list = vessels_data.get("vesselTypes", [])
    seen_vessel_ids: Set[str] = set()

    for vessel in vessels_list:
        v_id = vessel.get("id")
        if not v_id:
            errors.append("Vessel found without an 'id'")
            continue

        if v_id in seen_vessel_ids:
            errors.append(f"Duplicate vessel id found: '{v_id}'")
        seen_vessel_ids.add(v_id)

        # Required fields
        for req_field in ["designLadenDraftM", "beamM", "loaM", "cargoCapacityMT"]:
            if vessel.get(req_field) is None:
                errors.append(f"Vessel '{v_id}' is missing required field '{req_field}'")
            elif vessel.get(req_field) <= 0:
                errors.append(f"Vessel '{v_id}' has invalid non-positive dimension {req_field}={vessel.get(req_field)}")

        # Assumptions block
        if not vessel.get("assumptions") or not isinstance(vessel.get("assumptions"), dict):
            errors.append(f"Vessel '{v_id}' is missing assumptions block")

    missing_vessels = REQUIRED_VESSEL_IDS - seen_vessel_ids
    if missing_vessels:
        errors.append(f"Missing required vessel ids: {missing_vessels}")

    return {"errors": errors, "warnings": warnings}


if __name__ == "__main__":
    result = check_data(".")
    errs = result["errors"]
    warns = result["warnings"]

    print(f"Data Validation: {len(errs)} error(s), {len(warns)} warning(s)")
    if errs:
        print("\nERRORS:")
        for e in errs:
            print(f"  - [ERROR] {e}")
    else:
        print("OK: 0 errors.")

    if warns:
        print("\nWARNINGS:")
        for w in warns:
            print(f"  - [WARN] {w}")
