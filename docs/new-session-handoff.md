# New Session Handoff

## Current Objective
- The current seven-file uncommitted `vue2_project` Sensor/chart delta has been fully synced into existing Vue3 counterparts. All changed legacy files were already migrated, so none was skipped.
- The latest one-file `vue2_project` MultiView threshold delta is fully synced into Vue3: Compare thresholds retain acute/stable samples and omit only re-trigger samples. Nothing was skipped.
- Machine and ROI One Pager FileUploadBlock instances now use `setSubItemRef` in their existing `useSubItemsList` flows. The project-wide scan found no remaining component that combines `setSubItemRef` with `ref="fileUploadBlockRef"`.
- Vue2 -> Vue3 migration for `vue2_project/src/views/Sensors` has been completed for the current compile/lint scope.
- Current user instruction was to migrate the folder continuously, with `statistics` and `charts` last; that final stage has now been performed.
- Vue2 -> Vue3 migration for `vue2_project/src/views/Machines` has been completed for the current compile/build scope.
- Vue2 -> Vue3 migration for `vue2_project/src/views/Assets` has been completed for the current compile/build scope.
- Vue2 -> Vue3 migration for `vue2_project/src/views/Settings` has been completed for the current compile/build scope, excluding `vue2_project/src/views/Settings/Import` by user request.
- Vue2 -> Vue3 migration for `vue2_project/src/views/SuccessDashboard` has been completed for the current compile/build scope.
- Vue2 -> Vue3 migration for `vue2_project/src/views/CorporateDashboard` has been completed for the current compile/build scope.
- `src/views/Dashboard/Dashboard.vue` and `src/views/Plants/Details` have been re-migrated because the previous Vue3 version did not follow the legacy parent/child dashboard architecture.
- Ask only when there are disputable points without a suitable migrated pattern/example.

## Mandatory Workflow For Next Session
- Apply changes only after explicit user confirmation.
- Exception: files under `docs/` and `SESSION_CONTEXT.md` may be updated automatically without separate confirmation.
- If there are risks or ambiguous points, ask first and do not apply until confirmed.
- Work one file at a time.
- Diff preview is not required by default.
- Do not print code or diff in responses unless a risk or ambiguity must be discussed.
- After each completed step: report the result and the file path in plain text, then STOP.

Primary rules source:
- `docs/session-collaboration-rules.md`
- Reference examples for `src/views` entity migration: `src/views/Plants`, `src/views/Brands`
- Reference example for `FetchByQuerySelect` / `requestsToDoList` patterns with `hasValueCase`, `bindTo`, and dropdown-triggered full-list reload: `src/views/BrandModels/ItemsList.vue`
- Migration note: when a legacy file loads data for `<FetchByQuerySelect>` through `requestsToDoList` / `requestsListMixin`, do not carry that duplication into Vue3. Move that logic into the component settings (`fetchAction`, `fetchByIdAction`, `bindTo`, etc.) because `src/components/form/FetchByQuerySelect.vue` already handles async option loading.

## Migration State Snapshot
- `Controllers` migration has started:
  - `src/views/Controllers/ItemsList.vue` was added in Vue3 style.
  - It uses `useItemsData`, `useEventHandler`, Pinia `ControllersStore`, and `ENTITIES.Controllers`.
  - Controller-specific list actions were preserved with direct `api_request` calls where no dedicated composable exists yet.
  - `src/views/Controllers/ItemPage.vue` was added in Vue3 style.
  - It uses `useItemPage`, lazy form components, controller type selection from item data or route query, tabs, and multipart payload detection.
  - `src/views/Controllers/ItemForm.vue` was added in Vue3 style for PDM/Banner controllers.
  - It uses `useItemForm`, `useRequestsList`, `useSubItemsList`, and global form controls.
  - `src/views/Controllers/FormulasRow.vue` was added in Vue3 style for PDM/Banner formulas rows.
  - `src/views/Controllers/DXMCommandsTab.vue` was added in Vue3 style for PDM/Banner commands tab.
  - `src/views/Controllers/CommandItem.vue` was added in Vue3 style for DXM command cards.
  - `src/views/Controllers/CommandsHistoryItem.vue` was added in Vue3 style for DXM command history rows.
  - `src/views/Controllers/ItemFormUltraSound.vue` was added in Vue3 style for LubeMatrix controllers.
  - `src/views/Controllers/ItemFormCounter.vue` was added in Vue3 style for OEE controllers.
  - `src/views/Controllers/ItemFormNCD.vue` was added in Vue3 style for NCD controllers.
  - `src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue` was added in Vue3 style for the legacy White River controller form.
  - Controllers routes were enabled in `src/router/index.js`.
  - Controllers sidebar menu entry was enabled in `src/constants/menuItems.js`.
  - Controllers create blank state was fixed: `ItemPage.vue` defaults `/controllers/new` without query type to PDM/Banner and `ItemForm.vue` gates formulas content by tab presence.
  - Controllers devices tab is wired in `src/views/Controllers/ItemForm.vue` and uses migrated `src/views/Sensors/BannerSensorsList.vue` with controller-scoped filters.
- `Sensors` migration is complete for the current Vue3 scope:
  - Latest Manual Route delta is synced: constants/dataset/class/localization, plant/metric helpers, chart parameters/configs, per-metric FFT flags, metadata/RPM rendering, Manual Route API operations, `src/views/Sensors/sensorForm/ItemFormManualRoute.vue`, Equipment form/card behavior, and Statistics/FFT/One Chart adaptations.
  - Latest Manual Route FFT follow-up is synced: dev graph-points default endpoint, line-datetime spline history charts, FFT metadata tooltip in `AnalysisFFTContainer`, and shared tooltip styles.
  - Latest Manual Route history follow-up is synced: velocity and high-frequency acceleration now share one spline chart with two configured Y axes, while base Sensor chart axis setup/limits support per-request data.
  - Latest Manual Route aggregate-page follow-up is synced: equipment details now expose a dedicated Manual Route route/page with separate velocity and high-frequency charts, one series and FFT flags per Manual Route sensor, and Manual Route-aware card/PdM/Statistics/FFT navigation.
  - Latest 2026-08-06 follow-up is synced: FFT neighbour requests preserve Manual Route `metric_type` and reload around the selected FFT; Manual Route/MultiView titles render color legends; one-point Manual Route series show markers; the obsolete static config is removed; and the FFT dev endpoint/shared legend styles are aligned.
  - Manual Route runtime event warnings were fixed locally: page-level chart lifecycle events are consumed, Y-axis zoom is handled by the custom header, unrelated events still propagate, and statistics/FFT points are sorted chronologically to prevent Highcharts error #15.
  - The same Vue2 delta also adds Multiview Alarms notification labels, restricts Banner M25 running thresholds to the supported pair (including loaded-data cleanup), and initializes Meeting Tracker PDF `plant_id` from props.
  - Targeted ESLint, `git diff --check`, and production Vite build pass on Node 24; only existing mixed-import/chunk-size warnings remain.
  - Targeted ESLint, targeted `git diff --check`, and the production Vite build pass on Node 24 for the Manual Route sync.
  - Added `src/composables/useSensors.js` for sensor-specific API requests.
  - Added Pinia filter/state actions to `src/stores/SensorsStore.js`.
  - Added generic `set_filters` support to `src/stores/mixins/commonStoreMixin.js`.
  - Added `src/views/Sensors/ItemsList.vue`, `NCDSensorsList.vue`, and `BannerSensorsList.vue` in Vue3 style.
  - Added `src/views/Sensors/ItemPage.vue` and base sensor forms under `src/views/Sensors/sensorForm`.
  - Added threshold/level-zone support files: `ThresholdPeriodItem.vue`, `LevelZoneForm.vue`, `LevelZoneFormWrapper.vue`, and empty legacy-compatible `ReportBlock.vue`.
  - Added table-cell/action helpers: `SensorFFTRequestButton.vue`, `SensorFirmwareStatusCell.vue`, `SensorTypeTableCell.vue`.
  - Added `src/views/Sensors/FilterBlock/FFTRequestBlock.vue` as the list-level FFT request dialog.
  - Added chart support wrappers under `src/components/charts` and `src/views/Sensors/charts`.
  - Added final statistics/chart pages: `StatisticsPage.vue`, `FFTStatisticsPage.vue`, `MultiViewStatisticsPage.vue`, and `OneChartPage.vue`.
  - `FFTStatisticsPage.vue` and `src/views/Sensors/charts/fft` were re-aligned toward Vue2 behavior for page header/controls, prev/next FFT navigation, FFT chart cursor/peaks/periodic/waveform/RPM cursor flow, vibration-analysis rule override save/delete, and waterfall 3D controls.
  - `src/views/Sensors/charts/fft/FFTChartItemContainer.vue` passes `additionalProps.hcInstance` into `ChartWrapper`, so FFT annotations use the Highcharts instance initialized with `annotations` and `draggable-points`.
  - `src/modules/charts_factory/controllers/Sensor/classes/Chart.js` guards history-series detection against numeric/non-string Highcharts series ids, which are reachable in Banner grouped-by-axis chart rendering.
  - Added Analysis FFT helpers and statistics filter blocks.
  - Enabled `/sensors`, `/sensors/new`, `/sensors/:id`, `/sensors/ncd`, `/sensors/:id/fft`, `/sensors/:id/stats`, `/sensors/:id/multiview`, and `/sensors/:id/chart` routes.
  - FFT compatibility routes `/ncd/:id/fft/:fftId` and `/banner/:id/fft/:fftId` are enabled for legacy links and prev/next navigation.
  - Enabled Sensors sidebar menu entry.
  - Legacy Sensors-local mixin files were not copied as mixins; their behavior was folded into Vue3 components/composables, primarily `src/composables/useSensors.js`.
- `BrandModels` details stack is now migrated in Vue3:
  - `src/views/BrandModels/Details/MoveForm.vue`
  - `src/views/BrandModels/Details/LocationList.vue`
  - `src/views/BrandModels/Details/DetailsPage.vue`
- Route for `BrandModelDetailsPage` is enabled in `src/router/index.js`.
- `src/config/entities.js` now includes `Assets`, `StoreRooms`, and `Equipments` to support the migrated details flow and remove local endpoint hardcodes.
- Runtime fix applied: `src/components/itemDetails/ItemImagesBlock.vue` now imports `Lang.tt`, which resolved the `_ctx.tt is not a function` crash on `BrandModelDetailsPage`.
- Supporting request/item-card infrastructure from the earlier `BrandModels` migration remains active and was reused by the details stack.
- Migrated ItemCard files were re-aligned with Vue2 `itemCardMixin` behavior:
  - `src/composables/mixins/useItemCard.js` supports Vue3 reset callbacks.
  - `src/views/Assets/ItemCard.vue`, `src/views/Machines/ItemCard.vue`, `src/views/ProductionLines/ItemCard.vue`, and `src/views/BrandModels/ItemCard.vue` use shared title-click handling with Pinia page resets where applicable.
  - `src/views/Processes/ItemCard.vue` uses shared preview modal handling and restores the image overlay.
  - `npm run build` and targeted `git diff --check` pass after this follow-up.
- `src/components/common/Datepicker.vue` now lazy-mounts Element Plus `el-date-picker` after first interaction, using a lightweight div placeholder styled like the datepicker input with icons from `@element-plus/icons-vue` before activation to reduce initial DOM from eager calendar panels.
- Latest Sensors/chart/sub-item Vue2 changes were synced into Vue3:
  - `src/composables/mixins/useSubItemsList.js` normalizes boolean `setIfEmpty` false values to `0`.
  - `src/modules/charts_factory/controllers/Sensor/classes/Chart.js` handles `oneChartOnly` by disabling navigator/scrollbar and enabling x panning.
  - `src/views/Sensors/charts/ChartsListWrapper.vue` guards `getParamsByIds`, passes computed per-chart `additionalProps`, and hides chart headers for single one-chart results.
  - `src/views/Sensors/sensorForm/ItemForm.vue` limits Banner M25 running-threshold parameters to the updated Vue2 subset.
  - `vue2_project/src/modules/charts_factory/controllers/Sensor/methods.js` had only whitespace change; no Vue3 functional change was needed.
  - WebSocket transport was re-migrated from `vue2_project/src/services/WebSocketService.js` into `src/services/WebSocketService.js`, preserving channel auth, private/presence channels, reconnect/resubscribe, heartbeat, and event dispatch with Vite environment adaptation.
  - `src/composables/mixins/useWebSocket.js` now acts as the Vue Composition API wrapper around that service while retaining the existing Vue3 consumer API.
  - Channel callbacks are normalized centrally to the `{ type, data }` message contract expected by all audited Vue3 WebSocket consumers.
  - Consumer `onOpen` now runs after successful channel subscription rather than raw transport connection, matching the legacy DXM/FFT request ordering; `localHandleConnected` remains available for transport state.
  - `src/views/Sensors/FilterBlock/UltrasoundFilterBlock.vue` now restores the legacy DXM/lubrication socket-completion flow through the re-migrated wrapper, including pre-request subscription, lube-shot/controller/status matching, chart update forwarding, and socket cleanup.
  - Full active-consumer scan found and migrated the remaining direct native socket in `src/views/Sensors/ItemPage.vue`; its NCD save-status flow now uses `useWebSocket`, and native socket construction remains only inside `WebSocketService`.
  - `src/components/layout/DashboardLayout.vue` now reacts to `authUser` becoming available after first login and starts the idle timer without requiring a page reload; duplicate timer creation is guarded and existing timeout comments/settings are unchanged.
  - `src/composables/mixins/useNavigation.js` now obtains the route during setup and reads the latest `fullPath` for every navigation request, so delayed auto-logout no longer invokes `useRoute()` outside setup or stores a stale redirect path.
  - `src/router/index.js` now restores the Vue2 query-token authentication and global navigation-hook flow, including unsaved-threshold route blocking, and no longer stores permission-denied destinations in `redirectTo`; the corrected Vue3 MFA early return is preserved.
  - `src/components/pages/NewPasswordForm.vue` now safely extracts Axios status for expired reset-token handling and uses `tt` instead of the nonexistent `Lang.t`, so a 422 response shows the intended warning and redirect rather than an uncaught TypeError.
  - The migrated legacy delta from commit `550d339` was restored after a later `src/` overwrite: Assets/Machines/ProductionLines navbar/form changes and the Controllers `CMD0200` WebSocket bypass are present again. Plants already retained the `is_blocked` removal, localization values already matched, and Utilities details remains skipped because no Vue3 counterpart exists.
  - `npm run build` and targeted `git diff --check` pass after this sync.
- Latest Vue2 sync completed on 2026-08-04:
  - `src/constants/global.js`, `src/localization/loc_eng.js`, and `src/localization/loc_spanish.js` now include real-time notification type `MULTI_VIEW_ALARMS` (`27`) and its labels.
  - `src/views/Requisitions/Details/MaterialItem.vue` no longer declares unused `targetPropName`.
  - `src/views/Sensors/sensorForm/ItemForm.vue` limits Banner M25 selectable and loaded running thresholds to Ultrasound RMS and High Frequency RMS Acceleration.
  - `src/views/SuccessDashboard/MeetingTracker/AddPdfFileForm.vue` initializes `plant_id` from `plantId`.
  - Targeted ESLint, targeted `git diff --check`, and the Node 24 production build pass; existing Vite mixed-import/chunk-size warnings remain.
- Asset/Machine/Production Line Details runtime fix: their `chartLegendEvents` placeholders are now arrays, matching the `ItemPDMsStatisticBlock` prop and chart factory API. This removes the invalid-prop warning and `eventsList.forEach` error; targeted ESLint, targeted `git diff --check`, and the Node 24 production build pass.
- Follow-up charts_factory parity fix applied:
  - `src/modules/charts_factory/controllers/Sensor/enums.js` now matches Vue2 for `UNIT_TYPES.ULTRASONIC_G`, `constants.usg`, Banner M25 ultrasound RMS/peak unit mapping, and Banner V2.1 localized short names.
  - `src/modules/charts_factory/controllers/Sensor/classes/FFTChart.js` now returns `USg` for Banner M25 FFT X waveform / transformed acceleration / X acceleration.
  - `src/modules/charts_factory/controllers/Sensor/classes/FFTChart.js` now uses the Vue2-style RPM cursor drag/update flow with `isUpdateOnly`, `serieId` / `pointId`, direct point title updates, drop-time options sync, and factory-level cursor synchronization.
  - `src/modules/charts_factory/controllers/Sensor/classes/FFTChart.js` now builds FFT analysis annotations from `option_value.value` with `custom_value` fallback, matching Vue2 custom-rule behavior.
  - `src/modules/charts_factory/classes/StatisticsTransformator.js` now initializes `this.requestsList = []` in the base constructor, matching Vue2 and preventing early `setupDataAccessor()` crashes before request injection.
  - Other previously reported charts_factory differences were not changed.
  - `npm run build` and targeted `git diff --check` pass.
- `Processes/Details` section is migrated for the current Vue3 compile scope:
  - `src/views/Processes/Details/DetailsPage.vue`
  - `src/views/Processes/Details/DashboardPage.vue`
  - `src/views/Processes/Details/ChartItemContainer.vue`
  - `src/views/Processes/Details/LogsList.vue`
  - `src/views/Processes/Details/EventLogForm.vue`
  - `src/views/Processes/Details/EditBreakTimeForm.vue`
  - `src/composables/useProcesses.js`
  - `src/stores/ProcessesStore.js` now has statistics and downtime filters.
  - `src/router/index.js` now enables `/processes/:id/details`, `/processes/:id/details/dashboard`, and `/processes/:id/details/logs`.
  - `npm run build`, targeted `git diff --check`, and migration-rule scan pass.
- Latest Vue2-side changes were synced into already migrated Vue3 files:
  - `src/modules/charts_factory/classes/Chart.js` now emits chart error events.
  - `src/modules/charts_factory/controllers/Sensor/classes/Chart.js` now emits chart errors instead of marking statistics responses ready after fetch failure.
  - `src/views/Sensors/charts/ChartItemContainer.vue` writes `window.graphRenderError` before initial render completes and clears it after render.
  - `src/composables/useSensors.js` now exposes `detachSensor()`.
  - `src/views/Equipments/ItemFormWrapper.vue` detaches sensors from equipment instead of deleting them.
  - `src/views/Sensors/sensorForm/ItemForm.vue` restores initial setup guarding in the `itemData` watcher.
  - `src/views/Sensors/sensorForm/ItemFormUltraSound.vue` sends LubeMatrix V4 child payloads as Banner type with parent dataset.
  - The FFT statistics API base URL change was already present in Vue3.
- Latest Requisitions-related Vue2-side changes were synced into already migrated Vue3 files:
  - `src/constants/date_time.js` exposes `datePickerAdditionalShortcuts2()` for last 1/6/12 month shortcuts.
  - `src/helpers/index.js` supports `last_6_months` in `getDateRange`.
  - Requisition approve form now includes downtime/hour, hours saved, contractor quote, and paired downtime/hour + hours-saved validation.
  - Requisition Work Order print report now includes those fields.
  - ROI Calculator was re-aligned with the updated Vue2 flow for technician-only users, work-order selector, combined shortcuts, updated result field names, applied list filters, and PDF export payload.
  - Vue3 localization already had the relevant new Requisitions/constants keys.
- Latest Machine/Plant/ProductionLine/Requisitions Vue2-side changes were synced into already migrated Vue3 files:
  - `src/views/Machines/ItemForm.vue` and `src/views/ProductionLines/ItemForm.vue` support `is_silence_mode` / `silence_mode_until`, restrict silence dates to today/future, and normalize `silence_mode_until` on submit.
  - `src/views/Plants/ItemForm.vue` no longer exposes `is_blocked`; the later Vue2 change in `550d339` removed that field.
  - `src/views/Requisitions/ItemsList.vue`, `src/views/Requisitions/Details/WorkOrderReportForPrint.vue`, and `src/views/Requisitions/ROICalculator/ItemsList.vue` use `execution_total_time` for Hours.
  - Vue3 localization already had `phrases.silence_mode` and `phrases.silence_mode_until`.
- `Plants Dashboard/Details` is re-migrated for the current Vue3 compile scope:
  - `src/views/Dashboard/Dashboard.vue` again acts as the plant dashboard container: it resolves the active plant from auth/global filters, fetches `plantItem`, resets child list filters on plant changes, and passes `plantItem`, `plantId`, and `additionalModalSettings` into the nested route.
  - `src/views/Plants/Details/DetailsPage.vue` now follows the legacy nested content role: it primarily consumes `plantItem` from the parent and renders PDM health, counters, embedded EquipmentsLayout/Assets/Machines/ProductionLines/Utilities lists, and Maintenance tabs. It keeps only a fallback fetch for direct `/plants/:id/details`.
  - Plant details now uses `src/views/Equipments/EquipmentsLayout.vue` for equipments, matching Vue2. The temporary local `src/views/Plants/Details/EquipmentsList.vue` was removed; Equipments list ownership stays under `src/views/Equipments`.
  - `src/views/Equipments/EquipmentsLayout.vue` and `src/views/Equipments/ItemsList.vue` were added as the first Vue3 Equipments migration step. Layout owns the original-style dropdown/filter toolbar with `useRequestsList` + `initiateRequestsToDoList`; nested list uses `/equipments/dashboard` with `prepareEquipmentsList`.
  - `src/views/Equipments/Card` now has the grid-card scope, and `src/views/Equipments/ItemPage.vue`, `ItemFormWrapper.vue`, and `ItemForm.vue` cover the create/edit scope. Code-level recheck confirms RPM controls, vibration analysis rules, child component/type-related submit, PDM sensor tab wiring, sensor detach flow, and Multi View tab submit are present; runtime smoke-test was not performed.
  - `vue2_project/src/views/Equipments/Details` has been migrated into `src/views/Equipments/Details` for the current Vue3 compile scope, including DetailsPage, EquipmentInfoBlock, Quote/Service tab, crossover/analogues tables, move history, PDM buttons, `/equipments/:id/details/*` nested routes, `equipment_mock.jpg`, and Sensors statistics route-param compatibility for nested PDM/multiview links.
  - `src/router/index.js` enables `/dashboard/equipments` for the migrated list and `/equipments/:id/details` nested details routes.
  - `src/views/Dashboard/MultiFormWrapper.vue` and `MultiFormItemWrapper.vue` were migrated from Vue2 for dashboard create/edit flows. `ProductionLines`, `Machines`, `Assets`, and `Equipments` lists now open the multiform modal; child forms receive parent instance data for chained ids.
  - Equipment edit inside the multiform now force-fetches `/equipments/:id` before rendering `Equipments/ItemFormWrapper`, because list rows are not full form payloads.
  - `src/composables/mixins/useMainInstanceDetailsPage.js` now opens Maintenance Work Order modals with `formComponentFileLoader` instead of legacy `componentPath`.
  - `npm run build` and targeted `git diff --check` pass after the re-migration.
- `Maintenance` section is migrated for the current Vue3 compile scope:
	- `src/views/Maintenance/WorkOrdersImport/ItemPage.vue` and `ImportOptionsContainer.vue` were re-migrated toward Vue2 parity with selected-plant gating, shared upload/start/revert/progress handling, and drag-and-drop column mapping; shared Import components accept the maintenance upload action as a function. Targeted ESLint, targeted `git diff --check`, and the Node 24 production build pass.
	- Added `src/composables/useMaintenance.js`.
  - Added `src/views/Maintenance/MaintenanceDashboard.vue` and `MaintenanceFormWrapper.vue`.
  - Added logs list/form/details and support cells/previews under `src/views/Maintenance/Logs`.
  - Added work-orders list/form/details/import and support files under `src/views/Maintenance/WorkOrders`.
  - Added Maintenance entity configs for logs and work orders in `src/config/entities.js`.
  - Enabled Maintenance routes in `src/router/index.js`.
  - Enabled CMMS/Maintenance sidebar menu entries in `src/constants/menuItems.js`.
  - Wired `src/components/itemDetails/MaintenanceListWrapper.vue` to migrated lists.
  - Hardened `src/views/Maintenance/WorkOrders/ItemForm.vue` with attachments/images, parts, snooze, recurring periods/dates, task procedure selection, `users_ids`, main-instance validation, and multipart payload handling.
  - Re-checked `src/views/Maintenance/WorkOrders/ItemForm.vue` against Vue2 and restored missing behavior: `showJustInfo`, filtered statuses, task procedure info/dialog, technician users/teams tabs, create Part/WO Type modal callbacks, legacy snooze-change UI, equipment card grouping, and recurring period-date submit normalization.
  - Hardened `src/views/Maintenance/Logs/ItemForm.vue` with total/start-finish time handling, attachments/images, supervisor/sanitization/acknowledge/shift flags, breakdown type, main-instance validation, and multipart payload handling.
  - Hardened `src/views/Maintenance/WorkOrders/ItemsList.vue` with production line/machine/asset/equipment filters, category "Without Category" option, filtered status options, plant guard for create/export, closer legacy table columns, details/preview actions, and Vue3 async-select settings for asset/equipment lookup.
  - Hardened `src/views/Maintenance/Logs/ItemsList.vue` with production line/machine/asset/equipment filters, plant/date guard for export, closer legacy table columns, file and parent work-order actions, log/parent preview modals, and Vue3 async-select settings for asset/equipment lookup.
  - Migrated `vue2_project/src/views/WorkOrderRequests` into Vue3 with list, form, convert form, details preview, entity config, maintenance composable actions, `/maintenance-requests` route, and sidebar menu entry.
  - Migrated `vue2_project/src/views/StoreRooms` into Vue3 with list, form, item page, location subitem, `/store-rooms` routes, `/store-rooms/:id/items` route, and sidebar menu entry.
  - Migrated `vue2_project/src/views/Requisitions` into Vue3 with dashboard, list, item page, requisition form, details/action forms, counters, ROI calculator, `usePlantRequisitions`, entity config, routes, and sidebar menu entries.
  - Migrated `vue2_project/src/views/RFQS` into Vue3 with list, form, item page, `useRfqs`, entity config, `/rfqs` routes, and sidebar menu entry.
  - Migrated `vue2_project/src/views/ProductionLines` into Vue3 with list/grid, form, item page, item card, utility wrapper, details page, support subitems, `useProductionLines`, store filter extensions, and routes.
  - Migrated `vue2_project/src/views/Machines` into Vue3 with list/grid, form, item page, details page, attachment/character subitems, `useMachines`, machine mock image asset, dashboard route reuse, and machine create/edit/details routes.
  - Migrated `vue2_project/src/views/Assets` into Vue3 with list/grid, form, item page, details page, attachment/composed subitems, `useAssets`, Assets store statistics filters, dashboard assets route, and asset create/edit/details routes.
  - Migrated `vue2_project/src/views/Settings` into Vue3 except `Settings/Import`, with Settings shell navigation, Faults/NCD Faults, Custom Formulas, Back-End Register Writing, Bearings, Lube Types, Industrial Services, Statistics export, Banner V2 Subtypes, `useSettings`, entity configs, routes, and Settings sidebar menu entry.
  - Migrated `vue2_project/src/views/SuccessDashboard` into Vue3 with Success Dashboard container, MainDashboard, MeetingTracker, ROIOnePager, ROIAnalysis placeholder files, shared common components, `useSuccessDashboard`, entity configs, routes, and Customer Success sidebar menu entry.
	- `npm run build` and `git diff --check` pass.
- `Library` section is migrated for the current Vue3 compile scope:
	- Added `src/views/Library/ItemsList.vue` with the legacy list columns, file links, and resource-type display.
	- Added `src/composables/useLibrary.js`, `ENTITIES.Library`, corrected `libraries_filters` persistence, `/library` routing, and the Asset Management menu entry.
	- Targeted ESLint, targeted `git diff --check`, and the Node 24 production build pass.
- `ProductionLines` list/card runtime alignment was refreshed against the Vue2 original:
  - `src/views/ProductionLines/ItemsList.vue` now restores the legacy `View` table/card actions, sets child filters for Machines/Assets/Equipments from the selected production line, and navigates through Vue Router instead of direct `pushState`.
  - `src/views/ProductionLines/ItemCard.vue` resets child list pages through Pinia stores instead of the old Vuex `setFiltersViaList` path.
  - `src/composables/mixins/useItemCard.js` now falls back to router navigation when a card does not pass a custom `changeRoute`.
  - `src/components/gridTable/ItemsGridContainer.vue` now supports explicit `componentFileLoader: () => import(...)` for item cards, with `import.meta.glob` only as a fallback; `ProductionLines/ItemsList.vue` passes `() => import('@/views/ProductionLines/ItemCard.vue')`.
  - Dropdown location loading is deferred after opening starts so clicking the additional filters button opens the dropdown first.
  - `npm run build` and targeted `git diff --check` pass after this update.
- `CorporateDashboard` section is migrated for the current Vue3 compile scope:
  - Added `src/views/CorporateDashboard/CorporateDashboard.vue`.
  - Added `src/views/CorporateDashboard/Details/CorporateMain.vue`.
  - Added `src/views/CorporateDashboard/Details/PlantDetailsItem.vue`.
  - Enabled `/corporate/main` route in `src/router/index.js`.
  - Enabled Corporate View sidebar/menu entry in `src/constants/menuItems.js`.
  - Added `view_corporate` mapping in `src/utils/hasAccessTo.js`.
  - The migration uses Pinia `AuthStore`, `GlobalStore`, `PlantsStore`, existing `api_request`, existing `useEventHandler`, and already migrated `ItemPDMsStatisticBlock`, `Counters`, and `ROIStatisticsContainer`.
  - `npm run build` and targeted `git diff --check` pass.

## Latest Completed Files
- `src/views/CorporateDashboard/CorporateDashboard.vue`
- `src/views/CorporateDashboard/Details/CorporateMain.vue`
- `src/views/CorporateDashboard/Details/PlantDetailsItem.vue`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/utils/hasAccessTo.js`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue`
- `src/views/Controllers/ItemFormNCD.vue`
- `src/views/Controllers/ItemFormCounter.vue`
- `src/views/Controllers/ItemFormUltraSound.vue`
- `src/views/Controllers/CommandsHistoryItem.vue`
- `src/views/Controllers/CommandItem.vue`
- `src/views/Controllers/DXMCommandsTab.vue`
- `src/views/Controllers/FormulasRow.vue`
- `src/views/Controllers/ItemForm.vue`
- `src/views/Controllers/ItemPage.vue`
- `src/views/Controllers/ItemsList.vue`
- `src/views/BrandModels/Details/MoveForm.vue`
- `src/config/entities.js`
- `src/views/BrandModels/Details/LocationList.vue`
- `src/views/BrandModels/Details/DetailsPage.vue`
- `src/router/index.js`
- `src/components/itemDetails/ItemImagesBlock.vue`
- `src/views/Maintenance/**`
- `src/views/Maintenance/WorkOrders/ItemsList.vue`
- `src/views/Maintenance/Logs/ItemsList.vue`
- `src/views/WorkOrderRequests/**`
- `src/views/StoreRooms/**`
- `src/views/Requisitions/**`
- `src/composables/usePlantRequisitions.js`
- `src/views/RFQS/**`
- `src/composables/useRfqs.js`
- `src/views/ProductionLines/**`
- `src/composables/mixins/useItemCard.js`
- `src/composables/useProductionLines.js`
- `src/views/Machines/**`
- `src/composables/useMachines.js`
- `src/assets/img/machine_mock.jpg`
- `src/views/Assets/**`
- `src/composables/useAssets.js`
- `src/stores/AssetsStore.js`
- `src/stores/ProductionLinesStore.js`
- `src/composables/useMaintenance.js`
- `src/components/itemDetails/MaintenanceListWrapper.vue`
- `src/views/Settings/**`
- `src/composables/useSettings.js`
- `src/config/entities.js`
- `src/views/SuccessDashboard/**`
- `src/composables/useSuccessDashboard.js`
- `src/views/Plants/Details/DetailsPage.vue`
- `src/views/Dashboard/Dashboard.vue`
- `src/composables/mixins/useMainInstanceDetailsPage.js`
- `src/views/Equipments/Details/**`
- `src/assets/img/equipment_mock.jpg`
- `src/views/Sensors/StatisticsPage.vue`
- `src/views/Sensors/MultiViewStatisticsPage.vue`

## Recommended Next Focus
- Runtime smoke-test Settings with authenticated real data, especially Back-End Register Writing, Custom Formulas save, Industrial Services image upload/delete, Banner V2 Subtypes IO parameters, and Faults/NCD Faults save flows.
- Runtime smoke-test Maintenance Work Orders/Logs, Work Order Requests, and StoreRooms with authenticated real data.
- Smoke-test Assets list/create/edit/details with authenticated real data, especially machine/location binding, library uploads, create Work Order action, and reorder.
- Smoke-test Machines list/create/edit/details with authenticated real data, especially uploads, create Application modal callback, create Work Order action, and reorder.
- Smoke-test Equipments details with authenticated real data, especially main/quote/service tabs, Move modal, PDM links, multiview links, crossover lists, RFQ submission, and maintenance/history sections.
- Smoke-test Sensors list/create/edit/statistics/FFT/chart routes in browser.
- Smoke-test Corporate Dashboard `/corporate/main` with authenticated data, especially company filter selection, date range, all-plants summary, print view, and per-plant ROI/PDM/counters rendering.
- Runtime-check chart/statistics flows against production data after the code-level parity fixes already applied to Sensors and SuccessDashboard charts.
- Do not reopen completed `BrandModels` details work unless a new issue is reported.

## Build Status
- `npm run build` passes after follow-up compile fixes.
- Follow-up fixes touched Sidebar, Machines compile-only legacy files, chart factory API imports, and missing shared helper exports.
- Latest Manual Route aggregate-page Vue2 sync passes targeted ESLint, `git diff --check`, and production Vite build on Node 24.
- Latest seven-file Sensor/chart Vue2 sync passes targeted ESLint, migration-rule scan, `git diff --check`, and production Vite build on Node 24; only existing Vite warnings remain.

## Files Already Modified In This Migration Batch
- Current 2026-08-06 Sensor/chart sync files: `src/assets/sass/common/common-blocks.scss`, `src/modules/charts_factory/controllers/Sensor/api/index.js`, `src/modules/charts_factory/controllers/Sensor/chartsListsConfig.js`, `src/modules/charts_factory/controllers/Sensor/classes/Chart.js`, `src/modules/charts_factory/controllers/Sensor/classes/ChartFactoryContainer.js`, `src/views/Sensors/FFTStatisticsPage.vue`, and `src/views/Sensors/charts/ManualRoute/ManualRouteChartItemHeader.vue`.
- Latest FileUploadBlock template-ref fix passes targeted ESLint, targeted `git diff --check`, and production Vite build on Node 24.
- Latest FileUploadBlock template-ref fix passes targeted ESLint, targeted `git diff --check`, and production Vite build on Node 24.
- Latest MultiView threshold sync passes targeted ESLint, migration-rule scan, targeted `git diff --check`, and production Vite build on Node 24.

## Files Already Modified In This Migration Batch
- Latest MultiView threshold sync: `src/views/Sensors/charts/MultiView/ThresholdItem.vue`.
- Latest FileUploadBlock ref fix: `src/views/Machines/ItemForm.vue` and `src/views/SuccessDashboard/ROIOnePager/ItemForm.vue`.
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/composables/useSensors.js`
- `src/stores/SensorsStore.js`
- `src/stores/mixins/commonStoreMixin.js`
- `src/components/common/DynamicComponentWrapper.vue`
- `src/views/Sensors/ItemsList.vue`
- `src/views/Sensors/NCDSensorsList.vue`
- `src/views/Sensors/BannerSensorsList.vue`
- `src/views/Sensors/ItemPage.vue`
- `src/views/Sensors/FilterBlock/FFTRequestBlock.vue`
- `src/views/Sensors/FilterBlock/BannerFilterBlock.vue`
- `src/views/Sensors/FilterBlock/CustomPDMFilterBlock.vue`
- `src/views/Sensors/FilterBlock/PDFandFFTrequestsBlock.vue`
- `src/views/Sensors/FilterBlock/RPMSettingsDialog.vue`
- `src/views/Sensors/FilterBlock/UltrasoundFilterBlock.vue`
- `src/views/Sensors/StatisticsPage.vue`
- `src/views/Sensors/FFTStatisticsPage.vue`
- `src/views/Sensors/ManualRouteStatisticsPage.vue`
- `src/views/Sensors/charts/ManualRoute/ManualRouteChartItemHeader.vue`
- `src/views/Sensors/MultiViewStatisticsPage.vue`
- `src/views/Sensors/OneChartPage.vue`
- `src/views/Sensors/ChartMessageForm.vue`
- `src/views/Sensors/PossibleProblemsBlock.vue`
- `src/views/Sensors/AnalysisFFT/AnalysisFFTContainer.vue`
- `src/views/Sensors/AnalysisFFT/ChildComponentItem.vue`
- `src/views/Sensors/AnalysisFFT/TypeOptionValueItem.vue`
- `src/views/Sensors/charts/ChartItemContainer.vue`
- `src/views/Sensors/charts/ChartsListWrapper.vue`
- `src/views/Sensors/charts/UpdateThresholdsDialog.vue`
- `src/views/Sensors/charts/pdmChartSettingsFactory.js`
- `src/views/Sensors/charts/fft/ChartFFTAnalysisRulesBar.vue`
- `src/views/Sensors/charts/fft/FFTChartItemContainer.vue`
- `src/views/Sensors/charts/fft/FFTChartsListWrapper.vue`
- `src/views/Sensors/charts/fft/WaterfallStatisticsContainer.vue`
- `src/components/charts/ChartsPreloader.vue`
- `src/components/charts/CommonChartItemContainer.vue`
- `src/components/charts/CommonChartItemWrapper.vue`
- `src/views/Sensors/SensorFFTRequestButton.vue`
- `src/views/Sensors/SensorFirmwareStatusCell.vue`
- `src/views/Sensors/SensorTypeTableCell.vue`
- `src/views/Sensors/ThresholdPeriodItem.vue`
- `src/views/Sensors/LevelZoneForm.vue`
- `src/views/Sensors/LevelZoneFormWrapper.vue`
- `src/views/Sensors/ReportBlock.vue`
- `src/views/UserRoles/ItemForm.vue`
- `src/views/UserRoles/PermissionItem.vue`
- `src/views/Sensors/sensorForm/BannerSensorItemWrapper.vue`
- `src/views/Sensors/sensorForm/ItemForm.vue`
- `src/views/Sensors/sensorForm/ItemFormNCD.vue`
- `src/views/Sensors/sensorForm/ItemFormUltraSound.vue`
- `src/views/Sensors/sensorForm/ItemFormWrapper.vue`
- `src/views/Sensors/sensorForm/RunningThresholdItem.vue`
- `src/views/Sensors/sensorForm/SubTypeParameterItem.vue`
- `src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue`
- `src/views/Controllers/ItemFormNCD.vue`
- `src/views/Controllers/ItemFormCounter.vue`
- `src/views/Controllers/ItemFormUltraSound.vue`
- `src/views/Controllers/CommandsHistoryItem.vue`
- `src/views/Controllers/CommandItem.vue`
- `src/views/Controllers/DXMCommandsTab.vue`
- `src/views/Controllers/FormulasRow.vue`
- `src/views/Controllers/ItemForm.vue`
- `src/views/Controllers/ItemPage.vue`
- `src/views/Controllers/ItemsList.vue`
- `src/views/BrandModels/ItemsList.vue`
- `src/views/BrandModels/ItemForm.vue`
- `src/views/BrandModels/ItemPage.vue`
- `src/views/BrandModels/TypeOptionValueItem.vue`
- `src/views/BrandModels/TypeMediaValueItem.vue`
- `src/views/BrandModels/ItemCard.vue`
- `src/views/BrandModels/StoreroomWrapper.vue`
- `src/views/BrandModels/Details/MoveForm.vue`
- `src/views/BrandModels/Details/LocationList.vue`
- `src/views/BrandModels/Details/DetailsPage.vue`
- `src/views/Maintenance/MaintenanceFormWrapper.vue`
- `src/views/Maintenance/Logs/ItemForm.vue`
- `src/views/Maintenance/WorkOrders/ItemForm.vue`
- `src/config/entities.js`
- `src/components/form/FetchByQuerySelect.vue`
- `src/components/itemDetails/ItemImagesBlock.vue`
- `src/composables/requests/useAsyncSelect.js`
- `src/composables/requests/useRequestBinding.js`
- `src/composables/requests/executeRequestAction.js`
- `src/composables/mixins/useRequestsList.js`
- `src/composables/mixins/useItemsData.js`
- `src/composables/useDeferredRequestScheduler.js`
- `src/composables/mixins/useItemCard.js`
- `src/composables/mixins/useHelpers.js`
- `src/helpers/specialHelpers.js`
- `src/stores/mixins/commonStoreMixin.js`
- `src/router/index.js`

## Docs To Keep Updating
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/session-collaboration-rules.md` (if process changes again)
- `SESSION_CONTEXT.md`

## Latest EquipmentsLayout Fix (2026-08-07)
- `src/views/Equipments/EquipmentsLayout.vue` now preserves the Vue2 Asset/Storeroom create split; Storeroom creation opens the Equipment multiform with list refetch and modal close callbacks.
- `src/views/BrandModels/ItemsList.vue` exposes create/delete/refetch and has a valid ItemForm modal loader/success flow.
- `src/views/Equipments/SpecialFilterItem.vue` was migrated and reconnected through the secondary-filter slot, including combined predefined/raw option IDs and cleanup.
- Asset/Brand/Part Number selectors again use `FetchByQuerySelect` with server search, fetch-by-id, and load-more; their duplicate request-list loaders were removed.
- Duplicate RadioButtonsBlock/Datepicker listeners were removed.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass; existing warnings remain.

## Latest Production Line Runtime Fix (2026-08-12)
- Fixed nested attachment upload ref registration in `src/views/ProductionLines/AttachmentItem.vue`.
- The attachment now stores the exposed `FileUploadBlock` instance in `refsMap`, so nested `useSubItemsList` collection can call `getFormData()` in the dashboard multiform flow.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Equipment Card Runtime Fix (2026-08-12)
- Fixed `controller_offline_icon` visibility in `src/views/Equipments/Card/CardSensorItem.vue` by using the direct reactive `controller.is_inactive` value.
- The shared nested-property resolver converted boolean `true` to `null`; the local condition now expresses the effective NCD/not-archived/controller-inactive rule without redundant sensor inactive-state branches.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest NCD Sensors Route Fix (2026-08-12)
- Restored the Controller-list target `/ncd-sensors?controllerId={id}` in `src/router/index.js`; `/sensors/ncd` remains available as an alias.
- Restored the Vue2 `view_controllers` route permission, and confirmed that `useItemsData` applies `controllerId` from the route query to the list filters.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Sensor Type Table Cell Fix (2026-08-12)
- Corrected `src/views/Sensors/SensorTypeTableCell.vue` to use the dynamic component row/column prop contract.
- Restored localized dataset labels, MAC values, and the alarm-color tooltip when live NCD configuration differs from the saved sensor configuration.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest NCD Sensors List Parity Fix (2026-08-12)
- Fully audited `src/views/Sensors/NCDSensorsList.vue` against Vue2 and restored the AdditionalDetailsNCD modal with Save/Cancel and success refetch.
- Restored authenticated filtered export, correct item names, Plant-change removal of the controller filter/query, and `/ncd-sensors/:id` editing.
- `DynamicFormContainer.vue` now consumes the modal close event emitted by AdditionalDetailsNCD.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest NCD Additional Details Chart Fix (2026-08-12)
- Restored Connection Strength Trend in `src/views/Sensors/sensorForm/AdditionalDetailsNCD.vue`.
- The migrated CommonChartItemWrapper now creates the existing RSSIChart with the current sensor id, matching the Vue2 modal.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest MultiView Statistics Page Fix (2026-08-12)
- Rebuilt `src/views/Sensors/MultiViewStatisticsPage.vue` to render the configured `multi_view_graphs` through MultiViewChart, replacing the incorrect sensor Compare implementation.
- Restored the equipment/title header, date/live filters, metric-system switcher, Spanish Highcharts locale, navbar, custom headers, no-data mock, and thresholds dialog.
- Equipment Details now refetches MultiViews after threshold saves; the invalid standalone `/sensors/:id/multiview` route was removed.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest MultiView Runtime Follow-up (2026-08-12)
- Normalized the persisted measurement value before `MultiViewStatisticsPage` first renders, fixing the initial Metric/Imperial active state when localStorage contains a string value.
- Promoted the existing below-axis flag tooltip binding into the shared chart base and invoked it from `MultiViewChart` render handling.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Sensors Confirm Parity Fix (2026-08-13)
- Restored the original confirmation flow for explicit ultrasound frequency reset in `ItemFormUltraSound.vue`.
- Also restored missing confirmation gates for lube-cycle reset in `StatisticsPage.vue`, ultrasound gain adjustment in `UltrasoundFilterBlock.vue`, and OFF ALARM disable in `BannerFilterBlock.vue`.
- Enabling OFF ALARM remains immediate; cancelling any restored confirmation does not issue the command.
- Existing FFT unlock, sensor reset, rebaseline, and manual lubrication confirmations were already present.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Equipment Statistics Remount Fix (2026-08-13)
- Fixed the route/remount race when changing an Equipment tab or PDM button: navigation now resolves before `detailsComponentKey` is incremented.
- Replaced competing Statistics page initializers with a single immediate watcher over the relevant route params.
- Sensor requests carry a load generation; late responses from the old route or an unmounted instance are discarded and cannot corrupt `sensorsReadyCount`/`sensorData`.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Work Stations Section Migration (2026-08-13)
- Added the missing Vue3 Work Stations list, modal create/edit form, and standalone item page component.
- Registered the `WorkStations` entity contract for `/plants/work-stations` with its dedicated permissions and restored the Vue2 `work_stations_filters` key in the Pinia store.
- The existing `/work-stations` route and sidebar entry now resolve; the CRUD interaction remains modal-based to match Vue2.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest MultiView Chart Event Handling Fix (2026-08-13)
- `MultiViewStatisticsPage.vue` now terminates its informational chart-ready and chart-load events locally.
- This removes the `handleChartContainerReady` / `chartLoadEvent` missing-method warnings from the parent Equipment Details event handler while keeping thresholds, preview, and other event forwarding intact.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Vue2 Authentication/API/OneChart Delta Sync (2026-08-13)
- Audited the five current `vue2_project` changes and migrated every functional delta relevant to Vue3.
- Login now uses the new dev/prod SSO endpoints, and the shared Axios setup maps the new frontend origins to their API origins while still prioritizing `VITE_API_BASE_URL`.
- OAuth URL changes and the OneChart `50` bottom margin were already present; commented diagnostic logging was intentionally not copied.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Equipment Card Sensor Actions Migration (2026-08-14)
- Restored the Vue2 CardSensorItem action ownership in `Equipments/ItemsList.vue`: lube/grease reset, FFT unlock, shots counter, and runtime reset now have working handlers with confirmations and refetch/update behavior.
- Added the missing Vue3 `ShotsCounterForm.vue` and reconnected its Element Plus dialog and PUT endpoint.
- The existing Compare handler remains active, and a static audit found no unresolved actionable names in CardSensorItem configs.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Ultrasound Filter Action Chains Fix (2026-08-14)
- Restored full Vue2 parity for Gain, History, High Speed, Purge Mode, and Trigger Lube Cycle in `UltrasoundFilterBlock.vue`.
- Fixed the lube-cycle id and WebSocket sequence, preserved command metadata, normalized lube-shot payloads, and restored the original confirmation/retry behavior.
- `StatisticsPage.vue` now owns the emitted sensor refresh and live chart-update events, completing both previously broken parent chains.
- Targeted ESLint, static action/event audit, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Sensor Live-Point Tooltip Fix And Highcharts 12 Follow-up (2026-08-17)
- The live-statistics path now carries a dedicated synchronization flag from `SensorChartsListFactory` through the shared transform callbacks.
- `ChartItemContainer.vue` waits for Vue's chart-options update, then `SensorChart` replaces rendered series data through the Highcharts API and redraws once.
- The first synchronization-only fix did not restore hover in the application. A follow-up isolated Highcharts 12 audit identified the remaining legacy combination of shared tooltip plus `stickyTracking: false`; Sensor charts now override it to `true`, so newly rendered live points are found through series/KD-tree hover lookup instead of depending only on direct point trackers.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Sensor FFT Flag Click Fix (2026-08-18)
- The shared out-of-plot flag binding in `src/modules/charts_factory/classes/Chart.js` now handles configured point clicks as well as hover.
- Clicks are forwarded through Highcharts `Point.firePointEvent` with `event.point`, allowing the existing `openFFTCharts` chain to open the correct FFT page; propagation is stopped to avoid duplicate events.
- An isolated flags click assertion, targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest Highcharts Datetime X-Axis And Tooltip 24-Hour Format (2026-08-18)
- The shared Highcharts configuration now explicitly formats time-level datetime x-axis ticks and tooltips with `%H`, preventing the Highcharts 12 locale formatter from adding AM/PM.
- Millisecond, second, minute, and hour values use 24-hour time globally, including `flagsData` tooltips; non-datetime axes are unchanged.
- Isolated x-axis and Highstock flags-tooltip assertions, targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest StatisticsPage Before-Mount Lifecycle Parity (2026-08-18)
- `StatisticsPage.vue` now performs the complete legacy pre-mount initialization rather than only the old `created` reset and Highcharts localization.
- Restored customer daterange normalization, report/date/parameter query handling, route validation, initial compare/split state, RPM overlay fetch, and navbar setup before the initial sensor request.
- The immediate route watcher was replaced by an explicit pre-mount setup call, while the watcher still reloads the page on subsequent sensor/compare route changes.
- Targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.

## Latest StatisticsPage Date-Only Query Boundaries (2026-08-18)
- `StatisticsPage.vue` now recognizes `YYYY-MM-DD` query values before passing them to JavaScript `Date`, avoiding the UTC-to-local `03:00:00` shift.
- Date-only range starts use local `00:00:00` and finishes use local `23:59:59`; values with an explicit time or timestamp use the existing formatter.
- Direct boundary assertions, targeted ESLint, `git diff --check`, and the Node 24 production Vite build pass.
