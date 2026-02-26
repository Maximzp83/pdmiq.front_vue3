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
- [x] Chunk C-001: migrated Plants sub-item components from `subItemMixin` to `useSubItem`
  - `src/views/Plants/LocationItem.vue`
  - `src/views/Plants/WorkStationItem.vue`
  - `src/views/Plants/ProcessItem.vue`
  - Notes:
    - Converted to `<script setup>` + Composition API
    - Preserved `itemData` / `itemIndex` / `required` props and `onRemove` emit contract
    - ESLint check passed for all 3 files
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

## Phase 5 — Views
- [ ] Views migrated and wired

## Phase 6 — Cleanup & Validation
- [ ] Dead code removed
- [ ] Lint & format
- [ ] Build succeeds
