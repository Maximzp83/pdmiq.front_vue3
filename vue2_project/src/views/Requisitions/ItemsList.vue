<template>
	<div class="view-list-wrapper">
		<!-- <div :class="['page-top-bg-addition']" /> -->
		<div class="card-content">
			<Filterbar
				@event="handleEvent"
				:itemsLoading="itemsLoading"
				:filters="filters"
				:itemsName="itemsName"
				:actionButtons="actionButtons"
				hideSearchbar
				hideCreate
				hideDelete
			>
				<template v-slot:middle>
					<div
						class="filter-item radio-buttons-wrapper fluid flex align-center mrow"
					>
						<RadioButtonsBlock
							@onChange="handleRadioFilters"
							:settings="radioBlockOptions"
							:optionsList="radioButtonsList"
							:value="activeRadioFilter"
						/>
					</div>

					<!-- <div class="ml-auto filter-item">
						<CustomSelect
							filterable
							clearable
							:optionsList="requisitionWorkTypesList"
							:placeholder="$t('Work_Type')"
							:value="filters.workType"
							@change="id => setFilters({ workType: id })"
						/>
					</div> -->

					<div class="ml-auto filter-item">
						<CustomSelect
							filterable
							clearable
							:optionsList="requisitionCategoriesList"
							:placeholder="$t('Category')"
							:value="filters.category"
							@change="id => setFilters({ category: id })"
						/>
					</div>

					<div class="filter-item export-buttons">
						<!-- <el-button-group> -->
						<el-button
							@click="showExportDateRangeFilter = true"
							type="success"
							icon="icomoon icon-doc_xls"
							class="inverted"
							size="mini"
							native-type="button"
						/>

						<!-- <el-button
								@click="handleExportList('plants/work-orders')"
								type="success"
								icon="icomoon icon-pdf"
								class="inverted"
								size="mini"
								native-type="button"
								:loading="exportingInProgress"
							/> -->
						<!-- </el-button-group> -->
					</div>

					<div
						class="filter-item text-right"
						v-show="showExportDateRangeFilter"
					>
						<div class="flex mrow align-center exporting-item">
							<!-- @input="handleDateRange" -->
							<!-- :value="export_daterange" -->
							<Datepicker
								enableShortcuts
								v-model="export_daterange"
								type="daterange"
							/>

							<el-button
								@click="showExportDateRangeFilter = false"
								type="danger"
								icon="icomoon icon-cross"
								size="mini"
								native-type="button"
								:loading="exportingInProgress"
							/>

							<el-button
								@click="handleExportToExel"
								type="success"
								icon="icomoon icon-check"
								size="mini"
								native-type="button"
								:loading="exportingInProgress"
							/>
						</div>
					</div>
				</template>
			</Filterbar>
			<!-- :actionButtons="actionButtons" -->

			<!-- class="maintenance-table" -->
			<CustomDataListTable
				disableSelection
				alwaysShowOperations
				ref="ItemsTableContainer"
				@event="handleEventNew"
				:itemsLoading="itemsLoading"
				:tableData="itemsList"
				:tableSettings="tableSettings"
				:itemsName="itemsName"
			/>

			<div class="">
				<PaginationContainer
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
				/>
			</div>
		</div>

		<el-dialog
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="dialogSettings.title"
			:visible.sync="dialogSettings.show"
		>
			<component
				fromModal
				showSubmitButtons
				v-if="dialogSettings.componentPath"
				ref="ItemFormComponent"
				@event="handleEvent"
				@onCancel="dialogSettings = {}"
				v-bind:is="componentFile"
				:itemData="itemData"
				:settings="dialogSettings.formSettings"
			/>
		</el-dialog>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	exportListToFileMixin,
	navigation,
	actionButtonsMixin
	// requestsListMixin
} from '@/mixins';
import {
	REQUISITION_STATUSES_TYPES,
	requisitionStatusesList,
	USER_ROLES_TYPES,
	// WORK_ORDER_ROLES,
	requisitionWorkTypesList,
	requisitionCategoriesList
} from '@/constants/global';
import { cleanDateString, getWOStatus, formatTime } from '@/helpers';
// console.log(itemsDataMixin)
export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		exportListToFileMixin(),
		navigation(),
		actionButtonsMixin()
	],
	name: 'HistoryPage',
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue')
		// Counters: () => import('./Counters.vue'),
	},

	props: {
		pageType: { type: Object, required: true },
		usersList: Array
	},

	data() {
		return {
			dialogSettings: {},
			export_daterange: []
		};
	},

	computed: {
		...mapState({
			filters: state => state.plant_requisitions.filters,
			authUser: state => state.auth.authUser,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,

			plantsList: state => state.global.globalPlantsList,
			access_token: state => state.auth.access_token
		}),

		requisitionWorkTypesList: () => requisitionWorkTypesList(),
		requisitionCategoriesList: () => requisitionCategoriesList(),

		componentFile() {
			if (this.dialogSettings.show) {
				return () => import(`./${this.dialogSettings.componentPath}.vue`);
			}
			return null;
		},

		predefinedFilters: () =>
			Object.freeze({
				daterange: [],
				technicians: [] //just for clean this filter (hotfix)
			}),

		editInModal: () => true,
		// instanceName: () => 'Requisitions',

		actionButtons() {
			// const { authUser } = this;
			if (
				this.pageType.isRequisitionsPage &&
				this.$hasAccessTo(['create_requisitions'])
			) {
				return Object.freeze([
					{
						id: 1,
						text: `${this.$t('Create')} ${this.$t('phrases.Requisition_Form')}`,
						event: 'createRequisition'
					}
				]);
			}

			return [];
		},

		// pickerOptions: () => ({ shortcuts: datePickerShortcuts }),

		radioBlockOptions: that => ({
			title: that.$t('status'),
			inline: true,
			// prop_name: 'source_type',
			hideTitle: true,
			buttonType: 'secondary'
			// group: true
			// className: 'inverted',
		}),

		radioButtonsList: that => {
			let list = [{ id: undefined, title: that.$t('All') }];

			requisitionStatusesList().forEach(si => {
				list.push({ id: si.id, title: si.label });

				/*if (
					(si.id !== REQUISITION_STATUSES_TYPES.PENDING &&
						si.id !== REQUISITION_STATUSES_TYPES.DENIED) ||
					that.isIndustrialMatrix
				) {
					list.push({ id: si.id, title: si.label });
				}*/
			});

			return Object.freeze(list);
		},

		activeRadioFilter() {
			const { status, onHold } = this.filters;
			if (onHold) {
				return REQUISITION_STATUSES_TYPES.ON_HOLD;
			}
			return status !== undefined && status !== null ? status : undefined;
		},

		itemsName() {
			return {
				one: this.$t('Requisition'),
				mult: this.$t('Requisitions'),
				instanceName: 'plant_requisitions'
			};
		},

		// predefinedFilters: that => Object.freeze({ userId: that.authUser.id }),

		tableSettings() {
			// const { role } = this.authUser;

			let settings = {
				tableClass: 'bolded-cells requisitions-table',
				columns: this.$translate([
					{
						prop: 'id',
						label: 'WO',
						label_postfix: '#',
						width: 60
					},
					{
						prop: 'created_at',
						label: 'phrases.Date_Sent',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: {
								localMethod: cleanDateString,
								args: { withoutTime: true }
							}
						}
					},
					{
						prop: 'complete_at',
						label: 'phrases.Requested_Date',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'estimated_started_at',
						label: 'phrases.Estimated_Start_Date',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'estimated_finished_at',
						label: 'phrases.Estimated_Completion_Date',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'requisitionPlant.name',
						label: 'Requisition_Plant',
						width: 160,
						sortable: true
						/*meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}*/
					},
					{
						prop: 'requisition_details',
						label: 'Details',
						meta: {
							cell_class: 'ellipsis'
						},
						min_width: 150
					},
					{
						prop: 'technicians',
						label: 'Assigned',
						min_width: 200,
						// sortable: true,
						meta: {
							fromArray: { subProp: 'full_name', delimeter: ', ' /*inline: true*/ }

							// getItemValue: { prop: 'full_name', list: this.usersList }
						}
					},
					{
						label: 'PO',
						label_postfix: '#',
						prop: 'po_number'
						// width: 120,
					},
					/*{
						prop: 'fabrication_plant_id',
						label: 'Fab Plant',
						sortable: true,
						meta: { 
							getItemValue: { prop: 'name', list: this.plantsList }
						}
					},*/

					{
						prop: 'status',
						label: 'Status',
						width: 120,
						meta: {
							prepareValue: {
								localMethod: getWOStatus,
								args: { listName: 'requisitionStatusesList' }
							}
						}
					},
					{
						prop: 'actual_time',
						label: 'Hours',
						// sortable: true,
						width: 90,
						meta: {
							prepareValue: { localMethod: formatTime, args: 'h:m' }
						},
						conditionSettings: {
							conditions: [
								{
									prop: 'status',
									array_method: 'some',
									method: '==',
									control_value: [
										REQUISITION_STATUSES_TYPES.COMPLETED,
										REQUISITION_STATUSES_TYPES.APPROVED,
										REQUISITION_STATUSES_TYPES.IN_WORK
									],
									falseValue: '-'
								}
							]
						}
					},
					{
						prop: 'proposed_cost',
						label: 'Budget',
						width: 70,
						// sortable: true,
						meta: {
							// prepareValue: { localMethod: cleanDateString }
						}
						/*settings: {
							checkarray_Method: 'some',
							conditions: [
								{
									prop: 'status',
									values: [
										REQUISITION_STATUSES_TYPES.COMPLETED,
										REQUISITION_STATUSES_TYPES.APPROVED,
										REQUISITION_STATUSES_TYPES.IN_WORK
									],
									method: '==',
									falseValue: '-'
								},
							]
						}*/
					},
					{
						prop: 'actual_cost',
						label: 'Fab_Shop_Budget',
						width: 82,
						// sortable: true,
						/*meta: {
							prepareValue: { 
								method: 'calcFabShopBudget',
								useAllInstanceData: true,
								args: { usersList: this.usersList }
							}
						},*/
						conditionSettings: {
							conditions: [
								{
									prop: 'status',
									array_method: 'some',
									method: '==',
									control_value: [
										REQUISITION_STATUSES_TYPES.COMPLETED,
										REQUISITION_STATUSES_TYPES.APPROVED,
										REQUISITION_STATUSES_TYPES.IN_WORK
									],
									falseValue: '-'
								}
							]
						}
					},
					{
						label: 'phrases.Running_Total_Materials',
						prop: 'execution_materials_cost',
						width: 70,
						conditionSettings: {
							conditions: [
								{
									prop: 'status',
									array_method: 'some',
									method: '==',
									control_value: [
										REQUISITION_STATUSES_TYPES.COMPLETED,
										REQUISITION_STATUSES_TYPES.APPROVED,
										REQUISITION_STATUSES_TYPES.IN_WORK
									],
									falseValue: '-'
								}
							]
						}
					},
					{
						label: 'phrases.Running_Total_Hours',
						prop: 'execution_total_time',
						width: 70,
						conditionSettings: {
							conditions: [
								{
									prop: 'status',
									array_method: 'some',
									method: '==',
									control_value: [
										REQUISITION_STATUSES_TYPES.COMPLETED,
										REQUISITION_STATUSES_TYPES.APPROVED,
										REQUISITION_STATUSES_TYPES.IN_WORK
									],
									falseValue: '-'
								}
							]
						}
					},
					{
						label: 'Categories',
						prop: 'category',
						min_width: 180,
						meta: {
							getItemValue: { prop: 'name', list: this.requisitionCategoriesList }
						}
					}
				]),
				operations: {
					// columnWidth: '152',
					actions: [
						// standardTableOperations.edit,
						// standardTableOperations.delete
					]
				}
			};

			// if (this.pageType.isWOAssignedPage && this.isIndustrialMatrix) {
			if (
				this.pageType.isWOAssignedPage &&
				this.$hasAccessTo(['edit_requisitions'])
			) {
				settings.operations.actions.push(
					{
						name: 'handleHoldOn',
						type: 'info',
						button_text: 'On_Hold',
						disablePopover: true,
						className: 'width-auto',
						// icon: 'icomoon icon-lock',
						// className: 'inverted',
						// tooltip_text: 'Hold On',
						conditionSettings: {
							checkMethod: 'every',
							conditions: [
								{
									prop: 'status',
									method: '!=',
									control_value: REQUISITION_STATUSES_TYPES.COMPLETED
								},
								{
									prop: 'is_on_hold',
									control_value: false
								}
							]
						}
					},
					{
						name: 'handleHoldOn',
						type: 'info',
						button_text: 'Off_Hold',
						disablePopover: true,
						className: 'width-auto',
						// icon: 'icomoon icon-lock2',
						// className: 'inverted',
						// tooltip_text: 'Off Hold',
						conditionSettings: {
							checkMethod: 'every',
							conditions: [
								{
									prop: 'status',
									method: '!=',
									control_value: REQUISITION_STATUSES_TYPES.COMPLETED
								},
								{
									prop: 'is_on_hold',
									control_value: true
								}
							]
						}
					},
					{
						name: 'handleUnapprove',
						type: 'success',
						icon: 'icomoon icon-lock2',
						className: 'inverted',
						tooltip_text: 'Unapprove',
						conditionSettings: {
							conditions: [
								{
									prop: 'can_change_requisition',
									method: '==',
									control_value: false
								},
								{
									prop: 'status',
									method: '==',
									control_value: REQUISITION_STATUSES_TYPES.APPROVED
								}
							]
						}
					},
					{
						// name: 'handleUnapprove',
						type: 'success',
						icon: 'icomoon icon-unlock',
						className: 'inverted',
						disablePopover: true,
						isDisabled: true,
						tooltip_text: 'Unapprove',
						conditionSettings: {
							conditions: [
								{
									prop: 'can_change_requisition',
									method: '==',
									control_value: true
								},
								{
									prop: 'status',
									method: '==',
									control_value: REQUISITION_STATUSES_TYPES.APPROVED
								}
							]
						}
					}
				);
			}

			settings.operations.actions.push(
				{
					name: 'handleShowDetails',
					type: 'success',
					icon: 'icomoon icon-docs',
					tooltip_text: 'Details'
				},
				{
					name: 'handleGotoDetails',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: 'phrases.Open_Details'
				}
			);

			if (this.$hasAccessTo(['delete_requisitions'])) {
				settings.operations.actions.push({
					name: 'handleDeleteItems',
					type: 'danger',
					icon: 'icomoon icon-cross',
					tooltip_text: 'Delete',
					conditionSettings: {
						checkMethod: 'some',
						conditions: [
							{
								array_method: 'some',
								controlObj: this.authUser.role,
								prop: 'type',
								control_value: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX, USER_ROLES_TYPES.DEVELOPER]
							},
							{
								controlObj: this.authUser.role,
								prop: 'is_fab_shop_manager',
								control_value: true
							},
							{
								controlObj: this.authUser.role,
								prop: 'is_requisitioner',
								control_value: true,
								next_conditions: [
									{
										prop: 'requisition_user_id',
										control_value: this.authUser.id,
									},
									{
										prop: 'status',
										control_value: REQUISITION_STATUSES_TYPES.PENDING
									}
								]
							},
							/*{
								prop: 'requisition_user_id',
								control_value: this.authUser.id,
								next_conditions: [
									{
										prop: 'status',
										control_value: REQUISITION_STATUSES_TYPES.PENDING
									}
								]
							}*/
						]
					}
				});
			}

			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'tooltip_text'
			});
			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'button_text'
			});

			return Object.freeze(settings);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'plant_requisitions/fetch_requisitions',
			delete_item: 'plant_requisitions/delete_requisition',
			unapprove_item: 'plant_requisitions/unapprove_requisition',
			hold_on_item: 'plant_requisitions/hold_on_requisition',

			set_filters: 'plant_requisitions/set_requisitions_filters'
		}),

		/*getRequisitionStatus(status) {
			const item = findItemBy('id', status, requisitionStatusesList);
			// console.log(status, item)
			// <i style="background-color: ${item.color}"></i>
			return `<span class="requisition-status-label"
								style="background-color: ${item.color}"
							>
								<span>${item.label}
							</span>`;
		},*/

		createRequisition() {
			this.dialogSettings = {
				show: true,
				title: 'Create Requisition',
				componentPath: 'ItemForm'
			};
		},

		handleUnapprove({ row }) {
			this.confirmHelper({
				message: 'Unapprove this order?'
			})
				.then(() => {
					this.unapprove_item({ itemId: row.id })
						.then(() => {
							this.refetchItemsList();
						})
						.catch(() => {});
				})
				.catch(() => {});
		},

		handleHoldOn({ row }) {
			this.confirmHelper({
				message: `${row.is_on_hold ? 'Disable On Hold' : 'Hold On'} this order?`
			})
				.then(() => {
					const payload = {
						itemId: row.id,
						data: {
							enable: row.is_on_hold ? false : true
						}
					};
					this.hold_on_item(payload)
						.then(() => {
							this.refetchItemsList();
						})
						.catch(() => {});
				})
				.catch(() => {});
		},

		handleRadioFilters(value) {
			let filters = {};
			if (value === REQUISITION_STATUSES_TYPES.ON_HOLD) {
				filters = { status: null, onHold: true };
			} else {
				filters = { status: value, onHold: null };
			}
			this.setFilters(filters);
		},

		successModalSubmit() {
			this.refetchItemsList();
			this.dialogSettings = {};
		},

		handleGotoDetails({ row }) {
			this.changeRoute({
				path: `/requisitions/${row.id}`
			});
		},

		closeDialog() {
			this.dialogSettings = {};
		},

		handleExportToExel() {
			this.handleExportItem({
				url: 'excel/export',
				filters: {
					...this.globalFilters,
					...this.filters,
					daterange: this.export_daterange
				}
			});
		}

		/*localBeforeMount() {
			this.preventFetch = true;
			this.setFilters({
				orderByColumn: 'created_at',
				orderByMethod: 'desc'
			});
		},*/

		/*localBeforeMount() {
			if (this.authUser.type !== USER_TYPES.CORPORATE) {
				this.preventFetch = true;
				this.setFilters({ status: null });
			}
		},*/
	}
};
</script>
