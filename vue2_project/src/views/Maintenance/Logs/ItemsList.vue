<template>
	<div class="view-wrapper view-list-wrapper work-orders-list">
		<!-- <div class="mcontainer"> -->
		<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
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
					<div class="ml-auto filter-item">
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
							:value="filters.machineId"
							@change="id => setFilters({ machineId: id })"
						/>
					</div>

					<div class="filter-item" v-if="!hideDatepicker">
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
				</Filterbar>

				<CustomDataListTable
					alwaysShowOperations
					ref="ItemsTableContainer"
					@event="handleEventNew"
					:disableSelection="!$hasAccessTo(['delete_maintenance'])"
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
					scrollTo=".work-orders-list"
				/>
			</div>
		</div>
		<!-- </div> -->

		<!-- <ImagePreviewModal
			hideTitle
			showProgressBar
			@closeModal="closePreviewModal"
			:imgDialogOpen="imgPreviewOpen"
			:imgId.sync="currentImageId"
			:pictures="imagesList"
		/> -->
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	exportListToFileMixin,
	navigation,
	actionButtonsMixin,
	requestsListMixin
} from '@/mixins';
import {
	MAINTENANCE_TYPES,
	maintenanceTypesList,
	pdf_icon,
	images_icon,
	maintenanceReasonTypesList
} from '@/constants/global';
import { findItemBy, cleanDateString, convertMsToHours } from '@/helpers';
import { standardTableOperations } from '@/constants/table';
import { setupTrueFalseCellIcon } from '@/helpers/specialHelpers';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		exportListToFileMixin(),
		navigation(),
		actionButtonsMixin(),
		requestsListMixin()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		// ImagePreviewModal: () => import('@/components/common/ImagePreviewModal.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		perPageItems: Array,
		hideDatepicker: Boolean
	},

	data: () => ({
		imgPreviewOpen: false,
		imagesList: [],
		currentImageId: null,
		productionLinesList: [],
		productionLinesLoading: false,
		machinesList: [],
		machinesLoading: false
	}),

	computed: {
		...mapState({
			filters: state => state.maintenance.filters,
			authUser: state => state.auth.authUser,
			isCustomer: state => state.auth.isCustomer,
			callMethodGlobal: state => state.global.callMethod,
			access_token: state => state.auth.access_token
		}),

		editInModal: () => true,
		instanceName: () => 'Maintenance',

		filterbarActionButtons() {
			let buttons = [];

			if (this.$hasAccessTo(['create_maintenance'])) {
				buttons.push(
					{
						id: 1,
						text: 'Add',
						event: 'createItemCheckPlant'
					}
					/*{
						id: 3,
						text: 'Complete',
						event: 'handleCompleteItems',
						icon: 'icon-check',
						type: 'primary inverted'
					},*/
				);
			}

			if (this.$hasAccessTo(['delete_maintenance'])) {
				buttons.push({
					id: 2,
					text: 'Delete',
					event: 'handleDeleteItems',
					isDelete: true
				});
			}

			return Object.freeze(this.$translate(buttons, { key: 'text' }));
		},

		localModalSettings: that =>
			Object.freeze({
				editModalProp: 'editModalClassic',
				/*formSettings: {
					type: that.propsFilters.type
				},*/
				// instanceName: '',
				componentPath: 'Maintenance/MaintenanceFormWrapper',
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer small-header small-footer',
				additionalModalSettings: {
					switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG },
					plantId: that.globalFilters.plantId,
					...that.propsFilters
				},
				callback: () => {
					that.fetchItems({ ...that.filters, ...that.globalFilters });
					that.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
				}
			}),

		/*navbarSettings() {
			return {
				pageTitle: 'Maintenance Logs',
				showFilter: true
			};
		},*/
		predefinedFilters: () =>
			Object.freeze({
				orderByColumn: 'created_at',
				orderByMethod: 'desc'
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

		tableSettings() {
			let settings = {
				tableClass: 'maintenanceLogsTable',
				columns: this.$translate([
					{
						prop: 'id',
						label: 'Id',
						// sortable: true,
						width: 70
					},
					{
						prop: 'created_at',
						min_width: 100,
						max_width: 155,
						label: 'Date',
						sortable: true,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					/*{
						label: 'Status',
						prop: 'status',
						width: 120,
						meta: {
							prepareValue: { method: 'getWOStatus' },
						}
					},*/
					{ prop: 'machine.name', label: 'Machine', min_width: 100, max_width: 220 },

					{
						prop: 'creator.full_name',
						label: 'Creator',
						min_width: 110,
						max_width: 120
					},

					{
						prop: 'description',
						label: 'Log',
						min_width: 300,
						max_width: 350,
						meta: {
							// cell_class: 'ellipsis',
							cellComponent: {
								componentPath: 'views/Maintenance/Logs/DescriptionTableCell'
							}
							/*prepareValue: {
								method: 'ellipsisString', args: ['.maintenanceLogsTable tr.el-table__row', 2, 4]
							}*/
						}
					},
					{ label: 'Shift', prop: 'shift', max_width: 60 },
					{
						label: 'Reason',
						prop: 'reason_type',
						min_width: 90,
						max_width: 90,
						meta: {
							getItemValue: { prop: 'name', list: maintenanceReasonTypesList() }
						}
					},
					{
						label: 'Time',
						prop: ' ',
						min_width: 105,
						max_width: 105,
						meta: {
							cell_class: 'text-center',
							prepareValue: {
								localMethod: this.setupTotalTime,
								useAllInstanceData: true
							}
						}
					},
					{
						prop: 'is_problem_solved',
						label: 'Solved',
						width: 85,
						meta: {
							cell_class: 'text-center',
							prepareValue: {
								localMethod: setupTrueFalseCellIcon
							}
						}
					},
					{
						prop: 'is_acknowledge_by_supervisor',
						label: 'phrases.Acknowledge_by_supervisor',
						width: 120,
						meta: {
							cell_class: 'text-center',
							prepareValue: {
								localMethod: setupTrueFalseCellIcon
							}
						}
					},
					{
						prop: 'supervisor_notes',
						label: 'phrases.Supervisor_notes',
						min_width: 200,
						max_width: 260,
						meta: {
							cellComponent: {
								componentPath: 'views/Maintenance/Logs/DescriptionTableCell'
							}
						}
					},
					{
						label: 'Files',
						min_width: 110,
						max_width: 120,
						conditionSettings: {
							checkMethod: 'some',
							conditions: [
								{ prop: 'images', method: 'notEmpty' },
								{ prop: 'attachments', method: 'notEmpty' }
							]
						},
						meta: {
							additionalActions: [
								{
									name: 'togglePreviewModal',
									type: 'transparent',
									img: images_icon,
									className: 'borderless button-with-img',
									disablePopover: true,
									buttonContent: {
										component: {
											componentPath: 'views/Maintenance/Logs/fileButtonContent'
										}
									},
									conditionSettings: {
										conditions: [
											{ prop: 'images', method: 'notEmpty' }
											// { prop: 'attachments', method: 'notEmpty' }
										]
									}
								},
								{
									name: 'openFile',
									type: 'transparent',
									img: pdf_icon,
									className: 'borderless button-with-img',
									tooltip_text: ' ',
									tool_tip_class: 'files-list-popover',
									buttonContent: {
										component: {
											componentPath: 'views/Maintenance/Logs/fileButtonContent'
										}
									},
									popoverContent: {
										component: {
											componentPath: 'views/Maintenance/Logs/filePopoverContent'
										}
									},
									conditionSettings: {
										conditions: [{ prop: 'attachments', method: 'notEmpty' }]
									}
								}
							],
							emptyText: ' '
							// eventName: 'handleNewConfig'
						}
					},
					{
						label: 'Work_Order',
						// prop: 'parent.serial_number',
						max_width: 70,
						meta: {
							additionalActionsClassName: 'column',
							additionalActions: [
								{
									name: 'handleShowParentWO',
									className: 'vertical-fluid link underline info-color',
									disablePopover: true,
									conditionSettings: {
										conditions: [{ prop: 'parent', method: 'notEmpty' }]
									},
									buttonContent: {
										component: {
											componentPath: 'views/Maintenance/WorkOrders/WOButtonContent'
										}
									}
								}
							]
						}
					}
				]),
				operations: {
					// columnWidth: '177',
					actions: [
						/*{
							name: 'exportLog',
							type: 'success',
							popoverPlacement: 'top',
							icon: 'icomoon icon-pdf',
							tooltip_text: 'Export to PDF'
						},*/
						{
							name: 'handleShowDetails',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: 'Details'
						}
					]

					/*actions_second_row: [
						{
							name: 'handleShowDetails',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: 'Details'
						}
					]*/
				}
			};

			if (this.$hasAccessTo(['delete_maintenance'])) {
				settings.operations.actions.push({
					...standardTableOperations.delete,
					popoverPlacement: 'top'
				});
			}

			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'tooltip_text'
			});
			return Object.freeze(settings);
		},

		requestsToDoList() {
			return Object.freeze([
				{
					action: 'fetch_production_lines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', fetchAnyWay: true }
					],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_machines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', fetchAnyWay: false },
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId',
							fetchAnyWay: false
						}
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				}
			]);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'maintenance/fetch_maintenance_logs',
			complete_work_orders: 'maintenance/complete_work_orders',
			export_maintenance_log_to_excel: 'maintenance/export_maintenance_log_to_excel',

			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_machines: 'machines/fetch_machines',

			delete_item: 'maintenance/delete_maintenance_log',
			show_edit_modal: 'show_edit_modal',

			set_filters: 'maintenance/set_maintenance_logs_filters'
		}),

		createItemCheckPlant() {
			if (this.globalFilters.plantId) {
				this.createItem();
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.creation_is_not_allowed'),
					message: this.$t(`phrases.Select_plant_first`)
				});
			}
		},

		handleCompleteItems() {
			const { tt } = this;
			this.handleDeleteItems(null, {
				confirmButtonText: tt('Complete'),
				confirmMessage: `${tt(
					'phrases.this_will_complete_selected_workOrders'
				)}. ${tt('Continue')}?`,
				methodName: 'completeItems'
			});
		},

		completeItems(data) {
			// console.log(ids)
			this.complete_work_orders({ data: data }).then(() => {
				this.refetchItemsList();
			});
		},

		handleShowDetails({ row }) {
			// console.log(data)
			let settings = {
				row: row,
				modal_settings: {
					title: this.tt('phrases.Maintenance_Log_Details'),
					componentPath: 'Maintenance/Logs/ItemDetailsPreview',
					hideSubmitButtons: true,
					settings: {
						// maintenanceType: MAINTENANCE_TYPES.LOG,
						// showJustInfo: true
					},
					additionalModalSettings: {
						productionLinesList: this.productionLinesList,
						maintenanceReasonTypesList: maintenanceReasonTypesList()
					},
					headerActions: [
						{
							name: 'exportLog',
							// className: 'borderless',
							type: 'transparent',
							icon: 'icomoon icon-pdf',
							tooltip_text: 'phrases.Export_To_PDF'
						}
					],
					footerActions: [],
					itemName: 'Maintenance Log'
				}
			};

			/*if (
				this.isCustomer && this.$hasAccessTo(['edit_maintenance'])
				// this.authUser.type === USER_TYPES.PLANT_SUPERINTENDENT
			) {
				settings.modal_settings.headerActions.push({
					name: 'editItem',
					icon: 'icomoon icon-pencil',
					tooltip_text: 'Edit',
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
			} else */
			if (this.$hasAccessTo(['edit_maintenance'])) {
				settings.modal_settings.headerActions.push({
					...standardTableOperations.edit,
					type: 'transparent'
				});
			}

			if (this.$hasAccessTo(['create_maintenance', 'edit_maintenance'])) {
				settings.modal_settings.footerActions.push({
					name: 'handleCreateRequest',
					button_text: this.tt('phrases.CREATE_WORK_ORDER_REQUEST'),
					disablePopover: true,
					type: 'primary',
					className: 'item-action-button',
					parentLog: row
				});
			}

			settings.modal_settings.headerActions = this.$translate(
				settings.modal_settings.headerActions,
				{ key: 'tooltip_text' }
			);
			/*if (row.parent_id) {
				settings.modal_settings.settings.parentOrderData = row.parent;					
			}*/

			// console.log(settings.modal_settings.headerActions, this.$hasAccessTo(['edit_maintenance']))

			// console.log('1', settings)
			this.editItem(settings);
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

		togglePreviewModal({ row }) {
			const { images } = row;

			this.$emit('event', {
				eventName: 'togglePreviewModal',
				data: {
					pictureId: images[0].id,
					picturesList: images
				},
				onward: true
			});
		},

		exportLog({ row }) {
			this.handleExportItem({
				url: `maintenance/export/pdf`,
				filters: { ...this.filters, ids: row.id }
			});
		},

		handleExportToExcel() {
			const { daterange } = this.filters;
			let payload = {
				params: this.prepareFilters({
					...this.filters,
					plantId: this.globalFilters.plantId
				})
			};

			if (!daterange || !daterange.length) {
				this.$notify({
					type: 'warning',
					// title: "",
					message: this.tt('phrases.select_date_range_first')
				});
				return;
			}

			/*if (payload) {
				console.log(payload)
				return
			}*/

			this.export_maintenance_log_to_excel(payload);
		},

		handleShowParentWO({ row }) {
			let settings = {
				row: row.parent,
				modal_settings: {
					componentPath: 'Maintenance/WorkOrders/ItemDetailsPreview',
					title: this.tt('phrases.Work_Order_Details'),
					hideFooter: true,
					hideSubmitButtons: true,
					additionalModalSettings: {
						productionLinesList: this.productionLinesList
					},
					itemName: this.tt('Work_Order'),
					headerActions: [
						{
							name: 'handlePrintWO',
							// className: 'borderless',
							type: 'transparent',
							icon: 'icomoon icon-printer',
							tooltip_text: 'Print'
						}
					],
					footerActions: []
				}
			};

			if (this.$hasAccessTo(['edit_maintenance'])) {
				settings.modal_settings.headerActions.push({
					name: 'editWOFromLogsList',

					// type: 'success',
					icon: 'icomoon icon-pencil',
					tooltip_text: 'Edit',
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

			if (row.parent.is_closed && this.$hasAccessTo(['delete_maintenance'])) {
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

			settings.modal_settings.headerActions = this.$translate(
				settings.modal_settings.headerActions,
				{ key: 'tooltip_text' }
			);

			// console.log('1', settings)
			this.editItem(settings);
		},

		editWOFromLogsList(payload) {
			this.editItem({
				...payload,
				modal_settings: {
					title: this.tt('phrases.Edit_Work_Order'),
					itemName: this.tt('Work_Order'),
					additionalModalSettings: {
						switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER }
					}
				}
			});
		},

		setupTotalTime({ total_time, start_time, finish_time }) {
			try {
				if (start_time && finish_time) {
					return `${start_time} - ${finish_time}`;
				} else if (total_time) {
					const { total_hours, total_mins } = convertMsToHours(total_time * 1000);
					return `${total_hours} hr </br> ${total_mins} minutes`;
				}
			} catch (error) {
				console.error(error);
			}
			return '-';
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
	}
};
</script>
