<template>
	<div class="work-order-details">
		<WorkOrderReportForPrint :orderData="itemData" />

		<RequisitionForm
			v-if="
				(orderStatus.isPending || itemData.can_change_requisition) && isRequestor
			"
			@event="handleEvent"
			:progress="1"
			:title="`${tt('Requisition')} ${tt('Plant')} ${tt('Details')}`"
			:itemData="itemData"
		/>

		<DetailsItem
			v-else
			@event="handleEvent"
			:progress="1"
			:title="`${tt('Requisition')} ${tt('Plant')} ${tt('Details')}`"
			:orderData="itemData"
			:settings="settingsStep1"
			:actionButtons="actionButtons1"
			:headerButtons="headerButtons1"
		/>

		<!-- v-if="orderStatus.isApproved && !orderStatus.isCompleted && isFabricator" -->
		<ApproveForm
			v-if="
				orderStatus.isApproved || orderStatus.isInWork || orderStatus.isCompleted
			"
			:showJustInfo="!isFabricator /*|| orderStatus.isCompleted*/"
			@event="handleEvent"
			:progress="2"
			:title="`${tt('Fab')} ${tt('Plant')} ${tt('Details')}`"
			:itemData="itemData"
			:actionButtons="actionButtons2"
			:isConcluded="orderStatus.isConcluded"
			:isCompleted="orderStatus.isCompleted"
			:isFabManager="isFabManager"
		/>

		<!-- <DetailsItem v-else-if="orderStatus.isApproved || orderStatus.isInWork || orderStatus.isCompleted"
			@event="handleEvent"
			:progress="2"
			title="Fab Plant Details"
			:orderData="itemData"
			:settings="settingsStep2"
			:actionButtons="actionButtons2"
		/> -->

		<DetailsItem
			v-if="orderStatus.isDenied"
			@event="handleEvent"
			:progress="2"
			:title="`${tt('Fab')} ${tt('Plant')} ${tt('Details')}`"
			:orderData="itemData"
			:settings="settingsStepDenied"
			:headerButtons="headerButtons2Denied"
		/>

		<!-- <ShippingForm v-if="isRequestor && (orderStatus.isApproved || orderStatus.isInWork) && !orderStatus.isCompleted"
			@event="handleEvent"
			:progress="3"
			title="Shipping Details"
			:itemData="itemData"
		/> -->

		<DetailsItem
			v-if="orderStatus.isConcluded && itemData.shipping_tracking"
			@event="handleEvent"
			:progress="3"
			:title="`${tt('Shipping')} ${tt('Details')}`"
			:orderData="itemData"
			:settings="settingsStep3"
		/>

		<CompleteFormContainer
			v-if="
				orderStatus.isApproved || orderStatus.isInWork || orderStatus.isCompleted
			"
			@event="handleEventNew"
			:progress="4"
			:title="`${tt('Technician')}/${tt('constants.Plant_User')} ${tt('Details')}`"
			:itemData="itemData"
			:orderStatus="orderStatus"
			:isFabManager="isFabManager"
			:technicalProcesses="itemData.technicalProcesses"
		/>
		<!-- :isConcluded="orderStatus.isConcluded || true" -->

		<!-- v-else-if="orderStatus.isInWork || orderStatus.isCompleted" -->
		<!-- <DetailsItem
			@event="handleEvent"
			:progress="4"
			title="Technician/Plant User Details"
			:orderData="itemData"
			:settings="settingsStep4"
		/> -->

		<el-dialog
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="dialogSettings.title"
			:visible.sync="dialogSettings.show"
		>
			<component
				fromModal
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
import { mapActions, mapState } from 'vuex';

import {
	REQUISITION_STATUSES_TYPES,
	requisitionCategoriesList,
	requisitionWorkTypesList,
	siteVisitOptionsList
} from '@/constants/global';
import { cleanDateString, formatTime } from '@/helpers';

// import { required } from '@/constants/validation';
import { eventHandler, actionButtonsMixin } from '@/mixins';

export default {
	mixins: [eventHandler(), actionButtonsMixin()],
	components: {
		DetailsItem: () => import('./Details/DetailsItem.vue'),
		CompleteFormContainer: () => import('./Details/CompleteFormContainer.vue'),
		ApproveForm: () => import('./Details/ApproveForm.vue'),
		ShippingForm: () => import('./Details/ShippingForm.vue'),
		RequisitionForm: () => import('./ItemForm.vue'),
		WorkOrderReportForPrint: () => import('./Details/WorkOrderReportForPrint.vue')
	},
	props: {
		itemData: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			// plantsList: [],
			// plantsLoading: false,
			dialogSettings: {}
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser
		}),

		/*requestsToDoList: () => Object.freeze([
			{
				action: 'fetch_plants',
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}
		]),*/

		// fabPlantsList: that => that.plantsList.filter(pi => pi.work_order_role === PLANT_WORK_ORDER_TYPES.FABRICATION),

		isFabManager() {
			const { role } = this.authUser;
			return role && role.is_fab_shop_manager;
		},
		isRequisitionerUser() {
			const { role } = this.authUser;
			return role && role.is_requisitioner;
		},

		componentFile() {
			if (this.dialogSettings.show) {
				return () => import(`./Details/${this.dialogSettings.componentPath}.vue`);
			}
			return null;
		},

		/*isPending: that => that.itemData.status === REQUISITION_STATUSES_TYPES.PENDING,
		isApproved: that => that.itemData.status === REQUISITION_STATUSES_TYPES.APPROVED,
		isDenied: that => that.itemData.status === REQUISITION_STATUSES_TYPES.DENIED,
		isCompleted: that => that.itemData.status === REQUISITION_STATUSES_TYPES.COMPLETED,*/
		// isConcluded: that => that.itemData.shipping_receive_date && that.itemData.status === REQUISITION_STATUSES_TYPES.APPROVED,
		// isProccessed: that => that.itemData.execution_start_time,

		isTechnician: that => that.authUser.id === that.itemData.technical_executor_id,
		isRequestor: that => that.authUser.id === that.itemData.requisition_user_id,
		isFabricator: that => that.authUser.id === that.itemData.fabrication_user_id,

		orderStatus() {
			const { itemData } = this;

			return Object.freeze({
				isPending: itemData.status === REQUISITION_STATUSES_TYPES.PENDING,
				isApproved: itemData.status === REQUISITION_STATUSES_TYPES.APPROVED,
				isDenied: itemData.status === REQUISITION_STATUSES_TYPES.DENIED,
				isCompleted: itemData.status === REQUISITION_STATUSES_TYPES.COMPLETED,
				isConcluded: itemData.is_concluded,
				isInWork: itemData.status === REQUISITION_STATUSES_TYPES.IN_WORK
			});
		},

		settingsStep1: that =>
			Object.freeze(
				that.$translate([
					/*{ id: 1, label: 'Date Sent', prop: 'created_at',
				meta: {	prepareValue: { localMethod: 'cleanDateString' }	}
			},*/
					{
						id: 2,
						label: 'Requested_Completion',
						prop: 'complete_at',
						meta: { prepareValue: { localMethod: cleanDateString } }
					},
					// { id: 3, label: 'Plant Name', prop: 'requisitionPlant.name', },
					{ id: 4, label: 'Requestor', prop: 'requisitionUser.full_name' },
					{ id: 42, label: 'Requestor_Plant', prop: 'requisitionPlant.name' },
					{
						id: 5,
						label: 'Category',
						prop: 'category',
						meta: {
							getItemValue: { prop: 'name', list: requisitionCategoriesList() }
						}
					},
					{
						id: 15,
						label: 'Work_Type',
						prop: 'work_type',
						meta: {
							getItemValue: { prop: 'name', list: requisitionWorkTypesList() }
						}
					},
					{ id: 16, label: 'Equipment_Details', prop: 'equipment_details' },
					{
						id: 17,
						label: 'phrases.site_visit_required',
						prop: 'site_visit',
						meta: {
							getItemValue: { prop: 'name', list: siteVisitOptionsList }
						}
					},
					{ id: 6, label: 'Budget', prop: 'proposed_cost', prefix: '$' },
					{ id: 7, label: 'Details', prop: 'requisition_details' },
					/*{ id: 7, label: 'Status', prop: 'status',
				 meta: { prepareValue: { method: 'getRequisitionStatus' }	}
			},*/
					{
						id: 8,
						label: 'Attachments',
						prop: 'newOrderAttachments',
						buttonSettings: { action: 'downloadFile', className: 'link underline' },
						meta: { isAttachment: true }
					}
				])
			),

		settingsStep2: that =>
			Object.freeze(
				that.$translate([
					{ id: 1, label: 'Work_Station', prop: 'workStation.name' },
					{ id: 2, label: 'Technician', prop: 'technicalExecutor.full_name' },
					{
						id: 3,
						label: 'Hours',
						prop: 'actual_time',
						meta: { prepareValue: { localMethod: formatTime, args: 'h:m' } }
					},
					{
						id: 4,
						label: 'phrases.additional_work_order_details',
						prop: 'fab_shop_manager_notes'
					},
					{ id: 5, label: 'Price', prop: 'execution_cost' }
				])
			),
		settingsStepDenied: that =>
			Object.freeze(
				that.$translate([
					{ id: 3, label: 'Plant_Name', prop: 'fabricationPlant.name' },
					{ id: 4, label: 'phrases.Reject_Reason', prop: 'rejection_reason_details' }
				])
			),
		settingsStep3: that =>
			Object.freeze(
				that.$translate([
					// { id: 1, label: 'Name', prop: 'requisitionUser.full_name', },
					{ id: 2, label: 'phrases.Shipping_Method', prop: 'shipping_method' },
					{ id: 3, label: 'Tracking', postfix: ' #', prop: 'shipping_tracking' },
					{
						id: 4,
						label: 'phrases.Expected Receive Date',
						prop: 'shipping_receive_date'
					}
				])
			),
		/*settingsStep4: () =>
			Object.freeze([
				// { id: 1, label: 'Start Time', prop: 'execution_start_time', },
				// { id: 2, label: 'End Time', prop: 'execution_finish_time' },
				{
					id: 1,
					label: 'Execution Times',
					prop: 'executionTimes',
					meta: {
						isArray: [
							{ id: 11, label: 'Date', prop: 'date' },
							{ id: 12, label: 'Time', prop: 'time' }
						]
					}
				},
				{ id: 3, label: 'Total Time', prop: 'execution_total_time' },
				{
					id: 4,
					label: 'Attachments',
					prop: 'completedAttachments',
					buttonSettings: { action: 'downloadFile', className: 'link underline' },
					meta: { isAttachment: true }
				},
				{ id: 5, label: 'Work Order Report', prop: 'execution_report_details' }
			]),*/

		actionButtons1() {
			if (
				this.orderStatus.isPending /*|| this.orderStatus.isApproved*/ &&
				this.isFabManager
			) {
				return Object.freeze(
					this.$translate(
						[
							{
								id: 1,
								text: 'Deny',
								className: 'inverted',
								event: 'handleDetailsAction',
								args: { title: 'Deny', componentPath: 'DenyForm' }
							},
							{
								id: 2,
								text: 'Approve',
								event: 'handleDetailsAction',
								args: { title: 'Approve', componentPath: 'ApproveForm' }
							}
						],
						{ key: 'text' }
					)
				);
			}
			return [];
		},
		actionButtons2() {
			/*if (
				this.orderStatus.isApproved &&
				this.isRequisitionerUser &&
				!this.orderStatus.isConcluded
			) {
				return Object.freeze([
					// {	id: 1, text: 'Cancel', event: 'cancelApprove',	className: 'inverted'	},
					{
						id: 2,
						text: 'Confirm',
						event: 'handleDetailsAction',
						args: { title: 'Shipping Details', componentPath: 'ShippingForm' }
					}
				]);
			}*/
			return [];
		},
		headerButtons1() {
			const { isApproved, isInWork } = this.orderStatus;
			const { isFabManager, itemData, tt } = this;
			let buttons = [];

			if (isFabManager && (isApproved || isInWork)) {
				buttons.push({
					id: 1,
					text: tt('DENY'),
					event: 'handleDetailsAction',
					args: { title: 'Deny', componentPath: 'DenyForm' }
				});

				if (!itemData.can_change_requisition) {
					buttons.push({
						id: 2,
						text: tt('UNLOCK'),
						event: 'handleUnapprove',
						icon: 'icomoon icon-unlock'
					});
				}
			}
			return Object.freeze(buttons);
		},

		headerButtons2Denied() {
			const { isDenied } = this.orderStatus;
			const { isFabManager, tt } = this;
			let buttons = [];

			if (isFabManager && isDenied) {
				buttons.push({
					id: 1,
					text: tt('RESET'),
					event: 'handleReset'
				});
			}
			return Object.freeze(buttons);
		}
	},

	methods: {
		...mapActions({
			save_item: 'plant_requisitions/save_requisition',
			unapprove_item: 'plant_requisitions/unapprove_requisition',
			reset_requisition: 'plant_requisitions/reset_requisition',
			conclude_requisition: 'plant_requisitions/conclude_requisition',
			take_requisition: 'plant_requisitions/take_requisition',
			delete_requisition: 'plant_requisitions/delete_requisition'
			// fetch_plants: 'plants/fetch_plants',
		}),

		successModalSubmit() {
			this.reloadPage();
		},

		reloadPage() {
			this.$emit('event', 'fetchPageData', this.itemData.id);
		},

		handleDetailsAction({ title, componentPath }) {
			const dialogSettings = {
				show: true,
				title: title,
				componentPath: componentPath
			};

			if (componentPath == 'ShippingForm') {
				this.confirmHelper({
					message: `${this.tt('phrases.do_you_want_to_specify_shipping_details')}?`,
					cancelButtonText: this.tt('No')
				})
					.then(() => {
						this.dialogSettings = dialogSettings;
					})
					.catch(() => {
						this.conclude_requisition({
							itemId: this.itemData.id
						})
							.then(() => {
								this.reloadPage();
							})
							.catch(() => {});
					});
			} else {
				this.dialogSettings = dialogSettings;
			}
		},

		handleTakeInWork() {
			this.confirmHelper({
				// message: 'Start this Work Order?'
				message: `${this.tt('Start')} ${this.tt('phrases.this_order')}?`
			})
				.then(() => {
					this.take_requisition({ itemId: this.itemData.id })
						.then(() => {
							this.reloadPage();
						})
						.catch(() => {});
				})
				.catch(() => {});
		},

		handleUnapprove() {
			this.confirmHelper({
				message: `${this.tt('Unapprove')} ${this.tt('phrases.this_order')}?`
			})
				.then(() => {
					this.unapprove_item({ itemId: this.itemData.id })
						.then(() => {
							this.reloadPage();
						})
						.catch(() => {});
				})
				.catch(() => {});
		},

		handleReset() {
			this.confirmHelper({
				message: `${this.tt('reset')} ${this.tt('phrases.this_order')}?`
			})
				.then(() => {
					this.reset_requisition({ itemId: this.itemData.id })
						.then(() => {
							this.reloadPage();
						})
						.catch(() => {});
				})
				.catch(() => {});
		},

		handleDeleteRequisition(id) {
			const { tt } = this;
			this.confirmHelper({
				message: `${tt('phrases.Do_you_really_want_to')} ${tt(
					'phrases.delete_this_requisition'
				)}?`,
				cancelButtonText: tt('No')
			})
				.then(() => {
					this.delete_requisition({ ids: [id] }).then(() => {
						this.changeRoute({ path: '/requisitions' });
					});
				})
				.catch(() => {});
		}
	}
};
</script>
