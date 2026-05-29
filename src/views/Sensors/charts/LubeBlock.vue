<template>
	<div class="flex align-center">
		<span class="time">{{ passedTime }}</span>
		<el-popover
			placement="bottom"
			popper-class="button-popover"
			:title="tt('phrases.Reset_lube')"
			trigger="hover"
			width="90"
			:close-delay="0"
		>
			<template #reference>
				<el-button
					:class="['action-button', 'el-button--primary inverted']"
					:loading="isProccessing"
					size="small"
					@click="handleUnlockLube"
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
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'LubeBlock',
});

const props = defineProps({
	sensorData: { type: Object, required: true },
	isProccessing: Boolean,
	chartOptionsUpdate: Number,
});

const emit = defineEmits(['event']);

const passedTime = computed(() =>
	getPassedTime(
		Date.now(),
		props.sensorData.lube_cycle_updated_at || props.sensorData.lube_shot_updated_at,
	),
);

const handleUnlockLube = () => {
	emit('event', { eventName: 'handleUnlockLube' });
};
</script>
