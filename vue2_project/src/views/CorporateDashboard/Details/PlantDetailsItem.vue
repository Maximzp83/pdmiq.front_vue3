<template>
	<div class="column-item">
		<div class="card-header filled_2" v-if="plantItem">
			<div class="section-title semi-bold">{{ plantItem.name }}</div>
			<div class="in-service-label" v-if="atService">
				{{`${atService} ${tt('in_service')}`}}
			</div>				
		</div>
		<div class="card-content">
			<div class="plant-details details-page main-instance-item">
				<div class="mrow flex wrap big-padding">
					<div :class="[selectedColumnsNumber.id > 1 ? 'mcol-xs-12' : 'mcol-lg-6']">
						<div class="mrow">
							<div class="pdm-statistics-wrapper mcol-xs-12">
								<!-- <div class="test">dfghfrghfghfgh</div> -->
									<!-- @event="handleEventNew" -->
								<ItemPDMsStatisticBlock
									:title="tt('phrases.overall_asset_health')"
									:filters="filters"
									:predefinedFilters="predefinedFilters"
									:selectedColumnsNumber="selectedColumnsNumber"
								/>
							</div>
								<!-- :chartLegendEvents="chartLegendEvents" -->
							<div class="mcol-xs-12 counters-wrapper">
								<Counters
									standardIconBlock
									disableViewAll
									:plantId="plantItem ? plantItem.id : null"
									:companyId="companyId"
								/>
							</div>
						</div>
					</div>

					<div :class="[selectedColumnsNumber.id > 1 ? 'mcol-xs-12' : 'mcol-lg-6', 'roi-charts-wrapper']">
						<ROIStatisticsContainer
							:plantItem="plantItem"
							:plantsList="plantsList"
							:predefinedFilters="predefinedFilters"
							:switchTabTo="{ key: 'prop', value: 'plTab' }"
							disableTabs
							standardIconBlock
							:selectedColumnsNumber="selectedColumnsNumber"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	getPassedTime,
	// prepareRangeParams,
	// cleanDateString,
	// cloneDeep
} from '@/helpers';
// import { required /*number*/ } from '@/constants/validation';
// import { MAINTENANCE_TYPES } from '@/constants/global';

import { eventHandler, } from '@/mixins';

export default {
	mixins: [eventHandler()],
	// name: 'QuoteTab',
	components: {
		ItemPDMsStatisticBlock: () => import('@/components/itemDetails/ItemPDMsStatisticBlock.vue'),
		Counters: () => import('@/views/Plants/Details/Counters.vue'),
		ROIStatisticsContainer: () => import('@/views/SuccessDashboard/MainDashboard/ROIStatisticsContainer.vue'),
	},

	props: {
		companyId: Number,
		plantItem: {type:Object, required:false},
		plantsList: {type:Array, required:false},
		propsFilters: {type:Object, required:false},
		selectedColumnsNumber: {type:Object, default: () => ({})},
		isLastItem: Boolean
		// sensorsList: Array
	},

	data() {
		return {
		};
	},

	computed: {
		...mapState({
			filters: state => state.plants.statistics_filters,
			authUser: state => state.auth.authUser
		}),

		atService() {
			if (this.plantItem.joined_at) {
				return getPassedTime(Date.now(), this.plantItem.joined_at);				
			}
			return null;
		},

		predefinedFilters() {
			const { propsFilters, plantItem, filters } = this;
			
			let resultFilters = {
				plantId: plantItem && plantItem.id,
				daterange: filters.daterange,
			}

			if (propsFilters) {
				resultFilters = {...resultFilters, ...propsFilters};
			}

			return Object.freeze(resultFilters);
		},

		/*isIndustrialMatrix() {
			return this.$store.state.auth.isIndustrialMatrix;
		},*/
	},

	methods: {
		...mapActions({
			// fetch_plants: 'plants/fetch_plants',
		}),

	},

	watch: {
		selectedColumnsNumber() {
			if (this.isLastItem) {
				this.$nextTick(() => {
					this.$emit('onLastItemMounted');
				});
			}
		}
	},

	mounted() {
		if (this.isLastItem) {
			this.$nextTick(() => {
				this.$emit('onLastItemMounted');
			});
		}
	}
};
</script>
