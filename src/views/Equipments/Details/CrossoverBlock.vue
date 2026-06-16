<template>
	<div class="crossover-block">
		<div class="card relative vertical-fluid">
			<div class="card-header">
				<div class="title semi-bold uppercase">{{ title }}</div>
			</div>

			<div class="card-content relative">
				<SimpleSpinner :active="crossoverLoading" />

				<ul v-if="!disableCrossoverBlock" class="info-list crossover">
					<li v-for="item in crossoverList" :key="`cross-${item.label}`">
						<span class="quantity pointer" @click="handleShowAnaloguesList(item)">
							{{ item.quantity }}
						</span>
						<span class="text capitalize-first">{{ item.label }}</span>
					</li>
				</ul>

				<div v-else class="text-center semi-bold">
					{{ tt('phrases.data_missing_for_crossovers') }}
				</div>
			</div>
		</div>

		<el-dialog
			v-model="showAnalogues"
			append-to-body
			center
			class="1small dialog-decorate-header"
			:title="analoguesTitle"
		>
			<AnaloguesList
				:itemsList="selectedCrossoverList"
				:visible="showAnalogues"
				preventSetNavbar
				@closeDialog="showAnalogues = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import AnaloguesList from './AnaloguesList.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentCrossoverBlock' });

const props = defineProps({
	crossoverList: { type: Array, default: () => [] },
	crossoverLoading: Boolean,
	equipmentData: { type: Object, default: () => ({}) },
	equipmentTypeName: { type: String, default: '' },
});

const showAnalogues = ref(false);
const selectedCrossoverList = ref([]);
const analoguesTitle = ref('');

const title = computed(() => `${tt('crossover')} ${props.equipmentTypeName || ''}`);
const disableCrossoverBlock = computed(
	() =>
		!!props.equipmentData.brand_model_is_crossover_excluded ||
		!!props.equipmentData.brand_is_crossover_excluded,
);

const handleShowAnaloguesList = ({ label, list }) => {
	if (list?.length) {
		analoguesTitle.value = `${label}`.toUpperCase();
		selectedCrossoverList.value = list;
		showAnalogues.value = true;
	}
};
</script>
