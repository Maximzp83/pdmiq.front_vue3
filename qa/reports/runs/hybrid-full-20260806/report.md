# Full project hybrid read-only test

- Run ID: `hybrid-full-20260806`
- URL: `http://localhost:5173`
- Архитектура: один Browser Use worker + static-routes-forms + static-api-risks + aggregator.
- Состояние run: **incomplete**
- Guard блокирует POST/PUT/PATCH/DELETE, submit, production WebSocket, исходящие WebSocket frames и внешнюю навигацию.
- Payload, cookies, токены, пароли, storage и исходные значения полей в артефакты не записываются.

## Статический инвентарь

- Router paths: 162; menu paths: 31; seed routes: 60.
- Vue-компоненты с UI controls: 257; с формами: 109; с select: 20.
- Mutation/network risk signals: 464 в 156 файлах.
- Статические signals являются veto-кандидатами для browser classifier, а не доказательством runtime-дефекта.

## Проверенные сценарии

| Проверенный сценарий | Статус | Фактический результат | Найденные проблемы | Severity | Шаги воспроизведения | Путь к скриншоту |
|---|---|---|---|---|---|---|
| Runtime Browser Use flow | not tested | Browser events отсутствуют. | Runtime UI не проверен. | — | Проверить Chrome/CDP и повторить запуск. | — |

## Итог

- Проверок выполнено: 0
- Прошло: 0
- Завершилось ошибкой: 0
- Не проверено: 0
- Заблокированные guard действия: —
- Не удалось проверить: —
- Факт отсутствия обходных мутаций вне покрытых transport hooks независимо не доказан; static-risk inventory сохранён для ручного аудита.

## Артефакты

- Browser events: `qa/reports/runs/hybrid-full-20260806/browser/events.jsonl`
- Static routes/forms: `qa/reports/runs/hybrid-full-20260806/static-routes/result.json`
- Static API risks: `qa/reports/runs/hybrid-full-20260806/static-risks/result.json`
- Screenshots: `qa/reports/runs/hybrid-full-20260806/browser/screenshots`
