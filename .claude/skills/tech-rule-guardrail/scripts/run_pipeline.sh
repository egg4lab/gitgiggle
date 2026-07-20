#!/usr/bin/env bash
# Full Technology Rule Guardrail pipeline: extract -> compare -> AI report.
# Requires: klayout on PATH, python3 + pyyaml, claude (Claude Code CLI).
#
# Usage: run_pipeline.sh <gds> <baseline.yaml> [waivers.yaml] [outdir]
set -euo pipefail

GDS="$1"
BASELINE="$2"
WAIVERS="${3:-}"
OUTDIR="${4:-./guardrail_out}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$OUTDIR"

echo "[1/3] extracting layer usage from $GDS"
klayout -b -r "$SCRIPT_DIR/dump_layers.rb" -rd gds="$GDS" -rd out="$OUTDIR/usage.json"

echo "[2/3] comparing usage against baseline $BASELINE"
WAIVER_ARGS=()
if [ -n "$WAIVERS" ]; then
  WAIVER_ARGS=(--waivers "$WAIVERS")
fi
python3 "$SCRIPT_DIR/check_violations.py" \
  --usage "$OUTDIR/usage.json" \
  --baseline "$BASELINE" \
  "${WAIVER_ARGS[@]}" \
  --out "$OUTDIR/violations.json"

echo "[3/3] generating AI report"
"$SCRIPT_DIR/generate_report.sh" "$OUTDIR/violations.json" "$SCRIPT_DIR/../docs/violations.schema.md" "$OUTDIR/report.md"

echo "done -> $OUTDIR/report.md"
