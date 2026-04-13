# Session Context

## Current objective
- Continue Vue2 -> Vue3 migration.
- Prioritize components from `vue2_project/src/components`.
- Migrate or sync exactly one file per step unless files are structurally coupled.

## Active workflow rules
- Apply changes only after explicit user confirmation.
- If there is any risk, ambiguity, or disputable point, stop and ask first.
- Work one step at a time.
- Do not show code or diff output unless discussion is required because of risk or ambiguity.
- After each completed step: run local lint for the touched file when applicable, update docs, then stop.
- After each step: reply with the result and the file path in plain text.

## Migration conventions
- Use Vue 3 Composition API and existing Vue3 project patterns.
- Use `api_request` for API work.
- Use composables + Pinia; do not reintroduce Vuex runtime patterns.
- Replace `@event="handleEventNew"` with `@event="handleEvent"` during migration.
- Replace `<CustomSelect` with `<CustomSelectV2` during migration.
- For `vue2_project/src/views` -> `src/views` migrations, use `src/views/Plants` as the reference pattern.

## Latest completed migration state
- Completed recently:
  - `src/components/gridTable/GridItemCardHeader.vue`
  - `src/components/table/CustomDataListTable.vue`
  - `src/components/gridTable/ItemsGridContainer.vue`
  - `src/components/itemDetails/CounterItem.vue`
  - `src/components/form/uploadBlock/FileUploadBlockItem.vue`
  - `src/components/form/uploadBlock/FileUploadBlock.vue`
- Additional completed work recorded in docs:
  - `src/components/itemDetails/ItemInfoBlock.vue`
  - `src/components/itemDetails/ItemImagesBlock.vue`
  - `src/components/itemDetails/ItemPDMsStatisticBlock.vue`
  - Table batch: `TableHeader`, `Row`, `TableCell`, `TableHeaderCell`
  - `src/components/common/DynamicComponentWrapper.vue`
  - Remaining `common`, `form` (except requested skips), `pages`, `gridTable`, and `itemDetails` component batches
  - `src/views/Plants` migration follow-up and `Applications` / `Processes` entities

## Important current notes
- `src/views/Plants/Details/DetailsPage.vue` was restored from a previous commit.
- `src/views/Plants/ItemPage.vue` was previously noted as a temporary stub in handoff docs.
- Keep `docs/migration-progress.md` and `docs/migration-todos.md` aligned after each completed step.

## Recommended next-file order from handoff
1. `src/components/itemDetails/ItemInfoBlock.vue`
2. `src/components/itemDetails/ItemImagesBlock.vue`
3. `src/components/itemDetails/ItemPDMsStatisticBlock.vue`
4. `src/components/itemDetails/ItemWOStatisticBlock.vue`
5. `src/components/itemDetails/MaintenanceListWrapper.vue`
6. `src/components/table/TableHeader.vue`
7. `src/components/table/Row.vue`
8. `src/components/table/TableCell.vue`
9. `src/components/table/TableHeaderCell.vue`

## Reply mode to keep
- No code/diff output.
- One step at a time.
- After each step, provide the result and the path in plain text.
