# Continuation Briefing

## Project stack
- Vue 3 with `script setup`
- Vite
- Vue Router 4
- Pinia
- Element Plus
- ESLint

## Key architecture rules
- Migrate one step at a time; ask first on any risk or ambiguity.
- For migrated entities, use shared composables where possible: `useItemsData`, `useItemPage`, `useItemForm`, `useRequestsList`.
- Use explicit `/new` routes for create mode.
- Prefer `@event="handleEvent"` and `<CustomSelectV2`.
- Use `src/config/entities.js` as the single source of truth for entity API/route config.
- For auxiliary requests targeting first-class entities, reference those entity configs directly and build requests through `src/api/request_factories.js`.

## Current task status
- Simple `vue2_project/src/views` entity migration pass is active.
- Completed entities in current Vue3 scope: `Brands`, `Parts`, `EquipmentTypesCategories`, `Teams`, `PlantsVendors`.
- Registry rollout is in place for migrated view entrypoints: `Brands`, `Applications`, `Parts`, `Plants`, `PlantsVendors`, `EquipmentTypesCategories`, `Teams`, `Processes`, `Machines`, `MaintenanceCategories`.
- Shared request-factory pattern is applied to migrated forms with auxiliary fetches; no remaining `createGetRequest(...related...)` usages for first-class entities.

## Files already modified
- `src/config/entities.js`
- `src/api/request_factories.js`
- `src/views/Brands/ItemsList.vue`
- `src/views/Brands/ItemPage.vue`
- `src/views/Applications/ItemsList.vue`
- `src/views/Applications/ItemPage.vue`
- `src/views/Applications/ItemForm.vue`
- `src/views/Parts/ItemsList.vue`
- `src/views/Parts/ItemPage.vue`
- `src/views/Parts/ItemForm.vue`
- `src/views/Plants/ItemsList.vue`
- `src/views/Plants/ItemPage.vue`
- `src/views/Plants/ItemForm.vue`
- `src/views/PlantsVendors/ItemsList.vue`
- `src/views/PlantsVendors/ItemPage.vue`
- `src/views/PlantsVendors/ItemForm.vue`
- `src/views/EquipmentTypesCategories/ItemsList.vue`
- `src/views/EquipmentTypesCategories/ItemPage.vue`
- `src/views/Teams/ItemsList.vue`
- `src/views/Teams/ItemPage.vue`
- `src/views/Teams/ItemForm.vue`
- `src/views/Processes/ItemsList.vue`
- `src/views/Processes/ItemPage.vue`
- `src/views/Processes/ItemForm.vue`
- `src/views/Machines/ItemsList.vue`
- `src/views/Machines/ItemPage.vue`
- `src/views/MaintenanceCategories/ItemsList.vue`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/session-collaboration-rules.md`
- `SESSION_CONTEXT.md`

## Unresolved issues
- `src/views/Plants/ItemPage.vue` is still a temporary stub and not a finished target-state page.
- `EquipmentTypesCategories` menu entry is still deferred because its legacy menu item is nested under the not-yet-migrated `item_types` parent block.
- `Teams` menu entry is still deferred because its legacy menu item is nested under the not-yet-migrated `Users` parent block.
- Router and menu definitions still keep local path strings; they are not yet sourced from `src/config/entities.js`.
- Several remaining view entities from `vue2_project/src/views` are still unmigrated.

## Next actionable step
- Continue the simple entity migration pass with the next low-complexity unmigrated entity from `vue2_project/src/views`, and when migrating it:
  use `src/config/entities.js` for API/route config, use shared composables, enable its router/menu entries if safe, and avoid duplicating first-class entity URLs in local form request config.
