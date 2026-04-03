# Continuation Briefing

## Project stack
- Vue 3 (`script setup`), Vite 6, Vue Router 4, Pinia 3
- Element Plus 2, Highcharts + highcharts-vue
- HTTP: `api_request` wrapper over axios (`src/api/*`)
- Tooling: ESLint 9, Prettier 3, Vitest, Sass

## Key architecture rules
- Migrate from `vue2_project` into Vue3 architecture only.
- Use composables + Pinia; do not reintroduce Vuex/mixins patterns into runtime code.
- Replace `@event="handleEventNew"` with `@event="handleEvent"` during migration.
- Replace `<CustomSelect...>` usages with `<CustomSelectV2...>` during migration.
- Work one step at a time; exception allowed for tightly coupled parent/child files in one combined step.
- Do not show code/diff in normal responses; ask first if a point is risky or ambiguous.

## Current task status
- Main Vue2 -> Vue3 migration is partially completed across `components/*`, `table/*`, `common/*`, `form/*`, `pages/*`, `gridTable/*`, `itemDetails/*`, and core `Plants/*` files.
- Latest meaningful sync from updated `vue2_project` was applied to already migrated runtime files:
  - `src/views/Plants/ItemForm.vue`
  - `src/components/layout/DashboardLayout.vue`
  - `src/constants/global.js`
  - `src/assets/sass/common/layout.scss`
  - `src/assets/sass/common/common-content.scss`
  - `src/assets/sass/common/common-blocks.scss`
- Latest follow-up sync from changed `vue2_project` files was applied to:
  - `src/components/table/CustomDataListTable.vue`
  - `src/components/table/Row.vue`
  - `src/components/table/TableHeader.vue`
  - `src/views/Machines/ItemForm.vue`
- `SESSION_CONTEXT.md` is now refreshed and the git worktree is currently clean.

## Files already modified
- Recently synchronized Vue3/app files:
  - `src/views/Plants/ItemForm.vue`
  - `src/components/layout/DashboardLayout.vue`
  - `src/constants/global.js`
  - `src/assets/sass/common/layout.scss`
  - `src/assets/sass/common/common-content.scss`
  - `src/assets/sass/common/common-blocks.scss`
  - `src/components/table/CustomDataListTable.vue`
  - `src/components/table/Row.vue`
  - `src/components/table/TableHeader.vue`
  - `src/views/Machines/ItemForm.vue`
- Process/support files:
  - `docs/session-collaboration-rules.md`
  - `codex_session_end_prompts.yaml`
  - `SESSION_CONTEXT.md`

## Unresolved issues
- Runtime verification is still needed for `/plants` and `/dashboard/plant` after the latest sync.
- `src/views/Plants/Details/DetailsPage.vue` remains unfinished relative to legacy behavior.
- `src/components/layout/TopNavbar.vue` still needs a final functional verification pass.

## Next actionable step
1. Run a runtime check for `/plants` and `/dashboard/plant` to verify form behavior, filters, pagination, and MFA warning behavior.
2. Continue migration completion for `src/views/Plants/Details/DetailsPage.vue`.
