<template>
	<div class="equipment-info-container view-content-card">
		<div class="content-row">
			<div class="header-block">
				<div class="card">
					<div class="card-content flex">
						<Datepicker
							setupDaterangeFilter
							enableShortcuts
							:value="filters.daterange"
							type="daterange"
							clearingTo="last_7_days"
							@input="setFilters"
						/>
					</div>
				</div>
			</div>

			<div class="content-row">
				<div class="mrow flex wrap big-padding specifications-block-wrapper">
					<div
						:class="[
							'specifications-block mcol-xs-12 mcol-lg-6 mcol-xlg-5 flex column',
							{ 'fit-content': viewAll0.active || viewAll1.active },
						]"
					>
						<div :class="['card content-row', { viewAll: viewAll0.active }]">
							<div class="card-header">
								<div class="title semi-bold uppercase">
									{{ `${tt('SPECIFICATIONS')} ${equipmentData.equipment_type_name || ''}` }}
								</div>
							</div>
							<div class="card-content relative">
								<div class="info-list-container">
									<ul class="info-list primary main dots-in-text">
										<li v-if="pageTitle.title">
											<span class="label bold">{{ pageTitle.title }}</span>
											<span class="value fz_30">{{ pageTitle.label }}</span>
										</li>

										<InfoItem
											v-for="item in specificationsItemsList"
											:key="`info-${item.label}`"
											class="capitalize"
											:settingItem="item"
											:itemData="equipmentData"
											emptyText=" "
										/>

										<InfoItem
											v-for="item in typeOptionsList"
											:key="`spec-${item.id}`"
											:settingItem="item"
											keyProp="name"
											emptyText=" "
											:valueMethod="getOptionValue"
										/>
									</ul>
								</div>
							</div>

							<div v-if="viewAll0.show" class="view-all-button xs-hide lg-show">
								<div
									:class="['link flex align-center', { active: viewAll0.active }]"
									@click="viewAll0.active = !viewAll0.active"
								>
									<span>{{ tt('phrases.View_All') }}</span>
									<i class="icomoon icon-path_2"></i>
								</div>
							</div>
						</div>

						<div
							v-if="equipmentSubType"
							:class="['card content-row', { viewAll: viewAll1.active }]"
						>
							<div class="card-header">
								<div class="title semi-bold uppercase">
									{{ `${tt('SPECIFICATIONS')} ${equipmentSubType.name || ''}` }}
								</div>
							</div>
							<div class="card-content relative">
								<div class="info-list-container">
									<ul class="info-list primary main dots-in-text">
										<InfoItem
											v-if="subTypeBrand"
											:key="`subTypeBrand-${subTypeBrand.id}`"
											:itemData="subTypeBrand"
											:settingItem="{ label: 'Brand', prop: 'name' }"
											emptyText=" "
										/>
										<InfoItem
											v-if="subTypeModel"
											:key="`subTypeModel-${subTypeModel.id}`"
											:itemData="subTypeModel"
											:settingItem="{ label: 'Part Number', prop: 'name' }"
											emptyText=" "
										/>
										<InfoItem
											v-for="item in subTypeOptions"
											:key="`sub-spec-${item.id}`"
											:settingItem="item"
											keyProp="name"
											emptyText=" "
											:valueMethod="getOptionValue"
										/>
									</ul>
								</div>
							</div>

							<div v-if="viewAll1.show" class="view-all-button xs-hide lg-show">
								<div
									:class="['link flex align-center', { active: viewAll1.active }]"
									@click="viewAll1.active = !viewAll1.active"
								>
									<span>{{ tt('phrases.View_All') }}</span>
									<i class="icomoon icon-path_2"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="secondary-block mcol-xs-12 mcol-lg-6 mcol-xlg-7">
						<div class="mrow flex column big-padding">
							<div class="mrow flex wrap">
								<CrossoverBlock
									:class="['mcol-xs-12', { 'mcol-xlg-6': equipmentSubType }]"
									:crossoverList="crossoverList.mainType"
									:crossoverLoading="crossoverLoading"
									:equipmentData="equipmentData"
									:equipmentTypeName="equipmentData.equipment_type_name"
								/>

								<CrossoverBlock
									v-if="equipmentSubType"
									class="mcol-xs-12 mcol-xlg-6"
									:crossoverList="crossoverList.subType"
									:crossoverLoading="crossoverLoading"
									:equipmentData="equipmentData"
									:equipmentTypeName="equipmentSubType.name"
								/>
							</div>

							<div class="imgs-block">
								<div class="card">
									<div class="card-header">
										<div class="title semi-bold uppercase">{{ tt('IMAGE') }}</div>
									</div>
									<div class="card-content">
										<div v-if="filteredImagesList.length" class="imgs-list mrow flex wrap">
											<div
												v-for="img in filteredImagesList"
												:key="`image-${img.id}`"
												class="img-item mcol-xs-12 mcol-md-6"
											>
												<div class="content-container">
													<div class="imgWrapper pointer">
														<img
															:src="img.full_file_name"
															alt="img error"
															@click="togglePreviewModal(img.id)"
														/>
													</div>
													<div class="title muted semi-bold">
														{{ getImgTypeName(img) }}
													</div>
												</div>
											</div>
										</div>

										<div v-else class="imgs-list">
											<div class="img-item text-center">
												<img
													:src="equipmentMockSrc"
													alt="error"
													class="plant-dashboard-logo-mock"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="content-row">
				<div class="mrow flex wrap big-padding">
					<div class="mcol-xs-12 mcol-lg-6">
						<ItemPDMsStatisticBlock
							:filters="filters"
							:predefinedFilters="predefinedFilters"
							@event="handleEvent"
						/>
					</div>

					<div v-if="canViewMaintenance" class="mcol-xs-12 mcol-lg-6">
						<ItemWOStatisticBlock
							:createWOButtonFormSetup="createWOButtonFormSetup"
							:itemData="equipmentData"
							:filters="filters"
							:predefinedFilters="predefinedFilters"
							@event="handleEvent"
						/>
					</div>
				</div>
			</div>

			<div class="content-row requests-block mcol-xs-12">
				<div class="card">
					<div class="card-header">
						<div class="title semi-bold uppercase">{{ tt('phrases.MOTOR_RESULTS') }}</div>
					</div>
					<div class="nested-view-content-wrapper">
						<RFQSList
							preventSetNavbar
							editInModal
							fromCard
							:equipmentData="equipmentData"
							:additionalModalSettings="rfqEditModalSettings"
						/>
					</div>
				</div>
			</div>

			<div class="content-row">
				<MaintenanceListWrapper
					v-if="canViewMaintenance"
					hideDatepicker
					:woFilters="woFilters"
					:logFilters="logFilters"
				/>
			</div>

			<div class="content-row">
				<div class="card">
					<div class="card-header">
						<div class="title semi-bold uppercase">{{ tt('HISTORY') }}</div>
					</div>
					<div class="nested-view-content-wrapper">
						<MoveHistoryList :itemsList="equipmentData.histories || []" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { getObjectVal, mergeArrays } from '@/helpers';
import { getImgTypeName } from '@/helpers/specialHelpers';
import { MAINTENANCE_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import Datepicker from '@/components/common/Datepicker.vue';
import InfoItem from '@/components/itemDetails/InfoItem.vue';
import ItemPDMsStatisticBlock from '@/components/itemDetails/ItemPDMsStatisticBlock.vue';
import ItemWOStatisticBlock from '@/components/itemDetails/ItemWOStatisticBlock.vue';
import MaintenanceListWrapper from '@/components/itemDetails/MaintenanceListWrapper.vue';
import RFQSList from '@/views/RFQS/ItemsList.vue';
import equipmentMockSrc from '@/assets/img/equipment_mock.jpg';
import CrossoverBlock from './CrossoverBlock.vue';
import MoveHistoryList from './MoveHistoryList.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'EquipmentInfoBlock' });

const props = defineProps({
	equipmentData: { type: Object, required: true },
	crossoverList: { type: Object, default: () => ({}) },
	crossoverLoading: Boolean,
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const equipmentsStore = useEquipmentsStore();
const { statistics_filters: filters } = storeToRefs(equipmentsStore);

const viewAll0 = reactive({ show: false, active: false });
const viewAll1 = reactive({ show: false, active: false });

const canViewMaintenance = computed(() => authStore.hasAccessTo(['view_maintenance']));
const specificationsItemsList = computed(() =>
	Object.freeze(
		translate([
			{ label: 'Company', prop: 'company_name' },
			{ label: 'Plant', prop: 'plant_name' },
			{ label: 'Machine', prop: 'machine_name' },
			{ label: 'Location', prop: 'location_name' },
			{ label: 'Application', prop: 'application_name' },
			{ label: 'Brand', prop: 'brand_name' },
			{ label: 'Part_number', prop: 'brand_model_name' },
			{ label: 'phrases.Loc_on_machine', prop: 'loc_on_machine' },
			{
				label: 'Storeroom',
				prop: 'storeRooms',
				meta: { fromArray: { subProp: 'name' } },
			},
			{ label: 'Description', prop: 'notes' },
		]),
	),
);
const imagesList = computed(() => {
	const pictures = props.equipmentData.pictures || [];
	const machinePictures = props.equipmentData.machine_pictures || [];
	return Object.freeze(mergeArrays([...pictures], [...machinePictures]));
});
const filteredImagesList = computed(() => {
	const result = [];
	imagesList.value.forEach((image, idx) => {
		if (!result.some((item) => item.type == image.type)) {
			result.push({ ...image, id: `${image.id}-${idx}` });
		}
	});
	return Object.freeze(result);
});
const typeOptionsList = computed(() =>
	Object.freeze((props.equipmentData.typeOptions || []).filter((option) => option.raw_values?.length)),
);
const pageTitle = computed(() => {
	if (props.equipmentData.asset_name) {
		return Object.freeze({ title: tt('Asset'), label: props.equipmentData.asset_name });
	}
	if (props.equipmentData.last_asset_name) {
		return Object.freeze({
			title: `${tt('Last')} ${tt('Asset')}`,
			label: props.equipmentData.last_asset_name,
		});
	}
	return Object.freeze({ title: '', label: '' });
});
const equipmentSubType = computed(() => props.equipmentData.equipmentSubType || null);
const subTypeOptions = computed(() => Object.freeze(props.equipmentData.subTypeOptions || []));
const subTypeBrand = computed(() => props.equipmentData.subTypeBrand || null);
const subTypeModel = computed(() => props.equipmentData.subTypeModel || null);
const rfqEditModalSettings = Object.freeze({
	hideFooter: true,
	settings: { showJustInfo: true },
});
const predefinedFilters = computed(() =>
	Object.freeze({
		productionLineId: props.equipmentData.production_line_id,
		machineId: props.equipmentData.machine_id,
		assetId: props.equipmentData.asset_id,
		equipmentId: props.equipmentData.id,
		plantId: props.equipmentData.plant_id,
		daterange: filters.value?.daterange,
	}),
);
const woFilters = computed(() =>
	Object.freeze({
		...predefinedFilters.value,
		type: MAINTENANCE_TYPES.WORK_ORDER,
	}),
);
const logFilters = computed(() =>
	Object.freeze({
		...predefinedFilters.value,
		type: MAINTENANCE_TYPES.LOG,
	}),
);
const createWOButtonFormSetup = Object.freeze([
	{ formKey: 'production_line_id', valKey: 'production_line_id' },
	{ formKey: 'machine_id', valKey: 'machine_id' },
	{ formKey: 'asset_id', valKey: 'asset_id' },
	{ formKey: 'equipment_id', valKey: 'id' },
]);
const creationWOModalSettings = computed(() =>
	Object.freeze({
		itemName: tt('Work_Order'),
		editModalProp: 'editModalClassic',
		modalClassName: 'fixed-header-footer small-header small-footer',
		className: 'maintenance-modal',
		formComponentFileLoader: () => import('@/views/Maintenance/MaintenanceFormWrapper.vue'),
		additionalModalSettings: {
			switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
			...woFilters.value,
		},
	}),
);

const getOptionValue = (option) => (option.raw_values || []).join(' ');
const setFilters = (range) => {
	equipmentsStore.set_statistics_filters({
		...filters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
	});
};
const togglePreviewModal = (id) => {
	emit('event', {
		eventName: 'togglePreviewModal',
		data: {
			picturesList: imagesList.value,
			pictureId: id,
		},
		onward: true,
	});
};
const setupFormSettings = ({ row, formSetup }) => {
	const settings = {};
	formSetup.forEach((fi) => {
		settings[fi.formKey] = getObjectVal(row, fi.valKey);
	});
	return settings;
};
const handleCreateWorkOrderButton = (payload) => {
	emit('event', {
		eventName: 'handleCreateWorkOrderButton',
		data: {
			settings: {
				...creationWOModalSettings.value,
				show: true,
				formSettings: setupFormSettings(payload),
			},
		},
		onward: true,
	});
};
const setupInfoBlocksHeights = () => {
	const listContainers = document.querySelectorAll(
		'.specifications-block .info-list-container .info-list',
	);
	if (!listContainers.length) return;

	listContainers.forEach((item, idx) => {
		const state = idx === 0 ? viewAll0 : viewAll1;
		if (state) state.show = item.parentNode.clientHeight < item.clientHeight;
	});

	setTimeout(() => {
		const first = listContainers[0];
		if (!first?.parentNode?.parentNode) return;
		first.parentNode.parentNode.style.minHeight = viewAll0.show
			? `${first.parentNode.parentNode.clientHeight}px`
			: `${first.clientHeight + 30}px`;
	}, 200);
};

const { handleEvent } = useEventHandler({ handleCreateWorkOrderButton }, emit);

watch(
	() => props.equipmentData,
	() => setTimeout(setupInfoBlocksHeights, 1000),
);

onMounted(() => nextTick(() => setTimeout(setupInfoBlocksHeights, 1000)));
</script>
