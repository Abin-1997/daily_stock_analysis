# -*- coding: utf-8 -*-
"""Static contract checks for the manual single-stock Actions entry."""

from __future__ import annotations

from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
DAILY_WORKFLOW = REPO_ROOT / ".github/workflows/00-daily-analysis.yml"
SINGLE_WORKFLOW = REPO_ROOT / ".github/workflows/01-single-stock-analysis.yml"


def _load(path: Path) -> dict:
    return yaml.load(path.read_text(encoding="utf-8"), Loader=yaml.BaseLoader)


def _analyze_step(workflow: dict) -> dict:
    return next(
        step
        for step in workflow["jobs"]["analyze"]["steps"]
        if step.get("name") == "执行股票分析"
    )


def test_single_stock_workflow_calls_daily_analysis_core() -> None:
    workflow = _load(SINGLE_WORKFLOW)
    dispatch_inputs = workflow["on"]["workflow_dispatch"]["inputs"]
    job = workflow["jobs"]["analyze-single-stock"]

    assert dispatch_inputs["stock_code"]["required"] == "true"
    assert dispatch_inputs["stock_code"]["type"] == "string"
    assert job["uses"] == "./.github/workflows/00-daily-analysis.yml"
    assert job["with"] == {
        "mode": "stocks-only",
        "stock_code": "${{ inputs.stock_code }}",
        "force_run": "${{ inputs.force_run }}",
    }
    assert job["secrets"] == "inherit"


def test_daily_workflow_accepts_and_validates_single_stock_input() -> None:
    workflow = _load(DAILY_WORKFLOW)
    call_inputs = workflow["on"]["workflow_call"]["inputs"]
    analyze_step = _analyze_step(workflow)
    run_script = analyze_step["run"]

    assert call_inputs["stock_code"]["type"] == "string"
    assert analyze_step["env"]["SINGLE_STOCK_CODE"] == "${{ inputs.stock_code }}"
    assert '[[ ! "$SINGLE_STOCK_CODE" =~ ^[0-9]{6}$ ]]' in run_script
    assert 'STOCK_ARGS=(--stocks "$SINGLE_STOCK_CODE")' in run_script
    assert 'python main.py "${STOCK_ARGS[@]}" --no-market-review' in run_script


def test_single_stock_input_does_not_persist_or_replace_watchlist_config() -> None:
    analyze_step = _analyze_step(_load(DAILY_WORKFLOW))
    run_script = analyze_step["run"]

    assert "STOCK_LIST_CONFIG" in analyze_step["env"]
    assert 'export STOCK_LIST="$SINGLE_STOCK_CODE"' not in run_script
    assert "gh variable set" not in run_script
