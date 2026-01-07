<template>
	<div class="view-wrapper view-list-wrapper work-orders-list">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div class="card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:perPageItems="perPageItems"
						:hideDelete="!$hasAccessTo(['delete_work_order_requests'])"
						:hideCreate="!$hasAccessTo(['create_work_order_requests'])"
					/>
					<!-- :actionButtons="actionButtons" -->

					<!-- class="maintenance-table" -->
					<CustomDataListTable
						alwaysShowOperations
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:disableSelection="!$hasAccessTo(['delete_work_order_requests'])"
						:itemsLoading="itemsLoading || productionLinesLoading"
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
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	navigation,
	requestsListMixin,
	actionButtonsMixin
} from '@/mixins';
import { MAINTENANCE_TYPES, maintenanceTypesList } from '@/constants/global';
import { findItemBy /*cloneDeep*/ } from '@/helpers';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		navigation(),
		requestsListMixin(),
		actionButtonsMixin()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	props: {
		perPageItems: Array
	},

	data: () => ({
		// usersList: [],
		// usersLoading: false,
		productionLinesLoading: false,
		productionLinesList: []
	}),

	computed: {
		...mapState({
			filters: state => state.maintenance.filters_requests,
			callMethodGlobal: state => state.global.callMethod
			// authUser: state => state.auth.authUser,
		}),

		// USER_TYPES: () => Object.freeze(USER_TYPES),

		editInModal: () => true,
		// instanceName: () => 'WorkOrder',

		localModalSettings: that =>
			Object.freeze({
				editModalProp: 'editModalClassic',
				/*formSettings: {
					type: that.propsFilters.type
				},*/
				instanceName: 'WorkOrderRequests',
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer small-header small-footer',
				additionalModalSettings: {
					plantId: that.globalFilters.plantId
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

		itemsName() {
			const type = MAINTENANCE_TYPES.REQUEST;
			const item = findItemBy('id', type, maintenanceTypesList());
			return {
				one: item.label,
				mult: `${item.label}s`,
				instanceName: 'maintenance'
			};
		},

		predefinedFilters: that =>
			Object.freeze({
				type: MAINTENANCE_TYPES.REQUEST,
				plantId: that.globalFilters.plantId
			}),

		requestsToDoList() {
			return Object.freeze([
				/*{
					action: 'fetch_users',
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				},*/
				{
					action: 'fetch_production_lines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				}
			]);
		},

		tableSettings() {
			let settings = {
				columns: this.$translate([
					{
						label: 'WO_Request',
						label_postfix: ' #',
						prop: 'serial_number',
						width: 130
					},
					{
						label: 'Name',
						prop: 'title',
						sortable: true
					},

					{
						label: 'Submitted',
						prop: 'creator.full_name'
					},
					{
						label: 'Production_Line',
						prop: 'production_line_id',
						sortable: true,
						meta: {
							sortBy: 'production_line_name',
							getItemValue: { prop: 'name', list: this.productionLinesList }
						}
					},
					{
						label: 'Machine',
						prop: 'machine.name',
						sortable: true,
						meta: {
							sortBy: 'machine_name'
						}
					},
					{
						label: 'Asset',
						prop: 'asset.name',
						sortable: true,
						meta: {
							sortBy: 'asset_name'
						}
					}
				]),
				operations: {
					actions: [
						{
							name: 'handleShowDetails',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: 'Details'
						}
					]
				}
			};

			if (this.$hasAccessTo(['edit_work_order_requests'])) {
				settings.operations.width = 220;
				settings.operations.actions.push(
					{
						name: 'convertItem',
						type: 'success',
						disablePopover: true,
						button_text: 'CONVERT',
						className: 'width-auto'
					},
					{
						name: 'rejectItem',
						type: 'danger',
						disablePopover: true,
						button_text: 'REJECT',
						className: 'width-auto'
					},
					{
						name: 'editItem',
						type: 'success',
						icon: 'icomoon icon-pencil',
						tooltip_text: 'Edit'
					}
				);
			}

			if (this.$hasAccessTo(['delete_work_order_requests'])) {
				settings.operations.actions.push(standardTableOperations.delete);
			}
			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'button_text'
			});
			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'tooltip_text'
			});

			return Object.freeze(settings);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'maintenance/fetch_maintenance_logs',
			fetch_users: 'users/fetch_users',
			fetch_production_lines: 'production_lines/fetch_production_lines',

			delete_item: 'maintenance/delete_maintenance_log',
			convert_item: 'maintenance/convert_maintenance_request',
			reject_item: 'maintenance/reject_maintenance_request',

			show_edit_modal: 'show_edit_modal',

			set_filters: 'maintenance/set_maintenance_requests_filters'
		}),

		handleShowDetails({ row }) {
			// console.log(data)
			// const { isMaintenanceLog, isWorkOrder, propsFilters } = this;
			let settings = {
				row: row,
				modal_settings: {
					title: this.tt(`phrases.see_work_order_request`),
					hideSubmitButtons: true,
					hideFooter: true,
					settings: {
						showJustInfo: true
					},
					itemName: `${this.tt('Work Order')} ${this.tt('Request')}`,
					headerActions: []
				}
			};

			if (row.parent_id) {
				settings.modal_settings.settings.parentOrderData = row.parent;
			}

			if (this.$hasAccessTo(['edit_work_order_requests'])) {
				settings.modal_settings.hideFooter = false;
				settings.modal_settings.headerActions.push({
					name: 'editItem',
					type: 'transparent',
					icon: 'icomoon icon-pencil',
					tooltip_text: this.tt('Edit')
				});

				settings.modal_settings.footerActions = [
					{
						name: 'convertItem',
						button_text: this.tt('CONVERT'),
						disablePopover: true,
						type: 'primary',
						className: 'item-action-button'
					},
					{
						name: 'rejectItem',
						button_text: this.tt('REJECT'),
						disablePopover: true,
						className: 'item-action-button'
					}
				];
			}
			// console.log('1', settings)
			this.editItem(settings);
		},

		convertItem({ row }) {
			const { tt } = this;
			const payload = {
				row: row,
				modal_settings: {
					title: `${tt('Convert')} ${tt('Work_Order')} ${tt('Request')}`,
					instanceName: null,
					componentPath: 'WorkOrderRequests/ConvertForm',
					hideSubmitButtons: true,
					footerActions: [
						{
							name: 'validateForm',
							button_text: tt('CONVERT'),
							disablePopover: true,
							type: 'primary'
						}
					]
				}
			};

			this.editItem(payload);
		},

		rejectItem({ row }) {
			this.confirmHelper({
				message: `${this.tt('phrases.reject_this_work_order_request')}?`
			})
				.then(() => {
					this.reject_item({ itemId: row.id }).then(() => {
						this.refetchItemsList();
					});
				})
				.catch(() => {});
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
