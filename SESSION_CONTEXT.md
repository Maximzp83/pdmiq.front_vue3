# Continuation Briefing

## Project stack
- Vue 3 with `script setup`
- Vite
- Vue Router 4
- Pinia
- Element Plus

## Key architecture rules
- Shared CRUD flows should go through `useItemsData`, `useItemPage`, `useItemForm`, and `useRequestsList`.
- `src/config/entities.js` is the source of truth for entity routing, API base paths, filter storage keys, and translated item names.
- Prefer `entityKey` when wiring CRUD composables; pass `apiRoute`, `itemRoute`, `itemFiltersName`, or `itemsName` only for true overrides.
- `executeFormSubmit` is the shared submit path; entity-specific post-submit behavior should be injected via callbacks instead of hardcoded branches.
- Keep migrated `src/views` aligned with established Vue 3 CRUD examples in `src/views/Plants` and `src/views/Brands`.

## Current task status
- Core CRUD composables were already updated so `entityKey` can resolve API route, item route, filter storage key, and default `itemsName`.
- A broad alignment pass is in progress across `src/views` so migrated entity pages/lists/forms use the current composable contracts.
- A focused verification pass was started on `Companies`, `Plants`, `Processes`, `PlantsVendors`, and `EquipmentTypesCategories`.
- During that pass, local issues were identified and partly corrected:
  - `Companies/InfoPage.vue` had cleanup for an unused import/debug logging.
  - `PlantsVendors/ItemForm.vue` restored custom mapping for related `equipment_type_*_ids`.
  - `Processes/ItemForm.vue` restored default `plant_id` setup from global filters for new items.
- `eslint` on the targeted CRUD files and `npm run build` were passing before a later user-requested partial rollback.
- The later rollback removed only changes related to `initialFormData` restoration in several forms; no validation was rerun after that rollback.

## Files already modified
- `components.d.ts`
- `docs/new-session-handoff.md`
- `src/components/form/CustomInput.vue`
- `src/views/Applications/ItemForm.vue`
- `src/views/Applications/ItemPage.vue`
- `src/views/Applications/ItemsList.vue`
- `src/views/Brands/ItemsList.vue`
- `src/views/Companies/InfoPage.vue`
- `src/views/Companies/ItemForm.vue`
- `src/views/Companies/ItemPage.vue`
- `src/views/Companies/ItemsList.vue`
- `src/views/EquipmentTypesCategories/ItemPage.vue`
- `src/views/EquipmentTypesCategories/ItemsList.vue`
- `src/views/Machines/ItemPage.vue`
- `src/views/Machines/ItemsList.vue`
- `src/views/MaintenanceCategories/ItemsList.vue`
- `src/views/Parts/ItemForm.vue`
- `src/views/Parts/ItemPage.vue`
- `src/views/Parts/ItemsList.vue`
- `src/views/Plants/ItemForm.vue`
- `src/views/Plants/ItemPage.vue`
- `src/views/Plants/ItemsList.vue`
- `src/views/PlantsVendors/ItemForm.vue`
- `src/views/PlantsVendors/ItemPage.vue`
- `src/views/PlantsVendors/ItemsList.vue`
- `src/views/Processes/ItemForm.vue`
- `src/views/Processes/ItemPage.vue`
- `src/views/Processes/ItemsList.vue`
- `src/views/Teams/ItemForm.vue`
- `src/views/Teams/ItemPage.vue`
- `src/views/Teams/ItemsList.vue`

## Unresolved issues
- The wide `src/views` alignment pass still needs revalidation after the rollback of `initialFormData`-related changes.
- Custom `itemsName` override cases still need runtime verification, especially `EquipmentTypesCategories` and `PlantsVendors`.
- `Machines/ItemsList.vue` still follows a more custom list flow and needs separate review.
- Modal/new-item reset behavior in forms where `initialFormData` rollback happened may still be a regression; this is currently unresolved by user request.

## Next actionable step
- Rerun a focused verification pass now that the rollback is applied:
  - run `eslint` on the modified CRUD files
  - run `npm run build`
  - then spot-check `Companies`, `Plants`, `Processes`, `PlantsVendors`, and `EquipmentTypesCategories` for route/modal create-edit flows, paying special attention to form reset behavior and custom `itemsName` handling.
