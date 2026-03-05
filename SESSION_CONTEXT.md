# Continuation Briefing

## Project stack
- Vue 3 (`script setup`), Vite 6, Vue Router 4, Pinia 3
- Element Plus 2, Highcharts + highcharts-vue
- HTTP: `api_request` wrapper (`src/api/*`) over axios
- Tooling: ESLint 9, Prettier 3, Vitest

## Key architecture rules
- Migrate from `vue2_project` into Vue3 architecture only.
- Use composables + Pinia; do not reintroduce Vuex/mixins patterns into runtime code.
- Migration replacements:
  - `@event="handleEventNew"` -> `@event="handleEvent"`
  - `<CustomSelect...>` -> `<CustomSelectV2...>`
- One step at a time; exception allowed for tightly coupled parent/child files in one combined step.
- No code/diff output in normal responses; ask before applying risky/ambiguous changes.

## Current task status
- Re-ran sync against correctly updated `vue2_project` and applied only functional deltas to already migrated files.
- Synced runtime-relevant updates:
  - `src/views/Plants/ItemForm.vue`: order of `Commissioning` / `Archive` aligned to legacy update.
  - `src/components/layout/DashboardLayout.vue`: `enableMfaWarning` logic enabled.
  - `src/constants/global.js`: `itemSpeedOptionsList` entries now include `draggable: true`.
- Synced legacy SCSS deltas into migrated sass files:
  - `src/assets/sass/common/layout.scss`
  - `src/assets/sass/common/common-content.scss`
  - `src/assets/sass/common/common-blocks.scss`

## Files already modified
- Active Vue3/app files (current worktree):
  - `src/views/Plants/ItemForm.vue`
  - `src/components/layout/DashboardLayout.vue`
  - `src/constants/global.js`
  - `src/assets/sass/common/layout.scss`
  - `src/assets/sass/common/common-content.scss`
  - `src/assets/sass/common/common-blocks.scss`
- Utility/session file:
  - `codex_session_end_prompts.yaml`
- Legacy source updates present in worktree (reference only):
  - multiple files under `vue2_project/src/**` (Plants, Equipments, Sensors, helpers, constants, sass, etc.)

## Unresolved issues
- Functional runtime verification still pending for latest synced changes (especially dashboard + Plants flows).
- `src/views/Plants/Details/DetailsPage.vue` remains unfinished relative to full legacy behavior.
- `src/components/layout/TopNavbar.vue` still needs final functional pass after previous cleanup.

## Next actionable step
1. Run runtime check for `/plants` and `/dashboard/plant` (MFA warning, form behavior, filters, pagination).
2. Continue migration completion for `src/views/Plants/Details/DetailsPage.vue`.
