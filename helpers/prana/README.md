# Yoga Planner Agent

Automated daily Ashtanga lesson planner. Runs on GitHub Actions, no local
machine required. Reads student profiles + sequence references, calls Claude
API, commits a daily plan back to `logs/`.

## Setup

### 1. Create the repo
```bash
git init yoga-planner
cd yoga-planner
# drop these files in
git add .
git commit -m "init"
gh repo create yoga-planner --private --source=. --push
```

### 2. Add the API key as a secret
On GitHub → Settings → Secrets and variables → Actions → New repository secret:
- Name: `ANTHROPIC_API_KEY`
- Value: your key from console.anthropic.com

### 3. Customize student files
Replace `students/alice-chen.md`, `bob-lin.md`, `carol-wu.md` with your
actual roster. Add one `.md` per student. The frontmatter fields the agent
reads:
- `name`
- `level`
- `last_practice` (YYYY-MM-DD — used for "days since" calculation)
- `last_asana_given`
- Active modifications (free-form section)

### 4. Test it
```bash
# locally
export ANTHROPIC_API_KEY=sk-ant-...
pip install -r scripts/requirements.txt
python scripts/daily_plan.py
cat logs/$(date +%F).md
```

Or trigger from GitHub: Actions tab → Daily Lesson Plan → Run workflow.

### 5. Schedule
Already set:
- `daily-plan.yml` — 06:00 Taipei daily
- `weekly-review.yml` — 20:00 Taipei every Sunday

Adjust the cron lines if you want different times.

## Daily workflow

1. Wake up.
2. Open GitHub on phone → `logs/YYYY-MM-DD.md`.
3. Skim plan, adjust in your head, teach.
4. After class, edit student `last_practice` dates + observations.
5. Push. Tomorrow's agent will see the updates.

## Updating student profiles

Use GitHub's web editor on phone or PC. No local Obsidian needed. If you
want richer editing later, point Obsidian (on a non-blocked device) at a
local clone of the repo and use the Git plugin.

## Cost estimate

One daily run + one weekly run, ~3K input tokens, ~1.5K output:
- Daily: ~$0.05
- Weekly: ~$0.10
- Monthly total: ~$2

## Files

```
.github/workflows/
  daily-plan.yml       # cron: 06:00 Taipei
  weekly-review.yml    # cron: Sunday 20:00 Taipei
scripts/
  daily_plan.py        # main agent
  weekly_review.py     # weekly synthesis
  requirements.txt
config/
  agent.yml            # model + prompt overrides
students/
  *.md                 # one per student
sequences/
  primary.md
  intermediate.md
  modified.md
logs/                  # agent writes here
```

## Extending

- Add LINE webhook in `daily_plan.py` after writing the log to push to your
  phone.
- Add a `events/` folder with workshops / moon days; have the agent factor
  them into the plan.
- Mirror the pattern for dividend digest or CAD env audit (but keep
  Winbond IP off this infrastructure).
