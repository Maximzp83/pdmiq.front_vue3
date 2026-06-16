<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading || fftLoading" :itemsName="tt('FFT')" />

		<div class="view-wrapper fft-statistics-page-wrapper">
			<div class="mcontainer">
				<div v-if="sensorData" class="view-content-card">
					<div class="section-row flex wrap mrow align-center">
						<div class="mcol-xs-12 mcol-sm-5">
							<div class="page-title bold">{{ sensorTitle }}</div>
							<div v-if="equipmentRPM" class="rpm-block content-row">
								{{ `${tt('rpm')}: ${equipmentRPM}` }}
							</div>
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

					<AnalysisFFTContainer
						v-if="currentFFTItem && equipmentData"
						:fftItem="currentFFTItem"
						:itemData="equipmentData"
						:sensorData="sensorData"
						:selectedChildComponentIds="selectedChildComponentIds"
						:rootFilters="filters"
						@event="handleEvent"
					/>

					<FFTChartsListWrapper
						v-if="currentFFTItem"
						ref="fftChartsListWrapperRef"
						:rootFilters="filters"
						:sensorData="sensorData"
						:additionalProps="additionalProps"
						:activeAxis="activeAxis"
						:sensorId="sensorData.id"
						:fftId="currentFFTItem.id"
						:measurement="filters.measurement"
						:splitCharts="splitCharts"
						:prevFFTItems="prevFFTItems"
						:currentFFTItem="currentFFTItem"
						:getParamsByIds="getParamsByIds"
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Highcharts from 'highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
import draggablePoints from 'highcharts/modules/draggable-points';
import highchartsMore from 'highcharts/highcharts-more';
import annotations from 'highcharts/modules/annotations';

import { initHighchartsModule } from '@/helpers/charts';
import { Lang } from '@/localization';
import { getRoundedValue } from '@/helpers';
import { useSensors } from '@/composables/useSensors';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import AnalysisFFTContainer from './AnalysisFFT/AnalysisFFTContainer.vue';
import FFTChartsListWrapper from './charts/fft/FFTChartsListWrapper.vue';

initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);
initHighchartsModule(draggablePoints, Highcharts);
initHighchartsModule(highchartsMore, Highcharts);
initHighchartsModule(annotations, Highcharts);

const { tt } = Lang;
const route = useRoute();
const sensorsStore = useSensorsStore();
const { fft_statistics_filters: filters } = storeToRefs(sensorsStore);
const { fetchSensor, fetchNcdFft } = useSensors();

defineOptions({
	name: 'FFTStatisticsPage',
});

const sensorData = ref(null);
const currentFFTItem = ref(null);
const prevFFTItems = ref([]);
const itemLoading = ref(false);
const fftLoading = ref(false);
const splitCharts = ref(false);
const activeAxis = ref(null);
const selectedChildComponentIds = ref([]);

const sensorTitle = computed(() => sensorData.value?.name || `${tt('Sensor')} ${route.params.id}`);
const equipmentData = computed(() => sensorData.value?.equipment || {});
const equipmentRPM = computed(() => {
	const rpm = currentFFTItem.value?.equipment_rpm || equipmentData.value?.equipment_rpm;
	if (!rpm) return '';
	if (filters.value.measurement === 'hz') {
		return `${getRoundedValue(+rpm / 60, 0, 2)} Hz`;
	}
	return `${rpm} CPM`;
});
const getParamsByIds = computed(() => {
	if (Array.isArray(route.query.params)) return route.query.params.map(Number);
	if (route.query.param) return [Number(route.query.param)];
	return [];
});
const additionalProps = computed(() => Object.freeze({
	hcInstance: Highcharts,
	equipmentData: equipmentData.value,
	selectedChildComponents: equipmentData.value.child_components || [],
}));

const applyFilters = () => {
	sensorsStore.set_fft_statistics_filters({ ...filters.value });
};
const toggleFFTAnalysisRule = ({ rule }) => {
	const id = rule.id || rule.original_rule_id;
	if (selectedChildComponentIds.value.includes(id)) {
		selectedChildComponentIds.value = selectedChildComponentIds.value.filter((item) => item !== id);
	} else {
		selectedChildComponentIds.value = [...selectedChildComponentIds.value, id];
	}
};
const { handleEvent } = useEventHandler({
	toggleFFTAnalysisRule,
}, null);

const fetchFftData = () => {
	if (!route.params.id) return;
	fftLoading.value = true;
	fetchNcdFft({
		sensorId: route.params.id,
		urlPostfix: route.query.fftId ? `/${route.query.fftId}` : '',
		params: { ...filters.value },
	})
		.then(({ value }) => {
			const list = Array.isArray(value) ? value : value?.items || value?.data || [];
			currentFFTItem.value = Array.isArray(list) ? list[0] || null : value;
			prevFFTItems.value = Array.isArray(list) ? list.slice(1) : [];
			activeAxis.value = currentFFTItem.value?.active_axis || sensorData.value?.ncd_active_axial_axis || null;
		})
		.finally(() => {
			fftLoading.value = false;
		});
};
const fetchPageData = () => {
	itemLoading.value = true;
	fetchSensor({ itemId: route.params.id })
		.then(({ value }) => {
			sensorData.value = value || null;
			return fetchFftData();
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
