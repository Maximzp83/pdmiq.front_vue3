import json
import re

BASE = 'http://localhost:5173'
SHOT_DIR = '/Users/maczone/Documents/projects/pdmiq.front_vue3/qa/reports/screenshots/full-project-read-only'


def state(label):
    raw = js("""JSON.stringify((() => {
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const text=document.body?document.body.innerText:'';
      return {
        url:location.href,title:document.title,ready:document.readyState,
        alerts:[...document.querySelectorAll('[role=alert],.el-message--error,.el-notification--error,.error-message,.alert-danger')].filter(vis).map(e=>(e.innerText||'').trim()).filter(Boolean).slice(0,5),
        loaders:[...document.querySelectorAll('[aria-busy=true],[role=progressbar],.loading,.loader,.spinner,[class*=loading],[class*=spinner]')].filter(vis).length,
        loginForm:!!document.querySelector('form[action*=login],form[action*=sign-in]')||location.pathname.startsWith('/login'),
        passwordFields:[...document.querySelectorAll('input[type=password]')].filter(vis).length,
        headings:[...document.querySelectorAll('h1,h2,h3,[role=heading]')].filter(vis).length,
        charts:[...document.querySelectorAll('.highcharts-container,.apexcharts-canvas,canvas')].filter(vis).map(e=>{const r=e.getBoundingClientRect();return {kind:e.className||e.tagName,width:Math.round(r.width),height:Math.round(r.height)}}),
        series:document.querySelectorAll('.highcharts-series').length,points:document.querySelectorAll('.highcharts-point').length,
        flags:{stack:text.includes('/var/www/html/')||text.includes('App\\\\'),missing:text.includes('Text Missing'),untranslated:/(^|\\n)(item_types|[a-z]+(?:_[a-z]+)+)(\\n|$)/m.test(text),notFound:/Not Found\\.\\.\\./i.test(text)}
      };
    })())""")
    out=json.loads(raw);out['label']=label;print('CHECK2',json.dumps(out,ensure_ascii=False));return out


def goto(path,label):
    goto_url(BASE+path)
    try: wait_for_load(timeout=8)
    except Exception: pass
    wait(0.8)
    probe=state(label+' settle')
    if probe['loaders']: wait(7)
    out=state(label)
    if out['loginForm']:
        print('LOGIN_WALL',json.dumps({'label':label,'url':out['url']}));raise RuntimeError('LOGIN_WALL')
    return out


def hrefs():
    return json.loads(js("""JSON.stringify([...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>h.startsWith(location.origin)).map(h=>new URL(h).pathname+new URL(h).search))])"""))


def ax_click(name,roles=('button','option','combobox'),contains=False):
    for n in cdp('Accessibility.getFullAXTree').get('nodes',[]):
        role=(n.get('role')or{}).get('value','');nm=(n.get('name')or{}).get('value','').strip()
        if role in roles and ((name.lower() in nm.lower()) if contains else (name.lower()==nm.lower())) and n.get('backendDOMNodeId'):
            bid=n['backendDOMNodeId']
            try: cdp('DOM.scrollIntoViewIfNeeded',backendNodeId=bid)
            except Exception: pass
            wait(.15)
            q=cdp('DOM.getBoxModel',backendNodeId=bid)['model']['content'];x=sum(q[0::2])/4;y=sum(q[1::2])/4
            click_at_xy(x,y);wait(.7);return {'ok':True,'role':role,'name':nm,'coords':[round(x,1),round(y,1)]}
    return {'ok':False,'name':name}


def click_selector(selector):
    raw=js("""JSON.stringify((()=>{const es=[...document.querySelectorAll(%s)];for(const e of es){const s=getComputedStyle(e),r=e.getBoundingClientRect();if(s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0)return{x:r.left+r.width/2,y:r.top+r.height/2}}return null})())"""%json.dumps(selector))
    p=json.loads(raw) if raw!='null' else None
    if not p:return {'ok':False,'selector':selector}
    click_at_xy(p['x'],p['y']);wait(.7);return {'ok':True,'selector':selector,'coords':[round(p['x'],1),round(p['y'],1)]}


def chart_data_and_hover(label):
    raw=js("""JSON.stringify((()=>{
      const charts=(window.Highcharts&&Highcharts.charts?Highcharts.charts:[]).filter(Boolean);
      return charts.map((c,ci)=>({index:ci,width:c.chartWidth,height:c.chartHeight,series:c.series.map(s=>({name:s.name,visible:s.visible,values:s.points.map(p=>p.y).filter(v=>Number.isFinite(v)).slice(0,20)}))}));
    })())""")
    data=json.loads(raw)
    target_raw=js("""JSON.stringify((()=>{
      const charts=(window.Highcharts&&Highcharts.charts?Highcharts.charts:[]).filter(Boolean);
      for(const c of charts)for(const s of c.series)for(const p of s.points||[]){
        if(!Number.isFinite(p.y)||p.y<=0)continue;
        const cr=c.container.getBoundingClientRect(),a=p.shapeArgs||{};
        if(Number.isFinite(a.start)&&Number.isFinite(a.end)&&Number.isFinite(a.r)){
          const angle=(a.start+a.end)/2,r=(a.r+(a.innerR||0))/2;
          return{x:cr.left+a.x+Math.cos(angle)*r,y:cr.top+a.y+Math.sin(angle)*r,value:p.y,series:s.name};
        }
        if(p.graphic&&p.graphic.element){const r=p.graphic.element.getBoundingClientRect();if(r.width||r.height)return{x:r.left+Math.max(r.width,2)/2,y:r.top+Math.max(r.height,2)/2,value:p.y,series:s.name};}
        if(Number.isFinite(p.plotX)&&Number.isFinite(p.plotY))return{x:cr.left+c.plotLeft+p.plotX,y:cr.top+c.plotTop+p.plotY,value:p.y,series:s.name};
      }
      return null;
    })())""")
    target=json.loads(target_raw) if target_raw!='null' else None
    result={'attempted':False,'tooltip':False,'target':target}
    if target:
        cdp('Input.dispatchMouseEvent',type='mouseMoved',x=1,y=1);wait(.1)
        cdp('Input.dispatchMouseEvent',type='mouseMoved',x=target['x'],y=target['y']);wait(.6)
        tip=json.loads(js("""JSON.stringify((()=>{const es=[...document.querySelectorAll('.highcharts-tooltip,.apexcharts-tooltip')];for(const e of es){const s=getComputedStyle(e),r=e.getBoundingClientRect();if(s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0)return{visible:true,hasText:!!(e.innerText||e.textContent||'').trim()}}return{visible:false,hasText:false}})())"""))
        result={'attempted':True,'tooltip':tip['visible'],'tooltipHasText':tip['hasText'],'target':target}
    print('CHART2',json.dumps({'label':label,'data':data,'hover':result},ensure_ascii=False))
    return {'data':data,'hover':result}


tabs=list_tabs();local=[t for t in tabs if t.get('url','').startswith(BASE)]
if local:switch_tab(local[0].get('targetId')or local[0].get('target_id'))
else:new_tab(BASE+'/dashboard/plant');wait_for_load()

print('FOLLOWUP_START',json.dumps({'page':page_info(),'guard':js('window.__qaReadOnlyGuard.snapshot()')},ensure_ascii=False))

routes=[
 ('Success Meeting Tracker','/success-dashboard/meeting-tracker'),('Success ROI One Pager','/success-dashboard/roi-one-pager'),
 ('Work Orders Import','/maintenance-import'),('Plant Import','/plant-import'),('Plant Import Logs','/plant-import-logs'),('Master Import','/master-import'),
 ('RFQs','/rfqs'),('Requisitions','/requisitions'),('ROI Calculator','/roi-calculator'),
 ('Sensors','/sensors'),('NCD Sensors','/sensors/ncd'),('Equipment List','/equipments'),
 ('Item Types','/equipment-types'),('Item Type Categories','/equipment-types-categories')]
collected=[]
for label,path in routes:
    try:
        out=goto(path,label);hs=hrefs();collected+=hs
        candidates=[h for h in hs if re.search(r'/(details|info|stats|statistics|fft|multiview)(/|\\?|$)',h)]
        print('ROUTE2',json.dumps({'label':label,'status':'loaded','url':out['url'],'links':len(hs),'safeCandidates':candidates[:12]},ensure_ascii=False))
    except RuntimeError:break

# Try several existing plants to find an actual non-zero chart data point.
for plant_name in ['Calgary YYC','Region 1 Facility','Test Comissioning Plant']:
    goto('/dashboard/plant','Dashboard candidate '+plant_name)
    opened=ax_click('Select plant',roles=('combobox','button'),contains=True)
    if not opened['ok']:opened=click_selector('input[placeholder*="Select plant"],.el-select input')
    picked=ax_click(plant_name,roles=('option',)) if opened.get('ok') else {'ok':False}
    print('PLANT2',json.dumps({'plant':plant_name,'open':opened,'pick':picked},ensure_ascii=False))
    if picked.get('ok'):
        wait(2);out=goto('/dashboard/plant','Dashboard selected '+plant_name);probe=chart_data_and_hover('Dashboard '+plant_name)
        collected+=hrefs()
        if probe['hover']['attempted']:
            path=SHOT_DIR+'/dashboard-chart-tooltip-'+re.sub(r'[^a-z0-9]+','-',plant_name.lower()).strip('-')+'.png'
            capture_screenshot(path);print('SCREENSHOT2',json.dumps({'path':path},ensure_ascii=False));break

patterns=[r'^/companies/[^/]+/info',r'^/plants/[^/]+/details',r'^/production-lines/[^/]+/details',r'^/brand-models/[^/]+/details',r'^/equipments/[^/]+/details',r'^/machines/[^/]+/details',r'^/assets/[^/]+/details',r'^/processes/[^/]+/details',r'^/sensors/[^/]+/(stats|statistics|fft|multiview)']
details=[]
for h in collected:
    if any(re.search(p,h) for p in patterns) and h not in details:details.append(h)
print('DETAILS2',json.dumps({'count':len(details),'paths':details[:25]},ensure_ascii=False))
for i,path in enumerate(details[:15]):
    try:
        out=goto(path,'Follow-up detail %02d'%(i+1));chart_data_and_hover('Follow-up detail %02d'%(i+1))
    except RuntimeError:break

goto('/dashboard/plant','Follow-up final')
print('FOLLOWUP_FINAL',json.dumps({'page':page_info(),'guard':js('window.__qaReadOnlyGuard.snapshot()')},ensure_ascii=False))
