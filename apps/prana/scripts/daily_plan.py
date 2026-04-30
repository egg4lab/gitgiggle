#!/usr/bin/env python3
"""Generate daily Ashtanga lesson plan from student + sequence files."""
import os
import glob
import datetime
import pathlib
import yaml
from anthropic import Anthropic

ROOT = pathlib.Path(__file__).resolve().parent.parent
TODAY = datetime.date.today()


def load_files(pattern: str) -> str:
    """Concatenate all matching files with filename headers."""
    chunks = []
    for path in sorted(ROOT.glob(pattern)):
        chunks.append(f"### FILE: {path.name}\n{path.read_text(encoding='utf-8')}")
    return "\n\n".join(chunks)


def load_config() -> dict:
    cfg_path = ROOT / "config" / "agent.yml"
    if cfg_path.exists():
        return yaml.safe_load(cfg_path.read_text())
    return {}


def main() -> None:
    cfg = load_config()
    students = load_files("students/*.md")
    sequences = load_files("sequences/*.md")

    if not students:
        print("No student files found, exiting.")
        return

    client = Anthropic()
    system_prompt = cfg.get("system_prompt", DEFAULT_SYSTEM)

    user_prompt = f"""Today is {TODAY.isoformat()} ({TODAY.strftime('%A')}).

## STUDENT PROFILES
{students}

## AVAILABLE SEQUENCES
{sequences}

## TASK
Produce today's lesson plan as markdown with these sections:

1. **Roster** — table: Student | Assigned Sequence | Modifications | Last Practice | Days Since
2. **Watch list** — anyone overdue (>5 days), injured, or needing teacher attention
3. **Coach notes** — 2–3 bullets on what to emphasize today across the group
4. **Reminders** — anything I should communicate before/after class

Be concise. Engineer-to-engineer tone is fine — I'm the coach, not a beginner.
"""

    msg = client.messages.create(
        model=cfg.get("model", "claude-opus-4-7"),
        max_tokens=cfg.get("max_tokens", 2500),
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    output = msg.content[0].text
    log_path = ROOT / "logs" / f"{TODAY.isoformat()}.md"
    log_path.write_text(
        f"# Daily Plan — {TODAY.isoformat()}\n\n"
        f"_Generated {datetime.datetime.now().isoformat(timespec='seconds')}_\n\n"
        f"{output}\n",
        encoding="utf-8",
    )
    print(f"Wrote {log_path}")


DEFAULT_SYSTEM = """You are an assistant to a Mysore-style Ashtanga yoga teacher
managing ~10–20 students across multiple locations. You understand the
traditional Mysore method: students progress through Primary, Intermediate,
and Advanced series at their own pace under teacher guidance. New asanas are
"given" only when the student is ready. Respect injuries and modifications."""


if __name__ == "__main__":
    main()
