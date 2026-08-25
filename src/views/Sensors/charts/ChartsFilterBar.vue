<template>
	<div class="button-item charts-filter-bar">
		<el-popover
			v-model:visible="chartFiltersPopoverShow"
			placement="bottom-end"
			popper-class="charts-filters-popover"
			trigger="manual"
			:width="210"
		>
			<template #reference>
				<el-button
					type="primary"
					native-type="button"
					:class="['chart-filter-selector', { active: chartFiltersPopoverShow }]"
					@click="chartFiltersPopoverShow = !chartFiltersPopoverShow"
				>
					<div>
						<span class="text">{{ activeFilters.text }}</span>
						<i class="icomoon icon-path_2 icon"></i>
					</div>
				</el-button>
			</template>

			<form class="popover-content" @submit.prevent="applyChartsFilters">
				<div class="filter-options-list">
					<FilterOption
						v-for="(item, idx) in sensorParameters"
						:key="`sensorParam_id-${item.id}`"
						:ref="(el) => setSubItemRef('FilterOption', el, idx)"
						:optionData="item"
						:filterData="filters?.[`chart-${item.id}`]"
					/>
				</div>

				<div class="footer-block">
					<el-button
						type="primary"
						native-type="submit"
						:loading="isLoading"
					>
						{{ tt('Apply') }}
					</el-button>
				</div>
			</form>
		</el-popover>

		<el-button
			v-show="activeFilters.count"
			:disabled="isLoading"
			native-type="button"
			class="clearFilter-button icon disable-flex"
			@click="clearChartsFilter"
		>
			<i class="icomoon icon-cross"></i>
		</el-button>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { useNotify } from '@/composables/useNotify';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useSensorsStore } from '@/stores/SensorsStore';

import FilterOption from './FilterOption.vue';

const { tt } = Lang;
const { Notify } = useNotify();

defineOptions({
	name: 'ChartsFilterBar',
});

const props = defineProps({
	sensorParametersList: { type: Array, default: () => [] },
	isLoading: Boolean,
});

const sensorsStore = useSensorsStore();
const { charts_filters: filters } = storeToRefs(sensorsStore);
const refsMap = reactive({});
const chartFiltersPopoverShow = ref(false);

const subItemsSettings = computed(() =>
	Object.freeze([{ ref: 'FilterOption', returnArray: true }]),
);
const sensorParameters = computed(() =>
	Array.isArray(props.sensorParametersList) ? props.sensorParametersList : [],
);

const activeFilters = computed(() => {
	let text = '';
	let count = 0;

	sensorParameters.value.forEach((param) => {
		const filter = filters.value?.[`chart-${param.id}`];
		if (filter?.y_min) {
			text += `${param.name}, `;
			count += 1;
		}
	});

	if (text.length > 1) {
		text = text.slice(0, -2);
	}

	return {
		text: text.length > 0 ? text : tt('Filter'),
		count,
	};
});

const {
	collectDataFromSubItems,
	operateRefs,
	setSubItemRef,
} = useSubItemsList({ refsMap });

const clearChartsFilter = () => {
	subItemsSettings.value.forEach((settingsItem) => {
		operateRefs({
			settingsItem,
			operation: (Instance) => {
				Instance.clearFilter();
			},
		});
	});
	applyChartsFilters();
};

const applyChartsFilters = () => {
	const collectedFilters = collectDataFromSubItems(subItemsSettings.value);

	if (collectedFilters.result?.every((item) => item.isValid)) {
		const newFilters = { ...filters.value };
		collectedFilters.result.forEach((item) => {
			newFilters[`chart-${item.sensorParameterId}`] = { y_min: item.value };
		});
		sensorsStore.set_charts_filters(newFilters);
	} else {
		Notify({
			type: 'warning',
			message: tt('phrases.all_values_must_be_a_number'),
		});
	}
};

const closePopover = () => {
	chartFiltersPopoverShow.value = false;
};

defineExpose({ closePopover });
</script>
