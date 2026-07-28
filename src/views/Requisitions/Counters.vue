<template>
	<div class="counters-wrapper">
		<div class="counters-row mrow flex wrap">
			<CounterItem
				v-for="item in countersList"
				:key="`counter-${item.title}`"
				class="mcol-xs-12 mcol-sm-4 mcol-lg-20"
				:counterData="item"
				:filters="filters"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { REQUISITION_STATUSES_TYPES, requisitionStatusesList } from '@/constants/global';
import { prepareRangeParams } from '@/helpers';
import { useGlobalStore } from '@/stores/GlobalStore';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import CounterItem from './CounterItem.vue';

defineOptions({ name: 'RequisitionCounters' });

const props = defineProps({
	filters: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { fetchRequisitionAnalytics } = usePlantRequisitions();

const analyticsData = ref({});
const analyticsLoading = ref(false);

const countersList = computed(() => {
	const data = analyticsData.value || {};
	const list = [
		{
			title: 'All',
			hours: data.total_time_work_orders,
			money: `${data.total_costs_work_orders || 0} $`,
			statusColor: '#BF1E2E',
			count: data.total_work_orders,
		},
	];
	requisitionStatusesList().forEach((statusItem) => {
		list.push({
			title: statusItem.label,
			statusColor: statusItem.color,
			status: statusItem.id,
			count:
				statusItem.id === REQUISITION_STATUSES_TYPES.PENDING
					? (data.total_work_orders || 0) -
						(data.total_approved_work_orders || 0) -
						(data.total_completed_work_orders || 0) -
						(data.total_denied_work_orders || 0)
					: data[statusItem.statKey],
		});
	});
	return Object.freeze(list);
});

const prepareFilters = (filters = {}) => {
	let nextFilters = { ...props.filters, ...globalFilters.value, ...filters };
	if (nextFilters.daterange?.length) {
		nextFilters = { ...nextFilters, ...prepareRangeParams(nextFilters.daterange) };
		delete nextFilters.daterange;
	}
	return nextFilters;
};
const fetchAnalytics = (filters = {}) => {
	analyticsLoading.value = true;
	return fetchRequisitionAnalytics(prepareFilters(filters))
		.then(({ value }) => {
			analyticsData.value = value || {};
		})
		.finally(() => {
			analyticsLoading.value = false;
		});
};
const setFilters = (payload) => emit('event', 'setFilters', payload);
const { handleEvent } = useEventHandler({ setFilters });

watch(() => props.filters?.daterange, (daterange) => fetchAnalytics({ daterange }), { deep: true });
watch(() => globalFilters.value?.plantId, (plantId) => fetchAnalytics({ plantId }));

onBeforeMount(() => fetchAnalytics());
</script>
