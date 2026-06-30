<template>
	<div
		v-if="isRebaseline || is_high_speed || (problems.length && !hideProblems) || !hideExportButton || showToggleNavigator"
		class="buttons-container flex"
	>
		<div v-if="isRebaseline" class="header-item rebase-line-wrapper">
			<span class="rebase-wheel animate">
				<img class="suffix-icon" :src="rebase_wheel" />
			</span>
			<span class="rebase-lines">
				<img class="suffix-icon" :src="rebase_lines" />
			</span>
		</div>

		<div v-if="is_high_speed" class="header-item">
			<div class="high-speed-icon-container">
				<i class="icomoon icon-high-speed" />
			</div>
		</div>

		<div v-if="problems.length && !hideProblems" class="header-item problem-block">
			<el-popover
				placement="bottom-end"
				popper-class="problems-popover"
				title="Possible problems"
				width="354"
				trigger="hover"
			>
				<template #reference>
					<el-button class="problems-popover-button">
						<i :class="`icomoon icon-${problemIcon} ${problemAnimation}`" />
					</el-button>
				</template>

				<ul class="problems-list">
					<li v-for="(item, idx) in problems" :key="`problem-${item.id || idx * 5}-idx-${idx}`">
						<i :class="`icomoon ${getItemValue(item.alert_rule, 'icon', alertRulesList)}`" />
						<span class="value">{{ item.title }}</span>
					</li>
				</ul>
			</el-popover>
		</div>

		<div v-if="!hideExportButton" class="header-item export-buttons">
			<el-button
				type="success"
				class="inverted"
				size="small"
				native-type="button"
				@click="handleExportChart"
			>
				<i class="icomoon icon-docs"></i>
			</el-button>
		</div>

		<div v-if="showToggleNavigator" class="header-item navigator-button">
			<el-button
				type="primary"
				:class="['inverted', { active: toggleNavigatorButtonActive }]"
				size="small"
				native-type="button"
				@click="toggleNavigator"
			>
				<i class="icomoon icon-zoom-in"></i>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { getItemValue, prepareRangeParams } from '@/helpers';
import {
	alertRulesList,
	rebase_wheel,
	rebase_lines,
} from '@/constants/global';
import { useExportListToFile } from '@/composables/mixins/useExportListToFile';

defineOptions({
	name: 'HeaderRightPart',
});

const props = defineProps({
	isRebaseline: Boolean,
	problems: { type: Array, default: () => [] },
	hideProblems: Boolean,
	is_high_speed: Boolean,
	parameterTypeItems: { type: Array, default: () => [] },
	hideExportButton: Boolean,
	showToggleNavigator: Boolean,
	toggleNavigatorButtonActive: Boolean,
	rootFilters: { type: Object, default: () => ({}) },
	sensorId: Number,
});

const emit = defineEmits(['event']);

const { handleExportItem } = useExportListToFile({
	prepareFilters: (filters) => {
		let newFilters = { ...filters };
		if (newFilters.daterange?.length) {
			newFilters = {
				...newFilters,
				...prepareRangeParams(newFilters.daterange),
			};
			delete newFilters.daterange;
		}
		return newFilters;
	},
});

const problemIcon = computed(() => 'motor');
const problemAnimation = computed(() => {
	if (props.problems.length) {
		return `animate-${props.parameterTypeItems[0]?.axis}`;
	}
	return '';
});

const toggleNavigator = () => {
	emit('event', { eventName: 'toggleNavigator' });
};

const handleExportChart = () => {
	const parameterType = props.parameterTypeItems.length ? props.parameterTypeItems[0].id : null;
	handleExportItem({
		url: `sensors/jobs/${props.sensorId}/export`,
		filters: {
			parameterType,
			...props.rootFilters,
			metricSystemType: props.rootFilters.measurement,
			'X-Timezone-Offset': -new Date().getTimezoneOffset(),
		},
	});
};
</script>
