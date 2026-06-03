# ParsePilot — Document, Research & Audio Agent

Multi-domain operations bot. Parses emails/PDFs, generates JIRA CSVs, researches
Taiwan's corporate drone sector, extracts contacts, drafts RAG-aligned messages,
writes speeches and autobiographies, and produces meeting minutes from transcripts.
Runs locally or via GitHub Actions — no dedicated server required.

**Name pun:** parses documents *and* researches Taiwan UAV **pilots**.

## Setup

### 1. Add the API key
Locally:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

On GitHub → Settings → Secrets and variables → Actions → New repository secret:
- Name: `ANTHROPIC_API_KEY`
- Value: your key from console.anthropic.com

### 2. Install dependencies
```bash
cd apps/parsepilot
pip install -r scripts/requirements.txt
```

### 3. Run a task
```bash
# Inline input
python scripts/run_task.py 1.1 --input "From: alice@corp.com ..."

# From file
python scripts/run_task.py 4.2 --file meeting-transcript.txt

# Pipeline: parse email, then generate JIRA CSV
python scripts/run_task.py 1.1 --file email-thread.pdf > /tmp/parsed.md
python scripts/run_task.py 1.2 --file /tmp/parsed.md
```

Output lands in `logs/{task-id}-YYYY-MM-DD.md`.

### 4. Customize
Edit `config/agent.yml` to override model, token limit, or the full system prompt.

## Task routing

| Task ID | Domain | Input | Output |
|---------|--------|-------|--------|
| **1.1** | Email PDF-to-Markdown | `.eml`, PDF, or pasted thread | Structured Markdown + action items |
| **1.2** | JIRA CSV generation | Parsed Markdown from 1.1 | RFC 4180 CSV + mapping notes |
| **2.1** | Taiwan drone research | Optional seed companies, focus area | Competitive analysis brief |
| **2.2** | Contact extraction | Emails, PDFs, research text | JSON or CSV contact records |
| **3.1** | Message drafting | Incoming message + Obsidian/context excerpts | Concise + detailed reply drafts |
| **3.2** | Speech & presentation | Thematic notes, audience, duration | Script or slide-by-slide outline |
| **3.3** | Autobiography | Class/conversation transcripts | Chronological narrative draft |
| **4.1** | Audio consolidation | File manifest (paths, formats, dates) | STT prep plan + merge order |
| **4.2** | Meeting minutes | Transcript + optional project context | Executive minutes + action table |

For pipelines, pass prior task output as input to the next stage (e.g. `1.1 → 1.2`).

## Daily workflow

1. Drop input (email PDF, transcript, notes) into a file or paste inline.
2. Run `python scripts/run_task.py {task_id} --file input.txt`.
3. Open `logs/{task-id}-YYYY-MM-DD.md` for the deliverable.
4. For JIRA bulk import, use the CSV block from task 1.2 output.

## Cost estimate

One task run, ~4K input tokens, ~2K output (Opus):
- Per run: ~$0.15–0.30 (varies by input size)
- Heavy daily use (5 tasks): ~$1–2/day

## Files

```
scripts/
  run_task.py          # main agent runner (task ID + input)
  requirements.txt     # anthropic, PyYAML
config/
  agent.yml            # model, max_tokens, full system prompt (tasks 1.1–4.2)
logs/                  # agent writes here
README.md
.gitignore
```

## Extending

- Add a GitHub Actions workflow at `.github/workflows/` for scheduled or
  webhook-triggered runs (mirror `yoga-daily-plan.yml`).
- Add an `inputs/` folder for sample emails, transcripts, and vault excerpts.
- Wire task 3.1 to auto-read from an Obsidian vault path before calling the API.
- Add `index.html` showcase page following the Beeper/Prana pattern.
