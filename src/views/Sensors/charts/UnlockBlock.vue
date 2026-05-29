<template>
	<div class="flex align-center">
		<div class="info-part text-center mr-10">
			<div>{{ instanceLabel }}</div>
			<span class="time">{{ passedTime }}</span>
		</div>
		<el-popover
			placement="bottom"
			popper-class="button-popover"
			:title="popoverTitle"
			trigger="hover"
			width="90"
			:close-delay="0"
		>
			<template #reference>
				<el-button
					:class="['action-button', 'el-button--primary inverted']"
					:loading="isProccessing"
					size="small"
					@click="handleUnlock"
				>
					<i class="icomoon icon-stop"></i>
				</el-button>
			</template>
		</el-popover>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { getPassedTime } from '@/helpers';

defineOptions({
	name: 'UnlockBlock',
});

const props = defineProps({
	sensorData: { type: Object, required: true },
	isProccessing: Boolean,
	chartOptionsUpdate: Number,
	popoverTitle: String,
	instanceLabel: String,
	passedTimeValue: [Number, String],
});

const emit = defineEmits(['onUnlock']);

const passedTime = computed(() => getPassedTime(Date.now(), props.passedTimeValue));

const handleUnlock = () => {
	emit('onUnlock');
};
</script>
