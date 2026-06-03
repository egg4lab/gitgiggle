#!/usr/bin/env python3
"""Run Podium Polly."""
import argparse
import datetime
import pathlib
import sys

import yaml
from anthropic import Anthropic

ROOT = pathlib.Path(__file__).resolve().parent.parent


def load_config() -> dict:
    cfg_path = ROOT / "config" / "agent.yml"
    if cfg_path.exists():
        return yaml.safe_load(cfg_path.read_text(encoding="utf-8"))
    return {}


def read_input(text: str | None, file_path: str | None) -> str:
    if file_path:
        path = pathlib.Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Input file not found: {file_path}")
        return path.read_text(encoding="utf-8")
    if text:
        return text
    raise ValueError("Provide --input or --file")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Podium Polly")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--input", "-i", help="Inline input text")
    group.add_argument("--file", "-f", help="Path to input file")
    args = parser.parse_args()

    cfg = load_config()
    system_prompt = cfg.get("system_prompt", "")
    if not system_prompt:
        print("No system_prompt in config/agent.yml, exiting.")
        sys.exit(1)

    try:
        content = read_input(args.input, args.file)
    except (FileNotFoundError, ValueError) as exc:
        print(exc)
        sys.exit(1)

    client = Anthropic()
    msg = client.messages.create(
        model=cfg.get("model", "claude-opus-4-7"),
        max_tokens=cfg.get("max_tokens", 4000),
        system=system_prompt,
        messages=[{"role": "user", "content": f"## INPUT\n{content}"}],
    )

    output = msg.content[0].text
    timestamp = datetime.datetime.now().isoformat(timespec="seconds")
    log_path = ROOT / "logs" / f"speech-{datetime.date.today().isoformat()}.md"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.write_text(
        f"# Podium Polly — Task 3.2\n\n"
        f"_Generated {timestamp}_\n\n"
        f"{output}\n",
        encoding="utf-8",
    )
    print(f"Wrote {log_path}")
    print(f"Output tokens: {msg.usage.output_tokens}")


if __name__ == "__main__":
    main()
