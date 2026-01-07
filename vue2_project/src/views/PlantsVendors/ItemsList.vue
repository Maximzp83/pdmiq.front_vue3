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
import { LANGUAGE_TYPES } from '@/localization/utils';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.plants_vendors.filters,
			authUser: state => state.auth.authUser,
			plantsList: state => state.global.globalPlantsList
		}),

		hasAccesToCreate: that => that.$hasAccessTo(['create_vendors']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_vendors']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_vendors']),

		itemsName() {
			const prefix =
				this.$Lang.currentLangId == LANGUAGE_TYPES.ENGLISH ? 'Plants' : '';
			return {
				one: `${prefix} ${this.$t('Vendor')}`,
				mult: `${prefix} ${this.$t('Vendors')}`,
				instanceName: 'plants_vendors'
			};
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
						sortable: true,
						min_width: 130
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'plant_id',
						label: 'Plant',
						min_width: 130,
						meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}
					},
					{
						prop: 'contact_name',
						label: 'Contact_name',
						sortable: true,
						min_width: 110
					},
					{ prop: 'email', label: 'Email', sortable: true, min_width: 150 },
					{ prop: 'phone_number', label: 'Phone', width: 135 }
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'plants_vendors/fetch_plants_vendors',
			delete_item: 'plants_vendors/delete_plants_vendor',
			set_filters: 'plants_vendors/set_plants_vendors_filters'
		})
	}
};
</script>
