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
- Latest one-file `vue2_project` MultiView threshold delta was migrated into its existing Vue3 counterpart without confirmation stops:
  - Compare thresholds now display and submit `acute_samples` and `stable_samples`.
  - `re_trigger_samples` remains hidden for Compare thresholds and is removed from their payload.
  - The only changed legacy file was already migrated; nothing was skipped.
  - Targeted ESLint, migration-rule scan, targeted `git diff --check`, and the Node 24 production Vite build pass; existing Vite warnings remain.
- FileUploadBlock refs were aligned with the active `useSubItemsList` registration pattern:
  - `src/views/Machines/ItemForm.vue` now registers the upload component through `setSubItemRef`, matching Production Lines and preventing a nested Vue ref object from reaching `Instance.getFormData()`.
  - The project-wide scan found one additional matching case in `src/views/SuccessDashboard/ROIOnePager/ItemForm.vue`; its file upload now also uses `setSubItemRef` and reads the registered instance from the shared refs map.
  - No component combining `setSubItemRef` with the old `ref="fileUploadBlockRef"` pattern remains.
  - Targeted ESLint, targeted `git diff --check`, and the Node 24 production Vite build pass; existing Vite warnings remain.
- Library is migrated and wired in Vue3: the list, file links, resource labels, `useLibrary` wrapper, entity config, filter persistence, `/library` route, and menu entry are present. Targeted ESLint and the Node 24 production build pass.
- Maintenance Work Orders Import was re-migrated toward Vue2 parity: the page again uses the selected plant and shared import workflow; column mapping, progress, and revert behavior are restored; shared Import components accept the maintenance upload action directly. Targeted ESLint and the Node 24 production build pass.
- Latest `vue2_project/` changes were synced into already migrated Vue3 files:
  - `src/composables/mixins/useSubItemsList.js` now normalizes boolean `setIfEmpty` values to `0` when false, matching the updated legacy sub-items mixin behavior.
  - `src/modules/charts_factory/controllers/Sensor/classes/Chart.js` now disables navigator/scrollbar and enables x panning for `oneChartOnly`.
  - `src/views/Sensors/charts/ChartsListWrapper.vue` now passes per-chart computed `additionalProps`, hides chart headers for single one-chart results, and guards `getParamsByIds` with an array fallback.
  - `src/views/Sensors/sensorForm/ItemForm.vue` now limits Banner M25 running-threshold parameter choices to the updated legacy parameter subset.
- `vue2_project/src/modules/charts_factory/controllers/Sensor/methods.js` had only whitespace change; no Vue3 functional change was needed.
- Latest Vue2 delta sync completed on 2026-08-04:
  - `src/constants/global.js` and English/Spanish localization now include real-time notification type `MULTI_VIEW_ALARMS` (`27`) / Multiview Alarms.
  - `src/views/Requisitions/Details/MaterialItem.vue` no longer declares the unused `targetPropName` prop.
  - `src/views/Sensors/sensorForm/ItemForm.vue` restricts Banner M25 running-threshold choices and loaded threshold rows to Ultrasound RMS and High Frequency RMS Acceleration.
  - `src/views/SuccessDashboard/MeetingTracker/AddPdfFileForm.vue` initializes `plant_id` from `plantId` before its visibility watcher runs.
  - Targeted ESLint and `git diff --check` for the Vue3 delta pass; the Node 24 production build passes with the existing mixed-import/chunk-size warnings.
- Asset, Machine, and Production Line Details chart-event runtime fix completed: their local `chartLegendEvents` placeholders are frozen arrays rather than objects, matching the `ItemPDMsStatisticBlock` prop and chart factory `assignSpecificOptionsEvents` contract. This removes the invalid-prop warning and `eventsList.forEach` crash; targeted ESLint, targeted `git diff --check`, and the Node 24 production build pass.
- WebSocket transport was re-migrated from `vue2_project/src/services/WebSocketService.js` into `src/services/WebSocketService.js`; the service keeps channel authorization, private/presence subscriptions, reconnect/resubscribe, heartbeat, and event handling, with only Vue CLI environment access adapted to Vite.
- `src/composables/mixins/useWebSocket.js` is now the Vue Composition API wrapper around `WebSocketService`, while preserving the existing Vue3 `setupWebSocket` / `closeWebSocket` / `webSocketSend` consumer API.
- Incoming channel events in `useWebSocket` are normalized to the legacy/current consumer contract `{ type, data }`; all existing Vue3 `onMessage` handlers were audited against this shape.
- `useWebSocket` now invokes consumer `onOpen` / legacy `localHandleOpen` only after private-channel subscription succeeds; `localHandleConnected` remains the transport-connected callback. This restores the Vue2 ordering for DXM and FFT requests.
- Full static consumer audit completed: `src/views/Sensors/ItemPage.vue` was the last direct native-WebSocket consumer and now uses `useWebSocket` for its `NCD.COMMAND` result flow. Native `new WebSocket` construction remains only inside `WebSocketService`.
- `src/components/layout/DashboardLayout.vue` now starts its idle timer reactively when `authUser` becomes available after the first post-login `get_auth_user()` request, fixing auto-logout only working after a page reload. Existing timeout comments/settings were preserved.
- `src/composables/mixins/useNavigation.js` now captures the injected route object during composable setup and reads its current `fullPath` inside each navigation call. Logout no longer calls `useRoute()` outside setup or receives an undefined/stale route.
- `src/router/index.js` guard was re-aligned with `vue2_project/src/router/beforeEach.js`: query-token authentication now resolves before access checks, the active `GlobalStore.beforeEachHook` can block navigation for unsaved thresholds, and limited-access routes are no longer persisted as post-login redirects. The Vue3 MFA early-return behavior remains intact.
- `src/components/pages/NewPasswordForm.vue` now reads the Axios status from `error.status` with `error.response.status` fallback and handles 422 expired-link responses without throwing `Lang.t is not a function`; all notification translations in the file use the existing `tt` API.
- The migrated legacy delta from commit `550d339` was restored after the later `src/` overwrite: Assets/Machines/ProductionLines details again pass plant `id` and use `vertical-fluid`; their forms prioritize the navbar plant; `DXMCommandsTab.vue` sends `CMD0200` without WebSocket setup. `Plants/ItemForm.vue` already retained the removal of `is_blocked`, localization values already matched, and Utilities details remains skipped because no Vue3 counterpart exists. Targeted ESLint, targeted `git diff --check`, and `npm run build` pass.
- Targeted ESLint, `git diff --check`, and `npm run build` pass after the WebSocket re-migration.
- Latest verification during the session: targeted `git diff --check` passed; `npm run build` passed with existing Vite mixed-import/chunk-size warnings.
- Follow-up charts_factory parity fix applied:
  - `src/modules/charts_factory/controllers/Sensor/enums.js` now matches Vue2 for `UNIT_TYPES.ULTRASONIC_G`, `constants.usg`, Banner M25 ultrasound RMS/peak unit mapping, and Banner V2.1 localized short names.
  - `src/modules/charts_factory/controllers/Sensor/classes/FFTChart.js` now returns `USg` for Banner M25 FFT X waveform / transformed acceleration / X acceleration.
  - `src/modules/charts_factory/controllers/Sensor/classes/FFTChart.js` also now uses the Vue2-style RPM cursor drag/update flow: supports `isUpdateOnly`, `serieId` / `pointId`, point title updates, drop-time options sync, and factory-level cursor synchronization.
  - `src/modules/charts_factory/controllers/Sensor/classes/FFTChart.js` now builds FFT analysis annotations from `option_value.value` with `custom_value` fallback, matching Vue2 custom-rule behavior.
  - `src/modules/charts_factory/classes/StatisticsTransformator.js` now initializes `this.requestsList = []` in the base constructor, matching Vue2 and preventing early `setupDataAccessor()` crashes before request injection.
  - `src/views/Sensors/charts/fft/FFTChartItemContainer.vue` now passes the FFT page Highcharts instance into `ChartWrapper`, restoring annotation/draggable-points module availability for draggable FFT annotations.
  - `src/modules/charts_factory/controllers/Sensor/classes/Chart.js` now guards history-series detection against non-string Highcharts series ids, fixing Banner grouped-by-axis chart mount crashes.
  - Other previously listed charts_factory differences were not changed.
  - `git diff --check` for the touched files and `npm run build` pass.

## Files Already Modified
- Current MultiView threshold sync:
  - `src/views/Sensors/charts/MultiView/ThresholdItem.vue`
  - `SESSION_CONTEXT.md`
  - `docs/migration-progress.md`
  - `docs/migration-todos.md`
  - `docs/new-session-handoff.md`
- Current FileUploadBlock ref fix:
  - `src/views/Machines/ItemForm.vue`
  - `src/views/SuccessDashboard/ROIOnePager/ItemForm.vue`
- Current Details runtime-fix files:
  - `src/views/Assets/Details/DetailsPage.vue`
  - `src/views/Machines/Details/DetailsPage.vue`
  - `src/views/ProductionLines/Details/DetailsPage.vue`
  - `SESSION_CONTEXT.md`
  - `docs/migration-progress.md`
  - `docs/migration-todos.md`
  - `docs/new-session-handoff.md`
- Unrelated user-owned dirty files present and left untouched:
  - `src/views/ProductionLines/ItemForm.vue`
  - `src/api/request_factories.js`
  - `src/views/Maintenance/Logs/ItemForm.vue`
  - `src/views/Maintenance/WorkOrders/ItemForm.vue`

## Unresolved Issues
- No more code-level pending note for `Equipments` advanced tabs; runtime smoke-test was explicitly not requested.
- Remaining open items are runtime-only validation:
  - SuccessDashboard Meeting Tracker / ROI One Pager with real data.
  - Sensors list/create/edit/statistics/FFT/chart routes with real data.
  - Settings, Maintenance, Work Order Requests, StoreRooms, Assets/Machines/Equipments flows as listed in docs.
- Legacy `vue2_project/src/views/Sensors/sensorForm/ItemFormPump.vue` is not present as a separate Vue3 file; pump logic is represented inside the migrated ultrasound form stack.
- `src/views/Sensors/FilterBlock/UltrasoundFilterBlock.vue` now restores the legacy DXM/lubrication flow through `useWebSocket`: it subscribes to the user channel before sending the command, tracks lube-shot data/id, handles controller/status-matched completion, updates charts, and closes the socket.

## Next Actionable Step
- Runtime smoke-test Compare threshold creation/editing and verify `acute_samples` / `stable_samples` in the API payload when requested.

## EquipmentsLayout Parity Fix (2026-08-07)
- Restored the separate Storeroom create flow in `src/views/Equipments/EquipmentsLayout.vue`; it opens the Equipment multiform and refetches/closes after successful save.
- `src/views/BrandModels/ItemsList.vue` now configures its form modal and exposes create/delete/refetch methods to parent refs.
- Migrated `src/views/Equipments/SpecialFilterItem.vue` and restored equipment-type secondary filters, merged predefined/raw value IDs, and unmount cleanup.
- Restored `FetchByQuerySelect` server search, fetch-by-id, and load-more behavior for Assets, Brands, and Part Numbers without duplicate `useRequestsList` loaders.
- Removed duplicate RadioButtonsBlock and Datepicker event subscriptions.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite warnings remain.

## Production Line Attachment Ref Fix (2026-08-12)
- `src/views/ProductionLines/AttachmentItem.vue` now registers its nested `FileUploadBlock` through `setSubItemRef` instead of storing a Vue ref object inside the `refsMap` array.
- This fixes `Instance.getFormData is not a function` when saving a Production Line with attachments from `Dashboard/MultiFormWrapper.vue`.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Equipment Card Controller Offline Icon Fix (2026-08-12)
- `src/views/Equipments/Card/CardSensorItem.vue` now checks `controller.is_inactive` through a direct reactive value when deciding whether to render `controller_offline_icon`.
- The shared nested-property resolver treats boolean `true` as empty and returned `null`, so the previous `prop: 'controller.is_inactive'` condition could not pass.
- The two redundant branches for sensor `is_inactive` were reduced to the actual rule: NCD sensor, not archived, inactive controller.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## NCD Sensors Route Fix (2026-08-12)
- `src/router/index.js` again exposes the legacy `/ncd-sensors` list route used by Controllers and keeps `/sensors/ncd` as an alias.
- Restored the legacy `view_controllers` permission; `controllerId` query values continue to initialize list filters through `useItemsData`.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Sensor Type Table Cell Migration Fix (2026-08-12)
- `src/views/Sensors/SensorTypeTableCell.vue` now consumes the `propsData` row and `additionalProps` column contract provided by `DynamicComponentWrapper`.
- Restored dataset-label and MAC rendering plus the alarm color/popover when `ncd_data_set` or `ncd_mac_address` differs from the configured sensor value.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## NCD Sensors List Full Parity Fix (2026-08-12)
- `src/views/Sensors/NCDSensorsList.vue` now opens `AdditionalDetailsNCD.vue` in the classic modal with Save/Cancel actions and list refetch after success.
- Restored filtered authenticated export, singular/plural item names, Plant-change cleanup of `controllerId` and route query, and the legacy NCD edit path.
- `src/components/form/DynamicFormContainer.vue` now handles child/root `handleCloseEditModal` events used by the restored modal flow.
- `src/router/index.js` now includes `/ncd-sensors/:id` with the legacy edit/create permission contract.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## NCD Additional Details RSSI Chart Fix (2026-08-12)
- Restored the missing Connection Strength Trend block in `src/views/Sensors/sensorForm/AdditionalDetailsNCD.vue`.
- The modal again builds `RSSIChart` through `MaintenanceChartFactoryContainer` and `maintenanceChartListsConfig/main`, passing the current sensor id in the chart payload.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## MultiView Statistics Page Full Parity Fix (2026-08-12)
- Rebuilt `src/views/Sensors/MultiViewStatisticsPage.vue` around the legacy MultiView graph model instead of the incorrectly migrated sensor Compare/ChartsListWrapper flow.
- Restored equipment header, MultiView title, date shortcuts/live state/query range setup, metric-system switcher, Spanish Highcharts locale, navbar, per-graph `MultiViewChart`, custom chart headers, no-data mock, and thresholds dialog.
- `src/views/Equipments/Details/DetailsPage.vue` now handles `fetchMultiViews` emitted after threshold saves.
- Removed the invalid standalone `/sensors/:id/multiview` route; MultiView remains under the legacy equipment-details route where its required equipment and MultiView data are supplied.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## MultiView Initial Measurement And Flags Tooltip Fix (2026-08-12)
- `src/views/Sensors/MultiViewStatisticsPage.vue` now normalizes a persisted measurement value to the numeric metric-system id before the first render, so the Metric/Imperial active state is correct after startup.
- The reusable flag hover binding now lives in `src/modules/charts_factory/classes/Chart.js`; `MultiViewChart` invokes it on render, restoring tooltips for flag points drawn below the x-axis while preserving the existing Sensor chart behavior.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Sensors Destructive Actions Confirm Parity Fix (2026-08-13)
- Restored the Vue2 confirmation before `handleResetFrequencySettings` sends the ultrasound frequency reset command.
- The active Sensors confirm audit also restored confirmation before resetting a lube cycle, increasing/decreasing ultrasound gain, and disabling OFF ALARM; enabling OFF ALARM remains immediate as in Vue2.
- Confirm cancellation no longer reaches the corresponding API action. Existing FFT unlock, sensor reset, rebaseline, and manual lubrication confirmations were already present.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.
- Unrelated user-owned dirty file left untouched: `src/views/Equipments/Card/ItemCard.vue`.

## Equipment Statistics Remount Race Fix (2026-08-13)
- `DetailsPage.vue` and `PdmButton.vue` now await equipment/sensor route navigation before changing `detailsComponentKey`, so a remounted `StatisticsPage` starts with the new route params.
- `StatisticsPage.vue` now has one immediate route-param watcher instead of competing mounted/full-route initializers, and sensor loads use a generation token so responses from an obsolete route or unmounted instance cannot mutate current readiness state.
- This prevents overlapping requests from pushing `sensorsReadyCount` past the expected count and collapsing `sensorData` plus its dependent computed state to empty values.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.
- Unrelated user-owned dirty files left untouched: `src/constants/global.js`, `src/views/Equipments/Card/ItemCard.vue`.

## Work Stations Section Migration (2026-08-13)
- Migrated the missing Vue2 Work Stations section into `src/views/WorkStations`: list, modal create/edit form, and a valid standalone item page component.
- Added the `WorkStations` entity contract with `/plants/work-stations` API paths and the dedicated view/create/edit/delete Work Stations permissions.
- Corrected `PlantWorkStationsStore` to retain the Vue2 `work_stations_filters` localStorage key.
- The existing `/work-stations` router entry and sidebar item now resolve to the migrated section; create/edit remains modal-based, matching Vue2.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.
- Unrelated user-owned dirty files left untouched: `src/constants/global.js`, `src/views/Equipments/Card/ItemCard.vue`.

## MultiView Chart Event Handling Fix (2026-08-13)
- `src/views/Sensors/MultiViewStatisticsPage.vue` now consumes the informational `handleChartContainerReady` and `chartLoadEvent` events emitted by its chart wrappers.
- These events have no page-level operation in the Vue2 implementation; handling them locally prevents them from reaching `Equipments/Details/DetailsPage.vue`, whose non-forwarding event handler correctly warned about unknown methods.
- Other MultiView events continue to be processed locally or forwarded to the parent as before.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Vue2 Authentication/API/OneChart Delta Sync (2026-08-13)
- Audited all five current dirty files under `vue2_project`; every functional change targets an already migrated Vue3 component or shared API infrastructure.
- Updated `src/components/pages/Login.vue` to use the new Industrial Matrix dev/prod SSO endpoints; its OAuth API endpoints were already synchronized.
- Updated `src/api/index.js` with the new origin-to-API mapping while preserving `VITE_API_BASE_URL` priority and the existing Vue3 fallback.
- `src/views/Sensors/OneChartPage.vue` already used the new full-height chart bottom margin of `50`; no duplicate edit was needed.
- Skipped only commented diagnostic `console.log` changes in the legacy API wrapper/actions; no functional change or unmigrated file was skipped.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Equipment Card Sensor Actions Migration (2026-08-14)
- Restored the Vue2 event ownership contract: `CardSensorItem` button events continue through `ItemCard`, and `src/views/Equipments/ItemsList.vue` now implements their terminal handlers.
- Migrated confirmation/API/refetch flows for lube-cycle/grease-pack reset, FFT unlock, and runtime reset; the existing Compare action remains intact.
- Migrated `src/views/Equipments/ShotsCounterForm.vue` and restored its dialog, PUT submit, and reactive sensor-card update flow.
- Static event-name audit confirms every actionable `CardSensorItem` config now resolves to a handler; link-only and indicator-only configs require none.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Ultrasound Filter Action Chains Parity Fix (2026-08-14)
- Fully restored the Vue2 action chains in `src/views/Sensors/FilterBlock/UltrasoundFilterBlock.vue`: Gain, History, High Speed, Purge Mode, and Trigger Lube Cycle now have the original permissions, confirmations, requests, and state transitions.
- Corrected the lube-cycle sensor id, WebSocket request settings/payload propagation, controller/status completion handling, lube-shot identification, nested message normalization, retry behavior, and socket cleanup.
- `src/views/Sensors/StatisticsPage.vue` now consumes `update_sensor` and forwards live ultrasound WebSocket data to every mounted `ChartsListWrapper` instance.
- Targeted ESLint, static action/event audit, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Sensor Live-Point Tooltip Fix And Highcharts 12 Follow-up (2026-08-17)
- Live statistics transformations now preserve a `syncLiveChartSeries` setting through the shared chart transform callbacks.
- After Vue applies the updated chart options, `ChartItemContainer.vue` synchronizes each real Highcharts series with the transformed factory data through `series.setData(..., updatePoints=false)` and performs one redraw.
- A follow-up runtime reproduction showed that data synchronization alone was insufficient: Sensor charts combine a shared tooltip with the legacy `stickyTracking: false`, so a newly created Highcharts 12 point can miss the direct-touch tracker path. `SensorChartBase` now overrides `stickyTracking: true`, enabling series/KD-tree hover lookup for both existing and live points without changing non-Sensor chart families.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Sensor FFT Flag Click Fix (2026-08-18)
- Highcharts 12 flags rendered outside the plot area already used the shared manual hover binding, but their configured point-click event could still be skipped by the container tracker.
- `src/modules/charts_factory/classes/Chart.js` now forwards clicks on manually bound flag graphics through `Point.firePointEvent`, supplies the expected `event.point`, and stops propagation to prevent duplicate handling.
- This restores the existing `openFFTCharts` event chain from `ChartItemContainer.vue` to `StatisticsPage.vue` without changing its payload contract.
- An isolated Highcharts flags click assertion, targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## Highcharts Datetime X-Axis And Tooltip 24-Hour Format (2026-08-18)
- `src/config/highcharts.js` now defines global datetime formats with explicit `%H` hours for time-level x-axis ticks and tooltips.
- Highcharts axes display `13:00` instead of locale-derived `01:00 PM`; `flagsData` and other time-level datetime tooltips also use 24-hour time, for example `Tuesday, 18 Aug, 13:00`.
- Day/month/year axis behavior and non-datetime axes remain unchanged. Isolated x-axis and Highstock flags-tooltip assertions, targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## StatisticsPage Before-Mount Lifecycle Parity (2026-08-18)
- `src/views/Sensors/StatisticsPage.vue` now restores the missing Vue 2 `beforeMount` initialization in addition to the already migrated `created` reset.
- Initial statistics filters now enforce the legacy 30-day customer limit and process `source=report`, `dateStart`/`dateFinish`, and NCD `parameter` query values before sensor requests begin.
- Initial route validation, compare/split sensor setup, RPM overlay loading, and navbar setup are restored; the existing route watcher remains responsible only for later route changes, preventing duplicate initial sensor requests.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing Vite mixed-import/chunk-size warnings remain.

## StatisticsPage Date-Only Query Boundaries (2026-08-18)
- Date-only `dateStart` and `dateFinish` query values are now treated as local calendar dates instead of UTC-midnight JavaScript dates.
- A date-only start receives `00:00:00` and a date-only finish receives `23:59:59`; query values that already contain time or timestamps retain the existing conversion path.
- Direct boundary assertions, targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.
