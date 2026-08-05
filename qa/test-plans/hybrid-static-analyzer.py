#!/usr/bin/env python3
"""Read-only static workers for the hybrid Browser Use QA run.

The script never imports application modules, starts the dev server, opens a
browser, or performs network requests. It only reads source files and writes one
JSON result owned by its worker.
"""

import argparse
import ast
import json
import re
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SRC_ROOT = PROJECT_ROOT / 'src'
ROUTER_PATH = SRC_ROOT / 'router/index.js'
MENU_PATH = SRC_ROOT / 'constants/menuItems.js'
BROWSER_PROGRAM_PATH = PROJECT_ROOT / 'qa/test-plans/full-project-read-only-interactions.py'
SCHEMA_VERSION = 1


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def atomic_json_write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(path)


def strip_js_comments_preserve_lines(source):
    """Replace JavaScript comments with spaces while preserving line numbers."""
    result = []
    index = 0
    state = 'code'
    quote = None
    while index < len(source):
        char = source[index]
        next_char = source[index + 1] if index + 1 < len(source) else ''

        if state == 'line-comment':
            if char == '\n':
                result.append(char)
                state = 'code'
            else:
                result.append(' ')
            index += 1
            continue

        if state == 'block-comment':
            if char == '*' and next_char == '/':
                result.extend((' ', ' '))
                index += 2
                state = 'code'
            else:
                result.append('\n' if char == '\n' else ' ')
                index += 1
            continue

        if state == 'string':
            result.append(char)
            if char == '\\' and index + 1 < len(source):
                result.append(source[index + 1])
                index += 2
                continue
            if char == quote:
                state = 'code'
                quote = None
            index += 1
            continue

        if char == '/' and next_char == '/':
            result.extend((' ', ' '))
            index += 2
            state = 'line-comment'
            continue
        if char == '/' and next_char == '*':
            result.extend((' ', ' '))
            index += 2
            state = 'block-comment'
            continue
        if char in {'\'', '"', '`'}:
            state = 'string'
            quote = char
        result.append(char)
        index += 1
    return ''.join(result)


def line_number(source, offset):
    return source.count('\n', 0, offset) + 1


def extract_seed_routes():
    tree = ast.parse(BROWSER_PROGRAM_PATH.read_text(encoding='utf-8'))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id == 'SEED_ROUTES'
            for target in node.targets
        ):
            return ast.literal_eval(node.value)
    return []


def extract_declared_paths(path):
    source = path.read_text(encoding='utf-8')
    clean = strip_js_comments_preserve_lines(source)
    results = []
    pattern = re.compile(r"\bpath\s*:\s*(['\"])(.*?)\1")
    for match in pattern.finditer(clean):
        results.append({
            'path': match.group(2),
            'line': line_number(clean, match.start()),
        })
    return results


def vue_inventory():
    entries = []
    for path in sorted(SRC_ROOT.rglob('*.vue')):
        source = path.read_text(encoding='utf-8', errors='replace')
        counts = {
            'formRoots': len(re.findall(r'<(?:form|el-form)\b', source, re.I)),
            'inputs': len(re.findall(r'<(?:input|textarea|el-input)\b', source, re.I)),
            'selects': len(re.findall(r'<(?:select|el-select)\b|role=["\']combobox["\']', source, re.I)),
            'buttons': len(re.findall(r'<(?:button|el-button)\b|role=["\']button["\']', source, re.I)),
            'links': len(re.findall(r'<(?:a|router-link)\b|role=["\']link["\']', source, re.I)),
            'clickHandlers': len(re.findall(r'@click(?:\.[\w-]+)*\s*=', source)),
            'submitHandlers': len(re.findall(r'@submit(?:\.[\w-]+)*\s*=', source)),
        }
        if any(counts.values()):
            entries.append({'path': str(path.relative_to(PROJECT_ROOT)), **counts})
    return entries


def routes_forms_result():
    router_paths = extract_declared_paths(ROUTER_PATH)
    menu_paths = extract_declared_paths(MENU_PATH)
    seed_routes = extract_seed_routes()
    components = vue_inventory()
    absolute_router_paths = sorted({item['path'] for item in router_paths if item['path'].startswith('/')})
    menu_absolute_paths = sorted({item['path'] for item in menu_paths if item['path'].startswith('/')})
    exact_source_paths = {
        item for item in absolute_router_paths
        if ':' not in item and '*' not in item and item not in {'/', '/login', '/kruger', '/login/remote'}
    }
    seed_paths = {route.split('?', 1)[0] for route in seed_routes}

    return {
        'schemaVersion': SCHEMA_VERSION,
        'worker': 'static-routes-forms',
        'completed': True,
        'generatedAt': utc_now(),
        'sources': [
            str(ROUTER_PATH.relative_to(PROJECT_ROOT)),
            str(MENU_PATH.relative_to(PROJECT_ROOT)),
            'src/**/*.vue',
        ],
        'summary': {
            'routerPathDeclarations': len(router_paths),
            'menuPathDeclarations': len(menu_paths),
            'seedRoutes': len(seed_routes),
            'vueComponentsWithUiControls': len(components),
            'vueComponentsWithForms': sum(1 for item in components if item['formRoots']),
            'vueComponentsWithSelects': sum(1 for item in components if item['selects']),
            'exactAbsoluteRoutesMissingFromSeeds': len(exact_source_paths - seed_paths),
        },
        'routerPaths': router_paths,
        'menuPaths': menu_paths,
        'seedRoutes': seed_routes,
        'exactAbsoluteRoutesMissingFromSeeds': sorted(exact_source_paths - seed_paths),
        'menuRoutesMissingFromSeeds': sorted(set(menu_absolute_paths) - seed_paths),
        'components': components,
    }


RISK_PATTERNS = [
    ('http-mutation-call', re.compile(r'\.(?:post|put|patch|delete)\s*\(', re.I)),
    ('http-mutation-method', re.compile(r'\bmethod\s*:\s*["\'](?:POST|PUT|PATCH|DELETE)["\']', re.I)),
    ('generic-api-mutation', re.compile(r'\b(?:api_request|apiRequest)\s*\([^\n]*(?:POST|PUT|PATCH|DELETE)', re.I)),
    ('websocket-constructor', re.compile(r'\bnew\s+WebSocket\s*\(', re.I)),
    ('websocket-send', re.compile(r'\b(?:webSocketSend|socket\.send|\.send\s*\(\s*["\'](?:client-|message|command))', re.I)),
    ('worker-network-surface', re.compile(r'\bnew\s+(?:Shared)?Worker\s*\(|navigator\.serviceWorker', re.I)),
    ('form-submit-handler', re.compile(r'@submit|\b(?:handleSubmitForm|executeFormSubmit|requestSubmit)\b', re.I)),
    ('mutation-handler-name', re.compile(r'\b(?:deleteItem|removeItem|saveItem|updateItem|createItem|startImport|uploadFile)\b', re.I)),
    ('production-host-literal', re.compile(r'(?:wss?|https?)://[^\s"\']*(?:industrialmatrix\.com|industrialmatrix\.tools|assetmatrix\.com)', re.I)),
]


def api_risks_result():
    findings = []
    suffixes = {'.js', '.ts', '.vue'}
    for path in sorted(SRC_ROOT.rglob('*')):
        if not path.is_file() or path.suffix not in suffixes:
            continue
        source = path.read_text(encoding='utf-8', errors='replace')
        clean = strip_js_comments_preserve_lines(source)
        for number, line in enumerate(clean.splitlines(), 1):
            for category, pattern in RISK_PATTERNS:
                if pattern.search(line):
                    findings.append({
                        'path': str(path.relative_to(PROJECT_ROOT)),
                        'line': number,
                        'category': category,
                    })

    category_counts = {}
    for finding in findings:
        category_counts[finding['category']] = category_counts.get(finding['category'], 0) + 1

    return {
        'schemaVersion': SCHEMA_VERSION,
        'worker': 'static-api-risks',
        'completed': True,
        'generatedAt': utc_now(),
        'sources': ['src/**/*.{js,ts,vue}'],
        'summary': {
            'findings': len(findings),
            'filesWithFindings': len({item['path'] for item in findings}),
            'byCategory': dict(sorted(category_counts.items())),
        },
        'findings': findings,
        'limitations': [
            'Static signals are safety candidates, not proof that a runtime control sends a mutation.',
            'Dynamic method names and transports implemented outside src may require runtime inspection.',
            'No request payloads, credentials, cookies, tokens, or stored field values are read.',
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=('routes-forms', 'api-risks'), required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()

    result = routes_forms_result() if args.mode == 'routes-forms' else api_risks_result()
    atomic_json_write(args.output.resolve(), result)
    print(json.dumps({'worker': result['worker'], 'completed': True, 'summary': result['summary']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
