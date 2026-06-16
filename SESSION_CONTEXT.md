# Continuation Briefing

## Project Stack
- Vue 3 + Vite, Vue Router 4, Pinia, Element Plus, `<script setup>`.
- Vue2 migration source: `vue2_project/`; Vue3 target: `src/`.

## Key Architecture Rules
- Compare against Vue2 originals before changing migrated code.
- Preserve Vue2 behavior while adapting to Vue3 architecture: `src/api`, Pinia stores, existing composables, Element Plus, Vue Router 4.
- Do not copy Vue2 API/store/mixins/helpers as-is; adapt behavior to existing Vue3 modules.
- For Sensors forms, concrete forms own `localSubmit`; wrapper forms are orchestration/subitem wrappers.
- For Equipments wrapper flow, mirror Vue2 orchestration: `validateForm -> handleValidationResult -> parallel submits -> handleFormSubmitFinish`.
- Session collaboration: no code/diff output in replies; work one step at a time; after each step report result and changed path(s). No real API/websocket runtime testing unless explicitly requested.

## Current Task Status
- `src/views/CorporateDashboard` was migrated from Vue2:
  - `src/views/CorporateDashboard/CorporateDashboard.vue`
  - `src/views/CorporateDashboard/Details/CorporateMain.vue`
  - `src/views/CorporateDashboard/Details/PlantDetailsItem.vue`
  - `/corporate/main` route, Corporate View menu entry, and `view_corporate` permission mapping are enabled.
- Sensors `PDFandFFTrequestsBlock` was re-aligned with the Vue2 original:
  - Restored grouped RPM / FFT / PDF controls.
  - Restored PDF request/download state, websocket completion handling, and compare PDF export.
  - Restored FFT request dialog, Last FFT, Unlock FFT, socket response handling, and parent event propagation.
  - Added missing `plantGraphsPdfReport` and `unlockFft` helpers in `useSensors`.
  - Exposed `handleUnlockFFT` from `BannerFilterBlock` so `StatisticsPage` can forward chart unlock actions.
- `src/views/Equipments/ItemFormWrapper.vue` was statically checked against Vue2:
  - Current Vue3 wrapper appears aligned for compile/static scope.
  - Reorder is handled in the equipment submit promise chain, which is safer than the legacy counter-only behavior.
- Item card mixin behavior from `vue2_project/src/mixins/itemCardMixin.js` was re-applied across migrated ItemCard files:
  - `useItemCard` now supports Vue3 reset callbacks.
  - Assets/Machines/ProductionLines/BrandModels cards use `useItemCard` title-click flow with Pinia page reset where applicable.
  - Processes card uses `useItemCard` preview modal behavior and restored image overlay.
- `src/views/Maintenance/WorkOrders/ItemForm.vue` was re-checked against the Vue2 original and expanded:
  - Restored `showJustInfo` behavior, filtered statuses, task procedure preview/info, technician users/teams tabs, create Part/WO Type modal callbacks, legacy snooze-change UI, equipment card grouping, and recurring period-date submit normalization.
- `src/components/common/Datepicker.vue` now lazy-mounts Element Plus `el-date-picker` after first interaction:
  - Initial render uses a lightweight div placeholder styled like the datepicker input, with icons imported from `@element-plus/icons-vue`, reducing eager calendar table DOM on pages with many datepickers.
- Latest verification: `npm run build` passed; targeted `git diff --check` passed.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/new-session-handoff.md`
- `src/views/CorporateDashboard/CorporateDashboard.vue`
- `src/views/CorporateDashboard/Details/CorporateMain.vue`
- `src/views/CorporateDashboard/Details/PlantDetailsItem.vue`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/utils/hasAccessTo.js`
- `src/views/Sensors/FilterBlock/PDFandFFTrequestsBlock.vue`
- `src/views/Sensors/FilterBlock/FFTRequestBlock.vue`
- `src/views/Sensors/FilterBlock/BannerFilterBlock.vue`
- `src/composables/useSensors.js`
- `src/composables/mixins/useItemCard.js`
- `src/views/Assets/ItemCard.vue`
- `src/views/Machines/ItemCard.vue`
- `src/views/ProductionLines/ItemCard.vue`
- `src/views/Processes/ItemCard.vue`
- `src/views/BrandModels/ItemCard.vue`
- `src/views/Maintenance/WorkOrders/ItemForm.vue`
- `src/components/common/Datepicker.vue`
- Earlier Equipment/Sensor form orchestration files remain modified in the worktree from prior migration work:
  - `src/views/Equipments/ItemForm.vue`
  - `src/views/Equipments/ItemFormWrapper.vue`
  - `src/views/Sensors/sensorForm/ItemForm.vue`
  - `src/views/Sensors/sensorForm/ItemFormUltraSound.vue`
  - `src/views/Sensors/sensorForm/ItemFormNCD.vue`
  - `src/views/Sensors/sensorForm/ItemFormWrapper.vue`
  - `src/views/Sensors/sensorForm/RunningThresholdItem.vue`

## Unresolved Issues
- No real API/websocket runtime testing was performed.
- Sensors PDF/FFT/RPM flows need authenticated runtime smoke testing, especially websocket PDF completion, compare export, Banner FFT request dialog, Last FFT, Unlock FFT, and RPM settings/overlay.
- Corporate Dashboard needs authenticated runtime smoke testing: company filter, date range, all-plants summary, print view, per-plant ROI/PDM/counters.
- Equipment wrapper still needs runtime validation with real edit data: multiple sensors, Multi View, failure accounting, and create/edit behavior.
- Watch for Element Plus validation warnings caused by late async list updates in nested forms.

## Next Actionable Step
- Runtime smoke-test Sensors statistics page PDF/FFT/RPM actions with authenticated data.
- Then smoke-test `/corporate/main`.
- Then runtime-check `src/views/Equipments/ItemFormWrapper.vue` edit flow with sensors and Multi View.
