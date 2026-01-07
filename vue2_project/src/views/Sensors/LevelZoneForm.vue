<template>
	<div class="edit-form-container with-paddings">
		<div
			v-if="isSDTsensor"
			:class="[
				'dialog-header-absolute-button capitalize',
				{ 'primary-color': formData.is_lube_zone_included }
			]"
			@click="formData.is_lube_zone_included = !formData.is_lube_zone_included"
		>
			{{
				(formData.is_lube_zone_included ? tt('Remove') : tt('Add')) +
					' ' +
					tt('constants.Lubeline')
			}}
		</div>

		<div
			v-if="
				isNCDTempVibeSensor && parameterData.parameterItem.type == 'acceleration'
			"
			:class="[
				'dialog-header-absolute-button capitalize',
				{ 'primary-color': is_off_alarm_zone_include }
			]"
			@click="is_off_alarm_zone_include = !is_off_alarm_zone_include"
		>
			{{
				(is_off_alarm_zone_include ? tt('Remove') : tt('Add')) +
					' ' +
					tt('constants.Off_Alarm')
			}}
		</div>

		<div class="title article-title capitalize" v-if="parameterData">
			{{ parameterTitle }}
		</div>
		<el-form
			class="item-edit-form section-row"
			label-width="210px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="el-form-item" v-if="!isOffAlarm">
				<el-form-item
					:label="
						isLowHighZones ? tt('phrases.High_alarm') : tt('constants.Alarm_zone')
					"
					prop="alarm_zone"
				>
					<el-input-number
						v-model="formData.alarm_zone"
						:min="formData.warning_zone"
					/>
					<!-- :precision="3" -->

					<span class="input-description" v-if="isUltrasound || isSDTsensor">
						{{
							parseFloat(
								(
									Number(formData.alarm_zone) + Number(formData.baseline_zone)
								).toFixed(3)
							)
						}}
					</span>
				</el-form-item>

				<el-form-item
					:label="
						isLowHighZones ? tt('phrases.Low_alarm') : tt('constants.Warning_zone')
					"
					prop="warning_zone"
				>
					<el-input-number v-model="formData.warning_zone" :min="warningZoneMin" />
					<span
						class="input-description"
						v-if="(isUltrasound || isSDTsensor) && !isOffAlarm"
					>
						{{
							parseFloat(
								(
									Number(formData.warning_zone) + Number(formData.baseline_zone)
								).toFixed(3)
							)
						}}
					</span>
				</el-form-item>
			</div>

			<div class="el-form-item" v-if="!isOffAlarm && (isUltrasound || isSDTsensor)">
				<el-form-item
					v-if="
						formData.is_lube_zone_included && sensor && (isUltrasound || isSDTsensor)
					"
					:label="tt('constants.Lubeline_zone')"
					prop="lube_zone"
					required
				>
					<el-input-number v-model="formData.lube_zone" :min="0" />
					<span
						class="input-description"
						v-if="
							(isUltrasound || isSDTsensor) && !isOffAlarm && formData.baseline_zone
						"
					>
						{{
							parseFloat(
								(
									Number(formData.lube_zone) + Number(formData.baseline_zone)
								).toFixed(3)
							)
						}}
					</span>
				</el-form-item>

				<el-form-item :label="tt('constants.Baseline_zone')" prop="baseline_zone">
					<el-input-number v-model="formData.baseline_zone" :min="0" />
				</el-form-item>
			</div>

			<div
				class="el-form-item"
				v-if="!isOffAlarm && isNCDTempVibeSensor && is_off_alarm_zone_include"
			>
				<el-form-item
					v-if="sensor"
					:label="tt('constants.off_alarm_zone')"
					prop="off_alarm_zone"
					required
				>
					<el-input-number v-model="formData.off_alarm_zone" :min="0" />
				</el-form-item>
			</div>

			<el-form-item
				:label="tt('constants.off_alarm_zone')"
				prop="off_alarm_zone"
				v-if="isOffAlarm && !isUltrasound && !isSDTsensor"
			>
				<el-input-number v-model="formData.off_alarm_zone" />
			</el-form-item>

			<!-- <el-form-item
				v-if="sensor && sensor.type === CONTROLLER_TYPES.ULTRA_SOUND"
				label="Normal zone"
				prop="normal_zone"
			>
				<el-input-number v-model="formData.normal_zone" :min="0" :precision="2" />
			</el-form-item> -->

			<el-form-item
				:label="`${tt('Periods')}:`"
				prop="periods"
				v-if="
					(parameterItem.id === SENSOR_PARAMETERS_TYPES.TEMPERATURE ||
						isHumiditySensor) &&
						!isOffAlarm
					// !isHumiditySensor
				"
				class="periods-list"
			>
				<br />
				<ThresholdPeriodItem
					ref="ThresholdPeriodItem"
					v-for="(item, idx) in thresholdPeriodsItemsList"
					:key="`period_item-${item.id}`"
					:item-data="item"
					:notesLength="thresholdPeriodsItemsList.length"
					:item-index="idx"
					@onRemove="id => removeFormItem(id, 'thresholdPeriodsItemsList')"
					@selectMonth="handleSelectMonth"
					:isMobile="isMobile"
					:isOffAlarm="isOffAlarm"
					:selectedMonths="selectedMonths"
					:isHumiditySensor="isHumiditySensor"
				/>

				<div class="content-row option-item-container">
					<el-button
						class="action-button create-button 1inverted"
						size="mini"
						type="success"
						@click="addFormItem('thresholdPeriodsItemsList', 'p_i-')"
					>
						<!-- icon="icomoon icon-cross" -->
						<!-- <span>Add Location</span> -->
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
// import { /*mapActions,*/ mapState } from 'vuex';
import { required } from '@/constants/validation';
import {
	SENSOR_SPECIFIC_PARAMETERS_TYPES,
	SENSOR_PARAMETERS_TYPES,
	METRIC_SYSTEM_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { NCD_ALARM_TYPES } from '@/constants/global';

import { getZoneValue } from '@/modules/charts_factory/controllers/Sensor/methods';
import { findItemBy } from '@/helpers';
import { itemFormMixin, subItemsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), subItemsListMixin()],
	components: {
		ThresholdPeriodItem: () => import('./ThresholdPeriodItem.vue')
	},
	props: {
		sensor: {
			type: Object,
			default: () => ({})
		},
		parameterData: {
			type: Object,
			default: () => ({})
		},
		// sensorId: Number,
		metric_system_type: Number,
		// zoneSetupSettings: { type: Object, required: true },
		currentSensorType: Object,
		isNCDTempVibeSensor: Boolean,
		isOffAlarm: Boolean
	},

	data() {
		return {
			thresholdPeriodsItemsList: [],
			selectedMonths: [],

			is_off_alarm_zone_include: false,
			// formData.is_lube_zone_included: false,

			formData: {
				metric_system_type: METRIC_SYSTEM_TYPES.METRIC,
				parameter_type: SENSOR_SPECIFIC_PARAMETERS_TYPES.DB,
				baseline_zone: 0,
				warning_zone: 0,
				alarm_zone: 0,
				lube_zone: 0,
				is_lube_zone_included: false,
				off_alarm_zone: 0,
				periods: []
				// normal_zone: 0
			},

			rules: {
				warning_zone: required,
				alarm_zone: required,
				off_alarm_zone: null
			}
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'ThresholdPeriodItem', targetProp: 'periods' },
		]),

		SENSOR_PARAMETERS_TYPES: () => SENSOR_PARAMETERS_TYPES,
		// parameter_type: that => that.parameterData.parameterItem,
		parameterItem: that => that.parameterData.parameterItem,

		// statistics_data: that => that.zoneSetupSettings.statistics_data,
		isSDTsensor: that =>
			that.currentSensorType.isSDTsensor || that.currentSensorType.isNCDSDT,
		isUltrasound: that => that.currentSensorType.isUltrasound,
		isNCDPressure: that => that.currentSensorType.isNCDPressure,
		isBannerPressure: that => that.currentSensorType.isBannerPressure,
		isHumiditySensor: that =>
			that.currentSensorType.isHumiditySensor || that.currentSensorType.isNCDEnv,

		isLowHighZones() {
			const {
				isHumiditySensor,
				isNCDEnv,
				isNCDPressure,
				isBannerPressure,
				isNCDCustom_4_20,
				isBannerV2Generic
			} = this.currentSensorType;
			const { bannerV2Subtype } = this.sensor;

			if (isBannerV2Generic && bannerV2Subtype) {
				const currentSubTypeParam = findItemBy('node_parameter', this.parameterData.parameterItem.id,bannerV2Subtype.parameters);
				if (currentSubTypeParam) {
					return currentSubTypeParam.alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM;
				}
			}

			return (
				isHumiditySensor ||
				isNCDEnv ||
				isNCDPressure ||
				isBannerPressure ||
				(isNCDCustom_4_20 && this.sensor.alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM)
			);
		},

		parameterTitle() {
			const { parameterData, parameterItem, isHumiditySensor, isSDTsensor } = this;

			if (parameterData && parameterData.chartTitle) {
				return parameterData.chartTitle;
			}

			if (parameterItem) {
				if (
					isHumiditySensor &&
					parameterItem.id === SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY
				) {
					return this.tt('constants.Humidity');
				} else if (
					isSDTsensor &&
					parameterItem.id === SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION
				) {
					return this.tt('constants.DB_Level');
				}

				return parameterItem.name;
			}

			return '';
		},

		warningZoneMin() {
			if (this.parameterData.parameterItem.type == 'temperature') {
				return -273;
			}
			return 0;
		},

		zones_data_keys: () =>
			Object.freeze([
				'baseline_zone',
				'warning_zone',
				'alarm_zone',
				'lube_zone',
				'off_alarm_zone'
			])
	},

	methods: {
		handleSelectMonth() {
			// console.log(ids)
			// this.selectedMonths = [];
			let newMonths = [];

			this.$refs.ThresholdPeriodItem.forEach(ref => {
				newMonths = newMonths.concat(ref._data.formData.months);
			});

			this.selectedMonths = newMonths;
		},

		localSetupPage() {
			const {
				parameterData,
				parameterItem,
				isOffAlarm,
				isUltrasound,
				isSDTsensor
			} = this;

			this.rules.baseline_zone = isUltrasound || isSDTsensor ? required : null;
			this.rules.off_alarm_zone = isOffAlarm ? required : null;

			this.formData.metric_system_type =
				this.metric_system_type || METRIC_SYSTEM_TYPES.METRIC;
			this.formData.parameter_type =
				parameterItem.id || SENSOR_SPECIFIC_PARAMETERS_TYPES.DB;

			if (isUltrasound) {
				this.formData.parameter_type = SENSOR_SPECIFIC_PARAMETERS_TYPES.DB;
			}

			const { levelZones, levelZoneData } = parameterData;

			if (levelZoneData || (levelZones && levelZones.length)) {
				let actualLevelZoneData = levelZoneData;

				if (!actualLevelZoneData) {
					actualLevelZoneData = findItemBy(
						'parameter_type',
						this.formData.parameter_type,
						levelZones
					);
				}

				if (actualLevelZoneData) {
					// if (!this.isHumiditySensor) {
					this.thresholdPeriodsItemsList = this.setupFormSubItemsList(
						actualLevelZoneData.periods,
						'p_i'
					);
					// }

					this.zones_data_keys.forEach(key => {
						this.formData[key] = getZoneValue(key, {
							zonesData: actualLevelZoneData,
							isOffAlarm: isOffAlarm,
							currentSensorType: this.currentSensorType
						});
						// console.log('1', key, this.formData[key], actualLevelZoneData)
					});

					this.formData.is_lube_zone_included =
						actualLevelZoneData.is_lube_zone_included;

					/*if (this.isSDTsensor) {
						this.formData.is_lube_zone_included = actualLevelZoneData.lube_zone
							? true
							: false;
					} else*/
				}
			}
			
			if (this.isUltrasound) {
				this.formData.is_lube_zone_included = true;
			}
		},

		localValidationHook(options) {
			if (this.formData.alarm_zone < this.formData.warning_zone) {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Alarm_zone_should_be_higher_than_Warning_zone`),
					duration: 0
				});
				return false;
			} else {
				this.submitForm(options);
			}
		},

		localPrepareSubmitData(formData) {
			let newData = { ...formData };

			for (let prop in newData) {
				if (!newData[prop] && newData[prop] != 0) {
					delete newData[prop];
				}
			}
			// console.log(1, newData, formData)

			if (this.isUltrasound || this.isSDTsensor) {
				delete newData.off_alarm_zone;
			}

			if (!formData.is_lube_zone_included) {
				newData.lube_zone = 0;
			}
			/*if (newData) {
				console.log(newData)
				return
			}*/
			return newData;
		}
	}
	/*watch: {
		'formData.baseline_zone'(x) {
			console.log(x)
		}
	}*/
};
</script>
