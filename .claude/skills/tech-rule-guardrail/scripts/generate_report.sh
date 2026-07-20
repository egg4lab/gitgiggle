#!/usr/bin/env bash
# Generate an AI plain-language triage report from violations.json.
# Only the sanitized violations.json + schema doc are shown to the model --
# never the raw GDS file or full-layout coordinate dumps.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VIOLATIONS="${1:-violations.json}"
SCHEMA="${2:-$SCRIPT_DIR/../docs/violations.schema.md}"
OUT="${3:-report.md}"

if [ ! -f "$VIOLATIONS" ]; then
  echo "violations file not found: $VIOLATIONS" >&2
  exit 1
fi

claude -p "Read ${VIOLATIONS} (schema described in ${SCHEMA}). \
For each violation category (unknown, deprecated, reserved), explain in \
plain English what likely went wrong and suggest the probable intended \
layer. Then produce a per-block risk summary (high/medium/low) based on \
violation counts and categories. Output a markdown report with sections: \
Summary, Findings by Category, Suggested Fixes, Risk Ranking. \
Output ONLY the markdown report itself to stdout. Do not attempt to write, \
create, or save any files -- the caller redirects your stdout to a file. \
Do not include any meta-commentary about your process or tool access." < /dev/null > "$OUT"

echo "report written to $OUT"
