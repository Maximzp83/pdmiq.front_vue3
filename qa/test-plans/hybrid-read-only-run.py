#!/usr/bin/env python3
"""Hybrid read-only QA orchestrator.

Exactly one worker owns the existing local Chrome session. Two source-only
workers run concurrently and an aggregator writes the final report only after
validating their completion markers.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PLAN_ROOT = PROJECT_ROOT / 'qa/test-plans'
RUNS_ROOT = PROJECT_ROOT / 'qa/reports/runs'
STATIC_ANALYZER = PLAN_ROOT / 'hybrid-static-analyzer.py'
REPORTER = PLAN_ROOT / 'hybrid-report.py'
DEFAULT_BROWSER_PROGRAM = PLAN_ROOT / 'full-project-read-only-interactions.py'
GUARD_PATH = PLAN_ROOT / 'browser-read-only-guard.js'
active_processes = set()
active_lock = threading.Lock()


@dataclass(frozen=True)
class Task:
    name: str
    command: tuple
    log_path: Path
    stdin_path: Optional[Path] = None


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def default_run_id():
    return datetime.now(timezone.utc).strftime('hybrid-%Y%m%dT%H%M%S-%fZ')


def safe_run_id(value):
    if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}', value):
        raise argparse.ArgumentTypeError('run-id must match [a-zA-Z0-9][a-zA-Z0-9._-]{0,79}')
    return value


def ensure_project_path(path):
    resolved = path.resolve()
    if not resolved.is_relative_to(PROJECT_ROOT):
        raise ValueError(f'Path must stay inside project: {resolved}')
    return resolved


def atomic_json_write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(path)


def run_task(task, environment):
    task.log_path.parent.mkdir(parents=True, exist_ok=True)
    stdin_handle = task.stdin_path.open('r', encoding='utf-8') if task.stdin_path else subprocess.DEVNULL
    try:
        with task.log_path.open('w', encoding='utf-8') as log_handle:
            process = subprocess.Popen(
                list(task.command),
                cwd=PROJECT_ROOT,
                env=environment,
                stdin=stdin_handle,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
            with active_lock:
                active_processes.add(process)
            try:
                for line in process.stdout or ():
                    log_handle.write(line)
                    log_handle.flush()
                    print(f'[{task.name}] {line}', end='', flush=True)
                return_code = process.wait()
            finally:
                with active_lock:
                    active_processes.discard(process)
    finally:
        if task.stdin_path:
            stdin_handle.close()
    return {'name': task.name, 'exitCode': return_code, 'log': str(task.log_path.relative_to(PROJECT_ROOT))}


def stop_active_processes():
    with active_lock:
        processes = list(active_processes)
    for process in processes:
        if process.poll() is None:
            process.terminate()
    for process in processes:
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()


def main():
    parser = argparse.ArgumentParser(description='Run one browser worker and two static QA workers concurrently.')
    parser.add_argument('--run-id', type=safe_run_id, default=default_run_id())
    parser.add_argument('--static-only', action='store_true', help='Validate static workers and report pipeline without Chrome.')
    parser.add_argument('--browser-program', type=Path, default=DEFAULT_BROWSER_PROGRAM)
    parser.add_argument('--publish-report', type=Path, help='Atomically update this canonical report only after a complete browser run.')
    args = parser.parse_args()

    run_dir = ensure_project_path(RUNS_ROOT / args.run_id)
    if run_dir.exists() and any(run_dir.iterdir()):
        raise SystemExit(f'Run directory is not empty: {run_dir}')
    run_dir.mkdir(parents=True, exist_ok=True)

    browser_program = ensure_project_path(args.browser_program)
    if browser_program != DEFAULT_BROWSER_PROGRAM.resolve():
        raise SystemExit('Hybrid runner accepts only the canonical protected browser program.')

    browser_use = shutil.which('browser-use')
    if not args.static_only and not browser_use:
        raise SystemExit('browser-use is not installed or not available in PATH.')

    guard_source = GUARD_PATH.read_bytes()
    manifest = {
        'schemaVersion': 1,
        'runId': args.run_id,
        'startedAt': utc_now(),
        'mode': 'static-only' if args.static_only else 'hybrid',
        'baseUrl': 'http://localhost:5173',
        'browserWorkers': 0 if args.static_only else 1,
        'staticWorkers': 2,
        'guard': {
            'path': str(GUARD_PATH.relative_to(PROJECT_ROOT)),
            'version': '2.0.0',
            'sha256': hashlib.sha256(guard_source).hexdigest(),
        },
        'tasks': {},
        'completed': False,
    }
    atomic_json_write(run_dir / 'manifest.json', manifest)

    # The installed skill is always checked before any browser worker starts.
    skill_log = run_dir / 'browser-use-skill.log'
    if browser_use:
        skill_result = subprocess.run(
            [browser_use, 'skill', 'show'],
            cwd=PROJECT_ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            check=False,
        )
        skill_log.write_text(skill_result.stdout, encoding='utf-8')
        manifest['browserUseSkill'] = {
            'exitCode': skill_result.returncode,
            'sha256': hashlib.sha256(skill_result.stdout.encode('utf-8')).hexdigest(),
            'log': str(skill_log.relative_to(PROJECT_ROOT)),
        }
        atomic_json_write(run_dir / 'manifest.json', manifest)
        if skill_result.returncode != 0 and not args.static_only:
            raise SystemExit('browser-use skill show failed; browser worker was not started.')

    tasks = [
        Task(
            'static-routes-forms',
            (sys.executable, str(STATIC_ANALYZER), '--mode', 'routes-forms', '--output', str(run_dir / 'static-routes/result.json')),
            run_dir / 'static-routes/worker.log',
        ),
        Task(
            'static-api-risks',
            (sys.executable, str(STATIC_ANALYZER), '--mode', 'api-risks', '--output', str(run_dir / 'static-risks/result.json')),
            run_dir / 'static-risks/worker.log',
        ),
    ]

    environment = os.environ.copy()
    environment.update({
        'PYTHONUNBUFFERED': '1',
        'QA_PROJECT_ROOT': str(PROJECT_ROOT),
        'QA_RUN_ID': args.run_id,
        'QA_BROWSER_WORKER_DIR': str(run_dir / 'browser'),
        'QA_SCREENSHOT_DIR': str(run_dir / 'browser/screenshots'),
        'QA_EVENTS_PATH': str(run_dir / 'browser/events.jsonl'),
        'QA_RECORDING_NAME': f'full-project-read-only-{args.run_id}',
    })

    if not args.static_only:
        tasks.append(Task(
            'browser-worker',
            (browser_use,),
            run_dir / 'browser/worker.log',
            browser_program,
        ))
    else:
        manifest['tasks']['browser-worker'] = {'state': 'skipped', 'reason': '--static-only'}

    for task in tasks:
        manifest['tasks'][task.name] = {'state': 'running', 'startedAt': utc_now()}
    atomic_json_write(run_dir / 'manifest.json', manifest)

    results = []
    try:
        with ThreadPoolExecutor(max_workers=len(tasks), thread_name_prefix='qa-hybrid') as executor:
            futures = {executor.submit(run_task, task, environment): task for task in tasks}
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                manifest['tasks'][result['name']] = {
                    'state': 'completed' if result['exitCode'] == 0 else 'failed',
                    'exitCode': result['exitCode'],
                    'log': result['log'],
                    'finishedAt': utc_now(),
                }
                atomic_json_write(run_dir / 'manifest.json', manifest)
    except KeyboardInterrupt:
        stop_active_processes()
        manifest['interruptedAt'] = utc_now()
        atomic_json_write(run_dir / 'manifest.json', manifest)
        raise SystemExit(130)

    reporter_command = [
        sys.executable,
        str(REPORTER),
        '--run-dir',
        str(run_dir),
        '--output',
        str(run_dir / 'report.md'),
    ]
    if args.static_only:
        reporter_command.append('--browser-skipped')
    if args.publish_report:
        reporter_command.extend(['--publish', str(ensure_project_path(args.publish_report))])

    reporter_result = subprocess.run(
        reporter_command,
        cwd=PROJECT_ROOT,
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
    )
    (run_dir / 'aggregator.log').write_text(reporter_result.stdout, encoding='utf-8')
    print(f'[aggregator] {reporter_result.stdout}', end='', flush=True)

    tasks_ok = all(result['exitCode'] == 0 for result in results)
    manifest['tasks']['aggregator'] = {
        'state': 'completed' if reporter_result.returncode == 0 else 'failed',
        'exitCode': reporter_result.returncode,
        'log': str((run_dir / 'aggregator.log').relative_to(PROJECT_ROOT)),
        'finishedAt': utc_now(),
    }
    manifest['finishedAt'] = utc_now()
    manifest['completed'] = tasks_ok and reporter_result.returncode == 0
    manifest['report'] = str((run_dir / 'report.md').relative_to(PROJECT_ROOT))
    atomic_json_write(run_dir / 'manifest.json', manifest)

    print(json.dumps({
        'runId': args.run_id,
        'completed': manifest['completed'],
        'report': manifest['report'],
        'manifest': str((run_dir / 'manifest.json').relative_to(PROJECT_ROOT)),
    }, ensure_ascii=False))
    raise SystemExit(0 if manifest['completed'] else 1)


if __name__ == '__main__':
    main()
