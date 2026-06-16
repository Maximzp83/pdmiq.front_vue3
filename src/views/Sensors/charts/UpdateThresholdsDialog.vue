<template>
	<div class="thresholds-update-dialog">
		<div class="content-container">
			<div class="article-title">
				{{
					`${tt('phrases.Do_you_really_want_to')} ${tt('change')} ${tt(
						'thresholds',
					)}? ${tt('phrases.Continue_or_save_changes')}?`
				}}
			</div>
		</div>

		<div class="dialog-footer section-row text-center">
			<el-button @click="emitCancelUpdateThresholds">
				{{ tt('Cancel') }}
			</el-button>

			<el-button
				v-if="enableContinueButton"
				type="primary"
				class="capitalize"
				@click="closeDialog"
			>
				{{ tt('continue') }}
			</el-button>

			<el-button
				v-if="isWarningThresholdChanged"
				type="primary"
				class="capitalize"
				@click="ChartInstance?.handleUpdateAlarmThresholdByWarningValue()"
			>
				{{ tt('phrases.Continue_and_Update_Alarm_Threshold') }}
			</el-button>

			<el-button
				v-if="isWarningThresholdLessThanAlarm"
				type="primary"
				class="capitalize"
				@click="emitCompleteUpdateThresholds"
			>
				{{ `${tt('Complete')}/${tt('save')}` }}
			</el-button>

			<el-button
				v-if="isWarningThresholdChanged"
				type="primary"
				class="capitalize"
				@click="emitCompleteUpdateThresholds({ updateAlarm: true })"
			>
				{{ tt('phrases.Complete_Save_and_Update_Alarm_Threshold') }}
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

const emitCancelUpdateThresholds = () => {
	emit('event', {
		eventName: 'callMethodInAllCharts',
		data: {
			methodName: 'discardThresholdsChanges',
			fromInstance: true,
			payload: { redirectTo: props.redirectTo },
		},
		onward: true,
	});
	closeDialog();
};

const emitCompleteUpdateThresholds = (settings = {}) => {
	if (settings.updateAlarm) {
		props.ChartInstance?.handleUpdateAlarmThresholdByWarningValue(false);
	}
	emit('event', {
		eventName: 'callMethodInAllCharts',
		data: {
			methodName: 'submitNewThresholds',
			fromInstance: true,
			payload: { redirectTo: props.redirectTo },
		},
		onward: true,
	});
};

const closeDialog = () => {
	emit('onClose');
};
</script>
