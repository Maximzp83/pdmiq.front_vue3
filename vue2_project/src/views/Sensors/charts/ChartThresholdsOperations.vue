<template>
	<div class="thresholds-edit-block block-item">
		<span class="small-desc">{{ tt('Thresholds') }}</span>
		<el-button
			:disabled="disabledThresholdsEdit"
			size="small"
			type="primary"
			:class="{ active: editPlotlines }"
			@click="toggleEditPlotlinesManual"
		>
			<i class="icomoon icon-graph"></i>
		</el-button>

		<el-button
			:disabled="disabledThresholdsEdit"
			size="small"
			type="primary"
			:class="['with-img', { active: showZoneSetup }]"
			@click="handleSetupThresholds"
		>
			<img :src="one_layout_icon" alt="" class="" />
		</el-button>

		<!-- :class="{ active: editPlotlines }" -->
		<el-button
			v-if="showCalculateThresholdsButton"
			:disabled="isRebaseline"
			size="small"
			type="primary"
			:class="[
				'with-img rebase-line-button rebase-line-icon relative',
				{ active: calculateThresholdsIsActive }
			]"
			@click="handleCalculateThresholds"
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

<script>
// import { calcMin, getRoundedValue } from '@/helpers';
import {
	one_layout_icon,
	rebase_wheel_white,
	rebase_lines
} from '@/constants/global';

export default {
	props: {
		editPlotlines: Boolean,
		disabledThresholdsEdit: Boolean,
		showZoneSetup: Boolean,
		showCalculateThresholdsButton: Boolean,
		isRebaseline: Boolean,
		calculateThresholdsIsActive: Boolean
		// ChartInstance: Object
	},

	data: () => ({}),

	computed: {
		one_layout_icon: () => one_layout_icon,
		rebase_wheel_white: () => rebase_wheel_white,
		rebase_lines: () => rebase_lines
		// access_token: state => state.auth.access_token
	},

	methods: {
		toggleEditPlotlinesManual() {
			this.$emit('event', { eventName: 'toggleEditPlotlinesManual' });
		},

		handleSetupThresholds() {
			this.$emit('event', { eventName: 'handleSetupThresholds' });
		},

		handleCalculateThresholds() {
			this.$emit('event', { eventName: 'handleCalculateThresholds' });
		}
	}
};
</script>
