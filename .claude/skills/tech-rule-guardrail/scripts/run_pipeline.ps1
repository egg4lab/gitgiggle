# Full Technology Rule Guardrail pipeline: extract -> compare -> AI report.
# Requires: klayout on PATH, python + pyyaml, claude (Claude Code CLI).
param(
    [Parameter(Mandatory=$true)][string]$Gds,
    [Parameter(Mandatory=$true)][string]$Baseline,
    [string]$Waivers,
    [string]$OutDir = ".\guardrail_out"
)

$ScriptDir = $PSScriptRoot
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Write-Output "[1/3] extracting layer usage from $Gds"
klayout -b -r "$ScriptDir\dump_layers.rb" -rd gds="$Gds" -rd out="$OutDir\usage.json"

Write-Output "[2/3] comparing usage against baseline $Baseline"
$waiverArgs = @()
if ($Waivers) { $waiverArgs = @("--waivers", $Waivers) }
python "$ScriptDir\check_violations.py" --usage "$OutDir\usage.json" --baseline "$Baseline" @waiverArgs --out "$OutDir\violations.json"

Write-Output "[3/3] generating AI report"
& "$ScriptDir\generate_report.ps1" -Violations "$OutDir\violations.json" -Schema "$ScriptDir\..\docs\violations.schema.md" -OutFile "$OutDir\report.md"

Write-Output "done -> $OutDir\report.md"
