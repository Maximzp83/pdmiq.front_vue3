<template>
	<div class="view-wrapper view-list-wrapper">
		<!--  /> -->
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
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

			<!-- <div class="pagination content-row card" v-if="!companiesLoading">
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
			filters: state => state.companies.filters,
			authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Company'),
				mult: this.$t('Companies'),
				instanceName: 'companies'
			};
		},
		instanceName: () => 'Companies',

		hasAccesToCreate: that => that.$hasAccessTo(['create_companies']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_companies']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_companies']),

		tableSettings() {
			let actions = [
				{
					name: 'handleShowInfo',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: 'Info'
				}
			];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			let settings = {
				columns: [
					{
						prop: 'name',
						label: this.$t('Name'),
						sortable: true,
						min_width: 130
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'address',
						label: this.$t('Address'),
						sortable: true,
						min_width: 150
					},
					{ prop: 'phone_number', label: this.$t('Phone'), width: 135 }
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			};

			return settings;
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'companies/fetch_companies',
			delete_item: 'companies/delete_company',

			set_filters: 'companies/set_companies_filters'
		}),

		handleShowInfo({ row }) {
			this.changeRoute({ path: `/${row.id}/info`, addToCurrent: true });
			// console.log(rowData)
		}
	}

	/*beforeMount() {
		this.fetchItems(this.filters);
	},

	beforeDestroy() {
		this.set_items([]);
	}*/
};
</script>
