# Continuation Briefing

## Project stack
- Vue 3 (`script setup`), Vite 6, Vue Router 4, Pinia 3
- Element Plus 2, Highcharts + highcharts-vue
- HTTP via `api_request` over axios
- ESLint 9, Prettier 3, Vitest, Sass

## Key architecture rules
- Migrate from `vue2_project` into Vue3 architecture only.
- Use composables + Pinia; do not reintroduce Vuex/mixins patterns into runtime code.
- Replace `@event="handleEventNew"` with `@event="handleEvent"` during migration.
- Replace `<CustomSelect...>` usages with `<CustomSelectV2...>` during migration.
- For migrations from `vue2_project/src/views` to `src/views`, use `src/views/Plants` as the reference pattern.
- Work one step at a time; exception allowed only for tightly coupled parent/child or structurally linked files.
- Apply changes only after user confirmation; ask first on risky or ambiguous points.

## Current task status
- Vue2 -> Vue3 migration is active across `src/components/*` and `src/views/*`.
- Recently completed `src/views` entity migrations:
  - `Applications`
  - `Processes`
- Recent sync from changed legacy files was applied to:
  - `src/components/table/CustomDataListTable.vue`
  - `src/components/table/Row.vue`
  - `src/components/table/TableHeader.vue`
  - `src/views/Machines/ItemForm.vue`

## Files already modified
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
- `src/views/Applications/ItemsList.vue`
- `src/views/Applications/ItemForm.vue`
- `src/views/Applications/ItemPage.vue`
- `src/views/Processes/ItemsList.vue`
- `src/views/Processes/ItemForm.vue`
- `src/views/Processes/ItemPage.vue`
- `src/views/Processes/ItemCard.vue`
- `src/views/Processes/BreakTimeItem.vue`
- `src/views/Processes/WorkDateItem.vue`
- `src/views/Processes/FaultItem.vue`
- `src/router/index.js`

## Unresolved issues
- Runtime verification is still needed for `/plants` and `/dashboard/plant`.
- Runtime verification is needed for `/applications`, `/applications/create`, and modal application creation from Machines.
- Runtime verification is needed for `/processes`, `/processes/create`, `/processes/:id`, websocket list updates, and process delete flow.
- `src/views/Plants/Details/DetailsPage.vue` is still unfinished relative to legacy behavior.
- `src/components/layout/TopNavbar.vue` still needs a final functional verification pass.
- In `Processes`, the legacy details target `/processes/:id/details` is not migrated yet; current `Details` action routes to `/processes/:id`.

## Next actionable step
1. Run runtime checks for `/plants`, `/dashboard/plant`, `/applications`, and `/processes`.
2. Continue migration of the next active `src/views` entity from router coverage, or finish `src/views/Plants/Details/DetailsPage.vue` if prioritizing legacy parity.
