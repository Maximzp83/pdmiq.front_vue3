<template>
	<div>
		<div class="section-row equipments-tabsbar">
			<div class="underline-tabs full-width">
				<TabsBar
					customDisable
					:activeTab="activeTab"
					:tabsList="tabsList"
					:disableTabs="disableTabs"
					buttonsType="primary"
					@switchTab="switchTab"
				/>
			</div>
		</div>

		<div v-show="activeTab.prop === tabsList[0].prop" class="tab-container section-row">
			<ItemForm
				ref="itemFormRef"
				:fromModal="fromModal"
				:fromMultiformModal="fromMultiformModal"
				:itemData="itemData"
				:itemsName="itemsName"
				:instancesItemsData="instancesItemsData"
				:multiFormFilters="multiFormFilters"
				:editModal="editModal"
				@submit="(data) => emit('submit', data)"
				@onCancel="() => emit('onCancel')"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useTabs } from '@/composables/mixins/useTabs';

import TabsBar from '@/components/common/TabsBar.vue';
import ItemForm from './ItemForm.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentItemFormWrapper' });

defineProps({
	fromModal: Boolean,
	fromMultiformModal: Boolean,
	itemData: { type: Object, default: () => ({}) },
	itemsName: { type: Object, default: () => ({}) },
	instancesItemsData: Object,
	multiFormFilters: Object,
	editModal: Object,
});
const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const itemFormRef = ref(null);
const disableTabs = ref(false);
const tabsList = computed(() => {
	const list = [{ title: tt('main'), prop: 'mainTab' }];
	if (authStore.hasAccessTo(['create_dashboard', 'edit_dashboard'])) {
		list.push(
			{ title: 'pdm', prop: 'pdmTab', disabled: true },
			{ title: 'Multi View', prop: 'multiViewTab', disabled: true },
		);
	}
	return Object.freeze(list);
});
const { activeTab, switchTab } = useTabs({ tabsList, hideTabsBar: true });
const { handleEvent } = useEventHandler({}, emit);

const validateForm = () => itemFormRef.value?.validateForm?.();

defineExpose({ validateForm });
</script>
