# Continuation Briefing

## Project Stack
- Vue 3 with `script setup`
- Vite
- Vue Router 4
- Pinia
- Element Plus

## Key Architecture Rules
- Migrate from `vue2_project` into the Vue3 architecture only; do not reintroduce Vue2 mixins or Vuex runtime patterns.
- Prefer shared composables for CRUD and page flows: `useItemsData`, `useItemPage`, `useItemForm`, `useRequestsList`, `useSubItem`, `useSubItemsList`.
- Use `src/config/entities.js` as the source of truth for entity API/route metadata where the entity is registered.
- Replace legacy `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace legacy `<CustomSelect>` usages with `<CustomSelectV2`.
- Do not import `CustomSelectV2` or `CustomInput` locally; they are registered globally.
- Do not keep legacy `requestsListMixin` / `requestsToDoList` loaders for `<FetchByQuerySelect>` when migrating to Vue3; move async loading into component settings (`fetchAction`, `fetchByIdAction`, `bindTo`, etc.).
- For docs and `SESSION_CONTEXT.md`, updates may be applied without separate confirmation.

## Current Task Status
- `UserRoles` migration is complete for current scope:
  - `src/views/UserRoles/ItemsList.vue`
  - `src/views/UserRoles/ItemForm.vue`
  - `src/views/UserRoles/ItemPage.vue`
  - Routes enabled in `src/router/index.js`
  - Sidebar entry enabled in `src/constants/menuItems.js`
- `EquipmentTypes` migration is complete for current scope:
  - `src/views/EquipmentTypes/ItemsList.vue`
  - `src/views/EquipmentTypes/ItemForm.vue`
  - `src/views/EquipmentTypes/ItemPage.vue`
  - `ComponentItem.vue`, `DriveItem.vue`, `TypeOptionItem.vue`, `TypeMediaItem.vue`, `PredefinedValueItem.vue`, `AnalysisItem.vue`, `VibrationAnalysisItemsBlock.vue`
  - Routes enabled in `src/router/index.js`
  - Menu group enabled in `src/constants/menuItems.js`
- Shared cleanup applied:
  - `activeSortingFilters` moved into `src/components/table/TableHeader.vue`
  - `setSubItemRef` moved into `src/composables/mixins/useSubItemsList.js`
  - Shared `el-button icon="icomoon ..."` issues fixed in `TabsBar.vue`, `DropdownFilterbar.vue`, `SidebarWithSubs.vue`

## Files Already Modified
- `src/views/UserRoles/ItemsList.vue`
- `src/views/UserRoles/ItemForm.vue`
- `src/views/UserRoles/ItemPage.vue`
- `src/views/EquipmentTypes/ItemsList.vue`
- `src/views/EquipmentTypes/ItemForm.vue`
- `src/views/EquipmentTypes/ItemPage.vue`
- `src/views/EquipmentTypes/ComponentItem.vue`
- `src/views/EquipmentTypes/DriveItem.vue`
- `src/views/EquipmentTypes/TypeOptionItem.vue`
- `src/views/EquipmentTypes/TypeMediaItem.vue`
- `src/views/EquipmentTypes/PredefinedValueItem.vue`
- `src/views/EquipmentTypes/AnalysisItem.vue`
- `src/views/EquipmentTypes/VibrationAnalysisItemsBlock.vue`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/components/table/TableHeader.vue`
- `src/components/table/CustomDataListTable.vue`
- `src/composables/mixins/useSubItemsList.js`
- `src/components/common/TabsBar.vue`
- `src/components/common/DropdownFilterbar.vue`
- `src/components/layout/Sidebar/SidebarWithSubs.vue`
- `docs/session-collaboration-rules.md`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/new-session-handoff.md`

## Unresolved Issues
- `EquipmentTypes` migration is lint-clean, but runtime should still be smoke-tested in the browser for nested tabs, file uploads, and vibration analysis save flow.
- `VibrationAnalysisItemsBlock.vue` uses direct API calls to `/measurement-units` and `/equipments/types/:equipmentTypeId/vibration-analysis-rules`; this path should be verified against actual backend responses in runtime.
- Other project areas may still contain legacy Element Plus incompatibilities like `icon="icomoon ..."` or `size="mini"` outside the recently touched scope.

## Next Actionable Step
- Smoke-test `EquipmentTypes` create/edit flow in the app and fix any runtime issues found there before moving to the next unmigrated entity.
