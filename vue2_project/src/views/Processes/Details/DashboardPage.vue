<template>
	<div class="dashboard-page-container view-content-card card">
		<div class="card-header">
			<div class="flex mrow wrap align-center relative">
				<div class="mcol-xs-12 mcol-sm-4 fluid meta-block">
					<!-- <div class="meta-item">
						<i class="icomoon icon-plant" />
						<b class="text article-title">Kill Side</b>
					</div> -->
					<div class="meta-item selected-daterange">
						<i class="el-icon-date" />
						<span class="text" v-text="selectedDateRange"></span>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-auto ml-auto">
					<Datepicker
						setupDaterangeFilter
						enableShortcuts
						@input="
							range =>
								set_filters({
									...statistics_filters,
									daterange: range,
									daterange_setted_at: Date.now()
								})
						"
						:value="statistics_filters.daterange"
						type="daterange"
					/>
				</div>
			</div>
		</div>

		<!-- <button @click="test">test</button> -->

		<div class="card-content">
			<div class="section-row chart-wrapper">
				<div class="charts-data-container">
					<div :class="['charts-list content-row']">
						<CommonChartItemWrapper
							ref="CommonChartItemWrapper"
							@event="handleEventNew"
							chartFactoryContainerName="OEEChartFactoryContainer"
							chartFactoryName="OEEChart"
							configsKey="OEEChartsListsConfig"
							chartKey="oee_proccess"
							:rootFilters="statistics_filters"
							:additionalProps="chartItemProps"
							chartItemComponentPath="views/Processes/Details/ChartItemContainer"
						/>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			center
			title="EVENT LOG"
			:append-to-body="true"
			:visible.sync="showEditEventLog"
			:class="'small'"
		>
			<!-- @success="updateChart" -->
			<EventLogForm
				v-if="showEditEventLog"
				showSubmitButtons
				@closeDialog="showEditEventLog = false"
				@successSubmit="successEventLog"
				:itemData="eventLogData"
				:processDataProp="processData"
			/>
		</el-dialog>

		<el-dialog
			center
			title="CHANGE BREAK TIME"
			:append-to-body="true"
			:visible.sync="showEditBreakTime"
			:class="'small'"
		>
			<EditBreakTimeForm
				showSubmitButtons
				@closeDialog="showEditBreakTime = false"
				@successSubmit="successBreakTime"
				:itemData="breakTimeData"
				:processData="processData"
				:visible="showEditBreakTime"
			/>
		</el-dialog>
	</div>
</template>

<script>
import Vue from 'vue';

import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapActions, mapState } from 'vuex';
import {
	// getItemValue,
	getYmdDateString,
	decomposeDate
} from '@/helpers';
// import { executeChartFactoryContainer } from '@/modules/charts_factory/index.js';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	name: 'ProcessDashboard',

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue'),

		EventLogForm: () => import('./EventLogForm.vue'),
		EditBreakTimeForm: () => import('./EditBreakTimeForm.vue')
	},

	props: {
		processData: Object
	},

	data: () => ({
		hasStatistics: false,
		chartContainerReady: 0,

		// ---------------
		showEditEventLog: false,
		showEditBreakTime: false,
		eventLogData: null,
		breakTimeData: null
	}),

	computed: {
		...mapState({
			statistics_filters: state => state.processes.statistics_filters
		}),
		// pickerOptions: () => ({ shortcuts: datePickerShortcuts }),

		// daterangeFiltersProp: () => 'statistics_filters',
		selectedDateRange() {
			const { daterange } = this.statistics_filters;
			if (daterange) {
				return `${getYmdDateString({
					obj: decomposeDate(daterange[0]),
					format: 'localeStr'
				})} - ${getYmdDateString({
					obj: decomposeDate(daterange[1]),
					format: 'localeStr'
				})}`;
			}

			return '';
			// return getLocaleStringDateRange(this.sensor_statistics_filters.daterange);
		},

		chartItemProps: that =>
			Object.freeze({
				hasAccessTo: that.hasAccessTo,
				processData: that.processData,
				disableContainerPreloader: true,
				chartInstanceContainerPayload: {
					processData: that.processData,
					breakSerieByDay: true
				}
			})

		/*breakTimeData() {
			return this.processData.work_breaks ? this.processData.work_breaks[0] : {};
		}*/
	},

	methods: {
		...mapActions({
			set_filters: 'processes/set_statistics_filters',
			show_edit_modal: 'show_edit_modal'
		}),

		handleChartContainerReady({ chartContainerReady, hasStatistics }) {
			this.hasStatistics = hasStatistics;
			this.chartContainerReady = chartContainerReady;
		},

		/*test() {
			this.updateChart([1]);
		},*/

		handleDowntimeClick(payload) {
			if (this.$hasAccessTo(['edit_oee'])) {
				payload = payload || {};
				this.eventLogData = payload.payload;
				this.showEditEventLog = true;
			}
		},

		handlePlotBandsClick({ work_break }) {
			this.breakTimeData = work_break;
			this.showEditBreakTime = true;
		},

		/*changeBreakTime() {
			this.showEditBreakTime = true;
		},*/

		editProcess() {
			// this.$router.push(`/processes/${this.processData.id}`);
			let modalSettings = {
				show: true,
				instanceData: this.processData,
				instanceName: 'Processes',
				itemName: 'Process',
				callback: this.processSubmit
			};
			this.show_edit_modal(modalSettings);
		},

		/*handleContainerReady() {
			console.log('ContainerReady')
		},*/

		successEventLog() {
			this.showEditEventLog = false;
			this.ChartInstanceContainer.reloadChart();
		},

		successBreakTime() {
			this.showEditBreakTime = false;
			this.ChartInstanceContainer.reloadChart();
		},

		processSubmit() {
			this.ChartInstanceContainer.reloadChart();
			this.show_edit_modal({ show: false });
		}
	}
};
</script>
