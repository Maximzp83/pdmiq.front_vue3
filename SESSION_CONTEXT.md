# Continuation Briefing

## Project Stack
- Vue 3 with `<script setup>`
- Vite
- Vue Router 4
- Pinia
- Element Plus

## Key Architecture Rules
- Migrate from `vue2_project` into Vue3 architecture only; do not reintroduce Vue2 mixins or Vuex runtime patterns.
- Prefer shared composables: `useItemsData`, `useItemPage`, `useItemForm`, `useRequestsList`, `useSubItem`, `useSubItemsList`.
- Use `src/config/entities.js` as entity API/route metadata source where available.
- Replace `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace `<CustomSelect>` with global `<CustomSelectV2>`; do not locally import `CustomSelectV2` or `CustomInput`.
- Do not keep legacy `requestsListMixin` / `requestsToDoList` loaders for `<FetchByQuerySelect>`; pass async request functions through settings.
- Current collaboration mode: no code/diff output in responses; ask only on real ambiguity/risk. `docs/` and `SESSION_CONTEXT.md` may be updated automatically.

## Current Task Status
- `vue2_project/src/views/Sensors` has been migrated into Vue3, including final `statistics` and `charts` stage.
- Sensors routes are enabled: `/sensors`, `/sensors/ncd`, `/sensors/new`, `/sensors/:id`, `/sensors/:id/fft`, `/sensors/:id/stats`, `/sensors/:id/multiview`, `/sensors/:id/chart`.
- Sensors menu entry is enabled.
- `npm run build` passes after follow-up compile fixes.
- Focused checks passed for Sensors and related build-fix files; `git diff --check` passed.

## Files Already Modified
- `src/views/Sensors/**`
- `src/components/charts/ChartsPreloader.vue`
- `src/components/charts/CommonChartItemContainer.vue`
- `src/components/charts/CommonChartItemWrapper.vue`
- `src/composables/useSensors.js`
- `src/stores/SensorsStore.js`
- `src/stores/mixins/commonStoreMixin.js`
- `src/components/common/DynamicComponentWrapper.vue`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `vite.config.js`
- `src/api/request_provider.js`
- `src/modules/charts_factory/api/request_provider.js`
- `src/modules/charts_factory/controllers/Sensor/api/index.js`
- `src/modules/charts_factory/controllers/Sensor/classes/Chart.js`
- `src/helpers/index.js`
- `src/helpers/specialHelpers.js`
- `src/composables/mixins/useItemCard.js`
- `src/components/layout/Sidebar/SidebarWithSubs.vue`
- `src/components/itemDetails/MaintenanceListWrapper.vue`
- `src/views/Machines/Details/DetailsPage.vue`
- `src/views/Machines/ItemForm.vue`
- `src/views/Machines/CharacterItem.vue`
- `src/views/Machines/AttachmentItem.vue`
- `src/views/Machines/ItemCard.vue`
- Docs updated: `docs/migration-progress.md`, `docs/migration-todos.md`, `docs/new-session-handoff.md`, `SESSION_CONTEXT.md`

## Unresolved Issues
- Sensors statistics/charts need browser smoke testing with real data; several legacy chart controls were simplified into Vue3 wrappers.
- Controllers runtime flow still needs browser smoke testing.
- `devicesTab` in `src/views/Controllers/ItemForm.vue` is still intentionally not wired in.
- Some compile-only fixes touched Machines and `MaintenanceListWrapper`; runtime completeness for those non-current areas is not guaranteed.

## Next Actionable Step
- Browser smoke-test Sensors routes on real data: list, NCD list, create/edit, stats, FFT, one-chart, and multiview.
