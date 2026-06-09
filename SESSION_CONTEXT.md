# Continuation Briefing

## Project Stack
- Vue 3 app using Vite, Vue Router 4, Pinia, Element Plus, and `<script setup>`.
- Migration source is `vue2_project/`; Vue3 target is `src/`.
- Current area: Plant Details dashboard hierarchy and Equipments dashboard card/list behavior.

## Key Architecture Rules
- Preserve Vue2 behavior while using existing Vue3 composables and local patterns.
- Apply code changes only after user confirmation; docs and `SESSION_CONTEXT.md` may be updated automatically.
- Work one step/file at a time unless files are structurally coupled.
- Do not print code/diff in responses unless a risky or ambiguous point needs discussion.
- Use `src/views/Plants` and existing migrated dashboard/list patterns as references.
- Plant Details must embed `src/views/Equipments/EquipmentsLayout.vue`; Equipments ownership stays under `src/views/Equipments`.
- Dashboard create/edit flows should use `src/views/Dashboard/MultiFormWrapper.vue` / `MultiFormItemWrapper.vue`.
- Forward grid/card events through `useEventHandler` chains.

## Current Task Status
- Plant Details now renders `src/views/Equipments/EquipmentsLayout.vue`; temporary `src/views/Plants/Details/EquipmentsList.vue` was removed.
- `src/components/itemDetails/ItemPDMsStatisticBlock.vue` has the missing `CommonChartItemWrapper` restored, so the Plant Details PDM statistics chart should render.
- `src/views/Plants/Details/Counters.vue` fetches `/dashboard/counters` with `prepareData: 'prepareCountersData'`. Do not add `dataPath: 'data'`; Vue3 `dataPath` reads one level deeper than the legacy `alternateResponseProp: 'data'`.
- Equipments card header now uses the original add/remove favorites content instead of the temporary eye icon.
- `src/components/common/addToFavoriteButton.vue` is Vue3 `<script setup>`, uses `useAuthStore().hasAccessTo()`, imports Element Plus `Star` / `StarFilled`, and stops click bubbling for its hover popover.
- `src/views/Equipments/Card/CardSensorItem.vue` restores the original sensor-card buttons/icons/counters/runtime block.
- `src/views/Equipments/Card/ItemCard.vue` passes `equipmentStatusClass` into `GridItemCardHeader`.
- Latest verification: `npm run build` passed; targeted `git diff --check` passed for touched files.

## Files Already Modified
- `SESSION_CONTEXT.md`
- `src/components/common/addToFavoriteButton.vue`
- `src/components/itemDetails/ItemPDMsStatisticBlock.vue`
- `src/views/Plants/Details/Counters.vue`
- `src/views/Plants/Details/DetailsPage.vue`
- `src/views/Plants/Details/EquipmentsList.vue` deleted
- `src/views/Equipments/EquipmentsLayout.vue`
- `src/views/Equipments/ItemsList.vue`
- `src/views/Equipments/Card/ItemCard.vue`
- `src/views/Equipments/Card/CardSensorItem.vue`
- `src/views/Equipments/Card/CardMultiViewItem.vue`
- `src/views/Equipments/Card/TypeOptionBlock.vue`
- `src/views/Equipments/ItemPage.vue`
- `src/views/Equipments/ItemFormWrapper.vue`
- `src/views/Equipments/ItemForm.vue`
- `src/views/Dashboard/Dashboard.vue`
- `src/views/Dashboard/MultiFormWrapper.vue`
- `src/views/Dashboard/MultiFormItemWrapper.vue`
- Related prior migration files may also be dirty; do not revert user changes.

## Unresolved Issues
- User still reports Plant Details counters showing zeros after the latest `prepareCountersData` fix; needs runtime confirmation with the real `/dashboard/counters` response shape.
- Equipments card edit event chain previously needed runtime confirmation.
- Full Equipments details stack is not migrated; details routes remain pending.
- Equipments form is still simplified; advanced RPM/vibration/subtype/sensor/multiview tabs remain pending.
- Browser automation is not installed. Do not start a dev server unless user explicitly asks.
- Worktree is dirty with unrelated existing changes; do not revert them.

## Next Actionable Step
- If counters still show zero, inspect the real `/dashboard/counters` response in browser/network or add a temporary local diagnostic only with user confirmation, then adjust `src/views/Plants/Details/Counters.vue` / `prepareCountersData` to match the actual payload.
