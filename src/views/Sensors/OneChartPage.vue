<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="tt('chart')" />

		<div class="view-wrapper one-chart-page-wrapper">
			<div class="mcontainer">
				<div v-if="sensorData" class="view-content-card">
					<div class="section-row flex wrap mrow align-center">
						<div class="mcol-xs-12 mcol-sm-6">
							<div class="page-title bold">{{ sensorTitle }}</div>
						</div>
						<div class="mcol-xs-12 mcol-sm-6">
							<div class="flex justify-end">
								<Datepicker
									v-model="filters.daterange"
									type="datetimerange"
									:placeholder="tt('date')"
									@change="applyFilters"
								/>
							</div>
						</div>
					</div>

					<ChartsListWrapper
						ref="chartsListWrapperRef"
						:rootFilters="filters"
						:sensorData="sensorData"
						:joinChartsBy="{}"
						:additionalProps="additionalProps"
						:getParamsByIds="getParamsByIds"
						oneChartOnly
						:chartsContainerIdx="1"
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

import { Lang } from '@/localization';
import { useSensors } from '@/composables/useSensors';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import ChartsListWrapper from './charts/ChartsListWrapper.vue';

stockInit(Highcharts);
boost(Highcharts);

const { tt } = Lang;
const route = useRoute();
const sensorsStore = useSensorsStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);
const { fetchSensor } = useSensors();

defineOptions({
	name: 'OneChartPage',
});

const sensorData = ref(null);
const itemLoading = ref(false);

const sensorTitle = computed(() => sensorData.value?.name || `${tt('Sensor')} ${route.params.id}`);
const getParamsByIds = computed(() => {
	if (Array.isArray(route.query.params)) return route.query.params.map(Number);
	if (route.query.param) return [Number(route.query.param)];
	if (route.query.parameter) return [Number(route.query.parameter)];
	return [];
});
const additionalProps = computed(() => Object.freeze({
	hcInstance: Highcharts,
	oneChartOnly: true,
	hideProblems: true,
	showToggleNavigator: true,
	accessToThresholds: true,
}));

const applyFilters = () => {
	sensorsStore.set_statistics_filters({ ...filters.value });
};
const { handleEvent } = useEventHandler({}, null);

const fetchPageData = () => {
	itemLoading.value = true;
	fetchSensor({ itemId: route.params.id })
		.then(({ value }) => {
			sensorData.value = value || null;
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
