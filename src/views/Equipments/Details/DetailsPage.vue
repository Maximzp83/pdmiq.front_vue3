<template>
	<div class="details-page fix-height main-instance-item equipment-details">
		<VueElementLoadingWrapper
			:isLoading="itemLoading || equipmentsLoading"
			:itemsName="itemsName.one"
		/>

		<div v-if="loadContent" class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="content-row card">
					<div class="card-content navbar-card">
						<div class="flex mrow wrap capitalize navbar-container">
							<ButtonsNavbar
								inline
								bold
								:itemsList="navbarList"
								:class="[
									'mcol-xs-auto',
									{ 'mr-auto': !canEditDashboard },
								]"
							/>

							<div>
								<el-button
									v-if="canEditDashboard"
									type="primary"
									native-type="button"
									class="inverted"
									@click="editEquipment"
								>
									<span class="bold capitalize">{{ tt('Edit') }}</span>
								</el-button>
							</div>

							<div v-if="canEditDashboard" class="mr-auto">
								<el-button
									type="primary"
									native-type="button"
									class="inverted"
									@click="moveEquipment"
								>
									<span class="bold">{{ tt('Move') }}</span>
								</el-button>
							</div>

							<div v-if="dashboardSensors.length || multiViewsList.length" class="pdm-buttons-block">
								<PdmButton
									v-for="item in multiViewsList"
									:key="`mv-${item.id}`"
									:itemData="item"
									:routeParamsId="routeParamsId"
									buttonTextKey="name"
									isMultiView
									@forceRerender="forceRerender"
								/>

								<PdmButton
									v-if="manualRouteSensors.length"
									:itemData="manualRouteSensors[0]"
									:routeParamsId="routeParamsId"
									isManualRoute
									@forceRerender="forceRerender"
								/>

								<PdmButton
									v-for="sensor in standardDashboardSensors"
									:key="`pdm-${sensor.id}`"
									:itemData="sensor"
									:routeParamsId="routeParamsId"
									isSensor
									@forceRerender="forceRerender"
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="equipment-types-row content-row">
					<div class="section-row radio-container">
						<div class="flex">
							<TabsBar
								v-if="activeTab?.prop"
								class="mcol-xs-12"
								notRound
								withScroll
								:activeTab="activeTab"
								:tabsList="tabsList"
								:height="40"
								buttonsType=""
								buttonsClass="secondary"
								:initialAutoSelect="activeTabIdx"
								className="like-in-browser-tabs"
								@switchTab="switchTab"
							/>

							<div v-if="enableShareLinkButton" class="ml-auto">
								<el-button
									class="share-button mini"
									type=""
									native-type="button"
									@click="handleShareLinkClick"
								>
									<span class="span-block">{{ tt('Share') }}</span>
									<el-icon class="span-block el-icon-share">
										<Share />
									</el-icon>
								</el-button>
							</div>
						</div>
					</div>
				</div>

				<div v-if="activeTab?.equipmentData" class="nested-view-content-wrapper">
					<RouterView
						:key="detailsComponentKey"
						:equipmentData="activeTab.equipmentData"
						:crossoverList="crossoverList"
						:crossoverLoading="analoguesLoading || subTypeAnaloguesLoading"
						:multiViewsList="multiViewsList"
						@event="handleEvent"
					/>
				</div>

				<div v-else class="text-center">
					{{ tt('phrases.this_asset_has_not_equipments') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Share } from '@element-plus/icons-vue';

import { api_request } from '@/api/request_provider';
import { copyToClipboard } from '@/helpers/specialHelpers';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { DATASET } from '@/constants/global';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ButtonsNavbar from '@/components/common/ButtonsNavbar.vue';
import TabsBar from '@/components/common/TabsBar.vue';
import PdmButton from './PdmButton.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'EquipmentDetailsPage' });
const emit = defineEmits(['event']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const equipmentsStore = useEquipmentsStore();
const globalStore = useGlobalStore();
const { statistics_filters: statisticsFilters } = storeToRefs(equipmentsStore);
const { changeRoute } = useNavigation();

const itemData = ref({});
const itemLoading = ref(false);
const loadContent = ref(false);
const detailsComponentKey = ref(1);
const prevRouteName = ref(route.name);
const analoguesIsFetched = ref(false);
const activeTabIdx = ref(0);
const activeTab = ref({});
const equipmentsList = ref([]);
const equipmentsLoading = ref(false);
const analoguesList = ref({});
const analoguesLoading = ref(false);
const subTypeAnaloguesList = ref({});
const subTypeAnaloguesLoading = ref(false);
const multiViewsList = ref([]);
const multiViewsLoading = ref(false);

const itemsName = computed(() => Object.freeze({ one: tt('Item'), mult: tt('Items') }));
const routeParamsId = computed(() => +route.params.id);
const canEditDashboard = computed(() => authStore.hasAccessTo(['edit_dashboard']));
const enableShareLinkButton = computed(() => !!(
	route.params?.sensorId ||
	route.params?.multiViewId ||
	route.name === 'DetailsManualRouteStatPage'
));
const navbarList = computed(() =>
	Object.freeze(
		translate([
			{ path: `/equipments/${routeParamsId.value}/details/main`, label: 'View' },
			{ path: `/equipments/${routeParamsId.value}/details/quote`, label: 'Quote' },
			{ path: `/equipments/${routeParamsId.value}/details/service`, label: 'Service' },
		]),
	),
);
const tabsList = computed(() =>
	Object.freeze(
		equipmentsList.value.map((equipment) => ({
			id: equipment.id,
			title: `${equipment.equipment_type_name || ''} ${equipment.loc_on_machine || ''}`,
			prop: `${equipment.equipment_type_name || 'equipment'}Tab-${equipment.id}`,
			equipmentData: equipment,
			prefix_img: equipment.brand_model_img,
		})),
	),
);
const navbarSettings = computed(() => {
	const settings = {
		showStandardNavItem: true,
		showFilter: false,
		pageTitle: `${tt('Item')} ${tt('Details')}`,
	};

	if (activeTab.value?.equipmentData) {
		settings.showPlantName = {
			id: activeTab.value.equipmentData.plant_id,
			name: activeTab.value.equipmentData.plant_name,
		};
	}

	return Object.freeze(settings);
});
const crossoverList = computed(() => {
	const result = {};
	const equipmentData = activeTab.value?.equipmentData;
	if (!equipmentData) return Object.freeze(result);

	if (Object.keys(analoguesList.value || {}).length > 1) {
		result.mainType = setupCrossoverList(equipmentData.equipment_type_name, analoguesList.value);
	}
	if (
		equipmentData.equipmentSubType &&
		Object.keys(subTypeAnaloguesList.value || {}).length > 1
	) {
		result.subType = setupCrossoverList(
			equipmentData.equipmentSubType.name,
			subTypeAnaloguesList.value,
		);
	}

	return Object.freeze(result);
});
const dashboardSensors = computed(() =>
	Object.freeze([...(activeTab.value?.equipmentData?.dashboardSensors || [])]),
);
const manualRouteSensors = computed(() => Object.freeze(
	dashboardSensors.value.filter((sensor) => sensor.data_set === DATASET.MANUAL_ROUTE_FFT),
));
const standardDashboardSensors = computed(() => Object.freeze(
	dashboardSensors.value.filter((sensor) => sensor.data_set !== DATASET.MANUAL_ROUTE_FFT),
));

const forceRerender = () => {
	detailsComponentKey.value++;
};
const switchTab = (tab) => {
	activeTab.value = tab;
};
const setupCrossoverList = (equipmentTypeName, list) => {
	const newAnaloguesList = {
		our_in_store_room: list.our_in_store_room || [],
		analogue_in_store_room: list.analogue_in_store_room || [],
		our_in_asset: list.our_in_asset || [],
		analogue_in_asset: list.analogue_in_asset || [],
	};

	return Object.freeze(
		Object.keys(newAnaloguesList).map((key) => {
			let label = '';
			if (key === 'our_in_store_room') {
				label = `Spare ${equipmentTypeName}s are in the storeroom`;
			} else if (key === 'analogue_in_store_room') {
				label = `Compatible replacement ${equipmentTypeName}s are in the storeroom`;
			} else if (key === 'our_in_asset') {
				label = `${equipmentTypeName}s are in the plant but are on other machines`;
			} else if (key === 'analogue_in_asset') {
				label = `Compatible replacement ${equipmentTypeName}s are on other machines`;
			}
			return {
				label,
				quantity: newAnaloguesList[key].length,
				list: newAnaloguesList[key],
			};
		}),
	);
};
const fetchItem = (id) => {
	itemLoading.value = true;
	return api_request.get(`/equipments/${id}`, {
		notNotify: true,
		prepareData: 'prepareEquipmentsList',
		storeName: 'equipmentsStore',
		stateProp: 'itemData',
		loadingProp: 'isLoading',
	})
		.then(({ value }) => {
			itemData.value = value || {};
			loadContent.value = true;
		})
		.finally(() => {
			itemLoading.value = false;
		});
};
const fetchEquipments = (assetId) => {
	equipmentsLoading.value = true;
	return api_request.get('/equipments/dashboard', {
		params: { assetId, max: -1, archivedNodes: true },
		notNotify: true,
		prepareData: 'prepareEquipmentsList',
		prepareDataSettings: {
			addSettingItems: [
				{ key: 'equipmentSubType', val_key: 'equipmentSubType' },
				{ key: 'subTypeBrand', val_key: 'subTypeBrand' },
				{ key: 'subTypeModel', val_key: 'subTypeModel' },
			],
		},
	})
		.then(({ value }) => {
			equipmentsList.value = value || [];
		})
		.finally(() => {
			equipmentsLoading.value = false;
		});
};
const fetchAnalogues = (id, settings = {}) => {
	const loadingProp = settings.loadingProp || analoguesLoading;
	loadingProp.value = true;
	return api_request.get(`/equipments/${id}/analogues`, {
		params: { max: -1, ...(settings.params || {}) },
		notNotify: true,
	})
		.then(({ value }) => {
			const target = settings.listProp || analoguesList;
			target.value = value || {};
			analoguesIsFetched.value = true;
		})
		.finally(() => {
			loadingProp.value = false;
		});
};
const fetchMultiViews = (equipmentId) => {
	multiViewsLoading.value = true;
	return api_request.get(`/equipments/${equipmentId}/metric-multi-views`, {
		params: { max: -1, orderByColumn: 'name', orderByMethod: 'asc' },
		notNotify: true,
	})
		.then(({ value }) => {
			multiViewsList.value = value || [];
		})
		.finally(() => {
			multiViewsLoading.value = false;
		});
};
const editEquipment = () => {
	if (!activeTab.value?.equipmentData) return;
	globalStore.show_edit_modal({
		show: true,
		instanceData: activeTab.value.equipmentData,
		instanceName: 'Equipments',
		formComponentFileLoader: () => import('@/views/Equipments/ItemFormWrapper.vue'),
		itemName: itemsName.value.one,
		successSubmitCallback: successEquipmentSave,
	});
};
const moveEquipment = () => {
	if (!activeTab.value?.equipmentData) return;
	globalStore.show_edit_modal({
		show: true,
		title: `${tt('Move')} ${tt('Item')}`,
		instanceData: activeTab.value.equipmentData,
		instanceName: 'Equipments',
		editModalProp: 'editModalClassic',
		formComponentFileLoader: () => import('@/views/BrandModels/Details/MoveForm.vue'),
		modalClassName: 'fixed-header-footer small-header small-footer',
		itemName: itemsName.value.one,
		additionalSettings: {
			plantId: itemData.value.plant_id,
			equipmentId: activeTab.value.equipmentData.id,
		},
		successSubmitCallback: successEquipmentSave,
	});
};
const successEquipmentSave = () => {
	initialPageSetup();
	globalStore.show_edit_modal({ show: false });
	globalStore.show_edit_modal({ editModalProp: 'editModalClassic', show: false });
};
const rfqSuccess = () => {
	changeRoute({ path: `/equipments/${routeParamsId.value}/details/main` });
};
const handleShareLinkClick = () => {
	const daterange = statisticsFilters.value?.daterange || [];
	const path = `${window.location.origin}${route.path}?dateStart=${encodeURIComponent(daterange[0] || '')}&dateFinish=${encodeURIComponent(daterange[1] || '')}`;
	copyToClipboard(path, {
		messageType: 'success',
		messageText: tt('aliases.to_clipboard_msg'),
	});
};
const reloadPage = () => {
	initialPageSetup();
	activeTab.value = {};
	equipmentsList.value = [];
	forceRerender();
};
const updateEquipment = (equipment) => {
	const found = findItemBy('id', equipment.id, equipmentsList.value, { returnIndex: true });
	if (found?.index != null) {
		equipmentsList.value[found.index].rpm_source_item = equipment.rpm_source_item;
		equipmentsList.value[found.index].is_rpm_visible = equipment.is_rpm_visible;
	}
};
const togglePreviewModal = (data) => {
	emit('event', {
		eventName: 'togglePreviewModal',
		data,
		onward: true,
	});
};
const handleCreateWorkOrderButton = ({ settings }) => {
	if (settings) {
		// console.log(settings);
		globalStore.show_edit_modal(settings);
	}
};
const initialPageSetup = () => {
	fetchItem(routeParamsId.value);
};

const { handleEvent } = useEventHandler({
	rfqSuccess,
	forceRerender,
	reloadPage,
	togglePreviewModal,
	updateEquipment,
	handleCreateWorkOrderButton,
	fetchMultiViews,
}, null);

watch(navbarSettings, (settings) => globalStore.setup_navbar(settings), { immediate: true });
watch(itemData, (item) => {
	if (!item?.id) return;
	if (!item.asset_id || item.equipments_count === 1) {
		equipmentsList.value = [item];
	} else {
		fetchEquipments(item.asset_id);
	}
});
watch(
	() => route.name,
	(name) => {
		if (
			name !== 'DetailsStatPage' &&
			prevRouteName.value === 'DetailsStatPage' &&
			!analoguesIsFetched.value
		) {
			fetchAnalogues(routeParamsId.value);
		}
		prevRouteName.value = name;
	},
);
watch(activeTab, (tab) => {
	const equipmentData = tab?.equipmentData;
	if (!equipmentData) return;

	fetchMultiViews(equipmentData.id);
	analoguesIsFetched.value = false;

	const { id, dashboardSensors: sensors = [], equipmentSubType } = equipmentData;
	if (routeParamsId.value !== id) {
		if (
			route.name === 'DetailsManualRouteStatPage' &&
			sensors.some((sensor) => sensor.data_set === DATASET.MANUAL_ROUTE_FFT)
		) {
			router.replace(`/equipments/${id}/details/manual-route`);
			forceRerender();
		} else if (route.params.sensorId && sensors.length) {
			const standardSensor = sensors.find(
				(sensor) => sensor.data_set !== DATASET.MANUAL_ROUTE_FFT,
			);
			const path = standardSensor
				? `/equipments/${id}/details/pdm/${standardSensor.id}`
				: `/equipments/${id}/details/manual-route`;
			router.replace(path);
			forceRerender();
		} else {
			router.replace(`/equipments/${id}/details/main`);
		}
	}

	activeTabIdx.value = tabsList.value.findIndex((tabItem) => tabItem.id === equipmentData.id);

	if (route.name !== 'DetailsStatPage') {
		fetchAnalogues(id);
		if (equipmentSubType) {
			fetchAnalogues(id, {
				listProp: subTypeAnaloguesList,
				loadingProp: subTypeAnaloguesLoading,
				params: { subtype: true },
			});
		}
	}
});
watch(tabsList, (tabs) => {
	if (!tabs.length) return;
	const tab = findItemBy('id', routeParamsId.value, tabs);
	activeTab.value = tab || tabs[0];
});

onMounted(initialPageSetup);
onBeforeUnmount(() => globalStore.setup_navbar({}));
</script>
