<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideCreate
						hideDelete
						hideSearchbar
					/>

					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						disableSelection
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

			<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { cleanDateString } from '@/helpers';

import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
// import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.testing.filters
			// plantsList: state => state.global.globalPlantsList
		}),

		predefinedFilters: () =>
			Object.freeze({
				type: 1,
				orderByColumn: 'date_end',
				orderByMethod: 'desc'
			}),

		itemsName() {
			return {
				one: this.$t('Import_Log'),
				mult: this.$t('Import_Logs'),
				instanceName: 'testing'
			};
		},

		tableSettings() {
			return Object.freeze({
				columns: [
					{
						label: 'Created at',
						prop: 'date_end',
						// width: 105,
						// sortable: true,
						meta: {
							prepareValue: {
								localMethod: cleanDateString
								//args: [{ withoutTime: true }]
							}
						}
					},
					{
						label: 'Company',
						prop: 'company_name'
					},
					{
						label: 'Plant',
						prop: 'plant_name'
					},
					{
						label: 'File',
						prop: 'import_file_name'
					},
					{
						label: 'Success',
						prop: 'count_success',
						width: 80,
						meta: {
							prepareValue: {
								localMethod: this.setupSuccessCounterColumn
							}
						}
					},
					{
						label: 'Error',
						prop: 'count_error',
						width: 80,
						meta: {
							/*prepareValue: {
								localMethod: this.setupErrorCounterColumn,
							},*/
							action: {
								linkSettings: {
									linkRoute: 'plant-import-logs/:id',
									linkTextProp: 'count_error'
								},
								className: 'table-link alarm-color',
								disablePopover: true
							}
						}
					}
				]
				/*operations: {
					actions: [
						{
							name: 'editItem',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: this.tt('Edit')
						},
					]
				}*/
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'testing/fetch_logs',
			set_filters: 'testing/set_settings_filters'
		}),

		setupSuccessCounterColumn(val) {
			// console.log(val)
			return `<span class="success-color">${val}</span>`;
		},
		setupErrorCounterColumn(val) {
			// console.log(val)
			return `<span class="alarm-color">${val}</span>`;
		}

		/*handleShowInfo({ row }) {
			this.changeRoute({ path: `/brand-models/${row.id}/details?plantId=${this.plantId}` });
		},*/
	}
};
</script>
