# Ticket Tornado Terry — Task 1.2

Spins your inbox into a JIRA CSV cyclone.

Single-purpose agent bot. Runs locally or via GitHub Actions — no dedicated server
required. Part of the GitGiggle bot family alongside Beeper and Prana.

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
cd apps/tickettornadoterry
pip install -r scripts/requirements.txt
```

### 3. Run
```bash
python scripts/run.py --file parsed-email.md
```

Output lands in `logs/jira-csv-YYYY-MM-DD.md`.

### 4. Customize
Edit `config/agent.yml` to override model, token limit, or system prompt.

## Task

| Field | Value |
|-------|-------|
| **Task ID** | 1.2 |
| **Input** | Parsed Markdown from Mimey McMarkdown (task 1.1) |
| **Output** | RFC 4180 CSV + issue mapping notes |

## Cost estimate

One run, ~3–4K input tokens, ~1.5–2K output (Opus):
- Per run: ~$0.10–0.25 (varies by input size)

## Files

```
scripts/
  run.py               # main agent runner
  requirements.txt     # anthropic, PyYAML
config/
  agent.yml            # model, max_tokens, system prompt
logs/                  # agent writes here
README.md
.gitignore
```

## Extending

- Add a GitHub Actions workflow at `.github/workflows/` for scheduled runs
  (mirror `yoga-daily-plan.yml`).
- Add an `inputs/` folder for sample files.
- Chain with sibling bots (e.g. Mimey McMarkdown → Ticket Tornado Terry for 1.1 → 1.2).
