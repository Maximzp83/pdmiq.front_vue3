# Continuation Briefing

## Project stack
- Vue 3 with `script setup`
- Vite 6
- Vue Router 4
- Pinia
- Element Plus
- Highcharts + `highcharts-vue`
- ESLint + Prettier

## Key architecture rules
- Continue Vue2 -> Vue3 migration one step at a time.
- Use `src/views/Plants` as the reference pattern for entity migration.
- Prefer shared composables over local page/list orchestration.
- `useItemsData` owns generic list behavior: fetch, filters, create/edit/delete actions.
- `useItemPage` owns generic item-page behavior: init/load/navbar lifecycle and fetch/save item requests.
- Create mode should use explicit `/new` routes, not `/create`.
- `handleDeleteItems -> deleteItem` must work through `ids`.
- Apply changes only after user confirmation.
- Do not show code/diff in normal replies.

## Current task status
- `Plants` is the main reference entity for list/page behavior.
- `useInitPageData` was merged into `useItemPage`; standalone file removed.
- `useItemPage` now implements generic `fetchItem` and `saveItem` through `apiRoute` / `itemRoute`.
- `Plants/ItemPage.vue`, `Applications/ItemPage.vue`, `Machines/ItemPage.vue`, and `Processes/ItemPage.vue` now use `useItemPage`.
- `Applications/ItemsList.vue` and `Processes/ItemsList.vue` were aligned toward the `Plants` pattern.
- `ItemsGridContainer.vue` now exposes `selectedIds` for composable-driven delete flow.
- Router create routes for migrated entities were switched to explicit `/new` paths.

## Files already modified
- `src/composables/mixins/useItemsData.js`
- `src/composables/mixins/useItemPage.js`
- `src/composables/mixins/useInitPageData.js` (deleted)
- `src/components/gridTable/ItemsGridContainer.vue`
- `src/views/Plants/ItemsList.vue`
- `src/views/Plants/ItemPage.vue`
- `src/views/Applications/ItemsList.vue`
- `src/views/Applications/ItemPage.vue`
- `src/views/Processes/ItemsList.vue`
- `src/views/Processes/ItemPage.vue`
- `src/views/Machines/ItemPage.vue`
- `src/router/index.js`
- `src/main.js`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `SESSION_CONTEXT.md`

## Unresolved issues
- `src/views/MaintenanceCategories/ItemPage.vue` is still pending; the user explicitly pointed to legacy `vue2_project/src/views/MaintenanceCategories/ItemPage.vue` as the next likely target.
- `src/views/MaintenanceCategories/ItemsList.vue` still uses old local create/edit/delete orchestration and is not yet aligned to the `Plants` list pattern.
- `src/views/Machines/ItemPage.vue` now uses `useItemPage`, but machine routes are still commented out in `src/router/index.js`.
- `src/views/Plants/Details/DetailsPage.vue` remains unfinished and should not be treated as the reference for details-layer architecture.

## Next actionable step
- Migrate `MaintenanceCategories` page flow next:
  start with `src/views/MaintenanceCategories/ItemPage.vue` using `useItemPage`, then align `src/views/MaintenanceCategories/ItemsList.vue` to the `Plants` / `useItemsData` pattern if routes are available.
