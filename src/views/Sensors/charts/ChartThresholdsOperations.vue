<template>
	<div class="thresholds-edit-block block-item">
		<span class="small-desc">{{ tt('Thresholds') }}</span>
		<el-button
			:disabled="disabledThresholdsEdit"
			size="small"
			type="primary"
			:class="{ active: editPlotlines }"
			@click="emitEvent('toggleEditPlotlinesManual')"
		>
			<i class="icomoon icon-graph"></i>
		</el-button>

		<el-button
			:disabled="disabledThresholdsEdit"
			size="small"
			type="primary"
			:class="['with-img', { active: showZoneSetup }]"
			@click="emitEvent('handleSetupThresholds')"
		>
			<img :src="one_layout_icon" alt="" />
		</el-button>

		<el-button
			v-if="showCalculateThresholdsButton"
			:disabled="isRebaseline"
			size="small"
			type="primary"
			:class="[
				'with-img rebase-line-button rebase-line-icon relative',
				{ active: calculateThresholdsIsActive },
			]"
			@click="emitEvent('handleCalculateThresholds')"
		>
			<span class="rebase-wheel">
				<img :src="rebase_wheel_white" />
			</span>
			<span class="rebase-lines">
				<img :src="rebase_lines" />
			</span>
		</el-button>
	</div>
</template>

<script setup>
import {
	one_layout_icon,
	rebase_wheel_white,
	rebase_lines,
} from '@/constants/global';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'ChartThresholdsOperations',
});

defineProps({
	editPlotlines: Boolean,
	disabledThresholdsEdit: Boolean,
	showZoneSetup: Boolean,
	showCalculateThresholdsButton: Boolean,
	isRebaseline: Boolean,
	calculateThresholdsIsActive: Boolean,
});

const emit = defineEmits(['event']);

const emitEvent = (eventName) => {
	emit('event', { eventName });
};
</script>
