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
- Current collaboration mode: no code/diff output in responses, one migration step at a time, stop after each completed step unless the user explicitly confirms a batch.
- Files under `docs/` and `SESSION_CONTEXT.md` may be updated without separate confirmation.

## Current Task Status
- `MaintenanceCategories` was just aligned/completed for current Vue3 scope:
  - List page now uses shared `useItemsData` actions instead of local `createItem`, `editItem`, `deleteMaintenanceCategory`, and manual `api_request.delete`.
  - `ItemForm.vue` and `ItemPage.vue` were added.
  - Routes were enabled for `/maintenance-categories`, `/maintenance-categories/new`, and `/maintenance-categories/:id`.
  - Sidebar menu entry `work_order_type` was enabled.
- Latest checks passed:
  - `git diff --check`
  - `npx eslint src/views/MaintenanceCategories/ItemsList.vue src/views/MaintenanceCategories/ItemForm.vue src/views/MaintenanceCategories/ItemPage.vue src/router/index.js src/constants/menuItems.js src/config/entities.js`

## Files Already Modified
- `src/views/MaintenanceCategories/ItemsList.vue`
- `src/views/MaintenanceCategories/ItemForm.vue`
- `src/views/MaintenanceCategories/ItemPage.vue`
- `src/router/index.js`
- `src/constants/menuItems.js`
- `src/config/entities.js`
- `docs/migration-todos.md`
- `SESSION_CONTEXT.md`

## Unresolved Issues
- `MaintenanceCategories` runtime flow has not been browser smoke-tested after adding form/page/routes/menu.
- Broader project may still contain earlier unrelated lint issues outside the latest checked files.

## Next Actionable Step
- Smoke-test `MaintenanceCategories` list/create/edit/delete in the app, then continue with the next user-selected entity from `vue2_project/src/views`.
