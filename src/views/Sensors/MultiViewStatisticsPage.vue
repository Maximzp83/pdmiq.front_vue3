<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="sensorLoading"
			:itemsName="itemsName.one"
		/>

		<div
			:class="[
				'view-wrapper item-page-wrapper statistics-page specifications-block-wrapper',
				'multi-view-statistics',
			]"
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
						<div v-if="multiViewData" class="title page-title capitalize span-block">
							{{ multiViewData.name }}
						</div>
					</div>

					<div class="mcol-xs-12 mcol-sm-20 text-right ml-auto">
						<Datepicker
							className="no-min-width"
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
										class="inverted"
										:class="{ active: filters.measurement === item.id }"
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
				<div class="tab-container">
					<div
						v-for="(chart, idx) in multiViewChartsList"
						:key="`mv_chart-${chart.id}`"
						class="content-row"
					>
						<CommonChartItemWrapper
							:chartWrapperIdx="idx"
							chartFactoryContainerName="MultiViewChartFactoryContainer"
							chartFactoryName="MultiViewChart"
							:additionalProps="additionalProps"
							:dynamicProps="getChartDynamicProps(chart)"
							:buildChartsPayloadProps="getBuildChartPayloadProps(chart)"
							:setupChartsConfigsListSettings="getChartConfigsSetting(chart)"
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
			</div>
		</div>

		<el-dialog
			v-if="chartThresholdsDialogInit"
			v-model="showThresholdsDialog"
			center
			:title="tt('Alarms')"
			:append-to-body="true"
			class="dialog-decorate-header filled-header standard"
		>
			<GraphThresholdsFormWrapper
				:visible="showThresholdsDialog"
				:multiViewData="multiViewData"
				:thresholdsSetupData="showThresholdsDialog ? thresholdsSetupData : null"
				@event="handleEvent"
				@closeDialog="showThresholdsDialog = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Highcharts from '@/config/highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

import {
	datePickerAdditionalShortcuts,
	datePickerShortcuts,
	localeMonths,
	localeMonthsFull,
	weekdays,
} from '@/constants/date_time';
import {
	findItemBy,
	getDateRange,
	getTimeDifference,
	getYmdDateString,
} from '@/helpers';
import { initHighchartsModule } from '@/helpers/charts';
import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { metricSystemsList as getMetricSystemsList } from '@/modules/charts_factory/controllers/Sensor/enums';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useSensorsStore } from '@/stores/SensorsStore';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';
import EquipmentPictureBlock from './charts/EquipmentPictureBlock.vue';
import GraphThresholdsFormWrapper from './charts/MultiView/GraphThresholdsFormWrapper.vue';

initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);

const { tt } = Lang;

defineOptions({
	name: 'MultiViewStatisticsPage',
});

const props = defineProps({
	equipmentData: { type: Object, required: true },
	multiViewsList: { type: Array, default: () => [] },
});

const emit = defineEmits(['event']);
const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const sensorsStore = useSensorsStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);

const isTodayRangeClicked = ref(false);
const rangeWithTime = ref(false);
const pickedRange = ref({});
const sensorLoading = ref(false);
const chartThresholdsDialogInit = ref(false);
const showThresholdsDialog = ref(false);
const thresholdsSetupData = ref(null);

const metricSystemsList = computed(() => Object.freeze(getMetricSystemsList()));
const multiViewData = computed(() => {
	const multiViewId = +route.params.multiViewId || +route.params.id || route.params.id;
	return findItemBy('id', multiViewId, props.multiViewsList) || null;
});
const multiViewChartsList = computed(() =>
	multiViewData.value
		? Object.freeze(multiViewData.value.multi_view_graphs || [])
		: [],
);
const additionalProps = computed(() =>
	Object.freeze({
		customMock: true,
		chartWrapperClass: 'content-row',
		chartItemComponentClass: 'card',
		chartContainerClass: 'card-content',
		hcInstance: Highcharts,
		customChartHeader: {
			componentFileLoader: () => import('./charts/MultiView/MultiViewChartItemHeader.vue'),
		},
	}),
);
const pickerOptions = computed(() => {
	const timeRanges = ['1_hour', '3_hours', '12_hours'];
	const shortcuts = [
		...datePickerAdditionalShortcuts(),
		...datePickerShortcuts(),
	].map((shortcut) => ({
		...shortcut,
		text: shortcut.rangeName === 'today' ? 'Today (Live)' : shortcut.text,
		onClick: (picker) => {
			rangeWithTime.value = timeRanges.includes(shortcut.rangeName);
			setTimeout(() => {
				isTodayRangeClicked.value = shortcut.rangeName === 'today';
				picker.$emit(
					'pick',
					getDateRange(shortcut.rangeName, { todayEndsAtMidNight: 1 }),
				);
			}, 100);
		},
	}));

	return Object.freeze({
		shortcuts,
		onPick(range) {
			isTodayRangeClicked.value = false;
			pickedRange.value = range;
		},
		disabledDate() {
			return false;
		},
	});
});
const itemsName = computed(() => ({
	one: tt('Multi_View'),
	mult: tt('Multi_Views'),
}));
const navbarSettings = computed(() => {
	const settings = {
		showStandardNavItem: true,
		pageTitle: '<span><b>PdM</b>Matrix<sup>TM</sup></span>',
	};

	if (props.equipmentData) {
		settings.showPlantName = {
			name: props.equipmentData.plant_name,
		};
	}

	return Object.freeze(settings);
});

const getBuildChartPayloadProps = (chart) => Object.freeze({ graphItemData: chart });
const getChartConfigsSetting = (chart) => Object.freeze({ graph_items: chart.graph_items || [] });
const getChartDynamicProps = (chart) => ({
	graphItemData: chart,
	showThresholdsDialog: showThresholdsDialog.value,
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
	sensorsStore.set_statistics_filters({
		...filters.value,
		measurement: id,
	});
};
const setupInitialMeasurement = () => {
	const measurement = metricSystemsList.value.find(
		({ id }) => id === Number(filters.value.measurement),
	)?.id || metricSystemsList.value[0]?.id;

	if (measurement && filters.value.measurement !== measurement) {
		sensorsStore.set_statistics_filters({
			...filters.value,
			measurement,
		});
	}
};
const toggleThresholdsDialog = (payload) => {
	chartThresholdsDialogInit.value = true;
	thresholdsSetupData.value = payload;
	showThresholdsDialog.value = !showThresholdsDialog.value;
};
const handleChartContainerReady = () => {};
const chartLoadEvent = () => {};

const { handleEvent } = useEventHandler({
	toggleThresholdsDialog,
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

	setupInitialMeasurement();

	globalStore.setup_navbar(navbarSettings.value);
});
</script>
