# Continuation Briefing

## Project Stack
- Vue 3 + Vite app using Vue Router 4, Pinia, Element Plus, Highcharts, and `<script setup>`.
- Migration source is `vue2_project/`; migrated target is `src/`.
- Charts use local Highcharts factory modules under `src/modules/charts_factory`.
- API access should use project helpers/composables such as `api_request`, `createGetRequest`, `createGetByIdRequest`, `useRequestsList`, and domain composables.

## Key Architecture Rules
- Apply code changes only after explicit user confirmation, except `docs/` and `SESSION_CONTEXT.md` may be updated automatically.
- Work one step/file at a time; for tightly coupled files, one combined step is allowed.
- Do not output code or diffs unless a risk/ambiguity must be discussed.
- After each completed step, report the result and file path in plain text, then stop unless user explicitly requested continuous work.
- Before changing migrated behavior, compare against the Vue2 original in `vue2_project/`.
- Preserve Vue2 behavioral parity: template structure, wrappers, slots, conditions, permissions, request timing, route/query behavior, events, and store-filter ownership.
- Use existing Vue3 patterns: Pinia, composables, `api_request`, global components where established, and Element Plus-valid APIs/icons.
- Use `apply_patch` for manual edits; do not revert user or unrelated dirty work.
- Run targeted `git diff --check` and `npm run build` after behavior/compile changes.

## Current Task Status
- User requested migration of the FFT Statistics section without per-file confirmations, using already migrated sections and existing composables.
- FFT Statistics compile/build follow-up is complete:
  - `src/views/Sensors/FFTStatisticsPage.vue` was re-aligned toward Vue2 structure with equipment header, prev/next FFT navigation, axis selector, split/metric controls, `AnalysisFFTContainer`, and equipment loading through `useRequestsList`.
  - `src/views/Sensors/charts/fft/FFTChartsListWrapper.vue`, `FFTChartItemContainer.vue`, `ChartFFTAnalysisRulesBar.vue`, and `WaterfallStatisticsContainer.vue` were rechecked against Vue2 and restored closer to legacy behavior.
  - `src/composables/useSensors.js` now includes FFT vibration-analysis rule override save/delete actions.
  - `src/router/index.js` now enables `/ncd/:id/fft/:fftId` and `/banner/:id/fft/:fftId` compatibility routes.
  - `npm run build` and targeted `git diff --check` passed after each step.
- Docs were synchronized after the FFT work: `docs/new-session-handoff.md`, `docs/migration-progress.md`, and `docs/migration-todos.md`.
- User manually changed Highcharts flags behavior and reports it works; do not modify those changes unless requested.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `docs/new-session-handoff.md`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `src/views/Sensors/FFTStatisticsPage.vue`
- `src/views/Sensors/charts/fft/FFTChartsListWrapper.vue`
- `src/views/Sensors/charts/fft/FFTChartItemContainer.vue`
- `src/views/Sensors/charts/fft/ChartFFTAnalysisRulesBar.vue`
- `src/views/Sensors/charts/fft/WaterfallStatisticsContainer.vue`
- `src/composables/useSensors.js`
- `src/router/index.js`
- Existing dirty/user-edited files include Highcharts flag-related files; do not revert unrelated work.

## Unresolved Issues
- No authenticated browser/API smoke test has been performed for the latest Sensors FFT changes.
- Sensors charts still need runtime verification with real data, especially flags, FFT page prev/next navigation, FFT rule harmonics save, waterfall controls, one-chart legend, show-history zoom reset, hidden-chart fetch, and export payload.
- SuccessDashboard Meeting Tracker remains high risk and needs deeper Vue2 parity review.
- `src/views/SuccessDashboard/MeetingTracker/NextActivityFormItem.vue` remains simplified compared with Vue2.
- `src/views/SuccessDashboard/ROIOnePager/ItemForm.vue` still needs runtime validation with real item data/API responses.

## Next Actionable Step
- Continue Sensors chart parity work one file at a time: check remaining non-FFT `src/views/Sensors/charts` files against `vue2_project/src/views/Sensors/charts`, starting with `ChartsListWrapper.vue`, then `ChartThresholdsOperations.vue`.
