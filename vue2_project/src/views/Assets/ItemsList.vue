<template>
	<div class="view-wrapper view-list-wrapper assets-list">
		<!-- <div class="mcontainer"> -->
		<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->

		<div :class="['card content-row', { 'view-content-card': !fromDetailsPage }]">
			<div
				v-if="showCardHeader"
				class="flex align-center card-header filled_2 relative"
			>
				<h1 class="title page-title outside-bg-addition uppercase">
					{{ itemsName.mult }}
				</h1>
				<div
					v-if="showToggleListButton"
					:class="['ml-auto toggle-list-button', { active: !filters.isShowList }]"
				>
					<span v-text="!filters.isShowList ? $t('Show') : $t('Hide')"></span>
					<i class="icomoon icon-path_2"></i>

					<div
						class="absolute stretch pointer"
						@click="setFilters({ isShowList: !filters.isShowList })"
					></div>
				</div>
			</div>

			<div
				:class="['card-content', { 'dragndrop-active': !draggingLocked }]"
				v-if="showToggleListButton ? filters.isShowList : true"
			>
				<Filterbar
					:hideCreate="!$hasAccessTo(['create_dashboard'])"
					:hideDelete="!$hasAccessTo(['delete_dashboard'])"
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:perPageItems="perPageItems"
				>
					<template v-slot:last>
						<div
							:class="[
								'filter-item grid-buttons flex',
								{ wider: !disableDraggingFeature }
							]"
						>
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
										globalFilters.plantId ? (draggingLocked = !draggingLocked) : null
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

						<div
							class="filter-item toggle-additional-filters"
							v-if="!hideDropdownFilterbar"
						>
							<el-button
								type="primary"
								native-type="button"
								:class="['action-button inverted', { active: showFilterbar }]"
								:icon="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"
								@click="e => toggleFilterbar(e)"
							/>

							<!-- <span
									v-show="activeFiltersCount"
									class="round-counter wo-filters-count"
								>{{activeFiltersCount}}</span> -->
						</div>
					</template>
				</Filterbar>

				<!-- <div class="warnings-container flex" v-if="showCardHeader">
						<div class="warning-item">
							Warning <span class="warning-color">(12)</span>
						</div>
						<div class="warning-item">
							Alarm <span class="alarm-color">(8)</span>
						</div>
					</div> -->

				<DropdownFilterbar
					ref="DropdownFilterbar"
					v-if="!hideDropdownFilterbar"
					hideToggleButton
					@event="handleEvent"
					:itemsName="itemsName"
					filterbarDropdownId="assetsDropdownFilterbar"
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
							<CustomSelect
								filterable
								clearable
								:optionsLoading="locationsLoading"
								:optionsList="locationsList"
								:placeholder="$t('Location')"
								@change="id => setFilters({ locationId: id })"
								:value="filters.locationId"
							/>
						</div>

						<div class="filter-item">
							<CustomSelect
								filterable
								clearable
								:optionsLoading="productionLinesLoading"
								:optionsList="productionLinesList"
								:placeholder="$t('Production_Line')"
								@change="id => setFilters({ productionLineId: id }, ['machineId'])"
								:value="filters.productionLineId"
							/>
						</div>
						<div class="filter-item">
							<CustomSelect
								filterable
								clearable
								:optionsLoading="machinesLoading"
								:optionsList="machinesList"
								:placeholder="$t('Machine')"
								@change="id => setFilters({ machineId: id })"
								:value="filters.machineId"
							/>
						</div>
					</div>
				</DropdownFilterbar>

				<VueElementLoadingWrapper
					class="section-block items-preloader"
					spinner="line-scale"
					:isLoading="itemsLoading"
					:itemsName="itemsName.mult"
				/>

				<transition name="standard-fade" mode="out-in">
					<template v-if="activeGrid === ITEMS_GRID_TYPES.LIST">
						<CustomDataListTable
							v-show="!itemsLoading"
							ref="ItemsTableContainer"
							@event="handleEventNew"
							:tableData="itemsList"
							:tableSettings="tableSettings"
							:itemsName="itemsName"
						/>
					</template>

					<template v-if="activeGrid === ITEMS_GRID_TYPES.GRID">
						<ItemsGridContainer
							v-show="!itemsLoading"
							cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4 drag-n-drop-item"
							itemsListClassName="drag-n-drop-list"
							ref="ItemsTableContainer"
							@event="handleEventNew"
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
					scrollTo=".assets-list"
				/>
			</div>
		</div>

		<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
		<!-- </div> -->
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
import { standardTableOperations } from '@/constants/table';

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
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		// ItemsTableContainer: () => import('@/components/ItemsTableContainer.vue'),
		ItemsGridContainer: () =>
			import('@/components/gridTable/ItemsGridContainer.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	props: {
		hideDropdownFilterbar: Boolean,
		disableDraggingFeature: Boolean,
		showCardHeader: Boolean,
		fromDetailsPage: Boolean,
		plantId: Number,
		fromDashboard: Boolean,
		showToggleListButton: Boolean
	},

	data: () => ({
		// isInitialSetup: true,
		showFilterbar: false,
		initiateRequestsToDoList: false,

		locationsList: [],
		locationsLoading: false,

		productionLinesList: [],
		productionLinesLoading: false,

		machinesList: [],
		machinesLoading: false

		// filteredLocationsList: []
	}),

	computed: {
		...mapState({
			filters: state => state.assets.filters
			// nextActiveItemsTable: state => state.global.nextActiveItemsTable
			// updateCounters: state => state.global.updateCounters
		}),

		drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',
		reorderAction: () => 'reorder_asset',

		bindedFilters: () => ['productionLineId', 'machineId'],
		clearableFiltersList: () =>
			Object.freeze(['productionLineId', 'machineId', 'locationId', 'q']),

		itemsName() {
			return {
				one: this.$t('Asset'),
				mult: this.$t('Assets'),
				instanceName: 'assets'
			};
		},

		instanceName: () => 'Assets',

		localModalSettings() {
			return Object.freeze({
				callback: () => {
					this.refetchItemsList();
					// this.show_edit_modal({ show: false });
				}
			});
		},

		tableSettings() {
			let operations = {
				actions: [
					{
						name: 'handleShowNextInstanceItem',
						type: 'success',
						icon: 'icomoon icon-assets',
						tooltip_text: 'phrases.show_binding_items',
						path: '/dashboard/equipments',
						nextInstanceName: 'Equipments',
						setFilters: [
							{
								action: 'equipments/set_equipments_filters',
								params: ['assetId']
							}
						]
					}
				]
			};

			if (this.$hasAccessTo(['create_maintenance'])) {
				operations.actions.unshift({
					name: 'handleCreateWorkOrderButton',
					formSetup: [
						{ formKey: 'production_line_id', valKey: 'machine.production_line_id' },
						{ formKey: 'machine_id', valKey: 'machine_id' },
						{ formKey: 'asset_id', valKey: 'id' }
					],
					type: 'success',
					tooltip_text: 'phrases.create_work_order',
					button_text: '+WO'
				});
			}

			if (this.$hasAccessTo(['edit_dashboard'])) {
				operations.actions.push({
					...standardTableOperations.edit,
					isDisabled: !this.plantId && !this.globalFilters.plantId
				});
			}

			if (this.$hasAccessTo(['delete_dashboard'])) {
				operations.actions.push(standardTableOperations.delete);
			}

			operations.actions = this.$translate(operations.actions, {
				key: 'tooltip_text'
			});

			return Object.freeze({
				columns: [
					{
						prop: 'name',
						label: this.$t('Name'),
						sortable: true,
						meta: {
							action: {
								linkSettings: {
									linkRoute: 'assets/:id/details',
									linkTextProp: 'name'
								},
								className: 'table-link',
								disablePopover: true
							}
						}
					},
					{ prop: 'machine.productionLine.name', label: 'Production Line' },
					{
						prop: 'machine.name',
						label: this.$t('Machine'),
						sortable: true,
						meta: { sortBy: 'machine_id' }
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{ prop: 'location.name', label: this.$t('Location') }
				],
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
						icon: 'icomoon icon-assets',
						tooltip_text: this.$t('phrases.show_binding_items'),
						path: '/dashboard/equipments',
						nextInstanceName: 'Equipments',
						setFilters: [
							{
								action: 'equipments/set_equipments_filters',
								params: ['assetId']
							}
						]
					}
					/*{
						linkSettings: {
							linkRoute: 'assets/:id/details',
						},
						icon: 'icomoon icon-eye',
						tooltip_text: 'View Asset Details',						
					}*/
				]
			};

			if (this.$hasAccessTo(['create_maintenance'])) {
				settings.buttons.unshift({
					name: 'handleCreateWorkOrderButton',
					formSetup: [
						{ formKey: 'production_line_id', valKey: 'machine.production_line_id' },
						{ formKey: 'machine_id', valKey: 'machine_id' },
						{ formKey: 'asset_id', valKey: 'id' }
					],
					tooltip_text: this.$t('phrases.Create_Work_Order'),
					className: 'create-wo-button',
					type: 'primary inverted',
					buttonContent: {
						component: {
							componentPath: 'components/itemDetails/CreateWOButton'
						}
					}
				});
			}

			if (this.$hasAccessTo(['edit_dashboard'])) {
				settings.buttons.push({
					name: 'editItem',
					icon: 'icomoon icon-pencil',
					type: 'primary inverted',
					tooltip_text: `${this.$t('Edit')} ${this.$t('Asset')}`
				});
			}

			settings.allowDelete = this.$hasAccessTo(['delete_dashboard']);

			return Object.freeze(settings);
		},

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_locations',
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'locationsList',
					localLoadProp: 'locationsLoading'
				},
				{
					action: 'fetch_production_lines',
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_machines',
					bindTo: [
						{ prop: 'filters.productionLineId', param: 'productionLineId' },
						{ prop: 'globalFilters.plantId', param: 'plantId' }
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_items: 'assets/fetch_assets',
			fetch_locations: 'plants/fetch_locations',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_machines: 'machines/fetch_machines',
			delete_item: 'assets/delete_asset',
			set_filters: 'assets/set_assets_filters',
			reorder_asset: 'assets/reorder_asset'
			// set_global_state: 'set_global_state'
		}),

		toggleFilterbar(e) {
			this.$refs.DropdownFilterbar.toggleFilterbar(e);
			this.initiateRequestsToDoList = true;
			this.showFilterbar = !this.showFilterbar;
		},

		handleShowDetails({ row, options }) {
			this.changeRoute({
				path: `/assets/${row.id}/details${options.page_path}`
			});
		}

		/*localBeforeMount() {
			if (!this.globalFilters.plantId) {
				this.preventFetch = true;
				this.setFilters({ locationId: null }, this.bindedFilters);
			}
		},*/

		/*localGlobalFiltersWatch(globalFilters, old_filters) {
			if (globalFilters.plantId !== old_filters.plantId) {
				this.locationsList = [];
				this.productionLinesList = [];
				this.machinesList = [];
				this.cleanRouteQuery();
				this.preventFetch = true;
				this.setFilters({ locationId: null }, this.bindedFilters);
			}
		},*/

		/*resetNearbyFilters() {
			this.preventFetch = true;
			this.setFiltersViaList({
				filters: [
					{
						action: 'equipments/set_equipments_filters',
						param: 'machineId',
						state: 'equipments'
					},
					{
						action: 'equipments/set_equipments_filters',
						param: 'productionLineId',
						state: 'equipments'
					},
					{
						action: 'machines/set_machines_filters',
						state: 'machines',
						param: 'productionLineId'
					}
				],
				value: null
			});
			this.setFilters({}, this.bindedFilters);
		}*/
	},

	watch: {
		'globalFilters.plantId'(id) {
			if (!id) {
				this.draggingLocked = true;
			}
		}

		/*'filters.productionLineId'(id) {
			if (!id) this.resetNearbyFilters();
		},*/
		/*'filters.machineId'(id) {
			if (!id) {
				this.preventFetch = true;
				this.setFiltersViaList({
					filters: [
						{
							action: 'equipments/set_equipments_filters',
							param: 'machineId',
							state: 'equipments'
						}
					],
					value: null
				});
				this.setFilters({}, this.bindedFilters);
			}
		}*/
	},

	beforeMount() {
		if (this.filters.isShowList && !this.filters.isShowListRefreshed2) {
			this.setFilters({ isShowList: false });
		}

		this.preventFetch = true;
		this.setFilters({ isShowListRefreshed2: true });
	}
};
</script>
