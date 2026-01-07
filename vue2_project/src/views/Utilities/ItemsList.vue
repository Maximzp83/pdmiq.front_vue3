<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<DropdownFilterbar
				:showCreateActions="
					$hasAccessTo(['create_dashboard']) && $hasAccessTo(['delete_dashboard'])
				"
				@event="handleEvent"
				:itemsName="itemsName"
			>
				<template v-slot:prefixFilters>
					<div class="filter-item ml-auto">
						<el-button
							v-show="showClearFilters"
							class="small"
							type="primary"
							native-type="button"
							@click="setFilters({}, clearableFiltersList)"
							v-text="$t('phrases.Clear_filters')"
						/>
					</div>
				</template>

				<div class="mrow filter-items-list relative">
					<div class="disable-filters-ovelay" v-show="!globalFilters.plantId">
						<div class="caption">{{ $t('phrases.select_plant_first') }}</div>
					</div>

					<div class="filter-item">
						<SimpleSpinner :active="locationsLoading" />

						<el-select
							filterable
							clearable
							:placeholder="`${tt('select')} ${tt('location')}`"
							@input="id => setFilters({ locationId: id })"
							:value="filters.locationId"
							:disabled="!locationsList.length"
						>
							<el-option
								v-for="item in locationsList"
								:key="'location-' + item.id"
								:label="item.name"
								:value="item.id"
							/>
						</el-select>
					</div>
				</div>
			</DropdownFilterbar>
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->

			<div class="view-content-card card content-row">
				<div :class="['card-content', { 'dragndrop-active': !draggingLocked }]">
					<Filterbar
						hideCreate
						hideDelete
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:perPageItems="perPageItems"
					>
						<template v-slot:last>
							<div class="filter-item mcol-xs-12 mcol-md-1 flex grid-buttons wider">
								<RadioButtonsBlock
									@onChange="toggleItemsGrid"
									:settings="gridSwitcherOptions"
									:optionsList="gridTypesList"
									:value="activeGrid"
								/>

								<span v-if="!disableDraggingFeature">
									<el-button
										:class="['drag_n_drop-locker', { active: !draggingLocked }]"
										native-type="button"
										@click="
											globalFilters.plantId
												? (draggingLocked = !draggingLocked)
												: null
										"
									>
										<i
											:class="[
												'icomoon',
												{ 'icon-lock2': draggingLocked },
												{ 'icon-unlock': !draggingLocked }
											]"
										></i>
									</el-button>
								</span>
							</div>
						</template>
					</Filterbar>

					<transition name="standard-fade" mode="out-in">
						<template v-if="activeGrid === ITEMS_GRID_TYPES.LIST">
							<CustomDataListTable
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
								cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4 drag-n-drop-item"
								itemsListClassName="drag-n-drop-list"
								ref="ItemsTableContainer"
								@event="handleEventNew"
								:itemsLoading="itemsLoading"
								:itemsList="itemsList"
								:itemsName="itemsName"
								:instanceName="instanceName"
								:operationsSettings="cardOperationsSettings"
							/>
						</template>
					</transition>

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
	requestsListMixin,
	eventHandler,
	navigation,
	switchGridViewMixin,
	dragNdropSortableMixin,
	dashboardListsReorderMixin
} from '@/mixins';

// import { findItemBy } from '@/helpers';
import { standardTableOperations } from '@/constants/table';
import { PRODUCTION_LINES_TYPES } from '@/constants/global';

export default {
	mixins: [
		itemsDataMixin(),
		requestsListMixin(),
		eventHandler(),
		navigation(),
		switchGridViewMixin(),
		dragNdropSortableMixin(),
		dashboardListsReorderMixin()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		DropdownFilterbar: () => import('@/components/common/DropdownFilterbar.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		ItemsGridContainer: () =>
			import('@/components/gridTable/ItemsGridContainer.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	data: () => ({
		locationsList: [],
		locationsLoading: false
	}),

	computed: {
		...mapState({
			filters: state => state.production_lines.filters
			// authUser: state => state.auth.authUser
		}),

		instanceName: () => 'Utilities',
		predefinedFilters: () =>
			Object.freeze({
				type: PRODUCTION_LINES_TYPES.UTILITY
			}),

		clearableFiltersList: () => Object.freeze(['locationId']),

		drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',
		reorderAction: () => 'reorder_production_line',

		/*reorderOptions: () => Object.freeze({
			submitActionName: 
		}),*/

		itemsName() {
			return {
				one: this.$t('Utility'),
				mult: this.$t('Utilities'),
				instanceName: 'production_lines'
			};
		},

		tableSettings() {
			let operations = {
				actions: []
			};

			if (this.$hasAccessTo(['edit_dashboard'])) {
				operations.actions.push({
					...standardTableOperations.edit,
					isDisabled: !this.globalFilters.plantId
				});
			}

			if (this.$hasAccessTo(['edit_dashboard'])) {
				operations.actions.push(standardTableOperations.delete);
			}

			operations.actions = this.$translate(operations.actions, {
				key: 'tooltip_text'
			});

			return Object.freeze({
				tableClass: 'drag-n-drop-wrapper',
				columns: this.$translate([
					{
						prop: 'name',
						label: 'Name',
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'plant.name',
						label: 'Plant',
						sortable: true
						/*meta: {
							getItemValue: { prop: 'name', listName: 'convertTypesList' }
						}*/
					},
					{
						prop: 'locations',
						label: 'Locations',
						meta: {
							fromArray: { subProp: 'name', delimeter: ', ', inline: true }
						}
					},
					{
						label: 'View',
						max_width: 130,
						meta: {
							additionalActions: [
								{
									name: 'handleShowNextInstanceItem',
									type: 'success',
									button_text: `${this.tt('View')} ${this.tt('Machines')}`,
									tooltip_text: this.tt(`phrases.Show_Binding_Machines`),
									path: '/dashboard/machines',
									nextInstanceName: 'Machines',
									setFilters: [
										{
											action: 'machines/set_machines_filters',
											params: ['productionLineId']
										}
									]
								}
							]
						}
					}
					// { prop: 'uuid', label: 'Site id', sortable: true }
					// { prop: 'phone_number', label: 'Phone', width: 135 }
				]),
				operations: operations
			});
		},

		cardOperationsSettings() {
			let settings = {
				titles: [{ prop: 'name' }],
				buttons: [
					{
						name: 'handleShowNextInstanceItem',
						type: 'primary inverted',
						icon: 'icomoon icon-machines',
						tooltip_text: this.tt('phrases.Show_Binding_Machines'),
						path: '/dashboard/machines',
						nextInstanceName: 'Machines',
						setFilters: [
							{
								action: 'machines/set_machines_filters',
								params: ['productionLineId']
							},
							{
								action: 'assets/set_assets_filters',
								params: ['productionLineId']
							},
							{
								action: 'equipments/set_equipments_filters',
								params: ['productionLineId']
							}
						]
					},
					{
						linkSettings: {
							linkRoute: 'production-lines/:id/details'
						},
						icon: 'icomoon icon-eye',
						tooltip_text: this.tt('phrases.view_line_details')
					}
				]
			};

			if (this.$hasAccessTo(['create_dashboard'])) {
				settings.buttons.push({
					name: 'editItem',
					icon: 'icomoon icon-pencil',
					type: 'primary inverted',
					tooltip_text: `${this.tt('Edit')} ${this.tt('Line')}`
				});
			}

			if (this.$hasAccessTo(['delete_dashboard'])) {
				settings.allowDelete = true;
			}

			return Object.freeze(settings);
		},

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_locations',
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'locationsList',
					localLoadProp: 'locationsLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_items: 'production_lines/fetch_production_lines',
			reorder_production_line: 'production_lines/reorder_production_line',
			fetch_locations: 'plants/fetch_locations',

			delete_item: 'production_lines/delete_production_line',
			set_filters: 'production_lines/set_production_lines_filters'
		})

		/*toggleFilterbar(e) {
			this.showFilterbar = !this.showFilterbar;

			dropDown(e, {
				target: 'filterbarDropdown',
				// recalculateHeight:true,
				timeout: 300
			});
		},*/
	},

	watch: {
		'globalFilters.plantId'(id) {
			if (!id) {
				this.preventFetch = true;
				this.locationsList = [];
				this.setFilters({ locationId: null });

				this.draggingLocked = true;
			}
		}
	},

	beforeMount() {
		if (!this.globalFilters.plantId) {
			this.preventFetch = true;
			this.setFilters({ locationId: null });
		}
	}
};
</script>
