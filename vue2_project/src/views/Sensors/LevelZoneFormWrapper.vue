<template>
	<div class="edit-form-container">
		<div
			class="section-row"
			v-for="item in settings.parameters"
			:key="`parameter_type-${item.parameterItem.id}`"
		>
			<!-- @zoneUpdated="handleSuccess" -->
			<LevelZoneForm
				ref="LevelZoneForm"
				@submit="
					formData =>
						submitLevelZone({
							chartId: item.chart_id,
							formData
						})
				"
				:sensor="sensorData"
				:currentSensorType="currentSensorType"
				:isOffAlarm="settings.isOffAlarm"
				:parameterData="item"
				:metric_system_type="filters.measurement"
				:isNCDTempVibeSensor="isNCDTempVibeSensor"
			/>
		</div>

		<div class="dialog-footer section-row text-center">
			<el-button
				class="uppercase"
				type="primary"
				:loading="levelZonesSaving"
				@click="() => validateForm()"
				>{{ tt('SAVE') }}</el-button
			>
			<el-button class="uppercase" @click="closeDialog">{{
				tt('Cancel')
			}}</el-button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

/*import {
	sensorParametersList,
	sensorUltraSoundParametersList,
	sensorParametersListVFDPressureRPMAmps,
	sensorParametersListNCD
} from '@/views/Sensors/new_charts/controllers/Sensor/enums';*/

export default {
	components: {
		LevelZoneForm: () => import('./LevelZoneForm.vue')
	},
	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},

		currentSensorType: Object,
		settings: Object
		// sensorId: Number
	},

	data() {
		return {
			successCount: 0,
			levelZonesSaving: false
		};
	},

	computed: {
		...mapState({
			filters: state => state.sensors.statistics_filters
		}),

		isNCDTempVibeSensor() {
			const { currentSensorType } = this;
			if (currentSensorType) {
				const {
					isNCDTempVibe,
					isNCDWiredTempVibe,
					isNCDTempVibeCurr
				} = currentSensorType;

				return isNCDTempVibe || isNCDWiredTempVibe || isNCDTempVibeCurr;
			}

			return false;
		},

		parametersIds: that => that.settings.parametersIds || [],

		chartId: that => that.settings.chartId
	},

	methods: {
		...mapActions({
			// save_item: 'sensors/save_sensor_level_zones'
			save_sensor_level_zones: 'sensors/save_sensor_level_zones'
		}),

		closeDialog() {
			this.$emit('closeDialog');
		},

		validateForm() {
			this.successCount = 0;

			if (this.$refs.LevelZoneForm instanceof Array) {
				this.$refs.LevelZoneForm.forEach(ref => ref.validateForm());
			} else if (this.$refs.LevelZoneForm) {
				this.$refs.LevelZoneForm.validateForm();
			}
		},

		submitLevelZone({ chartId, formData }) {
			const payload = {
				sensorId: this.sensorData ? this.sensorData.id : null,
				data: formData
			};

			/*if (payload) {
				console.log(payload)
				return
			}*/
			this.levelZonesSaving = true;
			this.save_sensor_level_zones(payload)
				.then(() => {
					this.handleSuccess(chartId);
				})
				.catch(e => {
					console.warn(e);
					this.levelZonesSaving = false;
				});
		},

		handleSuccess(chartId) {
			this.successCount++;

			this.$emit('zoneUpdated', chartId);

			if (this.successCount === this.settings.parameters.length) {
				this.closeDialog();
				this.levelZonesSaving = false;
			}
		}
	}
};
</script>
