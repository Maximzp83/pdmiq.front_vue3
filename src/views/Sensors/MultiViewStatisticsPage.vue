<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="tt('Statistics')" />

		<div class="view-wrapper multiview-statistics-page-wrapper">
			<div class="mcontainer">
				<div class="section-row flex wrap mrow align-center">
					<div class="mcol-xs-12 mcol-sm-6">
						<div class="page-title bold">{{ tt('Statistics') }}</div>
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

				<div class="charts-list">
					<div
						v-for="(sensor, idx) in sensorsList"
						:key="`sensor-chart-${sensor.id}`"
						class="chart-container-wrapper content-row"
					>
						<ChartsListWrapper
							:rootFilters="filters"
							:sensorData="sensor"
							:joinChartsBy="{}"
							:additionalProps="additionalProps"
							:chartsContainerIdx="idx"
							@event="handleEvent"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Highcharts from 'highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

import { initHighchartsModule } from '@/helpers/charts';
import { Lang } from '@/localization';
import { useSensors } from '@/composables/useSensors';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import ChartsListWrapper from './charts/ChartsListWrapper.vue';

initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);

const { tt } = Lang;
const route = useRoute();
const sensorsStore = useSensorsStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);
const { fetchSensor } = useSensors();

defineOptions({
	name: 'MultiViewStatisticsPage',
});

const props = defineProps({
	multiViewsList: { type: Array, default: () => [] },
});

const sensorsList = ref([]);
const itemLoading = ref(false);

const sensorIds = computed(() => {
	if (route.params.multiViewId && props.multiViewsList.length) {
		const multiView = props.multiViewsList.find((item) => item.id == route.params.multiViewId);
		const graphItems = (multiView?.multi_view_graphs || []).flatMap((graph) => graph.graph_items || []);
		return [...new Set(graphItems.map((item) => item.sensor_id).filter(Boolean))];
	}

	const ids = route.query.ids || route.params.sensorIds || route.params.id || '';
	if (Array.isArray(ids)) return ids;
	return String(ids).split(',').filter(Boolean);
});
const additionalProps = computed(() => Object.freeze({
	hcInstance: Highcharts,
	isCompare: true,
	hideProblems: true,
	hideExportButton: true,
}));

const applyFilters = () => {
	sensorsStore.set_statistics_filters({ ...filters.value });
};
const { handleEvent } = useEventHandler({}, null);

const fetchPageData = () => {
	itemLoading.value = true;
	Promise.all(sensorIds.value.map((id) => fetchSensor({ itemId: id }).then(({ value }) => value)))
		.then((list) => {
			sensorsList.value = list.filter(Boolean);
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

onMounted(fetchPageData);
</script>
