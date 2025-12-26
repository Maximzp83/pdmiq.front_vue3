# Claude Code Migration Kit (Extended)

Этот файл определяет HOW Claude Code должен работать с проектом миграции Vue2 → Vue3.
Он дополняет и расширяет claude-code-migration-plan.md и является ОБЯЗАТЕЛЬНЫМ к исполнению.

---

## 1. Источники истины (Source of Truth)

Claude Code ОБЯЗАН использовать ТОЛЬКО следующие источники:

1. claude-code-migration-plan.md — ЧТО делать
2. claude-code-migration-kit.md — КАК делать
3. migration-progress.md — ТЕКУЩЕЕ СОСТОЯНИЕ

Запрещено:
- принимать решения вне этих документов
- додумывать архитектуру
- рефакторить без явной причины

---

## 2. Жёсткие запреты (Hard Rules)

Claude Code СТРОГО ЗАПРЕЩЕНО:

- копировать старые api/store/mixins/helpers как есть
- изменять src/assets/* (кроме src/assets/img)
- изменять index.html
- изменять vite.config.* без прямого указания
- трогать файлы, помеченные как "готовые"
- выполнять миграцию всего проекта за один проход

Нарушение любого пункта = ошибка миграции.

---

## 3. Обязательный режим работы (Mandatory Workflow)

Claude Code ОБЯЗАН работать ТОЛЬКО итеративно.

### Один цикл = один чанк

Размер чанка:
- 1–3 компонента
- ИЛИ 1 view
- ИЛИ 1 store module
- ИЛИ 1 API domain

---

## 4. Шаблон выполнения чанка (Chunk Execution Template)

Перед началом:

Migration chunk:
- Scope: <files>
- Dependencies: <api / store / composables>
- Risks: <list>

После выполнения:

Result:
- Files migrated: <list>
- API used: <list>
- Stores used: <list>
- TODOs / follow-ups: <if any>

После этого ОБЯЗАТЕЛЬНО:
- обновить migration-progress.md
- остановиться

---

## 5. Контроль контекста (Anti-Context-Overflow Rules)

Claude Code ОБЯЗАН:

- перечитывать migration-plan.md перед каждым чанком
- перечитывать migration-progress.md перед каждым чанком
- не загружать в контекст более 3 файлов одновременно
- никогда не работать с "всем проектом"

Если контекст неполный — ОСТАНОВИТЬСЯ.

---

## 6. Архитектурные правила (Enforced Architecture)

### API
- использовать ТОЛЬКО src/api
- legacy код → src/api/adapters или src/api/legacy
- компоненты НИКОГДА не импортируют legacy напрямую

### Store
- Vuex → Pinia bridge
- legacy → src/stores/legacy
- публичный интерфейс сохраняется

### UI
- Element-UI запрещён
- Element-Plus обязателен
- Highcharts только современный wrapper

---

## 7. Синтаксические правила

Обязательные замены:
- beforeDestroy → beforeUnmount
- this.$emit('input') → v-model
- slot="footer" → <template #footer>
- v-bind.sync → v-model
- filters → computed / functions
- require → import
- module.exports → export

---

## 8. Завершение сессии (Session End Rules)

Перед завершением Claude Code ОБЯЗАН:

- обновить migration-progress.md
- кратко описать выполненный чанк
- явно остановиться (STOP)

---

## 9. Формат команды старта

Рекомендуемая команда пользователем:

"""
Load claude-code-migration-plan.md and claude-code-migration-kit.md.
Continue from the first unchecked item in migration-progress.md.
Work strictly by chunks.
"""

---

## 10. Главный принцип

❗ Лучше остановиться и спросить,
чем сделать лишний рефакторинг.
