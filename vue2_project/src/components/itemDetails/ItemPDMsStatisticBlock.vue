<template>
	<div
		:class="[
			'card block-item statistics-block pdmPie-statistics-wrapper',
			{ 'is-spanish': $Lang.currentLangId === LANGUAGE_TYPES.SPANISH },
			{ 'legendEnabled': legendEnabled },
			// { 'adopt-chart-to-viewport': !legendEnabled }
		]"
	>
		<div class="card-header filled flex align-center">
			<!-- <div class="round-icon-container">
				<i class="icomoon icon-chart3"></i>
			</div> -->
			<i class="icomoon icon-chart3"></i>

			<div
				class="title semi-bold uppercase div-block"
				v-text="title || tt('STATISTICS')"
			></div>

			<!-- :href="`/dashboard/equipments`" -->
			<span
				v-if="chartLegendEvents.length"
				@click="handleShowAll"
				class="div-block semi-bold link info-color"
				>{{ tt('phrases.Show_All') }}</span
			>
		</div>

		<div :class="['card-content relative',
			`columnsNumber-${selectedColumnsNumber.id}`
		]">
			<!-- <div class="test">dfgdfg</div> -->
			<CommonChartItemWrapper
				ref="CommonChartItemWrapper"
				@event="handleEventNew"
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="PDMStatisticsPieChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:rootFilters="filters"
				:predefinedFilters="predefinedFilters"
				:additionalProps="chartProps"
				:buildChartsPayloadProps="buildChartsPayload"
			/>

			<div class="chart-statistic-legend-part relative" v-if="resultStatistics"
				v-show="legendEnabled"
			>
				<div
					class=""
					v-for="item in resultStatistics.base"
					:key="`legend-${item.name}`"
				>
					<span class="semi-bold">{{ item.y }}</span>
					<span v-if="item.y"
						>({{ Math.round((item.y / resultStatistics.total) * 100) }}%)</span
					>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { LANGUAGE_TYPES } from '@/localization/utils';
import { navigation, eventHandler } from '@/mixins';

export default {
	mixins: [navigation(), eventHandler()],
	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},
	props: {
		predefinedFilters: { type: Object, default: () => ({}) },
		filters: {
			type: Object,
			default: () => ({})
		},

		chartLegendEvents: { type: Array, default: () => [] },
		title: String,
		selectedColumnsNumber: { type: Object, default: () => ({}) },
	},

	data: () => ({
		hasStatistics: false,
		chartContainerReady: 0
	}),

	computed: {
		printHTMLWindowIsOpen() {
			return this.$store.state.global.printHTMLWindowIsOpen;
		},

		chartProps: that =>
			Object.freeze({
				useSimpleSpinnerAsPreloader: true,
				chartSpecificEvents: that.chartLegendEvents
				// chartPlotOptionsEventsList: that.chartLegendEvents				
				// nodataMock: true
			}),

		buildChartsPayload() {
			return Object.freeze({
				selectedColumnsNumber: this.selectedColumnsNumber.id
			});
		},

		resultStatistics() {
			if (this.chartContainerReady) {
				const { resultData } = this.$refs.CommonChartItemWrapper.ChartInstance;
				return resultData.statistics_result.main.pointsData;
			}
			return null;
		},

		LANGUAGE_TYPES: () => LANGUAGE_TYPES,

		legendEnabled: that => that.selectedColumnsNumber.id == null || that.selectedColumnsNumber.id < 2,

		// alertTypesList: () => alertTypesList().filter(t => t.id != ALERT_TYPES.MIXED)
	},

	methods: {
		handleChartContainerReady({ chartContainerReady, hasStatistics }) {
			this.hasStatistics = hasStatistics;
			this.chartContainerReady = chartContainerReady;
		},

		handleShowAll() {
			this.$emit('event', {
				eventName: 'showItemsWithSensors'
			});
		},

		callChartMethod(method, data) {
			const CommonChartItemWrapper = this.$refs.CommonChartItemWrapper;
			if (CommonChartItemWrapper) {
				CommonChartItemWrapper.callChartMethod(method, data);
			}
		}
	},

	watch: {
		selectedColumnsNumber(val) {
			// setTimeout(() => {
			// if (val > 2) {
				this.callChartMethod('handleColumnsNumberChange', {val: val.id});
			// }
			// }, 10);
		},

		'printHTMLWindowIsOpen'(isOpen) {
			// console.log('printHTMLWindowIsOpen', isOpen)
			// setTimeout(() => {
			// if (this.selectedColumnsNumber.id > 2) {
				this.callChartMethod('handleColumnsNumberChange', {
					val: this.selectedColumnsNumber.id,
					isPrintOpen: isOpen
				});
			// }
			// }, 10);
		}
	}
};
</script>
