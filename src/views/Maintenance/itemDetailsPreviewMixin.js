import { computed } from 'vue';

export function useMaintenanceItemDetailsPreview(props) {
	const itemData = computed(() => props.itemData || props.propsData || {});
	const parentWorkOrder = computed(() => itemData.value.parent || itemData.value.work_order || null);

	return {
		itemData,
		parentWorkOrder,
	};
}
