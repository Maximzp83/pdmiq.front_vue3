<template>
	<div
		:class="[
			'view-wrapper view-list-wrapper brand-models-list',
			{ 'pt-0': fromEquipmentsLayout }
		]"
	>
		<div :class="[{ mcontainer: !fromEquipmentsLayout }]">
			<div
				:class="[
					{ card: !fromEquipmentsLayout },
					'content-row',
					{ 'view-content-card': !fromDetailsPage }
				]"
			>
				<div :class="[{ 'card-content': !fromEquipmentsLayout }]">
					<Filterbar
						v-if="!fromEquipmentsLayout"
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="isStoreRoomItems || !hasAccesToCreate"
						:hideDelete="isStoreRoomItems || !hasAccesToDelete"
					>
						<div class="filter-item mcol-xs-2 relative" v-if="!isStoreRoomItems">
							<FetchByQuerySelect
								clearable
								enableLoadmore
								@change="id => setFilters({ brandId: id })"
								:value="filters.brandId"
								:optionsLoading.sync="brandsLoading"
								:optionsList.sync="brandsList"
								:settings="brandQueryOptions"
								:placeholder="`${tt('Select')} ${tt('brand')}`"
							/>

							<!-- <CustomSelect
								filterable
								clearable
								:optionsLoading="brandsLoading"
								:optionsList="brandsList"
								:placeholder="`${tt('Select')} ${tt('brand')}`"
								:value="filters.brandId"
								@change="id => setFilters({ brandId: id })"
							/> -->
						</div>

						<template v-slot:middle v-if="storeroomItem">
							<div class="filter-item ml-auto">
								<CustomSelect
									filterable
									clearable
									:optionsList="storeRoomLocationsList"
									:placeholder="`${tt('all')} ${tt('storeroom')} ${tt('locations')}`"
									:value="filters.storeroomLocationId"
									@change="id => setFilters({ storeroomLocationId: id })"
								/>
							</div>
						</template>

						<template v-slot:last v-if="storeroomItem">
							<div :class="['filter-item grid-buttons mcol-sm-2 mcol-md-1']">
								<RadioButtonsBlock
									@onChange="toggleItemsGrid"
									:settings="gridSwitcherOptions"
									:optionsList="gridTypesList"
									:value="activeGrid"
								/>
							</div>
						</template>
					</Filterbar>

					<template v-if="activeGrid === ITEMS_GRID_TYPES.LIST">
						<CustomDataListTable
							:disableSelection="fromEquipmentsLayout || !hasAccesToDelete"
							ref="ItemsTableContainer"
							@event="handleEventNew"
							:itemsLoading="itemsLoading"
							:tableData="itemsList"
							:tableSettings="tableSettings"
							:itemsName="itemsName"
						/>
					</template>

					<template v-if="activeGrid === ITEMS_GRID_TYPES.GRID">
						<ItemsGridContainer
							cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4"
							:itemsLoading="itemsLoading"
							ref="ItemsTableContainer"
							@event="handleEventNew"
							:itemsList="itemsList"
							:itemsName="itemsName"
							:instanceName="instanceName"
							:operationsSettings="cardOperationsSettings"
							:fromDetailsPage="fromDetailsPage"
							:additionalProps="equipmentTypesListData"
						/>
					</template>

					<PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
						scrollTo=".brand-models-list"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { standardTableOperations } from '@/constants/table';
// import { findItemBy } from '@/helpers';

import {
	itemsDataMixin,
	eventHandler,
	navigation,
	requestsListMixin,
	switchGridViewMixin
} from '@/mixins';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		navigation(),
		requestsListMixin(),
		switchGridViewMixin()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		ItemsGridContainer: () =>
			import('@/components/gridTable/ItemsGridContainer.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	props: {
		fromEquipmentsLayout: Boolean,
		fromDetailsPage: Boolean,
		plantId: Number,
		isStoreRoomItems: Boolean,
		storeroomItem: Object
	},

	data: () => ({
		brandsList: [],
		brandsLoading: false,
		equipmentTypesLoading: false,
		equipmentTypesList: []
	}),

	computed: {
		...mapState({
			filters: state => state.brand_models.filters,
			storeroom_brand_models_filters: state =>
				state.brand_models.storeroom_brand_models_filters
		}),

		skipCalculatePerPage: that => !that.storeroomItem,

		brandQueryOptions() {
			return Object.freeze({
				fetchAction: 'brands/fetch_brands',
				params: { orderByColumn: 'name', orderByMethod: 'asc' }
				// params: { machineId: this.filters.machineId }
			});
		},

		// excludeGetParams: () => ['plantId'],
		// excludeGlobFilters: () => ['plantId'],

		activeGrid() {
			return this.fromEquipmentsLayout
				? this.storeroom_brand_models_filters.items_active_grid_type
				: this.filters.items_active_grid_type;
		},

		itemsName() {
			return {
				one: this.$t('Part_Number'),
				mult: this.$t('Part_Numbers'),
				instanceName: 'brand_models'
			};
		},

		instanceName: () => 'BrandModels',

		equipmentTypesListData() {
			if (this.equipmentTypesList.length) {
				return {
					equipmentTypesList: this.equipmentTypesList,
					plantId: this.plantId
				};
			}
			return { equipmentTypesList: [], plantId: this.plantId };
		},

		localModalSettings() {
			return {
				componentPath: 'BrandModels/ItemForm',
				single: true,
				callback: () => {
					this.refetchItemsList();
					this.show_edit_modal({ show: false });
				}
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_part_numbers']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_part_numbers']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_part_numbers']),

		tableSettings() {
			let settings = {
				columns: [
					{
						label: this.$t('Part_Number'),
						prop: 'name',
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}
				],
				operations: {
					actions: []
				}
			};

			if (this.fromEquipmentsLayout) {
				settings.columns.push({
					label: 'QTY',
					prop: 'equipments_storeroom_count',
					sortable: true
				});

				settings.operations.actions = [
					{
						name: 'handleShowInfo',
						type: 'success',
						icon: 'icomoon icon-eye',
						tooltip_text: this.$t('Details')
					}
				];
			} else {
				let actions = [];

				if (this.hasAccesToEdit) {
					actions.push(standardTableOperations.edit);
				}
				if (this.hasAccesToDelete) {
					actions.push(standardTableOperations.delete);
				}

				settings.operations.actions = this.$translate(actions, {
					key: 'tooltip_text'
				});
			}

			// if (this.brandsList.length) {
			settings.columns.push(
				{
					label: this.$t('Brand'),
					prop: 'brand.name',
					sortable: true,
					meta: {
						sortBy: 'brand_name'
						// getItemValue: { prop: 'name', list: this.brandsList }
					}
				},
				{
					prop: 'type.name',
					label: this.$t('Type'),
					sortable: true,
					meta: {
						sortBy: 'type_id'
					}
				}
			);
			// }

			return Object.freeze(settings);
		},

		cardOperationsSettings() {
			let settings = {
				titles: [{ prop: 'name' }],
				buttons: []
			};

			if (this.$hasAccessTo(['view_storerooms'])) {
				settings.buttons.push({
					disablePopover: true,
					className: 'locations-button uniq-button el-button el-button--primary',
					containerClassName: 'flex align-center',
					prefixContent: { html: 'QTY: ', className: 'semi-bold mr-10' },
					linkSettings: {
						linkTextProp: 'equipments_storeroom_count',
						emptyValueText: '0',
						linkRoute: `brand-models/:id/details?plantId=${this.plantId}`
					}
				});
			}

			return Object.freeze(settings);
		},

		requestsToDoList() {
			// console.log(this.itemData)
			let items = [
				{
					action: 'fetch_equipment_types',
					localProp: 'equipmentTypesList',
					localLoadProp: 'equipmentTypesLoading'
				}
			];

			if (!this.isStoreRoomItems) {
				items.push(
					{
						action: 'fetch_brands',
						payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
						initialSetup: this.filters.brandId
							? {
									fetchById: { action: 'brands/fetch_brand', itemId: this.filters.brandId }
							  }
							: null,
						bindTo: [
							{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true },
						],
						localProp: 'brandsList',
						localLoadProp: 'brandsLoading'
					},
				);
			}

			return Object.freeze(items);
		},

		storeRoomLocationsList() {
			if (this.storeroomItem) {
				return this.storeroomItem.locations || [];
			}

			return [];
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'brand_models/fetch_brand_models',
			delete_item: 'brand_models/delete_brand_model',
			set_filters: 'brand_models/set_brand_models_filters',
			fetch_brands: 'brands/fetch_brands',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			fetch_store_rooms: 'store_rooms/fetch_store_rooms'
		}),

		handleShowInfo({ row }) {
			this.changeRoute({
				path: `/brand-models/${row.id}/details?plantId=${this.plantId}`
			});
		},

		localBeforeMount() {
			// console.log('localBeforeMount', this.fromEquipmentsLayout, this.isStoreRoomItems)
			if (!this.fromEquipmentsLayout && !this.isStoreRoomItems) {
				this.preventFetch = true;
				// const { max, page, brandId } = this.filters;
				this.setFilters({
					items_active_grid_type: this.ITEMS_GRID_TYPES.LIST
				});
			}
		}
	}
};
</script>
