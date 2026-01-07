<template>
	<div class="thresholds-update-dialog">
		<div class="content-container">
			<div class="article-title">
				{{
					`${tt('phrases.Do_you_really_want_to')} ${tt('change')} ${tt(
						'thresholds'
					)}? ${tt('phrases.Continue_or_save_changes')}?`
				}}
			</div>
		</div>

		<div class="dialog-footer section-row text-center ">
			<!-- :loading="sensorJobSaving" -->
			<el-button @click="emitCancelUpdateThresholds">{{ tt('Cancel') }}</el-button>

			<el-button
				v-if="enableContinueButton"
				type="primary"
				@click="closeDialog()"
				class="capitalize"
				>{{ tt('continue') }}</el-button
			>

			<el-button
				type="primary"
				v-if="isWarningThresholdChanged"
				@click="() => ChartInstance.handleUpdateAlarmThresholdByWarningValue()"
				class="capitalize"
				>{{ tt('phrases.Continue_and_Update_Alarm_Threshold') }}</el-button
			>

			<el-button
				type="primary"
				v-if="isWarningThresholdLessThanAlarm"
				@click="emitCompleteUpdateThresholds()"
				class="capitalize"
				>{{ `${tt('Complete')}/${tt('save')}` }}</el-button
			>

			<el-button
				type="primary"
				v-if="isWarningThresholdChanged"
				@click="emitCompleteUpdateThresholds({ updateAlarm: true })"
				class="capitalize"
				>{{ tt('phrases.Complete_Save_and_Update_Alarm_Threshold') }}</el-button
			>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		isWarningThresholdChanged: Boolean,
		enableContinueButton: Boolean,
		isWarningThresholdLessThanAlarm: Boolean,
		ChartInstance: { type: Object, required: false },
		redirectTo: String
	},

	methods: {
		emitCancelUpdateThresholds() {
			this.$emit('event', {
				eventName: 'callMethodInAllCharts',
				data: {
					methodName: 'discardThresholdsChanges',
					fromInstance: true,
					payload: { redirectTo: this.redirectTo }
				},
				onward: true
			});
			this.closeDialog();
			/*if (this.redirectTo) {
				this.changeRoute({ path: this.redirectTo });
			}*/
		},

		emitCompleteUpdateThresholds(settings = {}) {
			if (settings.updateAlarm) {
				this.ChartInstance.handleUpdateAlarmThresholdByWarningValue(false);
			}
			this.$emit('event', {
				eventName: 'callMethodInAllCharts',
				data: {
					methodName: 'submitNewThresholds',
					fromInstance: true,
					payload: { redirectTo: this.redirectTo }
				},
				onward: true
			});
		},

		closeDialog() {
			this.$emit('onClose');
		}
	}
};
</script>
