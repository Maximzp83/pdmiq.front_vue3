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
import { computed, ref, watch } from 'vue';

import { MAINTENANCE_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useTabs } from '@/composables/mixins/useTabs';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import TabsBar from '@/components/common/TabsBar.vue';
import WorkOrderForm from './WorkOrders/ItemForm.vue';
import MaintenanceLogForm from './Logs/ItemForm.vue';

defineOptions({
	name: 'MaintenanceFormWrapper',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	additionalSettings: { type: Object, default: () => ({}) },
	settings: { type: Object, default: () => ({}) },
	formSettings: { type: Object, default: () => ({}) },
});

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

const { handleEvent } = useEventHandler({}, null);

defineExpose({
	validateForm,
});
</script>
