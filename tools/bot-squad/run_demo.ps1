#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Run GitGiggle bot squad workflow demonstrations.

.PARAMETER Pipeline
  Run a chained pipeline: inbox-to-jira | research-to-crm | audio-to-minutes | all

.PARAMETER Task
  Run a single task bot by folder name (e.g. mimemcmarkdown, minutesmeantime)

.PARAMETER DryRun
  Print commands without executing (no API calls)

.EXAMPLE
  .\run_demo.ps1 -DryRun
  .\run_demo.ps1 -Pipeline inbox-to-jira
  .\run_demo.ps1 -Task propellerpete
#>
param(
    [ValidateSet("inbox-to-jira", "research-to-crm", "audio-to-minutes", "all", "")]
    [string]$Pipeline = "",

    [string]$Task = "",

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$DemoInputs = Join-Path $PSScriptRoot "demo-inputs"

function Invoke-Bot {
    param(
        [string]$AppFolder,
        [string]$InputFile,
        [string]$Label
    )
    $cmd = "python scripts/run.py --file `"$InputFile`""
    $cwd = Join-Path $RepoRoot "helpers/$AppFolder"
    Write-Host "`n=== $Label ===" -ForegroundColor Cyan
    Write-Host "cd $cwd"
    Write-Host $cmd
    if (-not $DryRun) {
        Push-Location $cwd
        try {
            Invoke-Expression $cmd
        } finally {
            Pop-Location
        }
    }
}

function Invoke-ParsePilot {
    param(
        [string]$TaskId,
        [string]$InputFile,
        [string]$Label
    )
    $cmd = "python scripts/run_task.py $TaskId --file `"$InputFile`""
    $cwd = Join-Path $RepoRoot "helpers/parsepilot"
    Write-Host "`n=== $Label (ParsePilot $TaskId) ===" -ForegroundColor Cyan
    Write-Host "cd $cwd"
    Write-Host $cmd
    if (-not $DryRun) {
        Push-Location $cwd
        try {
            Invoke-Expression $cmd
        } finally {
            Pop-Location
        }
    }
}

$SINGLE_BOTS = @{
    "mimemcmarkdown"    = @{ input = "1.1-email-thread.txt"; label = "Task 1.1 — Mimey McMarkdown" }
    "tickettornadoterry"= @{ input = "1.2-parsed-email.md"; label = "Task 1.2 — Ticket Tornado Terry" }
    "propellerpete"     = @{ input = "2.1-drone-research-seed.txt"; label = "Task 2.1 — Propeller Pete" }
    "rolodexraccoon"    = @{ input = "2.2-communications-dump.txt"; label = "Task 2.2 — Rolodex Raccoon" }
    "vaultwhisperer"    = @{ input = "3.1-message-plus-vault-context.md"; label = "Task 3.1 — Vault Whisperer Wendy" }
    "podiumpolly"       = @{ input = "3.2-keynote-notes.md"; label = "Task 3.2 — Podium Polly" }
    "memoirmachine"     = @{ input = "3.3-class-transcripts.txt"; label = "Task 3.3 — Memoir Machine Mark" }
    "audiopotluck"      = @{ input = "4.1-recording-inventory.txt"; label = "Task 4.1 — Audio Potluck Patty" }
    "minutesmeantime"   = @{ input = "4.2-standup-transcript.txt"; label = "Task 4.2 — Minutes Mean Time" }
}

if ($Task -ne "") {
    if (-not $SINGLE_BOTS.ContainsKey($Task)) {
        Write-Error "Unknown task folder '$Task'. Valid: $($SINGLE_BOTS.Keys -join ', ')"
    }
    $info = $SINGLE_BOTS[$Task]
    $inputPath = Join-Path $DemoInputs $info.input
    Invoke-Bot -AppFolder $Task -InputFile $inputPath -Label $info.label
    exit 0
}

if ($Pipeline -eq "" -or $Pipeline -eq "all") {
    Write-Host "GitGiggle Bot Squad — Workflow Demo" -ForegroundColor Green
    Write-Host "Repo: $RepoRoot"
    if ($DryRun) { Write-Host "(DRY RUN — no API calls)" -ForegroundColor Yellow }

    foreach ($folder in $SINGLE_BOTS.Keys) {
        $info = $SINGLE_BOTS[$folder]
        $inputPath = Join-Path $DemoInputs $info.input
        Invoke-Bot -AppFolder $folder -InputFile $inputPath -Label $info.label
    }
    exit 0
}

switch ($Pipeline) {
    "inbox-to-jira" {
        $email = Join-Path $DemoInputs "1.1-email-thread.txt"
        $parsed = Join-Path $DemoInputs "1.2-parsed-email.md"
        Invoke-Bot -AppFolder "mimemcmarkdown" -InputFile $email -Label "Step 1: Parse email → Markdown"
        Invoke-Bot -AppFolder "tickettornadoterry" -InputFile $parsed -Label "Step 2: Markdown → JIRA CSV"
    }
    "research-to-crm" {
        $seed = Join-Path $DemoInputs "2.1-drone-research-seed.txt"
        $comms = Join-Path $DemoInputs "2.2-communications-dump.txt"
        Invoke-Bot -AppFolder "propellerpete" -InputFile $seed -Label "Step 1: Taiwan drone brief"
        Invoke-Bot -AppFolder "rolodexraccoon" -InputFile $comms -Label "Step 2: Extract contacts"
    }
    "audio-to-minutes" {
        $inventory = Join-Path $DemoInputs "4.1-recording-inventory.txt"
        $transcript = Join-Path $DemoInputs "4.2-standup-transcript.txt"
        Invoke-Bot -AppFolder "audiopotluck" -InputFile $inventory -Label "Step 1: Audio consolidation plan"
        Write-Host "`n--- (External STT step: run your transcription tool on canonical files) ---" -ForegroundColor DarkGray
        Invoke-Bot -AppFolder "minutesmeantime" -InputFile $transcript -Label "Step 2: Transcript → meeting minutes"
    }
}

Write-Host "`nDone. See logs/ under each app folder." -ForegroundColor Green
