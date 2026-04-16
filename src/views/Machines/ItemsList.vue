<template>
	<div class="view-wrapper view-list-wrapper machines-list">
		<div class="" v-if="itemsLoading">Loading...</div>
		<div class="" v-else>
			<div class="machines-list-container">
				<div class="machines-list-item" v-for="item in itemsList" :key="item.id">
					{{ item.name }}
				</div>
			</div>
		</div>
		<!-- <div :class="['card content-row', { 'view-content-card': !fromDetailsPage }]">
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
						</div>
					</template>
				</Filterbar>

				<DropdownFilterbar
					ref="DropdownFilterbar"
					v-if="!hideDropdownFilterbar"
					hideToggleButton
					@event="handleEvent"
					:itemsName="itemsName"
					filterbarDropdownId="machinesDropdownFilterbar"
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
								:value="filters.locationId"
								@change="id => setFilters({ locationId: id })"
							/>
						</div>

						<div class="filter-item">
							<CustomSelect
								filterable
								clearable
								:optionsLoading="productionLinesLoading"
								:optionsList="productionLinesList"
								:placeholder="$t('Production_line')"
								:value="filters.productionLineId"
								@change="id => setFilters({ productionLineId: id })"
							/>
						</div>

						<div class="filter-item">
							<CustomSelect
								className="capitalize"
								clearable
								@change="id => setFilters({ applicationId: id })"
								:value="filters.applicationId"
								:optionsLoading="applicationsLoading"
								:optionsList="applicationsList"
								:placeholder="$t('Application')"
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
							:fromDetailsPage="fromDetailsPage"
						/>
					</template>
				</transition>

				<PaginationContainer
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					scrollTo=".machines-list"
				/>
			</div>
		</div> -->
	</div>
</template>

<script setup>
import { ENTITIES } from '@/config/entities';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { storeToRefs } from 'pinia';
/*import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	requestsListMixin,
	eventHandler,
	navigation,
	switchGridViewMixin,
	dragNdropSortableMixin,
	dashboardListsReorderMixin
} from '@/mixins';
import { standardTableOperations } from '@/constants/table';*/
defineOptions({
	name: 'MachinesList',
});

defineProps({
	hideDropdownFilterbar: Boolean,
	disableDraggingFeature: Boolean,
	showCardHeader: Boolean,
	fromDetailsPage: Boolean,
	plantId: Number,
	showToggleListButton: Boolean,
	fromDashboard: Boolean,
});

import { useMachinesStore } from '@/stores/MachinesStore';
const machinesStore = useMachinesStore();
const { filters } = storeToRefs(machinesStore);
const machinesEntity = ENTITIES.Machines;

const { itemsList, itemsLoading } = useItemsData({
	apiRoute: machinesEntity.apiBase,
	filters: filters.value,
});

// export default {
// name: 'MachinesList',

/* setup() {
		// const plantItem = true

		return {
			// plantItem,
		}
	}, */
/*mixins: [
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
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		DropdownFilterbar: () => import('@/components/common/DropdownFilterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		ItemsGridContainer: () =>
			import('@/components/gridTable/ItemsGridContainer.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
		// FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue')
	},*/

/*props: {
		hideDropdownFilterbar: Boolean,
		disableDraggingFeature: Boolean,
		showCardHeader: Boolean,
		fromDetailsPage: Boolean,
		plantId: Number,
		showToggleListButton: Boolean,
		fromDashboard: Boolean
	},*/

/*data: () => ({
		showFilterbar: false,
		initiateRequestsToDoList: false,

		locationsList: [],
		locationsLoading: false,

		productionLinesList: [],
		productionLinesLoading: false,
		// selectedProductionLine: null,

		applicationsList: [],
		applicationsLoading: false
	}),*/

/*computed: {
		...mapState({
			filters: state => state.machines.filters
			// nextActiveItemsTable: state => state.global.nextActiveItemsTable
			// authUser: state => state.auth.authUser
		}),

		drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',
		reorderAction: () => 'reorder_machine',

		bindedFilters: () => ['productionLineId'],
		clearableFiltersList: () =>
			Object.freeze(['productionLineId', 'applicationId', 'locationId', 'q']),

		itemsName() {
			return {
				one: this.$t('Machine'),
				mult: this.$t('Machines'),
				instanceName: 'machines'
			};
		},

		instanceName: () => 'Machines',

		tableSettings() {
			let operations = {
				actions: [
					{
						name: 'handleShowNextInstanceItem',
						type: 'success',
						icon: 'icomoon icon-assets',
						tooltip_text: 'phrases.Show_Binding_Assets',
						path: '/dashboard/assets',
						nextInstanceName: 'Assets',
						setFilters: [
							{
								action: 'assets/set_assets_filters',
								param: ['machineId']
							},
							{
								action: 'equipments/set_equipments_filters',
								param: ['machineId']
							}
						]
					}
				]
			};

			if (this.$hasAccessTo(['create_maintenance'])) {
				operations.actions.unshift({
					name: 'handleCreateWorkOrderButton',
					formSetup: [
						{ formKey: 'production_line_id', valKey: 'production_line_id' },
						{ formKey: 'machine_id', valKey: 'id' }
					],
					// className: 'create-wo-button',
					type: 'success',
					tooltip_text: 'phrases.Create_Work_Order',
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
				columns: this.$translate([
					{
						prop: 'name',
						label: 'Name',
						sortable: true,
						meta: {
							action: {
								linkSettings: {
									linkRoute: 'machines/:id/details',
									linkTextProp: 'name'
								},
								className: 'table-link',
								disablePopover: true
							}
						}
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'plant.name',
						label: 'Plant',
						sortable: true
					},
					{
						prop: 'productionLine.name',
						label: 'Production_Line',
						sortable: true
					},
					{
						prop: 'application.name',
						label: 'Application',
						sortable: true
					}

					// { prop: 'uuid', label: 'Site id', sortable: true }
					// { prop: 'phone_number', label: 'Phone', width: 135 }
				]),
				operations: operations
			});
		},

		localModalSettings() {
			return Object.freeze({
				callback: () => {
					this.refetchItemsList();
					// this.show_edit_modal({ show: false });
				}
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
						tooltip_text: 'phrases.Show_Binding_Assets',
						path: '/dashboard/assets',
						nextInstanceName: 'Assets',
						setFilters: [
							{
								action: 'assets/set_assets_filters',
								params: ['machineId']
							},
							{
								action: 'equipments/set_equipments_filters',
								params: ['machineId']
							}
						]
					}
				]
			};

			if (this.$hasAccessTo(['create_maintenance'])) {
				settings.buttons.unshift({
					name: 'handleCreateWorkOrderButton',
					formSetup: [
						{ formKey: 'production_line_id', valKey: 'production_line_id' },
						{ formKey: 'machine_id', valKey: 'id' }
					],
					className: 'create-wo-button',
					type: 'primary inverted',
					tooltip_text: 'phrases.Create_Work_Order',
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
					tooltip_text: 'phrases.Edit_Machine'
				});
			}

			settings.allowDelete = this.$hasAccessTo(['delete_dashboard']);

			settings.buttons = this.$translate(settings.buttons, { key: 'tooltip_text' });

			return Object.freeze(settings);
		},

		requestsToDoList() {
			let list = [
				{
					action: 'fetch_locations',
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'locationsList',
					localLoadProp: 'locationsLoading'
				},
				{
					action: 'fetch_applications',
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'applicationsList',
					localLoadProp: 'applicationsLoading'
				},
				{
					action: 'fetch_production_lines',
					bindTo: [
						{
							prop: 'globalFilters.plantId',
							param: 'plantId',
							fetchById: {
								action: 'production_lines/fetch_production_line',
								itemId: this.filters.productionLineId
							}
						}
					],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				}
			];
			// console.log(this.propsLocationsList)

			return Object.freeze(list);
		}
	},*/

/*methods: {
		...mapActions({
			fetch_items: 'machines/fetch_machines',
			fetch_locations: 'plants/fetch_locations',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_applications: 'applications/fetch_applications',
			delete_item: 'machines/delete_machine',
			set_filters: 'machines/set_machines_filters',

			reorder_machine: 'machines/reorder_machine'
		}),

		toggleFilterbar(e) {
			this.$refs.DropdownFilterbar.toggleFilterbar(e);
			this.initiateRequestsToDoList = true;
			this.showFilterbar = !this.showFilterbar;
		},

		localGlobalFiltersWatch() {
			this.draggingLocked = true;
		}
	},*/

/*watch: {
		'globalFilters.plantId'(id) {
			if (!id) {
				this.draggingLocked = true;
			}
		}
	},*/

/*beforeMount() {
		if (this.filters.isShowList && !this.filters.isShowListRefreshed2) {
			this.setFilters({ isShowList: false });
		}

		this.preventFetch = true;
		this.setFilters({ isShowListRefreshed2: true });
	}*/
// };
</script>
