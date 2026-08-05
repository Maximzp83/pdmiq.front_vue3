# Программа полного read-only тестирования проекта через Browser Use

Ниже находится готовое задание для Browser Use CLI. Оно тестирует все доступные текущему пользователю разделы локального приложения, но технически блокирует любые `POST`, `PUT`, `PATCH` и `DELETE` запросы.

---

@Browser Используй установленный Browser Use CLI 3.0 для полного read-only тестирования локального проекта.

## Цель

Проверить все доступные текущей авторизованной сессии страницы, разделы, вложенные представления и безопасные интерактивные элементы приложения:

```text
http://localhost:5173
```

Тест должен быть исчерпывающим для доступного UI, но не должен создавать, изменять или удалять серверные данные.

## Обязательный порядок запуска

1. Первой командой выполни:

   ```bash
   browser-use skill show
   ```

2. Полностью прочитай вывод и следуй актуальным инструкциям установленного skill.
3. До первой браузерной проверки вызови `start_recording(...)`, сохрани точный возвращённый путь и обязательно вызови `stop_recording()` после финальной проверки.
4. Получи список вкладок через `list_tabs()`.
5. Если существует вкладка с URL, начинающимся с `http://localhost:5173`, используй её через `switch_tab(...)` и не создавай дубликат.
6. Если такой вкладки нет, создай ровно одну новую вкладку. Для безопасной первоначальной загрузки сначала открой `about:blank`, установи описанный ниже read-only guard, затем перейди на `http://localhost:5173`.
7. Не закрывай вкладку и не выходи из существующей авторизованной сессии после теста.

## Обязательный исполняемый сценарий

Для полного запуска используй гибридный orchestrator; он сам выполняет `browser-use skill show`, запускает ровно один browser worker и два параллельных static worker:

```bash
python3 qa/test-plans/hybrid-read-only-run.py \
  --publish-report qa/reports/full-project-read-only-test.md
```

Подробности artifact contract и static-only dry-run: `qa/test-plans/hybrid-read-only-browser-test.md`. Напрямую `browser-use < ...` запускай только для диагностики самого browser worker, не для канонического полного теста.

## Безусловные ограничения

- Не изменяй исходный код проекта.
- Не изменяй конфигурацию приложения.
- Не создавай, не обновляй и не удаляй серверные данные.
- Запрещено отправлять API-запросы с методами `POST`, `PUT`, `PATCH` и `DELETE`.
- Не отправляй формы, способные изменить данные.
- Не нажимай `SAVE`, `SUBMIT`, `DELETE`, `REMOVE`, `IMPORT`, `UPLOAD`, `START`, `APPROVE`, `DENY`, `REJECT`, `COMPLETE`, `CHANGE STATUS`, `RESET`, `REBASELINE`, `DETACH`, `SEND COMMAND` и аналогичные изменяющие действия.
- `ADD`, `CREATE`, `NEW` и `EDIT` разрешены только когда действие открывает локальную форму/модальное окно и само по себе не отправляет изменяющий запрос. Открытую форму нужно протестировать и закрыть/перезагрузить без сохранения.
- `Close`/иконка `×` разрешена только как закрытие диалога или drawer. `Close Work Order`, `Open Work Order` и любые изменения статуса запрещены.
- Не выполняй drag-and-drop/reorder.
- Не загружай файлы и не запускай импорт.
- Не запускай экспорт или генерацию отчёта, если заранее не доказано, что это чистый `GET`; при сомнении пометь действие `not tested`.
- Не сохраняй изменения профиля, MFA, телефона, пароля, прав, настроек или API credentials. Password/MFA/credentials не заполняй даже локально.
- Не выходи из сессии.
- Не открывай production UI или production API.
- Не читай и не сохраняй cookies, значения `localStorage`/`sessionStorage`, заголовки `Authorization`, request/response bodies, токены, пароли или MFA-коды.
- В отчёте разрешено сохранять только HTTP-метод и URL без query/hash; заголовки и тела запрещены.
- Не используй production-хосты, включая `app.industrialmatrix.com` и `api.industrialmatrix.tools`.

## Обязательный read-only guard

Единственный актуальный и исполняемый источник guard — `qa/test-plans/browser-read-only-guard.js`. Hybrid manifest сохраняет его SHA-256. До любых кликов, кроме выбора существующей вкладки, browser worker устанавливает этот файл одновременно:

- в текущий document через `js(READ_ONLY_GUARD_JS)`;
- для последующих document/navigation через `Page.addScriptToEvaluateOnNewDocument`.

Ниже сохранена историческая копия только для контекста старого плана. **Не исполняй и не копируй её:** она может отставать от канонического файла, включая WebSocket и production-host protections.

```javascript
(() => {
  if (window.__qaReadOnlyGuard && window.__qaReadOnlyGuard.installed) {
    return window.__qaReadOnlyGuard.snapshot();
  }

  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
  const EXPECTED_LOCAL_ORIGIN = 'http://localhost:5173';
  const PRODUCTION_HOSTS = new Set([
    'app.industrialmatrix.com',
    'industrialmatrix.com',
    'www.industrialmatrix.com',
    'newcharts.industrialmatrix.com',
    'industrialmatrix.tools',
    'www.industrialmatrix.tools',
    'api.industrialmatrix.tools',
  ]);

  const state = {
    installed: true,
    allowedCount: 0,
    blocked: [],
  };

  const normalizeMethod = (method) => String(method || 'GET').toUpperCase();

  const parseUrl = (value) => {
    try {
      return new URL(String(value || ''), window.location.href);
    } catch {
      return null;
    }
  };

  const sanitizedUrl = (value) => {
    const parsed = parseUrl(value);
    return parsed ? `${parsed.origin}${parsed.pathname}` : '[unparseable-url]';
  };

  const isProductionHost = (hostname) => (
    PRODUCTION_HOSTS.has(hostname)
    || hostname.endsWith('.industrialmatrix.com')
  );

  const checkRequest = (kind, methodValue, urlValue) => {
    const method = normalizeMethod(methodValue);
    const parsed = parseUrl(urlValue);
    const unsafeMethod = !SAFE_METHODS.has(method);
    const productionHost = Boolean(parsed && isProductionHost(parsed.hostname));

    if (unsafeMethod || productionHost) {
      state.blocked.push({
        at: new Date().toISOString(),
        kind,
        method,
        url: sanitizedUrl(urlValue),
        reason: unsafeMethod && productionHost
          ? 'unsafe-method-and-production-host'
          : unsafeMethod
            ? 'unsafe-method'
            : 'production-host',
      });
      return false;
    }

    state.allowedCount += 1;
    return true;
  };

  const originalFetch = window.fetch;
  window.fetch = function guardedFetch(input, init = {}) {
    const method = init.method || (input && input.method) || 'GET';
    const url = (input && input.url) || input;
    if (!checkRequest('fetch', method, url)) {
      return Promise.reject(new DOMException('Blocked by QA read-only guard', 'AbortError'));
    }
    return originalFetch.apply(this, arguments);
  };

  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function guardedOpen(method, url, ...rest) {
    this.__qaReadOnlyRequest = { method: normalizeMethod(method), url };
    return originalXhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function guardedSend() {
    const request = this.__qaReadOnlyRequest || { method: 'GET', url: window.location.href };
    if (!checkRequest('xhr', request.method, request.url)) {
      throw new DOMException('Blocked by QA read-only guard', 'AbortError');
    }
    return originalXhrSend.apply(this, arguments);
  };

  const originalBeacon = navigator.sendBeacon && navigator.sendBeacon.bind(navigator);
  if (originalBeacon) {
    navigator.sendBeacon = function guardedBeacon(url) {
      if (!checkRequest('sendBeacon', 'POST', url)) return false;
      return originalBeacon.apply(this, arguments);
    };
  }

  const blockFormSubmit = (kind, form) => {
    state.blocked.push({
      at: new Date().toISOString(),
      kind,
      method: normalizeMethod((form && form.method) || 'GET'),
      url: sanitizedUrl((form && form.action) || window.location.href),
      reason: 'form-submit-disabled',
    });
  };

  HTMLFormElement.prototype.submit = function guardedSubmit() {
    blockFormSubmit('form.submit', this);
  };

  if (HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function guardedRequestSubmit() {
      blockFormSubmit('form.requestSubmit', this);
    };
  }

  document.addEventListener('submit', event => {
    blockFormSubmit('form.event', event.target);
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  document.addEventListener('click', event => {
    const target = event.target;
    const submitter = target && typeof target.closest === 'function'
      ? target.closest('button[type="submit"],input[type="submit"],input[type="image"]')
      : null;
    if (!submitter) return;
    blockFormSubmit('form.submitter-click', submitter.form);
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  const blockExternalNavigation = (kind, urlValue) => {
    const parsed = parseUrl(urlValue);
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) return false;
    if (parsed.origin === EXPECTED_LOCAL_ORIGIN) return false;

    state.blocked.push({
      at: new Date().toISOString(),
      kind,
      method: 'GET',
      url: sanitizedUrl(urlValue),
      reason: isProductionHost(parsed.hostname) ? 'production-host' : 'external-navigation',
    });
    return true;
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    const anchor = target && typeof target.closest === 'function'
      ? target.closest('a[href]')
      : null;
    if (anchor && blockExternalNavigation('anchor-navigation', anchor.href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  const originalWindowOpen = window.open;
  window.open = function guardedWindowOpen(url) {
    if (blockExternalNavigation('window.open', url)) return null;
    return originalWindowOpen.apply(this, arguments);
  };

  const guard = {
    installed: true,
    snapshot: () => JSON.parse(JSON.stringify(state)),
  };

  Object.defineProperty(window, '__qaReadOnlyGuard', {
    value: guard,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  return guard.snapshot();
})()
```

Пример установки через Browser Use:

```python
cdp('Page.addScriptToEvaluateOnNewDocument', source=READ_ONLY_GUARD_JS)
print(js(READ_ONLY_GUARD_JS))
```

Правила guard:

1. Перед каждым действием проверь `window.__qaReadOnlyGuard?.installed === true`.
2. После каждого действия получи `window.__qaReadOnlyGuard.snapshot()` и сравни `blocked` с предыдущим состоянием.
3. Если guard исчез после полной навигации, не кликай дальше: сначала установи его повторно.
4. Если запрос заблокирован, не повторяй действие и не пытайся обойти guard.
5. Заблокированный инфраструктурный POST, например `/broadcasting/auth`, означает `not tested` для зависящей от него функциональности, а не разрешение на исключение.
6. Не выводи и не сохраняй request headers или body. URL в guard уже очищен от query и hash.
7. Если обнаружен фактически отправленный `POST`/`PUT`/`PATCH`/`DELETE` или запрос к production, немедленно останови тест и сообщи об этом как `blocker`.

## Метод проверки каждой страницы

Для каждого доступного маршрута:

1. Используй accessibility tree для поиска ссылок, кнопок, вкладок, заголовков и полей.
2. Клики выполняй по координатам AX-node. Если элемент вне viewport, сначала прокрути его через `DOM.scrollIntoViewIfNeeded`.
3. После перехода вызови `wait_for_load()`; для SPA дополнительно дождись стабилизации видимых loaders, но не жди бесконечно.
4. Убедись, что URL остаётся локальным и начинается с `http://localhost:5173`.
5. Проверь:
   - `document.readyState === 'complete'`;
   - осмысленный title страницы;
   - основной заголовок или однозначно идентифицируемый главный контент;
   - breadcrumbs/back navigation;
   - видимые меню, вкладки, таблицы, карточки, графики или корректное empty state;
   - отсутствие blank screen, 404 на ожидаемом маршруте и сломанной вёрстки;
   - отсутствие видимых error alerts, exception messages и stack traces;
   - отсутствие loader/spinner/progressbar дольше 10 секунд;
   - реакцию безопасных ссылок, tabs, accordion, pagination, sort и фильтров;
   - отсутствие новой записи в `guard.blocked` после безопасного действия.
6. Если данные отсутствуют, корректное empty state является `passed`; отсутствие и данных, и empty state — `failed`.
7. Для таблицы проверь первую и последнюю доступную страницу пагинации, если это не инициирует запрещённый метод.
8. Для фильтра или поиска используй только неперсистентное значение, затем очисти его. Если действие пытается отправить запрещённый метод, guard должен его заблокировать, а сценарий получает `not tested`.
9. Открывай details/preview только через очевидную локальную read-only ссылку или иконку просмотра.
10. Составь inventory всех видимых уникальных ссылок, кнопок, tabs, accordion, pagination, фильтров и toggle-контролов. Нажми каждый безопасный уникальный контрол хотя бы один раз и проверь видимую реакцию, URL/active/expanded state, alerts, loaders и guard delta.
11. Одинаковые sidebar-ссылки можно дедуплицировать по сочетанию `href + label + semantic class`; разные карточки/контролы с одним URL считаются отдельными, если у них отличаются label или назначение.
12. Перед кликом классифицируй контрол. Если label, `type`, href, CSS/context или связанная форма предполагают `POST/PUT/PATCH/DELETE`, file operation, command или изменение статуса — не нажимай и запиши конкретную причину пропуска.
13. Не нажимай `button[type=submit]`, `input[type=submit]`, `input[type=image]` и не используй Enter для отправки формы. Усиленный guard обязан блокировать любой submit независимо от HTTP-метода.
14. Формы `/new`, `/:id` и безопасные create/edit modal нужно не только открыть, но и протестировать поля по правилам раздела «Формы и destructive controls». Save/Submit не нажимать.
15. Если после предположительно безопасного клика неожиданно появился native `alert/confirm/prompt/beforeunload`, не подтверждай его: dismiss через CDP, пометь контрол `not tested: unexpected native dialog` и вернись на исходный локальный route.
16. Технические caps сценария (`250` routes, `500` controls на route) нужны только против циклического UI. Если любой cap достигнут, явно отметь покрытие как неполное и не заявляй, что нажаты все контролы.

## Полное покрытие проекта

Сначала составь runtime-список реально видимых пунктов меню. Проверяй все доступные текущей роли элементы; скрытые или запрещённые permission-guard маршруты отмечай `not tested`.

### 1. Общий layout

- Логотип и переход по нему, только если ссылка локальная и безопасная.
- Header, приветственный блок, профиль без редактирования.
- Sidebar: раскрытие/сворачивание групп и прокрутка.
- Breadcrumbs и `Back`.
- Локальная 404-страница с последующим возвратом, если это не влияет на сессию.
- Не нажимать logout.

### 2. Predictive Maintenance

- `/dashboard` и `/dashboard/plant`.
- Dashboard-вкладки после безопасного выбора уже доступного plant: Machines, Assets, Equipments, Production Lines, Utilities.
- `/success-dashboard/main`.
- Доступные read-only вкладки Customer Success: Meeting Tracker и ROI One Pager.
- `/corporate/main`.
- `/controllers`.
- `/processes`.

### 3. Dashboard details и аналитика

Проверяй только через существующие read-only links/details и реальные идентификаторы из UI:

- Plant details.
- Machine details.
- Asset details.
- Production Line details.
- Equipment details и доступные вкладки Main, PDM/statistics, Multi View, Quote, Service.
- Sensors list, NCD sensors, statistics, FFT и Multi View, если доступны через UI.
- Process details, Dashboard и Logs.
- На графиках проверяй рендер, легенду, tooltip/диапазоны и безопасные tabs; не меняй thresholds, RPM, formulas, rules или sensor settings.

#### Обязательная проверка Plant Dashboard Hide/Show

На `/dashboard/plant` сначала безопасно выбери существующий plant с данными. Затем отдельно, с привязкой к DOM-scope, проверь:

1. Assets: `.assets-list`.
2. Machines: `.machines-list`.
3. Production Lines: `.production_lines-list`.

Для каждой секции:

1. Убедись, что заголовок и `.card-content` видимы, а toggle имеет текст `Hide`.
2. Нажми только scoped-контрол `<scope> .toggle-list-button .absolute.stretch.pointer`.
3. Проверь, что `.card-content` скрыт/удалён, текст сменился на `Show`, URL не ушёл с localhost и guard delta пуст.
4. Нажми тот же scoped-контрол повторно.
5. Проверь, что `.card-content` снова видим, текст вернулся к `Hide`, данные/фильтры не были отправлены на изменение и guard delta пуст.
6. Зафиксируй три самостоятельных результата: Assets, Machines, Production Lines. Если секция отсутствует из-за отсутствия plant/data — `not tested` с точной причиной, а не общий `passed` Dashboard.

#### Регрессии после исправлений 401 и Import

- На каждой найденной PDM/statistics/FFT/Multi View странице проверь отсутствие `401`, завершение всех `Chart Loading...` не позднее 10 секунд и наличие отрисованного chart либо однозначного empty state. Для chart дополнительно проверь series/legend/tooltip, если есть точки.
- На `/maintenance-import` не должно быть `Text Missing` в title или кнопках.
- На `/plant-import` и `/settings/import/logs` не должен отображаться сырой ключ `item_types`.
- На `/settings/import/history` не должны отображаться необработанные PHP class names, `/var/www/html/...` и stack/backend trace. Историческая ошибка, всё ещё видимая пользователю, считается `failed`, даже если новый импорт уже исправлен.
- Каждую неуспешную регрессионную проверку сохрани как отдельный screenshot.

### 4. System

- `/companies` и безопасная read-only info/details страница одной компании.
- `/plants` и read-only details одного plant.
- `/users`.
- `/teams`, если пункт доступен.
- `/user-roles`.
- `/distributors`.
- `/plants-vendors`.
- `/profile`: безопасные непарольные поля можно изменить только локально для проверки и сразу сбросить reload-навигацией; password/MFA/credentials не заполнять и ничего не сохранять.
- `/settings` и все доступные read-only подразделы:
  - Lube Types;
  - Bearings;
  - Industrial Services;
  - Banner V2 Subtypes;
  - Faults и NCD Faults;
  - Custom Formulas только просмотр;
  - Backend Registers только просмотр, без command;
  - Statistics только просмотр, без export;
  - Import Logs, Master и History только просмотр, без upload/import/repeat/delete.

### 5. CMMS

- `/maintenance/work-orders`.
- `/maintenance/logs`.
- `/maintenance-requests`.
- `/requisitions`, если доступен.
- `/roi-calculator`, если доступен; не сохранять расчёт.
- `/task-procedures`.
- `/maintenance-categories`.
- `/parts`.
- Read-only details/preview одной существующей записи каждого типа, если имеется очевидная кнопка просмотра.
- Import routes можно открыть только для проверки layout; не выбирать файл и не запускать import/revert.
- Не менять work-order status и не нажимать Close/Open/In Work/Complete/Approve/Deny/Take/Reset.

### 6. Asset Management

- `/brands`.
- `/brand-models` и безопасная details-страница одного part number.
- `/equipment-types`.
- `/equipment-types-categories`.
- `/applications`.
- `/store-rooms` и read-only items/details существующего storeroom.
- Не создавать, не сохранять изменения и не удалять элементы; create/edit формы можно открыть и заполнить только локально по правилам ниже.

### 7. Формы и destructive controls

- Безопасно открывай `/new`, edit-страницы и create/edit modal через `Add/Create/New/Edit`, если сам клик выполняет только локальную навигацию или открытие формы.
- Для каждого видимого, enabled и writable поля проверь focus, ввод/изменение, blur и отображение локальной валидации без submit.
- Используй только тестовые неперсистентные значения: `QA read-only check`, `qa.readonly@example.invalid`, тестовый телефон, безопасную дату/время и число внутри `min/max`.
- Не выводи в лог исходные значения полей. После проверки восстанови исходное значение, а в конце формы перезагрузи текущий локальный GET-route, чтобы отбросить клиентские изменения.
- Не заполняй password, MFA, token, credentials, API key и file inputs.
- Не изменяй поля, которые могут сохраняться немедленно или управляют thresholds, RPM, formulas, permissions, commands, status, archive, rebaseline или backend registers. Пометь их `not tested: sensitive-or-live-write-field`.
- Checkbox/radio/switch переключай и возвращай в исходное состояние, если это обычное поле формы или GET-фильтр. Не переключай status/permission/archive/command controls.
- Для каждого select/combobox открой список и последовательно проверь разные enabled options, но максимум **10 вариантов на один select**. После каждого выбора проверь зависимые поля, alerts/loaders и guard delta.
- Для native select используй реальный click + keyboard selection; для Element Plus/кастомного select используй AX-option + coordinate click. Не меняй значение через прямое присваивание DOM property.
- Если выбор/ввод создаёт blocked guard request, не повторяй действие: перезагрузи форму через локальный GET и поставь `not tested` для данного поля.
- Required-валидацию проверяй через focus → очистка → blur. Не запускай submit-валидацию.
- `Cancel`, `Back`, dialog `×`, tabs/accordion внутри формы и локальное добавление повторяемого незаполненного блока разрешены, если classifier не находит server-side effect. После этого форма всё равно должна быть сброшена reload-навигацией.
- Не нажимай кнопки сохранения или изменения данных.
- Для каждой пропущенной кнопки укажи `not tested` и конкретную причину: `would send POST`, `would send PUT/PATCH`, `would send DELETE`, `form submit`, `unknown side effect`, `file upload`, `download/export`, `WebSocket command` и т. п.

## Безопасные и запрещённые действия

Разрешены при установленном guard:

- локальные navigation links;
- view/details/preview;
- `Add/Create/New/Edit`, если они только открывают локальную форму и не отправляют запрос;
- tabs и accordion;
- pagination и sort;
- неперсистентные filters/search;
- открытие и закрытие read-only modal;
- заполнение и очистка безопасных полей без submit;
- до 10 вариантов каждого безопасного select/combobox с последующим reload формы;
- checkbox/radio/switch обычной формы или GET-фильтра с восстановлением состояния;
- `Show/Hide`, expand/collapse, list/grid, дополнительные фильтры и `Clear filters`;
- изменение диапазона отображения графика;
- Back/Cancel после локальной проверки полей; несохранённые значения затем обязательно сбросить reload-навигацией.

Запрещены даже при установленном guard:

- Save/Submit/Delete/Remove и любой submit-control;
- изменение статуса;
- status actions Approve/Deny/Complete/Close/Open/Take/Reset; dialog/drawer close остаётся разрешённым;
- detach/rebaseline/unlock/generate/send command;
- drag-and-drop/reorder;
- import/upload;
- изменение настроек, thresholds, formulas, permissions, credentials;
- logout;
- действия с неизвестным side effect.

## Авторизация и остановка

Если появляется форма входа, password prompt, MFA/consent или неоднозначный выбор аккаунта:

1. Немедленно останови дальнейшие переходы.
2. Не вводи пароль, токен или MFA-код.
3. Не очищай сессию и не нажимай logout.
4. Попроси пользователя авторизоваться вручную.
5. Продолжай только после подтверждения пользователя и повторной проверки guard.

## Скриншоты

- Делай screenshot каждой найденной проблемы через `capture_screenshot(...)`.
- Сохраняй только в:

  ```text
  qa/reports/screenshots/full-project-read-only/
  ```

- Имена файлов: `<section>-<route>-<short-problem>.png`.
- Не делай screenshots страниц с отображёнными секретами, токенами, API credentials, паролями или MFA-кодами.
- Для проблемы ниже fold сначала прокрути проблемный элемент в viewport.
- После сохранения визуально проверь каждый PNG.

## Отчёт

Сохрани итог в:

```text
qa/reports/full-project-read-only-test.md
```

Не перезаписывай `qa/reports/smoke-test.md`.

Для каждого сценария укажи:

- ID проверки;
- раздел;
- проверенный маршрут;
- проверенный сценарий;
- статус: `passed`, `failed` или `not tested`;
- фактический результат;
- найденные проблемы;
- severity: `blocker`, `critical`, `major` или `minor` только для проблемы, иначе `—`;
- шаги воспроизведения;
- путь к screenshot или `—`;
- заблокированные guard запросы в формате `METHOD origin/path` или `—`;
- причина `not tested`, если применимо.

Не включай в отчёт:

- cookies;
- токены;
- пароли и MFA-коды;
- request/response headers;
- request/response bodies;
- query-параметры, способные содержать секреты;
- содержимое `localStorage`/`sessionStorage`.

В конце отчёта укажи:

- сколько маршрутов обнаружено;
- сколько маршрутов посещено;
- сколько проверок запланировано;
- сколько проверок выполнено;
- сколько прошло;
- сколько завершилось ошибкой;
- сколько получило `not tested`;
- какие permission-guard страницы недоступны;
- какие действия намеренно пропущены как изменяющие данные;
- сколько запросов заблокировал guard, с группировкой только по HTTP-методу и очищенному pathname;
- сколько уникальных кнопок/ссылок обнаружено, нажато и пропущено;
- сколько форм открыто, сколько безопасных полей изменено/восстановлено и сколько полей пропущено;
- для каждого select — число проверенных options (не больше 10), а также общий итог;
- отдельные результаты `Hide/Show` для Assets, Machines и Production Lines на `/dashboard/plant`;
- подтверждение, что фактически отправленных `POST`/`PUT`/`PATCH`/`DELETE` не обнаружено;
- что не удалось проверить;
- точный путь записи, возвращённый `start_recording(...)`.

## Завершение

1. Верни локальную вкладку на безопасную стартовую страницу `/dashboard/plant`.
2. Убедись, что форма авторизации не открыта и guard всё ещё установлен.
3. Вызови `stop_recording()` и сохрани возвращённый точный путь в отчёт.
4. Не закрывай Chrome и не завершай существующую авторизованную сессию.
5. Проверь, что изменены только QA-артефакты внутри `qa/reports/`.

---

Критерий успешного выполнения: покрыты все доступные текущей роли read-only маршруты и безопасные элементы, все запрещённые методы заблокированы guard, данные не изменены, production не использован, отчёт и screenshots сохранены без секретов.
