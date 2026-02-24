<template>
	<div :class="[
		'card block-item statistics-block vertical-fluid flex column',
		{ 'adopt-chart-to-viewport': adoptToViewport }
	]">
		<div :class="['card-header flex align-center', { filled: standardIconBlock }]">
			<div class="round-icon-container" v-if="!standardIconBlock">
				<i class="icomoon icon-docs"></i>
			</div>
			<i v-else class="icomoon icon-money-insert"></i>
			<div class="title semi-bold uppercase">
				{{ tt('phrases.roi_value_creation') }}
			</div>
		</div>

		<div class="card-content gauge-content relative flex column fluid">
			<!-- <SimpleSpinner :active="itemsLoading" /> -->

			<div :class="['content-row', {'mt-auto': !disableTabs}]">
				<GaugeStatisticsContainer
					@event="handleEventNew"
					:plantItem="plantItem"
					:plantsList="plantsList"
					:selectedColumnsNumber="selectedColumnsNumber"
					:showStatisticsOutsideChart="disableTabs"
					:rootFilters="equipments_statistics_filters"
					:allPlantsRoiStatistics="allPlantsRoiStatistics"
				/>
			</div>

			<div class="content-row instances-roi-charts mt-auto relative"
				v-if="disableTabs"
			>
				<SimpleSpinner :active="isLoading" />

				<div class="roi-statistics-list">
					<div class="roi-statistics-item flex align-center"
						v-for="(item) in statistics"
						:key="`roi-statistics-item-${item.instance_id}`"
						@click="() => handleLabelClick(item)"
					>	
						<div class="plant-name" v-if="!plantItem">{{getPlantName(item.plant_id)}}</div>
						<div class="item-name">{{item.name}}</div>
						<div class="cost">{{item.data_count}} $</div>
					</div>
				</div>
			</div>

			<div class="content-row instances-roi-charts mt-auto"
				v-else
			>
				<TabsBar
					notRound
					stretch
					@switchTab="switchTab"
					:activeTab="activeTab"
					:tabsList="tabsList"
					:height="25"
					:buttonsType="'secondary'"
					:initialAutoSelect="0"
					className="like-in-browser-tabs inverted radio-container bordered x-scroll"
					buttonsClass="filled"
				/>

				<div
					v-if="activeTab.prop == tabsList[0].prop"
					:key="tabsList[0].prop"
					class="tab-container"
				>
					<InstanceROIStatisticsContainer
						instanceIdProp="productionLineId"
						:enableLabelClickEvent="enableLabelClickEvent"
						:predefinedFilters="predefinedFilters"
						fetch_action_url="production-lines/roi"
						:selectedColumnsNumber="selectedColumnsNumber"						
					/>
				</div>

				<div
					v-if="activeTab.prop == tabsList[1].prop"
					:key="tabsList[1].prop"
					class="tab-container"
				>
					<InstanceROIStatisticsContainer
						instanceIdProp="productionLineId"
						:enableLabelClickEvent="enableLabelClickEvent"
						:predefinedFilters="predefinedFilters"
						fetch_action_url="machines/roi"
						:selectedColumnsNumber="selectedColumnsNumber"						
					/>
				</div>

				<div
					v-if="activeTab.prop == tabsList[2].prop"
					:key="tabsList[2].prop"
					class="tab-container"
				>
					<InstanceROIStatisticsContainer
						instanceIdProp="productionLineId"
						:enableLabelClickEvent="enableLabelClickEvent"
						:predefinedFilters="predefinedFilters"
						fetch_action_url="assets/roi"
						:selectedColumnsNumber="selectedColumnsNumber"						
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { tabsMixin, navigation, eventHandler } from '@/mixins';
import { fetch_statistics } from '@/modules/charts_factory/controllers/Maintenance/api/index.js';
import { prepareFilters } from '@/modules/charts_factory/helpers';
import { setupProblemsStatistics } from '@/modules/charts_factory/controllers/Maintenance/methods';

import { findItemBy, getDateRange } from '@/helpers';

export default {
	mixins: [tabsMixin(), navigation(), eventHandler()],
	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		InstanceROIStatisticsContainer: () =>
			import('./InstanceROIStatisticsContainer.vue'),

		GaugeStatisticsContainer: () => import('./GaugeStatisticsContainer.vue')
	},

	props: {
		plantItem: Object,
		plantsList: {type:Array, required:false},
		predefinedFilters: Object,
		standardIconBlock: Boolean,
		enableLabelClickEvent: Boolean,
		disableTabs: Boolean,
		switchTabTo: null,
		selectedColumnsNumber: { type: Object, default: () => ({}) },
		equipments_statistics_filters: { type: Object, default: () => ({}) },
		allPlantsRoiStatistics: null,
	},

	data: () => ({
		statistics: null,
		hasStatistics: false,

	}),

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,			
			roi_one_pagers_filters: state => state.roi_one_pagers.filters,
		}),

		tabsList: that =>
			Object.freeze([
				{ title: `${that.tt('production_lines')}`, prop: 'plTab' },
				{ title: `${that.tt('machines')}`, prop: 'machinesTab' },
				{ title: `${that.tt('assets')}`, prop: 'assetsTab' }
			]),

		adoptToViewport: () => true
		// that => that.selectedColumnsNumber.id == null || that.selectedColumnsNumber.id < 3,
	},

	methods: {
		...mapActions({
			set_roi_one_pagers_filters: 'roi_one_pagers/set_roi_one_pagers_filters',
			set_global_filters: 'set_global_filters',
		}),

		handleLabelClick(e) {
			if (e.plant_id) {
				// console.log(e)
				const { instance_id } = e;
				const daterange = getDateRange('this_year', { getDateString: true });
				// console.log(instance_id, daterange)
				let newFilters = {
					page: 1,
					max: this.roi_one_pagers_filters.max,
					['productionLineId']: instance_id,
					daterange: daterange
				};

				this.setGlobalFilters({ id: e.plant_id, filterName: 'plantId' });
				this.set_roi_one_pagers_filters(newFilters);

				this.changeRoute({
					path: `/success-dashboard/roi-one-pager`
				});
			}
		},

		getPlantName(plant_id) {
			if (this.plantsList) {
				const plant = findItemBy('id', plant_id, this.plantsList);
				if (plant) {
					return plant.name;					
				}
				return '';
			}
		},

		setGlobalFilters({ id, filterName }) {
			const newFilters = { ...this.globalFilters, [filterName]: id };
			this.set_global_filters(newFilters);
		},
	},

	created() {
		if (this.disableTabs) {
			this.isLoading = true;
			const params = { ...prepareFilters(this.predefinedFilters) };

			fetch_statistics({ params, url: "production-lines/roi" })
				.then(({ value }) => {
					this.statistics = setupProblemsStatistics({	data: value, prop: 'roi_cost' });
					// console.log('2 response', this.statistics)
					this.isLoading = false;
					// this.handleResponse(value);
				})
				.catch(() => {
					this.isLoading = false;
				});
		}
	}
};
</script>
