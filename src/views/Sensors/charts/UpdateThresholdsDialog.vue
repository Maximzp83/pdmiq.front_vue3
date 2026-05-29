<template>
	<div class="update-thresholds-dialog">
		<div class="card-content text-center">
			<div v-if="redirectTo" class="article-title">
				{{ tt('phrases.Unsaved_Thresholds') }}
			</div>
			<div v-else-if="isWarningThresholdChanged" class="article-title">
				{{ tt('Warning') }}
			</div>
			<div v-else class="article-title">
				{{ tt('phrases.Continue') }}
			</div>
		</div>

		<div class="dialog-footer section-row text-center">
			<el-button type="primary" class="uppercase semi-bold" :disabled="!enableContinueButton && !redirectTo" @click="confirm">
				{{ tt('Continue') }}
			</el-button>
			<el-button class="uppercase semi-bold" @click="$emit('onClose')">
				{{ tt('Cancel') }}
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'UpdateThresholdsDialog',
});

const props = defineProps({
	ChartInstance: { type: Object, default: null },
	isWarningThresholdChanged: Boolean,
	isWarningThresholdLessThanAlarm: Boolean,
	enableContinueButton: Boolean,
	redirectTo: String,
});

const emit = defineEmits(['event', 'onClose']);

const confirm = () => {
	if (props.ChartInstance?.continueThresholdsUpdate) {
		props.ChartInstance.continueThresholdsUpdate();
	}
	if (props.redirectTo) {
		emit('event', {
			eventName: 'handleRedirectTo',
			data: props.redirectTo,
			onward: true,
		});
	}
	emit('onClose');
};
</script>
