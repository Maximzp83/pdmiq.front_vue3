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
					>
						<!-- <template v-slot:middle>
							<div class="filter-item ml-auto">
								<CustomSelect
									clearable
									:optionsLoading="equipmentTypesLoading"
									:optionsList="equipmentTypesList"
									:placeholder="`${tt('Select')} ${tt('type')}`"
									:value="filters.equipmentTypeId"
									@change="id => setFilters({ equipmentTypeId: id })"
								/>
							</div>
						</template> -->
					</Filterbar>

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
import {
	itemsDataMixin,
	eventHandler,
	navigation,
	// requestsListMixin
} from '@/mixins';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), /*requestsListMixin()*/],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	/*data: () => ({
		equipmentTypesLoading: false,
		equipmentTypesList: []
	}),*/

	computed: {
		...mapState({
			filters: state => state.brands.filters
		}),

		itemsName() {
			return {
				one: this.$t('Equipment_Brand'),
				mult: this.$t('Equipment_Brands'),
				instanceName: 'brands'
			};
		},

		excludeGetParams: () => ['plantId'],
		excludeGlobFilters: () => ['plantId'],

		predefinedFilters: () => ({
			equipmentTypeId: null
		}),

		/*requestsToDoList: that => [
			{
				action: 'fetch_equipment_types',
				payload: { params: { max: -1, plantId: that.globalFilters.plantId } },
				localProp: 'equipmentTypesList',
				localLoadProp: 'equipmentTypesLoading'
			}
		],*/

		hasAccesToCreate: that => that.$hasAccessTo(['create_brands']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_brands']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_brands']),

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
						prop: 'equipments_count',
						label: this.$t('phrases.Equipments_count')
					},
					{
						prop: 'models_count',
						label: this.$t('phrases.Models_count')
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
			fetch_items: 'brands/fetch_brands',
			// fetch_equipment_types: 'equipment_types/fetch_equipment_types',

			delete_item: 'brands/delete_brand',
			set_filters: 'brands/set_brands_filters'
		})
	}

	/*beforeMount() {
		this.fetchItems(this.filters);
	},

	beforeDestroy() {
		this.set_items([]);
	}*/
};
</script>
