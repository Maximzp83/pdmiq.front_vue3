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
			filters: state => state.distributors.filters
		}),

		itemsName() {
			return {
				one: this.$t('Distributor'),
				mult: this.$t('Distributors'),
				instanceName: 'distributors'
			};
		},

		tableSettings() {
			return Object.freeze({
				columns: [
					{
						prop: 'company_name',
						label: this.$t('Name'),
						sortable: true,
						min_width: 100
					},
					{
						prop: 'scope',
						label: this.$t('Type'),
						min_width: 110,
						meta: {
							getItemValue: { prop: 'label', listName: 'scopesList' }
						}
					},
					{
						prop: 'locations',
						label: `${this.$t('locations')}  (${this.$t('Cities')})`,
						min_width: 110,
						meta: {
							fromArray: { subProp: 'city', delimeter: ', ', inline: true }
						}
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}
				],
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
			fetch_items: 'distributors/fetch_distributors',
			delete_item: 'distributors/delete_distributor',
			set_filters: 'distributors/set_distributors_filters'
		})
	}
};
</script>
