# Migration Progress

## Phase 1 — API Migration ✅ COMPLETE

- [x] Identify legacy API files
  - **Legacy location:** `vue2_project/src/services/api/`
  - **Files:** `index.js`, `axiosService.js`, `api_helpers.js`

- [x] Enhanced `src/api/index.js` with legacy compatibility
  - Added `prepareParams()` - filters null/undefined from query params
  - Added `setupMultipartFormData()` - handles file uploads
  - Added `withFile` flag support for multipart/form-data
  - Added Laravel-style PUT → POST override for file uploads
  - Added support for: `headers`, `baseURL`, `responseType`

- [x] Verified `src/api/request_provider.js` compatibility
  - `api_request(url, payload)` is the **main interface** for all API calls
  - Automatically uses enhanced `api` internally
  - Provides: loading states, notifications, store integration, error handling
  - **Migration rule:** All components/stores should use `api_request`, not raw `api`

- [x] Migrated legacy API helper functions
  - **Core helpers:** Already in `src/api/index.js` and `src/api/request_provider.js`
    - `prepareParams`, `setupMultipartFormData` (index.js)
    - `isSuccessStatus`, `getResponseValue`, `getResponseMessage`, `getResultMessage`, `handleError` (request_provider.js)
  - **URL utilities:** Migrated to `src/utils/url-helpers.js`
    - `getParamsFromUrl`, `getValuesFromRouteQuery`, `setupGetParamsStr`, `generateUrl`, `encodeUrl`
  - **Domain-specific data preparers:** Migrated to `src/utils/data-preparers.js`
    - `prepareWarningsData`, `prepareTresholdsOurData`, `prepareGlobalPlantsData`
    - `ultrasoundSensorsOnly`, `prepareCountersData`, `prepareEquipmentsList`
    - Added string-based lookup support in `request_provider.js` for backwards compatibility

- [x] Audited API usage in codebase
  - ✅ No active imports of legacy API helpers (all commented out)
  - ✅ `api_request` is the standard for all new API calls
  - ⚠️ Some components still use Vuex `mapActions` - will be resolved in Phase 2 (store migration)

## Phase 2 — Store Migration ✅ COMPLETE

### Completed Stores

- [x] **UsersStore** - First Pinia store migration
  - **File:** `src/stores/UsersStore.js`
  - **Composable:** `src/composables/useUsers.js`
  - **Pattern established:**
    - ✅ Store contains ONLY state (no API calls)
    - ✅ Uses `commonStoreMixin` for consistency
    - ✅ API operations moved to composable
    - ✅ Composable uses `api_request` from `@/api/request_provider`
    - ✅ Store integration via `storeName`, `stateProp`, `loadingProp`

- [x] **CompaniesStore**
  - **File:** `src/stores/CompaniesStore.js`
  - **Composable:** `src/composables/useCompanies.js`
  - **Special methods:** `generateIdpHost()` for SAML2 authentication

**Batch Migration (8 stores):**
- [x] **ApplicationsStore** + useApplications
- [x] **BrandsStore** + useBrands
- [x] **BrandModelsStore** + useBrandModels
- [x] **EquipmentTypesStore** + useEquipmentTypes
- [x] **ProductionLinesStore** + useProductionLines
- [x] **AssetsStore** + useAssets
- [x] **TeamsStore** + useTeams
- [x] **WorkOrdersStore** + useWorkOrders

### Migration Pattern (Vuex → Pinia)

**Before (Vuex):**
```js
// In store/modules/users.js
actions: {
  fetch_users(storeArgs, payload) {
    return fetch_items(storeArgs, '/users', payload);
  }
}

// In component
this.$store.dispatch('users/fetch_users', { params: { page: 1 } });
```

**After (Pinia):**
```js
// In stores/UsersStore.js - STATE ONLY
state: () => ({ itemsList: [], isLoading: false })

// In composables/useUsers.js - API CALLS
const fetchUsers = (params) => {
  return api_request.get('/users', {
    params,
    storeName: 'usersStore',
    stateProp: 'itemsList',
    loadingProp: 'isLoading'
  });
};

// In component
const { fetchUsers, usersStore } = useUsers();
await fetchUsers({ page: 1 });
```

### Remaining Vuex Modules to Migrate

**Complex stores (all migrated ✅):**
- [x] **ControllersStore** + useControllers ✅
  - **File:** `src/stores/ControllersStore.js`
  - **Composable:** `src/composables/useControllers.js`
  - **Methods:** 11 API methods (CRUD, DXM commands, FFT, export, register)
- [x] **DashboardStore** + useDashboard ✅
  - **File:** `src/stores/DashboardStore.js`
  - **Composable:** `src/composables/useDashboard.js`
  - **Methods:** 2 API methods (counters, PDM statistics)
- [x] **TestingStore** + useTesting ✅
  - **File:** `src/stores/TestingStore.js`
  - **Composable:** `src/composables/useTesting.js`
  - **Methods:** 15 API methods (notifications, imports, logs)
- [x] **MaintenanceStore** + useMaintenance ✅
  - **File:** `src/stores/MaintenanceStore.js`
  - **Composable:** `src/composables/useMaintenance.js`
  - **Methods:** 19 API methods (work orders, maintenance logs, imports)
- [x] **EquipmentsStore** + useEquipments ✅
  - **File:** `src/stores/EquipmentsStore.js`
  - **Composable:** `src/composables/useEquipments.js`
  - **Methods:** 28 API methods (equipments CRUD, faults, vibration analysis, metrics, operations)

**Already exist in Vue3 (verified ✅):**
- [x] **AuthStore** - Properly migrated, state-only store
  - **File:** `src/stores/AuthStore.js`
  - **Composable:** `src/composables/useAuth.js` (newly created)
  - **Methods:** 13 API methods (signIn, getAuthUser, signOut, logout, forgotPassword, passwordReset, checkPasswordToken, sendMfaCode, checkMfaCode, fetchQrCode, checkQrCode, setTempRole, clearFilters)
  - **State:** isAuthenticated, access_token, authUser, motorIQLink, redirectTo, preventRequests, role flags (isIndustrialMatrix, isCustomer, isDeveloper)
  - **Getters:** hasAccessMap, hasAccessTo (permission checking)
- [x] **GlobalStore** - Properly migrated, state-only store
  - **Composable:** `src/composables/useGlobal.js` (newly created)
  - **Methods:** `fetchGlobalPlants()`, `fetchGlobalCompanies()`, `saveVisitAnalytics()`
- [x] **PlantsStore** - Properly migrated, state-only store
- [x] **MachinesStore** - Properly migrated, state-only store
- [x] **SensorsStore** - Properly migrated, state-only store

**Batch 2 (8 stores):**
- [x] **BearingsStore** + useBearings
- [x] **PartsStore** + useParts
- [x] **LubricatorsStore** + useLubricators
- [x] **DistributorsStore** + useDistributors
- [x] **SolenoidsStore** + useSolenoids
- [x] **UltrasoundPumpsStore** + useUltrasoundPumps
- [x] **UltrasoundRadiosStore** + useUltrasoundRadios
- [x] **IndustrialServicesStore** + useIndustrialServices

**Batch 3 (15 stores) - Final Simple CRUD:**
- [x] **LubeTypesStore** + useLubeTypes
- [x] **PlantRequisitionsStore** + usePlantRequisitions
- [x] **PlantWorkStationsStore** + usePlantWorkStations
- [x] **TaskProceduresStore** + useTaskProcedures
- [x] **MeetingTrackersStore** + useMeetingTrackers
- [x] **RoiOnePagersStore** + useRoiOnePagers
- [x] **LibraryStore** + useLibrary
- [x] **UserRolesStore** + useUserRoles
- [x] **BannerV2SubtypesStore** + useBannerV2Subtypes
- [x] **EquipmentTypesCategoriesStore** + useEquipmentTypesCategories
- [x] **PlantsVendorsStore** + usePlantsVendors
- [x] **RfqsStore** + useRfqs
- [x] **ProcessesStore** + useProcesses
- [x] **MaintenanceCategoriesStore** + useMaintenanceCategories
- [x] **StoreRoomsStore** + useStoreRooms

**Total Progress:** 44/44 stores migrated (100%) 🎉**
- 33 batch stores ✅
- 5 verified existing stores ✅
- 5 complex stores migrated ✅
- **Phase 2 COMPLETE!**

## Phase 3 — Composables
- [ ] Migrate mixins → composables
- [x] `useItemsData` updated for list-action callbacks + promise-style async flow
  - Added callback hooks for `createItem`, `editItem`, `handleDeleteItems`
  - Exposed list-action methods from composable for view-level wiring
  - Normalized fetch flow to `.then/.catch/.finally`
- [x] `useItemsData` extended with built-in route/delete list actions
  - Supports `createItemRoute`, `editItemRoute`, and `deleteItemRoute`
  - Added shared `deleteItem()` and wired `handleDeleteItems()` through it
  - `src/views/Plants/ItemsList.vue` now consumes composable-provided create/edit/delete actions
- [x] `useItemsData` aligned to `itemRoute` + `apiRoute` convention
  - `createItem()` and `editItem()` now build routes from top-level `itemRoute`
  - `deleteItem()` now uses top-level `apiRoute`, same as `fetchItems()`
  - Removed `resolveRoutePath` helper
- [x] `useItemsData` delete flow aligned with legacy `itemsDataMixin`
  - `handleDeleteItems()` now collects `ids` from row payload or table selection
  - `deleteItem()` now works through `ids` payload instead of single-row route delete
  - `src/views/Plants/ItemsList.vue` passes table ref into composable for bulk-delete support
- [x] `createItem` / `ItemPage` create-mode flow aligned with legacy `/new` pattern
  - `useItemsData.createItem()` opens `${itemRoute}/new`
  - `src/views/Plants/ItemPage.vue` now treats `route.params.id === 'new'` as create mode
  - Create mode opens empty form with `itemData = null` and skips item fetch
- [x] `useItemsData` filters watcher restored after store `set_value` migration
  - Root cause: `ref(itemStore.filters)` captured the old filters object and stopped tracking replacements
  - Fixed by binding `filtersRef` to `storeToRefs(itemStore).filters`
  - Kept backward compatibility for views that still pass plain `filters`
- [x] `Applications` aligned to `Plants` list/page pattern
  - `ItemsList` now uses store-driven `useItemsData` actions for create/edit/delete
  - `ItemPage` now uses `/new` create-mode convention via `route.params.id`
  - Async page flow normalized to promise-style
- [x] Router aligned to `/new` create-mode convention for migrated entities
  - Added explicit `/new` create routes for `Plants`, `Applications`, and `Processes`
  - Prevents `/new` from falling into `:id` edit routes with incorrect permissions
- [x] `Processes` aligned to `Plants` list/page pattern
  - `ItemsList` now uses store-driven `useItemsData` actions for create/edit/delete
  - `ItemPage` now uses `/new` create-mode convention via `route.params.id`
  - `ItemsGridContainer` now exposes `selectedIds` for composable-driven bulk delete
- [x] `src/views/Plants/ItemPage.vue` switched to `useItemPage`
  - Submit/close orchestration now uses shared page composable
  - Entity-specific save flow remains local through `saveItem`
- [x] `useInitPageData` merged into `useItemPage`
  - `useItemPage` now covers item-page init/load/navbar lifecycle plus submit flow
  - Removed standalone `useInitPageData.js`
  - Simplified `src/views/Plants/ItemPage.vue` to use the merged composable API
- [x] `useItemPage` now owns generic fetch/save item requests
  - Added `apiRoute`/`itemRoute` driven default `fetchItem` and `saveItem` behavior
  - `src/views/Plants/ItemPage.vue` no longer defines local request wrappers
  - Entity-specific post-save sync remains injectable through `successSubmitCallback`
- [x] `Applications` and `Machines` item pages switched to shared `useItemPage`
  - Removed local request orchestration from `Applications/ItemPage`
  - Replaced legacy `Machines/ItemPage` mixin shell with `script setup` + `useItemPage`
  - Preserved machine upload settings via composable config
- [x] `src/views/Processes/ItemPage.vue` switched to shared `useItemPage`
  - Removed local fetch/save orchestration from process item page
  - Reused `apiRoute`/`itemRoute` driven item-page behavior
- [x] useActionButtons (from actionButtonsMixin)
- [x] useEventEmitter/useEventHandler (normalized event payloads)
- [x] useCreateFormItem (from createFormItemMixin)
- [x] useDashboardListsReorder (from dashboardListsReorderMixin)
- [x] useDragNdropDroppable (from dragNdropDroppableMixin)
- [x] useDragNdropSortable (from dragNdropSortableMixin)
- [x] eventHandler (covered by useEventHandler with onward re-emit)
- [x] useExportListToFile (from exportListToFileMixin)
- [x] fetchItemsHelper (covered by useFetchAction)
- [x] useFormOperationsInItemsList (from formOperationsInItemsListMixin)
- [x] itemsDataMixin (core covered by useItemsData; UI helpers migrate with components)
- [x] useItemForm (from itemFormMixin)
- [x] useItemPage (from itemPageMixin)
- [x] useLoadMore (from loadMoreMixin)
- [x] useMainInstanceDetailsPage (from mainInstanceDetailsPage)
- [x] useMultiform (from multiformMixin)
- [x] navigation (covered by useNavigation)
- [x] useSelectFile (from onSelectFileMixin)
- [x] useRequestsList (from requestsListMixin)
  - NOTE: `bindTo` config now uses `getValue()`/`alternateGetValue()` functions (no string paths)
- [x] useSensorType (from sensorTypeMixin)
- [x] useSubItem (from subItemMixin)
- [x] useSubItemsList (from subItemsListMixin)
- [x] useSwitchGridView (from switchGridViewMixin)
- [x] useTabs (from tabsMixin)
- [x] useWebSocket (from webSocketMixin)
- [x] useImport (from importMixin)
- [x] useInitPageData (from initPageDataMixin)
- [x] useItemCard (from itemCardMixin)
- [x] hasAccessToMixin (covered by AuthStore getters)
- [ ] Skipped mixins (not needed / empty)
  - pusherMixin (not needed)
  - handleSaveFormBlock (not needed)
  - sensorChartMixin (empty file)

## Phase 4 — Components
- [ ] Vue2 → Vue3 syntax
- [ ] Element UI → Element Plus
- [x] Single-file: added base chart component `src/components/charts/ChartWrapper.vue`
  - Created Vue3 wrapper for global `highcharts-vue` usage
  - ESLint check passed
- [x] Single-file: migrated `src/views/MaintenanceCategories/ItemsList.vue`
  - Replaced Vuex/mixins list page with `Pinia` + `useItemsData` + `useEventHandler`
  - Preserved permissions, filterbar, table operations, pagination, and delete flow
  - ESLint check passed
- [x] Chunk C-001: migrated Plants sub-item components from `subItemMixin` to `useSubItem`
  - `src/views/Plants/LocationItem.vue`
  - `src/views/Plants/WorkStationItem.vue`
  - `src/views/Plants/ProcessItem.vue`
  - Notes:
    - Converted to `<script setup>` + Composition API
    - Preserved `itemData` / `itemIndex` / `required` props and `onRemove` emit contract
    - ESLint check passed for all 3 files
- [x] File-by-file: migrated `src/components/itemDetails/ItemInfoBlock.vue`
  - Added missing Vue3 component in `src/components`
  - Preserved legacy props/markup and counters mapping logic
  - ESLint check passed
- [x] File-by-file: migrated `src/components/itemDetails/ItemImagesBlock.vue`
  - Added missing Vue3 component in `src/components`
  - Preserved legacy image sources merge/filter behavior
  - ESLint check passed
- [x] File-by-file: migrated `src/components/itemDetails/ItemPDMsStatisticBlock.vue`
  - Added missing Vue3 component in `src/components`
  - Migrated legacy event handling to `useEventHandler` with `@event="handleEvent"`
  - ESLint check passed
- [x] Batch table migration: completed remaining table components
  - Added `src/components/table/TableHeader.vue`
  - Added `src/components/table/Row.vue`
  - Added `src/components/table/TableCell.vue`
  - Added `src/components/table/TableHeaderCell.vue`
  - Synced event handler naming to `handleEvent` in table components
  - ESLint check passed for `src/components/table/*.vue`
- [x] Chunk C-002: added Plants list view in Vue3
  - `src/views/Plants/ItemsList.vue`
  - Notes:
    - Added route-ready `PlantsList` component using `useItemsData('/plants')` + `PlantsStore` filters
    - ESLint check passed
- [x] Chunk C-003: migrated missing base components from `vue2_project/src/components`
  - `src/components/common/PageMockImg.vue`
  - `src/components/common/PaginationContainer.vue`
  - `src/components/itemDetails/InfoItem.vue`
  - Notes:
    - Migrated to Vue3 (`<script setup>`) with preserved props/events API
    - `PaginationContainer` keeps legacy `setFilters` emit signature for compatibility
    - ESLint check passed for all 3 files
- [x] Chunk C-004: sync audit of already migrated components against updated `vue2_project/src/components`
  - Updated:
    - `src/components/common/SearchBar.vue` (restored `options.prepend` support)
    - `src/components/form/CustomSelect.vue` (restored legacy label/filtering logic with Vue3 emits)
    - `src/components/form/CustomInput.vue` (fixed exposed focus ref usage)
    - `src/components/common/Datepicker.vue` (fixed date-range compare value path)
  - Notes:
    - Checked all mapped migrated components under `src/components/**`
- [x] Sync update from latest `vue2_project` changes for already migrated files
  - Updated:
    - `src/components/table/CustomDataListTable.vue`
    - `src/components/table/Row.vue`
    - `src/components/table/TableHeader.vue`
    - `src/views/Machines/ItemForm.vue`
  - Notes:
    - Restored row-select restrictions and disabled `check all` when no selectable rows are available
    - Added `silence_mode_until` UI + submit normalization for Machines form
    - Skipped Vue2 changes for files that are not yet migrated in Vue3
- [x] Entity migration: `Applications` from `vue2_project/src/views` to `src/views`
  - Added:
    - `src/views/Applications/ItemsList.vue`
    - `src/views/Applications/ItemForm.vue`
    - `src/views/Applications/ItemPage.vue`
  - Updated:
    - `src/router/index.js`
  - Notes:
    - Migrated as one coupled step using `src/views/Plants` as the reference pattern
    - Preserved page flow and modal form support for creation from Machines
    - ESLint check passed
- [x] Entity migration: `Processes` from `vue2_project/src/views` to `src/views`
  - Added:
    - `src/views/Processes/ItemsList.vue`
    - `src/views/Processes/ItemForm.vue`
    - `src/views/Processes/ItemPage.vue`
    - `src/views/Processes/ItemCard.vue`
    - `src/views/Processes/BreakTimeItem.vue`
    - `src/views/Processes/WorkDateItem.vue`
    - `src/views/Processes/FaultItem.vue`
  - Notes:
    - Migrated as one coupled step using `src/views/Plants` as the reference pattern
    - Preserved grid list, websocket live updates, delete flow, and sub-item form blocks
    - `Details` action currently routes to `/processes/:id` because legacy `/processes/:id/details` is not migrated yet
    - ESLint check passed
    - Applied only functional sync updates where logic drift was detected
    - ESLint check passed for updated files
- [x] Chunk C-005: router unblock for missing Plants view targets
  - Added temporary stubs:
    - `src/views/Plants/Details/DetailsPage.vue`
    - `src/views/Plants/ItemPage.vue`
  - Notes:
    - Unblocks Vite import resolution for router paths referencing Plants views
    - Intended as temporary placeholders until full migration of Plants views
    - ESLint check passed
- [x] Chunk C-006: migrated core filter UI components from `vue2_project/src/components`
  - `src/components/common/Filterbar.vue`
  - `src/components/common/DropdownFilterbar.vue`
  - `src/components/form/RadioButtonsBlock.vue`
  - Notes:
    - Migrated to Vue3 (`<script setup>`) while preserving legacy event API (`event`, `input`, `onChange`)
    - Kept compatibility with existing consumers in `src/views/Machines/*`
    - ESLint check passed for all 3 files
- [x] File-by-file migration: `GridItemCardHeader.vue`
  - Added `src/components/gridTable/GridItemCardHeader.vue`
  - Notes:
    - Migrated from `vue2_project/src/components/gridTable/GridItemCardHeader.vue` to Vue3 `<script setup>`
    - Preserved selection/title-click events and title rendering logic
    - ESLint check passed
- [x] File-by-file migration: `CustomDataListTable.vue`
  - Added `src/components/table/CustomDataListTable.vue`
  - Notes:
    - Migrated from `vue2_project/src/components/table/CustomDataListTable.vue` to Vue3 `<script setup>`
    - Preserved table selection/operations-width logic and event forwarding contract
    - ESLint check passed
- [x] File-by-file migration: `ItemsGridContainer.vue`
  - Added `src/components/gridTable/ItemsGridContainer.vue`
  - Notes:
    - Migrated from `vue2_project/src/components/gridTable/ItemsGridContainer.vue` to Vue3 `<script setup>`
    - Preserved dynamic item-card loading and selection event behavior
    - ESLint check passed
- [x] File-by-file migration: `CounterItem.vue`
  - Added `src/components/itemDetails/CounterItem.vue`
  - Notes:
    - Migrated from `vue2_project/src/components/itemDetails/CounterItem.vue` to Vue3 `<script setup>`
    - Preserved counter click-to-scroll behavior via `scrollToElement`
    - ESLint check passed
- [x] File-by-file migration: `FileUploadBlockItem.vue`
  - Added `src/components/form/uploadBlock/FileUploadBlockItem.vue`
  - Notes:
    - Migrated from `vue2_project/src/components/form/uploadBlock/FileUploadBlockItem.vue`
    - Replaced legacy `subItemMixin` with `useSubItem` and preserved exposed API (`getFormData`, `itemId`)
    - ESLint check passed
- [x] File-by-file migration: `FileUploadBlock.vue`
  - Added `src/components/form/uploadBlock/FileUploadBlock.vue`
  - Notes:
    - Migrated from `vue2_project/src/components/form/uploadBlock/FileUploadBlock.vue`
    - Replaced legacy mixins with composables (`useCreateFormItem`, `useDragNdropSortable`, `useEventHandler`)
    - Preserved parent API via ref (`getFormData`, `resetFilesList`) and events (`onSelectFile`, `onImgClick`)
    - ESLint check passed

## Phase 5 — Views
- [ ] Views migrated and wired

## Phase 6 — Cleanup & Validation
- [ ] Dead code removed
- [ ] Lint & format
- [ ] Build succeeds
- [x] Dependency migration for table components
  - Added `src/components/common/DynamicComponentWrapper.vue`
  - Updated event forwarding to `@event="handleEvent"`
  - ESLint check passed for wrapper and table components
- [x] Batch common migration: completed all remaining files from `vue2_project/src/components/common`
  - Added `src/components/common/ButtonWithPopover.vue`
  - Added `src/components/common/ButtonsNavbar.vue`
  - Added `src/components/common/CustomPopover.vue`
  - Added `src/components/common/CustomProgressbar.vue`
  - Added `src/components/common/CustomTransition.vue`
  - Added `src/components/common/ItemDetailsPreview.vue`
  - Added `src/components/common/NavigationButtons.vue`
  - Added `src/components/common/addToFavoriteButton.vue`
  - ESLint check passed for migrated common components
- [x] Batch form migration: completed remaining required files from `vue2_project/src/components/form`
  - Added `src/components/form/FetchByQuerySelect.vue`
  - Added `src/components/form/FormOperationsButtons.vue`
  - Added `src/components/form/InputItemBlock.vue`
  - Added `src/components/form/PhoneInput.vue`
  - Added phone flags assets: `src/assets/img/flags/{CA,US,MX}.png`
  - ESLint check passed for migrated form components
- [x] Batch pages migration: completed remaining files from `vue2_project/src/components/pages`
  - Added `src/components/pages/NotFoundPage.vue`
  - Added `src/components/pages/RemoteLogin.vue`
  - Added image asset `src/assets/img/404.png` (from legacy static images)
  - ESLint check passed for migrated pages components
- [x] Grid table migration: added remaining component `src/components/gridTable/CardDroppedSection.vue`
  - Replaced legacy navigation mixin with `useNavigation` composable
  - ESLint check passed
- [x] Item details migration: completed remaining components
  - Added `src/components/itemDetails/CreateWOButton.vue`
  - Added `src/components/itemDetails/ItemWOStatisticBlock.vue`
  - Added `src/components/itemDetails/MaintenanceListWrapper.vue`
  - ESLint check passed for migrated itemDetails components
- [x] Top navbar finish: completed migration cleanup for `src/components/layout/TopNavbar.vue`
  - Removed debug-only logs/watchers and unused props scaffold
  - Fixed temp-role plant filter update in global filters
  - ESLint check passed
- [x] Plants views migration: restored missing files and replaced temporary item page
  - Added `src/views/Plants/Details/CounterItem.vue`
  - Added `src/views/Plants/Details/Counters.vue`
  - Added `src/views/Plants/ItemForm.vue`
  - Replaced stub `src/views/Plants/ItemPage.vue` with API-backed create/edit page
  - ESLint check passed for changed Plants files
- [x] Plants list migration: completed `src/views/Plants/ItemsList.vue`
  - Replaced temporary list with full Filterbar + table + pagination flow
  - Added table operations handling (details/edit/delete) via event map
  - ESLint check passed
- [x] Pagination modernization: updated `src/components/common/PaginationContainer.vue` for Element Plus
  - Replaced deprecated pagination event usage with `v-model:current-page`
  - Fixed page-change emit payload to preserve selected page (`preventResetPage`)
  - ESLint check passed
