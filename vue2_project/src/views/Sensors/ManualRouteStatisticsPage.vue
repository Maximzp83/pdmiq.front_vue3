<template>
	<div
		class="view-wrapper item-page-wrapper statistics-page specifications-block-wrapper multi-view-statistics"
	>
		<div class="section-row">
			<div class="mrow flex wrap page-header align-center relative">
				<div class="images-part mcol-xs-12 mcol-sm-2">
					<EquipmentPictureBlock
						@event="handleEventNew"
						:equipmentData="equipmentData"
					/>
				</div>

				<div class="mcol-xs-12 mcol-sm-2 mcol-lg-2 fluid flex align-center wrap">
					<div class="title page-title capitalize span-block">
						{{ tt('technology.manual_route') }}
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-20 text-right ml-auto">
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

		<div class="section-row tab-container reportBlock-tab show_tab">
			<div class="tab-container" v-if="manualRouteSensors.length">
				<div
					class="content-row"
					v-for="(metric, idx) in chartMetrics"
					:key="`manual-route-chart-${metric.id}-${manualRouteSensorsKey}`"
				>
					<CommonChartItemWrapper
						:chartWrapperIdx="idx"
						ref="CommonChartItemWrapper"
						chartFactoryContainerName="ManualRouteChartFactoryContainer"
						chartFactoryName="ManualRouteChart"
						@event="handleEventNew"
						:additionalProps="additionalProps"
						:buildChartsPayloadProps="buildChartsPayloadProps"
						:setupChartsConfigsListSettings="getChartConfigSettings(metric)"
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

			<div class="text-center card" v-else>
				<div class="card-content">{{ tt('phrases.no_data') }}</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

stockInit(Highcharts);
boost(Highcharts);
Vue.use(HighchartsVue);

import { mapState, mapActions } from 'vuex';
import { navigation, eventHandler } from '@/mixins';
import { getDateRange, getYmdDateString, getTimeDifference } from '@/helpers';
import { DATASET } from '@/constants/global';
import {
	datePickerShortcuts,
	datePickerAdditionalShortcuts,
	localeMonths,
	localeMonthsFull,
	weekdays
} from '@/constants/date_time';
import {
	MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES,
	manualRouteSensorParametersList,
	metricSystemsList
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { LANGUAGE_TYPES } from '@/localization/utils';

export default {
	mixins: [navigation(), eventHandler()],
	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		EquipmentPictureBlock: () => import('./charts/EquipmentPictureBlock.vue')
	},
	props: {
		equipmentData: { type: Object, required: true }
	},
	data() {
		return {
			isTodayRangeClicked: false,
			rangeWithTime: false,
			pickedRange: {}
		};
	},
	computed: {
		...mapState({
			filters: state => state.sensors.statistics_filters,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix
		}),

		metricSystemsList: () => Object.freeze(metricSystemsList()),

		chartMetrics: () =>
			Object.freeze([
				manualRouteSensorParametersList(
					MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.VELOCITY
				),
				manualRouteSensorParametersList(
					MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.HIGH_FREQUENCY_ACCELERATION
				)
			]),

		manualRouteSensors() {
			const sensors = this.equipmentData.dashboardSensors || [];
			return Object.freeze(
				sensors.filter(sensor => sensor.data_set === DATASET.MANUAL_ROUTE_FFT)
			);
		},

		manualRouteSensorsKey() {
			return this.manualRouteSensors.map(sensor => sensor.id).join('-');
		},

		buildChartsPayloadProps() {
			return Object.freeze({
				manualRouteSensors: this.manualRouteSensors,
				sensorItem: this.manualRouteSensors[0],
				sensorType: 'manual_route'
			});
		},

		additionalProps() {
			return Object.freeze({
				customMock: true,
				chartWrapperClass: 'content-row',
				chartItemComponentClass: 'card',
				chartContainerClass: 'card-content',
				customChartHeader: {
					componentPath:
						'views/Sensors/charts/ManualRoute/ManualRouteChartItemHeader'
				},
				chartPointsEventsList: {
					openFFTCharts: {
						name: 'click',
						event: event => this.openFFTCharts(event)
					}
				}
			});
		},

		pickerOptions() {
			const timeRanges = ['1_hour', '3_hours', '12_hours'];
			const shortcuts = []
				.concat(datePickerAdditionalShortcuts(), datePickerShortcuts())
				.map(shortcut => ({
					...shortcut,
					onClick: picker => {
						this.rangeWithTime = timeRanges.some(
							rangeName => rangeName === shortcut.rangeName
						);
						setTimeout(() => {
							this.isTodayRangeClicked = shortcut.rangeName === 'today';
							picker.$emit(
								'pick',
								getDateRange(shortcut.rangeName, { todayEndsAtMidNight: 1 })
							);
						}, 100);
					}
				}));

			return Object.freeze({
				shortcuts,
				onPick: range => {
					this.isTodayRangeClicked = false;
					this.pickedRange = range;
				}
			});
		},

		navbarSettings() {
			return Object.freeze({
				showStandardNavItem: true,
				pageTitle: '<span><b>PdM</b>Matrix<sup>TM</sup></span>',
				showPlantName: { name: this.equipmentData.plant_name }
			});
		}
	},
	methods: {
		...mapActions({
			setup_navbar: 'setup_navbar',
			set_filters: 'sensors/set_statistics_filters'
		}),

		getChartConfigSettings(metric) {
			return Object.freeze({
				metricId: metric.id,
				sensors: this.manualRouteSensors
			});
		},

		handleDaterange(range) {
			this.set_filters({
				...this.filters,
				daterange: range,
				daterange_setted_at: Date.now(),
				isLiveEnabled: this.isTodayRangeClicked
			});
		},

		switchMetricSystem({ id }) {
			this.set_filters({ ...this.filters, measurement: id });
		},

		openFFTCharts({ point }) {
			const payload =
				point && (point.payload || (point.options && point.options.payload));
			if (!payload || !payload.id || !payload.sensor_id) return;

			const link = document.createElement('a');
			link.href = `${window.location.origin}/ncd/${payload.sensor_id}/fft/${payload.id}`;
			link.target = '_blank';
			link.click();
		}
	},
	beforeMount() {
		if (Highcharts && this.$Lang.currentLangId === LANGUAGE_TYPES.SPANISH) {
			Highcharts.setOptions({
				lang: {
					months: this.$translate(localeMonthsFull()),
					weekdays: this.$translate(weekdays()),
					shortMonths: this.$translate(localeMonths(true))
				}
			});
		}

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

		const { dateStart, dateFinish } = this.$route.query;
		if (dateStart && dateFinish) {
			this.set_filters({
				...this.filters,
				daterange: [
					getYmdDateString({ ms: dateStart, withTime: true }),
					getYmdDateString({ ms: dateFinish, withTime: true })
				],
				isLiveEnabled: false
			});
		}

		if (!this.filters.measurement) {
			this.set_filters({
				...this.filters,
				measurement: this.metricSystemsList[0].id
			});
		}

		this.setup_navbar(this.navbarSettings);
	}
};
</script>
