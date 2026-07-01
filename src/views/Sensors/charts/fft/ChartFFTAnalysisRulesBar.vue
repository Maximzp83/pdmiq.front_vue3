<template>
	<div class="chart-actions-block fftAnalysisBar">
		<div class="flex wrap mrow medium-padding align-center">
			<div class="semi-bold">{{ barTitle }}</div>
			<div
				v-for="(item, idx) in rulesList"
				:key="`button-${item.id}`"
				@click="addAnalysisRuleToSelected(item)"
			>
				<AnalysisRuleItem
					:ref="(el) => setRuleRef(el, idx)"
					:crossoverRulesList="componentItem.crossoverRulesStore?.[item.original_rule_id]"
					:class="[{ isActive: item.isActive }]"
					:style="{ borderColor: item.borderColor }"
					:item-data="item"
					:item-index="idx"
					:savingInProgress="savingInProgress"
					fromFFTPage
					insideChartAnalysisRulesBar
					@save="validateRuleItem(idx)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { cloneDeep, findItemBy } from '@/helpers';
import { useSensors } from '@/composables/useSensors';

import AnalysisRuleItem from '@/views/Equipments/AnalysisRuleItem.vue';

defineOptions({
	name: 'ChartFFTAnalysisRulesBar',
});

const props = defineProps({
	componentItem: { type: Object, required: true },
	equipmentData: { type: Object, required: true },
	currentFFTItem: { type: Object, default: null },
	sensorId: { type: Number, required: true },
	selectedAnalysisRules: { type: Array, default: () => [] },
});

const emit = defineEmits(['event']);
const {
	saveFftVibrationAnalysisRuleOverride,
	deleteFftVibrationAnalysisRuleOverride,
} = useSensors();

const savingInProgress = ref(false);
const ruleRefs = ref([]);

const rulesList = computed(() => {
	if (!props.componentItem.vibration_analysis_rules) return [];

	return props.componentItem.vibration_analysis_rules
		.filter((item) => item.custom_value || item.option_value_id)
		.map((item) => ({
			...item,
			isActive: props.selectedAnalysisRules.some((selectedRule) => selectedRule.id === item.id),
			borderColor: item.color,
		}));
});
const barTitle = computed(() => {
	const { original_component } = props.componentItem;
	if (!original_component) return '';

	let title = original_component.name;
	if (original_component.child_types) {
		original_component.child_types.forEach((typeItem, idx) => {
			title += idx ? '/' : ' ';
			title += ` ${typeItem.name}`;
		});
	}
	return title;
});

const setRuleRef = (el, idx) => {
	if (el) ruleRefs.value[idx] = el;
};
const event = (name, data) => {
	emit('event', name, data);
};
const addAnalysisRuleToSelected = (rule) => {
	event('addAnalysisRuleToSelected', rule);
};
const validateRuleItem = (idx) => {
	const ruleRef = ruleRefs.value[idx];
	if (!ruleRef?.validateItemForm?.()) return false;

	handleSaveRuleItem(ruleRef.collectData?.());
	return true;
};
const handleSaveRuleItem = (currentRuleData) => {
	if (!currentRuleData || !props.currentFFTItem) return;

	const rule = findItemBy('original_rule_id', currentRuleData.original_rule_id, rulesList.value);
	if (!rule) return;

	const harmonics = currentRuleData.harmonics != null ? `${currentRuleData.harmonics}`.trim() : '';
	const shouldDeleteOverride = !harmonics;
	const payload = {
		sensorId: props.sensorId,
		fftId: props.currentFFTItem.id,
		originalRuleId: rule.original_rule_id,
	};

	const action = shouldDeleteOverride
		? deleteFftVibrationAnalysisRuleOverride(payload)
		: saveFftVibrationAnalysisRuleOverride({
				...payload,
				data: {
					original_rule_id: rule.original_rule_id,
					harmonics,
				},
			});

	savingInProgress.value = true;
	action
		.then(() => {
			emitUpdatedFFTItem({
				originalRuleId: rule.original_rule_id,
				harmonics,
			});
			ruleRefs.value.forEach((refItem) => {
				if (refItem) refItem.showAnalysisRuleFormDialog = false;
			});
		})
		.finally(() => {
			savingInProgress.value = false;
		});
};
const emitUpdatedFFTItem = ({ originalRuleId, harmonics }) => {
	const fftItem = cloneDeep(props.currentFFTItem);
	fftItem.vibration_analysis_rules = fftItem.vibration_analysis_rules || [];

	const { index } = findItemBy(
		'original_rule_id',
		originalRuleId,
		fftItem.vibration_analysis_rules,
		{ returnIndex: true },
	);

	if (index == null) {
		fftItem.vibration_analysis_rules.push({
			original_rule_id: originalRuleId,
			harmonics,
		});
	} else {
		fftItem.vibration_analysis_rules[index] = {
			original_rule_id: originalRuleId,
			harmonics,
		};
	}

	emit('event', {
		eventName: 'updateEquipmentAndFFT',
		data: {
			fftItem,
			updateVibrationAnalysisRules: true,
			skipFFTReload: true,
		},
		onward: true,
	});
};
</script>
