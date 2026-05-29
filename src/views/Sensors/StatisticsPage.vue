<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="tt('Statistics')" />

		<div class="view-wrapper statistics-page-wrapper">
			<div class="mcontainer">
				<div v-if="sensorData" class="view-content-card">
					<div class="section-row flex wrap mrow align-center">
						<div class="mcol-xs-12 mcol-sm-5">
							<div class="page-title bold">{{ sensorTitle }}</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-7">
							<div class="flex wrap justify-end">
								<Datepicker
									v-model="filters.daterange"
									type="datetimerange"
									:placeholder="tt('date')"
									@change="applyFilters"
								/>
							</div>
						</div>
					</div>

					<component
						:is="filterComponent"
						v-if="filterComponent"
						:sensorData="sensorData"
						:sensors="[sensorData]"
						:equipmentData="equipmentData"
						:currentSensorType="currentSensorType"
						:showHistory="showHistory"
						:joinChartsBy="joinChartsBy"
						:itemsLoading="itemLoading"
						:isCompare="isCompare"
						:enableFFT="enableFFT"
						:statsThresholdsActive="statsThresholdsActive"
						:splitNCDCharts="splitNCDCharts"
						:splitChartsButtonEnabled="splitChartsButtonEnabled"
						@event="handleEvent"
					/>

					<PossibleProblemsBlock
						v-if="sensorParamsForSetupProblems.length"
						:currentSensor="sensorData"
						:sensorParamsForSetupProblems="sensorParamsForSetupProblems"
						:daterange="filters.daterange"
						:isNCDSensor="isNCDSensor"
					/>

					<ChartsListWrapper
						ref="chartsListWrapperRef"
						:rootFilters="filters"
						:sensorData="sensorData"
						:joinChartsBy="joinChartsBy"
						:additionalProps="additionalProps"
						:activeAxis="activeAxis"
						:enableAxisSelector="enableAxisSelector"
						:getParamsByIds="getParamsByIds"
						:chartsContainerIdx="0"
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Highcharts from 'highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

import { Lang } from '@/localization';
import { useSensors } from '@/composables/useSensors';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensorsStore } from '@/stores/SensorsStore';
import { SENSOR_TYPES } from '@/constants/global';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import ChartsListWrapper from './charts/ChartsListWrapper.vue';
import PossibleProblemsBlock from './PossibleProblemsBlock.vue';

stockInit(Highcharts);
boost(Highcharts);

const { tt } = Lang;
const route = useRoute();
const sensorsStore = useSensorsStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);
const { fetchSensor } = useSensors();

defineOptions({
	name: 'StatisticsPage',
});

const chartsListWrapperRef = ref(null);
const sensorData = ref(null);
const itemLoading = ref(false);
const showHistory = ref(false);
const statsThresholdsActive = ref(false);
const splitNCDCharts = ref(false);
const joinChartsBy = ref({});
const activeAxis = ref(null);
const enableAxisSelector = ref(false);
const getParamsByIds = ref([]);

const { currentSensorType } = useSensorType({ currentSensorTypeData: sensorData });

const sensorTitle = computed(() => sensorData.value?.name || `${tt('Sensor')} ${route.params.id}`);
const equipmentData = computed(() => sensorData.value?.equipment || {});
const isCompare = computed(() => !!route.query.compare);
const enableFFT = computed(() => !!sensorData.value?.has_fft || currentSensorType.value.isNCDTempVibe || currentSensorType.value.isBannerTempVibe2);
const isNCDSensor = computed(() =>
	+sensorData.value?.type === SENSOR_TYPES.NCD ||
	currentSensorType.value.isNCDTempVibe ||
	currentSensorType.value.isNCDWiredTempVibe ||
	currentSensorType.value.isNCDTempVibeCurr,
);
const splitChartsButtonEnabled = computed(() => isNCDSensor.value);
const sensorParamsForSetupProblems = computed(() =>
	chartsListWrapperRef.value?.chartsConfigsFullList?.flatMap((chart) => chart.requestsList || []) || [],
);
const additionalProps = computed(() => Object.freeze({
	hcInstance: Highcharts,
	showHistory: showHistory.value,
	statsThresholdsActive: statsThresholdsActive.value,
	accessToThresholds: true,
	showToggleNavigator: true,
}));
const filterComponent = computed(() => {
	if (!sensorData.value) return null;
	if (currentSensorType.value.isUltrasound) {
		return defineAsyncComponent(() => import('./FilterBlock/UltrasoundFilterBlock.vue'));
	}
	if (currentSensorType.value.isCustomPDM) {
		return defineAsyncComponent(() => import('./FilterBlock/CustomPDMFilterBlock.vue'));
	}
	return defineAsyncComponent(() => import('./FilterBlock/BannerFilterBlock.vue'));
});

const applyFilters = () => {
	sensorsStore.set_statistics_filters({ ...filters.value });
};

const toggleHistory = () => {
	showHistory.value = !showHistory.value;
};
const toggleStatsThresholds = () => {
	statsThresholdsActive.value = !statsThresholdsActive.value;
};
const handleJoinCharts = (prop) => {
	joinChartsBy.value = joinChartsBy.value.prop === prop ? {} : { prop };
};
const handleSplitNCDCharts = () => {
	splitNCDCharts.value = !splitNCDCharts.value;
	joinChartsBy.value = splitNCDCharts.value ? { prop: 'split' } : {};
};
const openFFTCharts = (data) => {
	const query = new URLSearchParams({
		...route.query,
		metric: data?.id || data?.parameter_type || '',
	}).toString();
	window.open(`/sensors/${route.params.id}/fft${query ? `?${query}` : ''}`, '_blank');
};

const { handleEvent } = useEventHandler({
	toggleHistory,
	toggleStatsThresholds,
	handleJoinCharts,
	handleSplitNCDCharts,
	openFFTCharts,
}, null);

const fetchPageData = () => {
	itemLoading.value = true;
	fetchSensor({ itemId: route.params.id })
		.then(({ value }) => {
			sensorData.value = value || null;
			activeAxis.value = value?.ncd_active_axial_axis || null;
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

watch(
	() => route.params.id,
	() => fetchPageData(),
);

onMounted(fetchPageData);
</script>
