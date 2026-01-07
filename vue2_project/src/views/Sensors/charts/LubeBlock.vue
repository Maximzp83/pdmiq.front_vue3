<template>
	<div class="flex align-center">
		<span class="time">{{ passedTime	}}</span>
		<el-popover
			placement="bottom"
			:popper-class="`button-popover`"
			:title="tt('phrases.Reset_lube')"
			trigger="hover"
			width="90"
			:close-delay="0"
		>
			<el-button
				slot="reference"
				:class="['action-button', 'el-button--primary inverted']"
				@click="handleUnlockLube"
				:loading="isProccessing"
				:size="'mini'"
				icon="icomoon icon-stop"
			></el-button>
		</el-popover>
	</div>
</template>

<script>
import { getPassedTime } from '@/helpers';

export default {
	props: {
		// ChartAPI: Object,
		sensorData: {
			type: Object,
			required: true
		},
		isProccessing: Boolean,
		chartOptionsUpdate: Number,
	},

	data: () => ({
	}),

	computed: {
		passedTime: that => getPassedTime(
			Date.now(),
			that.sensorData.lube_cycle_updated_at || that.sensorData.lube_shot_updated_at
		)
	},

	methods: {

		handleUnlockLube() {
			this.$emit('event', { eventName: 'handleUnlockLube' });
		}
	},
};
</script>
