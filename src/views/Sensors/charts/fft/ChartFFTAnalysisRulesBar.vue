<template>
	<div class="chart-fft-analysis-rules-bar">
		<el-button
			v-for="rule in rules"
			:key="`analysis-rule-${rule.id || rule.original_rule_id}`"
			type=""
			native-type="button"
			:class="['item-action-button capitalize secondary', { active: isSelected(rule) }]"
			:style="{ borderColor: rule.color }"
			@click="toggleRule(rule)"
		>
			<span>{{ rule.name || rule.original_rule?.name || tt('Rule') }}</span>
		</el-button>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'ChartFFTAnalysisRulesBar',
});

const props = defineProps({
	componentItem: { type: Object, default: () => ({}) },
	equipmentData: { type: Object, default: () => ({}) },
	currentFFTItem: { type: Object, default: () => ({}) },
	sensorId: Number,
	selectedAnalysisRules: { type: Array, default: () => [] },
});

const emit = defineEmits(['event']);

const rules = computed(() => props.componentItem.vibration_analysis_rules || []);
const ruleKey = (rule) => rule.id || rule.original_rule_id;
const isSelected = (rule) => props.selectedAnalysisRules.includes(ruleKey(rule));

const toggleRule = (rule) => {
	emit('event', {
		eventName: 'toggleFFTAnalysisRule',
		data: {
			rule,
			componentItem: props.componentItem,
			equipmentData: props.equipmentData,
			currentFFTItem: props.currentFFTItem,
			sensorId: props.sensorId,
		},
		onward: true,
	});
};
</script>
