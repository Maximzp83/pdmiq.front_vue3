<template>
	<div class="navbar navBar-wrapper">
		<div class="mcontainer navBar-container">
			<div class="mrow flex wrap align-center buttonsBlock 1vertical-margin-0">
				<div class="menu-block burger-button-container md-hide">
					<button
						type="button"
						class="navbar-toggle"
						@click="callMethod('toggleSidebar')"
					>
						<i class="icomoon icon-lists" />
					</button>
				</div>

				<!-- <button
					type="button"
					class="navbar-toggle"
					@click="callMethod('testEvent', 'hello from navbar')"
				>
					<i class="icomoon icon-lists" />
				</button> -->

				<TransitionGroup name="standard-fade">
					<div
						class="menu-block title-block mcol-xs-8 mcol-sm-auto"
						v-if="navbarSettings.showStandardNavItem"
					>
						<div class="flex align-center section-row">
							<div class="ellipsis">
								<div class="navbar-title ellipsis" v-html="pageTitle"></div>

								<div
									class="prev-button link"
									@click="
										handleDisposableHistoryButton(
											navbarSettings.showStandardNavItem.backButton,
											navbarSettings.showStandardNavItem,
										)
									"
								>
									<i class="icomoon icon-path_2"></i>
									<span class="capitalize">{{ tt('back') }}</span>
								</div>
							</div>
						</div>
					</div>

					<div
						v-else-if="pageTitle"
						class="menu-block title-block mcol-xs-8 mcol-sm-auto"
					>
						<div class="mrow flex align-center section-row">
							<div class="mcol-xs-auto">
								<div class="navbar-title" v-html="pageTitle"></div>
								<div
									v-if="!navbarSettings.hideBackButton"
									class="prev-button link"
									@click="() => handleDisposableHistoryButton()"
								>
									<i class="icomoon icon-path_2"></i>
									<span>{{ tt('back') }}</span>
								</div>
							</div>
						</div>
					</div>

					<div
						class="flex align-center mcol-xs-8 mcol-sm-5 mcol-lg-auto fluid"
						v-if="navbarSettings.datepickerSettings"
					>
						<div
							class="bold div-block"
							v-if="navbarSettings.datepickerSettings.label"
							v-text="navbarSettings.datepickerSettings.label"
						></div>

						<Datepicker
							class="div-block no-min-width"
							setupDaterangeFilter
							enableShortcuts
							@input="handleDatepickerChange"
							:value="datepickerFilters.daterange"
							clearingTo="last_7_days"
							type="daterange"
							size="large"
						/>
					</div>

					<SearchBar
						v-if="navbarSettings.showSearchbar"
						class="menu-block search-block mcol-xs-12 mcol-sm-3"
						@submit="searchSubmit"
						:query="report_filters.q"
						clearable
					/>

					<div
						class="menu-block buttonWrapper flex compareList"
						v-if="
							navbarSettings.showCompareButton &&
							compareList.length &&
							compareList.length > 1
						"
					>
						<router-link
							to="/sensors/compare/statistics"
							class="el-button el-button--default inverted"
						>
							{{ tt('compare') }}
							<i class="suffix-icon icomoon icon-compare"></i>
						</router-link>

						<el-button
							@click="callMethod('set_compare_list', [])"
							class="el-button--secondary clear-compare-button"
							native-type="button"
							>{{ `${tt('clear')} ${tt('compare')}` }}</el-button
						>
					</div>

					<template v-if="!fromDashboard">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCreateButtonForTableForm"
						>
							<el-button
								@click="callMethod('createItem')"
								class="el-button--secondary shadow"
								native-type="button"
							>
								<i class="icomoon icon-plus"></i>
							</el-button>
						</div>

						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.navigateButton"
						>
							<el-button
								@click="changeRoute(navbarSettings.navigateButton)"
								class="el-button--secondary shadow save-button"
								native-type="button"
							>
								<i class="icomoon icon-path_2"></i>
							</el-button>
						</div>

						<div class="menu-block buttonWrapper" v-if="navbarSettings.editButton">
							<el-button
								@click="changeRoute(navbarSettings.editButton)"
								class="el-button--secondary shadow save-button"
								native-type="button"
							>
								<i class="icomoon icon-pencil"></i>
							</el-button>
						</div>

						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCleanButton"
						>
							<el-button
								@click="callMethod('cleanForm')"
								class="el-button--secondary shadow clean-button"
								native-type="button"
								plain
							>
								<i class="icomoon icon-clean"></i>
							</el-button>
						</div>
					</template>

					<div
						v-if="factUserRoleType.isIndustrialMatrix"
						class="menu-block role-select filter-block mcol-xs-6 mcol-sm-2 text-right ml-auto relative"
					>
						<!-- <SimpleSpinner :active="userRolesLoading" /> -->
						<el-select-v2
							filterable
							clearable
							:loading="userRolesLoading"
							v-show="globalFilters.plantId || authUser.temp_role_id"
							:disabled="!globalPlantsList.length"
							@change="setTempRole"
							:value="authUser.temp_role_id"
							:options="userRolesList"
							:placeholder="`${tt('select')} ${tt('role')}`"
							:props="{ value: 'id', label: 'name' }"
							popper-class="plant-select-dropdown"
						/>
					</div>

					<div
						class="menu-block plant-select filter-block mcol-xs-6 mcol-sm-3 text-right ml-auto relative"
						v-if="navbarSettings.showFilter"
					>
						<el-select-v2
							filterable
							clearable
							:class="
								globalPlantsList.length < 2 &&
								(isCustomer || navbarSettings.infoOnly)
									? 'isClient'
									: ''
							"
							@change="(id) => setGlobalFilters({ id: id, filterName: 'plantId' })"
							:modelValue="globalFilters.plantId"
							:options="globalPlantsList"
							:loading="globalPlantsLoading"
							:placeholder="`${tt('select')} ${tt('plant')}`"
							:props="{ value: 'id', label: 'name' }"
							popper-class="plant-select-dropdown"
						/>
					</div>

					<div
						class="menu-block plant-select filter-block mcol-xs-6 mcol-sm-3 text-right ml-auto relative"
						v-if="enableCompaniesFilter"
					>
						<el-select-v2
							filterable
							clearable
							:class="
								companiesList.length < 2 && (isCustomer || navbarSettings.infoOnly)
									? 'isClient'
									: ''
							"
							@change="(id) => setGlobalFilters({ id: id, filterName: 'companyId' })"
							:modelValue="globalFilters.companyId"
							:options="companiesList"
							:loading="companiesLoading"
							:placeholder="`${tt('select')} ${tt('company')}`"
							:props="{ value: 'id', label: 'name' }"
							popper-class="plant-select-dropdown"
						/>
					</div>

					<div
						class="menu-block plant-select filter-block mcol-xs-6 mcol-sm-auto text-right ml-auto"
						v-if="showPlant"
					>
						<div class="">{{ showPlant.name }}</div>
					</div>

					<div
						class="menu-block buttonWrapper ml-auto"
						v-if="navbarSettings.printButtonSettings"
					>
						<el-button
							@click="callMethod('printHTML', navbarSettings.printButtonSettings)"
							class="el-button--secondary"
							native-type="button"
						>
							<i
								:class="navbarSettings.printButtonSettings.icon || 'el-icon-printer'"
							></i>
						</el-button>
					</div>

					<div
						:class="[
							'menu-block creation-button-wrapper mcol-sm-auto',
							navbarSettings.datepickerSettings ? 'mcol-xs-1' : 'mcol-xs-2',
						]"
						v-if="creationMenuList.length"
					>
						<div class="ml-auto">
							<el-popover
								placement="bottom-end"
								popper-class="creation-menu-popover"
								trigger="manual"
								v-model:visible="showCreationMenu"
								:width="230"
							>
								<template #reference>
									<el-button
										@click="showCreationMenu = !showCreationMenu"
										class="el-button--secondary creation-menu-button"
										native-type="button"
									>
										<i class="icomoon icon-plus"></i>
									</el-button>
								</template>

								<ul class="creation-menu-list">
									<li
										v-for="item in creationMenuList"
										:key="`creation-item-${item.label}`"
										:class="{
											disabled:
												item.checkPlant && !globalFilters.plantId && !showPlant,
										}"
										@click="createItemByMenu(item)"
									>
										<i :class="item.icon"></i>
										<span class="label">{{ item.label }}</span>
									</li>
								</ul>
							</el-popover>
						</div>
					</div>
				</TransitionGroup>
			</div>
		</div>
	</div>
</template>

<script setup>
// import { MAINTENANCE_TYPES } from '@/constants/global';
import { hasAccessTo } from '@/utils/hasAccessTo';

import {
	onMounted,
	onBeforeUnmount,
	computed,
	defineAsyncComponent,
	ref,
	watch,
	watchEffect,
	inject,
	shallowReactive,
} from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
const { tt } = Lang;
import { USER_ROLES_TYPES } from '@/constants/global';

const Datepicker = defineAsyncComponent(
	() => import('@/components/common/Datepicker.vue'),
);
const SearchBar = defineAsyncComponent(
	() => import('@/components/common/SearchBar.vue'),
);

// ==========Store===========
// -----Auth------
import { useAuthStore } from '@/stores/AuthStore';
const { authUser } = storeToRefs(useAuthStore());

// -----Global------
import { useGlobalStore } from '@/stores/GlobalStore';
const globalStore = useGlobalStore();
const {
	navbarSettings,
	disposableHistoryButton,
	compareList,
	fromDashboard,
	globalPlantsList,
	globalFilters,
	globalPlantsLoading,
	globalCompaniesList: companiesList,
	globalCompaniesLoading: companiesLoading,
} = storeToRefs(globalStore);
// const { set_value: set_global_store } = globalStore;

const setGlobalFilters = ({ id, filterName }) => {
	const newFilters = { ...globalFilters.value, [filterName]: id };
	globalStore.set_global_filters(newFilters);
};

const pageTitle = computed(() => {
	if (navbarSettings.value) {
		return navbarSettings.value.pageTitle || '';
	}
	return '';
});

const enableCompaniesFilter = computed(
	() => navbarSettings.value?.enableCompaniesFilter,
);

const showPlant = computed(() => {
	if (navbarSettings.value && navbarSettings.value.showPlantName) {
		const { id, name } = navbarSettings.value.showPlantName;

		return Object.freeze({ id, name });
	}
	return null;
});
// -----Sensors------
import { useSensorsStore } from '@/stores/SensorsStore';
const sensorsStore = useSensorsStore();
const { set_value: set_sensors_store } = sensorsStore;
const { report_filters } = storeToRefs(sensorsStore);
// console.log('report_filters', report_filters);

// -----Composables-----
import { useNavigation } from '@/composables/mixins/useNavigation';
const { changeRoute } = useNavigation();
import { useHelpers } from '@/composables/mixins/useHelpers';
const { useLoadStore } = useHelpers();

// const emit = defineEmits(['event']);
import { useCallMethod } from '@/composables/mixins/useEmitter';
const dashboardLayoutMethods = inject('DashboardLayout.methods');
const { callMethod } = useCallMethod(dashboardLayoutMethods);

import { useFetchAction } from '@/composables/mixins/useFetchAction';
const { doFetchAction } = useFetchAction();

import { api_request } from '@/api/request_provider';

// =========================
defineOptions({
	name: 'TopNavbar',
});
// ===========================
const handleDisposableHistoryButton = (settings, additionalSettings) => {
	// console.log(settings)
	changeRoute(settings || { history: true, steps: -1 });
	if (additionalSettings && additionalSettings.callback) {
		additionalSettings.callback();
	}
};

const setFilters = ({ storeName, stateKey }, filters, settings = {}) => {
	const storePromise = useLoadStore(storeName);
	if (storePromise) {
		storePromise
			.then((store) => {
				if (store) {
					store.set_value(stateKey, filters, settings);
				}
			})
			.catch((err) => {
				console.error(
					`[setFilters] Ошибка при работе со store "${storeName}":`,
					err,
				);
			});
	}
};

const searchSubmit = (payload) => {
	// console.log('searchSubmit', sensorsStore.report_filters);
	set_sensors_store('report_filters', {
		...report_filters.value,
		q: payload.q,
	});
};

// ========== Datepicker ===========
const storeRef = ref(null);

watchEffect(async () => {
	const settings = navbarSettings.value?.datepickerSettings?.storeSettings;
	if (settings?.storeName && settings?.stateKey) {
		try {
			const store = await useLoadStore(settings.storeName);
			// console.log('watchEffect', settings.stateKey, storeRefs[settings.stateKey])
			storeRef.value = store;
		} catch (err) {
			console.error('[watchEffect] Ошибка загрузки store для datepicker:', err);
			storeRef.value = null;
		}
	} else {
		storeRef.value = null;
	}
});

const handleDatepickerChange = (range) => {
	// console.log('handleDatepickerChange', datepickerFilters.value.daterange)
	setFilters(
		navbarSettings.value.datepickerSettings.storeSettings,
		{
			...datepickerFilters.value,
			daterange: range,
			daterange_setted_at: Date.now(),
		},
		{
			toLocalStorage: { prop: 'plants_statistics_filters' },
		},
	);
};

const datepickerFilters = computed(() => {
	const settings = navbarSettings.value?.datepickerSettings?.storeSettings;
	if (!storeRef.value || !settings?.stateKey) return {};
	return storeRef.value[settings.stateKey];
});

// ========== UserRoles ==============
const userRolesLoading = ref(false);
const userRolesList = shallowReactive([]);

const fetchUserRoles = () => {
	doFetchAction('/roles', {
		toList: userRolesList,
		loadingRef: userRolesLoading,
		isShallowRef: true,
	});
};

const factUserRoleType = computed(() => {
	const user = authUser.value;
	let result = {};
	if (user.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX) {
		result.isIndustrialMatrix = true;
	} else if (user.type === USER_ROLES_TYPES.DEVELOPER) {
		result.isIndustrialMatrix = true;
		result.isDeveloper = true;
	} else if (user.type === USER_ROLES_TYPES.CUSTOMER) {
		result.isCustomer = true;
	}
	return Object.freeze(result);
});

const isCustomer = computed(() => factUserRoleType.value.isCustomer);
const isIndustrialMatrix = computed(() => factUserRoleType.value.isIndustrialMatrix);

const setTempRole = async (role_id) => {
	const authStore = useAuthStore();
	userRolesLoading.value = true;

	try {
		const method = role_id ? 'post' : 'delete';
		const payload = role_id
			? {
					data: {
						plant_id: globalFilters.value.plantId,
						role_id,
					},
				}
			: {};

		const response = await api_request[method]('/auth/temp-role', payload);

		if (response?.value?.user) {
			const user = response.value.user;

			// Если у temp_role нет permissions, находим их в userRolesList
			if (user.temp_role && !user.temp_role.permissions) {
				const roleInList = userRolesList.find((r) => r.id === user.temp_role_id);
				if (roleInList?.permissions) {
					const newUser = {
						...user,
						temp_role: {
							...user.temp_role,
							permissions: roleInList.permissions,
						},
					};
					authStore.set_auth_user(newUser);
				} else {
					authStore.set_auth_user(user);
				}
			} else {
				authStore.set_auth_user(user);
			}

			// Обновляем plantId filter если есть plant_id у пользователя
			if (user.plant_id) {
				globalStore.set_global_filters({
					...globalFilters.value,
					plantId: user.plant_id,
				});
			}

			fetchPlants();
		}
	} catch (error) {
		console.error('[setTempRole] Error:', error);
	} finally {
		userRolesLoading.value = false;
	}
};

// ===================
const showCreationMenu = ref(false);

const creationMenuModalSettings = computed(() =>
	Object.freeze({
		editModalProp: 'editModalClassic',
		modalClassName: 'fixed-header-footer small-header small-footer',
	}),
);

// ========== baseCreationMenuList ==============
const baseCreationMenuList = computed(() => {
	return Object.freeze([
		{
			label: tt('common.Production_line'),
			instance: 'ProductionLines',
			checkPlant: true,
			icon: 'icomoon icon-production_lines',
			permissions: ['create_dashboard'],
		},
		{
			label: tt('common.Utility'),
			instance: 'Utilities',
			checkPlant: true,
			componentPath: 'ProductionLines/ItemForm',
			icon: 'icomoon icon-production_lines',
			permissions: ['create_dashboard'],
		},
		{
			label: tt('common.Machine'),
			instance: 'Machines',
			checkPlant: true,
			icon: 'icomoon icon-machines',
			permissions: ['create_dashboard'],
		},
		{
			label: tt('common.Asset'),
			instance: 'Assets',
			checkPlant: true,
			icon: 'icomoon icon-assets',
			permissions: ['create_dashboard'],
		},
		{
			label: tt('common.Item'),
			componentPath: 'Equipments/ItemFormWrapper',
			checkPlant: true,
			icon: 'icomoon icon-equipments',
			permissions: ['create_dashboard'],
		},
	]);
});

const creationMenuList = computed(() => {
	return Object.freeze(
		baseCreationMenuList.value.filter((mi) =>
			hasAccessTo({ role: authUser.value?.role, permissionKeys: mi.permissions }),
		),
	);
});

const createItemByMenu = (item) => {
	const settings = {
		...creationMenuModalSettings.value,
		show: true,
		itemName: item.label,
		componentPath: item.componentPath,
		instanceName: item.instance,
		additionalModalSettings: item.additionalModalSettings,
	};
	globalStore.show_edit_modal(settings);
	showCreationMenu.value = false;
};

const globalClick = ({ target }) => {
	if (
		!target.closest('creation-menu-list') &&
		!target.closest('.creation-menu-button')
	) {
		showCreationMenu.value = false;
	}
};

const fetchPlants = () => {
	return globalStore.fetch_global_plants({
		params: {
			max: -1,
			orderByColumn: 'name',
			orderByMethod: 'asc',
		},
	});
};

const fetchCompanies = () => {
	return globalStore.fetch_global_companies({
		params: {
			max: -1,
			orderByColumn: 'name',
			orderByMethod: 'asc',
		},
	});
};

// ========== Watchers ==============
const route = useRoute();

watch(
	() => route.path,
	() => {
		if (disposableHistoryButton.value) {
			globalStore.set_global_state({
				stateProp: 'disposableHistoryButton',
				value: false,
			});
		}
	},
);

watch(showCreationMenu, (show) => {
	if (show) {
		document.addEventListener('click', globalClick);
	} else {
		document.removeEventListener('click', globalClick);
	}
});

watch(
	() => enableCompaniesFilter.value,
	(enable) => {
		if (enable && !companiesList.value.length) {
			fetchCompanies();
		}
	},
	{ immediate: true },
);

// ========== Hooks ==============
onMounted(() => {
	// Fetch user roles if Industrial Matrix user
	if (isIndustrialMatrix.value) {
		fetchUserRoles();
	}

	// Fetch plants
	fetchPlants();

	// Set globalFilters from authUser if customer
	if (authUser.value && authUser.value.plant_id && isCustomer.value) {
		setGlobalFilters({
			id: authUser.value.plant_id,
			filterName: 'plantId',
		});
	}

	if (authUser.value && authUser.value.company_id && isCustomer.value) {
		setGlobalFilters({
			id: authUser.value.company_id,
			filterName: 'companyId',
		});
	}
});

onBeforeUnmount(() => {
	globalStore.set_global_filters({ plantId: null, companyId: null });
});
</script>
