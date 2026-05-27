# New Session Handoff

## Current Objective
- Continue Vue2 -> Vue3 migration after completing the `BrandModels` details stack.
- Migrate and/or sync exactly one file per step unless the files are structurally coupled.

## Mandatory Workflow For Next Session
- Apply changes only after explicit user confirmation.
- Exception: files under `docs/` and `SESSION_CONTEXT.md` may be updated automatically without separate confirmation.
- If there are risks or ambiguous points, ask first and do not apply until confirmed.
- Work one file at a time.
- Diff preview is not required by default.
- Do not print code or diff in responses unless a risk or ambiguity must be discussed.
- After each completed step: report the result and the file path in plain text, then STOP.

Primary rules source:
- `docs/session-collaboration-rules.md`
- Reference examples for `src/views` entity migration: `src/views/Plants`, `src/views/Brands`
- Reference example for `FetchByQuerySelect` / `requestsToDoList` patterns with `hasValueCase`, `bindTo`, and dropdown-triggered full-list reload: `src/views/BrandModels/ItemsList.vue`
- Migration note: when a legacy file loads data for `<FetchByQuerySelect>` through `requestsToDoList` / `requestsListMixin`, do not carry that duplication into Vue3. Move that logic into the component settings (`fetchAction`, `fetchByIdAction`, `bindTo`, etc.) because `src/components/form/FetchByQuerySelect.vue` already handles async option loading.

## Migration State Snapshot
- `BrandModels` details stack is now migrated in Vue3:
  - `src/views/BrandModels/Details/MoveForm.vue`
  - `src/views/BrandModels/Details/LocationList.vue`
  - `src/views/BrandModels/Details/DetailsPage.vue`
- Route for `BrandModelDetailsPage` is enabled in `src/router/index.js`.
- `src/config/entities.js` now includes `Assets`, `StoreRooms`, and `Equipments` to support the migrated details flow and remove local endpoint hardcodes.
- Runtime fix applied: `src/components/itemDetails/ItemImagesBlock.vue` now imports `Lang.tt`, which resolved the `_ctx.tt is not a function` crash on `BrandModelDetailsPage`.
- Supporting request/item-card infrastructure from the earlier `BrandModels` migration remains active and was reused by the details stack.

## Latest Completed Files
- `src/views/BrandModels/Details/MoveForm.vue`
- `src/config/entities.js`
- `src/views/BrandModels/Details/LocationList.vue`
- `src/views/BrandModels/Details/DetailsPage.vue`
- `src/router/index.js`
- `src/components/itemDetails/ItemImagesBlock.vue`

## Recommended Next Focus
- Do not reopen completed `BrandModels` details work unless a new issue is reported.
- Continue unfinished `src/views/Plants/Details/DetailsPage.vue` coverage when its missing Vue3 dependencies are available.
- Otherwise move to the next real Vue3 migration target selected by the user.

## Files Already Modified In This Migration Batch
- `src/views/BrandModels/ItemsList.vue`
- `src/views/BrandModels/ItemForm.vue`
- `src/views/BrandModels/ItemPage.vue`
- `src/views/BrandModels/TypeOptionValueItem.vue`
- `src/views/BrandModels/TypeMediaValueItem.vue`
- `src/views/BrandModels/ItemCard.vue`
- `src/views/BrandModels/StoreroomWrapper.vue`
- `src/views/BrandModels/Details/MoveForm.vue`
- `src/views/BrandModels/Details/LocationList.vue`
- `src/views/BrandModels/Details/DetailsPage.vue`
- `src/config/entities.js`
- `src/components/form/FetchByQuerySelect.vue`
- `src/components/itemDetails/ItemImagesBlock.vue`
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
- `src/router/index.js`

## Docs To Keep Updating
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/session-collaboration-rules.md` (if process changes again)
- `SESSION_CONTEXT.md`
