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
# klayout.exe is a GUI-subsystem binary; a bare call doesn't block on Windows,
# so run it via Start-Process -Wait to actually wait for completion. The
# argument list must be passed as one pre-quoted string, not an array --
# Start-Process's array form doesn't reliably quote elements containing
# spaces (e.g. paths under "OneDrive - <org>"), which corrupts the command
# line and gets misread as bare "-" tokens by klayout's own arg parser.
$klayoutCmd = (Get-Command klayout -ErrorAction Stop).Source
$klayoutArgs = "-b -r `"$ScriptDir\dump_layers.rb`" -rd `"gds=$Gds`" -rd `"out=$OutDir\usage.json`""
$klayoutProc = Start-Process -FilePath $klayoutCmd -ArgumentList $klayoutArgs -Wait -PassThru -NoNewWindow
if ($klayoutProc.ExitCode -ne 0) {
    Write-Error "klayout extraction failed with exit code $($klayoutProc.ExitCode)"
    exit $klayoutProc.ExitCode
}

Write-Output "[2/3] comparing usage against baseline $Baseline"
$waiverArgs = @()
if ($Waivers) { $waiverArgs = @("--waivers", $Waivers) }
python "$ScriptDir\check_violations.py" --usage "$OutDir\usage.json" --baseline "$Baseline" @waiverArgs --out "$OutDir\violations.json"

Write-Output "[3/3] generating AI report"
& "$ScriptDir\generate_report.ps1" -Violations "$OutDir\violations.json" -Schema "$ScriptDir\..\docs\violations.schema.md" -OutFile "$OutDir\report.md"

Write-Output "done -> $OutDir\report.md"
