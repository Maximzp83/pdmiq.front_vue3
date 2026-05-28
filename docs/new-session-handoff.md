# New Session Handoff

## Current Objective
- Continue Vue2 -> Vue3 migration for `vue2_project/src/views/Controllers`.
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
- `Controllers` migration has started:
  - `src/views/Controllers/ItemsList.vue` was added in Vue3 style.
  - It uses `useItemsData`, `useEventHandler`, Pinia `ControllersStore`, and `ENTITIES.Controllers`.
  - Controller-specific list actions were preserved with direct `api_request` calls where no dedicated composable exists yet.
  - `src/views/Controllers/ItemPage.vue` was added in Vue3 style.
  - It uses `useItemPage`, lazy form components, controller type selection from item data or route query, tabs, and multipart payload detection.
  - `src/views/Controllers/ItemForm.vue` was added in Vue3 style for PDM/Banner controllers.
  - It uses `useItemForm`, `useRequestsList`, `useSubItemsList`, and global form controls.
  - `src/views/Controllers/FormulasRow.vue` was added in Vue3 style for PDM/Banner formulas rows.
  - `src/views/Controllers/DXMCommandsTab.vue` was added in Vue3 style for PDM/Banner commands tab.
  - `src/views/Controllers/CommandItem.vue` was added in Vue3 style for DXM command cards.
  - `src/views/Controllers/CommandsHistoryItem.vue` was added in Vue3 style for DXM command history rows.
  - `src/views/Controllers/ItemFormUltraSound.vue` was added in Vue3 style for LubeMatrix controllers.
  - `src/views/Controllers/ItemFormCounter.vue` was added in Vue3 style for OEE controllers.
  - `src/views/Controllers/ItemFormNCD.vue` was added in Vue3 style for NCD controllers.
  - `src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue` was added in Vue3 style for the legacy White River controller form.
  - Controllers routes were enabled in `src/router/index.js`.
  - Controllers sidebar menu entry was enabled in `src/constants/menuItems.js`.
  - Controllers create blank state was fixed: `ItemPage.vue` defaults `/controllers/new` without query type to PDM/Banner and `ItemForm.vue` gates formulas content by tab presence.
  - Legacy devices tab is intentionally deferred because `Sensors/BannerSensorsList.vue` is not present in Vue3 yet.
- `BrandModels` details stack is now migrated in Vue3:
  - `src/views/BrandModels/Details/MoveForm.vue`
  - `src/views/BrandModels/Details/LocationList.vue`
  - `src/views/BrandModels/Details/DetailsPage.vue`
- Route for `BrandModelDetailsPage` is enabled in `src/router/index.js`.
- `src/config/entities.js` now includes `Assets`, `StoreRooms`, and `Equipments` to support the migrated details flow and remove local endpoint hardcodes.
- Runtime fix applied: `src/components/itemDetails/ItemImagesBlock.vue` now imports `Lang.tt`, which resolved the `_ctx.tt is not a function` crash on `BrandModelDetailsPage`.
- Supporting request/item-card infrastructure from the earlier `BrandModels` migration remains active and was reused by the details stack.

## Latest Completed Files
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue`
- `src/views/Controllers/ItemFormNCD.vue`
- `src/views/Controllers/ItemFormCounter.vue`
- `src/views/Controllers/ItemFormUltraSound.vue`
- `src/views/Controllers/CommandsHistoryItem.vue`
- `src/views/Controllers/CommandItem.vue`
- `src/views/Controllers/DXMCommandsTab.vue`
- `src/views/Controllers/FormulasRow.vue`
- `src/views/Controllers/ItemForm.vue`
- `src/views/Controllers/ItemPage.vue`
- `src/views/Controllers/ItemsList.vue`
- `src/views/BrandModels/Details/MoveForm.vue`
- `src/config/entities.js`
- `src/views/BrandModels/Details/LocationList.vue`
- `src/views/BrandModels/Details/DetailsPage.vue`
- `src/router/index.js`
- `src/components/itemDetails/ItemImagesBlock.vue`

## Recommended Next Focus
- Smoke-test Controllers list/create/edit flows in the app, including PDM/LubeMatrix/OEE/NCD create type links.
- Do not reopen completed `BrandModels` details work unless a new issue is reported.

## Files Already Modified In This Migration Batch
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue`
- `src/views/Controllers/ItemFormNCD.vue`
- `src/views/Controllers/ItemFormCounter.vue`
- `src/views/Controllers/ItemFormUltraSound.vue`
- `src/views/Controllers/CommandsHistoryItem.vue`
- `src/views/Controllers/CommandItem.vue`
- `src/views/Controllers/DXMCommandsTab.vue`
- `src/views/Controllers/FormulasRow.vue`
- `src/views/Controllers/ItemForm.vue`
- `src/views/Controllers/ItemPage.vue`
- `src/views/Controllers/ItemsList.vue`
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
