#!/usr/bin/env python3
"""Run one minimal-agent turn through the bundled Python SDK runtime."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from aeoth_agent import AeothAgent


def main() -> None:
    """Parse one task and print the agent's final response."""
    parser = argparse.ArgumentParser()
    configured_home = os.environ.get("AEOTH_HOME") or os.environ.get("DSH_HOME", "")
    parser.add_argument("prompt", help="Task for the minimal agent")
    parser.add_argument("--workspace", type=Path, default=Path.cwd())
    parser.add_argument("--aeoth-home", type=Path)
    parser.add_argument("--dsh-home", dest="legacy_dsh_home", type=Path, help=argparse.SUPPRESS)
    parser.add_argument("--profile", default="sdk-minimal")
    parser.add_argument("--session-id")
    parser.add_argument("--provider", default="deepseek-official")
    parser.add_argument("--model", default=os.environ.get("DSH_MODEL", "deepseek-v4-flash"))
    parser.add_argument("--max-tokens", type=int)
    args = parser.parse_args()
    if args.aeoth_home is not None and args.legacy_dsh_home is not None:
        parser.error("--aeoth-home and --dsh-home cannot be used together")
    configured_home = args.aeoth_home or args.legacy_dsh_home or (Path(configured_home) if configured_home.strip() else None)
    if configured_home is None:
        parser.error("--aeoth-home or a non-empty AEOTH_HOME is required")

    workspace = args.workspace.resolve()
    aeoth_home = configured_home.resolve()
    with AeothAgent(
        provider=args.provider,
        model=args.model,
        max_tokens=args.max_tokens,
        cwd=str(workspace),
        aeoth_home=str(aeoth_home),
        profile=args.profile,
    ) as harness:
        result = harness.run(args.prompt, session_id=args.session_id)
    print(result.final_response)


if __name__ == "__main__":
    main()
