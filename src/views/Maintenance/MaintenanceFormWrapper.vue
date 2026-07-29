<template>
	<div>
		<div v-if="!disableTabs" class="section-row card-tabs text-center">
			<TabsBar
				card
				:activeTab="activeTab"
				:tabsList="tabsList"
				buttonsType="info"
				buttonsClass="inverted"
				@switchTab="switchTab"
			/>
		</div>

		<div v-if="activeTab.prop === 'woTab'" class="tab-container section-row">
			<WorkOrderForm
				ref="itemFormComponentRef"
				fromModal
				:itemData="itemData"
				:settings="settings"
				:formSettings="formSettings"
				:additionalSettings="additionalSettings"
				@event="handleEvent"
			/>
		</div>

		<div v-if="activeTab.prop === 'recurrTab'" class="tab-container section-row">
			<WorkOrderForm
				ref="itemFormComponentRef"
				fromModal
				isRecurring
				:itemData="itemData"
				:settings="settings"
				:formSettings="formSettings"
				:additionalSettings="additionalSettings"
				@event="handleEvent"
			/>
		</div>

		<div v-if="activeTab.prop === 'logTab'" class="tab-container section-row">
			<MaintenanceLogForm
				ref="itemFormComponentRef"
				fromModal
				:itemData="itemData"
				:settings="settings"
				:formSettings="formSettings"
				:additionalSettings="additionalSettings"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue';

import { api_request } from '@/api/request_provider';
import { ENTITIES } from '@/config/entities';
import { MAINTENANCE_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useTabs } from '@/composables/mixins/useTabs';
import { useEventHandler } from '@/composables/mixins/useEmitter';

const TabsBar = defineAsyncComponent(() => import('@/components/common/TabsBar.vue'));
const WorkOrderForm = defineAsyncComponent(() => import('./WorkOrders/ItemForm.vue'));
const MaintenanceLogForm = defineAsyncComponent(() => import('./Logs/ItemForm.vue'));

defineOptions({
	name: 'MaintenanceFormWrapper',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	additionalSettings: { type: Object, default: () => ({}) },
	settings: { type: Object, default: () => ({}) },
	formSettings: { type: Object, default: () => ({}) },
	editModal: { type: Object, default: null },
});

const emit = defineEmits(['event']);

const itemFormComponentRef = ref(null);
const tabsList = computed(() =>
	Object.freeze(
		Lang.translate([
			{ title: 'work_order', prop: 'woTab', item_type: MAINTENANCE_TYPES.WORK_ORDER },
			{ title: 'Recurring_Work_Order', prop: 'recurrTab', item_type: MAINTENANCE_TYPES.WORK_ORDER },
			{ title: 'Maintenance_Log', prop: 'logTab', item_type: MAINTENANCE_TYPES.LOG },
		])
	)
);
const disableTabs = computed(() => !!props.itemData || props.additionalSettings.disableTabs);
const { activeTab, switchTab } = useTabs({ tabsList });

watch(
	() => props.additionalSettings.switchTabTo,
	(settings) => {
		if (!settings) return;
		const tab = tabsList.value.find((item) => item[settings.key] === settings.value);
		if (tab) switchTab(tab);
	},
	{ immediate: true },
);

const validateForm = () => {
	itemFormComponentRef.value?.validateForm?.();
};

const handleSubmitForm = (payloadArg = {}) => {
	const payload = { ...payloadArg };
	const itemId = payload.data?.id;
	const method = itemId ? 'put' : 'post';
	const url = itemId
		? `${ENTITIES.WorkOrders.apiBase}/${itemId}`
		: ENTITIES.WorkOrders.apiBase;

	emit('event', { eventName: 'toggleSaving', data: true, onward: true });

	return api_request[method](url, payload)
		.then((answer) => {
			emit('event', { eventName: 'toggleSaving', data: false, onward: true });
			emit('event', { eventName: 'successModalSubmit', data: answer, onward: true });

			if (props.editModal?.successSubmitCallbacks) {
				props.editModal.successSubmitCallbacks.forEach((callback) => {
					console.log(callback)
					callback(answer);
				});
			}

			return answer;
		})
		.catch(() => {
			emit('event', { eventName: 'toggleSaving', data: false, onward: true });
			return false;
		});
};

const { handleEvent } = useEventHandler({ handleSubmitForm }, emit);

defineExpose({
	validateForm,
});
</script>
