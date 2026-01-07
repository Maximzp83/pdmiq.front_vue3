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
			filters: state => state.industrial_services.filters
		}),

		hasAccesToCreate: that => that.$hasAccessTo(['create_settings']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_settings']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_settings']),

		itemsName: that => ({
			one: that.$t('Industrial_Service'),
			mult: that.$t('Industrial_Services')
		}),

		/*navbarSettings: () => ({
			// showCreateButtonForTableForm: true,
			showDeleteButton: true,
			showFilter: true,
			pageTitle: 'Settings'
		}),*/

		instanceName: () => 'IndustrialServices',

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: [
					{
						label: 'Name',
						prop: 'name',
						sortable: true
					}
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		},

		localModalSettings() {
			let componentPath = 'Settings/IndustrialServices/ItemForm';

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

			fetch_items: 'industrial_services/fetch_industrial_services',
			save_item: 'industrial_services/save_industrial_service',
			delete_item: 'industrial_services/delete_industrial_services',

			set_filters: 'industrial_services/set_industrial_services_filters'
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
