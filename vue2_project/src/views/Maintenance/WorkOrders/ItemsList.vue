<template>
	<div class="view-list-wrapper work-orders-list">
		<!-- <div class="mcontainer"> -->
		<div class="card content-row">
			<div class="card-content">
				<Filterbar
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:perPageItems="perPageItems"
					:actionButtons="filterbarActionButtons"
					hideSearchbar
				>
					<template>
						<div
							class="change-wo-status-selector"
							v-if="changeStatusOperatonsList.length"
						>
							<CustomSelect
								className="el-button el-button--primary inverted item-action-button"
								:optionsList="changeStatusOperatonsList"
								@change="changeStatusOperation"
								idKey="label"
								labelKey="label"
								valueKey="actionName"
								:prefixText="tt('phrases.Change_Status')"
							/>
						</div>

						<div class="ml-auto filter-item" v-if="!hideDatepicker">
							<Datepicker
								setupDaterangeFilter
								enableShortcuts
								@input="
									range =>
										setFilters({ daterange: range, daterange_setted_at: Date.now() })
								"
								:value="filters.daterange"
								type="daterange"
								clearable
							/>
						</div>

						<div class="filter-item ml-auto">
							<el-button
								@click="handleExportToExcel"
								type="success"
								icon="icomoon icon-doc_xls"
								class="action-button inverted"
								size="mini"
								native-type="button"
							/>
						</div>

						<div class="ml-auto filter-item">
							<el-popover
								:placement="'bottom'"
								trigger="click"
								width="200"
								:close-delay="0"
							>
								<el-button
									slot="reference"
									type="transparent"
									icon="icomoon icon-search"
									class="action-button inverted"
									size="mini"
									native-type="button"
								/>

								<div :class="['search-block-wrapper relative']">
									<SimpleSpinner :active="itemsLoading" />
									<SearchBar
										class="search-block"
										@submit="data => setFilters(data)"
										:query="filters.q"
										:clearable="true"
									/>
								</div>
							</el-popover>
						</div>
					</template>

					<template v-slot:last>
						<div class="filter-item toggle-additional-filters">
							<el-button
								type="primary"
								native-type="button"
								:class="['action-button inverted', { active: showFilterbar }]"
								:icon="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"
								@click="e => toggleFilterbar(e)"
							/>

							<span
								v-show="activeFiltersCount"
								class="round-counter wo-filters-count"
								>{{ activeFiltersCount }}</span
							>
						</div>
					</template>
				</Filterbar>

				<DropdownFilterbar
					ref="DropdownFilterbar"
					hideToggleButton
					@event="handleEvent"
					:itemsName="itemsName"
					filterbarDropdownId="woDropdownFilterbar"
				>
					<div class="mcol-xs-12 flex wrap work-orders-dropdown-filters">
						<div class="filter-items-list relative">
							<div class="mrow flex wrap">
								<div class="mcol-xs-auto checkbox-item" v-if="isCustomer">
									<el-checkbox
										:value="filters.my"
										:false-label="null"
										@change="val => setFilters({ my: val })"
									>
										<b class="capitalize">{{ tt('phrases.assigned_to_me') }}</b>
									</el-checkbox>
								</div>

								<div class="mcol-xs-auto checkbox-item">
									<el-checkbox
										:value="filters.onlyFromRequest"
										:false-label="null"
										@change="val => setFilters({ onlyFromRequest: val })"
									>
										<b class="capitalize">{{ tt('phrases.From_Request') }}</b>
									</el-checkbox>
								</div>
							</div>
						</div>

						<div class="filter-items-list relative">
							<div class="mrow flex wrap">
								<div class="filter-item mcol-xs-6 mcol-sm-1">
									<CustomSelect
										clearable
										:optionsList="woStageTypesList"
										:placeholder="tt('stage')"
										@change="id => setFilters({ stage: id })"
										:value="filters.stage"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-1">
									<CustomSelect
										clearable
										:optionsList="woFrequencyTypesList"
										:placeholder="tt('Frequency')"
										@change="id => setFilters({ frequency: id })"
										:value="filters.frequency"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelect
										multiple
										collapse-tags
										clearable
										:optionsList="filteredWorkOrdersStatusesList"
										:placeholder="tt('Status')"
										@change="ids => setFilters({ status: ids })"
										:value="filters.status"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelect
										clearable
										:optionsList="maintenanceCategoriesFiltersList"
										:optionsLoading="maintenanceCategoriesLoading"
										:placeholder="tt('Work_Order_Type')"
										@change="
											id =>
												setFilters({
													categoryId: id,
													withoutCategory: id === 0 ? true : null
												})
										"
										:value="filters.categoryId"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelect
										filterable
										clearable
										:optionsLoading="productionLinesLoading"
										:optionsList="productionLinesList"
										:placeholder="tt('production_line')"
										:value="filters.productionLineId"
										@change="
											id =>
												setFilters({ productionLineId: id }, [
													'machineId',
													'assetId'
												])
										"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-1">
									<CustomSelect
										filterable
										clearable
										:optionsLoading="machinesLoading"
										:optionsList="machinesList"
										:placeholder="tt('Machine')"
										:value="filters.machineId"
										@change="
											id => setFilters({ machineId: id }, ['assetId', 'equipmentId'])
										"
									/>
								</div>
								<div class="filter-item mcol-xs-6 mcol-sm-1">
									<FetchByQuerySelect
										clearable
										enableLoadmore
										:loadmoreIsActive="assetsLoadmoreIsActive"
										@input="id => setFilters({ assetId: id }, ['equipmentId'])"
										:value="filters.assetId"
										:optionsLoading.sync="assetsLoading"
										:optionsList.sync="assetsList"
										:settings="assetQueryOptions"
										:placeholder="tt('Asset')"
									/>
								</div>
								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<FetchByQuerySelect
										clearable
										enableLoadmore
										:loadmoreIsActive="equipmentsLoadmoreIsActive"
										@input="id => setFilters({ equipmentId: id })"
										:value="filters.equipmentId"
										:optionsLoading.sync="equipmentsLoading"
										:optionsList.sync="equipmentsList"
										:settings="equipmentsQueryOptions"
										:placeholder="tt('item')"
										:setupLabelSettings="equipmentLabelOptions"
									/>
								</div>
							</div>
						</div>
					</div>
				</DropdownFilterbar>

				<CustomDataListTable
					alwaysShowOperations
					ref="ItemsTableContainer"
					@event="handleEventNew"
					:disableSelection="
						!$hasAccessTo(['delete_maintenance', 'edit_maintenance', 'some'])
					"
					:itemsLoading="itemsLoading || usersLoading"
					:tableData="itemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
				/>

				<PaginationContainer
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					scrollTo=".work-orders-list"
				/>
			</div>
		</div>
		<!-- </div> -->
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	exportListToFileMixin,
	navigation,
	requestsListMixin,
	actionButtonsMixin
} from '@/mixins';
import {
	MAINTENANCE_TYPES,
	maintenanceTypesList,
	woStageTypesList,
	woFrequencyTypesList,
	WORK_ORDER_STATUSES_TYPES,
	workOrdersStatusesList
} from '@/constants/global';
import {
	findItemBy,
	cloneDeep,
	getTimeDifference,
	cleanDateString,
	setupAssignedUsers,
	getWOStatus
} from '@/helpers';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		exportListToFileMixin(),
		navigation(),
		requestsListMixin(),
		actionButtonsMixin()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		DropdownFilterbar: () => import('@/components/common/DropdownFilterbar.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue')
	},

	props: {
		perPageItems: Array,
		usersList: Array,
		usersLoading: Boolean,
		hideDatepicker: Boolean,
		fromPlantDashboard: Boolean
	},

	data: () => ({
		// usersList: [],
		// usersLoading: false,
		// logLoading: false,
		showFilterbar: false,
		initiateRequestsToDoList: false,

		productionLinesList: [],
		productionLinesLoading: false,
		machinesList: [],
		machinesLoading: false,
		assetsList: [],
		assetsLoading: false,
		equipmentsList: [],
		equipmentsLoading: false,
		maintenanceCategoriesList: [],
		maintenanceCategoriesLoading: false
	}),

	computed: {
		...mapState({
			filters: state => state.maintenance.filters_wo,
			authUser: state => state.auth.authUser,
			access_token: state => state.auth.access_token,
			callMethodGlobal: state => state.global.callMethod,
			isCustomer: state => state.auth.isCustomer
		}),

		woStageTypesList: () => Object.freeze(woStageTypesList()),
		woFrequencyTypesList: () => Object.freeze(woFrequencyTypesList()),
		filteredWorkOrdersStatusesList: that =>
			Object.freeze(
				workOrdersStatusesList().filter(si =>
					si.permissions ? that.$hasAccessTo(si.permissions) : true
				)
			),

		changeStatusOperatonsList() {
			let list = [{ label: 'phrases.In_Work', actionName: 'handleInWorkItems' }];

			if (this.$hasAccessTo(['edit_maintenance'])) {
				list.push({ label: 'Complete', actionName: 'handleCompleteItems' });
			}
			if (this.$hasAccessTo(['delete_maintenance'])) {
				list.push({ label: 'Close', actionName: 'handleCloseItems' });
			}
			return Object.freeze(this.$translate(list));
		},

		editInModal: () => true,
		instanceName: () => 'Maintenance',

		maintenanceCategoriesFiltersList() {
			const { maintenanceCategoriesList } = this;
			let list = [{ id: 0, name: 'Without Category' }];

			if (maintenanceCategoriesList.length) {
				list = list.concat(maintenanceCategoriesList);
			}
			return Object.freeze(list);
		},

		localModalSettings: that =>
			Object.freeze({
				editModalProp: 'editModalClassic',
				componentPath: 'Maintenance/MaintenanceFormWrapper',
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer small-header small-footer',
				additionalModalSettings: {
					switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
					plantId: that.globalFilters.plantId,
					...that.propsFilters
				},
				callback: () => {
					that.fetchItems({ ...that.filters, ...that.globalFilters });
					that.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
				}
			}),

		itemsName() {
			const { type } = this.propsFilters;
			const item = findItemBy('id', type, maintenanceTypesList());
			return {
				one: item.label,
				mult: `${item.label}`,
				instanceName: 'maintenance'
			};
		},

		assetQueryOptions() {
			return Object.freeze({
				fetchAction: 'assets/fetch_assets',
				params: {
					plantId: this.globalFilters.plantId,
					productionLineId: this.filters.productionLineId,
					machineId: this.filters.machineId
				}
			});
		},
		equipmentsQueryOptions() {
			return Object.freeze({
				fetchAction: 'equipments/fetch_equipments',
				params: {
					plantId: this.globalFilters.plantId,
					productionLineId: this.filters.productionLineId,
					machineId: this.filters.machineId,
					assetId: this.filters.assetId
				}
			});
		},

		assetsLoadmoreIsActive() {
			let { machineId /*, assetId*/ } = this.filters;
			return !machineId /*&& !assetId*/;
		},
		equipmentsLoadmoreIsActive() {
			let { machineId, assetId } = this.filters;
			return !machineId && !assetId;
		},
		equipmentLabelOptions: () =>
			Object.freeze({
				accessors: [
					'brand_name',
					'machine_name',
					'production_line_name',
					'location_name'
				],
				delimeter: ','
			}),

		requestsToDoList() {
			let { assetId, equipmentId } = this.filters;

			return Object.freeze([
				/*{
					action: 'fetch_users',
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				},*/
				{
					action: 'fetch_maintenance_categories',
					localProp: 'maintenanceCategoriesList',
					localLoadProp: 'maintenanceCategoriesLoading'
				},
				{
					action: 'fetch_machines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId' },
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						}
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				},
				{
					action: 'fetch_assets',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: assetId
						? {
								fetchById: { action: 'assets/fetch_asset', itemId: assetId }
						  }
						: null,
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true },
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						},
						{
							prop: 'filters.machineId',
							param: 'machineId'
						}
					],
					localProp: 'assetsList',
					localLoadProp: 'assetsLoading'
				},
				{
					action: 'fetch_equipments',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: equipmentId
						? {
								fetchById: {
									action: 'equipments/fetch_equipment',
									itemId: equipmentId
								}
						  }
						: null,
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true },
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						},
						{
							prop: 'filters.machineId',
							param: 'machineId'
						},
						{
							prop: 'filters.assetId',
							param: 'assetId'
						}
					],
					localProp: 'equipmentsList',
					localLoadProp: 'equipmentsLoading'
				}
			]);
		},

		tableSettings() {
			let settings = { columns: [] };

			if (this.usersList.length) {
				settings = {
					tableClass: 'maintenance-table',
					columns: this.$translate([
						{
							prop: 'serial_number',
							label: 'WO',
							label_postfix: '#',
							// sortable: true,
							width: 80
						},
						{
							prop: 'created_at',
							label: 'Date',
							sortable: true,
							min_width: 120,
							meta: {
								prepareValue: { localMethod: cleanDateString },
								additionalContent: {
									component: {
										componentPath: 'views/Maintenance/WorkOrders/RecommendedTemplate'
									}
								}
							}
						},
						{
							prop: 'finish_date',
							label: 'Due_Date',
							sortable: true,
							min_width: 120,
							meta: {
								prepareValue: {
									localMethod: this.setupTotalDays,
									useAllInstanceData: true
								}
							}
						},
						{
							label: 'Status',
							prop: 'status',
							width: 120,
							meta: {
								prepareValue: {
									localMethod: getWOStatus,
									args: { listName: 'workOrdersStatusesList' }
								}
								// cell_class: 'work-order-status-cell'
							}
						},
						{
							prop: 'machine.name',
							label: 'phrases.Machine_name',
							min_width: 110,
							meta: { sortBy: 'company' }
						},
						{
							prop: 'title',
							label: 'phrases.WO_Name',
							min_width: 120,
							sortable: true
						},
						{
							label: 'phrases.Required_items',
							prop: 'parts',
							min_width: 120,
							meta: {
								prepareValue: {
									localMethod: this.setupRequiredItems,
									useAllInstanceData: true
								}

								// fromArray: { subProp: 'quantity' }
							}
						},
						{
							prop: 'mock',
							label: 'Assigned',
							min_width: 120,
							meta: {
								prepareValue: {
									localMethod: setupAssignedUsers,
									useAllInstanceData: true,
									args: { usersList: this.usersList, max: 1 }
								}
							}
						},
						{
							label: 'Logs',
							max_width: 70,
							meta: {
								additionalActionsClassName: 'column',
								additionalActions: [
									{
										// name: 'handleShowLog',
										className: 'vertical-fluid link underline info-color',
										disablePopover: true,
										conditionSettings: {
											conditions: [{ prop: 'logs', method: 'notEmpty' }]
										},
										buttonContent: {
											component: {
												componentPath:
													'views/Maintenance/WorkOrders/LogsButtonContent'
											}
										}
									},
									{
										name: 'handleCreateLog',
										type: 'success',
										icon: 'icomoon icon-plus',
										disablePopover: true
									}
								]
							}
						}
					]),
					operations: {
						actions: [],

						actions_second_row: [
							/*{
								name: 'handlePrintWO',
								type: 'success',
								icon: 'icomoon icon-printer',
								tooltip_text: 'Print'
							},*/
						]
					}
				};

				if (!this.fromPlantDashboard) {
					settings.operations.actions.push({
						name: 'handleShowDetails',
						type: 'success',
						icon: 'icomoon icon-doc3',
						tooltip_text: 'Details'
					});
				}

				settings.operations.actions.push({
					name: 'handleShowDetailsPreview',
					type: 'success',
					popoverPlacement: 'top',
					icon: 'icomoon icon-eye',
					tooltip_text: 'phrases.Open_Details'
				});

				if (this.$hasAccessTo(['delete_maintenance'])) {
					settings.operations.actions.push(
						/*{
							name: 'editItem',
							type: 'success',
							icon: 'icomoon icon-pencil',
							tooltip_text: this.tt('Edit'),
							popoverPlacement: 'top',

							conditionSettings: {
								checkMethod: 'some',
								conditions: [
									{
										prop: 'is_periodic',
										control_value: true,
										next_conditions: [
											{	
												prop: 'created_at',
												call_method: 'compareDatesForMaintenance',
												control_value: Date.now() 
											},
											{	
												prop: 'is_closed', control_value: false 
											}
										]
									},
									{ 
										prop: 'is_periodic', method: '!=', control_value: true,
										next_conditions: [
											{ prop: 'is_closed', control_value: false }
										]
									}
								]
							}
						},*/
						{ ...standardTableOperations.delete, name: 'handleDeleteWorkOrders' }
						// standardTableOperations.delete
					);

					// settings.operations.actions_second_row.push(
					/*{
							name: 'handleCloseWO',
							type: 'success',
							icon: 'icomoon icon-cross',
							tooltip_text: 'Close Work Order',
							conditionSettings: {
								conditions: [
									{ prop: 'is_closed', method: '!=', control_value: true }
								]
							}
						}*/
					// standardTableOperations.delete
					// )
				}

				settings.operations.actions = this.$translate(settings.operations.actions, {
					key: 'tooltip_text'
				});
			}
			return Object.freeze(settings);
		},

		filterbarActionButtons() {
			let buttons = [];

			if (this.$hasAccessTo(['create_maintenance'])) {
				buttons.push({
					id: 1,
					text: 'Add',
					event: 'createItemCheckPlant'
				});
			}

			if (this.$hasAccessTo(['delete_maintenance'])) {
				buttons.push(
					{
						id: 2,
						text: 'Delete',
						event: 'handleDeleteWorkOrders',
						isDelete: true
					}
					/*{
						id: 3,
						text: 'Complete',
						event: 'handleCompleteItems',
						icon: 'icon-check',
						type: 'primary inverted'
					}*/
				);
			}

			/*if (this.$hasAccessTo(['delete_maintenance'])) {
				buttons.push({
					id: 4,
					text: 'Close',
					event: 'handleCloseItems',
					isDelete: true
				})
			}*/

			return Object.freeze(this.$translate(buttons, { key: 'text' }));
		},

		activeFiltersCount() {
			const { filters } = this;
			const exceptions = [
				'page',
				'max',
				'daterange',
				'q',
				'orderByColumn',
				'orderByMethod',
				'daterange_setted_at'
			];
			let chosingValues = [];

			Object.keys(filters).forEach(key => {
				if (exceptions.every(ei => ei != key)) chosingValues.push(filters[key]);
			});

			return chosingValues.filter(val => {
				if (val instanceof Array) return val.length;
				return !!val;
			}).length;
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'maintenance/fetch_maintenance_logs',
			// fetch_log: 'maintenance/fetch_maintenance_log',
			// fetch_users: 'users/fetch_users',

			delete_item: 'maintenance/delete_maintenance_log',
			close_work_order: 'maintenance/close_work_order',
			set_in_work_work_orders: 'maintenance/set_in_work_work_orders',
			complete_work_orders: 'maintenance/complete_work_orders',
			close_work_orders: 'maintenance/close_work_orders',

			// set_filters: 'maintenance/set_maintenance_logs_filters',
			set_filters: 'maintenance/set_maintenance_wo_filters',

			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_machines: 'machines/fetch_machines',
			fetch_assets: 'assets/fetch_assets',
			fetch_equipments: 'equipments/fetch_equipments',
			fetch_maintenance_categories:
				'maintenance_categories/fetch_maintenance_categories'
		}),

		createItemCheckPlant() {
			if (this.globalFilters.plantId) {
				this.createItem();
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.Creation_is_not_allowed'),
					message: `Select plant first`
				});
			}
		},

		setupTotalDays(response) {
			const { finish_date, status /*is_periodic*/ } = response;
			let result = `<span>${cleanDateString(finish_date)}</span> </br>`;

			if (
				/*!is_periodic &&*/ finish_date &&
				status !== WORK_ORDER_STATUSES_TYPES.CLOSED
			) {
				const finish_date_end = new Date(
					new Date(finish_date).setHours(23, 59, 59, 0)
				);

				// console.log(finish_date_end)
				const { days, lessZero } = getTimeDifference({
					from: new Date(),
					to: finish_date_end
				});

				let color, overdueToday;

				let absDays = Math.abs(days);
				const day_str = this.$t('day');
				const days_str = this.$t('days');

				if (absDays == 0) {
					overdueToday = true;
					color = '#009C67';
				} else if (lessZero) {
					color = '#BF1E2E';
				} else if (days <= 7) {
					color = '#FFA500';
				} else {
					color = '#606266';
				}

				result += `
					<span style="color: ${color}">${
					overdueToday
						? this.tt('Today')
						: absDays + ` ${absDays == 1 ? day_str : days_str}`
				}</span>`;
			}
			return result;
		},

		toggleFilterbar(e) {
			this.$refs.DropdownFilterbar.toggleFilterbar(e);
			this.initiateRequestsToDoList = true;
			this.showFilterbar = !this.showFilterbar;
		},

		setupRequiredItems({ taskProcedure, parts }) {
			if (parts.length) {
				let result = '';

				parts.forEach(pi => {
					let summ = pi.quantity;

					if (taskProcedure) {
						const { part_id } = pi;

						taskProcedure.processes.forEach(proc => {
							const part = findItemBy('part_id', part_id, proc.parts);
							if (part) summ += part.quantity;
						});
					}

					if (pi.stock) {
						result += `<div>${pi.stock.part_number} - <b>${summ}</b></div>`;
					}
				});

				return result;
			}

			return '-';
		},

		changeStatusOperation(actionName) {
			this[actionName]();
		},

		handleInWorkItems() {
			this.handleDeleteItems(null, {
				confirmButtonText: this.$t('phrases.In_Work'),
				confirmMessage: `${this.tt(
					'phrases.this_will_set_in_work_status_to_selected_workorders'
				)}. ${this.tt('Continue')}?`,
				methodName: 'setInWorkItems'
			});
		},

		handleCompleteItems() {
			this.handleDeleteItems(null, {
				confirmButtonText: this.$t('Complete'),
				confirmMessage: `${this.tt(
					'phrases.this_will_complete_selected_workorders'
				)}. ${this.tt('Continue')}?`,
				methodName: 'completeItems'
			});
		},

		handleCloseItems() {
			this.handleDeleteItems(null, {
				confirmButtonText: this.$t('Close'),
				confirmMessage: `${this.tt(
					'phrases.this_will_close_selected_workorders'
				)}. ${this.tt('Continue')}?`,
				methodName: 'closeItems'
			});
		},

		setInWorkItems(data) {
			// console.log(ids)
			this.set_in_work_work_orders({ data: data }).then(() => {
				this.refetchItemsList();
			});
		},

		completeItems(data) {
			// console.log(ids)
			this.complete_work_orders({ data: data }).then(() => {
				this.refetchItemsList();
			});
		},

		closeItems(data) {
			this.close_work_orders({ data: data }).then(() => {
				this.refetchItemsList();
			});
		},

		handlePrintWO(data) {
			this.handleShowDetailsPreview({ ...data, forPrint: true });
		},

		handleShowDetailsPreview({ row, forPrint }) {
			// console.log(data)
			let settings = {
				row: row,
				modal_settings: {
					componentPath: 'Maintenance/WorkOrders/ItemDetailsPreview',
					title: this.$t('Work_Order') + ' ' + this.$t('Details'),
					hideFooter: true,
					hideModal: forPrint,
					hideSubmitButtons: true,
					settings: {
						printHTML: forPrint
						// maintenanceType: MAINTENANCE_TYPES.WORK_ORDER,
						// showJustInfo: true
					},
					additionalModalSettings: {
						productionLinesList: this.productionLinesList
					},
					itemName: this.tt('Work_Order'),
					headerActions: [],
					footerActions: []
				}
			};

			if (!forPrint) {
				settings.modal_settings.headerActions = [
					{
						name: 'handlePrintWO',
						// className: 'borderless',
						type: 'transparent',
						icon: 'icomoon icon-printer',
						tooltip_text: 'Print'
					}
					/*{
						name: 'exportLog',
						// className: 'borderless',
						type: 'transparent',
						icon: 'icomoon icon-pdf',
						tooltip_text: 'Export To PDF'
					},*/
				];

				if (this.$hasAccessTo(['create_maintenance']) && !row.has_trashed_entities) {
					settings.modal_settings.headerActions.push({
						name: 'editItem',
						// type: 'success',
						icon: 'icomoon icon-pencil',
						tooltip_text: this.tt('Edit'),
						type: 'transparent',

						conditionSettings: {
							checkMethod: 'some',
							conditions: [
								{
									prop: 'is_periodic',
									control_value: true,
									next_conditions: [
										/*{	
												prop: 'created_at',
												call_method: 'compareDatesForMaintenance',
												control_value: Date.now() 
											},*/
										{
											prop: 'is_closed',
											control_value: false
										}
									]
								},
								{
									prop: 'is_periodic',
									method: '!=',
									control_value: true,
									next_conditions: [{ prop: 'is_closed', control_value: false }]
								}
							]
						}
					});
				}

				if (row.is_closed && this.$hasAccessTo(['delete_maintenance'])) {
					settings.modal_settings.footerActions = [
						{
							name: 'handleUnlockWorkOrder',
							button_text: this.tt('UNLOCK'),
							disablePopover: true,
							type: 'primary'
						}
					];
					settings.modal_settings.hideFooter = false;
				}
			}
			// console.log('1', settings)
			this.editItem(settings);
		},

		localModalSettingsHook({ itemData, modalSettings }) {
			let newModalSettings = cloneDeep(modalSettings);
			if (itemData && itemData.is_periodic) {
				// console.log(itemData.is_periodic)
				newModalSettings.additionalModalSettings.switchTabTo = {
					key: 'isRecurring',
					value: true
				};
			}
			if (modalSettings.callback) {
				newModalSettings.callback = modalSettings.callback;
			}
			return newModalSettings;
		},

		openFile() {
			return;
			/*const { attachments } = row;
			attachments.forEach(ai => {
				const link = document.createElement('a');
				link.href = ai.file_path;
				link.target = '_blank';
				link.click();
			});*/
		},

		handleExportToExcel() {
			if (this.globalFilters.plantId) {
				this.handleExportItem({
					url: 'maintenance/export/excel',
					filters: {
						...this.filters,
						plantId: this.globalFilters.plantId,
						type: MAINTENANCE_TYPES.WORK_ORDER
					}
				});
			} else {
				this.$notify({
					type: 'warning',
					// title: this.$t('phrases.Export_is_not_allowed'),
					message: this.$t('phrases.select_plant_first')
				});
			}
		},

		/*exportLog({ row }) {
			this.handleExportItem({
				url: `maintenance/exportPDF`,
				filters: { ids: row.id }
			});
		},*/

		// ----
		handleCreateLog({ row }) {
			// console.log(row)
			const payload = {
				modal_settings: {
					title: this.tt('phrases.Create_Maintenance_log'),
					formSettings: {
						// type: MAINTENANCE_TYPES.LOG,
						parent_id: row.id,
						production_line_id: row.production_line_id,
						machine_id: row.machine_id,
						asset_id: row.asset_id,
						equipment_id: row.equipment_id,
						status: row.status
					},
					settings: {
						parentOrderData: row
					},
					additionalModalSettings: {
						disableTabs: !this.$hasAccessTo(['create_maintenance']),
						switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG },
						plantId: row.plant_id,
						...this.propsFilters
					}
					// itemName: 'Maintenance Log'
				}
			};
			// console.log(payload)
			this.createItem(payload);
		},

		handleShowLog({ order, log }) {
			const settings = {
				row: log,
				modal_settings: {
					title: `${this.tt('create')} ${this.tt('Maintenance_Log')}`,
					componentPath: 'Maintenance/Logs/ItemDetailsPreview',
					hideSubmitButtons: true,
					headerActions: [],
					footerActions: [],
					settings: {
						showJustInfo: true,
						parentOrderData: order
					},
					additionalModalSettings: {
						// switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG },
						plantId: order.plant_id,
						parentWO: order,
						productionLinesList: this.productionLinesList,
						taskProcedure: order.taskProcedure,
						...this.propsFilters
					}
					// itemName: 'Maintenance Log'
				}
			};

			if (this.$hasAccessTo(['create_maintenance', 'edit_maintenance'])) {
				settings.modal_settings.footerActions.push({
					name: 'handleCreateRequest',
					button_text: this.tt('phrases.CREATE_WORK_ORDER_REQUEST'),
					disablePopover: true,
					type: 'primary',
					className: 'item-action-button',
					parentLog: log
				});
			}

			if (
				this.isCustomer &&
				this.$hasAccessTo(['edit_maintenance'])
				// this.authUser.type === USER_TYPES.PLANT_SUPERINTENDENT
			) {
				settings.modal_settings.headerActions.push({
					name: 'editLogFromWOList',
					icon: 'icomoon icon-pencil',
					tooltip_text: this.tt('Edit'),
					type: 'transparent',
					conditionSettings: {
						conditions: [
							{
								prop: 'is_acknowledge_by_supervisor',
								method: '==',
								control_value: false
							},
							{ prop: 'creator.id', method: '==', control_value: this.authUser.id }
						]
					}
				});
			} else if (this.$hasAccessTo(['edit_maintenance'])) {
				// ...standardTableOperations.edit,
				settings.modal_settings.headerActions.push({
					name: 'editLogFromWOList',
					icon: 'icomoon icon-pencil',
					type: 'transparent',
					tooltip_text: this.tt('Edit')
				});
			}
			// console.log(settings)
			this.editItem(settings);
		},

		editLogFromWOList(payload) {
			this.editItem({
				...payload,
				modal_settings: {
					title: `${this.tt('Edit')} ${this.tt('Maintenance_Log')}`,
					itemName: this.tt('Log'),
					additionalModalSettings: {
						switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG }
					}
				}
			});
		},

		handleCloseWO({ row }) {
			this.confirmHelper({
				message: `${this.tt('phrases.close_this_work_order')}?`
			})
				.then(() => {
					this.close_work_order({ itemId: row.id }).then(() => {
						this.refetchItemsList();
					});
				})
				.catch(() => {});
		},

		handleDeleteWorkOrders(data) {
			if (data && data.row.is_periodic) {
				const { tt } = this;
				this.confirmHelper({
					message: `${this.tt(
						'phrases.apply_this_action_to_all_reccurring_orders_or_only_this_one'
					)}?`,
					confirmButtonText: tt('phrases.To_all'),
					cancelButtonText: tt('phrases.only_this_one')
				})
					.then(() => {
						this.handleDeleteItems(data, {
							payload: { data: { with_siblings: true } }
						});
					})
					.catch(() => {
						this.handleDeleteItems(data);
					});
			} else {
				this.handleDeleteItems(data);
			}
		},

		fetchProdLines(options = {}) {
			this.startFetchAction({
				action: 'fetch_production_lines',
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
				localProp: 'productionLinesList',
				localLoadProp: 'productionLinesLoading',
				...options
			});
		}
	},

	watch: {
		callMethodGlobal(data) {
			if (data) {
				// console.log(data);
				const { name, payload } = data;
				if (this[name]) this[name](payload);
			}
		}
	},

	beforeMount() {
		this.fetchProdLines();
	}
};
</script>
