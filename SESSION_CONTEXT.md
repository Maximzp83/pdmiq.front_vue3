# Continuation Briefing

## Project Stack
- Vue 3 with `<script setup>`
- Vite
- Vue Router 4
- Pinia
- Element Plus

## Key Architecture Rules
- Migrate from `vue2_project` into Vue3 architecture only; do not reintroduce Vue2 mixins or Vuex runtime patterns.
- Prefer existing shared composables: `useItemsData`, `useItemPage`, `useItemForm`, `useRequestsList`, `useSubItem`, `useSubItemsList`.
- Use `src/config/entities.js` as entity API/route metadata source where available.
- Replace `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace `<CustomSelect>` with global `<CustomSelectV2>`; do not locally import `CustomSelectV2` or `CustomInput`.
- Do not keep legacy `requestsListMixin` / `requestsToDoList` async loaders for `<FetchByQuerySelect>`; pass async request functions through component settings instead.
- Current collaboration mode: no code/diff output in responses. Apply non-doc changes only after confirmation unless the user explicitly asks to migrate a whole section without intermediate confirmations.

## Current Task Status
- `vue2_project/src/views/Requisitions` is migrated for current Vue3 compile scope with dashboard, list, detail page, requisition form, details/action forms, counters, ROI calculator, `usePlantRequisitions`, entity config, routes, and menu entries.
- `vue2_project/src/views/RFQS` is migrated for current Vue3 compile scope with list, form, item page, `useRfqs`, entity config, routes, and menu entry.
- `vue2_project/src/views/ProductionLines` is migrated for current Vue3 compile scope with list/grid, form, item page, item card, utility wrapper, details page, support subitems, `useProductionLines`, store filter extensions, and routes.
- `src/components/gridTable/ItemsGridContainer.vue` was aligned with the current `handleEvent` rule.
- Earlier migrated sections remain in scope: Maintenance, WorkOrderRequests, StoreRooms, Sensors, Controllers, BrandModels details.
- `npm run build` passes.
- `git diff --check` passes.

## Files Already Modified
- `src/composables/usePlantRequisitions.js`
- `src/composables/useRfqs.js`
- `src/composables/useProductionLines.js`
- `src/views/Requisitions/**`
- `src/views/RFQS/**`
- `src/views/ProductionLines/**`
- `src/stores/ProductionLinesStore.js`
- `src/components/gridTable/ItemsGridContainer.vue`
- `src/config/entities.js`
- `src/router/index.js`
- `src/constants/menuItems.js`
- Docs updated:
  - `SESSION_CONTEXT.md`
  - `docs/migration-progress.md`
  - `docs/migration-todos.md`
  - `docs/new-session-handoff.md`
- Pre-existing unrelated dirty file:
  - `codex_session_end_prompts.yaml`

## Unresolved Issues
- Browser/runtime smoke testing with authenticated real data is still needed.
- Highest-risk ProductionLines areas: drag/drop reorder behavior, modal create/edit payload with image/library uploads, locations lookup binding, RPM node selection, utility vs production-line filter persistence, and details child-list parity because Assets/Equipments lists are not currently migrated.
- Highest-risk Requisitions areas: approval/deny/unapprove/on-hold/complete payload details, attachment upload behavior, ROI calculation filter parity, chart/runtime data parity, details modal/action parity, and authenticated role-condition behavior.
- Highest-risk RFQS areas: equipment label fetch/display, vendor multiselect save payload, delete action behavior, and route/menu permission visibility.
- Browser automation is not installed in project dependencies.

## Next Actionable Step
- Runtime smoke-test `ProductionLines` first:
  `/dashboard/production-lines`, `/dashboard/utilities`, create/edit modal, image/library upload, drag/drop reorder, `/production-lines/:id/details`, and details widgets/statistics.
- Then smoke-test `Requisitions` and `RFQS` with authenticated real data.
