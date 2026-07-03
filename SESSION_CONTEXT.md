# Continuation Briefing

## Project Stack
- Vue 3 + Vite app migrated from `vue2_project/`.
- Vue Router 4, Pinia, Element Plus, Highcharts, `<script setup>`.
- Shared form/list behavior is mainly in `src/composables/mixins/`: `useItemForm`, `useItemPage`, `useItemsData`, `useSubItemsList`, `useSubItem`, `useEmitter`.
- API layer uses `api_request`, `createGetRequest`, `createGetByIdRequest`, and entity config from `src/config/entities`.

## Key Architecture Rules
- Keep Vue2 behavioral parity; compare target files with `vue2_project/` before changing migrated views.
- Prefer existing composables, entity config, stores, and local UI conventions over new abstractions.
- Element Plus migration rules matter: no legacy `picker-options` on `el-time-select`; use props like `start`, `end`, `step`, `min-time`, `max-time`. No `size="mini"`.
- Do not revert unrelated dirty work.
- Use `apply_patch` for manual edits.
- User requested no code/diff output in status reports; provide one step at a time, result, and changed file path.
- Verify edits with targeted `git diff --check` and `npm run build` when feasible.

## Current Task Status
- `/graph/:sensorId` route was restored and `src/views/Sensors/OneChartPage.vue` was fully re-migrated for Vue3 parity.
- `/kruger` and `/login/remote` login routes were checked/fixed; `/kruger` uses the login wrapper flow.
- `/processes`, `/processes/new`, and `/processes/:id` routes were restored.
- Processes list/form migration fixes are active:
  - Fixed process card action icon crash caused by passing `icomoon icon-graphic` as an Element Plus icon component.
  - Fixed Element Plus `size="mini"` warnings in Processes sub-items/forms.
  - Migrated Processes time selects from legacy `picker-options` to Element Plus props in `ItemForm`, `BreakTimeItem`, and `WorkDateItem`.
  - Restored missing tooltips in `Processes/ItemForm.vue` and replaced old `el-icon-question` with Element Plus `QuestionFilled`.
  - Fixed modal save spinner/callback path by handling `toggleSaving` in `DynamicFormContainer.vue` and calling `editModal.callback` from `Processes/ItemForm.vue`.
  - Fixed `Break Time` card display so each value starts on a new line and time ranges do not wrap after the dash.
- Latest checks after the final Processes card fix passed: `git diff --check` for the touched file and `npm run build`.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `src/router/index.js`
- `src/components/form/DynamicFormContainer.vue`
- `src/views/Sensors/OneChartPage.vue`
- `src/views/Processes/ItemsList.vue`
- `src/views/Processes/ItemCard.vue`
- `src/views/Processes/ItemForm.vue`
- `src/views/Processes/BreakTimeItem.vue`
- `src/views/Processes/WorkDateItem.vue`
- `src/views/Processes/FaultItem.vue`
- Other dirty files present in worktree and may be user/previous-session changes: `src/assets/sass/common/common-content.scss`, `src/assets/sass/element-ui/elements.scss`, `src/composables/mixins/useSubItem.js`, `src/constants/menuItems.js`, `src/views/TaskProcedures/ProcessItem.vue`.

## Unresolved Issues
- No authenticated browser smoke test was run after the latest Processes changes; only production build was verified.
- Need runtime confirmation that Processes modal save now shows spinner and invokes callback after real API response.
- Need visual confirmation that `Break Time` card values match the Vue2 layout in the browser.
- Additional Processes parity gaps may remain outside the fixed errors.

## Next Actionable Step
- Start the dev app, open `/processes`, edit a process from the modal, save it with real API data, and confirm: spinner appears, callback closes/refetches as expected, no console warnings, and `Break Time` values render one per line without wrapping inside the time range.
