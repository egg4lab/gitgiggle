#!/usr/bin/env python3
"""Weekly review: synthesize last 7 daily logs into trends + actions."""
import datetime
import pathlib
import yaml
from anthropic import Anthropic

ROOT = pathlib.Path(__file__).resolve().parent.parent
TODAY = datetime.date.today()


def collect_week() -> str:
    chunks = []
    for i in range(7):
        d = TODAY - datetime.timedelta(days=i)
        f = ROOT / "logs" / f"{d.isoformat()}.md"
        if f.exists():
            chunks.append(f"## {d.isoformat()}\n{f.read_text(encoding='utf-8')}")
    return "\n\n".join(chunks) if chunks else ""


def main() -> None:
    week = collect_week()
    if not week:
        print("No logs in the last 7 days, skipping.")
        return

    students = "\n\n".join(
        f"### {p.name}\n{p.read_text(encoding='utf-8')}"
        for p in sorted((ROOT / "students").glob("*.md"))
    )

    client = Anthropic()
    cfg_path = ROOT / "config" / "agent.yml"
    cfg = yaml.safe_load(cfg_path.read_text()) if cfg_path.exists() else {}

    msg = client.messages.create(
        model=cfg.get("model", "claude-opus-4-7"),
        max_tokens=3000,
        messages=[{"role": "user", "content": f"""Week ending {TODAY.isoformat()}.

## STUDENT ROSTER (current state)
{students}

## DAILY LOGS THIS WEEK
{week}

## TASK
Produce a weekly review:
1. **Attendance summary** — who showed up how often
2. **Progress flags** — students ready for new asanas, or stuck
3. **Injuries / modifications carried over**
4. **Action items for next week** — concrete, one line each
5. **Suggested updates to student profiles** — diff-style suggestions
   (don't rewrite the file; just note what to change)

Be brutally concise."""}],
    )

    log_path = ROOT / "logs" / f"weekly-{TODAY.isoformat()}.md"
    log_path.write_text(
        f"# Weekly Review — {TODAY.isoformat()}\n\n{msg.content[0].text}\n",
        encoding="utf-8",
    )
    print(f"Wrote {log_path}")


if __name__ == "__main__":
    main()
