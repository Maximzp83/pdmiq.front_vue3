# Session Context

## Active Working Mode
- No code or diff output in responses.
- One step at a time.
- Apply changes only after explicit user confirmation.
- If there is any risk, ambiguity, or disputable point, stop and ask first.
- After each completed step, stop and wait for the next instruction.
- After each step, report only the result and the file path in plain text.

## Primary Rule Sources
- `docs/session-collaboration-rules.md`
- `docs/new-session-handoff.md`
- `docs/migration-progress.md`
- `docs/migration-todos.md`
- `docs/static-img-path-rule.md`

## Current Migration Rules
- Continue Vue2 -> Vue3 migration incrementally and non-destructively.
- Prefer one file per step; use a coupled multi-file step only when structurally necessary.
- Keep migrated views aligned with `src/views/Plants` and `src/views/Brands`.
- For entity migrations from `vue2_project/src/views` to `src/views`, use `src/views/Plants` as the main reference pattern.
- When migrating a view entity, also uncomment and enable its existing route in `src/router/index.js` and existing menu item in `src/constants/menuItems.js` if present.
- Replace legacy table event wiring `@event="handleEventNew"` with `@event="handleEvent"`.
- Replace `<CustomSelect` usages with `<CustomSelectV2`.
- Replace `/static/img` references inside `src/` with `@/assets/img`, and copy missing image assets from the Vue2 project when needed.

## Architecture Baseline
- Stack: Vue 3, `script setup`, Vite, Vue Router 4, Pinia, Element Plus.
- Shared CRUD flows should use `useItemsData`, `useItemPage`, `useItemForm`, and `useRequestsList`.
- `src/config/entities.js` is the source of truth for entity route/API/filter metadata.
- Prefer `entityKey` in CRUD composables unless a real override is needed.
- Use `api_request` as the standard API interface rather than raw legacy API usage.

## Current State Snapshot
- API migration is complete.
- Store migration is complete: 44/44 stores migrated.
- Core entity migrations already completed for current Vue3 scope include `Brands`, `Parts`, `EquipmentTypesCategories`, `Teams`, `PlantsVendors`, `Applications`, `Processes`, `Plants`, `Companies`, and related CRUD/composable alignment work recorded in the docs.
- Most component migration batches listed in the handoff and TODO docs are already marked done.

## Outstanding Cautions
- `SESSION_CONTEXT.md` previously contained a broader verification-pass note set that is now superseded by the docs named above.
- Some earlier wide `src/views` alignment work still needs focused runtime/validation follow-up after a rollback noted in the previous session context.
- `src/views/Plants/ItemPage.vue` is still called out in `docs/migration-todos.md` as a temporary stub that must be fully migrated, even though other Plants files were restored or completed.

## Recommended Next Focus
- Follow the components-first rule from the current docs.
- Keep work strictly file-by-file unless a coupled exception is genuinely required.
- After each future step: lint the affected file, update the migration docs if needed, then stop.
