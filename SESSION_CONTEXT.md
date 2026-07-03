# Continuation Briefing

## Project Stack
- Vue 3 + Vite migration from `vue2_project/`.
- Vue Router 4, Pinia, Element Plus, Highcharts, `<script setup>`.
- Shared migration patterns are in `src/composables/mixins/`, `src/composables/`, `src/config/entities`, Pinia stores, and already migrated views.

## Key Architecture Rules
- Keep Vue2 behavioral parity; compare against `vue2_project/` before changing migrated behavior.
- Prefer existing composables, stores, entity config, helpers, and local UI conventions.
- No code/diff output in user-facing responses unless explicitly requested.
- Work one step at a time; after each step report the result and the changed file path in plain text.
- Use `apply_patch` for manual edits. Do not revert unrelated dirty work.
- Migration cleanup rules: replace `handleEventNew` with `handleEvent`, replace `<CustomSelect>` with `<CustomSelectV2>`, do not locally import global `CustomSelectV2`/`CustomInput`, remove `picker-options`, `size="mini"`, Vue2 store helpers, and Vue2-only modal sync patterns.
- In `src/`, do not keep `/static/img` references unless assets are copied/converted to the Vue3 assets path.

## Current Task Status
- `vue2_project/src/views/Processes/Details` has been migrated into Vue3, including Details page, dashboard, chart item container, logs, event-log form, break-time form, routes, process API composable, and process store support.
- Process edit modal proxy crashes for frozen array fields were fixed without `cloneDeep`.
- Process form modal loading was optimized by async-loading heavy children and deferring some heavy sections until after first render. Dropdown requests were intentionally left immediate.
- `vue2_project/src/views/Settings/Import` has been migrated into Vue3, including shared Import components, master/plant import pages, settings import tab/history/detail, plant logs/error rows, TestingStore actions, settings menu, and routes.
- Import modal `vue-element-loading` crash was fixed by using the local Vue3 loading component.
- Import `add option` modal now passes `formComponentFileLoader`, `activeSpinner: true`, and `spinnerText` when opening `src/views/EquipmentTypes/ItemForm.vue`.
- `src/components/form/DynamicFormContainer.vue` now keeps modal loading state locally via `isLoadingComponent` and clears it on child component mount. This was done to avoid a second `show_edit_modal` store call just to flip `activeSpinner` to `false`.
- Latest known checks after the modal-spinner change: `git diff --check` passed, targeted migration-rule scan passed, and `npm run build` passed with existing Vite warnings only.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `components.d.ts`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/new-session-handoff.md`
- `src/assets/sass/frames/grids/form-grid.scss`
- `src/components/common/ButtonsNavbar.vue`
- `src/components/common/CustomModal.vue`
- `src/components/common/DynamicComponentWrapper.vue`
- `src/components/form/DynamicFormContainer.vue`
- `src/components/Import/`
- `src/composables/useProcesses.js`
- `src/composables/useSensors.js`
- `src/constants/menuItems.js`
- `src/modules/charts_factory/classes/Chart.js`
- `src/modules/charts_factory/controllers/Sensor/classes/Chart.js`
- `src/router/index.js`
- `src/stores/GlobalStore.js`
- `src/stores/ProcessesStore.js`
- `src/stores/TestingStore.js`
- `src/views/Equipments/ItemFormWrapper.vue`
- `src/views/Processes/Details/`
- `src/views/Processes/ItemForm.vue`
- `src/views/Sensors/charts/ChartItemContainer.vue`
- `src/views/Sensors/sensorForm/ItemForm.vue`
- `src/views/Sensors/sensorForm/ItemFormUltraSound.vue`
- `src/views/Settings/SettingsPage.vue`
- `src/views/Settings/Import/`
- Vue2 reference files under `vue2_project/` are also dirty from source-side comparison changes; do not revert them unless explicitly asked.

## Unresolved Issues
- Need confirm in browser that Import `add option` modal shows the existing modal spinner immediately and no longer triggers a second `show_edit_modal` call.
- Need confirm whether `EquipmentTypes/ItemForm.vue` still takes 15-20 seconds to become interactive in the Import modal. Do not reintroduce previous heavy optimization attempts in `EquipmentTypes/ItemForm.vue` or `useItemForm.js` without a focused measurement.
- `src/stores/GlobalStore.js` currently has the `show_edit_modal` debug `console.log` commented out; leave it unless the user asks to remove or restore logging.
- Need authenticated smoke tests for Settings Import upload, drag/drop mapping, plant import progress polling, history logs, and row error correction.
- Need authenticated smoke tests for Process Details dashboard/logs/edit modal and OEE chart reload behavior after event-log or break-time edits.

## Next Actionable Step
- Reproduce Import `add option` in the browser and verify two things first: the modal spinner paints before `EquipmentTypes/ItemForm.vue` resolves, and `show_edit_modal` is called only once when opening the modal.
