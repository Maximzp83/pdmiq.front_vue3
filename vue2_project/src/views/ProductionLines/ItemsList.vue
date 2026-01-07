<template>
	<div
		:class="[
			'view-wrapper view-list-wrapper',
			isUtility ? 'utilities-list' : 'production_lines-list'
		]"
	>
		<!-- <div :class="[{'mcontainer': !fromDetailsPage}]"> -->
		<!-- :showCreateActions="$hasAccessTo(['create_dashboard'])" -->
		<!-- <DropdownFilterbar
				v-if="!hideDropdownFilterbar"
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
							v-text="'Clear filters'"
						/>
					</div>
				</template>

				<div class="mrow filter-items-list relative">
					<div class="disable-filters-ovelay" v-show="!globalFilters.plantId">
						<div class="caption">Select plant first</div>
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
			</DropdownFilterbar> -->
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
					:class="['ml-auto toggle-list-button', { active: !filters.isShowList }]"
					v-if="showToggleListButton"
				>
					<span v-text="!filters.isShowList ? tt('Show') : tt('Hide')"></span>
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
						<div class="filter-item flex grid-buttons wider">
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

				<DropdownFilterbar
					ref="DropdownFilterbar"
					v-if="!hideDropdownFilterbar"
					hideToggleButton
					@event="handleEvent"
					:itemsName="itemsName"
					:filterbarDropdownId="
						`${isUtility ? 'utility' : 'prodLine'}DropdownFilterbar`
					"
				>
					<!-- <template v-slot:prefixFilters>
							<div class="filter-item ml-auto">
								<el-button
									v-show="showClearFilters"
									class="small"
									type="primary"
									native-type="button"
									@click="setFilters({}, clearableFiltersList)"
									v-text="'Clear filters'"
								/>
							</div>
						</template> -->

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
								:placeholder="tt('Location')"
								:value="filters.locationId"
								@change="id => setFilters({ locationId: id })"
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
				</transition>

				<transition name="standard-fade" mode="out-in">
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
							:additionalProps="additionalProps"
						/>
					</template>
				</transition>

				<PaginationContainer
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					:scrollTo="isUtility ? '.utilities-list' : '.production_lines-list'"
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
	fetchItemsHelper,
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
		fetchItemsHelper(),
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

	props: {
		plantId: Number,
		showCardHeader: Boolean,
		disableDraggingFeature: Boolean,
		hideDropdownFilterbar: Boolean,
		productionLineType: Number,
		showToggleListButton: Boolean,
		fromDetailsPage: Boolean
		// fromDashboard: Boolean,
	},

	data: () => ({
		locationsList: [],
		locationsLoading: false,

		initiateRequestsToDoList: false,

		showFilterbar: false
	}),

	computed: {
		...mapState({
			// filters: state => state.production_lines.filters
			// authUser: state => state.auth.authUser
		}),

		PRODUCTION_LINES_TYPES: () => Object.freeze(PRODUCTION_LINES_TYPES),

		isUtility: that => that.productionLineType == PRODUCTION_LINES_TYPES.UTILITY,
		isProdLine: that =>
			that.productionLineType == PRODUCTION_LINES_TYPES.PRODUCTION_LINE,

		additionalProps: that => ({
			isUtility: that.isUtility,
			isProdLine: that.isProdLine
		}),

		filters() {
			const type = this.isUtility ? 'utility_filters' : 'filters';
			return this.$store.state.production_lines[type];
		},

		instanceName: () => 'ProductionLines',
		predefinedFilters: that =>
			Object.freeze({
				type: that.productionLineType || PRODUCTION_LINES_TYPES.PRODUCTION_LINE
			}),

		localModalSettings: that =>
			Object.freeze({
				instanceName: that.isProdLine ? 'ProductionLines' : 'Utilities',
				callback: () => {
					that.refetchItemsList();
					// this.show_edit_modal({ show: false });
				}
			}),

		clearableFiltersList: () => Object.freeze(['locationId', 'q']),

		drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',
		reorderAction: () => 'reorder_production_line',

		/*reorderOptions: () => Object.freeze({
			submitActionName: 
		}),*/

		itemsName() {
			if (this.productionLineType === PRODUCTION_LINES_TYPES.UTILITY) {
				return Object.freeze({
					one: this.$t('Utility'),
					mult: this.$t('Utilities'),
					instanceName: 'production_lines'
				});
			} else {
				return Object.freeze({
					one: this.$t('Production_line'),
					mult: this.$t('Production_lines'),
					instanceName: 'production_lines'
				});
			}
		},

		tableSettings() {
			let operations = {
				actions: []
			};

			if (this.fromDetailsPage && this.$hasAccessTo(['create_maintenance'])) {
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

			if (this.$hasAccessTo(['create_dashboard'])) {
				operations.actions.push(
					{
						...standardTableOperations.edit,
						isDisabled: !this.plantId && !this.globalFilters.plantId
					},
					standardTableOperations.delete
				);
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
						sortable: true,
						meta: {
							action: {
								linkSettings: {
									linkRoute: 'production-lines/:id/details',
									linkTextProp: 'name'
								},
								className: 'table-link',
								disablePopover: true
							}
						}
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
									button_text: this.$t('phrases.view_machines'),
									tooltip_text: this.$t('phrases.show_binding_machines'),
									path: '/dashboard/machines',
									nextInstanceName: 'Machines',
									className: 'width-auto',
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
						icon: 'icomoon icon-assets',
						tooltip_text: this.$t('phrases.show_binding_machines'),
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
					}
					/*{
						linkSettings: {
							linkRoute: 'production-lines/:id/details',
						},
						icon: 'icomoon icon-eye',
						tooltip_text: 'View Line Details',
					}*/
				]
			};

			if (this.$hasAccessTo(['create_maintenance'])) {
				settings.buttons.unshift({
					name: 'handleCreateWorkOrderButton',
					formSetup: [{ formKey: 'production_line_id', valKey: 'id' }],
					tooltip_text: this.$t('phrases.create_work_order'),
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
					tooltip_text: this.$t('phrases.edit_line')
				});
			}

			settings.allowDelete = this.$hasAccessTo(['delete_dashboard']);

			return Object.freeze(settings);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'production_lines/fetch_production_lines',
			reorder_production_line: 'production_lines/reorder_production_line',
			fetch_locations: 'plants/fetch_locations',

			delete_item: 'production_lines/delete_production_line'
			// set_filters: 'production_lines/set_production_lines_filters'
		}),

		set_filters(payload) {
			const type = this.isUtility
				? 'set_utilities_filters'
				: 'set_production_lines_filters';

			this.$store.dispatch(`production_lines/${type}`, payload);
		},

		toggleFilterbar(e) {
			this.$refs.DropdownFilterbar.toggleFilterbar(e);
			this.initiateRequestsToDoList = true;
			this.showFilterbar = !this.showFilterbar;
		},

		fetchLocations() {
			this.doFetchAction('fetch_locations', 'locationsList', 'locationsLoading', {
				params: { plantId: this.plantId || this.globalFilters.plantId, max: -1 }
			});
		}
	},

	watch: {
		'globalFilters.plantId'(id) {
			if (!id) {
				this.preventFetch = true;
				this.locationsList = [];
				this.setFilters({ locationId: null });

				this.draggingLocked = true;
			}
		},

		'initiateRequestsToDoList'(init) {
			if (!this.hideDropdownFilterbar && init) {
				this.fetchLocations();
			}
		}
	},

	beforeMount() {
		if (this.filters.isShowList && !this.filters.isShowListRefreshed2) {
			this.setFilters({ isShowList: false });
		}

		this.preventFetch = true;
		this.setFilters({ isShowListRefreshed2: true });

		if (!this.globalFilters.plantId) {
			this.preventFetch = true;
			this.setFilters({ locationId: null });
		}
	}
};
</script>
