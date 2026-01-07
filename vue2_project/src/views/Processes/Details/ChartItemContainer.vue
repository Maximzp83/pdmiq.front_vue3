<template>
	<div class="">
		<!-- <button @click="state_socketCallback(statisticsMockData)">update</button> -->
		<!-- <button @click="state_socketCallback(downtimeMockData)">update Downtime</button> -->

		<VueElementLoadingWrapper
			:isLoading="chartLoading /*|| chartRendering*/"
			:itemsName="tt('chart')"
		/>

		<div class="chart-operations-block flex align-center">
			<div class="counters-wrapper">
				<div class="capacity-counters-wrapper colored-counters content-row">
					<div class="capacity-counters flex mrow">
						<div class="capacity-item">
							<span class="label">{{ tt('phrases.Maximum_capacity') }}</span>
							<span class="value max">{{ capacity.max }}</span>
						</div>
						<div class="capacity-item">
							<span class="label">{{ tt('phrases.Realistic_capacity') }}</span>
							<span class="value real">{{ capacity.real }}</span>
						</div>
						<div class="capacity-item">
							<span class="label">{{ tt('Running_total') }}</span>
							<span class="value actual">{{ otherStatistics.actual_capacity }}</span>
						</div>
					</div>
				</div>

				<div class="block-item flex content-row">
					<div
						class="span-block downtimes-counters"
						v-if="otherStatistics.totalDowntimes"
					>
						<span class="label semi-bold">{{
							tt('phrases.accumulative_downtime')
						}}</span>

						<span class="value">{{
							otherStatistics.totalDowntimes.total_count_hours
						}}</span>
						<span class="label">h</span>

						<span class="value">{{
							otherStatistics.totalDowntimes.total_count_minutes
						}}</span>
						<span class="label">m</span>

						<span class="value">{{
							otherStatistics.totalDowntimes.total_count_seconds
						}}</span>
						<span class="label">s</span>
					</div>

					<div class="span-block downtimes-counters">
						<span class="label semi-bold">{{ tt('phrases.Loss_count') }}</span>
						<span class="value">{{ otherStatistics.loss_count }}</span>
					</div>
				</div>

				<div class="block-item content-row">
					<div class="flex mrow align-center">
						<div class="label semi-bold mcol-xs-2">
							{{ tt('phrases.Group_data_by') }}:
						</div>

						<CustomSelect
							class="mcol-xs-3"
							:optionsList="groupByTimerangeList"
							:placeholder="`${tt('Select')} ${tt('timerange')}`"
							@change="val => ChartInstance.handleChangeGroupByTime(val)"
							:value="groupByTimeValue"
						/>
					</div>
				</div>
			</div>

			<!-- <div class="ml-auto span-block">
				<el-button
					class="action-button"
					size="mini"
					type="primary inverted initial-color"
					@click="() => handleChartOperation('changeBreakTime')"
				>
					<span class="label">CHANGE BREAK TIME</span>
					<i class="icomoon icon-edit2 postfix"></i>
				</el-button>
			</div> -->

			<div class="span-block ml-auto">
				<el-button
					v-if="$hasAccessTo(['edit_oee'])"
					class="action-button edit-button"
					size="mini"
					type="success"
					@click="() => handleChartOperation('editProcess')"
					icon="icomoon icon-pencil"
				/>

				<!-- <button @click="state_socketCallback(getAnswer())">test</button> -->
			</div>
		</div>

		<div
			v-show="initialFetch || hasStatistics"
			:class="['chart-container card-content']"
		>
			<ChartWrapper :chartOptions="chartOptions" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import { isTodayRange } from '@/helpers';

import { webSocketMixin } from '@/mixins';

export default {
	mixins: [webSocketMixin()],
	components: {
		ChartWrapper: () => import('@/components/charts/ChartWrapper.vue')
	},
	props: {
		ChartInstance: {
			type: Object,
			required: true
		},
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		additionalProps: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			chartIsInit: false,
			// ChartAPI: null,
			updateChart: 0,
			chartOptionsUpdate: 0,
			chartLoading: false,
			chartRendering: false,
			initialFetch: true,

			hasStatistics: false,
			statisticsResponsesReady: false,
			groupByTimeValue: 0,

			// ------Old----
			statistics_data: null,
			original_statistics: null,
			// ---------------
			isSocketProccess: false,
			state_socket: null,
			state_socket_ready: false,

			// multiplier: 10,

			test_minutes: 4
			// test: []
		};
	},

	computed: {
		...mapState({
			isSidebarCollapse: state => state.global.isSidebarCollapse
		}),

		statisticsMockData: () => ({
			type: 'job',
			actual_capacity: 40,
			counter: {
				processed_count: 40,
				signal_date_at: '2024-06-05T15:17:04.000000Z'
			},
			process_id: 1,
			socket: null
		}),

		downtimeMockData: () => ({
			type: 'downtime',
			downtime: {
				cause_description: null,
				fault: null,
				fault_id: null,
				finish_time: '2024-06-05T09:30:00.000000Z',
				id: 68900,
				is_processed: true,
				loss_count: 500,
				machine: null,
				machine_id: null,
				offsetWorkBreak: null,
				origin_type: 3,
				plant_id: 10,
				process_id: 1,
				start_time: '2024-06-05T08:30:00.000000Z'
			},
			process_id: 1,
			socket: null
		}),

		processData: that => Object.freeze(that.additionalProps.processData),

		chartOptions: that =>
			that.chartOptionsUpdate
				? Object.freeze(that.ChartInstance.getChartOptions())
				: null,

		chartInstanceEventsList() {
			let list = {
				isLoading: value => (this.chartLoading = value),
				isRendering: value => (this.chartRendering = value),
				isInitiated: () => (this.chartIsInit = true),
				statisticsResponsesReady: ready =>
					this.handleStatisticsResponsesReady(ready),
				hasStatistics: value => (this.hasStatistics = value),
				chartOptionsReady: () => this.chartOptionsUpdate++,
				chartOptionsUpdate: () => this.chartOptionsUpdate++,
				groupByTimeValue: value => (this.groupByTimeValue = value),

				plotBandsClickEvent: data => this.handlePlotBandsClick(data)
			};

			return Object.freeze(list);
		},

		chartPointsEventsList() {
			return Object.freeze({
				downtimeClickEvent: {
					name: 'click',
					event: e => this.handleDowntimeClick(e)
				}
			});
		},

		capacity() {
			const { processData } = this;

			let capacity = { max: 0, real: 0 };

			if (processData) {
				capacity.max = processData.max_capacity;
				capacity.real = processData.real_capacity;
			}
			return Object.freeze(capacity);
		},

		otherStatistics() {
			if (this.chartOptionsUpdate && this.ChartInstance.fetched_statistics_data) {
				return Object.freeze({
					totalDowntimes: this.ChartInstance.fetched_statistics_data.totalDowntimes,
					actual_capacity: this.ChartInstance.fetched_statistics_data
						.actual_capacity,
					loss_count: this.ChartInstance.fetched_statistics_data.loss_count
				});
			}
			return Object.freeze({
				totalDowntimes: null,
				actual_capacity: 0,
				loss_count: 0
			});
		},

		chartRenderEvent() {
			// console.timeEnd('render chart');
			return (/*{ target }*/) => null;
		},

		// ------------
		socketChannel() {
			const { processData } = this;

			if (processData && processData.uuid) {
				return `live.conveyor.process.${processData.uuid}`;
			}

			return null;
		},

		groupByTimerangeList: () =>
			Object.freeze([
				{ id: 3600000, name: '1 hour', value: 3600000 },
				{ id: 1800000, name: '30 mins', value: 1800000 },
				{ id: 900000, name: '15 mins', value: 900000 },
				{ id: 300000, name: '5 mins', value: 300000 },
				{ id: 60000, name: '1 min', value: 60000 }
				// { id: 0, name: '0 min test', value: 0 }
			])
	},

	methods: {
		handleDowntimeClick({ point }, chart_id) {
			if (point.options) {
				this.$emit('event', {
					eventName: 'handleDowntimeClick',
					data: { ...point.options, chartId: chart_id },
					onward: true
				});
			}
		},

		handlePlotBandsClick(payload) {
			this.$emit('event', {
				eventName: 'handlePlotBandsClick',
				data: payload,
				onward: true
			});
		},

		fetchChartData(filters = {}, settings = {}) {
			this.ChartInstance.fetchChartData(filters, settings);
		},

		handleStatisticsResponsesReady(ready) {
			this.statisticsResponsesReady = ready;

			if (ready) {
				this.initialFetch = false;
			}
		},

		// ------------------

		handleChartOperation(actionName, data) {
			this.$emit('event', {
				eventName: actionName,
				data: data,
				onward: true
			});
		},

		state_socketCallback(answer) {
			this.ChartInstance.handleCountersLiveUpdate(answer);
		},

		setupSocket() {
			if (this.rootFilters.daterange && isTodayRange(this.rootFilters.daterange)) {
				// console.log(this.socketChannel);
				this.setupWebSocket({
					socketName: 'state_socket',
					socketNameReadyProp: 'state_socket_ready',
					socketChannel: this.socketChannel,
					socketCallbackName: 'state_socketCallback'
					// resources: this.getSensorsIds(this.itemsList)
				});
			} else if (this.state_socket) {
				this.closeWebSocket({ socketName: 'state_socket' });
			}
		}
	},

	watch: {
		rootFilters(filters) {
			// console.log('rootFilters')
			this.fetchChartData(filters);
			this.setupSocket();
		}
	},

	created() {
		this.setupSocket();
		this.ChartInstance.injectProps('events', this.chartInstanceEventsList);
		this.ChartInstance.setValue(
			'groupByTimeValue',
			this.groupByTimerangeList[0].value
		);
		this.ChartInstance.setValue('seriesEvents', this.chartPointsEventsList);

		this.fetchChartData(this.rootFilters);
	},

	beforeDestroy() {
		this.closeWebSocket({ socketName: 'state_socket' });
	}
};
</script>
