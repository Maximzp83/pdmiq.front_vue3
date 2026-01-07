<template>
	<div class="card showHistory relative">
		<!-- v-show="initialFetch"		 -->
		<!-- <div class="dark-overlay"
			v-if="chartSettingsPayload.enableDragNDrop"
		>
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div> -->

		<VueElementLoadingWrapper
			:isLoading="chartLoading /*|| chartRendering*/"
			:itemsName="tt('chart')"
		/>

		<div class="card-header flex mrow wrap align-center" v-if="sensorData">
			<!-- <div class="mcol-xs-2 mcol-lg-1">
				<EquipmentPictureBlock
					@event="handleEventNew"
					:equipmentData="equipmentData"
				/>
			</div> -->

			<div class="mcol-xs-8 mcol-sm-6 mcol-lg-8">
				<!-- <div class="title bold article-title ">{{ sensorTitle }}</div> -->
				<div class="flex align-center">
					<div class="semi-bold div-block">{{ chartTitle }}</div>

					<div class="div-block" v-if="additionalProps.showDisableChartButton">
						<el-button
							@click="toggleChart"
							:class="{ active: chartIsDisabled }"
							native-type="button"
							type="tertiary"
							class="action-button disable-chart-button is-plain"
							size="mini"
						>
							<i
								:class="['icomoon', chartIsDisabled ? 'icon-eye' : 'icon-eye-slash']"
							></i>
						</el-button>
					</div>

					<div class="div-block" v-if="additionalProps.showChartSelectionButton">
						<el-button
							@click="toggleChartSelectionFeature"
							:class="{ active: enableChartSelectionFeature }"
							native-type="button"
							type="tertiary"
							class="action-button disable-chart-button is-plain"
							size="mini"
						>
							<i :class="['icomoon', 'icon-symbol1']"></i>
						</el-button>
					</div>
				</div>
			</div>

			<!-- <div class="ml-auto mcol-xs-auto" v-if="additionalProps.showDatePicker">
				<Datepicker
					setupDaterangeFilter
					enableShortcuts
					v-model="daterange"
					type="daterange"
				/>
			</div> -->
		</div>

		<!-- <div v-show="statisticsDataReady && !hasStatistics" class="chart-mock card no-shadow">
			<div
				class="content-container inlineImg"
				style="background-image: url(/static/img/background/graph.svg)"
			></div>
		</div> -->

		<div
			v-show="!chartIsDisabled && (initialFetch || hasStatistics)"
			:class="['chart-container card-content']"
		>
			<ChartWrapper ref="ChartWrapper" :chartOptions="chartOptions" />
			<!-- constructorType="stockChart" -->
		</div>

		<div
			class="card-footer special-decorated-form"
			v-if="!chartIsDisabled && additionalProps.enableDescriptionForm"
		>
			<div
				:class="[
					'chart-notes-wrapper edit-form-container',
					{ showJustInfo: additionalProps.showJustInfo }
				]"
			>
				<div v-if="notesItemsList.length" class="content-row ">
					<NotesItem
						ref="NotesItem"
						v-for="(item, idx) in notesItemsList"
						:key="`notes_item-${item.id}`"
						:item-data="item"
						:item-index="idx"
						:isLast="idx == notesItemsList.length - 1"
						@onCreate="addFormItem('notesItemsList', 'n_i-')"
						@onRemove="id => removeFormItem(id, 'notesItemsList')"
						:showJustInfo="additionalProps.showJustInfo"
					/>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="additionalProps.showChartSelectionButton && showCommentForm"
			:title="
				`${selectionData.description ? tt('EDIT') : tt('ADD')} ${tt('COMMENT')}`
			"
			center
			:append-to-body="true"
			:visible.sync="showCommentForm"
			class="tiny dialog-decorate-header filled-header rounded top"
		>
			<!-- :item-data="selectionData" -->
			<ChartCommentForm ref="ChartCommentForm" :ChartInstance="ChartInstance" />
		</el-dialog>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import { eventHandler, createFormItemMixin } from '@/mixins';

export default {
	mixins: [eventHandler(), createFormItemMixin()],
	components: {
		ChartWrapper: () => import('@/components/charts/ChartWrapper.vue'),
		// Datepicker: () => import('@/components/common/Datepicker.vue'),
		NotesItem: () => import('./NotesItem.vue'),
		ChartCommentForm: () => import('./ChartCommentForm.vue')
		// EquipmentPictureBlock: () => import('@/views/Sensors/charts/EquipmentPictureBlock.vue'),
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
		// apiIsBusy: Boolean
		sensorData: { type: Object, required: true },
		currentSensorType: Object
	},
	data() {
		return {
			chartIsDisabled: false,
			chartIsInit: false,
			updateChart: 0,
			chartOptionsUpdate: 0,

			chartLoading: false,
			chartRendering: false,
			initialFetch: true,

			hasStatistics: false,
			statisticsResponsesReady: false,

			// daterange: [],
			notesItemsList: [],

			preventFetch: false,
			inQueueForFetch: false, // look

			showCommentForm: false,

			enableChartSelectionFeature: false
		};
	},

	computed: {
		...mapState({
			isSidebarCollapse: state => state.global.isSidebarCollapse,
			gettingSensorAlarmsForms: state =>
				state.meeting_trackers.gettingSensorAlarmsForms
		}),

		chartSettingsPayload: () => ({}),
		graphItem: that => that.ChartInstance.graphItem,
		selectionData: that =>
			that.showCommentForm ? Object.freeze(that.ChartInstance.selectionData) : null,

		equipmentData() {
			if (this.sensorData) {
				return Object.freeze(this.sensorData.equipment);
			}
			return null;
		},

		chartOptions: that =>
			that.chartOptionsUpdate
				? Object.freeze(that.ChartInstance.getChartOptions())
				: null,

		chartInstanceEventsList() {
			let list = {
				chartIsDisabled: value => (this.chartIsDisabled = value),
				isRemoveChart: value => this.handleIsRemoveChart(value),
				showCommentForm: value => (this.showCommentForm = value),

				isLoading: value => (this.chartLoading = value),
				isRendering: value => (this.chartRendering = value),
				isInitiated: () => (this.chartIsInit = true),
				statisticsResponsesReady: ready =>
					this.handleStatisticsResponsesReady(ready),
				hasStatistics: value => this.handleHasStatistics(value),
				chartOptionsReady: options => this.handleChartOptionsReady(options),
				chartOptionsUpdate: options => this.handleChartOptionsReady(options),

				handleValidateNotesItems: () => this.handleValidateNotesItems()
			};

			return Object.freeze(list);
		},

		chartTitle: that => that.ChartInstance.chartTitle
	},

	methods: {
		toggleChart() {
			this.ChartInstance.toggleChart();
		},
		handleIsRemoveChart() {
			this.toggleChart();
		},

		// -------------------
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

		// -------------------
		toggleChartSelectionFeature() {
			this.enableChartSelectionFeature = !this.enableChartSelectionFeature;
			this.ChartInstance.injectProps(
				'options',
				{
					chart: { zoomType: this.enableChartSelectionFeature ? 'x' : null }
				},
				{ emitChartOptionsUpdate: true }
			);
		},

		// -----------------
		setupNotesItems(graphItem) {
			const { enableDescriptionForm, showJustInfo } = this.additionalProps;

			if (enableDescriptionForm) {
				this.notesItemsList = this.setupFormSubItemsList(graphItem.notes, 'n_i');

				if (!showJustInfo && !this.notesItemsList.length) {
					this.addFormItem('notesItemsList', 'n_i-');
				}
			}
		},

		handleValidateNotesItems() {
			return this.$refs['NotesItem'].map(item => item.getFormData());
		}
	},

	watch: {
		rootFilters(filters) {
			this.ChartInstance.setFilters(filters, {
				refetchData: !this.chartIsDisabled
			});
		},

		chartIsDisabled(is_hidden) {
			// console.log('chartIsDisabled', is_hidden)
			if (!is_hidden && (!this.chartIsInit || !this.hasStatistics)) {
				this.fetchChartData();
			}
		}

		/*daterange() {
			if (this.preventFetch) {
				this.preventFetch = false;
			} else if (!this.initialFetch) {
				if (this.chartIsDisabled) return;
				this.fetchChartData();
			}
		},*/
	},

	created() {
		// console.log('created', this.ChartInstance)
		if (this.graphItem) {
			this.setupNotesItems(this.graphItem);
		}

		// this.initStatisticsData();
		this.ChartInstance.injectProps('events', this.chartInstanceEventsList);
		this.ChartInstance.setValue('chartIsDisabled', this.graphItem.is_hidden);

		if (!this.chartIsDisabled) {
			this.fetchChartData();
		}
		/*else {
			this.emitStatisticsDataReady();
		}*/
	}
};
</script>
