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
- `vue2_project/src/views/Maintenance` is migrated for the current Vue3 compile scope.
- Maintenance routes/menu are enabled for dashboard, logs, work orders, details/create pages, and work-order import.
- Maintenance Work Orders and Logs forms/lists were hardened toward legacy behavior, including advanced filters, attachments/images, recurring/snooze-related form fields, preview/detail actions, and export guards.
- `vue2_project/src/views/WorkOrderRequests` is migrated into Vue3:
  `src/views/WorkOrderRequests/ItemsList.vue`, `ItemForm.vue`, `ConvertForm.vue`, `ItemDetailsPreview.vue`.
- Work Order Requests route/menu/entity/API support is enabled through `src/router/index.js`, `src/constants/menuItems.js`, `src/config/entities.js`, and `src/composables/useMaintenance.js`.
- `vue2_project/src/views/StoreRooms` is migrated into Vue3:
  `src/views/StoreRooms/ItemsList.vue`, `ItemForm.vue`, `ItemPage.vue`, `LocationItem.vue`.
- StoreRooms routes/menu are enabled for `/store-rooms`, `/store-rooms/new`, `/store-rooms/:id`, and `/store-rooms/:id/items`; the items route uses existing `src/views/BrandModels/StoreroomWrapper.vue`.
- `npm run build` passes.
- `git diff --check` passes.

## Files Already Modified
- `src/composables/useMaintenance.js`
- `src/views/Maintenance/**`
- `src/views/WorkOrderRequests/**`
- `src/views/StoreRooms/**`
- `src/components/itemDetails/MaintenanceListWrapper.vue`
- `src/config/entities.js`
- `src/constants/menuItems.js`
- `src/router/index.js`
- `src/views/Controllers/ItemForm.vue`
- `components.d.ts`
- Docs updated:
  - `SESSION_CONTEXT.md`
  - `docs/migration-progress.md`
  - `docs/migration-todos.md`
  - `docs/new-session-handoff.md`

## Unresolved Issues
- Authenticated browser runtime smoke testing with real data is still needed.
- Highest-risk Maintenance areas: work-order/log create/edit payload completeness, attachments/images upload, recurring work orders, snooze, work-order import/upload/revert, list action behavior, modal header/footer actions, PDF/print behavior, and recurring/unlock flows.
- Highest-risk Work Order Requests areas: create/edit payloads, convert/reject actions, modal callbacks, route/menu visibility, and list/detail modal behavior.
- Highest-risk StoreRooms areas: create/edit/delete payloads, locations subitems, plant lookup, and `/store-rooms/:id/items` integration with `BrandModels/StoreroomWrapper`.
- Browser automation is not installed in project dependencies.

## Next Actionable Step
- Runtime smoke-test Maintenance Work Orders/Logs, Work Order Requests, and StoreRooms with authenticated real data.
- Focus first on StoreRooms list/create/edit/delete, locations subitems, and `/store-rooms/:id/items`; then Work Order Requests create/edit/convert/reject; then Maintenance create/edit/import/export/preview flows.
