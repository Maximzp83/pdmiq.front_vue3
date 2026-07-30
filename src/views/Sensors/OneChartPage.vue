<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="sensorLoading || equipmentLoading"
			:itemsName="itemsName.one"
		/>

		<div :class="['statistics-page one-chart-page', { 'full-height-chart': chartsToDisplay.length }]">
			<div :class="['tab-container reportBlock-tab show_tab', { 'show-RPM': showRPM }]">
				<div class="tab-container">
					<div v-if="allSensorsReady && equipmentDataReady" class="section-row">
						<ChartsListWrapper
							v-for="(sensor, idx) in sensors"
							:key="`wrapper_chart-${sensor.id}`"
							:ref="(el) => setChartsListWrapperRef(el, idx)"
							:chartsContainerIdx="idx"
							:rootFilters="filters"
							:sensorData="sensor"
							:activeAxis="activeAxis"
							:additionalProps="additionalProps"
							:additionalChartPayload="additionalChartPayload"
							:injectToChartOptions="injectToChartOptions"
							:getParamsByIds="chartsToDisplay"
							:rpmOverlayData="rpmOverlayData"
							:linespeedOverlaySensorData="linespeedOverlaySensorData"
							oneChartOnly
							enableAxisSelector
							splitNCDCharts
							@event="handleEvent"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Highcharts from '@/config/highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

import { createGetByIdRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { initHighchartsModule } from '@/helpers/charts';
import {
	cloneDeep,
	findItemBy,
	getYmdDateString,
	validateRouteParams,
} from '@/helpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensors } from '@/composables/useSensors';
import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { localeMonths, localeMonthsFull, weekdays } from '@/constants/date_time';
import { ITEM_SPEED_OPTIONS, RPM_SOURCES_TYPES } from '@/constants/global';
import {
	BANNER_V2_1_VIBRATION_PARAMETERS_TYPES,
	manualRouteSensorParametersList,
	sensorParametersListNCD,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { getSensorMetricSystemType } from '@/helpers/specialHelpers';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ChartsListWrapper from './charts/ChartsListWrapper.vue';

initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);

const { tt } = Lang;
const route = useRoute();
const router = useRouter();
const { fetchSensor } = useSensors();
const fetchEquipmentById = createGetByIdRequest(ENTITIES.Equipments.apiBase);

defineOptions({
	name: 'OneChartPage',
});

const sensorLoading = ref(false);
const sensors = ref([]);
const sensorsReadyCount = ref(0);
const loadingQueue = ref([]);
const lubeCycleHighSpeed = ref(false);
const activeAxis = ref(1);
const filters = ref({});
const equipmentData = ref(null);
const equipmentLoading = ref(false);
const rpmOverlaySensorData = ref(null);
const overlaySensorLoading = ref(false);
const isOverlaySensorReady = ref(false);
const chartsListWrapperRefs = ref([]);

const routeQuery = computed(() => route.query || {});
const sensorId = computed(() => Number(route.params.sensorId) || Number(route.params.id) || route.params.id);
const currentSensorIds = computed(() => [sensorId.value].filter(Boolean));
const allSensorsReady = computed(() => sensorsReadyCount.value === currentSensorIds.value.length);
const sensorData = computed(() => {
	if (allSensorsReady.value) return sensors.value[0] || null;
	return null;
});
const itemsName = computed(() => ({
	one: tt('PDM_Item'),
	mult: tt('PDM_Items'),
}));
const chartsToDisplay = computed(() => {
	const metricType = routeQuery.value.metric_type || routeQuery.value.parameter || routeQuery.value.param;
	if (!metricType) return [];

	const values = Array.isArray(metricType) ? metricType : `${metricType}`.split(',');
	return values.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id));
});
const additionalProps = computed(() => Object.freeze({
	lube_cycle_high_speed: lubeCycleHighSpeed.value,
	accessToThresholds: false,
	hideZoomBlock: true,
	showToggleNavigator: true,
	hideExportButton: true,
	setIsGraphMountedToWindow: true,
	hideChartHeader: true,
	disableAnimationAndSpinner: Boolean(chartsToDisplay.value.length),
	oneChartOnly: true,
	hcInstance: Highcharts,
	higchartInstances: {
		hcInstance: Highcharts,
		hcInstanceNew: Highcharts,
		stockInitNew: stockInit,
		boostNew: boost,
		stockInit,
		boost,
	},
}));
const injectToChartOptions = computed(() => {
	const pageHeight = window.innerHeight;
	const fullHeight = Boolean(chartsToDisplay.value.length);
	const height = fullHeight ? pageHeight : 250;
	const marginBottom = fullHeight ? 20 : 40;
	const animation = !fullHeight;

	return Object.freeze({
		chart: { height, marginBottom, animation },
		plotOptions: {
			series: { animation },
		},
		navigator: { enabled: false },
	});
});
const additionalChartPayload = computed(() => {
	let {
		max_metric_value,
		max_metric_threshold_value,
		max_metric_threshold_historic_value,
		graph_height_scale,
		timezone_offset,
	} = routeQuery.value;

	if (
		!graph_height_scale &&
		!max_metric_value &&
		!max_metric_threshold_value &&
		!max_metric_threshold_historic_value
	) {
		return {};
	}

	let yAxisMax;
	max_metric_value = Number(max_metric_value);
	max_metric_threshold_value = Number(max_metric_threshold_value);
	max_metric_threshold_historic_value = Number(max_metric_threshold_historic_value);
	graph_height_scale = Number(graph_height_scale);

	if (!Number.isNaN(graph_height_scale)) {
		yAxisMax = graph_height_scale;
	} else {
		[max_metric_value, max_metric_threshold_value, max_metric_threshold_historic_value].forEach((value) => {
			if (!Number.isNaN(value) && (yAxisMax === undefined || value > yAxisMax)) {
				yAxisMax = value;
			}
		});
	}

	return {
		yAxisMax,
		yAxisSoftMax: yAxisMax || max_metric_value,
		timezone_offset,
	};
});
const enableRPM = computed(() => Boolean(routeQuery.value.is_rpm_visible));
const showRPM = computed(() => Boolean(enableRPM.value && sensorData.value?.equipment?.is_rpm_visible));
const equipmentDataReady = computed(() => {
	if (showRPM.value && sensorData.value?.equipment_id) return Boolean(equipmentData.value);
	return true;
});
const rpmOverlayData = computed(() => {
	if (!sensorData.value || !equipmentData.value?.rpm_source_item) return null;

	const {
		rpm_source_item,
		rpmSources,
		rpm_external_node_parameter,
		rpm_external_node_id,
		rpm_formula,
	} = equipmentData.value;
	const data = { is_rpm_visible: true };

	switch (rpm_source_item) {
		case ITEM_SPEED_OPTIONS.LINESPEED_RPM:
			if (equipmentData.value.prodline_rpm_source_type === RPM_SOURCES_TYPES.MANUAL) {
				data.rpm_value = rpmSources?.line_speed_rpm_evaluated;
			} else if (equipmentData.value.prodline_rpm_source_type === RPM_SOURCES_TYPES.EXTERNAL_INPUT) {
				data.rpm_request = {
					parameter: equipmentData.value.prodline_rpm_node_parameter,
					sensor_id: equipmentData.value.prodline_rpm_node_id,
				};
			}
			break;
		case ITEM_SPEED_OPTIONS.SPECIFICATION_RPM:
			data.rpm_value = rpmSources?.specification_rpm_evaluated;
			break;
		case ITEM_SPEED_OPTIONS.MANUAL_RPM:
			data.rpm_value = rpmSources?.manual_rpm_evaluated;
			break;
		case ITEM_SPEED_OPTIONS.MAX_PEAK_FREQUENCY:
			data.rpm_request = {
				parameter: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS,
			};
			data.isMaxPeakFrequency = true;
			break;
		case ITEM_SPEED_OPTIONS.EXTERNAL:
			data.rpm_request = {
				parameter: rpm_external_node_parameter,
				sensor_id: rpm_external_node_id,
			};
			break;
		default:
			break;
	}

	if (rpm_formula && data.rpm_request) {
		data.rpm_request.get_params = {
			unitExpression: rpm_formula,
		};
	}

	return data;
});
const overlaySensorId = computed(() => {
	const request = rpmOverlayData.value?.rpm_request;
	return request?.sensor_id && request.sensor_id !== currentSensorIds.value[0]
		? request.sensor_id
		: null;
});
const linespeedOverlaySensorData = computed(() => {
	if (rpmOverlayData.value?.rpm_request) {
		return rpmOverlayData.value.isMaxPeakFrequency
			? cloneDeep(sensorData.value)
			: cloneDeep(rpmOverlaySensorData.value);
	}

	return equipmentData.value ? equipmentData.value.linespeedSensor : null;
});

const setChartsListWrapperRef = (el, idx) => {
	if (el) chartsListWrapperRefs.value[idx] = el;
};

const initSensors = (items) => {
	if (items?.length) {
		sensors.value = cloneDeep(items);
		return;
	}

	sensors.value = [];
	loadingQueue.value = [];
	fetchSensors(currentSensorIds.value, 0);
};

const fetchSensors = (ids, sensorIdx = 0) => {
	sensorsReadyCount.value = 0;
	sensorLoading.value = true;
	fetchSensorsAction(ids, sensorIdx);
};

const fetchSensorsAction = (ids, sensorIdx) => {
	if (!ids.length) {
		sensorLoading.value = false;
		return;
	}

	fetchSensor({ itemId: ids[sensorIdx] })
		.then(({ value }) => {
			const dashboardSensors = equipmentData.value?.dashboardSensors || [];
			const sensorFromEquipment = findItemBy('id', ids[sensorIdx], dashboardSensors) || {};

			sensors.value.push({ ...sensorFromEquipment, ...value });
			sensorsReadyCount.value += 1;

			if (sensorIdx < ids.length - 1) {
				fetchSensorsAction(ids, sensorIdx + 1);
			} else {
				loadingQueue.value.push(1);
				sensorLoading.value = false;
			}
		})
		.catch((error) => {
			console.warn(error);
			if (error?.response?.status === 404) {
				router.back();
			}
			sensorLoading.value = false;
		});
};

const fetchOverlaySensor = (id) => {
	overlaySensorLoading.value = true;
	isOverlaySensorReady.value = false;

	fetchSensor({ itemId: id })
		.then(({ value }) => {
			rpmOverlaySensorData.value = value;
			isOverlaySensorReady.value = true;
		})
		.catch((error) => {
			console.warn(error);
		})
		.finally(() => {
			overlaySensorLoading.value = false;
		});
};

const fetchEquipment = (id) => {
	equipmentLoading.value = true;
	fetchEquipmentById({ itemId: id })
		.then(({ value }) => {
			equipmentData.value = value || null;
		})
		.catch((error) => {
			console.warn(error);
		})
		.finally(() => {
			equipmentLoading.value = false;
		});
};

const setupFiltersFromQuery = () => {
	const {
		dateStart,
		dateFinish,
		parameter,
		measurement,
		meeting_tracker_id,
		timezone_offset_off,
	} = routeQuery.value;
	const nextFilters = {};

	if (dateStart && dateFinish) {
		nextFilters.daterange = [
			getYmdDateString({ ms: dateStart, withTime: true }),
			getYmdDateString({ ms: dateFinish, withTime: true }),
		];
	}

	if (measurement) nextFilters.measurement = measurement;
	nextFilters.meeting_tracker_id = meeting_tracker_id || null;
	nextFilters.timezone_offset_off = timezone_offset_off || null;

	filters.value = {
		...filters.value,
		...nextFilters,
	};

	if (parameter) {
		const parameterType =
			findItemBy('id', Number(parameter), sensorParametersListNCD()) ||
			findItemBy('id', Number(parameter), manualRouteSensorParametersList());
		if (parameterType) {
			activeAxis.value = parameterType.axis_id || 1;
		}
	}
};

const setupPage = () => {
	chartsListWrapperRefs.value = [];
	sensors.value = [];
	sensorsReadyCount.value = 0;
	loadingQueue.value = [];
	equipmentData.value = null;
	rpmOverlaySensorData.value = null;
	isOverlaySensorReady.value = false;
	activeAxis.value = 1;
	filters.value = {};

	setupFiltersFromQuery();

	if (validateRouteParams(sensorId.value)) {
		initSensors();
	}
};

const { handleEvent } = useEventHandler({}, null);

watch(sensorData, (data) => {
	if (data && showRPM.value && data.equipment_id) {
		fetchEquipment(data.equipment_id);
	}

	if (data) {
		filters.value = {
			...filters.value,
			measurement: getSensorMetricSystemType(data, equipmentData.value),
		};

		if (data.is_hidden_ncd_active_vertical_axis && data.ncd_active_vertical_axis === 1) {
			activeAxis.value = 2;
		}
	}
});

watch(overlaySensorId, (id) => {
	if (id) fetchOverlaySensor(id);
});

watch(
	() => route.fullPath,
	() => {
		setupPage();
	},
);

onBeforeMount(() => {
	if (Highcharts && Lang.currentLangId === LANGUAGE_TYPES.SPANISH) {
		Highcharts.setOptions({
			lang: {
				months: Lang.translate(localeMonthsFull()),
				weekdays: Lang.translate(weekdays()),
				shortMonths: Lang.translate(localeMonths(true)),
			},
		});
	}
});

onMounted(() => {
	nextTick(setupPage);
});

onBeforeUnmount(() => {
	sensors.value = [];
});
</script>
