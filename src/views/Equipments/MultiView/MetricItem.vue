<template>
	<el-form ref="itemFormRef" class="flex mrow bottom" :model="formData">
		<el-form-item prop="sensor_id" class="mcol-xs-5" required>
			<label v-if="itemIndex === 0">{{ tt('Sensor') }}</label>
			<FetchByQuerySelect
				v-model="formData.sensor_id"
				clearable
				enableLoadmore
				:optionsLoading="sensorsLoading"
				:optionsList="sensorsList"
				:settings="sensorQueryOptions"
				:placeholder="`${tt('select')} ${tt('sensor')}`"
				:setupLabelMethod="setupSensorLabelMethod"
				@change="handleSensorChange"
				@update:optionsLoading="sensorsLoading = $event"
				@update:optionsList="sensorsList = $event"
			/>
		</el-form-item>

		<el-form-item prop="metric_type" class="mcol-xs-5" required>
			<label v-if="itemIndex === 0">{{ tt('constants.Metric') }}</label>
			<el-select
				v-if="currentSensorType"
				v-model="formData.metric_type"
				filterable
				:placeholder="tt('parameter')"
				@change="handleMetricTypeChange"
			>
				<el-option
					v-for="item in sensorParametersList"
					:key="`param-${item.id}`"
					:label="item.name"
					:value="item[selectValueKey]"
				/>
			</el-select>
		</el-form-item>

		<div class="mcol-xs-2">
			<el-button
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="removeItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { DATASET } from '@/constants/global';
import { findItemBy, removeDuplicatesObjectsArray, setupLabel } from '@/helpers';
import { Lang } from '@/localization';
import { chartsListsConfig } from '@/modules/charts_factory/controllers/Sensor/chartsListsConfig';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({ name: 'EquipmentMultiViewMetricItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const sensorsList = ref([]);
const sensorsLoading = ref(false);
const sensorItem = ref(null);
const formData = ref({
	id: null,
	sensor_id: null,
	metric_type: null,
	banner_v2_subtype_parameter_id: null,
});

const fetchSensors = createGetRequest(ENTITIES.Sensors.apiBase);
const fetchSensor = createGetByIdRequest(ENTITIES.Sensors.apiBase);

const selectedSensorData = computed(() => {
	if (formData.value.sensor_id && sensorsList.value.length) {
		return findItemBy('id', formData.value.sensor_id, sensorsList.value);
	}
	return undefined;
});

const { currentSensorType, currentChartSettingsKey } = useSensorType({
	currentSensorTypeData: selectedSensorData,
});

const selectValueKey = computed(() =>
	currentSensorType.value?.isBannerV2Generic ? 'node_parameter' : 'id',
);

const sensorQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: fetchSensors,
		fetchByIdAction: fetchSensor,
		params: { max: 30 },
	}),
);

const sensorLabelOptions = Object.freeze({
	accessors: ['asset_numbers', 'data_set', 'controller.name', 'port_number'],
	useGetItemValue: [{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }],
	delimeter: ',',
});

const sensorParametersList = computed(() => {
	if (currentSensorType.value?.isBannerV2Generic) {
		return Object.freeze(selectedSensorData.value?.bannerV2Subtype?.parameters || []);
	}

	if (currentChartSettingsKey.value) {
		const configsList = chartsListsConfig(currentChartSettingsKey.value);
		if (configsList) {
			const result = configsList.reduce(
				(acc, item) => acc.concat(item.requestsList || []),
				[],
			);
			return Object.freeze(removeDuplicatesObjectsArray(result, 'id'));
		}
	}
	return [];
});

const handleSensorChange = () => {
	formData.value.metric_type = null;
	formData.value.banner_v2_subtype_parameter_id = null;
};

const handleMetricTypeChange = (nodeParameter) => {
	const parameterItem = findItemBy('node_parameter', nodeParameter, sensorParametersList.value);
	if (parameterItem) {
		formData.value.banner_v2_subtype_parameter_id = parameterItem.id;
	}
};

const setupSensorLabelMethod = (sensor) => {
	const { data_set, device_address_id, controller, fft_sensor_id } = sensor || {};
	if (data_set === DATASET.BANNER_TEMP_VIBE_V2 || data_set === DATASET.BANNER_V2_GENERIC) {
		return `${controller?.name || ''}, D${device_address_id}, S${fft_sensor_id}`;
	}
	return setupLabel(sensor, sensorLabelOptions);
};

const fetchSelectedSensor = (id) => {
	sensorsLoading.value = true;
	fetchSensor({ itemId: id })
		.then((response) => {
			sensorItem.value = response?.value || null;
		})
		.finally(() => {
			sensorsLoading.value = false;
		});
};

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	localSetupPageActions: (item) => {
		if (item?.sensor_id) {
			fetchSelectedSensor(item.sensor_id);
		}
	},
	localGetFormDataCallback: (data) => {
		if (!currentSensorType.value?.isBannerV2Generic) {
			delete data.banner_v2_subtype_parameter_id;
		}
		return data;
	},
	emit,
});

watch(sensorItem, (sensor) => {
	if (sensor) {
		sensorsList.value = [sensor];
	}
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
