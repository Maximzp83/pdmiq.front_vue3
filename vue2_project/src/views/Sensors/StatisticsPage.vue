<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="sensorLoading || overlaySensorLoading"
			:itemsName="itemsName.one"
		/>
		<!-- <button @click="reloadChart('chart-4')">reload chart</button> -->
		<!-- <button @click="forceRerender('DashboardLayoutComponentKey')">rerender</button> -->

		<div
			:class="[
				'view-wrapper item-page-wrapper statistics-page specifications-block-wrapper',
				{ 'with-compare': isCompare }
			]"
		>
			<div :class="{ mcontainer: isCompare }">
				<div :class="[{ card: isCompare }, 'section-row']">
					<div
						:class="[
							{ 'card-content': isCompare },
							'mrow flex wrap page-header align-center relative '
						]"
					>
						<div class="images-part mcol-xs-12 mcol-sm-2" v-if="!isCompare">
							<EquipmentPictureBlock
								@event="handleEventNew"
								:equipmentData="equipmentData"
							/>
						</div>

						<div class="mcol-xs-12 mcol-sm-2 mcol-lg-2 fluid flex align-center wrap">
							<div
								class="title page-title capitalize span-block"
								v-html="sensorTitle"
							></div>

							<div
								class="runtime-tracking-section"
								v-if="sensorData && sensorData.is_runtime_tracking"
							>
								<span class="span-block value">{{ tt('runtime') }}:</span>
								<span class="span-block value">{{ total_runtime_seconds }}</span>
							</div>
						</div>

						<!-- v-if="currentSensorType.isBanner" -->
						<div
							class="mcol-xs-auto legend-container"
							v-if="!currentSensorType.isBannerV2Generic"
						>
							<div class="legend-list">
								<div
									class="item"
									v-for="(item, idx) in legendList"
									:key="`legend_item-${idx}`"
								>
									<span :class="['label', item.className]"></span>
									<span>{{ item.label }}</span>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-20 text-right ml-auto">
							<!-- daterange: convertRangeTest(range), -->
							<!-- daterange: convertDaterange(range, 'UTC'), -->
							<!-- :value="convertDaterange(filters.daterange, localTimeZone)" -->
							<Datepicker
								className=" "
								@input="handleDaterange"
								:value="filters.daterange"
								type="datetimerange"
								format="yyyy/MM/dd HH:mm"
								value-format="yyyy-MM-dd HH:mm:ss"
								:default-time="['00:00:00', '23:59:59']"
								:picker-options="pickerOptions"
								setupDaterangeFilter
							/>
						</div>

						<div class="button-item">
							<el-button
								type="primary"
								native-type="button"
								:class="[
									'inverted re-baseline-button operations-button toggle-additional-filters',
									{ active: showFilterbar }
								]"
								:icon="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"
								@click="e => toggleFilterbar(e)"
							/>
						</div>

						<DropdownFilterbar
							ref="DropdownFilterbar"
							hideToggleButton
							disableTriangle
							disableCard
							@event="handleEvent"
							filterbarDropdownId="statisticsPageDropdownFilterbar"
						>
							<!-- :key="dropdownFilterbarUpdated" -->
							<BannerFilterBlock
								ref="BannerFilterBlock"
								v-if="enableFilterBlock.banner"
								@event="handleEventNew"
								:sensorData="sensorData"
								:sensors="sensors"
								:sensorLoading="sensorLoading"
								:showHistory="showHistory"
								:joinChartsBy="joinChartsBy"
								:splitNCDCharts="splitNCDCharts"
								:chartOperationsPopoverShow="showFilterbar"
								:currentSensorType="currentSensorType"
								:isCompare="isCompare"
								:enableFFT="enableFFT"
								:rootFilters="filters"
								:isNCDSensor="isNCDSensor"
								:chartsWithOffAlarm="chartsWithOffAlarm"
								:equipmentData="equipmentData"
								:statsThresholdsActive="statsThresholdsActive"
								:V2_1ViewActive="V2_1ViewActive"
							/>

							<UltrasoundFilterBlock
								ref="UltrasoundFilterBlock"
								v-if="enableFilterBlock.ultrasound"
								:enableLubeTriggerButtonOnly="enableLubeTriggerButton"
								:class="[{ 'ml-5': enableLubeTriggerButton }]"
								@event="handleEvent"
								:sensorData="sensorData"
								:isCompare="isCompare"
								:showHistory="showHistory"
								:currentSensorType="currentSensorType"
								:isLubeMatrixV3="isLubeMatrixV3"
							/>

							<CustomPDMFilterBlock
								ref="FilterBlock"
								v-else-if="enableFilterBlock.customPDM"
								@event="handleEvent"
								:sensorData="sensorData"
								:showHistory="showHistory"
								:isCompare="isCompare"
								:enableFFT="enableFFT"
								:currentSensorType="currentSensorType"
								:enablePDFButton="!currentSensorType.isNCDPressure"
								:equipmentData="equipmentData"
								:enableChartFilters="
									!currentSensorType.isNCDPressure &&
										!currentSensorType.isBannerPressure &&
										!currentSensorType.isNCDCustom_4_20
								"
								:enableStatsBlock="currentSensorType.isBannerV2Generic"
								:statsThresholdsActive="statsThresholdsActive"
							/>
						</DropdownFilterbar>
					</div>
				</div>

				<div
					v-if="isCompare && sensors.length && sensors.length == compareList.length"
					class="compare-title-section section-row"
				>
					<div class="mrow flex">
						<div
							class="compare-title-item "
							v-for="sensor in sensors"
							:key="`compare_sensor-${sensor.id}`"
						>
							<div class="card">
								<div
									class="card-content title"
									v-html="getSensorTitle(sensor, { boldLabels: true })"
								></div>
							</div>
						</div>
					</div>
				</div>

				<div class="tab-container reportBlock-tab" :class="'show_tab'">
					<div
						key="charts_tab"
						:class="[
							'tab-container',
							{
								'showHistory': showHistory,
								'show-RPM': equipmentData && equipmentData.is_rpm_visible
							}
						]"
					>
						<PossibleProblemsBlock
							v-if="enableProblemsBlock"
							:currentSensor="sensorData"
							:sensorParamsForSetupProblems="sensorParamsForSetupProblems"
							:daterange="filters.daterange"
							:isNCDSensor="isNCDSensor"
						/>

						<div
							class="section-row margin-top-row axis-selection-container flex justify-center"
							v-if="
								enableAxisSelector &&
									splitNCDCharts &&
									(!joinChartsBy.prop || joinChartsBy.prop == 'split')
							"
						>
							<RadioButtonsBlock
								@onChange="val => (activeAxis = val)"
								:settings="axisRadioBlockSettings"
								:optionsList="axisRadioButtonsList"
								:value="activeAxis"
							/>
						</div>

						<div
							:class="[
								'section-row',
								{ 'compare-section flex mrow': isCompare },
								{ 'show-statistics-lines': statsThresholdsActive }
							]"
							v-if="allSensorsReady"
						>
							<!-- {{toConsole('ChartsListWrapper')}} -->
							<!-- <div> -->
							<!-- v-if="!spectralBandingCharts.show" -->

							<ChartsListWrapper
								v-for="(sensor, idx) in sensors"
								ref="ChartsListWrapper"
								:key="`wrapper_chart-${sensor.id}-key_${dropdownFilterbarUpdated}`"
								@event="handleEventNew"
								:chartsContainerIdx="idx"
								:loadingQueue="loadingQueue"
								:rootFilters="filters"
								:sensorData="sensor"
								:linespeedOverlaySensorData="linespeedOverlaySensorData"
								:rpmOverlayData="rpmOverlayData"
								:joinChartsBy="joinChartsBy"
								:activeAxis="activeAxis"
								:enableAxisSelector="enableAxisSelector"
								:additionalProps="additionalProps"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="chartMessageDialogInit"
			center
			:title="tt('phrases.Add_new_note_to_point')"
			:append-to-body="true"
			:visible.sync="showNewMessage"
			:class="'small report-item-dialog'"
		>
			<ChartMessageForm
				@closeDialog="showNewMessage = false"
				@success="reloadChart(null, { reloadAll: 1 })"
				:itemData="showNewMessage ? pointData : null"
				:sensorId="sensorData.id"
			/>
			<!-- :visible="showNewMessage" -->
		</el-dialog>

		<el-dialog
			center
			:title="tt('phrases.Setup_thresholds')"
			:append-to-body="true"
			:visible.sync="showZoneSetup"
			:class="'small report-item-dialog'"
		>
			<!-- :isAlarmWarningOnly="isAlarmWarningOnly" -->
			<LevelZoneFormWrapper
				v-if="showZoneSetup"
				@closeDialog="closeLevelZoneSetup"
				@zoneUpdated="chartId => reloadChart(chartId)"
				:sensorData="sensorData"
				:currentSensorType="currentSensorType"
				:settings="levelZoneSetupSettings"
			/>
		</el-dialog>
	</div>
</template>

<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"></script> -->
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.13/moment-timezone-with-data-2012-2022.min.js"></script> -->

<script>
import Vue from 'vue';

import Highcharts from 'highcharts_old';
import HighchartsNew from 'highcharts';
import stockInitNew from 'highcharts/modules/stock';
import boostNew from 'highcharts/modules/boost';
const boost = require('/node_modules/highcharts_old/modules/boost');
const stockInit = require('/node_modules/highcharts_old/modules/stock');
// import boost from 'highcharts/modules/boost';
// console.log(boost)
// stockInit(Highcharts);
// boost(Highcharts);
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);
// import axios from '@/services/api/axiosService';

import { mapState, mapActions } from 'vuex';
import {
	// dateRangeMixin,
	navigation,
	eventHandler,
	sensorTypeMixin,
	actionButtonsMixin
} from '@/mixins';

import {
	validateRouteParams,
	getDateRange,
	findItemBy,
	getYmdDateString,
	cloneDeep,
	getTimeDifference,
	convertMsToHours,
	localToUtcYmdHis
} from '@/helpers';

import {
	NCD_NODE_TYPES,
	NCD_ALARM_TYPES,
	ITEM_SPEED_OPTIONS,
	RPM_SOURCES_TYPES,
	DATASET
} from '@/constants/global';

import { LUBE_VERSIONS } from '@/constants/ultrasound';

// import { getParamsFromUrl } from '@/services/api/api_helpers';

// import { getZoneValue } from '@/helpers/charts';

import {
	datePickerShortcuts,
	datePickerAdditionalShortcuts,
	localeMonths,
	localeMonthsFull,
	weekdays
} from '@/constants/date_time';

import {
	sensorParametersListNCD,
	ncdAxisList,
	BANNER_V2_1_VIBRATION_PARAMETERS_TYPES
	// SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';

import { LANGUAGE_TYPES } from '@/localization/utils';
import { getSensorTitle } from '@/helpers/specialHelpers';

// import isEmpty from 'lodash/isEmpty';

export default {
	mixins: [
		// dateRangeMixin,
		navigation(),
		eventHandler(),
		sensorTypeMixin(),
		actionButtonsMixin()
	],
	components: {
		DropdownFilterbar: () => import('@/components/common/DropdownFilterbar.vue'),

		ChartsListWrapper: () => import('./charts/ChartsListWrapper.vue'),
		// SpectralChartsListWrapper: () => import('./charts/SpectralChartsListWrapper.vue'),
		PossibleProblemsBlock: () => import('./PossibleProblemsBlock.vue'),
		// ReportBlock: () => import('./ReportBlock.vue'),
		BannerFilterBlock: () => import('./FilterBlock/BannerFilterBlock.vue'),
		UltrasoundFilterBlock: () => import('./FilterBlock/UltrasoundFilterBlock.vue'),
		CustomPDMFilterBlock: () => import('./FilterBlock/CustomPDMFilterBlock.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		ChartMessageForm: () => import('./ChartMessageForm.vue'),
		LevelZoneFormWrapper: () => import('./LevelZoneFormWrapper.vue'),
		EquipmentPictureBlock: () => import('./charts/EquipmentPictureBlock.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue')
	},

	props: {
		sensorDataFromProps: Object,
		equipmentData: null
	},

	data() {
		return {
			dropdownFilterbarUpdated: 1,
			statsThresholdsActive: false,
			V2_1ViewActive: false,
			initialSensorDataSet: null,

			isCompare: false,
			joinChartsBy: { prop: '' },
			isTodayRangeClicked: false,

			splitNCDCharts: false,

			rangeWithTime: false,
			pickedRange: {},

			showFilterbar: false,
			showHistory: false,

			showZoneSetup: false,
			levelZoneSetupSettings: {},

			pointData: null,
			chartMessageDialogInit: false,
			showNewMessage: false,

			sensorLoading: false,
			someChartLoading: true,

			sensors: [],
			current_sensor_ids: [],
			sensorsReadyCount: 0,

			loadingQueue: [],
			lube_cycle_high_speed: false,

			activeAxis: 1,

			sensorParamsForSetupProblems: [],

			chartsWithOffAlarm: [],
			chartsListWrappersReadyCount: 0,

			rpmOverlaySensorData: null,
			overlaySensorLoading: false,
			isOverlaySensorReady: false

			// ---------------
			// pdfReportURL: 'https://api.pdmmatrix.assetmatrix.com/dl/storage/80/charts/report/162333088860c21048eaec67.86666954.pdf'
		};
	},

	computed: {
		...mapState({
			filters: state => state.sensors.statistics_filters,
			// charts_filters: state => state.sensors.charts_filters,
			prevent_drop_daterange: state => state.sensors.prevent_drop_daterange,
			layout_click_target: state => state.global.layout_click_target,
			compareList: state => state.global.compareList,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix
		}),

		additionalProps: that => ({
			lube_cycle_high_speed: that.lube_cycle_high_speed,
			isCompare: that.isCompare,
			showHistory: that.showHistory,
			statsThresholdsActive: that.statsThresholdsActive,
			accessToThresholds:
				that.$hasAccessTo(['edit_dashboard']) &&
				!Object.values(that.joinChartsBy).some(val => !!val && val != 'split'),
			higchartInstances: {
				hcInstance: Highcharts,
				hcInstanceNew: HighchartsNew,
				stockInitNew,
				boostNew,
				stockInit,
				boost
			}
		}),

		isLubeMatrixV3() {
			const { sensorData } = this;
			if (sensorData) {
				return (
					sensorData.data_set === DATASET.LUBEMATRIX_V3 ||
					sensorData.lube_version === LUBE_VERSIONS.V3
				);
			}
			return false;
		},

		// CONTROLLER_TYPES: () => CONTROLLER_TYPES,
		enableFilterBlock() {
			const { isCompare, currentSensorType, isLubeMatrixV3 } = this;

			return Object.freeze({
				banner:
					isCompare ||
					currentSensorType.isBanner ||
					currentSensorType.isBannerCM1L ||
					currentSensorType.isBannerExtraVibration ||
					currentSensorType.isHumiditySensor ||
					currentSensorType.isNCDTempVibe ||
					currentSensorType.isNCDWiredTempVibe ||
					currentSensorType.isNCDTempVibeCurr ||
					currentSensorType.isNCDEnv ||
					currentSensorType.isBannerTempVibe2 ||
					currentSensorType.isBannerV2_1 ||
					currentSensorType.isBannerM25,
				ultrasound:
					currentSensorType.isUltrasound ||
					currentSensorType.isSDTsensor ||
					currentSensorType.isNCDSDT ||
					isLubeMatrixV3,
				customPDM:
					currentSensorType.isCustomPDM ||
					currentSensorType.isNCDPressure ||
					currentSensorType.isBannerPressure ||
					currentSensorType.isNCDCustom_4_20 ||
					currentSensorType.isBannerV2Generic
			});
		},

		enableLubeTriggerButton: that =>
			(that.currentSensorType.isBannerV2_1 || that.currentSensorType.isBannerM25) &&
			that.sensorData.is_lube_mode,

		enableFFT() {
			if (this.isCompare) return false;

			const { enableAxisSelector, $hasAccessTo } = this;
			const {
				isBannerV2_1,
				isBannerM25,
				isBannerV2Generic
			} = this.currentSensorType;
			const { bannerV2Subtype } = this.sensorData;

			if ($hasAccessTo(['view_dashboard'])) {
				return (
					enableAxisSelector ||
					isBannerV2_1 ||
					isBannerM25 ||
					(isBannerV2Generic && bannerV2Subtype && bannerV2Subtype.is_fft_allowed)
				);
			}
			return false;
		},

		isNCDSensor() {
			const { currentSensorType } = this;
			if (currentSensorType) {
				const {
					isNCDTempVibe,
					isNCDWiredTempVibe,
					isNCDTempVibeCurr,
					isNCDSDT,
					isNCDEnv
				} = currentSensorType;

				return (
					isNCDTempVibe ||
					isNCDWiredTempVibe ||
					isNCDTempVibeCurr ||
					isNCDSDT ||
					isNCDEnv
				);
			}

			return false;
		},

		enableProblemsBlock: that =>
			that.sensorData &&
			!that.isCompare &&
			!that.currentSensorType.isSDTsensor &&
			!that.currentSensorType.isHumiditySensor,

		enableAxisSelector() {
			const { currentSensorType, isCompare } = this;
			// console.log(currentSensorType)
			if (currentSensorType) {
				const {
					isNCDTempVibe,
					isNCDWiredTempVibe,
					isNCDTempVibeCurr,
					isBannerTempVibe2
				} = currentSensorType;

				return (
					!isCompare &&
					(isNCDTempVibe ||
						isNCDWiredTempVibe ||
						isNCDTempVibeCurr ||
						isBannerTempVibe2)
				);
			}

			return false;
		},

		axisRadioBlockSettings: () =>
			Object.freeze({
				hideTitle: true,
				inline: true,
				buttonType: 'primary',
				className: 'inverted standard'
			}),

		axisRadioButtonsList() {
			let result = [];

			if (this.enableAxisSelector && this.sensorData) {
				const {
					ncd_active_vertical_axis,
					is_hidden_ncd_active_vertical_axis
				} = this.sensorData;

				ncdAxisList.forEach(axis => {
					if (ncd_active_vertical_axis === axis.id) {
						if (!is_hidden_ncd_active_vertical_axis) {
							result.push({ ...axis, name: axis.name + ' (V)' });
						}
					} else {
						result.push(axis);
					}
				});
			}

			return Object.freeze(result);
		},

		overlaySensorId() {
			const { isCompare, rpmOverlayData, current_sensor_ids } = this;
			return !isCompare &&
				rpmOverlayData &&
				rpmOverlayData.rpm_request &&
				rpmOverlayData.rpm_request.sensor_id !== current_sensor_ids[0]
				? rpmOverlayData.rpm_request.sensor_id
				: null;
		},

		allSensorsReady() {
			return this.sensorsReadyCount === this.current_sensor_ids.length;
			// &&	(this.overlaySensorId ? this.isOverlaySensorReady : true);
		},

		sensorData() {
			if (this.allSensorsReady && this.dropdownFilterbarUpdated) {
				return cloneDeep(this.sensorDataFromProps || this.sensors[0]);
			}
			return null;
		},

		rpmOverlayData() {
			if (this.equipmentData && this.equipmentData.rpm_source_item) {
				// console.log('computed rpmOverlayData', this.equipmentData.rpm_source_item)
				let {
					rpm_source_item,
					rpmSources,
					// rpm_external_source_type, rpm_external_value,
					rpm_external_node_parameter,
					rpm_external_node_id,
					rpm_formula,
					is_rpm_visible
				} = this.equipmentData;
				let data = { is_rpm_visible };

				// console.log('rpmSources', rpmSources)

				// rpm_source_item = 4

				switch (rpm_source_item) {
					case ITEM_SPEED_OPTIONS.LINESPEED_RPM:
						{
							let {
								prodline_rpm_source_type /*prodline_rpm_value,*/,
								prodline_rpm_node_parameter,
								prodline_rpm_node_id
							} = this.equipmentData;
							// const {	line_speed_rpm_evaluated } = rpmSources;
							// prodline_rpm_source_type = 2

							if (prodline_rpm_source_type === RPM_SOURCES_TYPES.MANUAL) {
								data.rpm_value = rpmSources && rpmSources.line_speed_rpm_evaluated;
							} else if (
								prodline_rpm_source_type === RPM_SOURCES_TYPES.EXTERNAL_INPUT
							) {
								data.rpm_request = {
									parameter: prodline_rpm_node_parameter, //|| 5,
									sensor_id: prodline_rpm_node_id //|| 1087
								};
							}
						}
						break;

					case ITEM_SPEED_OPTIONS.SPECIFICATION_RPM:
						data.rpm_value = rpmSources && rpmSources.specification_rpm_evaluated;
						break;

					case ITEM_SPEED_OPTIONS.MANUAL_RPM:
						data.rpm_value = rpmSources && rpmSources.manual_rpm_evaluated;
						break;

					case ITEM_SPEED_OPTIONS.MAX_PEAK_FREQUENCY:
						data.rpm_request = {
							// parameter: SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQ,
							parameter:
								BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS
							// sensor_id: rpm_external_node_id
						};
						data.isMaxPeakFrequency = true;
						break;

					case ITEM_SPEED_OPTIONS.EXTERNAL:
						// if (rpm_external_source_type === RPM_SOURCES_TYPES.MANUAL) {
						// 	data.rpm_value = rpm_external_value;
						// } else if (rpm_external_source_type === RPM_SOURCES_TYPES.EXTERNAL_INPUT) {
						data.rpm_request = {
							parameter: rpm_external_node_parameter,
							sensor_id: rpm_external_node_id
						};
						// }
						break;
				}

				if (rpm_formula && data.rpm_request) {
					data.rpm_request.get_params = {
						unitExpression: rpm_formula
					};
				}
				// console.log(rpm_formula, data.rpm_request)
				return data;
			}

			return null;
		},

		linespeedOverlaySensorData() {
			const { equipmentData, rpmOverlayData } = this;
			// console.log('linespeedOverlaySensorData')
			if (rpmOverlayData && rpmOverlayData.rpm_request) {
				return rpmOverlayData.isMaxPeakFrequency
					? cloneDeep(this.sensorData)
					: cloneDeep(this.rpmOverlaySensorData);
			}

			return equipmentData ? equipmentData.linespeedSensor : null;
		},

		currentSensorTypeDataKey: () => 'sensorData',

		pickerOptions: that => {
			const mainShortcuts = !that.isCompare
				? datePickerShortcuts()
				: datePickerShortcuts().filter(sc => !sc.disabledForCompare);

			let shortcuts = [].concat(datePickerAdditionalShortcuts(), mainShortcuts);
			const timeRanges = ['1_hour', '3_hours', '12_hours'];

			shortcuts = shortcuts.map(sc => {
				let newSc = {
					...sc,
					onClick: picker => {
						that.rangeWithTime = timeRanges.some(r => r == sc.rangeName);
						setTimeout(() => {
							that.isTodayRangeClicked = sc.rangeName == 'today';
							// console.log('click ', sc.rangeName, /*getDateRange(sc.rangeName), picker*/)
							picker.$emit('pick', getDateRange(sc.rangeName));
						}, 100);
					}
				};

				if (sc.rangeName == 'today') newSc.text = 'Today (Live)';

				return newSc;
			});

			return Object.freeze({
				shortcuts: shortcuts,
				onPick(range) {
					that.isTodayRangeClicked = false;
					// console.log('onPick ', range, that.isTodayRangeClicked)
					that.pickedRange = range;
				},

				disabledDate(date) {
					const { minDate } = that.pickedRange;

					if (minDate && that.isCompare) {
						const minDateMs = minDate.getTime();
						const dateMs = date.getTime();
						// 604800000 = 3600 * 1000 * 24 * 7  ( 7 days );

						if (dateMs < minDateMs - 604800000 || dateMs > minDateMs + 604800000) {
							return true;
						}
					}

					return false;
				}
			});
		},

		itemsName() {
			return {
				one: this.$t('PDM_Item'),
				mult: this.$t('PDM_Items')
			};
		},

		navbarSettings() {
			// navigateButton: { parent: true, steps: 2 },
			let settings = {
				// navigateButton: { history: true, steps: -1 },
				showStandardNavItem: true,
				pageTitle: '<span><b>PdM</b>Matrix<sup>TM</sup></span>'
			};

			if (!this.isCompare) {
				if (this.sensorData) {
					settings.showPlantName = {
						name: this.sensorData.controller.plant.name
					};
				}
			}

			return Object.freeze(settings);
		},

		hasLubeZone() {
			const { sensorData } = this;
			const { isSDTsensor, isNCDSDT, isUltrasound } = this.currentSensorType;

			if (isUltrasound) return true;

			if (sensorData && sensorData.levelZones && (isSDTsensor || isNCDSDT)) {
				return sensorData.levelZones.some(lz => lz.is_lube_zone_included);
			}

			return false;
		},

		total_runtime_seconds() {
			const { sensorData } = this;
			if (sensorData && sensorData.is_runtime_tracking) {
				const { total_runtime_seconds } = sensorData;
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
				}
			}

			return '';
		},

		legendList() {
			const {
				isHumiditySensor,
				isNCDEnv,
				isNCDPressure,
				isBannerPressure,
				isNCDCustom_4_20
			} = this.currentSensorType;
			const { sensors } = this;

			let list = [];

			if (sensors.length) {
				if (
					isHumiditySensor ||
					isNCDEnv ||
					isNCDPressure ||
					isBannerPressure ||
					(isNCDCustom_4_20 &&
						sensors[0].alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM)
				) {
					list.push(
						{ label: this.tt('phrases.High_Alarm'), className: 'alarm' },
						{ label: this.tt('phrases.Low_Alarm'), className: 'blue' }
					);
				} else {
					list.push(
						{ label: this.tt('constants.Alarm'), className: 'alarm' },
						{ label: this.tt('constants.Warning'), className: 'warning' }
					);

					if (this.hasLubeZone) {
						list.push({
							label: this.tt('constants.Lubeline'),
							className: 'lubeline'
						});
					}

					list.push({ label: this.tt('constants.Good'), className: 'good' });
				}
			}

			return Object.freeze(list);
		},

		getSensorTitle: () => getSensorTitle,

		sensorTitle() {
			if (this.isCompare) return this.tt('Compare');

			if (this.sensors.length) {
				let additional_settings = [];

				if (
					this.currentSensorType.isNCDCustom_4_20 &&
					this.sensors[0].node_type === NCD_NODE_TYPES.POSITION_2
				) {
					additional_settings.push({
						key: 'ncd_ultrasound_position',
						label: this.tt('position')
					});
				}

				return getSensorTitle(this.sensors[0], {
					additional_settings,
					boldLabels: true
				});
			}
			return '';
		},

		localTimeZone() {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		}
	},

	methods: {
		...mapActions({
			setup_navbar: 'setup_navbar',
			set_sensor_state: 'sensors/set_sensor_state',
			fetch_sensor: 'sensors/fetch_sensor',
			set_sensor: 'sensors/set_sensor',
			fetch_measurement_units: 'measurement_units/fetch_measurement_units',

			set_filters: 'sensors/set_statistics_filters',
			forceRerender: 'forceRerender',
			toggle_ultrasound_command: 'sensors/toggle_ultrasound_command'
			// update_sensor_level_zone: 'sensors/update_sensor_level_zone'
			// thresholds_re_baseline: 'sensors/thresholds_re_baseline',

			// set_sensor_nested_state: 'sensors/set_sensor_nested_state',
		}),

		/*convertDaterange(daterange, timezone) {
			let newDaterange = cloneDeep(daterange);
			newDaterange[0] = getYmdDateString({ dateObj:newDaterange[0], timeZone: timezone, withTime:1 });
			newDaterange[1] = getYmdDateString({ dateObj:newDaterange[1], timeZone: timezone, withTime:1 });

			return newDaterange;
		},

		convertRangeTest(range) {
			// console.log(range)
			return [`${range[0]} GMT-4`, `${range[1]} GMT-4`];
		},*/

		toggleV2_1View() {
			this.V2_1ViewActive = !this.V2_1ViewActive;

			if (this.V2_1ViewActive) {
				this.sensors[0].data_set = DATASET.BANNER_TEMP_VIBE_V2_1;
			} else {
				this.sensors[0].data_set = this.initialSensorDataSet;
			}

			this.dropdownFilterbarUpdated++;
		},

		toggleStatsThresholds() {
			this.statsThresholdsActive = !this.statsThresholdsActive;
		},

		handleDaterange(range) {
			// console.log(this.isTodayRangeClicked)
			this.set_filters({
				...this.filters,
				daterange: range,
				daterange_setted_at: Date.now(),
				isLiveEnabled: this.isTodayRangeClicked
			});

			const { dateStart, dateFinish, parameter, source } = this.$route.query;

			if (dateStart || dateFinish) {
				let newPath = this.$route.path + '?';
				if (parameter) newPath += `parameter=${parameter}`;
				if (source) newPath += `${parameter ? '&' : ''}source=${source}`;
				this.$router.replace(newPath);
			}
		},

		toggleFilterbar(e) {
			this.showFilterbar = !this.showFilterbar;
			this.$refs.DropdownFilterbar.toggleFilterbar(e);
		},

		toConsole(arg) {
			console.log(arg);
		},

		update_sensor({ id, sensor }) {
			const { item, index } = findItemBy('id', id, this.sensors, { returnIndex: 1 });
			if (item) {
				this.sensors[index] = sensor;
				// console.log('update_sensor', this.sensors, sensor)
				this.lube_cycle_high_speed = sensor.lube_cycle_high_speed;
				this.dropdownFilterbarUpdated++;
			}
		},

		loadMeasurementUnitsIfNeeded(sensor) {
			const hasMeasurementUnit =
				sensor &&
				sensor.bannerV2Subtype &&
				sensor.bannerV2Subtype.parameters &&
				sensor.bannerV2Subtype.parameters.some(
					item => item.metric_unit_id != null || item.imperial_unit_id != null
				);

			if (
				!hasMeasurementUnit ||
				this.$store.state.measurement_units.itemsList.length
			) {
				return Promise.resolve();
			}

			return this.fetch_measurement_units({
				params: { max: -1 },
				notNotify: true,
				setToStore: 1
			});
		},

		initSensors(sensors) {
			if (sensors && sensors.length) {
				// console.log('initSensors', sensors)
				this.sensors = cloneDeep(sensors);
			} else {
				this.sensors = [];
				this.loadingQueue = [];
				this.fetchSensors(this.current_sensor_ids, 0);
			}
		},

		fetchSensors(ids, sensorIdx) {
			this.sensorsReadyCount = 0;
			this.sensorLoading = true;
			this.fetchSensorsAction(ids, sensorIdx);
		},

		fetchSensorsAction(ids, sensorIdx) {
			this.fetch_sensor({ itemId: ids[sensorIdx] })
				.then(async ({ value }) => {
					await this.loadMeasurementUnitsIfNeeded(value);
					const dashboardSensors = this.equipmentData
						? this.equipmentData.dashboardSensors
						: [];
					let sensorFromEquipment = cloneDeep(
						findItemBy('id', ids[sensorIdx], dashboardSensors)
					);
					sensorFromEquipment = sensorFromEquipment || {};

					this.sensors.push({ ...sensorFromEquipment, ...value });
					this.initialSensorDataSet = this.sensors[0].data_set;
					this.sensorsReadyCount++;

					if (sensorIdx < ids.length - 1) {
						this.fetchSensorsAction(ids, sensorIdx + 1);
					} else {
						this.loadingQueue.push(1);
						this.sensorLoading = false;
						// this.allSensorsReady
					}
				})
				.catch(error => {
					console.warn(error);
					if (error.response.status === 404) {
						this.changeRoute({ history: true, steps: -1 });
						setTimeout(() => {
							this.$notify({
								type: 'warning',
								title: 'Redirect',
								message: `${this.itemsName.one} with id: ${ids[sensorIdx]} - doesn't exists`
							});
						}, 200);
					}
					this.sensorLoading = false;
				});
		},

		fetchOverlaySensor(id) {
			this.overlaySensorLoading = true;
			this.fetch_sensor({ itemId: id })
				.then(({ value }) => {
					this.rpmOverlaySensorData = value;
					this.isOverlaySensorReady = true;
					this.overlaySensorLoading = false;
				})
				.catch(error => {
					this.overlaySensorLoading = false;
					console.warn(error);
				});
		},

		toggleHistory() {
			/*this.callMethodInCharts({
				methodName: 'updateYaxisByHistory',
				fromInstance: true,
			});*/

			this.showHistory = !this.showHistory;
		},

		reloadChart(chartId, settings = {}) {
			const chartIds = chartId ? [chartId] : null;
			const ChartsListWrapper = this.$refs['ChartsListWrapper'];
			if (ChartsListWrapper.length) {
				ChartsListWrapper.forEach(ref => {
					if (ref.reloadChart) {
						ref.reloadChart(chartIds, settings);
					}
				});
			}
		},

		callMethodInCharts(settings) {
			// const chartIds = chartId ? [chartId] : null;
			const ChartsListWrapper = this.$refs['ChartsListWrapper'];
			if (ChartsListWrapper.length) {
				ChartsListWrapper.forEach(ref => {
					if (ref.callMethodInAllCharts) {
						ref.callMethodInAllCharts(settings);
					}
				});
			}
		},

		getAllStatisticsData(settings = {}) {
			const { key, chart_ids } = settings;
			let allResultData = {};
			this.$refs['ChartsListWrapper'].forEach((ref, idx) => {
				allResultData[idx] = ref.ChartsListInstance.getChartsStatistics({
					transformed: true,
					...settings
				});
			});

			let result = key !== undefined ? allResultData[key] : allResultData;

			if (chart_ids) {
				result = result.filter(item => chart_ids.includes(item.chart_id));
			}

			// console.log('getAllStatisticsData', result)
			return result;
		},

		handleChangeChartsListWrappersReadyCounter({ val, payload }) {
			this.chartsListWrappersReadyCount += val;

			if (
				this.chartsListWrappersReadyCount === this.$refs['ChartsListWrapper'].length
			) {
				this.handleAllChartsListWrappersReady(payload);
			}
		},

		handleAllChartsListWrappersReady(statisticsDataList = {}) {
			// console.log(this.isCompare)
			if (this.isCompare) {
				let allResultData = this.getAllStatisticsData();

				const { maxStatisticsValueForAll } = this.findInStatistics(allResultData);
				// console.log('handleAllChartsListWrappersReady')
				this.$refs['ChartsListWrapper'].forEach(ref => {
					ref.ChartsListInstance.chartsInstancesList.forEach(Chart => {
						Chart.StatisticsTransformator.updateResultData({
							settingsList: [
								{
									accessor: 'chart_all_data_max_value',
									value: maxStatisticsValueForAll[Chart.chart_id]
								},
								{
									accessor: 'chart_points_max_value',
									value: maxStatisticsValueForAll[Chart.chart_id]
								}
							],
							additionalSettings: {
								callback: resultData => {
									Chart.assignDataToYAxis(resultData);
									Chart.emitChartOptionsReady();
								}
							}
						});
					});
				});
			} else {
				// console.log('allResultData', statisticsDataList)
				Object.values(statisticsDataList).forEach(item => {
					if (item.levelZoneData && item.levelZoneData.off_alarm_zone) {
						this.chartsWithOffAlarm.push(item.chart_id);
					}
				});
			}
		},

		findInStatistics(allResultData) {
			let maxValues = {};
			Object.values(allResultData).forEach(containerData => {
				containerData.forEach(chartResultData => {
					const { chart_id, chart_all_data_max_value } = chartResultData;
					maxValues[chart_id] = maxValues[chart_id] || -9999999;
					if (chart_all_data_max_value > maxValues[chart_id]) {
						maxValues[chart_id] = chart_all_data_max_value;
					}
				});
			});

			return {
				// firstStatisticsItemForAll: first,
				maxStatisticsValueForAll: maxValues
			};
		},

		handleChartsConfigsListReady(configs) {
			let parameters = [];

			configs.forEach(ci => {
				parameters = parameters.concat(ci.requestsList);
			});

			this.sensorParamsForSetupProblems = parameters;
		},

		// -----------------

		addNoteToChart(data) {
			this.pointData = this.setupPointData(data);
			this.chartMessageDialogInit = true;
			this.showNewMessage = true;
			// console.log(data)
		},

		setupPointData({ index, series }) {
			/*let graph_timestamp = null,
				message = '',
				full_file_name = '';
			const id_prop =
				custom_id == 'notes_flag' || custom_id == 'crashes_flag' ? 'pointId' : 2;*/
			const { data } = series.options;
			const { chart_id } = series.chart.userOptions;
			const point = data[index];

			if (point) {
				// console.log(series, point)
				if (point.id) {
					return {
						...point,
						graph_timestamp: localToUtcYmdHis(point.graph_timestamp),
						chartId: chart_id
					};
				} else if (point[2]) {
					//new note
					return {
						graph_timestamp: localToUtcYmdHis(point[2]),
						chartId: chart_id,
						metric_type: series.userOptions.customSettings.metric_type
					};
				} else if (point.pointId) {
					//crash
					return {
						metric_issue_alert_id: point.pointId,
						chartId: chart_id,
						metric_type: series.chart.options.chart_parameter_id
					};
				}
				/*const graph_timestamp = localToUtcYmdHis(point[id_prop]);
				full_file_name = point.full_file_name;
				if (custom_id == 'crashes_flag') {
					message = point.note || '';
				} else {
					message = point.text || '';
				}*/
			}

			/*return {
				// id: pointId,
				message: message,
				chartId: chart_id,
				graph_timestamp: graph_timestamp,
				// isCrash: custom_id == 'crashes_flag',
				full_file_name: full_file_name,
				metric_type: series.userOptions.customSettings.metric_type
			};*/
		},

		handleJoinCharts(payload) {
			const { prop } = payload;
			// this.problemsList = [];
			this.splitNCDCharts = false;

			if (prop == this.joinChartsBy.prop) {
				this.joinChartsBy = { prop: '' };
			} else {
				this.joinChartsBy = payload;
			}
		},

		handleSplitNCDCharts() {
			this.splitNCDCharts = !this.splitNCDCharts;
			this.joinChartsBy = { prop: this.splitNCDCharts ? 'split' : null };
		},

		// --------------------

		handleSetupThresholds({ parameters, isOffAlarm }) {
			this.levelZoneSetupSettings = { isOffAlarm, parameters };
			this.showZoneSetup = true;
		},

		toggleOffAlarm(enableOnParameters) {
			if (enableOnParameters) {
				const chart_ids = enableOnParameters.map(param_id => `chart-${param_id}`);
				let allResultData = this.getAllStatisticsData({
					key: 0,
					chart_ids,
					statistics_result: 1,
					includeResources: 1
				});

				const parameters = allResultData.map(statistics_result => {
					const paramItem = statistics_result.resources.chart_config.requestsList[0];
					return {
						chart_id: statistics_result.chart_id,
						parameterItem: paramItem,
						levelZoneData: statistics_result.levelZoneData,
						primaryLevelZoneData: statistics_result.primaryLevelZoneData,
						levelZones: statistics_result.levelZones
					};
				});

				this.handleSetupThresholds({ isOffAlarm: true, parameters });
			} else {
				if (this.chartsWithOffAlarm.length) {
					this.callMethodInCharts({
						ids: this.chartsWithOffAlarm,
						methodName: 'submitNewThresholdsAction',
						fromInstance: true,
						payload: {
							data: { off_alarm_zone: 0 }
						}
					});
				}
				// console.log(this.chartsWithOffAlarm)
			}
		},

		closeLevelZoneSetup() {
			this.showZoneSetup = false;
			this.levelZoneSetupSettings = {};
		},

		handleUnlockLube({ sensorId }) {
			// console.log(row)
			this.confirmHelper({
				insertToMessage: `<b>${this.$t('phrases.reset_cycle')}</b>`
			})
				.then(() => {
					const payload = {
						url: `/ultrasound/commands/${sensorId}/reset/cycle?resetLubeCycle=1`,
						resultMessage: { text: this.$t('phrases.lube_cycle_was_reset') }
					};

					/*if (payload) {
						console.log('unblockLube', payload)
						return
					}*/

					this.sensorLoading = true;

					this.toggle_ultrasound_command(payload)
						.then(() => {
							this.initSensors();
							// this.reloadChart(chartId);
						})
						.catch(() => {
							this.sensorLoading = false;
						});
				})
				.catch(() => {});
		},

		handleUnlockFFT(payload) {
			const BannerFilterBlock = this.$refs.BannerFilterBlock;

			if (BannerFilterBlock && BannerFilterBlock.handleUnlockFFT) {
				BannerFilterBlock.handleUnlockFFT(payload);
			}
		},

		// --------
		openFFTCharts({ payload, sensorType }) {
			const { id, sensor_id } = payload;
			const { isBannerTempVibe2, isBannerV2_1, isBannerM25 } = sensorType;
			const type =
				isBannerTempVibe2 || isBannerV2_1 || isBannerM25 ? 'banner' : 'ncd';
			// const { baseURL } = axios.defaults;
			let url = `${window.location.origin}/${type}/${sensor_id}/fft/${id}`;
			// url = setupGetParamsStr(url, params);
			const link = document.createElement('a');
			link.href = url;
			link.target = '_blank';
			// console.log(url)

			link.click();
		},

		handleUnlockFFTSuccess({ fft_lock_item, sensorId }) {
			let { index } = findItemBy('id', sensorId, this.sensors);
			index = index == null ? 0 : index;
			this.sensors[index].last_fft_lock = fft_lock_item;
			this.dropdownFilterbarUpdated++;
			// this.callMethodInCharts({
			// 	methodName: 'addUnlFFT',
			// 	fromInstance: true,
			// 	payload: y_filters
			// });
		}

		/*updateChartsByYfilters(y_filters) {
			this.callMethodInCharts({
				methodName: 'updateChartByYfilters',
				fromInstance: true,
				payload: y_filters
			});
		}*/
	},

	watch: {
		overlaySensorId(id) {
			// console.log('overlaySensorId', id)
			if (id) {
				this.fetchOverlaySensor(id);
			}
		},

		sensorData(data) {
			if (data && data.controller) {
				this.setup_navbar(this.navbarSettings);

				var newMetric = data.controller.plant
					? data.controller.plant.metric_system_type
					: data.controller.metric_system_type;

				// console.log('watch sensorData', this.filters.metric, )
				if (this.filters.measurement != newMetric) {
					this.set_filters({
						...this.filters,
						measurement: data.controller.plant
							? data.controller.plant.metric_system_type
							: data.controller.metric_system_type
					});
				}

				if (data.is_hidden_ncd_active_vertical_axis) {
					if (data.ncd_active_vertical_axis === 1) {
						this.activeAxis = 2;
					}
				}
			}
		}

		/*charts_filters(y_filters) {
			console.log('charts_filters', y_filters)
			this.updateChartsByYfilters(y_filters);
		}*/

		/*layout_click_target(target) {
			if (target) {
				if (
					this.chartOperationsPopoverShow &&
					!target.closest('.custom-popover-parent')
				) {
					this.toggleChartOperationsPopover();
				}
			}
		}*/
	},

	created() {
		if (this.prevent_drop_daterange) {
			this.set_sensor_state({ stateProp: 'prevent_drop_daterange', value: false });
		}

		/*Highcharts.setOptions({
			time: {
				// timezone: 'Canada/Eastern'
				timezone: this.localTimeZone
			}
		});*/
		/*else {
			this.handleDateRange(['2021-12-20', '2021-12-21']);
		}*/
	},

	beforeMount() {
		if (Highcharts) {
			if (this.$Lang.currentLangId === LANGUAGE_TYPES.SPANISH) {
				Highcharts.setOptions({
					lang: {
						months: this.$translate(localeMonthsFull()),
						weekdays: this.$translate(weekdays()),
						shortMonths: this.$translate(localeMonths(true))
					}
				});
			}
		}

		const { params, query } = this.$route;
		const sensorId = +params.sensorId || +params.id || params.id;
		// const { dateStart, dateFinish } = getParamsFromUrl(this.$route.fullPath);
		if (
			this.filters.daterange &&
			this.filters.daterange.length &&
			!this.isIndustrialMatrix
		) {
			const { days } = getTimeDifference({
				from: this.filters.daterange[0],
				to: this.filters.daterange[1]
			});

			if (days > 30) {
				this.set_filters({
					...this.filters,
					daterange: getDateRange('last_7_days', {
						getDateString: true,
						withTime: true
					}),
					isLiveEnabled: false
				});
			}
		}

		if (query) {
			let { dateStart, dateFinish, parameter, source } = query;
			if (source && source == 'report') {
				this.statsThresholdsActive = true;
			}

			if (dateStart && dateFinish) {
				// console.log(dateFinish, getYmdDateString({ms:query.dateFinish}))
				this.set_filters({
					...this.filters,
					daterange: [
						getYmdDateString({ ms: dateStart, withTime: true }),
						getYmdDateString({ ms: dateFinish, withTime: true })
					],
					isLiveEnabled: false
				});
			}

			if (parameter) {
				let parameterType = findItemBy('id', +parameter, sensorParametersListNCD());

				if (parameterType) {
					this.activeAxis = parameterType.axis_id || 1;
				}
			}
		}
		// console.log(this.filters, getDateRange('today', { getDateString: true, withTime: true }))
		/*if (!this.filters.daterange) {
			this.preventFetch = true;
			this.set_filters({
				...this.filters,
				daterange: getDateRange('today', { getDateString: true, withTime: true })
			})
		}*/

		if (validateRouteParams(sensorId)) {
			this.isCompare = sensorId === 'compare';
			this.splitNCDCharts = this.isCompare;
			this.current_sensor_ids = this.isCompare ? this.compareList : [sensorId];

			// this.current_sensor_ids = this.isCompare ? this.compareList : [sensorId, 1047]; // todo
			if (this.overlaySensorId) {
				this.fetchOverlaySensor(this.overlaySensorId);
			}

			this.initSensors();
			this.setup_navbar(this.navbarSettings);
		} else {
			// this.$router.push({ name: 'NotFoundPage' });
		}
	},

	beforeDestroy() {
		// console.log('beforeDestroy')
		this.sensors = [];
	}
};
</script>
