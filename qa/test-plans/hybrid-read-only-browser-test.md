# Гибридный read-only запуск Browser Use

Гибридный режим ускоряет полный тест без конкурентного управления одной Chrome-сессией:

```text
orchestrator
├── browser-worker          # единственный владелец существующей вкладки Chrome
├── static-routes-forms     # router, menu, формы и UI controls; без browser/network
├── static-api-risks        # mutation/API/WebSocket signals; без browser/network
└── aggregator              # запускается после completion markers трёх workers
```

## Полный запуск

Из корня проекта:

```bash
python3 qa/test-plans/hybrid-read-only-run.py \
  --publish-report qa/reports/full-project-read-only-test.md
```

Orchestrator сначала выполняет `browser-use skill show`, затем параллельно запускает ровно один защищённый Browser Use flow и два read-only статических worker. Несколько процессов `browser-use` в один локальный Chrome не запускаются.

Существующая вкладка `http://localhost:5173` переиспользуется. После ранней установки guard страница один раз контролируемо перезагружается, чтобы защита действовала до инициализации приложения. Сессия и cookies при этом не экспортируются и не записываются в QA-артефакты.

## Проверка конфигурации без Chrome

```bash
python3 qa/test-plans/hybrid-read-only-run.py --static-only
```

Этот режим проверяет параллельные static workers, schemas, manifest и aggregator. Browser Use, localhost и API не вызываются; канонический отчёт не публикуется.

## Артефакты

Каждый запуск получает уникальный каталог:

```text
qa/reports/runs/<run_id>/
├── manifest.json
├── browser-use-skill.log
├── browser/
│   ├── events.jsonl
│   ├── recording.json
│   ├── worker.log
│   └── screenshots/
├── static-routes/
│   ├── result.json
│   └── worker.log
├── static-risks/
│   ├── result.json
│   └── worker.log
├── aggregator.log
└── report.md
```

Только aggregator пишет `report.md`. Канонический `qa/reports/full-project-read-only-test.md` обновляется атомарно только после complete browser run; неполный запуск сохраняется только в своём run-каталоге.

## Распределение между Codex-агентами

При выполнении через Codex основной агент остаётся orchestrator/aggregator и владельцем browser worker. До трёх сабагентов можно использовать параллельно для read-only разбора:

1. `static-routes-forms/result.json` и gaps между router/menu/seed/runtime routes.
2. `static-risks/result.json` и veto-кандидаты для mutating controls.
3. Проверка screenshots и черновика `report.md` после завершения browser worker.

Сабагенты не вызывают `browser-use`, не кликают вкладки и не пишут в один и тот же worker-каталог.

## Safety invariants

- Канонический guard: `qa/test-plans/browser-read-only-guard.js`; копии guard в worker scripts не создаются.
- Блокируются `POST`, `PUT`, `PATCH`, `DELETE`, submit, production hosts, production WebSocket и все исходящие WebSocket frames.
- Запрещённые controls отсекаются classifier до клика; guard остаётся fail-closed backup.
- Password, token, MFA, credentials, cookies, storage, request body и исходные значения полей не читаются и не логируются.
- После каждой формы выполняется локальная GET-перезагрузка без submit.
- Уход с точного origin `http://localhost:5173` немедленно останавливает browser worker.
- Если появляется login/password form, run останавливается до ручной авторизации.
- Production WebSocket signal уже найден статически: localhost fallback приложения указывает на `wss://ws.industrialmatrix.tools/`. Guard блокирует его; зависимые проверки будут `not tested`, пока dev-конфигурация не использует разрешённый non-production endpoint.

Старые `full-project-read-only-browser-run.py` и `full-project-read-only-browser-followup.py` не входят в гибридный launcher: это частичные legacy-сценарии без полного artifact contract.
