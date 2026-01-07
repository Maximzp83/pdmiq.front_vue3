<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
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
			filters: state => state.teams.filters
			// authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Team'),
				mult: this.$t('Teams'),
				instanceName: 'teams'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_users_teams']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_users_teams']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_users_teams']),

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return {
				columns: [
					{ prop: 'name', label: this.tt('Name'), sortable: true }
					// { prop: 'address', label: 'Address', sortable: true },
					/*{
						prop: 'company.name',
						label: 'Company',
						sortable: true,
						min_width: 130,
						meta: { sortBy: 'company' }
					}*/
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			};
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'teams/fetch_teams',
			delete_item: 'teams/delete_team',
			set_filters: 'teams/set_teams_filters'
		})
	}
};
</script>
