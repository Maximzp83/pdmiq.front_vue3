# Continuation Briefing

## Project Stack
- Vue 3 + Vite, Vue Router 4, Pinia, Element Plus, `<script setup>`.
- Vue2 migration source: `vue2_project/`; Vue3 target: `src/`.

## Key Architecture Rules
- Compare migrated files against Vue2 originals before changing behavior.
- Preserve Vue2 behavior while adapting to Vue3 architecture: `src/api`, Pinia stores, existing composables, Element Plus, Vue Router 4.
- Do not copy Vue2 API/store/mixins/helpers as-is; adapt behavior to existing Vue3 modules.
- Use existing local composables and globally registered form controls where applicable.
- Session collaboration: no code/diff output in replies; work one step at a time; after each step report result and changed path(s). Ask before risky or ambiguous changes.

## Current Task Status
- Sensors form HTML was partially re-aligned with Vue2 originals:
  - `src/views/Sensors/sensorForm/ItemForm.vue`: removed extra inner `tab-container`; moved `half-width` behavior to root container.
  - `src/views/Sensors/sensorForm/ItemFormNCD.vue`: removed extra `equipment_id` select that does not exist in Vue2 original.
  - `src/views/Sensors/sensorForm/ItemFormNCD.vue`: added `:validate-on-rule-change="false"` to avoid `data_set` watcher triggering form validation through dynamic rules.
- `src/components/layout/TopNavbar.vue`: `baseCreationMenuList` now uses `componentFileLoader` instead of `componentPath` for Utility and Item creation modals.
- `src/views/Equipments/ItemForm.vue`:
  - Restored active Vue2 `selectedEquipmentType` watcher logic: `without_brand` removes `brand_id` validation; new items receive default brand/model and local select options without duplicates.
  - Converted conditional local components to `defineAsyncComponent`: `AnalysisRuleItem`, `ChildComponentItem`, `AttachmentItem`.
- `src/views/Equipments/Card/ItemCard.vue`: restored drag-and-drop reorder for sensor/multiview card items using existing `useDragNdropSortable`; reorder calls PUT `/equipments/{id}/card-items-order` and reinitializes on failure.
- `src/composables/mixins/useDragNdropSortable.js` already exists and is also used by file upload reorder; no new composable was created.
- Latest verification after each step: `npm run build` passed; targeted `git diff --check` passed.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `src/views/Sensors/sensorForm/ItemForm.vue`
- `src/views/Sensors/sensorForm/ItemFormNCD.vue`
- `src/components/layout/TopNavbar.vue`
- `src/views/Equipments/ItemForm.vue`
- `src/views/Equipments/Card/ItemCard.vue`
- Prior worktree modifications also exist in related migration files, including:
  - `src/components/common/Datepicker.vue`
  - `src/assets/sass/element-ui/elements.scss`
  - `src/views/Equipments/EquipmentsLayout.vue`
  - `src/views/Equipments/ExportChartsToPdfContent.vue`
  - `src/views/Sensors/sensorForm/ItemFormUltraSound.vue`
  - `src/composables/useSensors.js`

## Unresolved Issues
- No authenticated runtime/API/websocket testing was performed.
- Sensors PDF/FFT/RPM flows still need authenticated smoke testing.
- Equipment forms need runtime validation with real edit data, especially sensors, Multi View, wrapper submit orchestration, and card reorder persistence.
- `src/views/Sensors/sensorForm/ItemFormUltraSound.vue` still needs careful HTML comparison against Vue2 original if continuing the earlier form-alignment task.
- After removing NCD `equipment_id` HTML, related script-only helpers such as `equipmentsSelectSettings` may now be unused; they were intentionally not removed because the user requested HTML-only at that step.

## Next Actionable Step
- Runtime-test equipment card drag-and-drop reorder on Plant Details dashboard with authenticated data; confirm the PUT request payload and UI ordering after refresh.
