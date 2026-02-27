# Continuation Briefing

## Project stack
- Vue 3 (`script setup`), Vite 6, Vue Router 4, Pinia 3.
- UI: Element Plus 2.
- HTTP: Axios via `src/api` + `api_request` wrapper.
- Tooling: ESLint 9, Prettier 3, Vitest.

## Key architecture rules
- Migrate from `vue2_project` into current Vue3 architecture only.
- Use `src/api`, Pinia stores, and composables (`src/composables/mixins/*`), do not reintroduce Vue2 mixins/Vuex patterns.
- Replace `@event="handleEventNew"` with `@event="handleEvent"` during migration.
- For legacy `/static/img/...` paths, use `@/assets/img/...` and copy missing assets from legacy static folder.
- Working mode from docs: one migration step at a time, apply changes directly, stop after each step.

## Current task status
- Migrated and added missing groups:
  - `src/components/table/*` completed (including `Row`, `TableCell`, `TableHeader`, `TableHeaderCell`).
  - `src/components/common/*` remaining files migrated.
  - `src/components/form/*` migrated except explicitly excluded by user: `SelectorBlock.vue`, `IsolatedSelect.vue`.
  - `src/components/pages/*` completed missing: `NotFoundPage.vue`, `RemoteLogin.vue`.
  - `src/components/gridTable/CardDroppedSection.vue` added.
  - `src/components/itemDetails/*` completed missing files.
  - `src/views/Plants/*` major restoration done: `ItemForm.vue`, `ItemPage.vue`, `Details/CounterItem.vue`, `Details/Counters.vue`, and `ItemsList.vue` reworked to full list behavior.
- Pagination deprecation fixed in `PaginationContainer.vue` (`v-model:current-page` flow).
- Runtime crash source identified and fixed in `TableAction.vue` for CSS class icons (`icon: 'icomoon ...'`).

## Files already modified
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/session-collaboration-rules.md`
- `src/components/common/PaginationContainer.vue`
- `src/components/common/VueElementLoading.vue`
- `src/components/common/DynamicComponentWrapper.vue`
- `src/components/common/ButtonWithPopover.vue`
- `src/components/common/ButtonsNavbar.vue`
- `src/components/common/CustomPopover.vue`
- `src/components/common/CustomProgressbar.vue`
- `src/components/common/CustomTransition.vue`
- `src/components/common/ItemDetailsPreview.vue`
- `src/components/common/NavigationButtons.vue`
- `src/components/common/addToFavoriteButton.vue`
- `src/components/form/FetchByQuerySelect.vue`
- `src/components/form/FormOperationsButtons.vue`
- `src/components/form/InputItemBlock.vue`
- `src/components/form/PhoneInput.vue`
- `src/components/gridTable/CardDroppedSection.vue`
- `src/components/itemDetails/CreateWOButton.vue`
- `src/components/itemDetails/ItemImagesBlock.vue`
- `src/components/itemDetails/ItemInfoBlock.vue`
- `src/components/itemDetails/ItemPDMsStatisticBlock.vue`
- `src/components/itemDetails/ItemWOStatisticBlock.vue`
- `src/components/itemDetails/MaintenanceListWrapper.vue`
- `src/components/pages/NotFoundPage.vue`
- `src/components/pages/RemoteLogin.vue`
- `src/components/table/CustomDataListTable.vue`
- `src/components/table/TableAction.vue`
- `src/components/table/Row.vue`
- `src/components/table/TableCell.vue`
- `src/components/table/TableHeader.vue`
- `src/components/table/TableHeaderCell.vue`
- `src/components/layout/TopNavbar.vue`
- `src/views/Plants/Details/CounterItem.vue`
- `src/views/Plants/Details/Counters.vue`
- `src/views/Plants/ItemForm.vue`
- `src/views/Plants/ItemPage.vue`
- `src/views/Plants/ItemsList.vue`
- Assets: `src/assets/img/404.png`, `src/assets/img/flags/{CA,US,MX}.png`

## Unresolved issues
- Need runtime verification in UI after latest fixes on Plants flow (list actions, pagination, notifications).
- `src/views/Plants/Details/DetailsPage.vue` is still not fully migrated (contains large placeholder/commented blocks).
- `src/components/layout/TopNavbar.vue` was cleaned partially and may still contain legacy/commented sections; functional verification needed.
- Repo has additional pre-existing modified files unrelated to current step (`components.d.ts`, `src/api/*`, styles, router, etc.) and should be treated carefully.

## Next actionable step
- Start with runtime validation of `/plants`:
  - open Plants list,
  - verify pagination, create/edit/delete actions, and absence of runtime exceptions.
- Then continue migration of `src/views/Plants/Details/DetailsPage.vue` from legacy source as the next major unfinished Plants file.
