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
						:actionButtons="actionButtons"
						searchbarClass="ml-auto"
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
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.plant_work_stations.filters,
			plantsList: state => state.global.globalPlantsList
		}),

		editInModal: () => true,
		instanceName: () => 'WorkStations',

		localModalSettings: that =>
			Object.freeze({
				/*settings: {
				maintenanceType: MAINTENANCE_TYPES.LOG
			},*/
				callback: () => {
					that.fetchItems({ ...that.filters, ...that.globalFilters });
					that.show_edit_modal({ show: false });
				}
			}),

		itemsName() {
			return {
				one: this.$t('Work_Station'),
				mult: this.$t('Work_Stations'),
				instanceName: 'plant_work_stations'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_companies']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_companies']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_companies']),

		actionButtons() {
			// const { authUser } = this;
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push({
					id: 1,
					text: 'Add',
					event: 'createItem'
					// args: { path: '/new' }
				});
			}
			if (this.hasAccesToDelete) {
				actions.push({
					id: 2,
					text: 'Delete',
					isDelete: true,
					event: 'handleDeleteItems'
				});
			}

			return Object.freeze(this.$translate(actions, { key: 'text' }));
		},

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
						prop: 'name',
						label: 'Name',
						min_width: 120,
						sortable: true

						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'plant_id',
						label: 'Plant',
						min_width: 120,
						meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}
					}
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'plant_work_stations/fetch_work_stations',
			delete_item: 'plant_work_stations/delete_work_station',
			set_filters: 'plant_work_stations/set_work_stations_filters'
		})
	}
};
</script>
