# Continuation Briefing

## Project Stack
- Vue 3 with `<script setup>`
- Vite
- Vue Router 4
- Pinia
- Element Plus

## Key Architecture Rules
- Migrate from `vue2_project` into the Vue3 architecture only; do not reintroduce Vue2 mixins or Vuex runtime patterns.
- Prefer shared composables for CRUD/page flows: `useItemsData`, `useItemPage`, `useItemForm`, `useRequestsList`, `useSubItem`, `useSubItemsList`.
- Use `src/config/entities.js` as entity API/route metadata source where the entity is registered.
- Replace legacy `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace legacy `<CustomSelect>` with `<CustomSelectV2`.
- Do not locally import `CustomSelectV2` or `CustomInput`; they are globally registered.
- Do not keep legacy `requestsListMixin` / `requestsToDoList` loaders for `<FetchByQuerySelect>`; pass async request settings to the component instead.
- Current collaboration mode: no code/diff output in responses, one migration step at a time, stop after each completed step unless the user explicitly confirms a coupled step.
- Files under `docs/` and `SESSION_CONTEXT.md` may be updated without separate confirmation.

## Current Task Status
- `vue2_project/src/views/Controllers` has been migrated into `src/views/Controllers`.
- Controllers routes are enabled in `src/router/index.js`:
  - `/controllers`
  - `/controllers/new`
  - `/controllers/:id`
- Controllers sidebar menu entry is enabled in `src/constants/menuItems.js`.
- Runtime fix applied after smoke-test feedback:
  - `src/views/Controllers/ItemPage.vue` defaults `/controllers/new` without `?type=` to PDM/Banner form.
  - `src/views/Controllers/ItemForm.vue` renders formulas content only when formulas tab exists.
- Latest focused checks passed:
  - `npx eslint src/views/Controllers/ItemPage.vue src/views/Controllers/ItemForm.vue`
  - `npx eslint src/views/Controllers/ItemsList.vue src/views/Controllers/ItemPage.vue src/views/Controllers/ItemForm.vue src/views/Controllers/FormulasRow.vue src/views/Controllers/DXMCommandsTab.vue src/views/Controllers/CommandItem.vue src/views/Controllers/CommandsHistoryItem.vue src/views/Controllers/ItemFormUltraSound.vue src/views/Controllers/ItemFormCounter.vue src/views/Controllers/ItemFormNCD.vue src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue src/router/index.js src/constants/menuItems.js`
  - `git diff --check`

## Files Already Modified
- `src/views/Controllers/ItemsList.vue`
- `src/views/Controllers/ItemPage.vue`
- `src/views/Controllers/ItemForm.vue`
- `src/views/Controllers/FormulasRow.vue`
- `src/views/Controllers/DXMCommandsTab.vue`
- `src/views/Controllers/CommandItem.vue`
- `src/views/Controllers/CommandsHistoryItem.vue`
- `src/views/Controllers/ItemFormUltraSound.vue`
- `src/views/Controllers/ItemFormCounter.vue`
- `src/views/Controllers/ItemFormNCD.vue`
- `src/views/Controllers/ItemFormUltraSoundWhiteRiver.vue`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/new-session-handoff.md`
- `SESSION_CONTEXT.md`

## Unresolved Issues
- `devicesTab` in `src/views/Controllers/ItemForm.vue` is intentionally not implemented yet because it depends on legacy `vue2_project/src/views/Sensors/BannerSensorsList.vue`, which is not present in Vue3.
- To restore the devices tab, migrate `BannerSensorsList.vue` and its dependencies from `vue2_project/src/views/Sensors`.
- Controllers runtime flow still needs a full browser smoke-test after the latest create-page fallback fix.
- `npm run build` currently fails on an unrelated existing import resolution issue: `element-plus/es/components/submenu/style/css` in `src/components/layout/Sidebar/SidebarWithSubs.vue`.
- Broader project may still contain unrelated lint/build issues outside the focused Controllers files.

## Next Actionable Step
- Smoke-test Controllers in the app:
  - `/controllers`
  - `/controllers/new`
  - `/controllers/new?type=1`
  - `/controllers/new?type=2`
  - `/controllers/new?type=4`
  - `/controllers/new?type=5`
  - `/controllers/:id`
- If devices tab is required next, migrate `vue2_project/src/views/Sensors/BannerSensorsList.vue` and its dependencies, then wire it into `src/views/Controllers/ItemForm.vue`.
