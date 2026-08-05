"""Browser Use program for exhaustive safe UI interaction testing.

Run only through Browser Use CLI from the repository root:

    browser-use < qa/test-plans/full-project-read-only-interactions.py

The script never submits a form. It blocks every POST/PUT/PATCH/DELETE request,
production/external navigation, and all form submissions before interacting.
"""

import hashlib
import json
import os
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse


BASE = 'http://localhost:5173'
PROJECT_ROOT = Path(os.environ.get('QA_PROJECT_ROOT', Path.cwd())).resolve()
GUARD_PATH = PROJECT_ROOT / 'qa/test-plans/browser-read-only-guard.js'
RUN_ID = re.sub(r'[^a-zA-Z0-9._-]+', '-', os.environ.get('QA_RUN_ID', 'manual')).strip('-') or 'manual'
WORKER_DIR = Path(os.environ.get('QA_BROWSER_WORKER_DIR', PROJECT_ROOT / 'qa/reports/runs' / RUN_ID / 'browser')).resolve()
SHOT_DIR = Path(os.environ.get('QA_SCREENSHOT_DIR', WORKER_DIR / 'screenshots')).resolve()
EVENTS_PATH = Path(os.environ.get('QA_EVENTS_PATH', WORKER_DIR / 'events.jsonl')).resolve()
RECORDING_PATH = WORKER_DIR / 'recording.json'
RECORDING_NAME = re.sub(r'[^a-zA-Z0-9._-]+', '-', os.environ.get('QA_RECORDING_NAME', f'full-project-read-only-{RUN_ID}'))
MAX_SELECT_OPTIONS = 10
MAX_ROUTES = 250
MAX_CONTROLS_PER_ROUTE = 500

READ_ONLY_GUARD_JS = GUARD_PATH.read_text(encoding='utf-8')
GUARD_SHA256 = hashlib.sha256(READ_ONLY_GUARD_JS.encode('utf-8')).hexdigest()
WORKER_DIR.mkdir(parents=True, exist_ok=True)
SHOT_DIR.mkdir(parents=True, exist_ok=True)

SEED_ROUTES = [
    '/dashboard',
    '/dashboard/plant',
    '/dashboard/machines',
    '/dashboard/assets',
    '/dashboard/equipments',
    '/dashboard/production-lines',
    '/dashboard/utilities',
    '/success-dashboard',
    '/success-dashboard/main',
    '/success-dashboard/meeting-tracker',
    '/success-dashboard/roi-one-pager',
    '/corporate',
    '/corporate/main',
    '/library',
    '/controllers',
    '/processes',
    '/companies',
    '/plants',
    '/users',
    '/teams',
    '/user-roles',
    '/distributors',
    '/plants-vendors',
    '/settings',
    '/settings/faults?type=1',
    '/settings/faults?type=3',
    '/settings/custom-formulas',
    '/settings/backend-registers',
    '/settings/bearing',
    '/settings/lube-type',
    '/settings/industrial-services',
    '/settings/statistics',
    '/settings/banner-v2-subtypes',
    '/settings/import/logs',
    '/settings/import/master',
    '/settings/import/history',
    '/maintenance',
    '/maintenance/work-orders',
    '/maintenance/logs',
    '/maintenance-requests',
    '/task-procedures',
    '/maintenance-categories',
    '/parts',
    '/maintenance-import',
    '/plant-import',
    '/plant-import-logs',
    '/master-import',
    '/brands',
    '/brand-models',
    '/equipment-types',
    '/equipment-types-categories',
    '/applications',
    '/store-rooms',
    '/equipments',
    '/sensors',
    '/sensors/ncd',
    '/roi-calculator',
    '/rfqs',
    '/requisitions',
    '/profile',
]

# These labels imply a server mutation, file operation, command, status change,
# or another side effect. They are skipped before clicking; the guard is backup.
UNSAFE_LABEL_RE = re.compile(
    r'(^|\b)('
    r'save|submit|delete|remove|import|upload|start import|start|'
    r'approve|deny|reject|complete|close|open|take|reset|rebaseline|'
    r'detach|unlock|generate|send|command|convert|change status|'
    r'assign|acknowledge|archive|unarchive|restore|repeat|merge|move|'
    r'export|download|logout|log out|sign out|apply changes|update|'
    r'enable|disable|activate|deactivate|publish|unpublish|clone|invite|'
    r'sync|run|stop|pause|resume|connect|disconnect|link|unlink|clear'
    r')(\b|$)',
    re.IGNORECASE,
)

UNSAFE_CONTEXT_RE = re.compile(
    r'(delete|remove|trash|danger|destructive|upload|import|export|download|'
    r'command|rebaseline|threshold|rpm|permission|credential|password|mfa|'
    r'api.?key|logout|archive|status.?change|drag.?drop)',
    re.IGNORECASE,
)

UNSAFE_PATH_RE = re.compile(
    r'/(logout|delete|remove|destroy|import/start|rebaseline|command)(/|$)',
    re.IGNORECASE,
)

SAFE_UNLABELED_CLASS_RE = re.compile(
    r'(toggle-list-button|toggle-additional-filters|grid-button|pagination|'
    r'collapse|expand|accordion|drag_n_drop-locker|icon-edit|icon-pencil|'
    r'el-dialog__close|el-drawer__close)',
    re.IGNORECASE,
)

DANGEROUS_FIELD_CONTEXT_RE = re.compile(
    r'(password|mfa|token|credential|api.?key|permission|threshold|rpm|'
    r'formula|command|register writing|upload|import|delete|remove|archive|'
    r'status|rebaseline)',
    re.IGNORECASE,
)

FORM_SAMPLE_VALUES = {
    'text': 'QA read-only check',
    'search': 'QA read-only check',
    'email': 'qa.readonly@example.invalid',
    'tel': '+15555550123',
    'url': 'https://example.invalid/qa-read-only',
    'date': '2026-08-05',
    'time': '12:34',
    'datetime-local': '2026-08-05T12:34',
    'month': '2026-08',
    'week': '2026-W32',
}

events = []
visited_routes = set()
queued_routes = []
queued_route_keys = set()
clicked_link_keys = set()
dashboard_toggles_tested = False
auth_required = False
blocked_all = []
guard_document_id = None
guard_blocked_count = 0
screenshot_sequence = 0


def emit(kind, **payload):
    item = {'kind': kind, **payload}
    events.append(item)
    serialized = json.dumps(item, ensure_ascii=False)
    with EVENTS_PATH.open('a', encoding='utf-8') as handle:
        handle.write(serialized + '\n')
    print('QA_EVENT', serialized)
    return item


def sanitized_path(url=None):
    parsed = urlparse(url or page_info().get('url', ''))
    return parsed.path or '/'


def is_exact_local_url(url):
    parsed = urlparse(url or '')
    return f'{parsed.scheme}://{parsed.netloc}' == BASE


def require_local_url(url, context):
    if is_exact_local_url(url):
        return
    emit('safety-stop', context=context, route=sanitized_path(url), reason='external-or-unexpected-origin')
    raise RuntimeError('EXTERNAL_ORIGIN')


def normalize_local_route(value):
    if not value:
        return None
    absolute = urljoin(BASE + '/', value)
    parsed = urlparse(absolute)
    if f'{parsed.scheme}://{parsed.netloc}' != BASE:
        return None
    if UNSAFE_PATH_RE.search(parsed.path):
        return None
    if parsed.path.startswith(('/login', '/kruger')):
        return None

    # Keep only the known non-sensitive Settings selector. Pagination/filter
    # query values are tested through UI and do not create new crawl routes.
    query = parsed.query if parsed.path == '/settings/faults' and re.fullmatch(r'type=\d+', parsed.query) else ''
    return parsed.path + (f'?{query}' if query else '')


def enqueue_route(value, source='seed'):
    route = normalize_local_route(value)
    if not route or route in queued_route_keys or route in visited_routes:
        return False
    if len(queued_route_keys) >= MAX_ROUTES:
        emit('route-skipped', route=sanitized_path(BASE + route), reason='route-cap-reached', source=source)
        return False
    queued_route_keys.add(route)
    queued_routes.append(route)
    return True


def guard_snapshot():
    try:
        return js('window.__qaReadOnlyGuard.snapshot()')
    except Exception:
        return {'installed': False, 'allowedCount': 0, 'blocked': []}


def collect_guard_blocks(snapshot=None):
    global guard_document_id, guard_blocked_count
    current = snapshot or guard_snapshot()
    document_id = current.get('documentId')
    current_blocked = current.get('blocked', [])
    if document_id != guard_document_id:
        delta = current_blocked
        guard_document_id = document_id
    else:
        delta = current_blocked[guard_blocked_count:]
    guard_blocked_count = len(current_blocked)
    blocked_all.extend(delta)
    return current, delta


def ensure_guard():
    current = guard_snapshot()
    if current.get('installed') and current.get('version') == '2.0.0':
        collect_guard_blocks(current)
        return current
    result = js(READ_ONLY_GUARD_JS)
    collect_guard_blocks(result)
    emit('guard-restored', route=sanitized_path(), installed=bool(result and result.get('installed')), version=result.get('version'))
    return result


def blocked_delta(before):
    del before
    return collect_guard_blocks()


def visible_state():
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const alerts=[...document.querySelectorAll('[role=alert],.el-message--error,.el-notification--error,.error-message,.alert-danger')]
        .filter(vis).map(e=>(e.innerText||'').trim()).filter(Boolean).slice(0,10);
      const loaders=[...document.querySelectorAll('[aria-busy=true],[role=progressbar],.loading,.loader,.spinner,[class*=loading],[class*=spinner]')].filter(vis).length;
      const loginForm=location.pathname.startsWith('/login') || [...document.forms].some(f=>/login|sign.?in/i.test(f.action||''));
      return {url:location.href,title:document.title,ready:document.readyState,alerts,loaders,loginForm,
        visiblePasswords:[...document.querySelectorAll('input[type=password]')].filter(vis).length,
        dialogs:[...document.querySelectorAll('[role=dialog],.el-dialog,.el-drawer')].filter(vis).length};
    })())""")
    return json.loads(raw)


def regression_state():
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const text=document.body?.innerText||'';
      return {
        textMissing:/text missing/i.test(text),
        itemTypesKey:/(^|\\n)\\s*item_types\\s*($|\\n)/mi.test(text),
        backendTrace:text.includes('/var/www/html/')||/App\\\\[A-Za-z]+\\\\/.test(text),
        unauthorized:/request failed with status code 401|(^|\\n)\\s*401\\s*($|\\n)/mi.test(text),
        chartLoading:/chart loading\\.\\.\\./i.test(text),
        charts:[...document.querySelectorAll('.highcharts-container,.apexcharts-canvas,canvas')].filter(vis).length,
        series:document.querySelectorAll('.highcharts-series,.apexcharts-series').length,
        emptyState:/not found\\.\\.\\.|no data|select plant first/i.test(text)
      };
    })())""")
    return json.loads(raw)


def check_fixed_regressions(route):
    clean_route = route.split('?')[0]
    if clean_route in {'/maintenance-import', '/plant-import', '/settings/import/logs', '/settings/import/history'}:
        result = regression_state()
        failed_flags = [key for key in ('textMissing', 'itemTypesKey', 'backendTrace') if result[key]]
        status = 'failed' if failed_flags else 'passed'
        emit('regression-import', route=clean_route, status=status, failedFlags=failed_flags)
        if failed_flags:
            capture_problem(f'regression-import-{clean_route}-failed')

    if re.search(r'/equipments/[^/]+/details/pdm/[^/]+', clean_route) or re.search(r'/sensors/[^/]+/(stats|statistics|fft|multiview)', clean_route):
        state = visible_state()
        result = regression_state()
        route_event = next((item for item in reversed(events) if item.get('kind') == 'route-check' and item.get('route') == clean_route), {})
        transport_blocked = any(
            item.get('kind', '').startswith('websocket') or item.get('reason') == 'production-host'
            for item in route_event.get('blocked', [])
        )
        if transport_blocked:
            status = 'not tested'
        elif result['unauthorized'] or state['loaders'] or result['chartLoading']:
            status = 'failed'
        elif result['charts'] or result['series']:
            status = 'passed'
        elif result['emptyState']:
            status = 'not tested'
        else:
            status = 'failed'
        emit('regression-pdm-chart', route=clean_route, status=status, alerts=state['alerts'], loaders=state['loaders'],
             unauthorized=result['unauthorized'], chartLoading=result['chartLoading'], charts=result['charts'], series=result['series'], emptyState=result['emptyState'],
             transportBlocked=transport_blocked)
        if status == 'failed':
            capture_problem(f'regression-pdm-{clean_route}-failed')


def wait_until_stable(timeout_seconds=10):
    try:
        wait_for_load(timeout=8)
    except Exception:
        pass
    elapsed = 0.0
    previous = None
    stable_count = 0
    while elapsed < timeout_seconds:
        wait(0.5)
        elapsed += 0.5
        current = visible_state()
        signature = (current['url'], current['loaders'], tuple(current['alerts']))
        if signature == previous and current['loaders'] == 0:
            stable_count += 1
            if stable_count >= 2:
                return current
        else:
            stable_count = 0
        previous = signature
    return visible_state()


def check_auth(state):
    global auth_required
    if state.get('loginForm'):
        auth_required = True
        emit('auth-required', route=sanitized_path(state.get('url')), reason='login-form')
        raise RuntimeError('AUTH_REQUIRED')


def goto_route(route, label='route'):
    ensure_guard()
    blocked_marker = len(blocked_all)
    goto_url(BASE + route)
    state = wait_until_stable()
    require_local_url(state.get('url'), 'route-navigation')
    ensure_guard()
    check_auth(state)
    route_blocks = blocked_all[blocked_marker:]
    page_has_visible_problem = bool(state['alerts'] or state['loaders'])
    emit(
        'route-check',
        label=label,
        route=sanitized_path(state['url']),
        status='not tested' if route_blocks and page_has_visible_problem else ('failed' if page_has_visible_problem else 'passed'),
        alerts=state['alerts'],
        loaders=state['loaders'],
        title=state['title'],
        blocked=route_blocks,
    )
    return state


def backend_id(selector):
    root = cdp('DOM.getDocument', depth=0)['root']['nodeId']
    node_id = cdp('DOM.querySelector', nodeId=root, selector=selector).get('nodeId', 0)
    if not node_id:
        return None
    return cdp('DOM.describeNode', nodeId=node_id)['node'].get('backendNodeId')


def click_selector(selector):
    bid = backend_id(selector)
    if not bid:
        return {'ok': False, 'reason': 'not-found'}
    try:
        cdp('DOM.scrollIntoViewIfNeeded', backendNodeId=bid)
    except Exception:
        js(f"document.querySelector({json.dumps(selector)})?.scrollIntoView({{block:'center'}})")
    wait(0.15)
    try:
        quad = cdp('DOM.getBoxModel', backendNodeId=bid)['model']['content']
    except Exception as exc:
        return {'ok': False, 'reason': type(exc).__name__}
    x, y = sum(quad[0::2]) / 4, sum(quad[1::2]) / 4
    info = page_info()
    if not (0 <= x <= info['w'] and 0 <= y <= info['h']):
        return {'ok': False, 'reason': 'outside-viewport', 'coords': [round(x, 1), round(y, 1)]}
    click_at_xy(x, y)
    return {'ok': True, 'coords': [round(x, 1), round(y, 1)]}


def click_backend_node(bid):
    try:
        cdp('DOM.scrollIntoViewIfNeeded', backendNodeId=bid)
        quad = cdp('DOM.getBoxModel', backendNodeId=bid)['model']['content']
        x, y = sum(quad[0::2]) / 4, sum(quad[1::2]) / 4
        click_at_xy(x, y)
        return True
    except Exception:
        return False


def page_fingerprint():
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      return {url:location.href,dialogs:[...document.querySelectorAll('[role=dialog],.el-dialog,.el-drawer')].filter(vis).length,
        expanded:[...document.querySelectorAll('[aria-expanded]')].filter(vis).map(e=>e.getAttribute('aria-expanded')).join(','),
        selected:[...document.querySelectorAll('[aria-selected=true],.is-active,.active')].filter(vis).length,
        visibleForms:[...document.querySelectorAll('form,.el-form,[role=form]')].filter(vis).length,
        textLength:(document.body?.innerText||'').length};
    })())""")
    return json.loads(raw)


def control_inventory():
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const selector='a[href],button,input[type=button],input[type=reset],input[type=submit],input[type=image],[role=button],[role=link],[role=tab],[role=menuitem],[role=treeitem],summary,[aria-expanded],.toggle-list-button .pointer';
      let seq=0;
      return [...new Set([...document.querySelectorAll(selector)])].filter(vis).map(e=>{
        const id=`qa-ro-control-${seq++}`;e.setAttribute('data-qa-ro-control',id);
        const form=e.closest('form,.el-form,[role=form]');
        const dialog=e.closest('[role=dialog],.el-dialog,.el-drawer');
        const text=(e.innerText||e.value||e.getAttribute('aria-label')||e.title||'').trim().replace(/\\s+/g,' ').slice(0,160);
        const formTitle=(form?.querySelector('h1,h2,h3,[role=heading],legend')?.innerText||form?.getAttribute('name')||'');
        const context=(formTitle+' '+(e.className||'')+' '+(e.parentElement?.className||'')).trim().replace(/\\s+/g,' ').slice(0,300);
        return {id,tag:e.tagName.toLowerCase(),role:e.getAttribute('role')||'',text,ariaLabel:e.getAttribute('aria-label')||'',title:e.title||'',
          href:e.href||'',type:(e.getAttribute('type')||'').toLowerCase(),disabled:!!e.disabled||e.getAttribute('aria-disabled')==='true',
          selected:e.getAttribute('aria-selected')==='true'||e.classList.contains('is-active'),expanded:e.getAttribute('aria-expanded'),
          download:e.hasAttribute('download'),insideForm:!!form,insideDialog:!!dialog,context,className:String(e.className||'').slice(0,240)};
      });
    })())""")
    return json.loads(raw)


def is_dialog_close(control):
    label = f"{control['text']} {control['ariaLabel']} {control['title']}".strip().lower()
    return control['insideDialog'] and (
        label in {'close', 'cancel', '×', 'x'}
        or 'el-dialog__close' in control['className']
        or 'el-drawer__close' in control['className']
    )


def classify_control(control):
    label = f"{control['text']} {control['ariaLabel']} {control['title']}".strip()
    combined = f"{label} {control['className']} {control['context']}"

    if control['disabled']:
        return False, 'disabled'
    if control['selected'] and control['role'] == 'tab':
        return False, 'already-active-tab'
    if control['type'] in {'submit', 'image', 'reset'}:
        return False, f"input-type-{control['type']}"
    if is_dialog_close(control):
        return True, 'dialog-close'

    if control['href']:
        parsed = urlparse(control['href'])
        if f'{parsed.scheme}://{parsed.netloc}' != BASE:
            return False, 'external-link'
        if control['download']:
            return False, 'download-link'
        if UNSAFE_PATH_RE.search(parsed.path) or UNSAFE_LABEL_RE.search(label):
            return False, 'mutation-or-session-link'
        return True, 'local-link'

    if UNSAFE_LABEL_RE.search(label):
        return False, 'mutation-label'
    if re.fullmatch(r'(add|create|new|edit)(?:\s+.+)?', label, re.IGNORECASE):
        return True, 'open-form-without-submit'
    if UNSAFE_CONTEXT_RE.search(combined) and not re.search(r'(filter|show|hide|view|detail|edit|cancel)', label, re.I):
        return False, 'mutation-context'
    if not label and not SAFE_UNLABELED_CLASS_RE.search(f"{control['className']} {control['context']}"):
        return False, 'unlabeled-unknown-side-effect'
    return True, 'safe-ui-control'


def capture_problem(prefix):
    global screenshot_sequence
    screenshot_sequence += 1
    name = re.sub(r'[^a-z0-9-]+', '-', prefix.lower()).strip('-')[:100] or 'problem'
    path = SHOT_DIR / f'{screenshot_sequence:04d}-{name}.png'
    capture_screenshot(str(path))
    emit('screenshot', route=sanitized_path(), path=str(path.relative_to(PROJECT_ROOT)))
    return str(path)


def discover_links():
    for control in control_inventory():
        if not control['href']:
            continue
        route = normalize_local_route(control['href'])
        if route:
            enqueue_route(route, source=sanitized_path())


def field_inventory():
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      let seq=0;
      const roots=[...document.querySelectorAll('form,.el-form,[role=form],[role=dialog],.filterbar,.filter-bar,[class*=filterbar],[class*=filter-bar]')].filter(vis);
      const fields=[...new Set(roots.flatMap(root=>[...root.querySelectorAll('input,textarea,select,[role=combobox],[role=checkbox],[role=radio],[role=switch]')]))].filter(vis);
      return fields.map(e=>{
        const id=`qa-ro-field-${seq++}`;e.setAttribute('data-qa-ro-field',id);
        const item=e.closest('.el-form-item,.form-item,label')||e.parentElement;
        const label=(item?.innerText||e.getAttribute('aria-label')||e.placeholder||'').trim().replace(/\\s+/g,' ').slice(0,220);
        return {id,tag:e.tagName.toLowerCase(),role:e.getAttribute('role')||'',type:(e.type||'').toLowerCase(),name:e.name||'',label,
          disabled:!!e.disabled||e.getAttribute('aria-disabled')==='true',readonly:!!e.readOnly,required:!!e.required||e.getAttribute('aria-required')==='true',
          checked:!!e.checked,min:e.min||'',max:e.max||'',step:e.step||'',multiple:!!e.multiple,
          optionCount:e.options?e.options.length:0};
      });
    })())""")
    return json.loads(raw)


def safe_field(field):
    if field['disabled'] or field['readonly']:
        return False, 'disabled-or-readonly'
    if field['type'] in {'hidden', 'password', 'file', 'submit', 'button', 'reset', 'image'}:
        return False, f"field-type-{field['type']}"
    context = f"{field['name']} {field['label']}"
    if DANGEROUS_FIELD_CONTEXT_RE.search(context):
        return False, 'sensitive-or-live-write-field'
    return True, 'safe-form-field'


def numeric_sample(field):
    try:
        low = float(field['min']) if field['min'] else 1.0
    except ValueError:
        low = 1.0
    try:
        high = float(field['max']) if field['max'] else low + 10.0
    except ValueError:
        high = low + 10.0
    value = low if low == high else low + (high - low) / 2
    return str(int(value)) if float(value).is_integer() else str(round(value, 3))


def form_errors():
    return json.loads(js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      return [...document.querySelectorAll('.el-form-item__error,[role=alert],.invalid-feedback')].filter(vis).map(e=>(e.innerText||'').trim()).filter(Boolean).slice(0,10);
    })())"""))


def test_text_field(field):
    selector = f'[data-qa-ro-field="{field["id"]}"]'
    sample = numeric_sample(field) if field['type'] in {'number', 'range'} else FORM_SAMPLE_VALUES.get(field['type'], 'QA read-only check')
    before = guard_snapshot()
    try:
        fill_input(selector, sample)
        press_key('Tab')
        wait(0.25)
        _, delta = blocked_delta(before)
        status = 'not tested' if delta else 'passed'
        sample_errors = form_errors()
        required_errors = []
        if not delta and field['required']:
            empty_guard = guard_snapshot()
            fill_input(selector, '')
            press_key('Tab')
            wait(0.2)
            _, empty_delta = blocked_delta(empty_guard)
            delta.extend(empty_delta)
            required_errors = form_errors()
            if empty_delta:
                status = 'not tested'
        emit('form-field', route=sanitized_path(), fieldType=field['type'] or field['tag'], required=field['required'], status=status,
             blocked=delta, validationErrors=sample_errors, requiredValidationErrors=required_errors)
        return not delta
    except Exception as exc:
        emit('form-field', route=sanitized_path(), fieldType=field['type'] or field['tag'], status='failed', error=type(exc).__name__)
        return False


def test_toggle_field(field):
    selector = f'[data-qa-ro-field="{field["id"]}"]'
    before = guard_snapshot()
    first = click_selector(selector)
    wait(0.3)
    if first.get('ok') and field['type'] != 'radio':
        click_selector(selector)
        wait(0.2)
    _, delta = blocked_delta(before)
    emit('form-toggle', route=sanitized_path(), fieldType=field['type'] or field['role'], status='not tested' if delta else ('passed' if first.get('ok') else 'failed'), blocked=delta)
    return not delta


def visible_options():
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      let seq=0;
      return [...document.querySelectorAll('[role=option],.el-select-dropdown__item')]
        .filter(e=>vis(e)&&!e.disabled&&e.getAttribute('aria-disabled')!=='true')
        .map(e=>{const id=`qa-ro-option-${seq++}`;e.setAttribute('data-qa-ro-option',id);return {id,selected:e.getAttribute('aria-selected')==='true'||e.classList.contains('is-selected')};});
    })())""")
    return json.loads(raw)


def test_select_field(field):
    selector = f'[data-qa-ro-field="{field["id"]}"]'
    attempts = 0
    blocked = []

    if field['tag'] == 'select':
        option_limit = min(MAX_SELECT_OPTIONS, max(0, field.get('optionCount', 0)))
        for option_index in range(option_limit):
            before = guard_snapshot()
            if not click_selector(selector).get('ok'):
                break
            press_key('Home')
            for _ in range(option_index):
                press_key('ArrowDown')
            press_key('Tab')
            wait(0.25)
            _, delta = blocked_delta(before)
            attempts += 1
            blocked.extend(delta)
            if delta:
                break
        press_key('Escape')
    else:
        for _ in range(MAX_SELECT_OPTIONS):
            before = guard_snapshot()
            if not click_selector(selector).get('ok'):
                break
            wait(0.25)
            options = visible_options()
            choices = [option for option in options if not option['selected']]
            if not choices:
                press_key('Escape')
                break
            choice = choices[min(attempts, len(choices) - 1)]
            if not click_selector(f'[data-qa-ro-option="{choice["id"]}"]').get('ok'):
                press_key('Escape')
                break
            wait(0.35)
            _, delta = blocked_delta(before)
            attempts += 1
            blocked.extend(delta)
            if delta:
                break

    emit('form-select', route=sanitized_path(), status='not tested' if blocked else ('passed' if attempts else 'not tested'),
         optionsTested=attempts, optionLimit=MAX_SELECT_OPTIONS, blocked=blocked)
    return not blocked


def test_visible_forms(reason='page'):
    fields = field_inventory()
    if not fields:
        return
    page_url = page_info()['url']
    require_local_url(page_url, 'form-start')
    tested = 0
    skipped = 0
    emit('form-start', route=sanitized_path(page_url), reason=reason, fieldsDiscovered=len(fields))
    for field in fields:
        allowed, why = safe_field(field)
        if not allowed:
            skipped += 1
            emit('form-field-skipped', route=sanitized_path(page_url), fieldType=field['type'] or field['role'] or field['tag'], reason=why)
            continue
        tested += 1
        if field['tag'] == 'select' or field['role'] == 'combobox':
            safe_to_continue = test_select_field(field)
        elif field['type'] in {'checkbox', 'radio'} or field['role'] in {'checkbox', 'radio', 'switch'}:
            safe_to_continue = test_toggle_field(field)
        else:
            safe_to_continue = test_text_field(field)
        if not safe_to_continue:
            emit('form-stopped', route=sanitized_path(page_url), reason='blocked-request-from-field')
            break

    # Discard all client-only changes without submitting the form.
    require_local_url(page_url, 'form-reset')
    goto_url(page_url)
    wait_until_stable()
    ensure_guard()
    emit('form-finish', route=sanitized_path(page_url), fieldsTested=tested, fieldsSkipped=skipped, submitted=False, resetByReload=True)


def dashboard_section_state(scope):
    raw = js("""JSON.stringify((() => {
      const root=document.querySelector(%s);if(!root)return null;
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const toggle=root.querySelector('.toggle-list-button');const content=root.querySelector('.card-content');
      return {label:(toggle?.innerText||'').trim().replace(/\\s+/g,' '),contentVisible:vis(content),hasToggle:!!toggle};
    })())""" % json.dumps(scope))
    return json.loads(raw) if raw != 'null' else None


def ensure_dashboard_plant():
    if dashboard_section_state('.assets-list'):
        return True
    selectors = [
        'input[placeholder*="Select plant"]',
        '[role="combobox"][aria-label*="plant" i]',
        '.el-select input',
    ]
    opened = False
    for selector in selectors:
        if click_selector(selector).get('ok'):
            opened = True
            break
    if not opened:
        emit('dashboard-plant-selection', route='/dashboard/plant', status='not tested', reason='plant-selector-not-found')
        return False
    wait(0.3)
    options = visible_options()
    if not options or not click_selector(f'[data-qa-ro-option="{options[0]["id"]}"]').get('ok'):
        press_key('Escape')
        emit('dashboard-plant-selection', route='/dashboard/plant', status='not tested', reason='plant-option-not-found')
        return False
    state = wait_until_stable()
    emit('dashboard-plant-selection', route='/dashboard/plant', status='passed' if not state['alerts'] else 'failed', alerts=state['alerts'])
    return dashboard_section_state('.assets-list') is not None


def test_dashboard_hide_show():
    global dashboard_toggles_tested
    if dashboard_toggles_tested:
        return
    dashboard_toggles_tested = True
    if not ensure_dashboard_plant():
        return
    sections = [
        ('Assets', '.assets-list'),
        ('Machines', '.machines-list'),
        ('Production Lines', '.production_lines-list'),
    ]
    for label, scope in sections:
        before_state = dashboard_section_state(scope)
        if not before_state or not before_state['hasToggle']:
            emit('dashboard-toggle', section=label, route='/dashboard/plant', status='not tested', reason='section-or-toggle-not-found')
            continue
        before_guard = guard_snapshot()
        hide_click = click_selector(f'{scope} .toggle-list-button .absolute.stretch.pointer')
        wait(0.4)
        hidden_state = dashboard_section_state(scope)
        _, hide_delta = blocked_delta(before_guard)

        show_guard = guard_snapshot()
        show_click = click_selector(f'{scope} .toggle-list-button .absolute.stretch.pointer')
        wait(0.4)
        shown_state = dashboard_section_state(scope)
        _, show_delta = blocked_delta(show_guard)

        passed = (
            hide_click.get('ok') and show_click.get('ok')
            and hidden_state and not hidden_state['contentVisible'] and re.search(r'show', hidden_state['label'], re.I)
            and shown_state and shown_state['contentVisible'] and re.search(r'hide', shown_state['label'], re.I)
            and not hide_delta and not show_delta
        )
        emit('dashboard-toggle', section=label, route='/dashboard/plant', status='passed' if passed else 'failed',
             before=before_state, hidden=hidden_state, restored=shown_state, blocked=hide_delta + show_delta)
        if not passed:
            capture_problem(f'dashboard-{label}-hide-show-failed')


def click_safe_controls_on_route(route):
    tested_keys = set()
    clicks = 0
    while clicks < MAX_CONTROLS_PER_ROUTE:
        inventory = control_inventory()
        candidate = None
        for control in inventory:
            label = f"{control['text']} {control['ariaLabel']} {control['title']}".strip()
            href_route = normalize_local_route(control['href']) if control['href'] else ''
            key = json.dumps({
                'route': sanitized_path(),
                'tag': control['tag'],
                'role': control['role'],
                'label': label.lower(),
                'href': href_route or '',
                'class': control['className'][:100],
            }, sort_keys=True)
            if key in tested_keys:
                continue
            tested_keys.add(key)
            allowed, reason = classify_control(control)
            if not allowed:
                emit('control-skipped', route=sanitized_path(), label=label[:100], reason=reason)
                continue
            link_key = json.dumps({
                'href': href_route or '',
                'label': label.lower(),
                'class': control['className'][:100],
            }, sort_keys=True)
            if control['href'] and href_route and link_key in clicked_link_keys:
                continue
            candidate = (control, key, reason, href_route, link_key)
            break

        if not candidate:
            break

        control, key, reason, href_route, link_key = candidate
        source_url = page_info()['url']
        require_local_url(source_url, 'before-control-click')
        before_guard = guard_snapshot()
        before_fp = page_fingerprint()
        result = click_selector(f'[data-qa-ro-control="{control["id"]}"]')
        if not result.get('ok'):
            emit('control-click', route=sanitized_path(source_url), label=control['text'][:100], status='failed', reason=result.get('reason'))
            continue

        clicks += 1
        pending = page_info()
        if pending.get('dialog'):
            cdp('Page.handleJavaScriptDialog', accept=False)
            emit('control-click', route=sanitized_path(source_url), label=control['text'][:100], status='not tested',
                 reason='unexpected-native-dialog-dismissed', dialogType=pending['dialog'].get('type'))
            goto_url(source_url)
            wait_until_stable()
            ensure_guard()
            continue
        state = wait_until_stable(timeout_seconds=4)
        require_local_url(state.get('url'), 'after-control-click')
        check_auth(state)
        after_guard, delta = blocked_delta(before_guard)
        after_fp = page_fingerprint()
        navigated = after_fp['url'] != before_fp['url']
        changed = navigated or after_fp != before_fp
        status = 'not tested' if delta else ('passed' if changed else 'failed')
        emit('control-click', route=sanitized_path(source_url), label=control['text'][:100], status=status,
             classification=reason, navigated=navigated, observableChange=changed, blocked=delta)

        if status == 'failed':
            capture_problem(f'control-no-reaction-{sanitized_path(source_url)}-{clicks}')

        if href_route:
            clicked_link_keys.add(link_key)
            enqueue_route(href_route, source=sanitized_path(source_url))

        if after_fp['visibleForms'] > before_fp['visibleForms'] or after_fp['dialogs'] > before_fp['dialogs']:
            test_visible_forms(reason='opened-by-safe-control')
            if visible_state()['dialogs']:
                press_key('Escape')
                wait(0.3)

        # Return after link/tab navigation so every source control is tested from
        # the same stable page state. This is GET-only and discards local edits.
        if page_info()['url'] != source_url:
            require_local_url(source_url, 'return-after-control-click')
            goto_url(source_url)
            wait_until_stable()
            ensure_guard()

        if delta:
            # Never retry a control that attempted a blocked request.
            tested_keys.add(key)

    if clicks >= MAX_CONTROLS_PER_ROUTE:
        emit('control-cap', route=route, limit=MAX_CONTROLS_PER_ROUTE)


for seed in SEED_ROUTES:
    enqueue_route(seed)

EVENTS_PATH.write_text('', encoding='utf-8')
recording_dir = start_recording(RECORDING_NAME, title=f'Full project safe controls and forms ({RUN_ID})')
RECORDING_PATH.write_text(json.dumps({
    'runId': RUN_ID,
    'recordingName': RECORDING_NAME,
    'path': str(recording_dir),
    'status': 'running',
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
emit('recording-started', path=str(recording_dir))
emit('guard-metadata', version='2.0.0', sha256=GUARD_SHA256)

try:
    tabs = list_tabs()
    local_tabs = [tab for tab in tabs if tab.get('url', '').startswith(BASE)]
    if local_tabs:
        switch_tab(local_tabs[0].get('targetId') or local_tabs[0].get('target_id'))
    else:
        new_tab('about:blank')

    cdp('Page.addScriptToEvaluateOnNewDocument', source=READ_ONLY_GUARD_JS)
    if is_exact_local_url(page_info()['url']):
        # Reload exactly once after early-document injection. This preserves the
        # signed-in profile, upgrades a non-configurable guard from an earlier
        # run, and patches transports before app initialization.
        cdp('Page.reload', ignoreCache=False)
        wait_until_stable()
        ensure_guard()
    else:
        ensure_guard()
        goto_url(BASE + '/dashboard/plant')
        wait_until_stable()
        ensure_guard()
    require_local_url(page_info()['url'], 'initial-local-page')

    while queued_routes and len(visited_routes) < MAX_ROUTES and not auth_required:
        route = queued_routes.pop(0)
        queued_route_keys.discard(route)
        if route in visited_routes:
            continue
        visited_routes.add(route)
        try:
            goto_route(route)
            check_fixed_regressions(route)
            discover_links()
            if route.split('?')[0] == '/dashboard/plant':
                test_dashboard_hide_show()
            test_visible_forms(reason='route-form')
            click_safe_controls_on_route(route)
            discover_links()
        except RuntimeError as exc:
            if str(exc) in {'AUTH_REQUIRED', 'EXTERNAL_ORIGIN'}:
                break
            emit('route-exception', route=sanitized_path(BASE + route), error=type(exc).__name__)
            capture_problem(f'route-exception-{sanitized_path(BASE + route)}')

    if not auth_required:
        goto_route('/dashboard/plant', label='final-safe-page')
        final_guard = guard_snapshot()
        emit(
            'summary',
            routesVisited=len(visited_routes),
            routesQueuedRemaining=len(queued_routes),
            controlsDiscovered=(
                sum(1 for item in events if item['kind'] == 'control-click')
                + sum(1 for item in events if item['kind'] == 'control-skipped')
            ),
            controlsClicked=sum(1 for item in events if item['kind'] == 'control-click'),
            controlsSkipped=sum(1 for item in events if item['kind'] == 'control-skipped'),
            formsOpened=sum(1 for item in events if item['kind'] == 'form-start'),
            formsResetWithoutSubmit=sum(1 for item in events if item['kind'] == 'form-finish'),
            formFieldsTested=sum(1 for item in events if item['kind'] in {'form-field', 'form-toggle', 'form-select'}),
            selectOptionsTested=sum(item.get('optionsTested', 0) for item in events if item['kind'] == 'form-select'),
            dashboardToggles=sum(1 for item in events if item['kind'] == 'dashboard-toggle'),
            blocked=blocked_all,
            transportGuardCoverage=['fetch', 'xhr', 'sendBeacon', 'form-submit', 'production-websocket', 'websocket-send', 'external-anchor', 'window.open'],
            forbiddenRequestsActuallySent='not-independently-verified',
        )
finally:
    stopped = stop_recording()
    collect_guard_blocks()
    RECORDING_PATH.write_text(json.dumps({
        'runId': RUN_ID,
        'recordingName': RECORDING_NAME,
        'path': str(stopped),
        'status': 'stopped',
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    emit('recording-stopped', path=str(stopped))
