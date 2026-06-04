# Continuation Briefing

## Project Stack
- Vue 3 with `<script setup>`, Vite, Vue Router 4, Pinia, Element Plus.
- Migration source lives under `vue2_project`; target app lives under `src`.

## Key Architecture Rules
- Preserve Vue2 behavior, but implement with existing Vue3 composables and local patterns.
- Prefer existing composables: `useItemsData`, `useItemForm`, `useItemPage`, `useRequestsList`, `useEventHandler`, and domain composables such as `useMaintenance`.
- Use `componentFileLoader` / async import functions for migrated dynamic components; avoid adding legacy string `componentPath`.
- Element Plus button `type` must be a valid Element Plus value only. Put legacy visual classes like `inverted` in class props/classes, not in `type`.
- For icomoon icons, render `<i class="icomoon ...">` inside buttons instead of passing icomoon classes to Element Plus `icon`.
- Keep user-facing updates brief and do not output code/diffs unless explicitly requested.
- Update docs after migration/fix steps, especially `docs/migration-progress.md` and `docs/new-session-handoff.md`.

## Current Task Status
- `src/views/SuccessDashboard` has been migrated and wired:
  - routes, sidebar menu, entities, `useSuccessDashboard`, dashboard/main/Meeting Tracker/ROI One Pager/common components.
  - Runtime chart fixes applied: `SuccessGaugeChart` receives Highcharts with `highcharts-more`; chart readiness/load event warnings handled.
- `src/views/Maintenance` is actively being aligned to the Vue2 original:
  - `/maintenance` redirects to `/maintenance/work-orders`.
  - Work Orders / Logs dashboard structure, details modals, table behavior, create-log flow, and dynamic component loading were restored closer to Vue2.
  - `src/views/Maintenance/WorkOrders/ItemForm.vue` `requestsToDoList` was reworked to match Vue2 original using Vue3 `useRequestsList`.
  - `src/views/Maintenance/Logs/ItemForm.vue` `requestsToDoList` was reworked to match Vue2 original using WorkOrders form as the local pattern.
  - `src/views/Maintenance/MaintenanceFormWrapper.vue` fixed invalid Element Plus tab button type by splitting `buttonsType="info"` and `buttonsClass="inverted"`.
- Latest verification:
  - `npm run build` passes after the last Logs form change.
  - Targeted `git diff --check` passed for the last changed files.
  - Full `git diff --check` still reports older unrelated trailing whitespace in existing dirty files.

## Files Already Modified
- Documentation/context:
  - `SESSION_CONTEXT.md`
  - `docs/migration-progress.md`
  - `docs/migration-todos.md`
  - `docs/new-session-handoff.md`
- Routing/config/shared:
  - `src/router/index.js`
  - `src/constants/menuItems.js`
  - `src/config/entities.js`
  - `src/helpers/index.js`
  - `src/api/index.js`
- Core migrated/shared components and composables:
  - `src/components/common/DynamicComponentWrapper.vue`
  - `src/components/common/DropdownFilterbar.vue`
  - `src/components/form/DynamicFormContainer.vue`
  - `src/components/form/uploadBlock/FileUploadBlock.vue`
  - `src/components/form/uploadBlock/FileUploadBlockItem.vue`
  - `src/components/charts/CommonChartItemWrapper.vue`
  - `src/components/table/Row.vue`
  - `src/components/table/TableAction.vue`
  - `src/components/table/TableCell.vue`
  - `src/components/itemDetails/ItemWOStatisticBlock.vue`
  - `src/composables/useAssets.js`
  - `src/composables/useMachines.js`
  - `src/composables/useSettings.js`
  - `src/composables/useSuccessDashboard.js`
- Maintenance:
  - `src/views/Maintenance/MaintenanceDashboard.vue`
  - `src/views/Maintenance/MaintenanceFormWrapper.vue`
  - `src/views/Maintenance/WorkOrders/ItemForm.vue`
  - `src/views/Maintenance/WorkOrders/ItemsList.vue`
  - `src/views/Maintenance/WorkOrders/ItemDetailsPreview.vue`
  - `src/views/Maintenance/WorkOrders/WorkOrdersDetails.vue`
  - `src/views/Maintenance/WorkOrders/LogsButtonContent.vue`
  - `src/views/Maintenance/WorkOrders/DateItem.vue`
  - `src/views/Maintenance/WorkOrders/statistics/ListItemDetailsBlock.vue`
  - `src/views/Maintenance/Logs/ItemForm.vue`
  - `src/views/Maintenance/Logs/ItemsList.vue`
  - `src/views/Maintenance/Logs/ItemDetailsPreview.vue`
  - `src/views/Maintenance/Logs/LogsDetails.vue`
  - `src/views/Maintenance/Logs/BreakdownMachinesList.vue`
  - `src/views/Maintenance/Logs/DescriptionTableCell.vue`
  - `src/views/Maintenance/Logs/fileButtonContent.vue`
  - `src/views/Maintenance/Logs/filePopoverContent.vue`
- SuccessDashboard:
  - `src/views/SuccessDashboard/**`
- Other migrated/dirty sections present in worktree:
  - `src/views/Assets/**`
  - `src/views/Settings/**`
  - `src/views/Machines/**`
  - `src/views/ProductionLines/**`
  - `src/views/Processes/**`
  - `src/views/EquipmentTypes/**`
  - `src/views/Controllers/**`
  - `src/views/Sensors/**`
  - `src/views/Requisitions/**`
  - `src/views/WorkOrderRequests/ItemsList.vue`
  - Several SCSS files under `src/assets/sass/**`

## Unresolved Issues
- Authenticated browser/runtime smoke testing is still needed for:
  - `/maintenance/work-orders`: create/edit/details/open details/print/unlock/create log from `+`.
  - `/maintenance/logs`: create/edit/details/export PDF/create work order request/parent WO modal.
  - `/success-dashboard/main`, `/success-dashboard/meeting-tracker`, `/success-dashboard/roi-one-pager` with real data.
- Full `git diff --check` has unrelated pre-existing trailing whitespace in dirty files.
- Previously found invalid Element Plus `type="secondary"` remains in Sensors FFT chart components:
  - `src/views/Sensors/charts/fft/ChartFFTAnalysisRulesBar.vue`
  - `src/views/Sensors/charts/fft/FFTChartItemContainer.vue`
- Browser automation is not installed in project dependencies.

## Next Actionable Step
- Continue Maintenance runtime cleanup with authenticated smoke testing, starting from opening Work Orders and Logs create/edit forms and verifying request params, dependent selects, and console warnings.
