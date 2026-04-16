# Session Context

## Active process rules
- Apply changes only after explicit user confirmation.
- Work one file at a time; use a coupled multi-file step only if files are structurally tied.
- If there is any risk, ambiguity, or disputable point, ask before changing files.
- Diff preview is not required by default.
- Do not show code or diff in normal replies.
- After each migration step: lint the migrated file, update docs, then stop and wait.
- After each completed step, report the result in plain text with the migrated file path only.
- Do not mention docs updates after each step unless the docs themselves were the task.
- When migrating the next entity from `vue2_project/src/views`, also find and uncomment its existing routes in `src/router/index.js` and its existing menu entries in `src/constants/menuItems.js`, if they are present there.

## Migration direction
- Continue Vue2 -> Vue3 migration with focus on `vue2_project/src/components`.
- For `src/views` entity migration, use `src/views/Plants` as the reference pattern.
- Replace all `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace all `<CustomSelect` usages with `<CustomSelectV2`.

## Current migration snapshot
- Latest completed component migrations include:
  `src/components/gridTable/GridItemCardHeader.vue`,
  `src/components/table/CustomDataListTable.vue`,
  `src/components/gridTable/ItemsGridContainer.vue`,
  `src/components/itemDetails/CounterItem.vue`,
  `src/components/form/uploadBlock/FileUploadBlockItem.vue`,
  `src/components/form/uploadBlock/FileUploadBlock.vue`.
- Current views-first simple-entity pass completed:
  `src/views/Brands/ItemsList.vue`,
  `src/views/Brands/ItemForm.vue`,
  `src/views/Brands/ItemPage.vue`.
- `Brands` routes and sidebar menu entry are now enabled.
- `Parts` entity migration is now completed with active routes and sidebar menu entry.
- `EquipmentTypesCategories` entity migration is now completed with active routes; menu entry remains deferred because it depends on the not-yet-migrated `item_types` parent menu block.
- `Teams` entity migration is now completed with active routes; menu entry remains deferred because it depends on the not-yet-migrated `Users` parent menu block.
- `PlantsVendors` entity migration is now completed with active routes and sidebar menu entry.
- `src/views/PlantsVendors/ItemForm.vue` is aligned to the shared `useItemForm` / `useRequestsList` item-form pattern with `localSetupPage`.
- `src/views/Plants/Details/DetailsPage.vue` was restored from a previous commit.
- `src/views/Plants/ItemPage.vue` is still a temporary stub and remains pending for full migration.

## Recommended next-file order
- `src/components/itemDetails/ItemInfoBlock.vue`
- `src/components/itemDetails/ItemImagesBlock.vue`
- `src/components/itemDetails/ItemPDMsStatisticBlock.vue`
- `src/components/itemDetails/ItemWOStatisticBlock.vue`
- `src/components/itemDetails/MaintenanceListWrapper.vue`
- `src/components/table/TableHeader.vue`
- `src/components/table/Row.vue`
- `src/components/table/TableCell.vue`
- `src/components/table/TableHeaderCell.vue`

## Notes for continuation
- Current user priority: migrate simpler entities from `vue2_project/src/views` before returning to component backlog.
- Keep component-first priority before returning to pending view migration.
- `useItemsData` is the shared list-flow pattern.
- `useItemPage` is the shared item-page pattern.
- Create mode should use explicit `/new` routes.
- `useItemPage` now resolves create mode from explicit `/new` path segments when no `route.params.id` exists.
- Delete flow should continue through `ids`.
