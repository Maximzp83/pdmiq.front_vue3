# Session Context

## Active Working Mode
- No code or diff output in responses unless a risk or ambiguity must be discussed.
- One step at a time.
- Apply changes only after explicit user confirmation.
- Ask first if there are risks, ambiguities, or disputable points.
- After each completed step, provide the result and the file path in plain text, then stop.

## Current Migration Rules
- Migrate one file at a time unless files are structurally coupled.
- For `src/views` entity migrations, use `src/views/Plants` and `src/views/Brands` as reference patterns.
- When migrating a next entity from `vue2_project/src/views`, also enable its existing route in `src/router/index.js` and its existing menu item in `src/constants/menuItems.js` if present.
- Replace legacy `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace legacy `<CustomSelect>` usages with `<CustomSelectV2`.
- Do not keep legacy `requestsListMixin` or `requestsToDoList` loaders for `<FetchByQuerySelect>`; use component settings such as `fetchAction`, `fetchByIdAction`, and `bindTo`.
- Lint the touched file after each migration step, then update docs if needed, then stop.

## Current State
- `BrandModels` details stack is migrated in Vue3:
  - `src/views/BrandModels/Details/MoveForm.vue`
  - `src/views/BrandModels/Details/LocationList.vue`
  - `src/views/BrandModels/Details/DetailsPage.vue`
- `BrandModelDetailsPage` route is enabled in `src/router/index.js`.
- `src/config/entities.js` includes `Assets`, `StoreRooms`, and `Equipments` needed by the migrated details flow.
- `src/components/itemDetails/ItemImagesBlock.vue` was fixed by restoring `Lang.tt`.

## Current Priority
- Keep docs and handoff state aligned with actual migration progress.
- Do not reopen completed `BrandModels` details work unless a new issue is reported.
- Next real code work remains around unfinished `Plants` details coverage or the next migration target selected by the user.

## Known Unresolved Area
- `src/views/Plants/Details/DetailsPage.vue` is still incomplete compared with the legacy page.
- Missing or not-yet-migrated dependencies still block full feature parity for some dashboard/detail sections.
