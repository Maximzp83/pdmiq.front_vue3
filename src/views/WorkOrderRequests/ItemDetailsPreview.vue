<template>
	<div class="details-preview-content maintenance-details-preview">
		<div class="section-row flex mrow wrap">
			<div class="mcol-xs-12 mcol-sm-6">
				<div v-for="item in columnOneSettings" :key="`request-info-${item.label}`" class="details-row">
					<InfoItem tag="div" labelPosition="top" :itemData="itemData" :settingItem="item" />
				</div>
			</div>

			<div class="mcol-xs-12 mcol-sm-6">
				<div v-for="item in columnTwoSettings" :key="`request-equipment-${item.label}`" class="details-row">
					<InfoItem tag="div" labelPosition="top" :itemData="itemData" :settingItem="item" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessageBox } from 'element-plus';

import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMaintenance } from '@/composables/useMaintenance';

import InfoItem from '@/components/itemDetails/InfoItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'WorkOrderRequestDetailsPreview',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	propsData: { type: Object, default: () => ({}) },
	editModal: { type: Object, default: null },
});

const globalStore = useGlobalStore();
const { rejectMaintenanceRequest } = useMaintenance();
const itemData = computed(() => props.itemData || props.propsData || {});

const columnOneSettings = computed(() =>
	Object.freeze([
		{ label: `${tt('Work_Order')} ${tt('Request')} #`, prop: 'serial_number' },
		{ label: 'Name', prop: 'title' },
		{ label: 'Due_Date', prop: 'finish_date', meta: { prepareValue: { localMethod: cleanDateString } } },
		{ label: 'Description', prop: 'description' },
		{ label: 'Submitted', prop: 'creator.full_name' },
		{ label: 'phrases.Assigned_to', prop: 'request_recipient.full_name' },
	])
);

const columnTwoSettings = computed(() =>
	Object.freeze([
		{ label: 'Production_Line', prop: 'productionLine.name' },
		{ label: 'Machine', prop: 'machine.name' },
		{ label: 'Asset', prop: 'asset.name' },
		{ label: 'Item', prop: 'equipment.name' },
	])
);

const editItem = () => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: itemData.value,
		formComponentFileLoader: () => import('./ItemForm.vue'),
		itemName: `${tt('Work_Order')} ${tt('Request')}`,
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		additionalModalSettings: {
			plantId: itemData.value?.plant_id,
		},
		callback: props.editModal?.callback,
	});
};

const convertItem = () => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: itemData.value,
		formComponentFileLoader: () => import('./ConvertForm.vue'),
		title: `${tt('Convert')} ${tt('Work_Order')} ${tt('Request')}`,
		itemName: `${tt('Work_Order')} ${tt('Request')}`,
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		hideSubmitButtons: true,
		footerActions: [
			{
				name: 'validateForm',
				button_text: tt('CONVERT'),
				disablePopover: true,
				type: 'primary',
			},
		],
		callback: props.editModal?.callback,
	});
};

const rejectItem = () => {
	ElMessageBox.confirm(`${tt('phrases.reject_this_work_order_request')}?`, {
		confirmButtonText: tt('REJECT'),
		cancelButtonText: tt('CANCEL'),
		type: 'warning',
	}).then(() => rejectMaintenanceRequest({ itemId: itemData.value.id }).then((response) => {
		props.editModal?.callback?.(response);
	}));
};

defineExpose({
	editItem,
	convertItem,
	rejectItem,
});
</script>
