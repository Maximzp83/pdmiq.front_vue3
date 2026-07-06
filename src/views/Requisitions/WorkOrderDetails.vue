<template>
	<div class="work-order-details">
		<WorkOrderReportForPrint :orderData="itemData" />

		<ItemForm
			v-if="(orderStatus.isPending || itemData.can_change_requisition) && isRequestor"
			:itemData="itemData"
			:progress="1"
			:title="`${tt('Requisition')} ${tt('Plant')} ${tt('Details')}`"
			@event="handleEvent"
		/>

		<DetailsItem
			v-else
			:progress="1"
			:title="`${tt('Requisition')} ${tt('Plant')} ${tt('Details')}`"
			:orderData="itemData"
			:settings="settingsStep1"
			:actionButtons="actionButtons1"
			:headerButtons="headerButtons1"
			@event="handleEvent"
		/>

		<ApproveForm
			v-if="orderStatus.isApproved || orderStatus.isInWork || orderStatus.isCompleted"
			:itemData="itemData"
			:progress="2"
			:title="`${tt('Fab')} ${tt('Plant')} ${tt('Details')}`"
			:showJustInfo="!isFabricator"
			:isCompleted="orderStatus.isCompleted"
			:isFabManager="isFabManager"
			@event="handleEvent"
		/>

		<DetailsItem
			v-if="orderStatus.isDenied"
			:progress="2"
			:title="`${tt('Fab')} ${tt('Plant')} ${tt('Details')}`"
			:orderData="itemData"
			:settings="settingsStepDenied"
			:headerButtons="headerButtons2Denied"
			@event="handleEvent"
		/>

		<DetailsItem
			v-if="orderStatus.isConcluded && itemData.shipping_tracking"
			:progress="3"
			:title="`${tt('Shipping')} ${tt('Details')}`"
			:orderData="itemData"
			:settings="settingsStep3"
			@event="handleEvent"
		/>

		<CompleteFormContainer
			v-if="orderStatus.isApproved || orderStatus.isInWork || orderStatus.isCompleted"
			:itemData="itemData"
			:orderStatus="orderStatus"
			:isFabManager="isFabManager"
			:technicalProcesses="itemData.technicalProcesses"
			:progress="4"
			:title="`${tt('Technician')}/${tt('constants.Plant_User')} ${tt('Details')}`"
			@event="handleEvent"
		/>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { ElMessageBox } from 'element-plus';

import {
	REQUISITION_STATUSES_TYPES,
	requisitionCategoriesList,
	requisitionWorkTypesList,
	siteVisitOptionsList,
} from '@/constants/global';
import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import ItemForm from './ItemForm.vue';
import DetailsItem from './Details/DetailsItem.vue';
import CompleteFormContainer from './Details/CompleteFormContainer.vue';
import WorkOrderReportForPrint from './Details/WorkOrderReportForPrint.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'RequisitionsWorkOrderDetails' });

const ApproveForm = defineAsyncComponent(() => import('./Details/ApproveForm.vue'));

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const { changeRoute } = useNavigation();
const {
	unapproveRequisition,
	resetRequisition,
	takeRequisition,
	deleteRequisition,
} = usePlantRequisitions();

const isFabManager = computed(() => !!authStore.authUser?.role?.is_fab_shop_manager);
const isRequestor = computed(() => authStore.authUser?.id === props.itemData?.requisition_user_id);
const isFabricator = computed(() => authStore.authUser?.id === props.itemData?.fabrication_user_id);
const orderStatus = computed(() =>
	Object.freeze({
		isPending: props.itemData?.status === REQUISITION_STATUSES_TYPES.PENDING,
		isApproved: props.itemData?.status === REQUISITION_STATUSES_TYPES.APPROVED,
		isDenied: props.itemData?.status === REQUISITION_STATUSES_TYPES.DENIED,
		isCompleted: props.itemData?.status === REQUISITION_STATUSES_TYPES.COMPLETED,
		isConcluded: !!props.itemData?.is_concluded,
		isInWork: props.itemData?.status === REQUISITION_STATUSES_TYPES.IN_WORK,
	}),
);
const settingsStep1 = computed(() =>
	Object.freeze(
		translate([
			{ id: 2, label: 'Requested_Completion', prop: 'complete_at', meta: { prepareValue: { localMethod: cleanDateString } } },
			{ id: 4, label: 'Requestor', prop: 'requisitionUser.full_name' },
			{ id: 42, label: 'Requestor_Plant', prop: 'requisitionPlant.name' },
			{ id: 5, label: 'Category', prop: 'category', meta: { getItemValue: { prop: 'name', list: requisitionCategoriesList() } } },
			{ id: 15, label: 'Work_Type', prop: 'work_type', meta: { getItemValue: { prop: 'name', list: requisitionWorkTypesList() } } },
			{ id: 16, label: 'Equipment_Details', prop: 'equipment_details' },
			{ id: 17, label: 'phrases.site_visit_required', prop: 'site_visit', meta: { getItemValue: { prop: 'name', list: siteVisitOptionsList } } },
			{ id: 6, label: 'Budget', prop: 'proposed_cost', prefix: '$' },
			{ id: 7, label: 'Details', prop: 'requisition_details' },
			{ id: 8, label: 'Attachments', prop: 'newOrderAttachments', buttonSettings: { action: 'downloadFile', className: 'link underline' }, meta: { isAttachment: true } },
		]),
	),
);
const settingsStepDenied = computed(() =>
	Object.freeze(
		translate([
			{ id: 3, label: 'Plant_Name', prop: 'fabricationPlant.name' },
			{ id: 4, label: 'phrases.Reject_Reason', prop: 'rejection_reason_details' },
		]),
	),
);
const settingsStep3 = computed(() =>
	Object.freeze(
		translate([
			{ id: 2, label: 'phrases.Shipping_Method', prop: 'shipping_method' },
			{ id: 3, label: 'Tracking', postfix: ' #', prop: 'shipping_tracking' },
			{ id: 4, label: 'phrases.Expected Receive Date', prop: 'shipping_receive_date' },
		]),
	),
);
const actionButtons1 = computed(() => {
	if (orderStatus.value.isPending && isFabManager.value) {
		return Object.freeze(
			translate([
				{ id: 1, text: 'Deny', className: 'inverted', event: 'handleDetailsAction', args: { componentFileLoader: () => import('./Details/DenyForm.vue') } },
				{ id: 2, text: 'Approve', event: 'handleDetailsAction', args: { componentFileLoader: () => import('./Details/ApproveForm.vue') } },
			], { key: 'text' }),
		);
	}
	return Object.freeze([]);
});
const headerButtons1 = computed(() => {
	const buttons = [];
	if (isFabManager.value && (orderStatus.value.isApproved || orderStatus.value.isInWork)) {
		buttons.push({ id: 1, text: tt('DENY'), event: 'handleDetailsAction', args: { componentFileLoader: () => import('./Details/DenyForm.vue') } });
		if (!props.itemData?.can_change_requisition) {
			buttons.push({ id: 2, text: tt('UNLOCK'), event: 'handleUnapprove', icon: 'icomoon icon-unlock' });
		}
	}
	return Object.freeze(buttons);
});
const headerButtons2Denied = computed(() =>
	isFabManager.value && orderStatus.value.isDenied
		? Object.freeze([{ id: 1, text: tt('RESET'), event: 'handleReset' }])
		: Object.freeze([]),
);

const reloadPage = () => emit('event', 'fetchPageData', props.itemData.id);
const confirmAction = (message) =>
	ElMessageBox.confirm(message, { confirmButtonText: tt('OK'), cancelButtonText: tt('CANCEL'), type: 'warning' });
const handleDetailsAction = ({ componentFileLoader }) => emit('event', 'openDetailsAction', { componentFileLoader });
const handleTakeInWork = () =>
	confirmAction(`${tt('Start')} ${tt('phrases.this_order')}?`).then(() =>
		takeRequisition({ itemId: props.itemData.id }).then(reloadPage),
	);
const handleUnapprove = () =>
	confirmAction(`${tt('Unapprove')} ${tt('phrases.this_order')}?`).then(() =>
		unapproveRequisition({ itemId: props.itemData.id }).then(reloadPage),
	);
const handleReset = () =>
	confirmAction(`${tt('reset')} ${tt('phrases.this_order')}?`).then(() =>
		resetRequisition({ itemId: props.itemData.id }).then(reloadPage),
	);
const handleDeleteRequisition = (id) =>
	confirmAction(`${tt('phrases.Do_you_really_want_to')} ${tt('phrases.delete_this_requisition')}?`).then(() =>
		deleteRequisition({ data: { ids: [id] } }).then(() => changeRoute({ path: '/requisitions' })),
	);
const successModalSubmit = reloadPage;

const { handleEvent } = useEventHandler({
	handleDetailsAction,
	handleTakeInWork,
	handleUnapprove,
	handleReset,
	handleDeleteRequisition,
	successModalSubmit,
});
</script>
