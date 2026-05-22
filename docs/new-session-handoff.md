# New Session Handoff

## Current Objective
- Continue Vue2 -> Vue3 migration with focus on the remaining `BrandModels` details stack from `vue2_project/src/views/BrandModels/Details`.
- Migrate and/or sync exactly one file per step unless the files are structurally coupled.

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
  - `src/views/BrandModels/ItemsList.vue`
  - `src/views/BrandModels/ItemForm.vue`
  - `src/views/BrandModels/ItemPage.vue`
  - `src/views/BrandModels/TypeOptionValueItem.vue`
  - `src/views/BrandModels/TypeMediaValueItem.vue`
  - `src/views/BrandModels/ItemCard.vue`
  - `src/views/BrandModels/StoreroomWrapper.vue`
- Supporting request/item-card infrastructure was refactored to support the `BrandModels` migration.
- `StoreroomWrapper.vue` was migrated as a file, but its route/menu wiring was not handled in the same step.
- `setFiltersViaList` was refactored to explicit store config; remaining old `action: 'module/set_*_filters'` payloads in active Vue3 code should be migrated when touched.

## Recommended Next File Order
Use one-by-one sequence unless a coupled exception is required:
1. `src/views/BrandModels/Details/MoveForm.vue`
2. `src/views/BrandModels/Details/LocationList.vue`
3. `src/views/BrandModels/Details/DetailsPage.vue`

Rationale:
- These files are the remaining unmigrated `BrandModels` details stack.
- `LocationList.vue` and `DetailsPage.vue` are coupled to `MoveForm.vue`, so a narrow multi-file step is acceptable if the migration demands it.

## Remaining BrandModels Files
- `vue2_project/src/views/BrandModels/Details/MoveForm.vue`
- `vue2_project/src/views/BrandModels/Details/LocationList.vue`
- `vue2_project/src/views/BrandModels/Details/DetailsPage.vue`

## Files Already Modified In This Migration Batch
- `src/views/BrandModels/ItemsList.vue`
- `src/views/BrandModels/ItemForm.vue`
- `src/views/BrandModels/ItemPage.vue`
- `src/views/BrandModels/TypeOptionValueItem.vue`
- `src/views/BrandModels/TypeMediaValueItem.vue`
- `src/views/BrandModels/ItemCard.vue`
- `src/views/BrandModels/StoreroomWrapper.vue`
- `src/config/entities.js`
- `src/components/form/FetchByQuerySelect.vue`
- `src/composables/requests/useAsyncSelect.js`
- `src/composables/requests/useRequestBinding.js`
- `src/composables/requests/executeRequestAction.js`
- `src/composables/mixins/useRequestsList.js`
- `src/composables/mixins/useItemsData.js`
- `src/composables/useDeferredRequestScheduler.js`
- `src/composables/mixins/useItemCard.js`
- `src/composables/mixins/useHelpers.js`
- `src/helpers/specialHelpers.js`
- `src/stores/mixins/commonStoreMixin.js`

## Docs To Keep Updating
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/session-collaboration-rules.md` (if process changes again)
