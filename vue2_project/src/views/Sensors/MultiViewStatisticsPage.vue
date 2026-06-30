<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="sensorLoading"
			:itemsName="itemsName.one"
		/>
		<!-- <button @click="reloadChart('chart-4')">reload chart</button> -->
		<!-- <button @click="forceRerender('DashboardLayoutComponentKey')">rerender</button> -->

		<div
			:class="[
				'view-wrapper item-page-wrapper statistics-page specifications-block-wrapper',
				'multi-view-statistics'
			]"
		>
			<div :class="['section-row']">
				<div
					:class="['mrow flex wrap page-header align-center relative ']"
				>
					<div class="images-part mcol-xs-12 mcol-sm-2">
						<EquipmentPictureBlock
							@event="handleEventNew"
							:equipmentData="equipmentData"
						/>
					</div>

					<div class="mcol-xs-12 mcol-sm-2 mcol-lg-2 fluid flex align-center wrap">
						<div class="title page-title capitalize span-block" v-if="multiViewData">
							{{ multiViewData.name }}
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

					<div class="mcol-xs-12 mcol-sm-auto">
						<div class="button-item chart-switcher text-right">
							<div class="relative flex">
								<el-button-group>
									<el-button
										v-for="item in metricSystemsList"
										:key="`metricSystem-${item.id}`"
										@click="switchMetricSystem(item)"
										type="primary"
										native-type="button"
										v-text="item.name"
										:class="{ active: filters.measurement === item.id }"
										class="inverted"
									/>
								</el-button-group>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section-row tab-container reportBlock-tab" :class="'show_tab'">
				<div
					key="charts_tab"
					:class="['tab-container']"
				>
					<div
						:class="['content-row']"
						v-for="(chart, idx) in multiViewChartsList"
						:key="`mv_chart-${chart.id}`"
					>						
						<CommonChartItemWrapper
							class=""
							:chartWrapperIdx="idx"
							ref="CommonChartItemWrapper"
							chartFactoryContainerName="MultiViewChartFactoryContainer"
							chartFactoryName="MultiViewChart"
							@event="handleEventNew"
							:additionalProps="additionalProps"
							:dynamicProps="getChartDynamicProps(chart)"
							:buildChartsPayloadProps="getBuildChartPayloadProps(chart)"
							:setupChartsConfigsListSettings="getChartConfigsSetting(chart)"
							:rootFilters="filters"
						>
							<template v-slot:custom_mock>
								<div class="text-center card">
									<div class="card-content">
										{{ tt('phrases.Has_not_Statistics_for_this_range') }}...
									</div>
								</div>
							</template>
						</CommonChartItemWrapper>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="chartThresoldsDialogInit"
			center
			:title="tt('Alarms')"
			:append-to-body="true"
			:visible.sync="showThresholdsDialog"
			class="dialog-decorate-header filled-header standard"
		>
			<GraphThresholdsFormWrapper
				@event="handleEventNew"
				@closeDialog="showThresholdsDialog = false"
				:visible="showThresholdsDialog"
				:multiViewData="multiViewData"
				:thresholdsSetupData="showThresholdsDialog ? thresholdsSetupData : null"
			/>
				<!-- :visible="showThresholdsDialog" -->
		</el-dialog>

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
	// sensorTypeMixin,
	actionButtonsMixin
} from '@/mixins';

import {
	getDateRange,
	findItemBy,
	getYmdDateString,
	// cloneDeep,
	getTimeDifference,
	// convertMsToHours
} from '@/helpers';

import {
	// NCD_NODE_TYPES, NCD_ALARM_TYPES,
	// ITEM_SPEED_OPTIONS, RPM_SOURCES_TYPES,
	// DATASET
} from '@/constants/global';

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
	metricSystemsList,
	// ncdAxisList,
	// SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';

import { LANGUAGE_TYPES } from '@/localization/utils';
// import { getSensorTitle } from '@/helpers/specialHelpers';

// import isEmpty from 'lodash/isEmpty';

export default {
	mixins: [
		// dateRangeMixin,
		navigation(),
		eventHandler(),
		// sensorTypeMixin(),
		actionButtonsMixin()
	],
	components: {
		CommonChartItemWrapper: () => import('@/components/charts/CommonChartItemWrapper.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),		
		EquipmentPictureBlock: () => import('./charts/EquipmentPictureBlock.vue'),
		GraphThresholdsFormWrapper: () => import('./charts/MultiView/GraphThresholdsFormWrapper.vue'),
	},

	props: {
		equipmentData: {type: Object, required: true},
		multiViewsList: Array
	},

	data() {
		return {
			joinChartsBy: { prop: '' },
			isTodayRangeClicked: false,

			rangeWithTime: false,
			pickedRange: {},

			showZoneSetup: false,
			levelZoneSetupSettings: {},

			sensorLoading: false,

			chartsListWrappersReadyCount: 0,

			// ---------------
			chartThresoldsDialogInit: false,
			showThresholdsDialog: false,
			thresholdsSetupData: null
		};
	},

	computed: {
		...mapState({
			filters: state => state.sensors.statistics_filters,
			// charts_filters: state => state.sensors.charts_filters,
			prevent_drop_daterange: state => state.sensors.prevent_drop_daterange,
			layout_click_target: state => state.global.layout_click_target,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix
		}),

		metricSystemsList: () => Object.freeze(metricSystemsList()),

		multiViewData() {
			if (this.multiViewsList) {
				const { params } = this.$route;
				const multiViewId = +params.multiViewId || +params.id || params.id;
				return findItemBy('id', multiViewId, this.multiViewsList);
			}
			return null;
		},

		multiViewChartsList: that => that.multiViewData ? Object.freeze(that.multiViewData.multi_view_graphs) : [],

		// multiViewChartsList: that => that.multiViewData ? [Object.freeze(that.multiViewData.multi_view_graphs)[0]] : [],


		additionalProps: () => ({
			customMock: true,
			chartWrapperClass: 'content-row',
			chartItemComponentClass: 'card',
			chartContainerClass: 'card-content',
			customChartHeader: {
				componentPath: 'views/Sensors/charts/MultiView/MultiViewChartItemHeader',
				// multiViewData: that.multiViewData
			},
		}),

		// CONTROLLER_TYPES: () => CONTROLLER_TYPES,

		// currentSensorTypeDataKey: () => 'sensorData',

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
							picker.$emit('pick', getDateRange(sc.rangeName, {todayEndsAtMidNight:1}));
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
				one: this.$t('Multi_View'),
				mult: this.$t('Multi_Views')
			};
		},

		navbarSettings() {
			// navigateButton: { parent: true, steps: 2 },
			let settings = {
				// navigateButton: { history: true, steps: -1 },
				showStandardNavItem: true,
				pageTitle: '<span><b>PdM</b>Matrix<sup>TM</sup></span>'
			};

			if (this.equipmentData) {
				settings.showPlantName = {
					name: this.equipmentData.plant_name
				};
			}

			return Object.freeze(settings);
		},

		// getSensorTitle: () => getSensorTitle,

		/*sensorTitle() {
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
		},*/

		localTimeZone() {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		}
	},

	methods: {
		...mapActions({
			setup_navbar: 'setup_navbar',
			// fetch_sensor: 'sensors/fetch_sensor',
			// set_sensor: 'sensors/set_sensor',

			set_filters: 'sensors/set_statistics_filters',
			forceRerender: 'forceRerender',
		}),

		getChartProps(chart) {
			return Object.freeze({...this.additionalProps, graphItemData: chart})
		},
		getBuildChartPayloadProps(chart) {
			return Object.freeze({ graphItemData: chart });
		},
		getChartConfigsSetting(chart) {
			return Object.freeze({ graph_items: chart.graph_items });
		},
		getChartDynamicProps(chart) {
			return {
				graphItemData: chart,
				// multiViewData: this.multiViewData,
				showThresholdsDialog: this.showThresholdsDialog				
			}
		},

		handleDaterange(range) {
			// console.log(this.isTodayRangeClicked)
			this.set_filters({
				...this.filters,
				daterange: range,
				daterange_setted_at: Date.now(),
				isLiveEnabled: this.isTodayRangeClicked
			})
		},

		switchMetricSystem({ id }) {
			// console.log(id)
			this.set_filters({ ...this.filters, measurement: id });
		},

		toConsole(arg) {
			console.log(arg);
		},

		reloadChart(chartId) {
			const CommonChartItemWrapper = this.$refs['CommonChartItemWrapper'];
			if (CommonChartItemWrapper) {
				if (CommonChartItemWrapper.reloadChart) {
					CommonChartItemWrapper.reloadChart(chartId);
				}
			}
		},

		callMethodInCharts(/*settings*/) {
			// const chartIds = chartId ? [chartId] : null;
			/*const CommonChartItemWrapper = this.$refs['CommonChartItemWrapper'];
			if (CommonChartItemWrapper) {
				if (CommonChartItemWrapper.callMethodInAllCharts) {
					CommonChartItemWrapper.callMethodInAllCharts(settings);
				}
			}*/
		},

		/*getAllStatisticsData(settings = {}) {
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
		},*/

		/*handleChangeChartsListWrappersReadyCounter({ val, payload }) {
			this.chartsListWrappersReadyCount += val;

			if (
				this.chartsListWrappersReadyCount === this.$refs['ChartsListWrapper'].length
			) {
				this.handleAllChartsListWrappersReady(payload);
			}
		},*/

		/*handleAllChartsListWrappersReady(statisticsDataList = {}) {
			// console.log(this.isCompare)
			if (this.isCompare) {
				let allResultData = this.getAllStatisticsData();

				const { maxStatisticsValueForAll } = this.findInStatistics(allResultData);
				// console.log(maxStatisticsValueForAll)
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
			}
		},*/

		// -----------------

		/*handleJoinCharts(payload) {
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
		},*/

		// --------------------

		toggleThresholdsDialog(payload) {
			// console.log(graphItemData)
			this.chartThresoldsDialogInit = true;
			this.thresholdsSetupData = payload;
			this.showThresholdsDialog = !this.showThresholdsDialog;
		},

		closeLevelZoneSetup() {
			this.showZoneSetup = false;
			this.levelZoneSetupSettings = {};
		},

		// --------
		/*openFFTCharts({ payload, sensorType }) {
			const { id, sensor_id } = payload;
			const type = (sensorType.isBannerTempVibe2 || sensorType.isBannerV2_1) ? 'banner' : 'ncd';
			// const { baseURL } = axios.defaults;
			let url = `${window.location.origin}/${type}/${sensor_id}/fft/${id}`;
			// url = setupGetParamsStr(url, params);
			const link = document.createElement('a');
			link.href = url;
			link.target = '_blank';
			// console.log(url)

			link.click();
		}*/
	},

	watch: {

	},

	created() {
	
	},

	beforeMount() {
		// console.log('beforeMount')
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

		const { query } = this.$route;

		if (query) {
			let { dateStart, dateFinish } = query;
			if (dateStart && dateFinish) {
				// console.log(dateStart, getYmdDateString({ms:query.dateStart}))
				this.set_filters({
					...this.filters,
					daterange: [
						getYmdDateString({ ms: dateStart, withTime: true }),
						getYmdDateString({ ms: dateFinish, withTime: true })
					],
					isLiveEnabled: false
				});
			}
		}
		// console.log(this.filters, getDateRange('today', { getDateString: true, withTime: true }))
		if (!this.filters.measurement) {
			this.set_filters({
				...this.filters,
				measurement: this.metricSystemsList[0].id
			})
		}

		this.setup_navbar(this.navbarSettings);
		
	},

	/*beforeDestroy() {
	}*/
};
</script>
