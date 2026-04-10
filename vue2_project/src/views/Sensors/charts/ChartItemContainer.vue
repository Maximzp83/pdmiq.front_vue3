<template>
	<div class="card">
		<div class="one-chart-page-legend" v-if="oneChartPageLegend">
			<!-- <div class="chart-title bold">{{ ChartInstance.chartTitle }}</div> -->
			<div
				class="item flex align-center"
				v-for="(item, index) in oneChartPageLegend"
				:key="index"
			>
				<div class="color-block" :style="`backgroundColor: ${item.color}`"></div>
				<div class="label">{{ item.name }}</div>
			</div>
		</div>
		<!-- <button @click="show = !show">test</button> -->
		<!-- <button @click="resetNavigator">reset</button> -->

		<VueElementLoadingWrapper
			v-if="!disableAnimationAndSpinner"
			:isLoading="chartLoading || forceLoading /*|| chartRendering*/"
			:itemsName="tt('chart')"
		/>

		<div
			class="card-header chart-card-header capitalize flex mrow wrap"
			v-if="!hideChartHeader"
			v-show="hasStatistics"
		>
			<!-- <button @click="zoomYAxis">+</button> -->
			<div
				:class="[
					'mcol-xs-10 mcol-sm-9 flex mrow wrap align-center left-part',
					{ 'mcol-lg-7': !additionalProps.isCompare },
					{ 'mcol-lg-auto fluid': additionalProps.isCompare }
				]"
			>
				<div
					:class="[
						'title-block ellipsis',
						{ 'mcol-xs-12': additionalProps.isCompare }
					]"
					v-text="chartTitle"
				></div>
				<div
					class="zoom-block-container mcol-xs-9 mcol-sm-auto"
					v-if="enableZoomBlock && ChartAPI"
				>
					<div class="chart-actions-block">
						<div class="flex wrap mrow">
							<ChartZoom
								ref="ChartZoom"
								class="mcol-xs-12 mcol-sm-auto"
								@event="handleEventNew"
								:ChartInstance="ChartInstance"
								:chartOptionsUpdate="chartOptionsUpdate"
								:chartIsInit="chartRendering"
								:showHistory="additionalProps.showHistory"
							/>
								<!-- :ChartAPI="ChartAPI" -->

							<ChartThresholdsOperations
								v-if="
									enableThresholdsOperations && additionalProps.accessToThresholds
								"
								class="mcol-xs-12 mcol-sm-auto"
								@event="handleEventNew"
								:ChartInstance="ChartInstance"
								:editPlotlines="editPlotlines"
								:disabledThresholdsEdit="disabledThresholdsEdit"
								:showCalculateThresholdsButton="showCalculateThresholdsButton"
								:isRebaseline="isRebaseline"
								:calculateThresholdsIsActive="calculateThresholdsIsActive"
							/>
						</div>
					</div>
				</div>

				<div
					class="zoom-block-container lube-blocked-container mcol-xs-9 mcol-sm-auto"
					v-if="(enableLubeUnlockBlock || enableFFTUnlockBlock) && ChartAPI"
				>
					<div class="chart-actions-block">
						<div class="flex wrap mrow">
							<UnlockBlock
								v-if="enableLubeUnlockBlock"
								ref="LubeBlock"
								class="mcol-xs-12 mcol-sm-auto unlock-block"
								@onUnlock="handleUnlockLube"
								:popoverTitle="tt('phrases.Reset_lube')"
								:instanceLabel="tt('Luber')"
								:sensorData="sensorData"
								:chartOptionsUpdate="chartOptionsUpdate"
								:passedTimeValue="
									sensorData.lube_cycle_updated_at || sensorData.lube_shot_updated_at
								"
							/>

							<UnlockBlock
								v-if="enableFFTUnlockBlock"
								ref="FFTBlock"
								class="mcol-xs-12 mcol-sm-auto unlock-block"
								@onUnlock="handleUnlockFFT"
								:popoverTitle="tt('phrases.unlock_fft')"
								instanceLabel="FFT"
								:sensorData="sensorData"
								:chartOptionsUpdate="chartOptionsUpdate"
								:passedTimeValue="
									sensorData.last_fft_lock && sensorData.last_fft_lock.created_at
								"
							/>
							<!-- :chartIsInit="chartRendering" -->
						</div>
					</div>
				</div>
			</div>

			<div
				class="flex align-center mcol-xs-2 mcol-sm-auto ml-auto"
				v-if="showDisableChartButton"
			>
				<div class="header-item">
					<el-button
						@click="toggleChart"
						:class="{ active: chartIsHidden }"
						native-type="button"
						type="tertiary"
						class="action-button disable-chart-button is-plain"
						size="mini"
					>
						<i
							:class="['icomoon', chartIsHidden ? 'icon-eye' : 'icon-eye-slash']"
						></i>
					</el-button>
				</div>
			</div>

			<ChartColorShemeBlock
				class="mcol-xs-2 mcol-sm-auto ml-auto align-center buttons-container"
				v-if="enableColorPickerBlock && ChartAPI"
				:ChartInstance="ChartInstance"
				:sensorId="sensorData.id"
				:hasStatistics="hasStatistics"
			/>
			<!-- :ChartAPI="ChartAPI" -->

			<HeaderRightPart
				class="mcol-xs-2 mcol-sm-auto ml-auto align-center"
				v-if="!additionalProps.hideChartHeaderRightPart"
				@event="handleEventNew"
				:isRebaseline="isRebaseline"
				:is_high_speed="is_high_speed"
				:problems="problems"
				:hideProblems="hideProblems"
				:parameterTypeItems="parameterTypeItems"
				:hideExportButton="hideExportButton"
				:showToggleNavigator="additionalProps.showToggleNavigator"
				:toggleNavigatorButtonActive="showNavigator"
				:rootFilters="rootFilters"
				:sensorId="sensorData.id"
			/>
		</div>

		<div
			v-show="!chartIsHidden && (initialFetch || hasStatistics)"
			:class="[
				'chart-container card-content',
				{ 'edit-plotlines': editPlotlines },
				{ 'show-navigator': showNavigator }
			]"
		>
			<div class="flex mrow wrap">
				<div class="mcol-xs-12 mcol-sm-8 fluid">
					<ChartWrapper
						ref="ChartWrapper"
						:chartOptions="chartOptions"
						constructorType="stockChart"
						:hcInstance="HCInstance"
					/>
				</div>

				<div
					v-show="statsThresholdsActive"
					class="mcol-xs-12 mcol-sm-4 stats-table-wrapper"
				>
					<StatsTable
						title="Stats"
						:isShow="statsThresholdsActive"
						:ChartInstance="ChartInstance"
						:statsData="statsData"
						:chartsListWrapperReadyCounter="chartsListWrapperReadyCounter"
					/>
					<!-- :statisticsResponsesReadyCounter="statisticsResponsesReadyCounter" -->
				</div>
			</div>
			<!-- :constructorType="constructorType" -->
		</div>

		<div v-show="!initialFetch && !hasStatistics" class="chart-mock card">
			<div
				class="content-container inlineImg"
				style="background-image: url(/static/img/background/graph.svg)"
			>
				<div class="caption">
					<div class="text-item">{{ tt('phrases.There_are') }}</div>
					<div class="text-item central">{{ tt('phrases.no_statistics') }}</div>
					<div class="text-item">{{ `${tt('for')} ${chartTitle}` }}</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="ChartInstance.editThresholdsByStagesEnabled"
			append-to-body
			center
			:show-close="false"
			class="small dialog-decorate-header"
			:title="tt('Warning')"
			:visible.sync="updateThresholdsDialogOpen"
		>
			<UpdateThresholdsDialog
				@event="handleEventNew"
				@onClose="updateThresholdsDialogOpen = false"
				:ChartInstance="ChartInstance"
				:isWarningThresholdChanged="isWarningThresholdChanged"
				:isWarningThresholdLessThanAlarm="isWarningThresholdLessThanAlarm"
				:enableContinueButton="isWarningThresholdLessThanAlarm"
			/>
		</el-dialog>

		<el-dialog
			append-to-body
			center
			title="Warning"
			:visible.sync="showMeasurementTypeWarningDialog"
			width="420px"
		>
			<div>{{ measurementTypeWarningText }}</div>

			<div slot="footer" class="dialog-footer text-center">
				<el-button
					type="primary"
					@click="showMeasurementTypeWarningDialog = false"
				>
					Ok
				</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import {
	SENSOR_PARAMETERS_TYPES,
	NCD_SENSOR_PARAMETERS_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';
import {
	LUBE_PROCESSING_STATUSES,
	LUBE_CYCLE_STATUSES,
	LUBE_VERSIONS
} from '@/constants/ultrasound';
import { FFT_LOCK_STATUSES } from '@/constants/global';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		ChartWrapper: () => import('@/components/charts/ChartWrapper.vue'),
		ChartZoom: () => import('./ChartZoom.vue'),
		UnlockBlock: () => import('./UnlockBlock.vue'),
		ChartThresholdsOperations: () => import('./ChartThresholdsOperations.vue'),
		HeaderRightPart: () => import('./HeaderRightPart.vue'),
		ChartColorShemeBlock: () => import('./ChartColorShemeBlock.vue'),
		UpdateThresholdsDialog: () => import('./UpdateThresholdsDialog.vue'),
		StatsTable: () => import('./StatsTable.vue')
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
		},
		sensorData: { type: Object, required: true },
		currentSensorType: Object,

		forceLoading: Boolean,
		chartsListWrapperReadyCounter: Number
	},

	data: () => ({
		// chartIsHidden: false,
		chartToggled: 1,
		refetchChartData: false,

		showDisableChartButton: false,

		chartIsInit: false,
		// ChartAPI: null,
		updateChart: 0,
		chartOptionsUpdate: 0,
		statisticsResponsesReadyCounter: 0,

		showNavigator: false,

		chartLoading: false,
		chartRendering: false,
		initialFetch: true,

		hasStatistics: false,
		statisticsResponsesReady: false,
		chartDataReady: false,

		editPlotlines: false,
		calculateThresholdsIsActive: false,

		//---------------
		chartThresholdsUpdate: 0,
		updateThresholdsDialogOpen: false,
		chartIsRendered: false,
		showMeasurementTypeWarningDialog: false,
		measurementTypeWarningText: '',
	}),

	computed: {
		// hcInstance: that => that.additionalProps.hcInstance,
		// hcInstanceNew: that => that.additionalProps.hcInstanceNew,
		chartIsHidden: that =>
			that.chartToggled && that.ChartInstance.chartIsHidden && !that.oneChartOnly,

		oneChartPageLegend() {
			const { oneChartOnly, ChartInstance } = this;

			if (oneChartOnly && ChartInstance) {
				if (
					ChartInstance.requestsList.length > 1 &&
					(ChartInstance.options.chart.type == 'spline' ||
						ChartInstance.options.chart.type == 'line')
				) {
					return ChartInstance.options.series.filter(
						si => si.custom_id == 'base_series'
					);
				}
			}
			return null;
		},

		HCInstance() {
			const { higchartInstances } = this.additionalProps;
			const { ChartInstance } = this;

			if (higchartInstances) {
				const {
					hcInstanceNew,
					hcInstance,
					stockInit,
					boost,
					stockInitNew,
					boostNew
				} = higchartInstances;

				// if (ChartInstance.chart_id !== 'displacement' && inject_options) {
				if (ChartInstance.generateSeriesByStatistics) {
					/*if (inject_options.navigator &&
								inject_options.navigator.series.type == 'spline') {*/
					stockInitNew(hcInstanceNew);
					boostNew(hcInstanceNew);
					return hcInstanceNew;
					// }
				}

				stockInit(hcInstance);
				boost(hcInstance);
				return hcInstance;
			}

			return undefined;
		},

		isSidebarCollapse: that => that.$store.state.global.isSidebarCollapse,
		/*headerComponentFile() {
			return null;
		},*/
		chartOptions: that =>
			that.chartOptionsUpdate
				? Object.freeze(that.ChartInstance.getChartOptions())
				: null,

		statsData: that =>
			that.chartOptionsUpdate
				? Object.freeze(that.ChartInstance.getChartStatsData())
				: null,

		ChartAPI: that => (that.chartIsInit ? that.ChartInstance.ChartAPI : null),

		parameterTypeItems: that => that.ChartInstance.requestsList,
		controllerTimeZone: that => that.sensorData.controller.time_zone,
		isBanner: that => that.currentSensorType.isBanner,
		isUltrasound: that => that.currentSensorType.isUltrasound,
		isSDTsensor: that => that.currentSensorType.isSDTsensor,
		isNCDTempVibe: that => that.currentSensorType.isNCDTempVibe,
		isHumiditySensor: that => that.currentSensorType.isHumiditySensor,

		hideChartHeader: that => that.additionalProps.hideChartHeader,
		enableZoomBlock: that => !that.additionalProps.hideZoomBlock,
		isLubeMatrixV3: that =>
			that.sensorData && that.sensorData.lube_version === LUBE_VERSIONS.V3,
		enableLubeUnlockBlock: that =>
			that.sensorData &&
			(that.currentSensorType.isUltrasound || that.isLubeMatrixV3) &&
			(that.sensorData.lube_cycle_status === LUBE_CYCLE_STATUSES.BLOCKED ||
				that.sensorData.lube_shot_status === LUBE_PROCESSING_STATUSES.UNSUCCESSFUL ||
				that.sensorData.lube_shot_status ===
					LUBE_PROCESSING_STATUSES.LUBRICANT_FULL_SPENT ||
				that.sensorData.lube_shot_status === LUBE_PROCESSING_STATUSES.BLOCKED ||
				that.sensorData.lube_shot_status ===
					LUBE_PROCESSING_STATUSES.LOSS_CONNECTION ||
				that.sensorData.lube_shot_status ===
					LUBE_PROCESSING_STATUSES.NO_COMMAND_RESPONSE ||
				that.sensorData.lube_shot_status === LUBE_PROCESSING_STATUSES.UNKNOWN ||
				that.sensorData.lube_shot_status ===
					LUBE_PROCESSING_STATUSES.NO_LUBRICATION_STATUS_RESPONSE ||
				that.sensorData.lube_shot_status ===
					LUBE_PROCESSING_STATUSES.NO_START_LUBRICATION_COMMAND_RESPONSE),

		enableFFTUnlockBlock() {
			const { sensorData } = this;
			if (sensorData && sensorData.last_fft_lock) {
				return sensorData.last_fft_lock.status !== FFT_LOCK_STATUSES.UNLOCKED;
			}
			return false;
		},

		disableAnimationAndSpinner: that =>
			that.additionalProps.disableAnimationAndSpinner,

		statsThresholdsActive: that => that.additionalProps.statsThresholdsActive,
		oneChartOnly: that => that.additionalProps.oneChartOnly,

		enableThresholdsOperations() {
			const { additionalProps, ChartInstance, parameterTypeItems } = this;
			const { sensorType } = ChartInstance.resources.payload_1;
			if (ChartInstance.disableThresholds) return false;
			if (
				parameterTypeItems &&
				sensorType === 'ncd_environmental' &&
				parameterTypeItems.some(r => r.id === NCD_SENSOR_PARAMETERS_TYPES.IAQ)
			)
				return false;
			if (additionalProps.isCompare) return false;

			return true;
		},
		disabledThresholdsEdit() {
			return (
				this.sensorData.is_re_baseline_process &&
				this.parameterTypeItems[0].id !== SENSOR_PARAMETERS_TYPES.TEMPERATURE
			);
		},
		showCalculateThresholdsButton: that =>
			that.ChartInstance.showCalculateThresholdsButton,

		isRebaseline() {
			return (
				!this.ChartInstance.disableThresholds &&
				!this.additionalProps.isCompare &&
				!this.isSDTsensor &&
				this.sensorData.is_re_baseline_process
			);
		},
		is_high_speed: that =>
			!that.additionalProps.isCompare && that.additionalProps.lube_cycle_high_speed,

		hideExportButton: that =>
			that.additionalProps.isCompare || that.additionalProps.hideExportButton,
		hideProblems: that =>
			that.additionalProps.hideProblems ||
			that.isUltrasound ||
			that.isSDTsensor ||
			that.isHumiditySensor,

		// ----------------------------
		/*chartEventsList() {
			let list = {
				// load: e => this.handleChartInitiatedEvent(e),				
			}

			if (this.showCalculateThresholdsButton) {
				list.selection = e => this.handleChartSelectionEvent(e);
			}
			return Object.freeze(list);
		},*/

		chartInstanceEventsList() {
			let list = {
				chartIsHidden: () => this.chartToggled++,
				isLoading: value => (this.chartLoading = value),
				isRendering: value => (this.chartRendering = value),
				isInitiated: () => (this.chartIsInit = true),
				statisticsResponsesReady: ready =>
					this.handleStatisticsResponsesReady(ready),
				hasStatistics: this.handleHasStatisticsChange,
				chartDataReady: value => (this.chartDataReady = value),
				chartOptionsReady: () => this.chartOptionsUpdate++,
				chartOptionsUpdate: () => this.chartOptionsUpdate++,
				chartThresholdsUpdate: options => this.handleChartThresholdsUpdate(options)
				// onPlotlineDragChange: event => this.handlePlotlineDragChange(event),
				// onPlotlineDragFinish: event => this.handlePlotlineDragFinish(event),
				// emitChartOptionsFinalReady: options => this.handleChartOptionsReady(options),
			};

			if (this.additionalProps.setIsGraphMountedToWindow) {
				list.chartRenderEvent = (e, Chart) => this.handleChartRendered(e, Chart);
			}

			/*if (this.showCalculateThresholdsButton) {
				list.handleCalculateThresholdsBySelectedPointsResponse = e => this.handleCalculateThresholdsBySelectedPointsResponse(e);
			}*/

			return Object.freeze(list);
		},

		chartPointsEventsList() {
			return Object.freeze({
				pointClickEvent: {
					name: 'click',
					event: e => this.handleChartPointClick(e)
				},
				openFFTCharts: { name: 'click', event: e => this.handleOpenFFTCharts(e) }
			});
		},

		// -------------------
		chartTitle: that =>
			that.chartOptionsUpdate != null ? that.ChartInstance.chartTitle : null,

		problems() {
			if (this.chartOptions && this.statisticsResponsesReady !== undefined) {
				// console.log('problems')
				return (
					this.ChartInstance.getTransformedStatistics({
						data_key: 'problems',
						parameterId: this.parameterTypeItems[0]?.id
					}) || []
				);
			}
			return [];
		},

		enableColorPickerBlock: that => that.currentSensorType.isBannerV2Generic,

		// -------------------
		updateThresholdsData: that =>
			that.chartThresholdsUpdate
				? Object.freeze(that.ChartInstance.updateThresholdsData)
				: {},
		isWarningThresholdChanged: that => !!that.updateThresholdsData.warning_zone,
		isWarningThresholdLessThanAlarm: that =>
			that.chartThresholdsUpdate
				? that.ChartInstance.isWarningThresholdLessThanAlarm
				: true
	},

	methods: {
		/*handleChartEvent(e) {
			console.log(e)
		},*/
		handleMeasurementTypeMismatchWarning() {
			return false;
		},

		handleHasStatisticsChange(value) {
			this.hasStatistics = value;

			if (
				this.additionalProps.setIsGraphMountedToWindow &&
				!value &&
				!this.chartIsRendered
			) {
				this.chartIsRendered = true;
				window.isGraphMounted = true;
			}
		},

		handleChartRendered(e, Chart) {
			this.ChartInstance.syncHistorySeriesVisibility(
				this.additionalProps.showHistory
			);

			if (!this.chartIsRendered && Chart.lastInitialRedrawComplete) {
				this.chartIsRendered = true;
				window.isGraphMounted = true;
			}
		},

		toConsole(x) {
			console.log(x);
		},

		toggleChart() {
			this.ChartInstance.toggleChart();

			if (
				!this.chartIsHidden &&
				(!this.chartIsInit || !this.hasStatistics || this.refetchChartData)
			) {
				this.fetchChartData();
				this.refetchChartData = false;
			}
		},

		resetNavigator() {
			this.ChartAPI.xAxis[0].setExtremes(null, null);
		},

		toggleEditPlotlinesManual() {
			if (this.handleMeasurementTypeMismatchWarning()) {
				return;
			}

			this.editPlotlines = !this.editPlotlines;

			this.ChartInstance.injectProps(
				'options',
				{
					chart: { zoomType: this.editPlotlines ? '' : 'xy' }
				},
				{ emitChartOptionsUpdate: true }
			);
		},
		zoomYAxis(data) {
			// console.log(data)
			this.ChartInstance.ChartAPI.yAxis[0].setExtremes(...data);
		},

		fetchChartData(filters = {}, settings = {}) {
			this.ChartInstance.fetchChartData(filters, settings);
		},

		/*handleChartInitiatedEvent({target}) {
			this.ChartAPI = target;
		},*/

		handleStatisticsResponsesReady(ready) {
			this.statisticsResponsesReady = ready;

			if (ready) {
				// console.log('handleStatisticsResponsesReady')
				this.initialFetch = false;
				this.statisticsResponsesReadyCounter++;
			}
		},

		handleChartThresholdsUpdate({ open_dialog, settings }) {
			this.chartThresholdsUpdate++;
			this.updateThresholdsDialogOpen = open_dialog;

			if (settings && settings.redirectTo) {
				this.$emit('event', {
					eventName: 'handleRedirectTo',
					data: settings.redirectTo
				});
			}
		},

		handleChartPointClick(e) {
			const { point } = e;
			// console.log(point)
			if (point) {
				this.$emit('event', {
					eventName: 'addNoteToChart',
					data: point,
					onward: true
				});
			}
		},

		handleOpenFFTCharts({ point }) {
			this.$emit('event', {
				eventName: 'openFFTCharts',
				data: { ...point, sensorType: this.currentSensorType },
				onward: true
			});
		},

		// ----------------------
		handleSetupThresholds() {
			if (this.handleMeasurementTypeMismatchWarning()) {
				return;
			}

			const { chart_id, requestsList, resources } = this.ChartInstance;

			var { levelZoneDataParameterId } = resources.chart_config;

			const {
				levelZoneData,
				primaryLevelZoneData,
				levelZones
			} = this.ChartInstance.getTransformedStatistics({
				parameterId: levelZoneDataParameterId,
				statistics_result: true
			});

			// console.log('handleSetupThresholds', levelZoneData, levelZones, requestsList, levelZoneDataParameterId)
			this.$emit('event', {
				eventName: 'handleSetupThresholds',
				data: {
					parameters: [
						{
							chartTitle: this.chartTitle,
							chart_id,
							levelZoneData,
							primaryLevelZoneData,
							levelZones,
							parameterItem: requestsList[0]
						}
					]
				},
				onward: true
			});
		},

		handleCalculateThresholds() {
			this.calculateThresholdsIsActive = !this.calculateThresholdsIsActive;

			this.ChartInstance.injectProps(
				'options',
				{
					chart: { zoomType: this.calculateThresholdsIsActive ? 'x' : 'xy' }
				},
				{ emitChartOptionsUpdate: true }
			);
		},

		handleUnlockLube() {
			this.$emit('event', {
				eventName: 'handleUnlockLube',
				data: { chartId: this.ChartInstance.chart_id, sensorId: this.sensorData.id },
				onward: true
			});
		},

		handleUnlockFFT() {
			this.$emit('event', {
				eventName: 'handleUnlockFFT',
				data: { chartId: this.ChartInstance.chart_id, sensorId: this.sensorData.id },
				onward: true
			});
		},

		// ------------------------

		toggleNavigator() {
			this.showNavigator = !this.showNavigator;
			this.ChartInstance.injectProps(
				'options',
				{
					navigator: { enabled: this.showNavigator }
				},
				{ emitChartOptionsUpdate: true }
			);
		}
		/*statisticsResponsesReady(e) {
			console.log('statisticsResponsesReady', e)
		}*/
	},

	watch: {
		/*ChartAPI(api) {
			if (api) {
				window['ChartAPI'] = api;
				this.$nextTick(() => this.ChartInstance.syncHistorySeriesVisibility(this.additionalProps.showHistory));
			}
		},*/

		'rootFilters'() {
			// console.log('rootFilters')
			this.refetchChartData = true;
		},

		/*chartOptionsUpdate() {
			this.$nextTick(() => this.ChartInstance.syncHistorySeriesVisibility(this.additionalProps.showHistory));
		},*/

		'isSidebarCollapse'() {
			setTimeout(() => {
				const ChartRef = this.$refs.ChartWrapper;
				if (ChartRef) {
					// console.log(this.)
					const containerWidth = ChartRef.$el.clientWidth - 1;
					const containerHeight = ChartRef.$el.clientHeight;
					this.ChartAPI.setSize(containerWidth, containerHeight);
				}
			}, 500);
		},

		'additionalProps.showHistory'() {
			this.ChartInstance.setShowHistory(this.additionalProps.showHistory);

			if (this.$refs.ChartZoom) {
				// this.chartOptionsUpdate++;
				setTimeout(() => {
					this.$refs.ChartZoom.resetInitialValues();
					this.$refs.ChartZoom.zoomYAxis(0);
				}, 50);
			}
		}

		/*chartIsHidden(is_hidden) {
			// console.log('chartIsDisabled', is_hidden)
			if (!is_hidden && (!this.chartIsInit || !this.hasStatistics || this.refetchChartData)) {
				this.fetchChartData();
				this.refetchChartData = false;
			}
		}*/
	},

	created() {
		// console.log('chartItem created')

		// console.log('created Chart')
		this.ChartInstance.injectProps('events', this.chartInstanceEventsList);
		this.ChartInstance.setValue('seriesEvents', this.chartPointsEventsList);

		if (this.ChartInstance['chartIsHidden'] !== undefined) {
			this.showDisableChartButton = true;
			// this.chartIsHidden = this.ChartInstance.chartIsHidden;
		}

		// this.ChartInstance.events.onEvent = this.handleChartEvent;
		// this.ChartInstance.assignChartEvents(this.chartEventsList);
		// this.ChartInstance.assignSeriesEvents('seriesEvents', this.chartPointsEventsList);

		if (!this.chartIsHidden) {
			this.fetchChartData();
		}
	}
};
</script>
