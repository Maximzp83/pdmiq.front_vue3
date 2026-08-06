#!/usr/bin/env python3
"""Aggregate one browser worker and two static workers into a QA report."""

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
STATUS_KINDS = {
    'route-check',
    'control-click',
    'form-field',
    'form-toggle',
    'form-select',
    'dashboard-toggle',
    'dashboard-plant-selection',
    'regression-import',
    'regression-pdm-chart',
}


def load_json(path):
    value = json.loads(path.read_text(encoding='utf-8'))
    if value.get('schemaVersion') != 1 or value.get('completed') is not True:
        raise ValueError(f'Invalid or incomplete worker result: {path}')
    return value


def load_events(path):
    if not path.exists():
        return []
    events = []
    for number, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if not line.strip():
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise ValueError(f'Invalid browser event at {path}:{number}') from exc
    return events


def atomic_write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(text, encoding='utf-8')
    temporary.replace(path)


def markdown(value):
    return str(value or '—').replace('|', '\\|').replace('\n', ' ')


def worst_status(statuses):
    for status in ('failed', 'not tested', 'passed'):
        if status in statuses:
            return status
    return 'not tested'


def severity_for(event):
    if event.get('kind') == 'safety-stop':
        return 'blocker'
    if event.get('kind') in {'route-exception', 'regression-pdm-chart', 'regression-import'}:
        return 'major'
    if event.get('kind') in {'route-check', 'dashboard-toggle'}:
        return 'major'
    return 'minor'


def scenario_rows(events):
    screenshots = defaultdict(list)
    for event in events:
        if event.get('kind') == 'screenshot':
            screenshots[event.get('route', '/')].append(event.get('path'))

    rows = []
    grouped_controls = defaultdict(list)
    grouped_forms = defaultdict(list)
    for event in events:
        kind = event.get('kind')
        route = event.get('route', '/')
        if kind == 'control-click':
            grouped_controls[route].append(event)
            continue
        if kind in {'form-field', 'form-toggle', 'form-select'}:
            grouped_forms[route].append(event)
            continue
        if kind not in {
            'route-check', 'dashboard-toggle', 'dashboard-plant-selection',
            'regression-import', 'regression-pdm-chart', 'route-exception',
            'auth-required', 'safety-stop',
        }:
            continue

        status = event.get('status')
        if kind in {'route-exception', 'safety-stop'}:
            status = 'failed'
        elif kind == 'auth-required':
            status = 'not tested'
        status = status if status in {'passed', 'failed', 'not tested'} else 'not tested'

        if kind == 'route-check':
            scenario = f'Загрузка и видимое состояние {route}'
            actual = f"title={event.get('title', '—')}; alerts={len(event.get('alerts', []))}; loaders={event.get('loaders', 0)}"
        elif kind == 'dashboard-toggle':
            scenario = f"Dashboard Hide/Show — {event.get('section', 'секция')}"
            actual = 'Проверены скрытие и повторное отображение секции.'
        elif kind == 'dashboard-plant-selection':
            scenario = 'Выбор существующего plant для Dashboard'
            actual = event.get('reason') or 'Plant выбран без отправки формы.'
        elif kind.startswith('regression-'):
            scenario = f'Регрессионная проверка {route}'
            actual = json.dumps({key: value for key, value in event.items() if key not in {'kind', 'blocked'}}, ensure_ascii=False)
        elif kind == 'auth-required':
            scenario = 'Продолжение теста после формы авторизации'
            actual = 'Тест остановлен до ввода пароля.'
        else:
            scenario = f'Безопасность навигации {route}'
            actual = event.get('reason') or event.get('error') or 'Сценарий остановлен fail-closed.'

        problem = 'Нет' if status == 'passed' else actual
        severity = '—' if status != 'failed' else severity_for(event)
        shot = ', '.join(screenshots.get(route, [])) or '—'
        rows.append((scenario, status, actual, problem, severity, f'Открыть {route} и повторить безопасное действие без submit.', shot))

    for route, controls in sorted(grouped_controls.items()):
        counts = Counter(item.get('status', 'not tested') for item in controls)
        status = worst_status(set(counts))
        actual = f"controls: passed={counts['passed']}, failed={counts['failed']}, not tested={counts['not tested']}"
        rows.append((
            f'Безопасные кнопки и ссылки {route}', status, actual,
            'Нет' if status == 'passed' else 'Есть controls без реакции или заблокированные как потенциальная мутация.',
            'minor' if status == 'failed' else '—',
            f'Открыть {route}; нажать только controls, разрешённые classifier и guard.',
            ', '.join(screenshots.get(route, [])) or '—',
        ))

    for route, fields in sorted(grouped_forms.items()):
        counts = Counter(item.get('status', 'not tested') for item in fields)
        status = worst_status(set(counts))
        selected = sum(item.get('optionsTested', 0) for item in fields if item.get('kind') == 'form-select')
        actual = f"fields: passed={counts['passed']}, failed={counts['failed']}, not tested={counts['not tested']}; select options={selected}"
        rows.append((
            f'Формы без submit {route}', status, actual,
            'Нет' if status == 'passed' else 'Есть непроверенные или неработающие поля.',
            'minor' if status == 'failed' else '—',
            f'Открыть форму на {route}; заполнить безопасные поля, проверить до 10 options и перезагрузить GET-route.',
            ', '.join(screenshots.get(route, [])) or '—',
        ))

    return rows


def build_report(run_dir, routes_result, risks_result, events, browser_skipped):
    status_events = [event for event in events if event.get('kind') in STATUS_KINDS]
    status_counts = Counter(event.get('status', 'not tested') for event in status_events)
    summary_event = next((event for event in reversed(events) if event.get('kind') == 'summary'), None)
    auth_event = next((event for event in events if event.get('kind') == 'auth-required'), None)
    safety_event = next((event for event in events if event.get('kind') == 'safety-stop'), None)
    recording_stopped = any(event.get('kind') == 'recording-stopped' for event in events)
    browser_complete = browser_skipped or bool(summary_event and recording_stopped and not auth_event and not safety_event)
    complete = browser_complete and routes_result.get('completed') and risks_result.get('completed')

    rows = scenario_rows(events)
    if browser_skipped:
        rows.append((
            'Runtime Browser Use flow', 'not tested', 'Browser worker отключён флагом --static-only.',
            'Runtime UI не проверен.', '—', 'Запустить hybrid runner без --static-only.', '—',
        ))
    elif not events:
        rows.append((
            'Runtime Browser Use flow', 'not tested', 'Browser events отсутствуют.',
            'Runtime UI не проверен.', '—', 'Проверить Chrome/CDP и повторить запуск.', '—',
        ))

    blocked = (summary_event or {}).get('blocked', [])
    blocked_counts = Counter(f"{item.get('method', 'UNKNOWN')}:{item.get('reason', 'unknown')}" for item in blocked)
    blocked_text = ', '.join(f'{key}={value}' for key, value in sorted(blocked_counts.items())) or '—'
    route_summary = routes_result['summary']
    risk_summary = risks_result['summary']
    run_id = run_dir.name

    lines = [
        '# Full project hybrid read-only test',
        '',
        f'- Run ID: `{markdown(run_id)}`',
        '- URL: `http://localhost:5173`',
        '- Архитектура: один Browser Use worker + static-routes-forms + static-api-risks + aggregator.',
        f"- Состояние run: **{'complete' if complete else 'incomplete'}**",
        '- Guard блокирует POST/PUT/PATCH/DELETE, submit, production WebSocket, исходящие WebSocket frames и внешнюю навигацию.',
        '- Payload, cookies, токены, пароли, storage и исходные значения полей в артефакты не записываются.',
        '',
        '## Статический инвентарь',
        '',
        f"- Router paths: {route_summary['routerPathDeclarations']}; menu paths: {route_summary['menuPathDeclarations']}; seed routes: {route_summary['seedRoutes']}.",
        f"- Vue-компоненты с UI controls: {route_summary['vueComponentsWithUiControls']}; с формами: {route_summary['vueComponentsWithForms']}; с select: {route_summary['vueComponentsWithSelects']}.",
        f"- Mutation/network risk signals: {risk_summary['findings']} в {risk_summary['filesWithFindings']} файлах.",
        '- Статические signals являются veto-кандидатами для browser classifier, а не доказательством runtime-дефекта.',
        '',
        '## Проверенные сценарии',
        '',
        '| Проверенный сценарий | Статус | Фактический результат | Найденные проблемы | Severity | Шаги воспроизведения | Путь к скриншоту |',
        '|---|---|---|---|---|---|---|',
    ]
    for row in rows:
        lines.append('| ' + ' | '.join(markdown(value) for value in row) + ' |')

    lines.extend([
        '',
        '## Итог',
        '',
        f"- Проверок выполнено: {status_counts['passed'] + status_counts['failed']}",
        f"- Прошло: {status_counts['passed']}",
        f"- Завершилось ошибкой: {status_counts['failed']}",
        f"- Не проверено: {status_counts['not tested'] + (1 if browser_skipped else 0)}",
        f'- Заблокированные guard действия: {markdown(blocked_text)}',
        f"- Не удалось проверить: {markdown('runtime UI' if browser_skipped else (auth_event or safety_event or {}).get('reason', '—'))}",
        '- Факт отсутствия обходных мутаций вне покрытых transport hooks независимо не доказан; static-risk inventory сохранён для ручного аудита.',
        '',
        '## Артефакты',
        '',
        f'- Browser events: `{markdown(str((run_dir / "browser/events.jsonl").relative_to(PROJECT_ROOT)))}`',
        f'- Static routes/forms: `{markdown(str((run_dir / "static-routes/result.json").relative_to(PROJECT_ROOT)))}`',
        f'- Static API risks: `{markdown(str((run_dir / "static-risks/result.json").relative_to(PROJECT_ROOT)))}`',
        f'- Screenshots: `{markdown(str((run_dir / "browser/screenshots").relative_to(PROJECT_ROOT)))}`',
        '',
    ])
    return '\n'.join(lines), complete


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--run-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--publish', type=Path)
    parser.add_argument('--browser-skipped', action='store_true')
    args = parser.parse_args()

    run_dir = args.run_dir.resolve()
    routes_result = load_json(run_dir / 'static-routes/result.json')
    risks_result = load_json(run_dir / 'static-risks/result.json')
    events = load_events(run_dir / 'browser/events.jsonl')
    report, complete = build_report(run_dir, routes_result, risks_result, events, args.browser_skipped)
    output = (args.output or run_dir / 'report.md').resolve()
    atomic_write(output, report)

    published = False
    if args.publish and complete and not args.browser_skipped:
        atomic_write(args.publish.resolve(), report)
        published = True

    print(json.dumps({'report': str(output), 'complete': complete, 'published': published}, ensure_ascii=False))
    raise SystemExit(0 if complete else 2)


if __name__ == '__main__':
    main()
