<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="sensorLoading || equipmentLoading"
			:itemsName="itemsName.one"
		/>

		<div :class="['statistics-page one-chart-page', {'full-height-chart': chartsToDisplay}]">
			<div :class="['tab-container reportBlock-tab show_tab', {'show-RPM': showRPM}]">
				<div key="charts_tab" :class="['tab-container']">
					<div :class="['section-row']" v-if="allSensorsReady && equipmentDataReady">
						<ChartsListWrapper
							ref="ChartsListWrapper"
							v-for="(sensor, idx) in sensors"
							:key="`wrapper_chart-${sensor.id}`"
							@event="handleEventNew"
							:chartsContainerIdx="idx"
							oneChartOnly
							enableAxisSelector
							splitNCDCharts
							:rootFilters="filters"
							:sensorData="sensor"
							:activeAxis="activeAxis"
							:additionalProps="additionalProps"
							:additionalChartPayload="additionalChartPayload"
							:injectToChartOptions="injectToChartOptions"
							:getParamsByIds="chartsToDisplay"
							:rpmOverlayData="rpmOverlayData"
							:linespeedOverlaySensorData="linespeedOverlaySensorData"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';

import Highcharts from 'highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
stockInit(Highcharts);
boost(Highcharts);
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);
// import axios from '@/services/api/axiosService';

import { mapState, mapActions } from 'vuex';
import {
	// dateRangeMixin,
	navigation,
	eventHandler,
	sensorTypeMixin,
	fetchItemsHelper
} from '@/mixins';

import {
	validateRouteParams,
	// getDateRange,
	findItemBy,
	getYmdDateString,
	cloneDeep
} from '@/helpers';

import { ITEM_SPEED_OPTIONS, RPM_SOURCES_TYPES } from '@/constants/global';

import { localeMonths, localeMonthsFull, weekdays } from '@/constants/date_time';
// import { getParamsFromUrl } from '@/services/api/api_helpers';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { getSensorMetricSystemType } from '@/helpers/specialHelpers';

// import { /*ncdAxisList,*/  } from '@/constants/global';
import {
	sensorParametersListNCD,
	manualRouteSensorParametersList,
	BANNER_V2_1_VIBRATION_PARAMETERS_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';

export default {
	mixins: [
		// dateRangeMixin,
		navigation(),
		eventHandler(),
		sensorTypeMixin(),
		fetchItemsHelper()
	],
	components: {
		ChartsListWrapper: () => import('./charts/ChartsListWrapper.vue')
		// RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
	},

	props: {
		sensorDataFromProps: Object,
		// equipmentData: null
	},

	data() {
		return {
			sensorLoading: false,
			someChartLoading: true,

			sensors: [],
			// current_sensor_ids: [],
			sensorsReadyCount: 0,

			lube_cycle_high_speed: false,

			loadingQueue: [],

			activeAxis: 1,
			chartsListWrappersReadyCount: 0,
			filters: {},

			equipmentData: null,
			equipmentLoading: false
		};
	},

	computed: {
		...mapState({
			// filters: state => state.sensors.statistics_filters,
			charts_filters: state => state.sensors.charts_filters,
			authUser: state => state.auth.authUser
		}),

		additionalProps: that => ({
			lube_cycle_high_speed: that.lube_cycle_high_speed,
			accessToThresholds: false,
			hideZoomBlock: true,
			showToggleNavigator: true,
			hideExportButton: true,
			setIsGraphMountedToWindow: true,
			hideChartHeader: true,
			disableAnimationAndSpinner: !!that.chartsToDisplay,
			oneChartOnly: true
		}),

		injectToChartOptions() {
			const pageHeight = window.innerHeight;
			// console.log(pageHeight)
			const height = this.chartsToDisplay ? pageHeight : 250;
			const marginBottom = this.chartsToDisplay ? 50 : 40;
			const animation = !this.chartsToDisplay;

			return  Object.freeze({
				chart: { height, marginBottom, animation },
				plotOptions: {
					series: {
						animation: animation
					},
				},
				navigator: { enabled: false }
			})
		},

		sensorId() {
			const { params } = this.$route;
			return +params.sensorId || +params.id || params.id;
		},

		current_sensor_ids: that => [that.sensorId],

		allSensorsReady() {
			// console.log('allSensorsReady', this.sensorsReadyCount, this.current_sensor_ids)
			return this.sensorsReadyCount === this.current_sensor_ids.length;
		},

		enableRPM() {
			return this.routeQuery && this.routeQuery.is_rpm_visible;
		},

		showRPM() {
			// console.log('showRPM')
			return this.enableRPM && this.sensorData && this.sensorData.equipment.is_rpm_visible;
		},

		equipmentDataReady() {
			// console.log('equipmentDataReady', this.sensorData)
			if (this.showRPM && this.sensorData.equipment_id) {
				return !!this.equipmentData;
			}
			return true;
		},

		sensorData() {
			// console.log('sensorData')
			if (this.allSensorsReady) {
				return this.sensorDataFromProps || this.sensors[0];
			}
			return null;
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

		/*enableAxisSelector() {
			const { currentSensorType } = this;
			if (currentSensorType) {
				const { isNCDTempVibe, isNCDWiredTempVibe, isNCDTempVibeCurr } = currentSensorType;

				return isNCDTempVibe || isNCDWiredTempVibe || isNCDTempVibeCurr;				
			}

			return false;
		},*/

		/*axisRadioBlockSettings: () =>
			Object.freeze({
				hideTitle: true,
				inline: true,
				buttonType: 'primary',
				className: 'inverted standard'
			}),*/

		/*axisRadioButtonsList() {
			let result = [];
			
			if (this.enableAxisSelector && this.sensorData) {
				const {
					ncd_active_vertical_axis, is_hidden_ncd_active_vertical_axis
				} = this.sensorData;


				ncdAxisList.forEach(axis => {
					if (ncd_active_vertical_axis === axis.id) {
						if (!is_hidden_ncd_active_vertical_axis) {
							result.push({ ...axis, name: axis.name + ' (V)'});
						}
					} else {
						result.push(axis);
					}
				})
			}

			return Object.freeze(result);
		},*/

		currentSensorTypeDataKey: () => 'sensorData',

		itemsName() {
			return {
				one: this.$t('PDM_Item'),
				mult: this.$t('PDM_Items')
			};
		},

		routeQuery() {
			return this.$route.query;
		},

		access_token: that => that.routeQuery && that.routeQuery.token,

		chartsToDisplay() {
			const { routeQuery } = this;
			if (routeQuery && routeQuery.metric_type) {
				const chartIds = routeQuery.metric_type
					.split(',')
					.map(id => parseInt(id))
					.filter(id => !isNaN(id));

				return chartIds;
			}

			return null;
		},
		
		additionalChartPayload() {
			const { routeQuery } = this;

			if (routeQuery) {
				let {
					max_metric_value,
					max_metric_threshold_value,
					max_metric_threshold_historic_value,
					graph_height_scale,
					timezone_offset
				} = routeQuery;

				if (graph_height_scale || max_metric_value || max_metric_threshold_value || max_metric_threshold_historic_value) {
					let yAxisMax;

					max_metric_value = +max_metric_value;
					max_metric_threshold_value = +max_metric_threshold_value;
					max_metric_threshold_historic_value = +max_metric_threshold_historic_value;
					graph_height_scale = +graph_height_scale;

					if (!isNaN(graph_height_scale)) {
						yAxisMax = graph_height_scale;
					} else {
						[max_metric_value, max_metric_threshold_value, max_metric_threshold_historic_value].forEach(val => {
							if (!isNaN(val)) {
								if (yAxisMax === undefined || val > yAxisMax) {
									yAxisMax = val;
								}
							}
						});
					}

					return { 
						yAxisMax,
						yAxisSoftMax: yAxisMax || max_metric_value,
						timezone_offset
					}
				}
			}

			return {};
		},

		// --------------------
		overlaySensorId() {
			const {rpmOverlayData, current_sensor_ids} = this;
			return rpmOverlayData && rpmOverlayData.rpm_request &&
							rpmOverlayData.rpm_request.sensor_id !== current_sensor_ids[0] ?
							rpmOverlayData.rpm_request.sensor_id : null;
		},

		rpmOverlayData() {
			if (this.sensorData && this.equipmentData && this.equipmentData.rpm_source_item) {
			// console.log('computed rpmOverlayData', this.equipmentData.rpm_source_item)
				let { 
					rpm_source_item, rpmSources,
					// rpm_external_source_type, rpm_external_value,
					rpm_external_node_parameter, rpm_external_node_id,
					rpm_formula, //is_rpm_visible
				} = this.equipmentData;
				let data = { is_rpm_visible: true };

				// console.log('rpmSources', rpmSources)

				// rpm_source_item = 4

				switch(rpm_source_item) {
					case ITEM_SPEED_OPTIONS.LINESPEED_RPM: {
						let { 
							prodline_rpm_source_type, /*prodline_rpm_value,*/
							prodline_rpm_node_parameter, prodline_rpm_node_id
						} = this.equipmentData; 
						// const {	line_speed_rpm_evaluated } = rpmSources;
						// prodline_rpm_source_type = 2
						
						if (prodline_rpm_source_type === RPM_SOURCES_TYPES.MANUAL) {
							data.rpm_value = rpmSources && rpmSources.line_speed_rpm_evaluated;
						} else if (prodline_rpm_source_type === RPM_SOURCES_TYPES.EXTERNAL_INPUT) {
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
						parameter: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS,
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
					}
				}
				// console.log(rpm_formula, data.rpm_request)
				return data;				
			}

			return null;
		},

		linespeedOverlaySensorData() {
			const { equipmentData, rpmOverlayData } = this;
			// console.log('linespeedOverlaySensorData', equipmentData)
			if (rpmOverlayData && rpmOverlayData.rpm_request) {
					return rpmOverlayData.isMaxPeakFrequency
										? cloneDeep(this.sensorData)
										: cloneDeep(this.rpmOverlaySensorData);
			}

			return equipmentData ? equipmentData.linespeedSensor : null;
		},
	},

	methods: {
		...mapActions({
			set_sensor_state: 'sensors/set_sensor_state',
			fetch_sensor: 'sensors/fetch_sensor',
			fetch_equipment: 'equipments/fetch_equipment'
		}),

		/*calcFirstStatisticsItemForAll(statistics) {
			let first;

			Object.values(statistics).forEach(std => {
				const { first_statistics_item, flagsData } = std;
				if (first) {
					if (flagsData) {
						Object.values(flagsData).forEach(flagStat => {
							flagStat.forEach(flagItem => {
								if (flagItem.x < first[0]) {
									first = [flagItem.x, 0];
								}
							});
						});
					}
				} else {
					first = first_statistics_item;
				}
			});

			return first;
		},*/

		/*chartsListDataReady(data) {
			const {chartsListData } = data;
			this.loadingQueue.push(1);
			// console.log('3', data)
			chartsListData.forEach(std => {
				const { parameter_type_id, statisticsData } = std;
				this.statisticsDataList[parameter_type_id] = statisticsData;
				this.statisticsDataCount = Object.keys(this.statisticsDataList).length;
			});
			// console.log('chartsListDataReady', this.statisticsDataList)
			this.firstStatisticsItemForAll = this.calcFirstStatisticsItemForAll(
				this.statisticsDataList
			);
			this.statisticsDataReady = false;
			setTimeout(() => {
				this.statisticsDataReady = true;
			}, 50);
			// console.log('fin', data, this.statisticsDataList);
		},*/

		initSensors(sensors) {
			if (sensors && sensors.length) {
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
				.then(({ value }) => {
					const dashboardSensors = this.equipmentData
						? this.equipmentData.dashboardSensors
						: [];
					let sensorFromEquipment = findItemBy(
						'id',
						ids[sensorIdx],
						dashboardSensors
					);
					sensorFromEquipment = sensorFromEquipment || {};

					this.sensors.push({ ...sensorFromEquipment, ...value });
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

		fetchEquipment(id) {
			this.doFetchAction('fetch_equipment', 'equipmentData', 'equipmentLoading', {
				itemId: id
			});
		},
		/*getAllStatisticsData(settings = {}) {
			const { key, chart_ids } = settings;
			let allResultData = {};
			this.$refs['ChartsListWrapper'].forEach((ref, idx) => {
				allResultData[idx] = ref.ChartsListInstance.getChartsStatistics({
					transformed:true,
					...settings
				});
			});
			
			let result = key !== undefined ? allResultData[key] : allResultData;

			if (chart_ids) {
				result = result.filter(item => chart_ids.includes(item.chart_id));
			}

			// console.log('getAllStatisticsData', result)
			return result;
		},*/

		/*handleChangeChartsListWrappersReadyCounter({val, payload}) {
			this.chartsListWrappersReadyCount += val;
			// console.log('2', val, this.chartsListWrappersReadyCount)
			if (this.chartsListWrappersReadyCount === this.chartsListWrppersCount) {
				this.handleAllChartsListWrappersReady(payload);
			}
		},

		handleAllChartsListWrappersReady(statisticsDataList) {
			if (this.isCompare) {
				let allResultData = this.getAllStatisticsData();

				const {	maxStatisticsValueForAll } = this.findInStatistics(allResultData);
				// console.log(maxStatisticsValueForAll)
				this.$refs['ChartsListWrapper'].forEach(ref => {
					ref.ChartsListInstance.chartsInstancesList.forEach(Chart => {
							Chart.StatisticsTransformator.updateResultData({
								settingsList: [
									{
										accessor: 'chart_all_data_max_value',
										value: maxStatisticsValueForAll[Chart.chart_id],
									},
									{
										accessor: 'chart_points_max_value',
										value: maxStatisticsValueForAll[Chart.chart_id],
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
				Object.values(statisticsDataList).forEach(
					item => {
						if (item.levelZoneData && item.levelZoneData.off_alarm_zone) {
							this.chartsWithOffAlarm.push(item.chart_id);
						}
					}
				);
			}
		},

		findInStatistics(allResultData) {
			let maxValues = {};

			Object.values(allResultData).forEach(containerData => {
				Object.values(containerData).forEach(chartResultData => {
				const { chart_id, chart_all_data_max_value } = chartResultData;
					maxValues[chart_id] = maxValues[chart_id] || -9999999;
					if (chart_all_data_max_value > maxValues[chart_id]) {
						maxValues[chart_id] = chart_all_data_max_value;
					}
				}) 
			});

			return {
				// firstStatisticsItemForAll: first,
				maxStatisticsValueForAll: maxValues
			};
		},*/
	},

	watch: {
		sensorData(data) {
			// console.log('watch sensorData', data)
			if (data) {
				if (this.showRPM && data.equipment_id) {
					this.fetchEquipment(data.equipment_id);
					// this.equipmentData = data.equipment;
				}
			}
			if (data) {
				this.filters = {
					...this.filters,
					measurement: getSensorMetricSystemType(data, this.equipmentData)
				};

				if (data.is_hidden_ncd_active_vertical_axis) {
					if (data.ncd_active_vertical_axis === 1) {
						this.activeAxis = 2;
					}
				}
			}
		},

		overlaySensorId(id) {
			// console.log('overlaySensorId', id)
			if (id) {
				this.fetchOverlaySensor(id);
			}
		},
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

		const { query } = this.$route;
		// const sensorId = +params.sensorId || +params.id || params.id;
		// const { dateStart, dateFinish } = getParamsFromUrl(this.$route.fullPath);

		if (query) {
			let { dateStart, dateFinish, parameter, measurement, meeting_tracker_id, timezone_offset_off } = query;

			let filters = {};
			if (dateStart && dateFinish) {
				// console.log(dateStart, getYmdDateString({ms:query.dateStart}))
				filters.daterange = [
					getYmdDateString({ ms: dateStart, withTime: true }),
					getYmdDateString({ ms: dateFinish, withTime: true })
				]
			}

			if (measurement) filters.measurement = measurement;
			filters.meeting_tracker_id = meeting_tracker_id || null;
			filters.timezone_offset_off = timezone_offset_off || null;			

			this.filters = {
				...this.filters,
				...filters
			};

			if (parameter) {
				let parameterType =
					findItemBy('id', +parameter, sensorParametersListNCD()) ||
					findItemBy('id', +parameter, manualRouteSensorParametersList());

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

		if (validateRouteParams(this.sensorId)) {
			// this.current_sensor_ids = [sensorId];

			this.initSensors();
		} else {
			// this.$router.push({ name: 'NotFoundPage' });
		}
	},

	/*mounted() {
		this.$nextTick().then(() => {
			// document.querySelector('.close_tab').style = 'display:none';
		});
	},*/

	beforeDestroy() {
		// this.initStatistics({stateProp:'statisticsDataList', list:sensorParametersList});
		// this.setup_navbar({});
		this.sensors = [];
	}
};
</script>
