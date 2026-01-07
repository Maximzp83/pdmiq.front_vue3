<template>
	<div class="counters-wrapper">
		<!-- class="section-block" -->

		<div class="counters-row flex wrap">
			<div
				:class="[
					'mcol-xs-12 mcol-sm-6 mcol-lg-3',
					{ activeCard: isActiveCard(item) }
				]"
				v-for="(item, idx) in countersList"
				:key="`counter-${item.instance}`"
			>
				<template class="" v-if="item.tabs">
					<TabsBar
						notRound
						@switchTab="switchTab"
						:activeTab="activeTab"
						:tabsList="item.tabs"
						:buttonsType="'secondary'"
						:initialAutoSelect="0"
						buttonsClass="medium"
						className="like-in-browser-tabs radio-container"
					/>

					<CounterItem
						v-for="(item, indx) in item.tabs"
						:key="`counter-tab-${item.title}`"
						v-show="activeTab.prop == item.prop"
						:itemData="item"
						:additionalModalSettings="additionalModalSettings"
						:countersLoading="countersLoading"
						:index="indx"
					/>
				</template>

				<CounterItem
					v-else
					:itemData="item"
					:additionalModalSettings="additionalModalSettings"
					:countersLoading="countersLoading"
					:index="idx"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { requestsListMixin, tabsMixin } from '@/mixins';

export default {
	mixins: [requestsListMixin(), tabsMixin()],

	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		CounterItem: () => import('./CounterItem.vue')
	},

	props: {
		additionalModalSettings: {
			type: Object,
			default: () => ({})
		}
	},

	data: that => ({
		countersLoading: false,
		countersList: [
			{
				tabs: [
					{
						title: `${that.tt('prod_line')}s`,
						prop: 'prodTab',
						hideHeader: true,
						itemName: 'Production Line',
						instance: 'ProductionLines',
						iconName: 'production_lines',
						path: 'production-lines',
						count: 0,
						postfix_data: {
							html: `<span class="count-block">0</span>`
						}
					},
					{
						title: `${that.tt('utilities')}`,
						prop: 'utilTab',
						hideHeader: true,
						itemName: 'Utility',
						instance: 'ProductionLines',
						iconName: 'production_lines',
						path: 'utilities',
						count: 0,
						postfix_data: {
							html: `<span class="count-block">0</span>`
						}
					}
				]
			},
			{
				title: `${that.tt('Machine')}s`,
				itemName: 'Machine',
				instance: 'Machines',
				iconName: 'machines',
				path: 'machines',
				count: 0
			},
			{
				title: `${that.tt('Asset')}s`,
				itemName: 'Asset',
				instance: 'Assets',
				iconName: 'assets',
				path: 'assets',
				count: 0
			},
			{
				title: `${that.tt('Item')}s`,
				itemName: 'Item',
				instance: 'Equipments',
				iconName: 'equipments',
				path: 'items',
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
			updateCounters: state => state.global.updateCounters,
			machinesFilters: state => state.machines.filters,
			assetsFilters: state => state.assets.filters,
			equipmentsFilters: state => state.equipments.filters,
			activeItemsTable: state => state.global.activeItemsTable
		}),

		productionLineId: that =>
			that.machinesFilters.productionLineId ||
			that.assetsFilters.productionLineId ||
			that.equipmentsFilters.productionLineId,
		machineId: that =>
			that.assetsFilters.machineId || that.equipmentsFilters.machineId,
		assetId: that => that.equipmentsFilters.assetId,

		requestsToDoList: that =>
			Object.freeze([
				{
					action: 'fetch_counters',
					payload: {
						params: {
							productionLineId: that.productionLineId
								? +that.productionLineId
								: null,
							machineId: that.machineId ? +that.machineId : null,
							assetId: that.assetId ? +that.assetId : null,
							plantId: that.globalFilters.plantId
								? +that.globalFilters.plantId
								: null
						}
					},
					bindTo: [
						{
							prop: 'globalFilters.plantId',
							// clean_prop: 'formData.machine_id',
							param: 'plantId',
							fetchAnyWay: true,
							withoutClean: true
						}
					],
					localProp: 'countersList',
					localLoadProp: 'countersLoading'
				}
			])

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
		},

		isActiveCard(item) {
			const { activeItemsTable } = this;
			const { instance } = item;

			if (activeItemsTable && instance) {
				// console.log(activeItemsTable, instance, activeItemsTable.toLowerCase() == instance.toLowerCase())
				return activeItemsTable.toLowerCase() == instance.toLowerCase();
			}
			return false;
		}
	},

	watch: {
		productionLineId() {
			this.resetCounters();
		},
		machineId() {
			this.resetCounters();
		},
		assetId() {
			this.resetCounters();
		},

		updateCounters(isUpdate) {
			// console.log(isUpdate)
			if (isUpdate) {
				this.resetCounters();
			}
		}
	}
};
</script>
