<template>
	<div class="counters-wrapper">
		<!-- class="section-block" -->

		<div class="counters-row mrow flex wrap">
			<CounterItem
				:isLoading="analyticsLoading"
				class="mcol-xs-12 mcol-sm-4 mcol-lg-20"
				v-for="item in countersList"
				:key="`counter-${item.title}`"
				:counterData="item"
				:additionalModalSettings="additionalModalSettings"
				:filters="filters"
				@event="handleEventNew"
			/>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	requisitionStatusesList,
	REQUISITION_STATUSES_TYPES
} from '@/constants/global';
import { prepareRangeParams } from '@/helpers';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],

	components: {
		CounterItem: () => import('./CounterItem.vue')
	},

	props: {
		additionalModalSettings: {
			type: Object,
			default: () => ({})
		},

		authUser: {
			type: Object,
			default: () => ({})
		},

		filters: {
			type: Object,
			default: () => ({})
		}
	},

	data: () => ({
		analyticsData: {},
		analyticsLoading: false
	}),

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			updateCounters: state => state.global.updateCounters
		}),

		// userCompany: that => that.authUser.company || {},

		countersList() {
			const { analyticsData } = this;

			if (analyticsData) {
				const {
					total_time_work_orders,
					total_costs_work_orders,
					total_work_orders,
					total_approved_work_orders,
					total_completed_work_orders,
					total_denied_work_orders
				} = analyticsData;

				let list = [
					{
						title: 'All',
						hours: total_time_work_orders,
						money: `${total_costs_work_orders} $`,
						statusColor: '#BF1E2E',
						count: total_work_orders
					}
				];

				requisitionStatusesList().forEach(si => {
					let item = {
						title: si.label,
						statusColor: si.color,
						status: si.id
					};
					if (si.id === REQUISITION_STATUSES_TYPES.PENDING) {
						item.count =
							total_work_orders -
							total_approved_work_orders -
							total_completed_work_orders -
							total_denied_work_orders;
					} else {
						item.count = analyticsData[si.statKey];
					}

					list.push(item);
				});

				return Object.freeze(list);
			}

			return [];
		}
	},

	methods: {
		...mapActions({
			fetch_analytics: 'plant_requisitions/fetch_analytics'
			// set_global_state: 'set_global_state'
		}),

		prepareFilters(filters) {
			let newFilters = { ...this.filters, ...this.globalFilters, ...filters };
			if (newFilters.daterange && newFilters.daterange.length) {
				newFilters = {
					...newFilters,
					...prepareRangeParams(newFilters.daterange)
				};
				delete newFilters.daterange;
			}

			return newFilters;
		},

		fetchAnalytics(filters) {
			this.analyticsLoading = true;
			let payload = { params: this.prepareFilters(filters) };

			this.fetch_analytics(payload)
				.then(({ value }) => {
					this.analyticsData = value;
					this.analyticsLoading = false;
				})
				.catch(() => {
					this.analyticsLoading = false;
				});
		}
	},

	watch: {
		'filters.daterange': function(daterange, old_daterange) {
			if (daterange != old_daterange) {
				this.fetchAnalytics({ daterange: daterange });
			}
		},
		'globalFilters.plantId': function(plantId, old_plantId) {
			if (plantId != old_plantId) {
				this.fetchAnalytics({ plantId: plantId });
			}
		}
	},

	beforeMount() {
		this.fetchAnalytics({ ...this.filters, ...this.globalFilters });
	}
};
</script>
