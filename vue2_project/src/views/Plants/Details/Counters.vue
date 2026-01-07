<template>
	<div class="card block-item">
		<div :class="['card-header flex align-center', standardIconBlock ? 'filled' : 'filled_2']">

			<i v-if="standardIconBlock" class="icomoon icon-lab_panel"></i>
			<div class="title semi-bold uppercase">{{ tt('Equipments') }}</div>
		</div>

		<div class="card-content">
			<div class="relative counters-list" v-if="countersList.length">
				<SimpleSpinner :active="countersLoading" />
				<div class="mrow flex wrap">
					<CounterItem
						@event="handleEventNew"
						v-for="item in countersList"
						:key="`counter-${item.title}`"
						:counterData="item"
						:disableViewAll="disableViewAll"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { requestsListMixin, eventHandler } from '@/mixins';

export default {
	mixins: [requestsListMixin(), eventHandler()],

	components: {
		CounterItem: () => import('./CounterItem.vue')
	},

	props: {
		additionalModalSettings: {
			type: Object,
			default: () => ({}),
		},
		disableViewAll: Boolean,
		plantId: null,
		companyId: null,
		standardIconBlock: Boolean
	},

	data: () => ({
		countersLoading: false,
		countersList: [
			{
				title: 'Utilities',
				itemName: 'Utility',
				instance: 'ProductionLines',
				iconName: 'production_lines',
				path: 'utilities',
				count: 0
			},
			{
				title: 'ProdLines',
				itemName: 'Production Line',
				instance: 'ProductionLines',
				iconName: 'production_lines',
				path: 'production-lines',
				count: 0
			},
			{
				title: 'Machines',
				itemName: 'Machine',
				instance: 'Machines',
				iconName: 'machines',
				path: 'machines',
				count: 0
			},
			{
				title: 'Assets',
				itemName: 'Asset',
				instance: 'Assets',
				iconName: 'assets',
				path: 'assets',
				count: 0
			},
			{
				title: 'Items',
				itemName: 'Item',
				instance: 'Equipments',
				iconName: 'equipments',
				path: 'equipments',
				count: 0
			}
			// ProductionLines: 0,
			// Machines: 0,
			// Assets: 0,
			// Equipments: 0
		],

		resetInProccess: false
	}),

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			updateCounters: state => state.global.updateCounters
			// machinesFilters: state => state.machines.filters,
			// assetsFilters: state => state.assets.filters,
			// equipmentsFilters: state => state.equipments.filters,
			// activeItemsTable: state => state.global.activeItemsTable
		}),

		/*productionLineId: that =>
			that.machinesFilters.productionLineId ||
			that.assetsFilters.productionLineId ||
			that.equipmentsFilters.productionLineId,
		machineId: that =>
			that.assetsFilters.machineId || that.equipmentsFilters.machineId,
		assetId: that => that.equipmentsFilters.assetId,*/

		requestsToDoList: that => {
			const {companyId} = that;
			let plantId;
			
			if (!companyId) {
				plantId = that.plantId || (
					that.globalFilters.plantId ? +that.globalFilters.plantId : null
				)				
			}

			let settings = [{
				action: 'fetch_counters',
				payload: {
					params: {	companyId, plantId }
				},
				localProp: 'countersList',
				localLoadProp: 'countersLoading'
			}]
			
			// console.log(plantId)
			if (!that.plantId && !that.companyId) {
				settings.bindTo = [
					{
						prop: 'globalFilters.plantId',
						// clean_prop: 'formData.machine_id',
						param: 'plantId',
						fetchAnyWay: true,
						withoutClean: true
					}
				]
			}
			return Object.freeze(settings)
		}


		/*preparedCountersList() {
			let newList = {...this.countersList};
			if (!Object.keys(newList).some(k => k == 'site_areas') ) {
				newList['site-areas'] = 0;
			}
			return newList;
		}*/
	},

	methods: {
		...mapActions({
			fetch_counters: 'dashboard/fetch_counters',
			set_global_state: 'set_global_state'
		}),

		resetCounters() {
			if (!this.resetInProccess) {
				this.resetInProccess = true;
				this.startFetchAction(this.requestsToDoList[0]);

				if (this.updateCounters) {
					this.set_global_state({
						stateProp: 'updateCounters',
						value: false
					});
				}
			}

			setTimeout(() => {
				this.resetInProccess = false;
			}, 10);
		}

		/*isActiveCard(item) {
			const { activeItemsTable } = this;
			const { instance } = item;
			
			if (activeItemsTable && instance) {
				// console.log(activeItemsTable, instance, activeItemsTable.toLowerCase() == instance.toLowerCase())
				return activeItemsTable.toLowerCase() == instance.toLowerCase();
			}
			return false;
		},*/
	},

	watch: {
		/*productionLineId() {
			this.resetCounters();
		},
		machineId() {
			this.resetCounters();
		},
		assetId() {
			this.resetCounters();
		},*/

		updateCounters(isUpdate) {
			// console.log(isUpdate)
			if (isUpdate) {
				this.resetCounters();
			}
		}
	}
};
</script>
