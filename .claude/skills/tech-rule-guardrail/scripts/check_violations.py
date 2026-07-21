#!/usr/bin/env python3
"""Compare a layer-usage extraction (usage.json) against a technology
legality baseline (baseline.yaml) and an optional waiver list
(waivers.yaml), producing a machine-readable violations.json.

Usage:
    python check_violations.py --usage usage.json --baseline baseline.yaml \
        [--waivers waivers.yaml] --out violations.json
"""
import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is required: pip install pyyaml")


def load_baseline(path):
    data = yaml.safe_load(Path(path).read_text(encoding="utf-8-sig")) or {}
    allowed = {(e["layer"], e["dt"]): e for e in data.get("allowed", [])}
    deprecated = {(e["layer"], e["dt"]): e for e in data.get("deprecated", [])}
    reserved = {(e["layer"], e["dt"]): e for e in data.get("reserved", [])}
    return data.get("node"), allowed, deprecated, reserved


def load_waivers(path):
    if not path:
        return []
    data = yaml.safe_load(Path(path).read_text(encoding="utf-8-sig")) or {}
    return data.get("waivers", [])


def find_waiver(cell, layer, dt, waivers):
    for w in waivers:
        if w.get("cell") == cell and w.get("layer") == layer and w.get("dt") == dt:
            return w
    return None


def classify(layer, dt, allowed, deprecated, reserved):
    key = (layer, dt)
    if key in reserved:
        return "reserved"
    if key in deprecated:
        return "deprecated"
    if key in allowed:
        return None  # legal usage, not a violation
    return "unknown"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--usage", required=True)
    ap.add_argument("--baseline", required=True)
    ap.add_argument("--waivers")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    usage = json.loads(Path(args.usage).read_text(encoding="utf-8-sig"))
    node, allowed, deprecated, reserved = load_baseline(args.baseline)
    waivers = load_waivers(args.waivers)

    violations = []
    waived_count = 0

    for key, entry in usage.get("layers", {}).items():
        layer_s, dt_s = key.split("/")
        layer, dt = int(layer_s), int(dt_s)
        category = classify(layer, dt, allowed, deprecated, reserved)
        if category is None:
            continue

        for cell in entry.get("cells", []):
            w = find_waiver(cell["name"], layer, dt, waivers)
            if w:
                waived_count += 1
                continue
            violations.append({
                "cell": cell["name"],
                "layer": layer,
                "dt": dt,
                "layer_name": entry.get("layer_name", ""),
                "shape_count": cell.get("shape_count"),
                "bbox_um": cell.get("bbox_um"),
                "category": category,
                "rule_violated": f"{category}-layer-usage",
            })

    result = {
        "schema_version": 1,
        "node": node,
        "source_file": usage.get("source_file"),
        "baseline_file": Path(args.baseline).name,
        "violation_count": len(violations),
        "waived_count": waived_count,
        "violations": violations,
    }

    Path(args.out).write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"{len(violations)} violation(s), {waived_count} waived -> {args.out}")


if __name__ == "__main__":
    main()
