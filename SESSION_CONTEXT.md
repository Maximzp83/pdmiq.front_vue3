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
  - `src/constants/date_time.js` now exposes `datePickerAdditionalShortcuts2()` with last 1/6/12 month shortcuts.
  - `src/helpers/index.js` now supports `getDateRange('last_6_months')`.
  - `src/views/Requisitions/Details/ApproveForm.vue` now includes downtime/hour, hours saved, contractor quote fields, and paired downtime/hour + hours-saved validation.
  - `src/views/Requisitions/Details/WorkOrderReportForPrint.vue` now prints downtime/hour, hours saved, and contractor quote.
  - `src/views/Requisitions/ROICalculator/ROICalculatorBlock.vue`, `ROICalculatorContainer.vue`, and `ItemsList.vue` now follow the updated Vue2 ROI calculator flow: technician-only users, work-order selector, combined date shortcuts, running-total result names, contractor inputs without repair cost avoidance, applied list filters, and PDF export payload updates.
- Localization changes from `vue2_project/src/localization` were already present in Vue3 for the relevant keys.
- Latest verification during the session: targeted `git diff --check` passed; `npm run build` passed with existing Vite mixed-import/chunk-size warnings.

## Files Already Modified
- Current visible dirty working tree from `git status --short`:
  - `src/constants/date_time.js`
  - `src/helpers/index.js`
  - `src/views/Requisitions/Details/ApproveForm.vue`
  - `src/views/Requisitions/Details/WorkOrderReportForPrint.vue`
  - `src/views/Requisitions/ItemsList.vue`
  - `src/views/Requisitions/ROICalculator/ROICalculatorBlock.vue`
  - `src/views/Requisitions/ROICalculator/ROICalculatorContainer.vue`
  - `SESSION_CONTEXT.md`
  - `vue2_project/src/constants/date_time.js`
  - `vue2_project/src/helpers/index.js`
  - `vue2_project/src/localization/loc_eng.js`
  - `vue2_project/src/localization/loc_spanish.js`
  - `vue2_project/src/views/Requisitions/Details/ApproveForm.vue`
  - `vue2_project/src/views/Requisitions/Details/WorkOrderReportForPrint.vue`
  - `vue2_project/src/views/Requisitions/ROICalculator/ROICalculatorBlock.vue`
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
