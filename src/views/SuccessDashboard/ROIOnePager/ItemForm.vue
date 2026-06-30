<template>
	<div class="edit-form-container success-dashboard-form normal-font-weight">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			label-width="150px"
			label-position="top"
			:model="formData"
			:rules="rules"
		>
			<div v-if="showJustInfo || itemData" class="title flex">
				<div v-if="showJustInfo" class="section-title uppercase semi-bold">
					{{ tt('Asset') }}:
					{{ itemData?.asset ? itemData.asset.name : tt('phrases.name_is_missing') }}
				</div>

				<div v-if="itemData" class="ml-auto">
					<span class="info-color pointer semi-bold" @click="showHistory = !showHistory">
						{{ tt('History') }}
					</span>
				</div>
			</div>

			<div :class="[{ card: !showJustInfo }]">
				<div :class="[{ 'card-content': !showJustInfo }]">
					<div class="mcol-xs-auto">
						<TabsBar
							:activeTab="activeTab"
							:tabsList="tabsList"
							buttonsType="primary"
							buttonsClass="inverted"
							@switchTab="switchTab"
						/>
					</div>

					<div class="flex mrow wrap big-padding">
						<div class="mcol-xs-12 mt-15">
							<el-form-item label="" prop="name">
								<CustomInput
									v-model="formData.name"
									:disabled="showJustInfo"
									:placeholder="`${tt('Name')} ${tt('ROI_One_Pager')}`"
								/>
							</el-form-item>
						</div>

						<div v-if="!showJustInfo" class="mcol-xs-12">
							<el-form-item label="" prop="asset_id">
								<FetchByQuerySelect
									v-model="formData.asset_id"
									enableLoadmore
									:optionsLoading="assetsLoading"
									:optionsList="assetsList"
									:settings="assetQueryOptions"
									:placeholder="`${tt('select')} ${tt('asset')}`"
								/>
							</el-form-item>
						</div>

						<div v-if="!showJustInfo" class="mcol-xs-12">
							<el-form-item label="" prop="sensor_id">
								<FetchByQuerySelect
									v-model="formData.sensor_id"
									:disabled="!formData.asset_id"
									enableLoadmore
									clearable
									:optionsLoading="assetSensorsLoading"
									:optionsList="assetSensorsList"
									:settings="sensorQueryOptions"
									:setupLabelMethod="setupSensorLabelMethod"
									:placeholder="`${tt('select')} ${tt('sensor')}`"
								/>
							</el-form-item>
						</div>

						<div class="mcol-xs-12 mcol-lg-6">
							<div class="mrow flex column">
								<div class="mcol-xs-12">
									<div class="card vertical-fluid">
										<div class="card-header filled_2">
											<div class="semi-bold uppercase">
												{{ isFileTabActive ? tt('FILE') : tt('IMAGES') }}
											</div>
										</div>

										<div class="card-content">
											<transition name="standard-fade" mode="out-in">
												<el-form-item
													v-if="!isFileTabActive"
													:key="`images-${imgUploadUpdated}`"
													prop="pictures"
													class="upload-form-item"
												>
													<FileUploadBlock
														ref="imgUploadBlockRef"
														uploadBlockType="standard-images big-images rounded"
														multiple
														rotate
														showImageClickOverlay
														imgItemClass="xs-show-inline"
														:disabled="showJustInfo"
														:pictures="itemPictures"
														@onImgClick="togglePreviewModal"
													/>
												</el-form-item>

												<el-form-item
													v-else
													:key="`file-${imgUploadUpdated}`"
													prop="file"
													class="upload-form-item"
												>
													<FileUploadBlock
														ref="fileUploadBlockRef"
														injectDataToRoot
														uploadBlockType="files-list"
														accept=" "
														enableLinkToFile
														deleteFileId
														:showDeleteButton="!showJustInfo"
														:disabled="showJustInfo"
														:pictures="itemPictures"
														:buttonText="tt('phrases.Upload_File')"
														buttonIcon="icomoon icon-clip"
													/>
												</el-form-item>
											</transition>
										</div>
									</div>
								</div>

								<div v-if="showJustInfo" class="mcol-xs-12">
									<div class="card roi-green-bar">
										<div class="card-content flex">
											<div class="page-title semi-bold">{{ tt('ROI') }}</div>
											<div class="ml-auto page-title semi-bold">$ {{ formData.final_roi }}</div>
										</div>
									</div>
								</div>

								<div v-else class="mcol-xs-12">
									<div class="card">
										<div class="card-header filled_2">
											<div class="semi-bold uppercase">{{ tt('ROI_FINAL') }} ($)</div>
										</div>

										<div class="card-content">
											<el-form-item prop="final_roi" class="mcol-xs-6" required>
												<el-input v-model.number="formData.final_roi" placeholder="$" />
											</el-form-item>
										</div>
									</div>
								</div>
							</div>
						</div>

						<transition name="standard-fade" mode="out-in">
							<div
								v-if="!isFileTabActive"
								:class="['mcol-xs-12 mcol-lg-6', { showJustInfo }]"
							>
								<div class="mrow flex column equalize-cards-height-16">
									<div class="mcol-xs-12">
										<div class="card vertical-fluid">
											<div class="card-header filled_2">
												<div class="semi-bold uppercase">
													{{ tt('phrases.findings_issue_detection_action_plan') }}
												</div>
											</div>

											<div class="card-content special-decorated-form striped">
												<el-form-item prop="issues">
													<div v-if="issuesItemsList.length" class="content-row">
														<DynamicFormItem
															v-for="(item, idx) in issuesItemsList"
															:ref="(el) => setSubItemRef('issues', el, idx)"
															:key="`issue-${item.id}`"
															:item-data="item"
															:item-index="idx"
															:isLast="idx === issuesItemsList.length - 1"
															:showJustInfo="showJustInfo"
															@onCreate="addFormItem(issuesItemsList, 'f_i-', { focus: 'title' })"
															@onRemove="(id) => removeFormItem(id, issuesItemsList)"
														/>
													</div>
													<div v-else>-</div>
												</el-form-item>
											</div>
										</div>
									</div>

									<div class="mcol-xs-12">
										<div class="card vertical-fluid">
											<div class="card-header filled_2">
												<div class="semi-bold uppercase">
													{{ tt('phrases.roi_cost_avoidance') }}
												</div>
											</div>

											<div class="card-content special-decorated-form striped">
												<el-form-item prop="cost_avoidance_plan">
													<div v-if="costAvoidanceItemsList.length" class="content-row">
														<DynamicFormItem
															v-for="(item, idx) in costAvoidanceItemsList"
															:ref="(el) => setSubItemRef('costAvoidance', el, idx)"
															:key="`cost-avoidance-${item.id}`"
															:item-data="item"
															:item-index="idx"
															:isLast="idx === costAvoidanceItemsList.length - 1"
															:showJustInfo="showJustInfo"
															@onCreate="addFormItem(costAvoidanceItemsList, 'ca_i-', { focus: 'title' })"
															@onRemove="(id) => removeFormItem(id, costAvoidanceItemsList)"
														/>
													</div>
													<div v-else>-</div>
												</el-form-item>
											</div>
										</div>
									</div>
								</div>
							</div>
						</transition>

						<div v-if="!isFileTabActive" class="mcol-xs-12">
							<div class="card">
								<div class="card-header filled_2 flex align-center">
									<div class="semi-bold uppercase">{{ tt('phrases.pdm_data_screenshot') }}</div>
								</div>

								<div class="card-content">
									<SensorsAlarmsContainer
										v-if="formData.graphs && formData.graphs.length && assetSensorsList.length"
										ref="sensorsAlarmsContainerRef"
										:sensorsAlarms="formData.graphs"
										:itemData="itemData"
										:sensorsList="assetSensorsList"
										:sensorsLoading="assetSensorsLoading"
										:measurement="plantItem?.metric_system_type"
										:additionalProps="additionalPropsForCharts"
										@event="handleContainerEvent"
									/>

									<div v-else class="page-title bold gray-color outside-bg-addition">
										{{ tt('phrases.no_data') }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-if="!showJustInfo" class="el-form-item FormOperationsButtons">
				<el-button type="primary" native-type="button" class="item-action-button" @click="validateForm">
					<span class="uppercase">{{ tt('SAVE') }}</span>
				</el-button>
			</div>
		</el-form>

		<el-dialog
			v-model="showHistory"
			:title="tt('phrases.history_roi_one_pager')"
			center
			append-to-body
			class="tiny dialog-decorate-header filled-header rounded top"
		>
			<ROIsHistory v-if="itemData" :itemsList="historyList" />
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef, watch } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { useRoute } from 'vue-router';
import { api_request } from '@/api/request_provider';
import { DATASET } from '@/constants/global';
import { required } from '@/constants/validation';
import { setupLabel } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useNotify } from '@/composables/useNotify';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useNavigation } from '@/composables/mixins/useNavigation';

import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import TabsBar from '@/components/common/TabsBar.vue';
import DynamicFormItem from './DynamicFormItem.vue';
import SensorsAlarmsContainer from '../common/SensorsAlarmsContainer.vue';
import ROIsHistory from '../common/ROIsHistory.vue';

const { tt } = Lang;

defineOptions({ name: 'ROIOnePagerItemForm' });

const props = defineProps(buildProps({
	plantItem: { type: Object, default: () => ({}) },
	sensorsList: { type: Array, default: () => [] },
	sensorsLoading: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const route = useRoute();
const authStore = useAuthStore();
const { Notify } = useNotify();
const { changeRoute } = useNavigation();

const itemFormRef = ref(null);
const imgUploadBlockRef = ref(null);
const fileUploadBlockRef = ref(null);
const sensorsAlarmsContainerRef = ref(null);
const showHistory = ref(false);
const imgUploadUpdated = ref(0);
const selectedAsset = shallowRef(null);
const assetLoading = ref(false);
const assetsList = shallowRef([]);
const assetsLoading = ref(false);
const assetSensorsList = shallowRef([]);
const assetSensorsLoading = ref(false);
const historyList = shallowRef([]);
const issuesItemsList = ref([]);
const costAvoidanceItemsList = ref([]);
const subItemRefs = ref({});
const activeTab = ref({ title: tt('Form'), prop: 'formTabActive' });

const initialFormData = {
	name: '',
	asset_id: null,
	sensor_id: null,
	pictures: [],
	file: null,
	graphs: [],
	issues: [],
	cost_avoidance_plan: [],
	final_roi: '',
	sensors_alarms: [],
};
const formData = ref({ ...initialFormData });

const itemData = computed(() => props.itemData);
const routeQuery = computed(() => (Object.keys(route.query || {}).length ? route.query : null));
const showJustInfo = computed(() =>
	!authStore.hasAccessTo(['edit_customer_success']) ||
	(Boolean(itemData.value?.id) && (!routeQuery.value || !routeQuery.value.edit)),
);
const tabsList = computed(() => Object.freeze([
	{ title: tt('Form'), prop: 'formTabActive' },
	{ title: tt('File'), prop: 'fileTabActive' },
]));
const isFileTabActive = computed(() => activeTab.value?.prop === 'fileTabActive');
const rules = computed(() => ({ asset_id: required }));
const additionalPropsForCharts = computed(() => Object.freeze({
	showDisableChartButton: !showJustInfo.value,
	showDatePicker: !showJustInfo.value,
}));
const assetQueryOptions = computed(() => Object.freeze({
	fetchAction: (payload) => api_request.get('/assets', payload),
	fetchByIdAction: ({ itemId }) => api_request.get(`/assets/${itemId}`, { itemId, notNotify: true }),
	params: { plantId: props.plantItem?.id },
}));
const sensorQueryOptions = computed(() => Object.freeze({
	fetchAction: (payload) => api_request.get('/sensors', payload),
	fetchByIdAction: ({ itemId }) => api_request.get(`/sensors/${itemId}`, { itemId, notNotify: true }),
	params: { max: 30, assetId: formData.value.asset_id },
}));
const sensorLabelOptions = Object.freeze({
	accessors: ['asset_numbers', 'data_set', 'controller.name', 'port_number'],
	useGetItemValue: [{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }],
	delimeter: ',',
});
const itemPictures = computed(() => {
	if (isFileTabActive.value) {
		return itemData.value?.full_file_name ? [{ full_file_name: itemData.value.full_file_name }] : [];
	}
	return itemData.value?.pictures?.length ? itemData.value.pictures : [];
});
const methodsMap = {
	fetch_assets: ({ params } = {}) => api_request.get('/assets', { params, notNotify: true }),
	fetch_asset: ({ itemId } = {}) => api_request.get(`/assets/${itemId}`, { itemId, notNotify: true }),
	fetch_sensors: ({ params } = {}) => api_request.get('/sensors', { params, notNotify: true }),
};
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			actionName: 'fetch_assets',
			bindTo: [
				{
					getValue: () => props.plantItem?.id,
					param: 'plantId',
				},
			],
			localProp: assetsList,
			localLoadProp: assetsLoading,
		},
	]),
);

const { setupFormSubItemsList, addFormItem, removeFormItem, setSubItemRef } = useSubItemsList({
	formData,
	refsMap: subItemRefs,
});
const { doFetchAction } = useRequestsList({ methodsMap, requestsToDoList });

const switchTab = (tab) => {
	activeTab.value = tab;
};
const filterEmptyItems = (list) => list.filter((item) => item.id || item.title);
const collectSubItemData = (refName) =>
	(subItemRefs.value[refName] || []).filter(Boolean).map((item) => item.getFormData());
const togglePreviewModal = (data) => {
	emit('event', { eventName: 'togglePreviewModal', data, onward: true });
};
const setupSensorLabelMethod = (sensor) => {
	const { data_set, device_address_id, controller, fft_sensor_id } = sensor || {};
	if (data_set === DATASET.BANNER_TEMP_VIBE_V2 || data_set === DATASET.BANNER_V2_GENERIC) {
		return `${controller?.name || ''}, D${device_address_id || ''}, S${fft_sensor_id || ''}`;
	}
	return setupLabel(sensor, sensorLabelOptions);
};
const fetchAsset = (assetId) => {
	selectedAsset.value = null;
	if (!assetId) return;
	doFetchAction(methodsMap.fetch_asset, selectedAsset, assetLoading, { itemId: assetId });
};
const fetchAssetSensors = (assetId) => {
	assetSensorsList.value = [];
	if (!assetId) return;
	doFetchAction(methodsMap.fetch_sensors, assetSensorsList, assetSensorsLoading, {
		params: { assetId, max: 30 },
	});
};
const handleContainerEvent = ({ eventName, data }) => {
	if (eventName === 'updateFormDataGraphs') {
		formData.value.graphs = data?.graphs || [];
	}
};
const localSetupPage = (item = {}) => {
	historyList.value = item?.histories || item?.history || [];

	if (item?.id) {
		if (props.plantItem?.id && item.plant_id && props.plantItem.id !== item.plant_id) {
			changeRoute({ path: '/success-dashboard/roi-one-pager' });
			return;
		}
		if (routeQuery.value?.edit && item.full_file_name) {
			activeTab.value = tabsList.value[1];
		}
		if (item.asset_id) {
			fetchAssetSensors(item.asset_id);
		}
	}

	issuesItemsList.value = setupFormSubItemsList(item?.issues || [], 'f_i');
	costAvoidanceItemsList.value = setupFormSubItemsList(item?.cost_avoidance_plan || [], 'ca_i');

	if (!showJustInfo.value) {
		if (!issuesItemsList.value.length) addFormItem(issuesItemsList, 'f_i-');
		if (!costAvoidanceItemsList.value.length) addFormItem(costAvoidanceItemsList, 'ca_i-');
	}
};
const localPrepareSubmitData = (data) => {
	const finalRoi = Number(data.final_roi);
	if (Number.isNaN(finalRoi)) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('phrases.roi_final_should_be_a_number'),
		});
		return null;
	}

	const pictures = imgUploadBlockRef.value?.getFormData?.() || [];
	const files = fileUploadBlockRef.value?.getFormData?.() || [];
	const preparedData = {
		...data,
		final_roi: finalRoi,
		issues: filterEmptyItems(collectSubItemData('issues')),
		cost_avoidance_plan: filterEmptyItems(collectSubItemData('costAvoidance')),
		pictures,
		file: files[0]?.file || files[0]?.raw || files[0]?.formData?.raw || data.file || null,
	};

	if (isFileTabActive.value) {
		preparedData.issues = [];
		preparedData.cost_avoidance_plan = [];
		delete preparedData.graphs;
	}
	if (!preparedData.sensor_id) delete preparedData.sensor_id;
	delete preparedData.sensors_alarms;

	if (preparedData.graphs) {
		preparedData.graphs = preparedData.graphs.map((graph) => ({
			...graph,
			is_hidden: graph.is_hidden ? 1 : 0,
		}));
	}
	return preparedData;
};
const localPreSubmitHook = ({ data }) => {
	if (
		isFileTabActive.value &&
		!data.file &&
		(!itemData.value || !itemData.value.full_file_name)
	) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('phrases.file_is_required'),
		});
		return { next: false };
	}
	return { next: true };
};
const localValidationHook = (options) => {
	if (!isFileTabActive.value) {
		sensorsAlarmsContainerRef.value?.saveSensorsAlarmsChartsForms?.();
	}
	if (options.skipSubmit) return true;
	return true;
};

const { validateForm, handleCancel, isInitialSetup } = useItemForm({
	entityKey: 'RoiOnePagers',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	localSetupPage,
	localValidationHook,
	localPrepareSubmitData,
	localPreSubmitHook,
	uploadSettings: Object.freeze([{ fileProp: 'pictures', multiple: true }, { fileProp: 'file' }]),
	emit,
});

watch(
	() => formData.value.asset_id,
	(assetId) => {
		if (isInitialSetup.value) return;
		fetchAsset(assetId);
		fetchAssetSensors(assetId);
	},
);
watch(selectedAsset, (asset) => {
	if (asset) {
		formData.value.graphs = cloneDeep(asset.graphs || []);
	}
});
watch(isFileTabActive, () => {
	imgUploadUpdated.value += 1;
});

defineExpose({ validateForm });
</script>
