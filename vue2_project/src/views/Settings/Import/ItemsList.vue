<template>
	<div class="section-row view-list-wrapper logs-list-wrapper">
		<div class="view-content-card card content-row connected-card">
			<div class="card-content">
				<!-- <Filterbar
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:hideCreate="true"
					:hideDelete="true"
				>
				</Filterbar> -->

				<CustomDataListTable
					ref="ItemsTableContainer"
					disableSelection
					@event="handleEventNew"
					:itemsLoading="itemsLoading"
					:tableData="itemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
				/>

				<PaginationContainer
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
import { cleanDateString } from '@/helpers';
import { LOG_TYPES } from '@/constants/global';

import { itemsDataMixin, eventHandler, navigation } from '@/mixins';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		// Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	/*props: {
		fromDashboard: {
			type: Boolean,
			default: true
		}
	},*/

	data() {
		return {
			// openCreateForm: false,
			// collectedData: []
			/*itemsList: [
				{ id:1, errors: 123, created_at: '2021-09-10' },
				{ id:2, errors: 123, created_at: '2021-09-10' },
				{ id:3, errors: 123, created_at: '2021-09-10' },
			]*/
		};
	},

	computed: {
		...mapState({
			filters: state => state.testing.filters
		}),

		itemsName: that => ({
			one: that.$t('Log'),
			mult: that.$t('Logs'),
			instanceName: 'testing'
		}),

		/*navbarSettings: () => ({
			// showCreateButtonForTableForm: true,
			showFilter: true,
			// infoOnly: true,
			pageTitle: 'Settings'
		}),*/

		// preventSetNavbar: () => true,

		tableSettings() {
			return {
				columns: [
					{
						prop: 'date_start',
						label: 'Start',
						sortable: true,
						width: 170,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'date_end',
						label: 'Finish',
						sortable: true,
						width: 170,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						// prop: 'count_error',
						label: 'Errors count',
						// sortable: true
						meta: {
							additionalActions: [
								{
									className: 'table-link info-color',
									disablePopover: true,
									linkSettings: {
										linkRoute: 'settings/import/:id',
										linkTextProp: 'count_error'
									}
								}
							]
						}
					},
					{
						label: 'Duplicates',
						// sortable: true
						meta: {
							additionalActions: [
								{
									className: 'table-link info-color',
									disablePopover: true,
									linkSettings: {
										linkRoute: 'settings/import/:id',
										linkTextProp: 'count_duplicate'
									}
								}
							]
						}
					},
					{
						prop: 'count_success',
						label: 'Success count',
						meta: {
							emptyText: '0'
						}
					},
					{
						prop: 'error',
						label: 'Error text',
						min_width: 250
					},
					{
						prop: 'type',
						label: 'Status',
						meta: {
							prepareValue: { localMethod: this.setupLogStatusLabel }
						}
					}
				]
				/*operations: {
					actions: [
						{
							name: 'handleShowDetails',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: 'Details'
						},
						standardTableOperations.edit,
						standardTableOperations.delete
					]
				}*/
			};
		}
		// localModalSettings: () => ({ componentPath: 'Settings/Faults/ItemForm', single: true })
	},

	methods: {
		...mapActions({
			fetch_items: 'testing/fetch_logs',

			set_filters: 'testing/set_settings_filters'
		}),

		setupLogStatusLabel(type) {
			// const item = findItemBy('id', type, logTypesList);
			let result = `not </br> allowed`;
			// console.log(type)
			if (type === LOG_TYPES.PLANT /*|| type === null*/) {
				result = `<span class="log-type plant">Plant</span>`;
			} else if (type === LOG_TYPES.MASTER) {
				result = `<span class="log-type master">Master</span>`;
			}

			return result;
		}

		/*handleUpload() {
			const payload = {
				show: true,
				instanceName: this.instanceName,
				itemName: this.itemName,
				instanceData: null,
				componentPath: 'Settings/Import/ImportForm',
				single: true,
				saveButtonText: 'Start Import File',
				title: 'Import File'
			};
			
			this.show_edit_modal(payload);
		},*/

		/*handleShowInfo({row}) {
			// console.log(row)
			this.changeRoute({
				path: `/settings/import/${row.id}`
			});
		}*/
	}
};
</script>
