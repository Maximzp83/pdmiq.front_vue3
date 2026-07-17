# Continuation Briefing

## Project Stack
- Vue 3 + Vite migration from `vue2_project/`.
- Vue Router 4, Pinia, Element Plus, Highcharts, Sass, `<script setup>`.
- API layer uses `src/api/request_provider.js` / `api_request`; stores are Pinia state containers, API work belongs in composables.

## Key Architecture Rules
- Preserve Vue2 behavioral parity; compare with `vue2_project/` before changing migrated behavior.
- Prefer existing composables/helpers/entity config over new local patterns.
- Use `CustomSelectV2` instead of legacy `CustomSelect`; global `CustomSelectV2` / `CustomInput` should not be locally imported unless an existing file already requires that pattern.
- Use `handleEvent`, not `handleEventNew`.
- Dynamic components should use explicit `componentFileLoader` / `formComponentFileLoader`, not legacy string `componentPath`.
- Treat legacy `el-icon-*` strings as CSS classes unless explicitly mapped to Element Plus icon components.
- Do not revert unrelated dirty files. Use `apply_patch` for manual edits.
- User prefers no code/diff output unless requested.

## Current Task Status
- Latest `vue2_project/` changes were synced into already migrated Vue3 files:
  - `src/composables/mixins/useSubItemsList.js` now normalizes boolean `setIfEmpty` values to `0` when false, matching the updated legacy sub-items mixin behavior.
  - `src/modules/charts_factory/controllers/Sensor/classes/Chart.js` now disables navigator/scrollbar and enables x panning for `oneChartOnly`.
  - `src/views/Sensors/charts/ChartsListWrapper.vue` now passes per-chart computed `additionalProps`, hides chart headers for single one-chart results, and guards `getParamsByIds` with an array fallback.
  - `src/views/Sensors/sensorForm/ItemForm.vue` now limits Banner M25 running-threshold parameter choices to the updated legacy parameter subset.
- `vue2_project/src/modules/charts_factory/controllers/Sensor/methods.js` had only whitespace change; no Vue3 functional change was needed.
- `vue2_project/src/services/WebSocketService.js` changed the legacy Pusher broadcasting auth fallback from stage to production, but Vue3 uses `src/composables/mixins/useWebSocket.js` with native websocket endpoint env/fallback and has no equivalent broadcasting auth endpoint to update.
- Latest verification during the session: targeted `git diff --check` passed; `npm run build` passed with existing Vite mixed-import/chunk-size warnings.

## Files Already Modified
- Current visible dirty working tree from `git status --short`:
  - `src/composables/mixins/useSubItemsList.js`
  - `src/modules/charts_factory/controllers/Sensor/classes/Chart.js`
  - `src/views/Sensors/charts/ChartsListWrapper.vue`
  - `src/views/Sensors/sensorForm/ItemForm.vue`
  - `SESSION_CONTEXT.md`
  - `docs/migration-progress.md`
  - `docs/migration-todos.md`
  - `docs/new-session-handoff.md`
  - `vue2_project/src/mixins/subItemsListMixin.js`
  - `vue2_project/src/modules/charts_factory/controllers/Sensor/classes/Chart.js`
  - `vue2_project/src/modules/charts_factory/controllers/Sensor/methods.js`
  - `vue2_project/src/services/WebSocketService.js`
  - `vue2_project/src/views/Sensors/charts/ChartsListWrapper.vue`
  - `vue2_project/src/views/Sensors/sensorForm/ItemForm.vue`
- Do not revert the remaining `vue2_project/` source changes; they are the upstream legacy-side changes that were analyzed and synced where applicable.

## Unresolved Issues
- No more code-level pending note for `Equipments` advanced tabs; runtime smoke-test was explicitly not requested.
- Remaining open items are runtime-only validation:
  - SuccessDashboard Meeting Tracker / ROI One Pager with real data.
  - Sensors list/create/edit/statistics/FFT/chart routes with real data.
  - Settings, Maintenance, Work Order Requests, StoreRooms, Assets/Machines/Equipments flows as listed in docs.
- Legacy `vue2_project/src/views/Sensors/sensorForm/ItemFormPump.vue` is not present as a separate Vue3 file; pump logic is represented inside the migrated ultrasound form stack.

## Next Actionable Step
- Start the new session by running `git status --short`, then continue with runtime-free code/doc checks only unless the user explicitly asks for browser/API smoke-tests.
