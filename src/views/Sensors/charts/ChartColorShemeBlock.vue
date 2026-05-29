<template>
	<div class="color-picker-list flex relative">
		<SimpleSpinner :active="itemsSaving" />

		<ChartColorPickerItem
			v-for="(item, idx) in metricThresholdLevelsColorSchemes"
			:key="`color_item-${idx}`"
			:ref="(el) => setSubItemRef('ChartColorPickerItem', el, idx)"
			class="flex align-center div-block"
			:itemData="item"
			:predefineColors="predefineColors"
			@saveColorScheme="saveColorScheme"
		/>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

import {
	NCD_ALARM_TYPES,
	SENSOR_THRESHOLD_TYPES,
} from '@/constants/global';
import { Lang } from '@/localization';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useSensors } from '@/composables/useSensors';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import ChartColorPickerItem from './ChartColorPickerItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'ChartColorShemeBlock',
});

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	hasStatistics: Boolean,
	sensorId: Number,
});

const { setSensorChartColorScheme } = useSensors();
const refsMap = reactive({});
const itemsSaving = ref(false);
const formData = ref({
	metric_type: null,
	color_schemes: [],
});

const predefineColors = Object.freeze([
	'#660000', '#663200', '#666600', '#006600', '#006666', '#000066', '#1e0034', '#370066',
	'#990000', '#994c00', '#999900', '#009900', '#009999', '#000099', '#2d004e', '#530099',
	'#cc0000', '#cc6600', '#cccc00', '#00cc00', '#00cccc', '#0000cc', '#3c0068', '#6f00cc',
	'#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#4b0082', '#8b00ff',
	'#ff3333', '#ff9933', '#ffff33', '#33ff33', '#33ffff', '#3333ff', '#6f339b', '#a233ff',
	'#ff6666', '#ffb266', '#ffff66', '#66ff66', '#66ffff', '#6666ff', '#9366b4', '#b966ff',
	'#ff9999', '#ffcc99', '#ffff99', '#99ff99', '#99ffff', '#9999ff', '#b763cd', '#d099ff',
	'#ffcccc', '#ffe5cc', '#ffffcc', '#ccffcc', '#ccffff', '#ccccff', '#dbcce6', '#e7ccff',
]);

const subItemsSettings = computed(() =>
	Object.freeze([{ ref: 'ChartColorPickerItem', returnArray: true }]),
);

const defaultList = computed(() => {
	const { chart_parameter_id, resources } = props.ChartInstance;
	const { parameterItem } = resources.chart_config.customSettings;

	if (!parameterItem) return [];

	const { alarm_type } = parameterItem;
	const { ALARM, WARNING, BASELINE } = SENSOR_THRESHOLD_TYPES;

	if (alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM) {
		return Object.freeze([
			{
				label: tt('phrases.High_Alarm'),
				threshold_level: ALARM,
				color_scheme: '#ff0000',
				metric_type: chart_parameter_id,
			},
			{
				label: tt('phrases.Low_Alarm'),
				threshold_level: WARNING,
				color_scheme: '#0e52ef',
				metric_type: chart_parameter_id,
			},
		]);
	}

	if (alarm_type === NCD_ALARM_TYPES.WARNING_ALARM) {
		return Object.freeze([
			{
				label: tt('constants.Alarm'),
				threshold_level: ALARM,
				color_scheme: '#ff0000',
				metric_type: chart_parameter_id,
			},
			{
				label: tt('constants.Warning'),
				threshold_level: WARNING,
				color_scheme: '#ffde32',
				metric_type: chart_parameter_id,
			},
			{
				label: tt('constants.Good'),
				threshold_level: BASELINE,
				color_scheme: '#059966',
				metric_type: chart_parameter_id,
			},
		]);
	}

	return [];
});

const metricThresholdLevelsColorSchemes = computed(() => {
	if (props.hasStatistics) {
		const list = props.ChartInstance.getColorSchemesList();
		return list.length ? list : defaultList.value;
	}
	return defaultList.value;
});

const { collectDataFromSubItems, setSubItemRef } = useSubItemsList({ formData, refsMap });

const saveColorScheme = () => {
	const payload = {
		itemId: props.sensorId,
		data: {
			metric_type: props.ChartInstance.chart_parameter_id,
			color_schemes: collectDataFromSubItems(subItemsSettings.value).result,
		},
	};

	itemsSaving.value = true;
	setSensorChartColorScheme(payload)
		.then(({ value }) => {
			props.ChartInstance.updateFetchedColorSchemes(value);
		})
		.catch((error) => {
			console.warn(error);
		})
		.finally(() => {
			itemsSaving.value = false;
		});
};
</script>
