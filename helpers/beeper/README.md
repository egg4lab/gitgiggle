# Beeper — AI News Digest Bot

Automated daily AI/LLM news digest. Runs on GitHub Actions, fetches 7 articles
from NewsAPI, summarises them with Claude Haiku, and delivers an HTML email via
Brevo SMTP every morning at 07:00 Taipei time.

## Setup

### 1. Add secrets
GitHub → Settings → Secrets and variables → Actions → New repository secret:
- `NEWS_KEY` — from newsapi.org
- `ANTHROPIC_KEY` — from console.anthropic.com
- `BREVO_KEY` — from app.brevo.com

### 2. Push and trigger
Push this repo to GitHub, then:
Actions tab → **AI Digest** → Run workflow

Digest arrives in your inbox in ~2 minutes.

### 3. Schedule
Already set: `cron: '17 22 * * *'` → 06:17 UTC+8 (07:17 Taipei) daily.
Adjust the cron line in `.github/workflows/ai-digest.yml` if needed.

## Daily workflow

1. Beeper wakes at 07:00 Taipei.
2. Fetches 7 AI/LLM headlines from NewsAPI.
3. Calls Claude Haiku to summarise into HTML.
4. Sends digest via Brevo to recipients in `send_email.py`.
5. You wake up to a polished digest in your inbox.

## Cost estimate

~7 articles, ~1,800 output tokens per run:
- Daily: ~$0.01
- Monthly total: ~$0.30

## Files

```
.github/workflows/
  ai-digest.yml          # cron: 06:17 Taipei daily
scripts/
  summarize.py           # fetch news + call Claude Haiku
  send_email.py          # send HTML digest via Brevo
  requirements.txt       # stdlib only, no pip needed
config/
  agent.yml              # model, token limit, news query
logs/                    # digest archive (optional)
index.html               # Beeper robot showcase page
beeper-guide.html        # how-to video (canvas + MP4 export)
```

## Extending

- Add more recipients in `scripts/send_email.py`.
- Change the news topic in `config/agent.yml` under `news_query`.
- Swap Claude Haiku for Sonnet in `config/agent.yml` for richer summaries.
