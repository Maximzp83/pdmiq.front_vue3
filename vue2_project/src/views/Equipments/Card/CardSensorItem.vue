<template>
	<div
		data-id="sensor-item"
		:class="[
			'sensor-item',
			{ 'has-problem': lube_blocked },
			{ isUltrasound: currentSensorType.isUltrasound },
			sensorsStatusClass
		]"
	>
		<div class="content-container sensor-main-block relative">
			<div class="technology-block">
				<div class="location">{{ itemData.location_in_equipment }}</div>
				<div class="bold">{{ technologyData }}</div>
			</div>

			<TableCell
				class="icon-item"
				@event="handleEventNew"
				v-for="(column, columnIdx) in iconsAndButtonsSettings"
				:key="`icon-${columnIdx}`"
				:rowData="itemData"
				:columnIdx="columnIdx"
				:column="column"
			/>

			<!-- <div class="reorder-overlay dark-overlay" v-if="enableReorder"> -->
			<div class="reorder-button can-dragging" v-if="enableReorder">
				<img class="can-dragging" :src="icon_drag" alt="" />
			</div>
			<!-- </div> -->
		</div>

		<div class="runtime-tracking-section" v-if="is_runtime_tracking">
			<div class="flex align-center">
				<div class="">
					<span class="span-block value">{{ tt('runtime') }}:</span>
					<span class="span-block value">{{ total_runtime_seconds }}</span>
				</div>

				<el-button
					v-if="enableResetRuntime"
					@click="resetRuntime"
					type="primary"
					native-type="button"
					class="ml-auto item-action-button inverted small"
					v-text="tt('Reset')"
				/>
			</div>
			<div class="mt-5" v-if="lastReset">
				<span class="span-block label">{{ tt('last_reset') }}:</span>
				<span class="span-block">{{ lastReset }}</span>
			</div>
		</div>

		<div class="alarms-block">
			<div class="">
				<div class="counters-part" v-if="currentFaultsType == 'banner'">
					<div class="column">
						<div
							v-if="
								!currentSensorType.isHumiditySensor &&
									// !currentSensorType.isNCDEnv &&
									!currentSensorType.isNCDPressure &&
									!currentSensorType.isBannerPressure &&
									!(
										currentSensorType.isNCDCustom_4_20 &&
										itemData.alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM
									)
							"
						>
							<span>{{ tt('constants.Warning') }}</span>
							<b
								:class="{ warning: itemData.warning_crashes_count }"
								v-text="itemData.warning_crashes_count"
							></b>
						</div>
					</div>
					<div class="column">
						<div>
							<span>{{ tt('constants.Alarm') }}</span>
							<b
								:class="{ alarm: itemData.alarm_crashes_count }"
								v-text="
									currentSensorType.isHumiditySensor
										? itemData.alarm_crashes_count + itemData.warning_crashes_count
										: itemData.alarm_crashes_count
								"
							></b>
						</div>
					</div>
				</div>

				<div
					:class="[
						'counters-part',
						{
							column_3:
								(currentSensorType.isSDTsensor || currentSensorType.isNCDSDT) &&
								hasLubeZone
						}
					]"
					v-else-if="
						currentFaultsType == 'lubematrix' || currentFaultsType == 'ultrasoundSDT'
					"
				>
					<!-- <div class="column"> -->
					<div>
						<span>{{ tt('constants.Alarm') }}</span>
						<b
							:class="{ alarm: itemData.alarm_crashes_count }"
							v-text="itemData.alarm_crashes_count"
						></b>
					</div>
					<div>
						<span>{{ tt('constants.Warning') }}</span>
						<b
							:class="{ warning: itemData.warning_crashes_count }"
							v-text="itemData.warning_crashes_count"
						></b>
					</div>
					<div v-if="hasLubeZone">
						<span>{{ tt('constants.lube') }}</span>
						<b
							:class="{ lubeline: lubesData.countExceedingLubeZone }"
							v-text="lubesData.countExceedingLubeZone"
						></b>
					</div>
					<div v-if="currentFaultsType == 'lubematrix'">
						<span>{{ tt('phrases.Issues_Detected') }}</span>
						<b
							:class="{ warning: issuesDetectedCount }"
							v-text="issuesDetectedCount"
						></b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Issues_Resolved') }}</span>
						<b
							:class="{ black: lubesData.successCyclesCount }"
							v-text="lubesData.successCyclesCount"
						></b>
					</div>
					<!-- <div>
						<span>Custom Level Alarm</span>
						<b
							:class="{ alarm: itemData.custom_crashes_count }"
							v-text="itemData.custom_crashes_count"
						></b>
					</div> -->
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Lube_Delivered') }}</span>
						<b
							:class="{ black: lubesData.amountInjected }"
							v-text="`${getRoundedValue(lubesData.amountInjected, 0, 2)}g`"
						></b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Lube_Cycles_Auto') }}</span>
						<b
							:class="{ black: lubesData.autoProcessCount }"
							v-text="`${lubesData.autoProcessCount} ${autoAmountInjected}`"
						></b>
					</div>

					<!-- </div> -->
					<!-- <div class="column"> -->

					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Unsuccessful_Autolube') }}</span>
						<b
							:class="{ black: lubesData.failuresCyclesCount }"
							v-text="lubesData.failuresCyclesCount"
						></b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Autolube_Alarm') }}</span>
						<b
							:class="{ black: lubesData.alarmsCount }"
							v-text="lubesData.alarmsCount"
						></b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Lube_Cycles_Manual') }}</span>
						<b
							:class="{ black: lubesData.manualProcessCount }"
							v-text="`${lubesData.manualProcessCount} ${manualAmountInjected}`"
						></b>
					</div>
					<!-- </div> -->
				</div>

				<div class="counters-part"
					v-else-if="showBannerV2_1counters"
				>
					<PercentageAlertItem
						v-for="(item) in itemData.alert_time_duration_percentage"
						v-show="item.total_percent"
						:key="`alert-${item.parameter}`"
						:itemData="item"
					/>
				</div>
			</div>

			<div
				class="faults-part"
				v-if="
					possibleProblems.length &&
						!currentSensorType.isUltrasound &&
						!currentSensorType.isSDTsensor &&
						!currentSensorType.isNCDSDT &&
						!currentSensorType.isHumiditySensor
				"
			>
				<b>Faults: </b>
				<span
					v-for="(problem, idx) in possibleProblems"
					:key="`problem-${problem.id || idx}`"
				>
					{{ problem.title }}{{ idx == possibleProblems.length - 1 ? '' : ', ' }}
				</span>
			</div>
		</div>
	</div>
</template>

<script>
import {
	findItemBy,
	getPassedTime,
	getRoundedValue,
	convertMsToHours,
	cleanDateString
} from '@/helpers';
import { LUBE_PROCESSING_STATUSES, LUBE_CYCLE_STATUSES } from '@/constants/ultrasound';
import {
	setupBatteryChargeCell,
	setupConnectionStrengthCell
} from '@/helpers/specialHelpers';

import {
	not_wifi_icon,
	rebase_wheel,
	rebase_lines,
	sensor_broken_icon,
	lube_level_low,
	lube_level_normal,
	lube_level_empty,
	sensor_archive,
	controller_offline_icon,
	icon_drag,
	NCD_ALARM_TYPES,
	// DATASET,
	sensorClassesList,
	SENSOR_ALARM_TYPES,
	FFT_LOCK_STATUSES,
	anomaly1_icon
} from '@/constants/global';

import { ULTRASOUND_SENSOR_TYPES, LUBE_VERSIONS } from '@/constants/ultrasound';
import { sensorTypeMixin, eventHandler } from '@/mixins';

export default {
	mixins: [sensorTypeMixin(), eventHandler()],
	components: {
		TableCell: () => import('@/components/table/TableCell.vue'),
		PercentageAlertItem: () => import('@/views/Equipments/Card/PercentageAlertItem.vue')
	},

	props: {
		itemData: { type: Object, required: true },
		enableReorder: Boolean,
		enableResetRuntime: Boolean
	},

	computed: {
		sensorsStatusClass() {
			const { current_metric_issue_alerts } = this.itemData;
			const isAlarm = current_metric_issue_alerts.some(
				ai => ai.alert_type === SENSOR_ALARM_TYPES.ALARM
			)

			if (isAlarm) return 'alarm';

			const isWarning = current_metric_issue_alerts.some(
				ai => ai.alert_type === SENSOR_ALARM_TYPES.WARNING
			)
			
			if (isWarning) return 'warning';

			return '';
		},

		icon_drag: () => icon_drag,

		NCD_ALARM_TYPES: () => NCD_ALARM_TYPES,

		getRoundedValue: () => getRoundedValue,

		autoAmountInjected() {
			const { lubesData } = this;

			if (lubesData && lubesData.autoAmountInjected) {
				return `(${getRoundedValue(lubesData.autoAmountInjected, 0, 2)}g)`;
			}
			return '';
		},
		manualAmountInjected() {
			const { lubesData } = this;

			if (lubesData && lubesData.manualAmountInjected) {
				return `(${getRoundedValue(lubesData.manualAmountInjected, 0, 2)}g)`;
			}
			return '';
		},

		lubeShotsLeft() {
			if (this.itemData.pump && this.hasLubesCounters) {
				const {
					lube_cycle_max_count,
					lube_cycle_spent_count,
					lube_cycle_warning_count
				} = this.itemData.pump;

				const shotsLeft = lube_cycle_max_count - lube_cycle_spent_count;

				return {
					left: shotsLeft,
					className: shotsLeft > lube_cycle_warning_count ? 'success' : 'warning'
				};
			}

			return null;
		},

		compareList() {
			return this.$store.state.global.compareList;
		},

		inCompareList() {
			const { itemData, compareList } = this;
			return compareList.some(c_i => c_i === itemData.id);
		},

		possibleProblems() {
			return this.itemData.possibleProblems || [];
		},

		currentSensorTypeDataKey: () => 'itemData',

		currentFaultsType() {
			const { isSDTsensor, isUltrasound, isNCDSDT, isBannerV2_1 } = this.currentSensorType;

			if (isUltrasound || this.isLubeMatrixV3) return 'lubematrix';
			if (isBannerV2_1) return 'banner_V2_1';
			if (isSDTsensor || isNCDSDT) return 'ultrasoundSDT';
			// if (isHumiditySensor) return 'humidity';
			return 'banner';
		},

		isLubeMatrixV3: that => that.itemData && that.itemData.lube_version === LUBE_VERSIONS.V3,

		isNCDSensor() {
			const { currentSensorType } = this;
			if (currentSensorType) {
				const {
					isNCDTempVibe,
					isNCDWiredTempVibe,
					isNCDTempVibeCurr,
					isNCDSDT,
					isNCDEnv,
					isNCDPressure,
					isNCDCustom_4_20
				} = currentSensorType;

				return (
					isNCDTempVibe ||
					isNCDWiredTempVibe ||
					isNCDTempVibeCurr ||
					isNCDSDT ||
					isNCDEnv ||
					isNCDPressure ||
					isNCDCustom_4_20
				);
			}

			return false;
		},

		lubesData: that => that.itemData.lubes,
		lube_blocked: that =>
			that.itemData && (that.currentSensorType.isUltrasound || that.isLubeMatrixV3) &&
			(that.itemData.lube_cycle_status === LUBE_CYCLE_STATUSES.BLOCKED ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.UNSUCCESSFUL ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.LUBRICANT_FULL_SPENT ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.BLOCKED ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.LOSS_CONNECTION ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.NO_COMMAND_RESPONSE ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.UNKNOWN ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.NO_LUBRICATION_STATUS_RESPONSE ||
				that.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.NO_START_LUBRICATION_COMMAND_RESPONSE),

		fftLocked() {
			const { itemData } = this;
			if (itemData && itemData.last_fft_lock) {
				return itemData.last_fft_lock.status !== FFT_LOCK_STATUSES.UNLOCKED;
			}
			return false;
		},

		issuesDetectedCount() {
			const { lubesData } = this;

			if (lubesData) {
				return (
					lubesData.processCyclesCount +
					lubesData.successCyclesCount +
					lubesData.failuresCyclesCount
				);
			}

			return '';
		},

		hasLubesCounters() {
			const { currentSensorType, isSensorOnly, isLubeMatrixV3 } = this;
			return !isSensorOnly && (currentSensorType.isUltrasound || isLubeMatrixV3);
		},

		isSensorOnly: that => that.itemData.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY,

		hasLubeZone() {
			const { lubesData, itemData, isSensorOnly, isLubeMatrixV3 } = this;
			const { isSDTsensor, isUltrasound, isNCDSDT } = this.currentSensorType;

			if ((isLubeMatrixV3 || isUltrasound) && !isSensorOnly) return true;
			if (isSDTsensor || isNCDSDT) {
				return (
					lubesData.countExceedingLubeZone !== undefined &&
					itemData.levelZones &&
					itemData.levelZones.some(lz => lz.is_lube_zone_included)
				);
			}
			return false;
		},

		is_runtime_tracking: that => that.itemData.is_runtime_tracking,

		total_runtime_seconds() {
			const { itemData, is_runtime_tracking } = this;
			if (is_runtime_tracking && itemData) {
				const { total_runtime_seconds } = itemData;
				if (total_runtime_seconds) {
					let { total_hours, total_mins } = convertMsToHours(
						total_runtime_seconds * 1000
					);

					total_mins = total_mins + '';
					const mins =
						total_mins != '0' && total_mins.length == 1
							? `0${total_mins}`
							: total_mins;
					return `${total_hours}:${mins}`;
				} else {
					return '0:0';
				}
			}

			return '';
		},

		lastReset() {
			if (this.is_runtime_tracking) {
				const { lastRuntimeTracker, runtime_tracking_installed_at } = this.itemData;

				if (lastRuntimeTracker) {
					const { total_hours, total_mins } = convertMsToHours(
						lastRuntimeTracker.total_runtime_seconds * 1000
					);

					return `${total_hours}:${total_mins} at ${cleanDateString(
						lastRuntimeTracker.created_at
					)}`;
				} else {
					return `0:0 at ${cleanDateString(runtime_tracking_installed_at)}`;
				}
			}
			return '';
		},

		rebaselineBlock: () =>
			`<span class="rebase-wheel animate">
				<img src="${rebase_wheel}" />
			</span>
			<span class="rebase-lines">
				<img src="${rebase_lines}" />
			</span>`,

		showBannerV2_1counters() {
			const { currentSensorType, itemData } = this;
			return currentSensorType.isBannerV2_1 && itemData.alert_time_duration_percentage.some(i => i.total_percent);
		},
		
		// ==================
		lubeImg() {
			const { itemData } = this;
			if (itemData) {
				if (itemData.is_lubricator_empty) {
					return lube_level_empty;
				} else if (itemData.is_lube_low_level) {
					return lube_level_low;
				} else return lube_level_normal;
			}

			return null;
		},

		iconsAndButtonsSettings() {
			const {
				currentSensorType,
				isNCDSensor,
				rebaselineBlock,
				itemData,
				inCompareList,
				lube_blocked,
				fftLocked,
				lubeShotsLeft,
				isSensorOnly,
				hasLubesCounters
			} = this;
			// console.log(isNCDSensor, itemData)
			return Object.freeze([
				{
					show_anyway: true,
					meta: {
						additionalActions: [
							{
								// name: 'fftClick',
								linkSettings: {
									linkRoute: `ncd/:lastCompletedAutoFFTRequest.sensor_id/fft/:lastCompletedAutoFFTRequest.id`
								},
								tooltip_text: `${this.$t('phrases.Automatic_FFTs_Generated')}: ${
									itemData.completed_auto_fft_requests_count
								}`,
								target: '_blank',
								useHref: true,
								tool_tip_class: 'width-auto',
								// className: 'el-button el-button--primary inverted sesnor-card-fft-button',
								// icon: 'icomoon icon-fft',
								// className: 'el-button--primary inverted fft-button',
								conditionSettings: {
									conditions: [
										{ prop: 'lastCompletedAutoFFTRequest', method: 'notEmpty' }
									]
								},
								buttonContent: {
									component: {
										componentPath: 'views/Sensors/SensorFFTRequestButton'
									}
								}
							},

						]
					}
				},
				{
					prop: 'battery_voltage',
					conditionSettings: {
						conditions: [
							{ data_value: isNCDSensor, control_value: true },
							{ data_value: itemData.is_archived, control_value: false }
							// { prop: 'controller.is_inactive', control_value: false },
							// { prop: 'is_inactive', control_value: false },
						]
					},
					meta: {
						cell_class: 'text-center icon-padding',
						prepareValue: { localMethod: setupBatteryChargeCell }
					}
				},
				{
					conditionSettings: {
						conditions: [
							{ data_value: isNCDSensor, control_value: true },
							{ data_value: itemData.is_archived, control_value: true }
						]
					},
					meta: { img: { src: sensor_archive }, cell_class: 'no-signal-icon' }
				},
				{
					prop: 'rssi',
					conditionSettings: {
						conditions: [
							{ data_value: isNCDSensor, control_value: true },
							{ prop: 'controller.is_inactive', control_value: false },
							{ prop: 'is_inactive', control_value: false },
							{ data_value: itemData.is_archived, control_value: false }
						]
					},
					meta: {
						cell_class: 'text-center icon-padding',
						prepareValue: {
							localMethod: setupConnectionStrengthCell,
							useAllInstanceData: true
						}
					}
				},
				{
					conditionSettings: {
						checkMethod: 'some',
						conditions: [
							{
								data_value: isNCDSensor,
								control_value: true,
								next_conditions: [
									{ data_value: itemData.is_archived, control_value: false },
									{ prop: 'controller.is_inactive', control_value: true },
									{ prop: 'is_inactive', control_value: false }
								]
							},
							{
								data_value: isNCDSensor,
								control_value: true,
								// checkMethod_next: 'some',
								next_conditions: [
									{ data_value: itemData.is_archived, control_value: false },
									{ prop: 'controller.is_inactive', control_value: true },
									{ prop: 'is_inactive', control_value: true }
								]
							}
						]
					},
					meta: {
						img: { src: controller_offline_icon },
						cell_class: 'no-signal-icon'
					}
				},
				{
					conditionSettings: {
						checkMethod: 'some',
						conditions: [
							{
								data_value: isNCDSensor,
								control_value: true,
								// checkMethod_next: 'some',
								next_conditions: [
									{ data_value: itemData.is_archived, control_value: false },
									{ prop: 'controller.is_inactive', control_value: false },
									{ prop: 'is_inactive', control_value: true }
								]
							},
							{
								data_value: isNCDSensor,
								control_value: true,
								method: '!=',
								// checkMethod_next: 'some',
								next_conditions: [{ prop: 'is_inactive', control_value: true }]
							}
						]
					},
					meta: { img: { src: not_wifi_icon }, cell_class: 'no-signal-icon' }
				},
				{
					conditionSettings: {
						conditions: [{ prop: 'has_anomaly', control_value: true }]
					},
					meta: { img: { src: sensor_broken_icon } }
				},
				{
					conditionSettings: {
						conditions: [{ prop: 'is_re_baseline_process', control_value: true }]
					},
					meta: {
						htmlBlock: {
							html: rebaselineBlock,
							className: 'relative rebase-line-icon'
						}
					}
				},
				{
					conditionSettings: {
						conditions: [
							{ data_value: currentSensorType.isUltrasound, control_value: true },
							{ prop: 'lube_cycle_high_speed', control_value: true }
						]
					},
					meta: { icon: 'icomoon icon-high-speed' }
				},
				// -------Actions----
				{
					show_anyway: true,
					meta: {
						additionalActions: [
							{
								name: '',
								tooltip_text: this.$t('aliases.anomaly1'),
								img: anomaly1_icon,
								conditionSettings: {
									conditions: [
										{ data_value: itemData.is_flat_metric_data_anomaly_now, control_value: true },
									]
								},
							},
							{
								name: 'handleUnlockFFT',
								tooltip_text: this.$t('phrases.unlock_fft'),
								icon: 'icomoon icon-stop',
								containerClassName: 'lube-blocked-container',
								className: 'el-button--primary inverted',
								conditionSettings: {
									conditions: [
										{ data_value: fftLocked, control_value: true },
										{ data_value: isSensorOnly, control_value: false }
									]
								},
								prefixContent: {
									html: `<span class="time">${getPassedTime(
										Date.now(),
										itemData.last_fft_lock && itemData.last_fft_lock.created_at
									)}</span>`
								}
							},
							{
								name: 'unblockLube',
								tooltip_text: this.$t('phrases.Reset_lube'),
								icon: 'icomoon icon-stop',
								containerClassName: 'lube-blocked-container',
								className: 'el-button--primary inverted',
								conditionSettings: {
									conditions: [
										{ data_value: lube_blocked, control_value: true },
										{ data_value: isSensorOnly, control_value: false }
									]
								},
								prefixContent: {
									html: `<span class="time">${getPassedTime(
										Date.now(),
										itemData.lube_cycle_updated_at || itemData.lube_shot_updated_at
									)}</span>`
								}
							},
							{
								name: 'unblockLube',
								tooltip_text: itemData.is_lubricator_empty
									? this.$t('phrases.Luber_empty')
									: this.$t('phrases.Reset_grease_pack'),
								img: this.lubeImg,
								containerClassName: 'lube-level-container',
								className: 'el-button--primary inverted',
								conditionSettings: {
									conditions: [
										{
											data_value: hasLubesCounters,
											control_value: true
										},
										{	data_value: isSensorOnly, control_value: false },
									]
								},
								prefixContent: {
									html:
										lubeShotsLeft && !itemData.is_lubricator_empty
											? `<span class="shots-count pointer ${lubeShotsLeft.className}">${lubeShotsLeft.left}</span>`
											: null,
									action: {
										actionName: 'handleChangeShotsCount'
									}
								}
							},

							{
								linkSettings: {
									linkRoute: `equipments/${itemData.equipment_id}/details/pdm/${itemData.id}`
								},
								// name: 'openSensorStatistics',
								tooltip_text: this.$t('phrases.Sensor_Statistics'),
								icon: 'icomoon icon-chart3'
							},
							{
								name: 'compareClick',
								tooltip_text: this.$t('phrases.Add_to_compare_list'),
								icon: 'icomoon icon-compare',
								className: inCompareList
									? 'el-button--primary inverted active'
									: 'el-button--primary inverted'
							}
						]
					}
				}
			]);
		},

		technologyData() {
			const { currentSensorType, itemData, isLubeMatrixV3, isSensorOnly } = this;

			if (currentSensorType.isBannerV2Generic && itemData.bannerV2Subtype) {
				if (itemData.bannerV2Subtype.sensor_class) {
					const { sensor_class } = itemData.bannerV2Subtype;
					const sensorClass = findItemBy('id', sensor_class, sensorClassesList());
					return sensorClass ? sensorClass.name : '';
				}

				const { parameters } = itemData.bannerV2Subtype;
				let str = '';
				parameters.forEach((pi, idx) => {
					if (idx != 0) str += ', ';
					str += pi.name;
				});
				return str;
			} else if (currentSensorType.isBannerV2_1 || currentSensorType.isBannerM25) {

				return itemData.is_lube_mode ?
					this.tt('technology.ultrasound_vibration_temperature') :
					currentSensorType.group_technology;
			} else if (currentSensorType.isUltrasound || isLubeMatrixV3) {
				return isSensorOnly ? this.tt('constants.Ultrasound') : currentSensorType.group_technology;
			} else {
				return currentSensorType.group_technology;			
			}
		}
	},

	methods: {
		resetRuntime() {
			this.$emit('event', {
				eventName: 'resetSensorRuntime',
				data: this.itemData.id,
				onward: true
			});
		}
	},

	created() {
		if (this.itemData.has_crash_process) {
			this.emitEvent('sensorHasCrashProcess');
		}
		// console.log(this.itemData.id, this.currentChartSettingsKey, )
	}
};
</script>
