# Continuation Briefing

## Project Stack
- Vue 3 with `script setup`
- Vite
- Vue Router 4
- Pinia
- Element Plus

## Key Architecture Rules
- When updating this section in future sessions, do not remove or replace existing entries; only append new rules or clarifications.
- Migrate from `vue2_project` into current Vue3 architecture only.
- Use `src/api`, Pinia stores, and composables (`src/composables/mixins/*`); do not reintroduce Vue2 mixins/Vuex patterns into runtime code.
- Use composables + Pinia; do not reintroduce Vuex/mixins patterns into runtime code.
- Migrate one step at a time; ask first on any risk or ambiguity.
- Continue Vue2 -> Vue3 migration incrementally and non-destructively.
- Prefer one file per step; use a coupled multi-file step only when structurally necessary.
- Work one step at a time; exception allowed only for tightly coupled parent/child or structurally linked files.
- Apply changes only after user confirmation.
- Do not show code/diff in normal replies.
- Keep migrated views aligned with `src/views/Plants` and `src/views/Brands`.
- Keep migrated `src/views` aligned with established Vue 3 CRUD examples in `src/views/Plants` and `src/views/Brands`.
- For entity migrations from `vue2_project/src/views` to `src/views`, use `src/views/Plants` as the main reference pattern.
- When migrating a view entity, also uncomment and enable its existing route in `src/router/index.js` and existing menu item in `src/constants/menuItems.js` if present.
- Prefer shared composables over local page/list orchestration.
- Use explicit `/new` routes for create mode.
- Replace legacy table event wiring `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace `<CustomSelect` usages with `<CustomSelectV2`.
- Replace `/static/img` references inside `src/` with `@/assets/img`, and copy missing image assets from the Vue2 project when needed.
- Shared CRUD flows should use `useItemsData`, `useItemPage`, `useItemForm`, `useRequestsList`, `useSubItem`, `useSubItemsList`.
- For migrated entities, use shared composables where possible: `useItemsData`, `useItemPage`, `useItemForm`, `useRequestsList`.
- `useItemsData` owns generic list behavior: fetch, filters, create/edit/delete actions.
- `useItemPage` owns generic item-page behavior: init/load/navbar lifecycle and fetch/save item requests.
- `handleDeleteItems -> deleteItem` must work through `ids`.
- Use `src/config/entities.js` as source of truth when an entity is registered there.
- Use `src/config/entities.js` as the single source of truth for entity API/route config.
- Prefer `entityKey` when wiring CRUD composables; pass `apiRoute`, `itemRoute`, `itemFiltersName`, or `itemsName` only for true overrides.
- For auxiliary requests targeting first-class entities, reference those entity configs directly and build requests through `src/api/request_factories.js`.
- For auxiliary requests targeting first-class entities, build requests through `src/api/request_factories.js`.
- `executeFormSubmit` is the shared submit path; entity-specific post-submit behavior should be injected via callbacks instead of hardcoded branches.
- Keep base select/upload components dumb when possible; place async/request logic in composables.
- `setFiltersViaList` now uses explicit config (`storeName`, `stateKey`, `storageKey`, `params`) rather than hidden action parsing.

## Current Task Status
- Ongoing migration of remaining files from `vue2_project/src/views/BrandModels`.
- Already migrated in Vue3:
  - `src/views/BrandModels/ItemsList.vue`
  - `src/views/BrandModels/ItemForm.vue`
  - `src/views/BrandModels/ItemPage.vue`
  - `src/views/BrandModels/TypeOptionValueItem.vue`
  - `src/views/BrandModels/TypeMediaValueItem.vue`
  - `src/views/BrandModels/ItemCard.vue`
  - `src/views/BrandModels/StoreroomWrapper.vue`
- Supporting request/item-card infrastructure was refactored to support this migration.

## Files Already Modified
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
- `docs/new-session-handoff.md`

## Unresolved Issues
- `BrandModels` details stack is still not migrated:
  - `vue2_project/src/views/BrandModels/Details/DetailsPage.vue`
  - `vue2_project/src/views/BrandModels/Details/LocationList.vue`
  - `vue2_project/src/views/BrandModels/Details/MoveForm.vue`
- `StoreroomWrapper.vue` is migrated as a file, but its route/menu wiring was not handled in this step.
- `setFiltersViaList` was refactored to explicit store config; any remaining old `action: 'module/set_*_filters'` payloads in active Vue3 code should be migrated to the new explicit shape if touched.
- `BrandModels/ItemCard.vue` now uses `useItemCard`; similar legacy item cards may still need the same migration pattern.

## Next Actionable Step
- Migrate `vue2_project/src/views/BrandModels/Details/MoveForm.vue` next.
- After that, continue with `Details/LocationList.vue`, then `Details/DetailsPage.vue`, because those files are structurally coupled.
