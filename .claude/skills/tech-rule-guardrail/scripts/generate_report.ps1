# Generate an AI plain-language triage report from violations.json.
# Only the sanitized violations.json + schema doc are shown to the model --
# never the raw GDS file or full-layout coordinate dumps.
param(
    [string]$Violations = "violations.json",
    [string]$Schema = "$PSScriptRoot\..\docs\violations.schema.md",
    [string]$OutFile = "report.md"
)

if (-not (Test-Path $Violations)) {
    Write-Error "violations file not found: $Violations"
    exit 1
}

$prompt = @"
Read $Violations (schema described in $Schema).
For each violation category (unknown, deprecated, reserved), explain in
plain English what likely went wrong and suggest the probable intended
layer. Then produce a per-block risk summary (high/medium/low) based on
violation counts and categories. Output a markdown report with sections:
Summary, Findings by Category, Suggested Fixes, Risk Ranking.

Output ONLY the markdown report itself to stdout. Do not attempt to write,
create, or save any files -- the caller redirects your stdout to a file.
Do not include any meta-commentary about your process or tool access.
"@

claude -p $prompt | Out-File -Encoding utf8 $OutFile
Write-Output "report written to $OutFile"
