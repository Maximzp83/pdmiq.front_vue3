<template>
	<div class="flex align-center">
		<div class="info-part text-center mr-10">
			<div class="">{{ instanceLabel	}}</div>
			<span class="time">{{ passedTime	}}</span>
		</div>
		<el-popover
			placement="bottom"
			:popper-class="`button-popover`"
			:title="popoverTitle"
			trigger="hover"
			width="90"
			:close-delay="0"
		>
			<el-button
				slot="reference"
				:class="['action-button', 'el-button--primary inverted']"
				@click="handleUnlock"
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
		popoverTitle: String,
		instanceLabel: String,
		passedTimeValue: [Number, String]
	},

	data: () => ({
	}),

	computed: {
		passedTime: that => getPassedTime(
			Date.now(),
			that.passedTimeValue
		)
	},

	methods: {

		handleUnlock() {
			// this.$emit('onUnlock', { eventName: 'handleUnlockLube' });
			this.$emit('onUnlock');
		}
	},
};
</script>
