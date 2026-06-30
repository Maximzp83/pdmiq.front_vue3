# Continuation Briefing

## Project Stack
- Vue 3 + Vite application using Vue Router 4, Pinia, Element Plus, and `<script setup>`.
- Migration source is `vue2_project/`; migrated target is `src/`.
- Charts use Highcharts through local chart factory modules under `src/modules/charts_factory`.
- API access is through local request helpers/composables such as `api_request`, `createGetRequest`, `useRequestsList`, and domain composables.

## Key Architecture Rules
- Before changing migrated behavior, compare the Vue3 file with the Vue2 original in `vue2_project/`.
- Preserve Vue2 behavioral parity: template structure, slots, wrappers, conditionals, permissions, events, request timing, route/query behavior, and store-filter ownership.
- Adapt Vue2 mixins to existing Vue3 composables/Pinia patterns; do not blindly copy mixin code.
- Keep changes scoped to the requested component/flow and avoid unrelated refactors.
- Use `apply_patch` for manual file edits.
- Do not revert user/unrelated work in the dirty worktree.
- After implementation, run `npm run build` when behavior/compile surface changes and run targeted `git diff --check`.
- Keep responses concise and do not output code/diffs unless explicitly requested.

## Current Task Status
- Recent focus was Sensors and BrandModels parity against `vue2_project`.
- `src/views/Sensors/charts/ChartItemContainer.vue` was rechecked against Vue2 and restored for:
  - one-chart legend rendering;
  - compare-mode header classes;
  - hidden-chart lazy fetch behavior;
  - disable-chart button initialization;
  - `additionalProps.showHistory` handling via `ChartZoom` ref.
- `src/views/Sensors/charts/ChartZoom.vue` now exposes `resetInitialValues` and `zoomYAxis` for the restored parent ref flow.
- `src/views/Sensors/charts/HeaderRightPart.vue` chart export payload now again includes `metricSystemType` and `X-Timezone-Offset`.
- `src/views/Sensors/PossibleProblemsBlock.vue` watcher behavior was restored to Vue2-style separate non-immediate watchers for `sensorParamsForSetupProblems` and `daterange`.
- Highcharts flag SVG assets were restored under `public/static/img/icons`, but the manual flag tooltip `pointFormatter` and hover `tooltip.refresh/hide` handlers were rolled back at user request.
- `src/views/BrandModels/ItemsList.vue` was restored closer to Vue2 for storeroom grid/list behavior, original `activeGrid` store-based calculation, QTY/details navigation, and `preventSetNavbar` forwarding to `useItemsData`.
- `src/views/Plants/Details/DetailsPage.vue` now stores `navbarSettings.value` instead of the computed ref to avoid readonly navbar warnings.
- SuccessDashboard and CorporateDashboard had prior parity/runtime fixes and currently build, but still need authenticated runtime smoke testing.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `src/views/Sensors/charts/ChartItemContainer.vue`
- `src/views/Sensors/charts/ChartZoom.vue`
- `src/views/Sensors/charts/HeaderRightPart.vue`
- `src/views/Sensors/PossibleProblemsBlock.vue`
- `src/views/Sensors/SensorFFTRequestButton.vue`
- `src/modules/charts_factory/enums/index.js`
- `public/static/img/icons/*.svg`
- `src/views/BrandModels/ItemsList.vue`
- `src/views/Plants/Details/DetailsPage.vue`
- `src/views/SuccessDashboard/DetailsPage.vue`
- `src/views/SuccessDashboard/MeetingTracker/ItemForm.vue`
- `src/views/SuccessDashboard/MeetingTracker/DynamicFormItem.vue`
- `src/views/SuccessDashboard/MeetingTracker/ItemPage.vue`
- `src/views/SuccessDashboard/ROIOnePager/ItemForm.vue`
- `src/views/SuccessDashboard/ROIOnePager/DynamicFormItem.vue`
- `src/views/SuccessDashboard/ROIOnePager/ItemsList.vue`
- `src/views/SuccessDashboard/ROIOnePager/ItemPage.vue`
- `src/views/SuccessDashboard/common/SensorsAlarmsContainer.vue`
- `src/views/SuccessDashboard/common/SensorAlarmsChartsListWrapper.vue`
- `src/views/SuccessDashboard/common/SensorAlarmsChartItemContainer.vue`
- `src/views/SuccessDashboard/common/NotesItem.vue`
- `src/views/SuccessDashboard/common/ChartCommentForm.vue`
- `src/views/SuccessDashboard/MainDashboard/HealthStatisticsCard.vue`
- `src/views/SuccessDashboard/MainDashboard/ROIStatisticsContainer.vue`
- `src/views/SuccessDashboard/MainDashboard/GaugeStatisticsContainer.vue`
- `src/views/CorporateDashboard/CorporateDashboard.vue`
- `src/views/CorporateDashboard/Details/PlantDetailsItem.vue`

## Unresolved Issues
- No authenticated browser/API smoke test has been performed for the latest Sensors, SuccessDashboard, BrandModels, or CorporateDashboard fixes.
- Sensors charts need runtime verification with real chart data, especially one-chart legend, show-history zoom reset, hidden-chart fetch behavior, export payload, and flags after tooltip rollback.
- SuccessDashboard Meeting Tracker remains high-risk and needs deeper parity review against Vue2, especially submit payloads, dynamic rows, readonly mode, async initial values, and alarms dialog behavior.
- `src/views/SuccessDashboard/MeetingTracker/NextActivityFormItem.vue` remains simplified compared with Vue2.
- `src/views/SuccessDashboard/ROIOnePager/ItemForm.vue` was heavily restored but still needs runtime validation with real item data and API responses.
- `src/views/SuccessDashboard/ROIAnalysis/DynamicFormItemRoi.vue` is a stub; Vue2 source is empty, so no current action unless requirements change.
- Further files in `src/views/Sensors/charts` may still have Vue2 parity gaps beyond the targeted fixes already applied.

## Next Actionable Step
- Continue checking `src/views/Sensors/charts` against `vue2_project/src/views/Sensors/charts` one file at a time, starting with `ChartsListWrapper.vue` and then `ChartThresholdsOperations.vue`.
- For each file: compare with Vue2, apply only behaviorally relevant parity fixes, run `npm run build`, run targeted `git diff --check`, and update handoff docs if the change is significant.
