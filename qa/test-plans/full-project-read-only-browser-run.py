import json
import re

BASE = 'http://localhost:5173'
SHOT_DIR = '/Users/maczone/Documents/projects/pdmiq.front_vue3/qa/reports/screenshots/full-project-read-only'


def visible_state(label):
    data = js("""JSON.stringify((() => {
      const vis = e => {
        if (!e) return false;
        const s = getComputedStyle(e), r = e.getBoundingClientRect();
        return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
      };
      const alerts = [...document.querySelectorAll('[role=alert],.el-message--error,.el-notification--error,.error-message,.alert-danger')]
        .filter(vis).map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 5);
      const loaders = [...document.querySelectorAll('[aria-busy=true],[role=progressbar],.loading,.loader,.spinner,[class*=loading],[class*=spinner]')]
        .filter(vis).length;
      const text = document.body ? document.body.innerText : '';
      const charts = [...document.querySelectorAll('.highcharts-container,.apexcharts-canvas,canvas')]
        .filter(vis).map(e => {
          const r=e.getBoundingClientRect();
          return {kind:e.className || e.tagName, width:Math.round(r.width), height:Math.round(r.height)};
        });
      return {
        url: location.href,
        title: document.title,
        ready: document.readyState,
        alerts,
        loaders,
        password: [...document.querySelectorAll('input[type=password]')].some(vis),
        headings: [...document.querySelectorAll('h1,h2,h3,[role=heading]')].filter(vis).length,
        charts,
        highchartsSeries: document.querySelectorAll('.highcharts-series').length,
        highchartsPoints: document.querySelectorAll('.highcharts-point').length,
        flags: {
          itemTypesKey: /(^|\\n)item_types($|\\n)/m.test(text),
          missingText: text.includes('Text Missing'),
          stackTrace: text.includes('App\\\\Imports\\\\') || text.includes('/var/www/html/'),
          genericError: /(^|\\n)(500|Internal Server Error|Unhandled|TypeError|ReferenceError)(\\n|$)/i.test(text),
          loadingText: /(^|\\n)(loading|loading\\.\\.\\.|please wait)(\\n|$)/i.test(text)
        }
      };
    })())""")
    out = json.loads(data)
    out['label'] = label
    print('CHECK', json.dumps(out, ensure_ascii=False))
    return out


def wait_ready():
    try:
        wait_for_load(timeout=8)
    except Exception:
        pass
    wait(0.8)
    st = visible_state('settle-probe')
    if st['loaders'] or st['flags']['loadingText']:
        wait(7)
    return st


def goto(path, label):
    goto_url(BASE + path)
    wait_ready()
    st = visible_state(label)
    if st['password']:
        print('AUTH_REQUIRED', json.dumps({'label': label, 'url': st['url']}))
        raise RuntimeError('AUTH_REQUIRED')
    return st


def ax_nodes():
    return cdp('Accessibility.getFullAXTree').get('nodes', [])


def ax_click(names, roles=('button', 'link', 'combobox', 'tab', 'option'), contains=False):
    if isinstance(names, str):
        names = [names]
    candidates = []
    for node in ax_nodes():
        role = (node.get('role') or {}).get('value', '')
        name = (node.get('name') or {}).get('value', '').strip()
        if role not in roles or not name:
            continue
        matched = any((wanted.lower() in name.lower()) if contains else (wanted.lower() == name.lower()) for wanted in names)
        if matched and node.get('backendDOMNodeId'):
            candidates.append((node, role, name))
    if not candidates:
        return {'ok': False, 'reason': 'not found', 'names': names, 'roles': list(roles)}
    node, role, name = candidates[0]
    bid = node['backendDOMNodeId']
    try:
        cdp('DOM.scrollIntoViewIfNeeded', backendNodeId=bid)
    except Exception:
        pass
    wait(0.15)
    try:
        quad = cdp('DOM.getBoxModel', backendNodeId=bid)['model']['content']
        x = sum(quad[0::2]) / 4
        y = sum(quad[1::2]) / 4
        info = page_info()
        if not (0 <= x <= info['w'] and 0 <= y <= info['h']):
            return {'ok': False, 'reason': 'outside viewport', 'name': name, 'coords': [x, y]}
        click_at_xy(x, y)
        wait(0.6)
        return {'ok': True, 'role': role, 'name': name, 'coords': [round(x, 1), round(y, 1)]}
    except Exception as exc:
        return {'ok': False, 'reason': type(exc).__name__, 'name': name}


def click_dom_rect(selector):
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const e=[...document.querySelectorAll(%s)].find(vis);
      if(!e)return null;
      const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,text:(e.innerText||e.value||e.getAttribute('aria-label')||'').trim()};
    })())""" % json.dumps(selector))
    data = json.loads(raw) if raw != 'null' else None
    if not data:
        return {'ok': False, 'reason': 'not found', 'selector': selector}
    click_at_xy(data['x'], data['y'])
    wait(0.7)
    return {'ok': True, 'selector': selector, 'text': data['text'], 'coords': [round(data['x'], 1), round(data['y'], 1)]}


def safe_hrefs():
    raw = js("""JSON.stringify([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>h.startsWith(location.origin)).map(h=>new URL(h).pathname+new URL(h).search))""")
    return list(dict.fromkeys(json.loads(raw)))


def capture(name):
    path = SHOT_DIR + '/' + name
    result = capture_screenshot(path)
    print('SCREENSHOT', json.dumps({'path': path, 'result': str(result)}, ensure_ascii=False))
    return path


def guard_snapshot():
    try:
        return js('window.__qaReadOnlyGuard.snapshot()')
    except Exception:
        return {'installed': False, 'allowedCount': None, 'blocked': []}


def chart_probe(label):
    state = visible_state(label + '-chart')
    point = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>=0&&r.height>=0};
      const choices=[...document.querySelectorAll('.highcharts-point,.highcharts-series path,.apexcharts-series path')].filter(vis);
      for(const e of choices){const r=e.getBoundingClientRect(); if(r.width||r.height){return {x:r.left+Math.max(r.width,2)/2,y:r.top+Math.max(r.height,2)/2}}}
      return null;
    })())""")
    p = json.loads(point) if point != 'null' else None
    hover = {'attempted': False, 'tooltip': False}
    if p and 0 <= p['x'] <= page_info()['w'] and 0 <= p['y'] <= page_info()['h']:
        cdp('Input.dispatchMouseEvent', type='mouseMoved', x=p['x'], y=p['y'])
        wait(0.5)
        hover = json.loads(js("""JSON.stringify((() => {
          const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
          const t=[...document.querySelectorAll('.highcharts-tooltip,.apexcharts-tooltip')].find(vis);
          return {attempted:true,tooltip:!!t,tooltipHasText:!!(t&&(t.innerText||t.textContent||'').trim())};
        })())"""))
    print('CHART', json.dumps({'label': label, 'charts': state['charts'], 'series': state['highchartsSeries'], 'points': state['highchartsPoints'], 'hover': hover}, ensure_ascii=False))


tabs = list_tabs()
local_tabs = [t for t in tabs if t.get('url', '').startswith(BASE)]
if local_tabs:
    switch_tab(local_tabs[0].get('targetId') or local_tabs[0].get('target_id'))
else:
    new_tab(BASE + '/dashboard/plant')
    wait_for_load()

print('RUN_START', json.dumps({'page': page_info(), 'guard': guard_snapshot()}, ensure_ascii=False))

# Reproduce and capture the already-observed presentation/localization issues.
goto('/distributors', 'issue-distributors')
if visible_state('issue-distributors-confirm')['flags']['missingText']:
    capture('distributors-locations-text-missing.png')

goto('/settings/import/logs', 'issue-settings-import')
if visible_state('issue-settings-import-confirm')['flags']['itemTypesKey']:
    capture('settings-import-untranslated-item-types.png')

goto('/settings/import/history', 'issue-import-history')
if visible_state('issue-import-history-confirm')['flags']['stackTrace']:
    capture('settings-import-history-backend-trace.png')

# Read-only routes that are not all exposed as direct sidebar links.
routes = [
    ('Profile', '/profile'),
    ('Success Meeting Tracker', '/success-dashboard/meeting-tracker'),
    ('Success ROI One Pager', '/success-dashboard/roi-one-pager'),
    ('Work Orders Import', '/maintenance-import'),
    ('Plant Import', '/plant-import'),
    ('Plant Import Logs', '/plant-import-logs'),
    ('Master Import', '/master-import'),
    ('RFQs', '/rfqs'),
    ('Requisitions', '/requisitions'),
    ('ROI Calculator', '/roi-calculator'),
    ('Sensors', '/sensors'),
    ('NCD Sensors', '/sensors/ncd'),
    ('Equipment List', '/equipments'),
    ('Item Types', '/equipment-types'),
    ('Item Type Categories', '/equipment-types-categories'),
]

all_hrefs = []
for label, path in routes:
    try:
        st = goto(path, label)
        hrefs = safe_hrefs()
        all_hrefs.extend(hrefs)
        print('ROUTE_LINKS', json.dumps({'label': label, 'url': st['url'], 'count': len(hrefs), 'safeCandidates': [h for h in hrefs if re.search(r'/(details|info|stats|statistics|fft|multiview)(/|\\?|$)', h)][:10]}, ensure_ascii=False))
    except RuntimeError:
        break

# Select an existing plant without changing server data, then exercise dashboard tabs.
dashboard = goto('/dashboard/plant', 'Dashboard Plant before selection')
selector = ax_click(['Select plant'], roles=('combobox', 'button'), contains=True)
if not selector['ok']:
    selector = click_dom_rect('input[placeholder*="Select plant"],.el-select input,.select-plant input')
print('PLANT_SELECTOR', json.dumps(selector, ensure_ascii=False))
if selector.get('ok'):
    option_names = []
    for node in ax_nodes():
        role = (node.get('role') or {}).get('value', '')
        name = (node.get('name') or {}).get('value', '').strip()
        if role == 'option' and name and not any(x in name.lower() for x in ['select plant', 'create', 'add']):
            option_names.append(name)
    print('PLANT_OPTIONS', json.dumps({'count': len(option_names), 'names': option_names[:8]}, ensure_ascii=False))
    picked = ax_click(option_names[0], roles=('option',)) if option_names else click_dom_rect('.el-select-dropdown__item:not(.is-disabled)')
    print('PLANT_PICK', json.dumps(picked, ensure_ascii=False))
    if picked.get('ok'):
        wait(2)

dashboard_tabs = [
    ('Dashboard Plant', '/dashboard/plant'),
    ('Dashboard Machines', '/dashboard/machines'),
    ('Dashboard Assets', '/dashboard/assets'),
    ('Dashboard Equipments', '/dashboard/equipments'),
    ('Dashboard Production Lines', '/dashboard/production-lines'),
    ('Dashboard Utilities', '/dashboard/utilities'),
]
for label, path in dashboard_tabs:
    try:
        st = goto(path, label)
        hrefs = safe_hrefs()
        all_hrefs.extend(hrefs)
        chart_probe(label)
        print('DASHBOARD_LINKS', json.dumps({'label': label, 'count': len(hrefs), 'detailCandidates': [h for h in hrefs if '/details' in h][:10]}, ensure_ascii=False))
    except RuntimeError:
        break

# Validate a populated CMMS chart, including hover/tooltip behavior.
goto('/maintenance/logs', 'Maintenance Logs chart page')
chart_probe('Maintenance Logs top-breakdowns')

# Safe pagination: move one page and return. No form submission or data mutation.
goto('/controllers', 'Controllers before pagination')
before_page = js("""(() => { const e=document.querySelector('.el-pagination .is-active,[aria-current=page]'); return e ? (e.innerText||e.textContent||'').trim() : ''; })()""")
next_click = ax_click('Go to next page', roles=('button',))
wait(1)
after_page = js("""(() => { const e=document.querySelector('.el-pagination .is-active,[aria-current=page]'); return e ? (e.innerText||e.textContent||'').trim() : ''; })()""")
prev_click = ax_click('Go to previous page', roles=('button',)) if next_click.get('ok') else {'ok': False, 'reason': 'next unavailable'}
wait(0.7)
print('PAGINATION', json.dumps({'before': before_page, 'next': next_click, 'after': after_page, 'return': prev_click}, ensure_ascii=False))

# Visit unique safe detail pages discovered through actual rendered links.
safe_patterns = [
    r'^/companies/[^/]+/info(?:\\?|$)',
    r'^/plants/[^/]+/details(?:\\?|$)',
    r'^/production-lines/[^/]+/details(?:\\?|$)',
    r'^/brand-models/[^/]+/details(?:\\?|$)',
    r'^/equipments/[^/]+/details(?:/main)?(?:\\?|$)',
    r'^/machines/[^/]+/details(?:\\?|$)',
    r'^/assets/[^/]+/details(?:\\?|$)',
    r'^/processes/[^/]+/details(?:/dashboard)?(?:\\?|$)',
    r'^/sensors/[^/]+/(?:stats|statistics|fft|multiview)(?:/|\\?|$)',
]
detail_candidates = []
for href in all_hrefs:
    if any(re.search(pattern, href) for pattern in safe_patterns):
        clean = href.split('#')[0]
        if clean not in detail_candidates:
            detail_candidates.append(clean)

print('DETAIL_CANDIDATES', json.dumps({'count': len(detail_candidates), 'paths': detail_candidates[:20]}, ensure_ascii=False))
for idx, path in enumerate(detail_candidates[:12]):
    try:
        st = goto(path, 'Detail %02d' % (idx + 1))
        chart_probe('Detail %02d' % (idx + 1))
    except RuntimeError:
        break

# Capture generic dashboard context for the persistent title/heading issues.
goto('/dashboard/plant', 'Dashboard final')
capture('dashboard-title-and-structure-context.png')
final_guard = guard_snapshot()
print('RUN_FINAL', json.dumps({'page': page_info(), 'guard': final_guard}, ensure_ascii=False))
