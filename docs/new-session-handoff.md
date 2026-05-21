# New Session Handoff

## Current Objective
- Continue Vue2 -> Vue3 migration with focus on components from `vue2_project/src/components`.
- Migrate and/or sync exactly one file per step.

## Mandatory Workflow For Next Session
- Apply changes only after explicit user confirmation.
- If there are risks or ambiguous points, ask first and do not apply until confirmed.
- Work one file at a time.
- Diff preview is not required by default.
- After each migrated file: run local lint for that file, update docs, then STOP and wait.
- Preferred open-in-IDE reference after each file: provide clickable absolute path in reply.

Primary rules source:
- `docs/session-collaboration-rules.md`
- Reference examples for `src/views` entity migration: `src/views/Plants`, `src/views/Brands`
- Reference example for `FetchByQuerySelect` / `requestsToDoList` patterns with `hasValueCase`, `bindTo`, and dropdown-triggered full-list reload: `src/views/BrandModels/ItemsList.vue`

## Migration State Snapshot
- Latest completed files:
  - `src/components/gridTable/GridItemCardHeader.vue`
  - `src/components/table/CustomDataListTable.vue`
  - `src/components/gridTable/ItemsGridContainer.vue`
  - `src/components/itemDetails/CounterItem.vue`
  - `src/components/form/uploadBlock/FileUploadBlockItem.vue`
  - `src/components/form/uploadBlock/FileUploadBlock.vue`
- `src/views/Plants/Details/DetailsPage.vue` restored from previous commit.
- `src/views/Plants/ItemPage.vue` remains temporary stub.

## Recommended Next File Order
Use one-by-one sequence (high impact first for current imports):
1. `src/components/itemDetails/ItemInfoBlock.vue`
2. `src/components/itemDetails/ItemImagesBlock.vue`
3. `src/components/itemDetails/ItemPDMsStatisticBlock.vue`
4. `src/components/itemDetails/ItemWOStatisticBlock.vue`
5. `src/components/itemDetails/MaintenanceListWrapper.vue`
6. `src/components/table/TableHeader.vue`
7. `src/components/table/Row.vue`
8. `src/components/table/TableCell.vue`
9. `src/components/table/TableHeaderCell.vue`

Then continue remaining missing components from `vue2_project/src/components`.

## Missing Components (Still Not In `src/components`)
- `Import/DragDropCellItem.vue`
- `Import/ImportContainer.vue`
- `Import/ImportForm.vue`
- `WarningsTableBlock.vue`
- `charts/ChartWrapper.vue`
- `charts/ChartsListContainer.vue`
- `charts/ChartsPreloader.vue`
- `charts/CommonChartItemContainer.vue`
- `charts/CommonChartItemWrapper.vue`
- `common/ButtonWithPopover.vue`
- `common/ButtonsNavbar.vue`
- `common/CustomPopover.vue`
- `common/CustomProgressbar.vue`
- `common/CustomTransition.vue`
- `common/DynamicComponentWrapper.vue`
- `common/ItemDetailsPreview.vue`
- `common/NavigationButtons.vue`
- `common/addToFavoriteButton.vue`
- `form/FetchByQuerySelect.vue`
- `form/FormOperationsButtons.vue`
- `form/InputItemBlock.vue`
- `form/IsolatedSelect.vue`
- `form/PhoneInput.vue`
- `form/SelectorBlock.vue`
- `gridTable/CardDroppedSection.vue`
- `itemDetails/CreateWOButton.vue`
- `itemDetails/ItemImagesBlock.vue`
- `itemDetails/ItemInfoBlock.vue`
- `itemDetails/ItemPDMsStatisticBlock.vue`
- `itemDetails/ItemWOStatisticBlock.vue`
- `itemDetails/MaintenanceListWrapper.vue`
- `pages/NotFoundPage.vue`
- `pages/RemoteLogin.vue`
- `table/Row.vue`
- `table/TableCell.vue`
- `table/TableHeader.vue`
- `table/TableHeaderCell.vue`

## Docs To Keep Updating
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/session-collaboration-rules.md` (if process changes again)
