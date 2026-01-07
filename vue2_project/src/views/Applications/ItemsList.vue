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

			<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
import { standardTableOperations } from '@/constants/table';
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
			filters: state => state.applications.filters,
			plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('Application'),
				mult: this.$t('Applications'),
				instanceName: 'applications'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_applications']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_applications']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_applications']),

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
						prop: 'name',
						label: this.$t('Name'),
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'plant_id',
						label: this.$t('Plant'),
						meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}
					}
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'applications/fetch_applications',
			delete_item: 'applications/delete_application',
			set_filters: 'applications/set_applications_filters'
		})
	}
};
</script>
