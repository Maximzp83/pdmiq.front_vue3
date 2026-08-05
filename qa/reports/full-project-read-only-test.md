# Full project read-only browser test

Дата: 2026-08-05  
URL: `http://localhost:5173`  
Инструмент: Browser Use CLI 3.0, подключённый Chrome  
Режим: только чтение

## Итог

Статус тестирования: **failed** — основные разделы приложения доступны, но PDM-графики для части датчиков не загружаются и показывают повторяющиеся ошибки `401`. Также найдены проблемы локализации, раскрытие внутренней backend-диагностики и сломанное изображение.

- Запланировано проверок: **25**.
- Выполнено проверок: **21**.
- Passed: **13**.
- Failed: **8**.
- Not tested: **4**.
- Blocker: **0**.
- Critical: **0**.
- Major: **2**.
- Minor: **6**.

## Безопасность выполнения

- Перед началом выполнена команда `browser-use skill show`; тест выполнялся по установленным инструкциям Browser Use.
- Использовалась существующая вкладка `localhost`, когда она была доступна. Новая вкладка создавалась только после отсутствия подключённой локальной вкладки.
- На странице действовал read-only guard для `fetch`, XHR, `sendBeacon` и отправки форм.
- Разрешались только `GET`, `HEAD` и `OPTIONS`. Нажатия `Add`, `Save`, `Delete`, `Upload`, `Start`, `Export`, `Convert`, `Reject`, `Edit`, `Move`, `Command` и аналогичные действия не выполнялись.
- Один фоновый `POST` к dev-endpoint `/api/broadcasting/auth` был перехвачен guard до отправки. Фактически запрещённых `POST/PUT/PATCH/DELETE` запросов не отправлено.
- Production-сервисы не использовались; проверялся локальный frontend и настроенный для него dev-backend.
- Cookies, токены и пароли не извлекались и не сохранялись. Выход из авторизованной сессии не выполнялся.
- Исходный код приложения не изменялся. Созданы только QA-план, тестовые browser-сценарии, отчёт и скриншоты.

## Покрытие

Проверены доступные read-only представления и переходы:

- Predictive Maintenance: Dashboard и вкладки Plant, Machines, Assets, Equipments, Production Lines, Utilities; Customer Success, Meeting Tracker, ROI One Pager, Corporate View, Controllers, OEE.
- System: Companies, Plants, Users, Teams, User Roles, Distributors, Vendors, Settings и все доступные вкладки Settings.
- CMMS: Work Orders, Maintenance Logs, Work Order Requests, Task Procedures, Work Order Type, Misc Parts, Work Order Import, Plant Import, Plant Import Logs, Master Import.
- Asset Management: Brands, Part Numbers, Item Types, Item Type Categories, Applications, Storerooms, Equipment list.
- Дополнительно: Profile, ROI Calculator, Sensors, NCD Sensors, RFQs, Requisitions.
- Read-only карточки: Machine, три Asset, Production Line, два Equipment и доступные PDM-подстраницы датчиков.
- Безопасные реакции UI: основная навигация, вкладки Settings/Import/CMMS, выбор растения, переходы в карточки, пагинация вперёд/назад, визуальная отрисовка Highcharts.

## Результаты проверок

| ID | Проверенный сценарий | Статус | Фактический результат | Найденные проблемы / severity | Шаги воспроизведения | Путь к скриншоту |
|---|---|---|---|---|---|---|
| T01 | Загрузка приложения | passed | Локальное приложение загрузилось, `document.readyState=complete`; после ожидания основные страницы не оставались в loading-состоянии. | Нет / — | 1. Открыть `http://localhost:5173`. 2. Дождаться завершения загрузки. | `qa/reports/screenshots/full-project-read-only/dashboard-title-and-structure-context.png` |
| T02 | Заголовок страницы | failed | На всех проверенных маршрутах используется шаблонный заголовок `🐴 Vite App`. | Некорректный product title / **minor** | 1. Открыть любой раздел. 2. Проверить `document.title`. | Не применимо: значение получено из DOM; контекст страницы — `qa/reports/screenshots/full-project-read-only/dashboard-title-and-structure-context.png` |
| T03 | Семантические заголовки страниц | failed | На большинстве списков и форм визуальный заголовок не представлен как `h1`–`h3` или `[role=heading]`. Семантические заголовки найдены только на части dashboard/detail страниц. | Недостаточная доступность структуры / **minor** | 1. Открыть, например, `/controllers` или `/companies`. 2. Проверить accessibility tree и `h1,h2,h3,[role=heading]`. | Не применимо: дефект accessibility tree |
| T04 | Главное меню и навигация | passed | Найдены группы Predictive Maintenance, System, CMMS и Asset Management. Доступные ссылки и раскрываемые группы реагировали на нажатие и меняли маршрут. | Нет / — | 1. Открыть приложение. 2. Последовательно перейти по пунктам бокового меню. | `qa/reports/screenshots/full-project-read-only/dashboard-title-and-structure-context.png` |
| T05 | Основные разделы Predictive Maintenance | passed | Dashboard, Customer Success, Corporate View, Controllers и OEE загружались. Пустые наборы показывали конечное empty-state, а не бесконечный loader. | Нет / — | 1. Открыть каждый пункт группы Predictive Maintenance. 2. Дождаться загрузки. | — |
| T06 | Основные разделы System | passed | Companies, Plants, Users, Teams, User Roles и Vendors загружались без видимых error-alerts и зависших loaders. | Нет / — | 1. Открыть каждый доступный пункт группы System. | — |
| T07 | Заголовок столбца Distributors | failed | В таблице отображается `Locations (Cities) - Text Missing`. | Отсутствующий перевод/текст / **minor** | 1. Открыть `/distributors`. 2. Проверить заголовки таблицы. | `qa/reports/screenshots/full-project-read-only/distributors-locations-text-missing.png` |
| T08 | Вкладки Settings | passed | Faults, NCD Faults, Custom Formulas, Back-End Register Writing, Bearing, Lube Type, Industrial Services, Statistics, Banner V2 Subtypes и Import открывались. Мутационные кнопки не нажимались. | Нет / — | 1. Открыть `/settings`. 2. Последовательно перейти по вкладкам. | — |
| T09 | Локализация Plant Import | failed | В Settings Import и отдельном Plant Import пользователю показан ключ `item_types` вместо текста. | Необработанный localization key / **minor** | 1. Открыть `/settings/import/logs` или `/plant-import`. 2. Прокрутить список полей до Item Type. | `qa/reports/screenshots/full-project-read-only/settings-import-untranslated-item-types.png` |
| T10 | История импорта | failed | В таблице History видны внутренние имена PHP-классов, файловые пути и необработанные диагностические сообщения backend. | Раскрытие внутренних деталей и нечитаемая ошибка / **major** | 1. Открыть Settings → Import → History. 2. Просмотреть Error Text в записях с ошибкой. | `qa/reports/screenshots/full-project-read-only/settings-import-history-backend-trace.png` |
| T11 | Основные разделы CMMS | passed | Work Orders, Maintenance Logs, Requests, Task Procedures, Work Order Type и Misc Parts загрузились; вкладка Maintenance Logs реагировала на нажатие. | Нет / — | 1. Последовательно открыть пункты CMMS. 2. В Work Orders открыть Maintenance Logs. | — |
| T12 | Work Order Import | failed | Заголовок страницы и кнопка содержат `Text Missing`/`text missing`. | Отсутствующий перевод/текст / **minor** | 1. Открыть `/maintenance-import`. 2. Проверить заголовок и кнопку импорта, не выбирая файл. | `qa/reports/screenshots/full-project-read-only/work-order-import-text-missing.jpg` |
| T13 | Разделы Asset Management | passed | Brands, Part Numbers, Item Types, Categories, Applications, Storerooms и Equipment list открылись. Пустые наборы завершались empty-state. | Нет / — | 1. Открыть доступные пункты Asset Management. 2. Дождаться окончания загрузки. | — |
| T14 | Дополнительные read-only маршруты | passed | Meeting Tracker, ROI One Pager, Plant/Master Import, Import Logs, ROI Calculator, Sensors и NCD Sensors загрузились. При отсутствии данных отображался конечный Not Found/empty-state. | Нет / — | 1. Открыть перечисленные маршруты напрямую на localhost. 2. Не запускать импорт и не отправлять формы. | — |
| T15 | Выбор растения и вкладки Dashboard | passed | Через UI выбраны существующие растения; после выбора загружались Plant, Machines, Assets, Equipments, Production Lines и Utilities. Изменялись только клиентское состояние и GET-данные. | Нет / — | 1. Открыть Dashboard. 2. Выбрать растение. 3. Перейти по вкладкам dashboard. | `qa/reports/screenshots/full-project-read-only/dashboard-title-and-structure-context.png` |
| T16 | Пагинация таблицы | passed | На Controllers кнопка Next реагировала, затем Previous возвращала назад; запрещённых методов не возникло. | Нет / — | 1. Открыть `/controllers`. 2. Нажать Next. 3. Нажать Previous. | — |
| T17 | Read-only карточки сущностей | passed | Открылись карточки Machine, Assets, Production Line и Equipment. Основные блоки и доступные summary-графики загрузились без видимых alert-сообщений. | Нет / — | 1. Выбрать растение с данными. 2. Открыть доступную карточку через dashboard. | — |
| T18 | Отрисовка summary-графиков | passed | На Dashboard и карточках Machine/Asset/Production Line/Equipment появились Highcharts-контейнеры размером около `320×190`, серии и SVG-точки; после ожидания loader исчезал. | Нет / — | 1. Выбрать растение. 2. Открыть dashboard или карточку. 3. Дождаться графика. | `qa/reports/screenshots/full-project-read-only/dashboard-title-and-structure-context.png` |
| T19 | Hover/tooltip графиков | not tested | Для доступных summary-графиков DOM не предоставил надёжную точку с данными для безопасного hover; клик и drag намеренно не выполнялись. | — | Требуется растение/период с доступной интерактивной серией либо ручной hover без изменения порогов. | — |
| T20 | PDM-графики датчиков | failed | На нескольких доступных PDM-страницах появляются серии `Request failed with status code 401`; одновременно остаются до 24 loaders и блоки `Chart Loading...` не завершаются. Воспроизведено на нескольких датчиках двух Equipment. | PDM-аналитика недоступна / **major** | 1. Выбрать `Test Comissioning Plant`. 2. Открыть Equipment. 3. Перейти в PDM датчика. 4. Дождаться загрузки. | `qa/reports/screenshots/full-project-read-only/pdm-401-and-infinite-chart-loading.jpg` |
| T21 | Изображение на PDM-карточке | failed | Вместо изображения отображается broken-image placeholder/текст `img error`. | Сломанный media resource / **minor** | 1. Открыть Equipment с PDM-датчиком. 2. Перейти на PDM-страницу. 3. Проверить изображение объекта. | `qa/reports/screenshots/full-project-read-only/pdm-broken-equipment-image.jpg` |
| T22 | RFQs и Requisitions | not tested | Текущая роль получила `Limited access — You do not have permissions to view this page`, после чего приложение вернулось на Dashboard. Это не классифицировано как дефект без требований к роли. | — | Нужна учётная запись с разрешениями RFQ/Requisitions. | `qa/reports/screenshots/full-project-read-only/limited-access-rfqs-requisitions.jpg` |
| T23 | Изменение пароля в Profile | not tested | Страница Profile загрузилась, но после обнаружения видимых password-полей тест остановился до ввода согласно ограничению. Форма входа не появлялась. | — | Требуется ручная проверка владельцем сессии; пароль не вводился. | — |
| T24 | Мутационные сценарии | not tested | Создание, редактирование, удаление, upload/import/start, export, submit, convert/reject, logout и команды оборудования не запускались. | — | Исключено условиями read-only теста. | — |
| T25 | Контроль HTTP-методов | passed | Guard оставался установленным. Один фоновый `POST /api/broadcasting/auth` был заблокирован до отправки; `PUT/PATCH/DELETE` не наблюдались. | Нет фактически отправленных запрещённых запросов / — | 1. Выполнить read-only навигацию. 2. Проверить журнал `window.__qaReadOnlyGuard.snapshot()`. | — |

## Найденные проблемы

### Major

1. PDM-графики части датчиков возвращают повторяющиеся `401` и остаются в бесконечном `Chart Loading...`.
2. Settings Import History раскрывает внутренние backend-классы, пути и необработанный текст исключений.

### Minor

1. Шаблонный title `🐴 Vite App`.
2. На большинстве страниц отсутствует семантический page heading.
3. `Locations (Cities) - Text Missing` в Distributors.
4. `item_types` в Plant Import.
5. `Import - Text Missing` и `Import - text missing` в Work Order Import.
6. Сломанное изображение на PDM-странице.

## Что не удалось проверить

- RFQs и Requisitions — недостаточно разрешений текущей роли.
- Поля изменения пароля — остановка до ввода пароля по требованиям безопасности.
- Точное поведение tooltip/hover на графиках — доступные автоматически определяемые серии не предоставили безопасную интерактивную точку; клик/drag не выполнялся.
- Любые сценарии, способные изменить данные или отправить `POST/PUT/PATCH/DELETE`, включая create/edit/delete, импорт, загрузку файлов, export, команды устройств и logout.
- Полный PDM-набор графиков — заблокирован ошибками `401` и незавершающимся loading.

## Артефакты

- План: `qa/test-plans/full-project-read-only-browser-test.md`
- Browser-сценарий: `qa/test-plans/full-project-read-only-browser-run.py`
- Продолжение сценария: `qa/test-plans/full-project-read-only-browser-followup.py`
- Скриншоты: `qa/reports/screenshots/full-project-read-only/`
- Основная запись Browser Use: `/Users/maczone/.config/browser-harness/agent-workspace/recordings/full-project-read-only-20260805-resume2` — 304 кадра.
- Предыдущий сегмент записи: `/Users/maczone/.config/browser-harness/agent-workspace/recordings/full-project-read-only-20260805-resume` — 134 кадра.

## Финальная сводка

- Выполнено: **21** проверки.
- Прошло: **13**.
- Завершилось ошибкой: **8**.
- Не удалось проверить: **4** сценария — RFQs/Requisitions, password-поля Profile, hover/tooltip графиков и все мутационные операции.
