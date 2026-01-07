<template>
	<div class="section-row view-list-wrapper">
		<div class="view-content-card card content-row">
			<div class="card-content">
				<Filterbar
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:hideCreate="!hasAccesToCreate"
					:hideDelete="!hasAccesToDelete"
				/>

				<CustomDataListTable
					ref="ItemsTableContainer"
					@event="handleEventNew"
					:disableSelection="!hasAccesToDelete"
					:itemsLoading="itemsLoading"
					:tableData="itemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
				/>

				<PaginationContainer
					v-if="itemsList.length"
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';

import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
		// CreateItemForm: () => import('./CreateItemForm.vue')
	},

	props: {
		editInModal: {
			type: Boolean,
			default: true
		}
	},

	data() {
		return {
			// openCreateForm: false,
			// collectedData: []
		};
	},

	computed: {
		...mapState({
			filters: state => state.bearings.filters
		}),

		itemsName: that => ({
			one: that.$t('Bearing'),
			mult: that.$t('Bearings')
		}),

		hasAccesToCreate: that => that.$hasAccessTo(['create_settings']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_settings']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_settings']),

		/*navbarSettings: () => ({
			// showCreateButtonForTableForm: true,
			showDeleteButton: true,
			showFilter: true,
			pageTitle: 'Settings'
		}),*/

		instanceName: () => 'Bearings',

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'number',
						label: 'Number',
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'width',
						label: 'Width'
					},
					{
						prop: 'outside_diameter',
						label: 'phrases.Outside_diameter'
					}
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		},

		localModalSettings() {
			let componentPath = 'Settings/Bearings/ItemForm';

			return {
				componentPath: componentPath,
				single: true,
				callback: () => {
					this.fetchItems({ ...this.filters, ...this.globalFilters });
					this.show_edit_modal({ show: false });
				}
			};
		}
	},

	methods: {
		...mapActions({
			forceRerender: 'forceRerender',

			fetch_items: 'bearings/fetch_bearings',
			save_item: 'bearings/save_bearing',
			delete_item: 'bearings/delete_bearing',

			set_filters: 'bearings/set_bearings_filters'
		})

		// localRouteQueryHandler:()=>null,

		/*createItem() {
			const payload = {
				show: true,
				instanceName: this.instanceName,
				itemName: this.itemName,
				instanceData: null,
				componentPath: 'Settings/Faults'
			};

			this.show_edit_modal(payload);
		}*/
	},

	watch: {
		/*fault_type(type) {
			if (type) {
				this.forceRerender('faultsComponentKey')
			}
		}*/
	},

	beforeMount() {
		// console.log(this.fault_type)
	}
};
</script>
