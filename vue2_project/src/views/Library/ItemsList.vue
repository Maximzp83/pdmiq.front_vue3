<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						hideCreate
						hideDelete
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						searchbarClass="ml-auto"
					/>

					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						disableSelection
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
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
// import { standardTableOperations } from '@/constants/table';
import { findItemBy } from '@/helpers';
import { libraryResourceTypesList } from '@/constants/global';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.library.filters
		}),

		libraryResourceTypesList: () => libraryResourceTypesList(),

		itemsName() {
			return {
				one: this.$t('sidebar_menu.library'),
				mult: this.$t('libraries'),
				instanceName: 'library'
			};
		},

		resouseTypesList: () =>
			Object.freeze({
				1: { name: 'Production Line' }
			}),

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'name',
						label: 'Name',
						sortable: true,
						width: 250
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						label: 'File',
						prop: 'name',
						width: 100,
						meta: {
							action: {
								linkSettings: {
									linkHrefProp: 'full_file_name',
									linkTextValue: 'Link',
									target: '_blank'
								},
								className: 'table-link info-color',
								disablePopover: true
							}
						}
					},
					{
						label: 'Equipment',
						prop: 'name',
						meta: {
							prepareValue: {
								localMethod: this.setupEquipmentColumn,
								useAllInstanceData: 1
							}
						}
					},
					{
						label: 'phrases.Equipment_Name',
						prop: 'resource_name',
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}
				])
				/*operations: {
					actions: [
						// standardTableOperations.edit,
						standardTableOperations.delete
					]
				}*/
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'library/fetch_libraries',
			set_filters: 'library/set_libraries_filters'
		}),

		setupEquipmentColumn({ resource_type, production_line_type }) {
			const item = findItemBy('id', resource_type, this.libraryResourceTypesList);

			if (item) {
				if (production_line_type) {
					return production_line_type == 1 ? item.name : 'Utility';
				}

				return item.name;
			}
		}
	}
};
</script>
