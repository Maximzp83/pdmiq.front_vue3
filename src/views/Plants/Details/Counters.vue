<template>
	<div class="card block-item">
		<div :class="['card-header flex align-center', standardIconBlock ? 'filled' : 'filled_2']">
			<i v-if="standardIconBlock" class="icomoon icon-lab_panel"></i>
			<div class="title semi-bold uppercase">{{ tt('Equipments') }}</div>
		</div>

		<div class="card-content">
			<div v-if="countersList.length" class="relative counters-list">
				<SimpleSpinner :active="countersLoading" />
				<div class="mrow flex wrap">
					<CounterItem
						v-for="item in countersList"
						:key="`counter-${item.title}`"
						:counterData="item"
						:disableViewAll="disableViewAll"
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { useGlobalStore } from '@/stores/GlobalStore';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import CounterItem from './CounterItem.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'PlantCounters',
});

const props = defineProps({
	additionalModalSettings: { type: Object, default: () => ({}) },
	disableViewAll: Boolean,
	plantId: { type: [Number, String, null], default: null },
	companyId: { type: [Number, String, null], default: null },
	standardIconBlock: Boolean,
});

const emit = defineEmits(['event']);

const globalStore = useGlobalStore();
const countersLoading = ref(false);
const countersList = ref([
	{ title: 'Utilities', itemName: 'Utility', instance: 'ProductionLines', iconName: 'production_lines', path: 'utilities', count: 0 },
	{ title: 'ProdLines', itemName: 'Production Line', instance: 'ProductionLines', iconName: 'production_lines', path: 'production-lines', count: 0 },
	{ title: 'Machines', itemName: 'Machine', instance: 'Machines', iconName: 'machines', path: 'machines', count: 0 },
	{ title: 'Assets', itemName: 'Asset', instance: 'Assets', iconName: 'assets', path: 'assets', count: 0 },
	{ title: 'Items', itemName: 'Item', instance: 'Equipments', iconName: 'equipments', path: 'equipments', count: 0 },
]);

const effectivePlantId = computed(() => {
	if (props.companyId) return null;
	return props.plantId || globalStore.globalFilters?.plantId || null;
});

const normalizeCounters = (rawList = []) => {
	const map = new Map();
	rawList.forEach((item) => {
		if (item?.title) map.set(String(item.title).toLowerCase(), Number(item.count) || 0);
		if (item?.name) map.set(String(item.name).toLowerCase(), Number(item.count) || 0);
	});
	return countersList.value.map((item) => {
		const key = String(item.title).toLowerCase();
		return { ...item, count: map.get(key) ?? item.count ?? 0 };
	});
};

const fetchCounters = async () => {
	countersLoading.value = true;
	try {
		const { value } = await api_request.get('/dashboard/counters', {
			params: {
				companyId: props.companyId || undefined,
				plantId: effectivePlantId.value || undefined,
			},
			prepareData: 'prepareCountersData',
			notNotify: true,
		});
		if (Array.isArray(value)) {
			countersList.value = value.some((item) => item?.count)
				? value
				: normalizeCounters(value);
		}
	} catch (error) {
		console.warn(error);
	} finally {
		countersLoading.value = false;
	}
};

const { handleEvent } = useEventHandler({}, emit);

watch(
	() => [effectivePlantId.value, props.companyId],
	() => {
		fetchCounters();
	}
);

watch(
	() => globalStore.updateCounters,
	(update) => {
		if (update) {
			fetchCounters();
			globalStore.set_global_state({ stateProp: 'updateCounters', value: false });
		}
	}
);

onMounted(() => {
	fetchCounters();
});
</script>
