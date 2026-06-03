# GitGiggle Bot Squad — Workflow Demonstrations

Nine funny-named task bots, bootstrapped from the **Beeper** and **Prana** patterns in `apps/`. Each bot is a self-contained Python agent: `config/agent.yml` + `scripts/run.py` + `logs/`.

## Elder Statesmen (the templates)

| Bot | Path | What it does | Trigger |
|-----|------|--------------|---------|
| **Beeper** | `apps/beeper/` | AI news digest → HTML email via Brevo | GitHub Actions cron + manual |
| **Prana** | `apps/prana/` | Ashtanga daily lesson plan from student `.md` files | GitHub Actions cron + manual |

**ParsePilot** (`apps/parsepilot/`) is the unified multi-task runner — all 9 tasks in one mega-prompt via `run_task.py {task_id}`.

---

## Full Roster

| Task | Folder | Display Name | Tagline |
|------|--------|--------------|---------|
| 1.1 | `mimemcmarkdown` | **Mimey McMarkdown** | Your email's MIME type is my love language. |
| 1.2 | `tickettornadoterry` | **Ticket Tornado Terry** | Spins your inbox into a JIRA CSV cyclone. |
| 2.1 | `propellerpete` | **Propeller Pete of Taipei** | Taiwan corporate drone intel with extra propeller flair. |
| 2.2 | `rolodexraccoon` | **Rolodex Raccoon** | Digs through trash — I mean threads — for CRM gold. |
| 3.1 | `vaultwhisperer` | **Vault Whisperer Wendy** | Your Obsidian vault's gossip columnist — but professional. |
| 3.2 | `podiumpolly` | **Podium Polly** | From bullet points to standing ovation — rhetorically speaking. |
| 3.3 | `memoirmachine` | **Memoir Machine Mark** | Class transcripts in, Pulitzer vibes out (no guarantees). |
| 4.1 | `audiopotluck` | **Audio Potluck Patty** | Everyone brings a recording format; I bring the merge plan. |
| 4.2 | `minutesmeantime` | **Minutes Mean Time** | Mean time between meetings, zero mean time to action items. |

---

## Setup (once)

```powershell
# From GitGiggle repo root
$env:ANTHROPIC_API_KEY = "sk-ant-..."

# Install deps for any bot (same requirements everywhere)
pip install -r apps/mimemcmarkdown/scripts/requirements.txt
```

---

## Task 1.1 — Mimey McMarkdown (Email PDF → Markdown)

```mermaid
flowchart LR
    A[Email / PDF / .eml] --> B[Mimey McMarkdown]
    B --> C["logs/parsed-YYYY-MM-DD.md"]
    C --> D[Structured Markdown + action items]
```

**Demo run:**

```powershell
cd apps/mimemcmarkdown
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/1.1-email-thread.txt
# → logs/parsed-2026-05-25.md
```

**Expected output sections:** YAML frontmatter, thread chronology, hyperlinks, `## Action Items`.

---

## Task 1.2 — Ticket Tornado Terry (JIRA CSV)

```mermaid
flowchart LR
    A[Parsed Markdown from 1.1] --> B[Ticket Tornado Terry]
    B --> C["logs/jira-csv-YYYY-MM-DD.md"]
    C --> D[RFC 4180 CSV + mapping notes]
    D --> E[JIRA bulk import]
```

**Pipeline demo (1.1 → 1.2):**

```powershell
# Step 1: parse
cd apps/mimemcmarkdown
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/1.1-email-thread.txt

# Step 2: spin into JIRA CSV
cd ../tickettornadoterry
python scripts/run.py --file ../mimemcmarkdown/logs/parsed-2026-05-25.md
# Or use pre-parsed sample:
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/1.2-parsed-email.md
```

**Expected CSV columns:** `Summary`, `Description`, `Issue Type`, `Priority`, `Assignee`.

---

## Task 2.1 — Propeller Pete of Taipei (Drone Research)

```mermaid
flowchart LR
    A[Seed query / focus area] --> B[Propeller Pete]
    B --> C["logs/drone-brief-YYYY-MM-DD.md"]
    C --> D[Competitive analysis brief]
```

**Demo run:**

```powershell
cd apps/propellerpete
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/2.1-drone-research-seed.txt
```

**Expected sections:** Executive Summary, Key Players table, Regulatory Snapshot, Trends, Sources.

---

## Task 2.2 — Rolodex Raccoon (Contact Extraction)

```mermaid
flowchart LR
    A[Emails / PDFs / research text] --> B[Rolodex Raccoon]
    B --> C["logs/contacts-YYYY-MM-DD.md"]
    C --> D[JSON or CSV contact records]
    D --> E[CRM import]
```

**Demo run:**

```powershell
cd apps/rolodexraccoon
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/2.2-communications-dump.txt
```

**Expected fields:** `full_name`, `title`, `company`, `email`, `phone`, `confidence`, `## Review Queue`.

---

## Task 3.1 — Vault Whisperer Wendy (RAG Message Drafting)

```mermaid
flowchart LR
    A[Incoming message] --> C[Vault Whisperer Wendy]
    B[Obsidian / vault excerpts] --> C
    C --> D["logs/draft-reply-YYYY-MM-DD.md"]
    D --> E[Concise + Detailed reply variants]
```

**Demo run:**

```powershell
cd apps/vaultwhisperer
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/3.1-message-plus-vault-context.md
```

**Expected output:** Two reply variants + `## Context Used` citations.

---

## Task 3.2 — Podium Polly (Speech & Presentation)

```mermaid
flowchart LR
    A[Thematic notes + audience + duration] --> B[Podium Polly]
    B --> C["logs/speech-YYYY-MM-DD.md"]
    C --> D[Script with PAUSE/SLIDE cues OR slide outline]
```

**Demo run:**

```powershell
cd apps/podiumpolly
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/3.2-keynote-notes.md
```

---

## Task 3.3 — Memoir Machine Mark (Autobiography)

```mermaid
flowchart LR
    A[Dated transcripts] --> B[Memoir Machine Mark]
    B --> C["logs/autobiography-YYYY-MM-DD.md"]
    C --> D[Chronological narrative + Source Index]
```

**Demo run:**

```powershell
cd apps/memoirmachine
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/3.3-class-transcripts.txt
```

---

## Task 4.1 — Audio Potluck Patty (Audio Consolidation)

```mermaid
flowchart LR
    A[WAV / m4a / Zoom exports] --> B[Audio Potluck Patty]
    B --> C["logs/audio-plan-YYYY-MM-DD.md"]
    C --> D[Merge order + STT prep plan]
    D --> E[External STT tool]
```

**Demo run:**

```powershell
cd apps/audiopotluck
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/4.1-recording-inventory.txt
```

**Note:** Patty plans consolidation; she does not transcribe unless you provide a transcript.

---

## Task 4.2 — Minutes Mean Time (Meeting Minutes)

```mermaid
flowchart LR
    A[Meeting transcript] --> C[Minutes Mean Time]
    B[Optional project context] --> C
    C --> D["logs/minutes-YYYY-MM-DD.md"]
    D --> E[Executive summary + action table]
```

**Full audio pipeline (4.1 → STT → 4.2):**

```mermaid
flowchart LR
    A1[Desktop WAV] --> P[Audio Potluck Patty]
    A2[Phone m4a] --> P
    A3[Zoom export] --> P
    P --> B[STT tool]
    B --> C[Minutes Mean Time]
    C --> D[Executive minutes + action items]
```

**Demo run:**

```powershell
cd apps/minutesmeantime
python scripts/run.py --file ../../tools/bot-squad/demo-inputs/4.2-standup-transcript.txt
```

---

## ParsePilot — Unified Runner

Run any task by ID without switching directories:

```powershell
cd apps/parsepilot
python scripts/run_task.py 1.1 --file ../../tools/bot-squad/demo-inputs/1.1-email-thread.txt
python scripts/run_task.py 1.2 --file ../../tools/bot-squad/demo-inputs/1.2-parsed-email.md
python scripts/run_task.py 4.2 --file ../../tools/bot-squad/demo-inputs/4.2-standup-transcript.txt
```

---

## End-to-End Pipeline Demos

### Document → JIRA (Tasks 1.1 + 1.2)

```powershell
.\tools\bot-squad\run_demo.ps1 -Pipeline inbox-to-jira
```

### Research → Contacts (Tasks 2.1 + 2.2)

```powershell
.\tools\bot-squad\run_demo.ps1 -Pipeline research-to-crm
```

### Audio → Minutes (Tasks 4.1 + 4.2)

```powershell
.\tools\bot-squad\run_demo.ps1 -Pipeline audio-to-minutes
```

### Run all demos (dry-run, no API calls)

```powershell
.\tools\bot-squad\run_demo.ps1 -DryRun
```

---

## Architecture (how bots relate to Beeper/Prana)

```mermaid
flowchart TB
    subgraph templates["Template bots"]
        B[Beeper<br/>NewsAPI + Haiku + Email]
        P[Prana<br/>Student MD + Opus + Git commit]
    end

    subgraph squad["Task bot squad (9 bots)"]
        M[Mimey McMarkdown]
        T[Ticket Tornado Terry]
        PP[Propeller Pete]
        R[Rolodex Raccoon]
        V[Vault Whisperer Wendy]
        Po[Podium Polly]
        MM[Memoir Machine Mark]
        AP[Audio Potluck Patty]
        Mi[Minutes Mean Time]
    end

    subgraph shared["Shared pattern"]
        Y[config/agent.yml]
        S[scripts/run.py]
        L[logs/*.md]
    end

    B --> shared
    P --> shared
    shared --> squad
    M --> T
    AP --> Mi
```

**Convention:** Each bot reads `config/agent.yml` (model, max_tokens, system_prompt), accepts `--input` or `--file`, calls Anthropic API, writes dated output to `logs/`.

---

## Re-bootstrap bots

To regenerate all 9 bots from the bootstrap script:

```powershell
python tools/bootstrap_task_bots.py
```

---

## Cost ballpark

| Bot | Model | Per run |
|-----|-------|---------|
| Beeper | Haiku | ~$0.01 |
| Prana | Opus | ~$0.05 |
| Task squad | Opus | ~$0.10–0.25 each |
