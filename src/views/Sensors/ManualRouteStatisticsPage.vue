<template>
	<div
		class="view-wrapper item-page-wrapper statistics-page specifications-block-wrapper multi-view-statistics"
	>
		<div class="section-row">
			<div class="mrow flex wrap page-header align-center relative">
				<div class="images-part mcol-xs-12 mcol-sm-2">
					<EquipmentPictureBlock
						:equipmentData="equipmentData"
						@event="handleEvent"
					/>
				</div>

				<div class="mcol-xs-12 mcol-sm-2 mcol-lg-2 fluid flex align-center wrap">
					<div class="title page-title capitalize span-block">
						{{ tt('technology.manual_route') }}
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-auto text-right ml-auto">
					<Datepicker
						className=" "
						:value="filters.daterange"
						type="datetimerange"
						format="YYYY/MM/DD HH:mm"
						value-format="YYYY-MM-DD HH:mm:ss"
						:default-time="['00:00:00', '23:59:59']"
						:picker-options="pickerOptions"
						setupDaterangeFilter
						@input="handleDaterange"
					/>
				</div>

				<div class="mcol-xs-12 mcol-sm-auto">
					<div class="button-item chart-switcher text-right">
						<div class="relative flex">
							<el-button-group>
								<el-button
									v-for="item in metricSystemsList"
									:key="`metricSystem-${item.id}`"
									type="primary"
									native-type="button"
									:class="{ active: filters.measurement === item.id }"
									class="inverted"
									@click="switchMetricSystem(item)"
								>
									{{ item.name }}
								</el-button>
							</el-button-group>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="section-row tab-container reportBlock-tab show_tab">
			<div v-if="manualRouteSensors.length" class="tab-container">
				<div
					v-for="(metric, idx) in chartMetrics"
					:key="`manual-route-chart-${metric.id}-${manualRouteSensorsKey}`"
					class="content-row"
				>
					<CommonChartItemWrapper
						:chartWrapperIdx="idx"
						chartFactoryContainerName="ManualRouteChartFactoryContainer"
						chartFactoryName="ManualRouteChart"
						:additionalProps="additionalProps"
						:buildChartsPayloadProps="buildChartsPayloadProps"
						:setupChartsConfigsListSettings="getChartConfigSettings(metric)"
						:rootFilters="filters"
						@event="handleEvent"
					>
						<template #custom_mock>
							<div class="text-center card">
								<div class="card-content">
									{{ tt('phrases.Has_not_Statistics_for_this_range') }}...
								</div>
							</div>
						</template>
					</CommonChartItemWrapper>
				</div>
			</div>

			<div v-else class="text-center card">
				<div class="card-content">{{ tt('phrases.no_data') }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Highcharts from '@/config/highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

import { initHighchartsModule } from '@/helpers/charts';
import { getDateRange, getTimeDifference, getYmdDateString } from '@/helpers';
import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useAuthStore } from '@/stores/AuthStore';
import { DATASET } from '@/constants/global';
import {
	datePickerAdditionalShortcuts,
	datePickerShortcuts,
	localeMonths,
	localeMonthsFull,
	weekdays,
} from '@/constants/date_time';
import {
	MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES,
	manualRouteSensorParametersList,
	metricSystemsList as getMetricSystemsList,
} from '@/modules/charts_factory/controllers/Sensor/enums';

import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import EquipmentPictureBlock from './charts/EquipmentPictureBlock.vue';

initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);

defineOptions({
	name: 'ManualRouteStatisticsPage',
});

const props = defineProps({
	equipmentData: { type: Object, required: true },
});
const emit = defineEmits(['event']);

const { tt } = Lang;
const route = useRoute();
const sensorsStore = useSensorsStore();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);

const isTodayRangeClicked = ref(false);
const rangeWithTime = ref(false);
const pickedRange = ref({});

const metricSystemsList = computed(() => Object.freeze(getMetricSystemsList()));
const chartMetrics = computed(() => Object.freeze([
	manualRouteSensorParametersList(MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.VELOCITY),
	manualRouteSensorParametersList(
		MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.HIGH_FREQUENCY_ACCELERATION,
	),
]));
const manualRouteSensors = computed(() => Object.freeze(
	(props.equipmentData.dashboardSensors || []).filter(
		(sensor) => sensor.data_set === DATASET.MANUAL_ROUTE_FFT,
	),
));
const manualRouteSensorsKey = computed(() =>
	manualRouteSensors.value.map((sensor) => sensor.id).join('-'),
);
const buildChartsPayloadProps = computed(() => Object.freeze({
	manualRouteSensors: manualRouteSensors.value,
	sensorItem: manualRouteSensors.value[0],
	sensorType: 'manual_route',
}));
const additionalProps = computed(() => Object.freeze({
	hcInstance: Highcharts,
	customMock: true,
	chartWrapperClass: 'content-row',
	chartItemComponentClass: 'card',
	chartContainerClass: 'card-content',
	customChartHeader: {
		componentFileLoader: () => import('./charts/ManualRoute/ManualRouteChartItemHeader.vue'),
	},
	chartPointsEventsList: {
		openFFTCharts: {
			name: 'click',
			event: (event) => openFFTCharts(event),
		},
	},
}));
const pickerOptions = computed(() => {
	const timeRanges = ['1_hour', '3_hours', '12_hours'];
	const shortcuts = [...datePickerAdditionalShortcuts(), ...datePickerShortcuts()].map(
		(shortcut) => ({
			...shortcut,
			onClick: (picker) => {
				rangeWithTime.value = timeRanges.some(
					(rangeName) => rangeName === shortcut.rangeName,
				);
				setTimeout(() => {
					isTodayRangeClicked.value = shortcut.rangeName === 'today';
					picker.$emit(
						'pick',
						getDateRange(shortcut.rangeName, { todayEndsAtMidNight: 1 }),
					);
				}, 100);
			},
		}),
	);

	return Object.freeze({
		shortcuts,
		onPick: (range) => {
			isTodayRangeClicked.value = false;
			pickedRange.value = range;
		},
	});
});
const navbarSettings = computed(() => Object.freeze({
	showStandardNavItem: true,
	pageTitle: '<span><b>PdM</b>Matrix<sup>TM</sup></span>',
	showPlantName: { name: props.equipmentData.plant_name },
}));

const getChartConfigSettings = (metric) => Object.freeze({
	metricId: metric.id,
	sensors: manualRouteSensors.value,
});

const handleDaterange = (range) => {
	sensorsStore.set_statistics_filters({
		...filters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
		isLiveEnabled: isTodayRangeClicked.value,
	});
};

const switchMetricSystem = ({ id }) => {
	sensorsStore.set_statistics_filters({ ...filters.value, measurement: id });
};

const openFFTCharts = ({ point } = {}) => {
	const payload = point && (point.payload || point.options?.payload);
	if (!payload?.id || !payload.sensor_id) return;

	window.open(
		`${window.location.origin}/ncd/${payload.sensor_id}/fft/${payload.id}`,
		'_blank',
		'noopener',
	);
};

const handleChartContainerReady = () => {};
const chartLoadEvent = () => {};
const { handleEvent } = useEventHandler({
	handleChartContainerReady,
	chartLoadEvent,
}, emit);

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

	if (filters.value.daterange?.length && !authStore.isIndustrialMatrix) {
		const { days } = getTimeDifference({
			from: filters.value.daterange[0],
			to: filters.value.daterange[1],
		});

		if (days > 30) {
			sensorsStore.set_statistics_filters({
				...filters.value,
				daterange: getDateRange('last_7_days', {
					getDateString: true,
					withTime: true,
				}),
				isLiveEnabled: false,
			});
		}
	}

	const { dateStart, dateFinish } = route.query;
	if (dateStart && dateFinish) {
		sensorsStore.set_statistics_filters({
			...filters.value,
			daterange: [
				getYmdDateString({ ms: dateStart, withTime: true }),
				getYmdDateString({ ms: dateFinish, withTime: true }),
			],
			isLiveEnabled: false,
		});
	}

	if (!filters.value.measurement) {
		sensorsStore.set_statistics_filters({
			...filters.value,
			measurement: metricSystemsList.value[0].id,
		});
	}

	globalStore.setup_navbar(navbarSettings.value);
});

onBeforeUnmount(() => globalStore.setup_navbar({}));
</script>
