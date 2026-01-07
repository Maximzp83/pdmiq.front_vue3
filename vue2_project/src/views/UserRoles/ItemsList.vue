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
					/>

					<CustomDataListTable
						ref="ItemsTableContainer"
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

			<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { standardTableOperations } from '@/constants/table';
import { userRolesTypesList } from '@/constants/global';

import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
// console.log(itemsDataMixin())
export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.user_roles.filters,
			plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('sidebar_menu.user_role'),
				mult: this.$t('sidebar_menu.user_roles'),
				instanceName: 'user_roles'
			};
		},

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						label: 'Name',
						prop: 'name',
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						label: 'type',
						prop: 'type',
						sortable: true,
						meta: {
							getItemValue: { prop: 'name', list: userRolesTypesList() }
						}
					}
				]),
				operations: {
					actions: this.$translate(
						[standardTableOperations.edit, standardTableOperations.delete],
						{ key: 'tooltip_text' }
					)
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'user_roles/fetch_user_roles',
			delete_item: 'user_roles/delete_user_role',
			set_filters: 'user_roles/set_user_roles_filters'
		})
	}
};
</script>
