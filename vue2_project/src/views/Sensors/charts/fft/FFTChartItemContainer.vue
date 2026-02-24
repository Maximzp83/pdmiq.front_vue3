<template>
	<div class="" v-show="chartLoading || hasStatistics || showDisableChartButton">
		<VueElementLoadingWrapper
			:isLoading="chartLoading /*|| chartRendering*/"
			:itemsName="tt('chart')"
		/>

		<!-- <span class="span-block" v-for="color in colorsList" 
			:key="`color-indicator-${color}`"
			:style="`backgroundColor: ${color}; width: 20px; display: inline-block; height: 20px;`"
		></span> -->

		<div class="card-header chart-card-header flex mrow wrap" v-show="hasStatistics">
			<!-- <button @click="zoomYAxis">+</button> -->
			<div class="flex mrow wrap align-center left-part ">
				<div class="title-block ellipsis capitalize" v-text="chartTitle"></div>

				<div
					v-if="showDisableChartButton"
					class="fft-chart-actions mcol-xs-6 mcol-sm-auto capitalize"
				>
					<div class="chart-actions-block">
						<div class="flex wrap mrow">
							<div class="">
								<el-button
									@click="toggleChart"
									type="secondary"
									native-type="button"
									class="item-action-button capitalize flex align-center"
								>
									<i :class="['icomoon', chartIsHidden ? 'icon-eye' : 'icon-eye-slash']"></i>
								</el-button>
							</div>
						</div>
					</div>
				</div>

				<div
					class="zoom-block-container mcol-xs-9 mcol-sm-auto capitalize fft-chart-actions"
					v-if="ChartAPI"
					v-show="!chartIsHidden"
				>
					<div class="chart-actions-block">
						<div class="flex wrap mrow">
							<ChartZoom
								buttonType="secondary inverted"
								class="mcol-xs-6 mcol-sm-auto"
								@event="handleEventNew"
								:ChartInstance="ChartInstance"
								:chartOptionsUpdate="chartOptionsUpdate"
							/>
						</div>
					</div>
				</div>

				<div
					class="zoom-block-container mcol-xs-6 mcol-lg-8 mcol-xlg-auto fft-chart-actions capitalize"
					v-show="!chartIsHidden"
				>
					<!-- v-if="ChartInstance.parameterItem.type !== 'waveform'" -->
					<ChartOperationsBar
						ref="ChartOperationsBar"
						@event="handleEventNew"
						:actionButtons="chartOperationsButtons"
						:activeButtonValues="activeButtonValues"
						:xAxisTitle="xAxisTitle"
						:chartPeaks="chartPeaks"
					/>
				</div>

				<div
					class="mcol-xs-12 mcol-lg-auto fft-chart-actions fft-analysis-bar-container capitalize"
					v-show="!chartIsHidden"
					v-for="component in selectedChildComponents"
					:key="`fft-analysis-rules-bar-${component.id}`"
				>
					<ChartFFTAnalysisRulesBar
						ref="ChartFFTAnalysisRulesBar"
						:componentItem="component"
						:equipmentData="additionalProps.equipmentData"
						:selectedAnalysisRules="selectedAnalysisRules"
						@event="handleEventNew"
					/>
				</div>

				<div
					v-show="!chartIsHidden"
					class="zoom-block-container hover-data-block-wrapper mcol-xs-6 mcol-lg-4 mcol-xlg-auto"
				>
					<div class="chart-actions-block hover-data-block" v-show="hoverData.x">
						<span
							class="div-block semi-bold capitalize"
							v-text="hoverData.x || ''"
						></span>
						<span
							class="div-block"
							v-text="hoverData.y == 0 ? '0.0' : hoverData.y"
						></span>
					</div>
				</div>
			</div>
		</div>

		<div
			v-show="!chartIsHidden && (initialFetch || hasStatistics)"
			:class="['chart-container fft-chart-container']"
		>
			<!-- v-if="isChartOptionsReady" -->
			<div class="flex mrow wrap">
				<div class="mcol-xs-12 mcol-sm-8 mcol-xlg-9 fluid">
					<ChartWrapper ref="ChartWrapper" :chartOptions="chartOptions" />
				</div>

				<div
					v-if="activeButtonValues.showPeaksActive"
					class="mcol-xs-12 mcol-sm-4 mcol-xlg-3 fft-peaks-wrapper"
				>
					<PeaksList
						title="Highest Peaks"
						:data="chartPeaks"
						:xAxisTitle="xAxisTitle"
						:yAxisTitle="yAxisTitle"
					/>
						<!-- :metric="rootFilters.measurement" -->
				</div>
			</div>
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
			:title="`${tt('Waterfall')} ${tt('Graphs')}`"
			center
			:append-to-body="true"
			:visible.sync="activeButtonValues.showWaterfallActive"
			class="waterfall-chart-dialog big dialog-decorate-header filled-header rounded top"
		>
			<WaterfallStatisticsContainer
				v-if="activeButtonValues.showWaterfallActive"
				:currentFFTChartStatistics="chartFetchedStatistics"
				:prevFFTItems="prevFFTItems"
				:chartMainData="chartMainData"
				:rootFilters="rootFilters"
			/>
		</el-dialog>

		<audio id="waveformSoundPlayer" src=""></audio>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import { getRoundedValue, findItemBy, /*countDecimalOrder*/ } from '@/helpers';
import { getCurrentRpmSource } from '@/helpers/specialHelpers';

import { BANNER_REQUEST_TYPES } from '@/constants/global';

import { eventHandler } from '@/mixins';
// import { NCD_AXIS } from '@/modules/charts_factory/controllers/Sensor/enums';

// import CoverOverlay from '@/components/CoverOverlay.vue';

export default {
	mixins: [eventHandler()],
	components: {
		ChartZoom: () => import('../ChartZoom.vue'),
		ChartOperationsBar: () => import('../ChartOperationsBar.vue'),
		PeaksList: () => import('./PeaksList.vue'),
		ChartWrapper: () => import('@/components/charts/ChartWrapper.vue'),
		WaterfallStatisticsContainer: () => import('./WaterfallStatisticsContainer.vue'),
		ChartFFTAnalysisRulesBar: () => import('./ChartFFTAnalysisRulesBar.vue')
	},
	props: {
		ChartInstance: {
			type: Object,
			required: true
		},

		propsLoadingChart: Boolean,

		rootFilters: {
			type: Object,
			default: () => ({})
		},

		prevFFTItems: Array,
		currentFFTItem: {
			type: Object,
			required: true
		},

		activeAxis: Number,

		additionalProps: {
			type: Object,
			default: () => ({})
		},

		// prevFFTId: Number,
	},
	data() {
		return {
			chartOptionsUpdate: 0,
			chartLoading: false,
			chartRendering: false,
			chartIsInit: false,
			statisticsResponsesReady: false,
			initialFetch: true,
			hasStatistics: false,
			showWaterfall: false,

			hoverData: {},

			chartIsHidden: false,
			refetchChartData: false,			

			activeButtonValues: {
				addCursorActive: false,
				showPeaksActive: false,
				showPeriodicActive: false,
				showWaterfallActive: false,
				generatingWaveform: false,
				analysisRuleButton30: false
			},

			activeFFTAnalysisButtons: null,

			createdWaveforms: {
				axis_1: '',
				axis_2: '',
				axis_3: '',
			},

			selectedAnalysisRules: [],
		};
	},

	computed: {
		...mapState({
			isSidebarCollapse: state => state.global.isSidebarCollapse
			// globalFilters: state => state.global.globalFilters
		}),

		/*prevFFTids: that => Object.freeze([
			that.prevFFTId
		]),*/

		isRequestTypeStandard: that => that.currentFFTItem && that.currentFFTItem.banner_request_type === BANNER_REQUEST_TYPES.STANDARD,
		// isRequestTypeEnvelope: that => that.currentFFTItem.banner_request_type === BANNER_REQUEST_TYPES.ENVELOPE,

		currentFFTItemAxisId() {
			const axisItem = findItemBy('axis_number', this.activeAxis, this.currentFFTItem.axes);
			return axisItem ? axisItem.id : null;
		},


		showDisableChartButton() {
			// return false;
			// console.log('showDisableChartButton, isRequestTypeStandard-', this.isRequestTypeStandard)
			return this.chartMainData.parameterItem.type === 'acceleration' && this.isRequestTypeStandard
		},

		chartOperationsButtons() {
			let buttons = [];

			const { type } = this.chartMainData.parameterItem;

			if (type == 'waveform') {
				buttons.push(
					{
						id: 6,
						prefix_icon: 'el-icon-video-play',
						type: 'secondary inverted',
						event: 'handlePlaySound',
						loadingKey: 'generatingWaveform'
					}
				);
			}

			// if (this.$hasAccessTo(['create_maintenance'])) {
			buttons.push(
				{
					id: 1,
					text: `${this.tt('Add')} ${this.tt('Cursor')}`,
					prefix_icon: 'icon-cursor',
					type: 'secondary inverted',
					activeKey: 'addCursorActive',
					event: 'addCursor'
				},
				{
					id: 3,
					text: `${this.tt('Show')} ${this.tt('Peaks')}`,
					event: 'showPeaks',
					type: 'secondary inverted',
					prefix_icon: 'icon-peaks',
					activeKey: 'showPeaksActive'
				},
				{
					id: 4,
					text: `${this.tt('Periodic')} ${this.tt('Cursors')}`,
					event: 'showPeriodicCursors',
					type: 'secondary inverted',
					prefix_icon: 'icon-periodic',
					activeKey: 'showPeriodicActive',
					isPeriodicCursors: true
				},
				{
					id: 5,
					text: `${this.tt('Waterfall')}`,
					event: 'showWaterfallCharts',
					type: 'secondary inverted',
					prefix_icon: 'icon-waterfall',
					activeKey: 'showWaterfallActive'
				},
				{
					id: 2,
					text: `${this.tt('Remove')}`,
					type: 'secondary inverted',
					prefix_icon: 'icon-plus rotate',
					isDelete: true,
					event: 'removeAllCursors'
				}
			);
			// }

			return Object.freeze(buttons);
		},

		// chartFFTAnalysisOperationsButtons

		chartOptions: that =>
			that.chartOptionsUpdate
				? Object.freeze(that.ChartInstance.getChartOptions())
				: null,

		chartFetchedStatistics: that =>
			that.chartOptionsUpdate
				? Object.freeze(that.ChartInstance.getFetchedStatistics())
				: null,

		chartMainData: that =>
			Object.freeze({
				sensorItem: that.ChartInstance.sensorItem,
				currentSensorType: that.ChartInstance.currentSensorType,
				parameterItem: that.ChartInstance.parameterItem,
			}),

		chartPeaks: that =>
			that.chartOptionsUpdate ? Object.freeze(that.ChartInstance.peaksList) : null,

		xAxisTitle: that =>
			that.chartOptionsUpdate ? that.ChartInstance.getXAxisTitle() : '',
		yAxisTitle: that =>
			that.chartOptionsUpdate ? that.ChartInstance.getYAxisTitle() : '',

		isPeriodicCursorsGenerated: that =>
			that.chartOptionsUpdate
				? that.ChartInstance.checkIsPeriodicCursorsGenerated()
				: null,

		ChartAPI: that => (that.chartIsInit ? that.ChartInstance.ChartAPI : null),

		chartTitle: that => that.ChartInstance.chartTitle,

		chartPlotOptionsEventsList() {
			return Object.freeze([
				{
					plotOptionKey: 'series',
					name: 'mouseOver',
					event: e => this.handleMouseOver(e)
				},
				{
					plotOptionKey: 'series',
					name: 'mouseOut',
					event: () => {
						this.hoverData = {};
					}
				}
				// mouseOut: () => {	this.hoverData = {};}
			]);
		},

		chartInstanceEventsList() {
			let list = {
				isLoading: value => (this.chartLoading = value),
				isRendering: value => (this.chartRendering = value),
				isInitiated: () => (this.chartIsInit = true),
				statisticsResponsesReady: ready =>
					this.handleStatisticsResponsesReady(ready),
				hasStatistics: value => this.handleHasStatistics(value),
				chartOptionsReady: options => this.handleChartOptionsReady(options),
				chartOptionsUpdate: options => this.handleChartOptionsReady(options),
				rpmCursorDrop: data => this.handleRpmCursorDrop(data)
			};

			return Object.freeze(list);
		},

		chartPointsEventsList() {
			return Object.freeze({
				pointClickEvent: { name: 'click', event: e => this.handleChartPointClick(e) }
				// cursorClickEvent: { name: 'click', event: e => this.handleCursorClick(e)},
				// cursorDragEvent: { name: 'drag', event: e => this.handleCursorDrag(e)},
				// periodicCursorDragEvent: { name: 'drag', event: e => this.handlePeriodicCursorDrag(e)},
			});
		},

		selectedChildComponents() {
			let colorIndex = 0;

			return this.additionalProps.selectedChildComponents.map(ci => {

				return {
					...ci,
					vibration_analysis_rules: ci.vibration_analysis_rules.map(rule => {
						const item = {
							...rule,
							color: this.colorsList[colorIndex] || '#000',
							y_position: -(250 - colorIndex * 20)
						}
						colorIndex++;
						return item;
					})
				}
			})
		},

		colorsList: () => Object.freeze([
			'#ff0000','#00E676','#795548','#18FFFF','#00B8D4','#FFEA00',
			'#ff00ff','#c800ea','#008a09','#FFAB40','#9c0303','#2979FF',
		]),

		currentRpmSource() {
			// console.log('currentRpmSource', this.additionalProps.equipmentData)
			return getCurrentRpmSource({
				fftItem: this.currentFFTItem,
				sensorData: this.ChartInstance.sensorItem,
				rpm_source_item: this.additionalProps.equipmentData.rpm_source_item
			})
		},
	},

	methods: {
		updateLocalStorageValue(value) {
			var localStorageHiddenChartsData = JSON.parse(localStorage.getItem('banner_fft_hidden_charts')) || {};
			localStorageHiddenChartsData[this.currentFFTItem.id] = localStorageHiddenChartsData[this.currentFFTItem.id] || {};
			
			localStorage.setItem('banner_fft_hidden_charts', JSON.stringify({
				...localStorageHiddenChartsData,
				[this.currentFFTItem.id]: {
					...localStorageHiddenChartsData[this.currentFFTItem.id],
					[this.ChartInstance.chart_id]: value
				}
			}));
		},

		toggleChart() {
			this.chartIsHidden = !this.chartIsHidden;
			// this.ChartInstance.toggleChart(this.chartIsHidden);
			this.updateLocalStorageValue(this.chartIsHidden);

			if (!this.chartIsHidden &&
					(!this.chartIsInit || !this.hasStatistics || this.refetchChartData)
			) {
				this.fetchChartData();
				this.refetchChartData = false;
			}
		},

		zoomYAxis(data) {
			if (!this.ChartInstance.ChartAPI && !this.ChartInstance.ChartAPI.yAxis) return;

			this.ChartInstance.ChartAPI.yAxis[0].setExtremes(...data);
		},

		handleMouseOver({ target }) {
			const { x, y, options } = target;

			if (!options.isCursor) {
				this.hoverData = {
					x: `${getRoundedValue(x, 1, 4)} ${this.xAxisTitle}`,
					y: `${getRoundedValue(y, 1, 6)} ${this.yAxisTitle}`
				};
			}
		},

		fetchChartData(filters = {}, settings = {}) {
			this.ChartInstance.fetchChartData(filters, settings);
		},

		handleStatisticsResponsesReady(ready) {
			this.statisticsResponsesReady = ready;

			if (ready) {
				// console.log('handleStatisticsResponsesReady')
				this.initialFetch = false;
			}
		},

		handleHasStatistics(value) {
			this.hasStatistics = value;
		},

		handleChartOptionsReady(/*options*/) {
			this.chartOptionsUpdate++;
		},

		handlePlaySound() {
			const { axis_id: axis_number } = this.chartMainData.parameterItem;
			const waveformItem = findItemBy('axis_number', axis_number, this.currentFFTItem.axes);

			if (waveformItem) {
				if (waveformItem.sound_waveform_sample) {
					this.playSound(waveformItem.sound_waveform_sample);
				} else {
					if (this.createdWaveforms[`axis_${axis_number}`]) {
						this.playSound(this.createdWaveforms[`axis_${axis_number}`]);
					} else {
						this.activeButtonValues.generatingWaveform = true;
						
						this.$store.dispatch('sensors/create_fft_waveform', {
							sensorId: this.chartMainData.sensorItem.id,
							fftId:	this.currentFFTItem.id,
							axisId: waveformItem.id
						})
							.then(response => {
								this.activeButtonValues.generatingWaveform = false;
								if (response && response.value && response.value.sample_filename) {
									this.createdWaveforms[`axis_${axis_number}`] = response.value.sample_filename;
									this.playSound(response.value.sample_filename);
								}
							})
							.catch(error => {
								console.log(error)
								this.activeButtonValues.generatingWaveform = false;
							});
					}
				}
			}
		},

		trimBuffer(audioContext, buffer, trimDuration = 0.03) {
		  const trimSamples = Math.floor(trimDuration * buffer.sampleRate);
		  const trimmedLength = buffer.length - trimSamples;

		  const newBuffer = audioContext.createBuffer(
		    buffer.numberOfChannels,
		    trimmedLength,
		    buffer.sampleRate
		  );

		  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
		    const oldData = buffer.getChannelData(ch);
		    const newData = newBuffer.getChannelData(ch);
		    for (let i = 0; i < trimmedLength; i++) {
		      newData[i] = oldData[i];
		    }
		  }

		  return newBuffer;
		},

		playSound() {
			const audioContext = new AudioContext();
			this.$store.dispatch('sensors/fetch_fft_waveform', {
				sensorId: this.ChartInstance.sensorItem.id,
				fftId: this.currentFFTItem.id,
				axis: this.currentFFTItemAxisId
			}).then(({value}) => {
				if (value.data) return value.data;
			}).then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
			.then(audioBuffer => {
				const trimmedBuffer = this.trimBuffer(audioContext, audioBuffer, 0.04);
				const duration = trimmedBuffer.duration;

				const repeatCount = Math.ceil(2 / duration);

				const now = audioContext.currentTime;
				for (let i = 0; i < repeatCount; i++) {
					const source = audioContext.createBufferSource();
					source.buffer = trimmedBuffer;
					source.connect(audioContext.destination);
					source.start(now + i * duration);
				}
			});
		},

		addCursor() {
			this.activeButtonValues['addCursorActive'] = !this.activeButtonValues
				['addCursorActive'];
		},

		removeAllCursors() {
			this.ChartInstance.removeCursor();
		},

		showPeaks() {
			this.activeButtonValues.showPeaksActive = !this.activeButtonValues
				.showPeaksActive;
			this.ChartInstance.togglePeaks(this.activeButtonValues.showPeaksActive);

			setTimeout(() => {
				const ChartRef = this.$refs.ChartWrapper;
				if (ChartRef) {
					// console.log(this.)
					const containerWidth = ChartRef.$el.clientWidth - 1;
					const containerHeight = ChartRef.$el.clientHeight;
					this.ChartAPI.setSize(containerWidth, containerHeight);
				}
			}, 50);
		},

		showPeriodicCursors() {
			this.activeButtonValues.showPeriodicActive = !this.activeButtonValues
				.showPeriodicActive;

			if (
				this.activeButtonValues.showPeriodicActive &&
				!this.isPeriodicCursorsGenerated
			) {
				this.$refs.ChartOperationsBar.generatePeriodicCursors();
			}
		},

		showWaterfallCharts() {
			this.showWaterfall = true;
			this.activeButtonValues.showWaterfallActive = !this.activeButtonValues
				.showWaterfallActive;
		},

		generatePeriodicCursors(formData) {
			this.ChartInstance.generatePeriodicCursors(formData);
		},

		handleChartPointClick(e) {
			const { point } = e;
			if (this.activeButtonValues.addCursorActive && point) {
				this.hoverData = {};
				this.ChartInstance.addCursor(point);
			}
		},

		handleRpmCursorDrop({ x }) {
			this.$emit('event', {
				eventName: 'handleRpmCursorDrop',
				data: {
					rpm_value: getRoundedValue(x, 0, 0),
					isFFTRPM: true
				},
				onward: true
			})
		},

		/*updateRpmCursor(source) {
			this.ChartInstance.setValue('rpmValue', source);
			this.ChartInstance.addRpmCursor();
		},*/

		// -------------------
		addAnalysisRuleToSelected(rule) {
			const isSelected = this.selectedAnalysisRules.some(item => item.id === rule.id);
			if (!isSelected) {
				this.selectedAnalysisRules.push(rule);
			} else {
				this.selectedAnalysisRules = this.selectedAnalysisRules.filter(item => item.id !== rule.id);
			}

			/*this.selectedAnalysisRules = this.selectedAnalysisRules.map((item, index) => ({
				...item,
				color: this.colorsList[index]
			}));*/
			// console.log('addAnalysisRuleToSelected', this.selectedAnalysisRules)
			this.ChartInstance.generateAnnotationsFromFFTAnalysisRules(this.selectedAnalysisRules);
		},

		/*handleCursorClick({point}) {
			this.ChartInstance.removeCursor(point);
		},

		handleCursorDrag({target}) {
			console.log(target)
		},*/

		/*handlePeriodicCursorDrag({target}) {
			console.log(target)
		}*/
	},

	watch: {
		rootFilters(filters) {
			if (filters.measurement !== this.ChartInstance.measurement) {
				// console.log('watch rootFilters', this.ChartInstance.chart_id)
				this.ChartInstance.updateChartByMetric(filters);
				this.ChartInstance.resetZoom();
				if (this.activeButtonValues.showPeaksActive) {
					this.showPeaks();
				}

				this.refetchChartData = true;
			}
		},

		isSidebarCollapse() {
			setTimeout(() => {
				const ChartRef = this.$refs.ChartWrapper;
				if (ChartRef) {
					const containerWidth = ChartRef.$el.clientWidth - 1;
					const containerHeight = ChartRef.$el.clientHeight;
					this.ChartAPI.setSize(containerWidth, containerHeight);
				}
			}, 500);
		},

		chartFFTAnalysisOperationsButtons(buttons) {
			if (buttons.length) {
				this.activeFFTAnalysisButtons = {};
				buttons.forEach(button => {
					this.activeFFTAnalysisButtons[button.activeKey] = false;
				});

			}
		},

		'currentRpmSource'(data) {
			// console.log('currentRpmSource watch', data)
			this.ChartInstance.setValue('rpmSourceValue', data);
			// this.ChartInstance.addRpmCursor({skipOptionsUpdate: true});
			// this.updateRpmCursor(data);
			// console.log('watch currentFFTItem.rpm_value', rpm_value)
		}
	},

	mounted() {
		// console.log('mounted')
		if (this.showDisableChartButton) {
			this.chartIsHidden = true;				
			var localStorageHiddenChartsData = JSON.parse(localStorage.getItem('banner_fft_hidden_charts'));

			if (localStorageHiddenChartsData) {
				var currentFFTValue = localStorageHiddenChartsData[this.currentFFTItem.id];
				var currentChartId = this.ChartInstance.chart_id;

				if (currentFFTValue && (currentFFTValue[currentChartId] !== undefined)) {
					this.chartIsHidden = currentFFTValue[currentChartId];
				}
			}
		}

		if (!this.chartIsHidden) {
			this.fetchChartData();
		}
	},

	created() {
		// console.log('created Chart')
		this.ChartInstance.injectProps('events', this.chartInstanceEventsList);
		this.ChartInstance.assignPlotOptionsEvents(this.chartPlotOptionsEventsList);

		// if (this.ChartInstance.parameterItem.type !== 'waveform') {
		this.ChartInstance.setValue('seriesEvents', this.chartPointsEventsList);
		// }

		if (this.currentRpmSource && this.currentRpmSource.value != null) {
			// console.log('currentRpmSource 1', this.currentRpmSource)
			// this.updateRpmCursor(this.currentRpmSource);

			this.ChartInstance.setValue('rpmSourceValue', this.currentRpmSource);
		}
	}
};
</script>
