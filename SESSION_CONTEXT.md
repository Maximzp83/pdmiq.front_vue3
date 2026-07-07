# Continuation Briefing

## Project Stack
- Vue 3 + Vite migration from `vue2_project/`.
- Vue Router 4, Pinia, Element Plus, Highcharts, `<script setup>`.
- Shared migration patterns live in `src/composables/mixins/`, `src/composables/`, `src/config/entities.js`, Pinia stores, and migrated `src/views/**`.

## Key Architecture Rules
- Keep Vue2 behavioral parity; compare against `vue2_project/` before changing migrated behavior.
- Prefer existing composables, stores, entity config, helpers, and local UI conventions.
- No code/diff output in user-facing responses unless explicitly requested.
- Work one step at a time; after each step report the result and the changed file path in plain text.
- Use `apply_patch` for manual edits. Do not revert unrelated dirty work.
- Migration cleanup rules: replace `handleEventNew` with `handleEvent`, replace `<CustomSelect>` with `<CustomSelectV2>`, do not locally import global `CustomSelectV2`/`CustomInput`, remove `picker-options`, `size="mini"`, Vue2 store helpers, Vue2-only modal sync patterns, and legacy Element UI icon classes.
- In `src/`, do not keep `/static/img` references unless assets are copied/converted to the Vue3 assets path.
- Dynamic component loading should use explicit `componentFileLoader` / `formComponentFileLoader`; do not reintroduce string `componentPath` / `componentModules` in active Vue3 code.

## Current Task Status
- `src/components/charts/CommonChartItemContainer.vue` now loads custom chart headers via `customChartHeader.componentFileLoader` and `defineAsyncComponent`, matching the `DynamicComponentWrapper` loader pattern.
- Active Vue3 usages of `componentPath` were removed and replaced with `componentFileLoader` / `formComponentFileLoader`; `rg componentPath src --glob '!**/*.bak'` was clean at the time of the change.
- `src/components/form/DynamicFormContainer.vue` now supports only explicit loaders for active modal component resolution.
- `successSubmitOptions` is now the preferred simple modal success contract for refetch/close flows:
  - `useItemsData` supports `{ refetchItemsList: true, closeModal: true }` and closes the correct `editModalProp`.
  - `useItemForm` supports direct-modal `successSubmitOptions` where `refetchItemsList` is a function.
  - `WorkOrderRequests/ConvertForm.vue` supports `successSubmitOptions` despite its custom `localSubmit`.
- `Settings/BannerV2Subtype/ItemsList.vue` opens create/edit forms in a modal.
- `Settings/Faults/ItemsList.vue` was aligned closer to Vue2 behavior: create/edit opens a modal, chooses `ItemForm.vue` for base faults and `ItemFormNCD.vue` for NCD faults, refetches after save, and closes the modal.
- `SettingsPage.vue` no longer forces `router-view` remount with `contentKey`; this addressed the Element Plus select warning triggered during settings tab navigation.
- `TopNavbar.vue` no longer uses legacy `el-icon-printer`; fallback print icon is Element Plus `Printer`, while custom CSS icon settings are still respected.
- `src/views/Requisitions/Details` was re-migrated toward Vue2 parity:
  - Restored `CompleteFormContainer.vue` technical-process rendering and Start Work Order behavior.
  - Restored `CompleteForm.vue` execution-time rows, attachments, total-time calculation, complete/save-progress submit flow, and multipart payload detection.
  - Restored `ApproveForm.vue` work station/users loading through `useRequestsList`, technicians/materials/cost/date blocks, running total, reset/save actions, and material subitems through `useSubItemsList`.
  - Restored `ExecTimesItem.vue` and `MaterialItem.vue` as Vue3 subitem forms using `useSubItem`.
  - Restored `DetailsItem.vue` array/attachment rendering and `WorkOrderReportForPrint.vue`/`ReportValueCell.vue` print details.
  - `WorkOrderDetails.vue` now owns the details action modal with `componentFileLoader` and handles `reloadPage`/`successModalSubmit`.
- Latest checks after the Requisitions Details re-migration: `npm run build`, targeted `git diff --check`, and migration-rule scan passed with existing Vite warnings only.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `docs/migration-todos.md`
- `src/components/charts/CommonChartItemContainer.vue`
- `src/components/common/DynamicComponentWrapper.vue`
- `src/components/form/DynamicFormContainer.vue`
- `src/components/gridTable/ItemsGridContainer.vue`
- `src/components/layout/TopNavbar.vue`
- `src/components/table/Row.vue`
- `src/components/table/TableAction.vue`
- `src/components/table/TableCell.vue`
- `src/composables/mixins/useDashboardListsReorder.js`
- `src/composables/mixins/useItemForm.js`
- `src/composables/mixins/useItemsData.js`
- `src/views/Assets/ItemsList.vue`
- `src/views/Dashboard/Dashboard.vue`
- `src/views/Equipments/Details/DetailsPage.vue`
- `src/views/Equipments/ItemsList.vue`
- `src/views/Machines/ItemsList.vue`
- `src/views/Maintenance/Logs/ItemForm.vue`
- `src/views/Maintenance/Logs/ItemsList.vue`
- `src/views/Maintenance/WorkOrders/ItemsList.vue`
- `src/views/Processes/Details/LogsList.vue`
- `src/views/Processes/ItemsList.vue`
- `src/views/ProductionLines/ItemsList.vue`
- `src/views/Requisitions/ItemsList.vue`
- `src/views/Requisitions/WorkOrderDetails.vue`
- `src/views/Requisitions/Details/ApproveForm.vue`
- `src/views/Requisitions/Details/CompleteForm.vue`
- `src/views/Requisitions/Details/CompleteFormContainer.vue`
- `src/views/Requisitions/Details/DetailsItem.vue`
- `src/views/Requisitions/Details/ExecTimesItem.vue`
- `src/views/Requisitions/Details/MaterialItem.vue`
- `src/views/Requisitions/Details/ReportValueCell.vue`
- `src/views/Requisitions/Details/WorkOrderReportForPrint.vue`
- `src/views/Settings/BannerV2Subtype/ItemsList.vue`
- `src/views/Settings/Faults/ItemsList.vue`
- `src/views/Settings/LubeTypes/ItemsList.vue`
- `src/views/Settings/SettingsPage.vue`
- `src/views/WorkOrderRequests/ConvertForm.vue`
- `src/views/WorkOrderRequests/ItemsList.vue`

## Unresolved Issues
- Need browser verification that `Settings/Faults` and `Settings/NCD Faults` create/edit modals open the correct form and no longer produce the Element Plus select slot warning.
- Need browser verification that `Settings/Banner V2 Subtypes` create/edit modal opens and closes after save.
- Need browser verification for modal success flows converted to `successSubmitOptions`, especially Work Order Requests convert/create, Maintenance Work Orders/Logs, Assets/Machines/ProductionLines/Equipments dashboard modals.
- Existing Vite build warnings remain: mixed static/dynamic import warning for `AuthStore.js` and router mixed import warning; these were not introduced by the latest changes.
- Do not reintroduce legacy string dynamic loaders (`componentPath`) unless there is a deliberate migration plan for a specific compatibility layer.
- Need browser verification for Requisitions Work Order Details with real data: approve/deny modal actions, Fab Plant Details save/reset, Start Work Order, technician Complete/Save Progress, attachments, print output, and read-only completed technical-process details.

## Next Actionable Step
- In browser, smoke-test Requisitions Work Order Details first: open an item through `/requisitions/:id`, verify pending approve/deny actions, approved/in-work technician flows, completed/read-only details, and print output with authenticated real data.
