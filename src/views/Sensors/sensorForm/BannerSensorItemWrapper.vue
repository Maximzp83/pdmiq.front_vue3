<template>
	<div>
		<VueElementLoadingWrapper :isLoading="equipmentLoading" :itemsName="itemsName.one" />

		<div v-if="equipmentData" class="form-wrapper">
			<ItemForm
				ref="itemFormComponentRef"
				editInModal
				:itemData="itemData"
				:equipmentData="equipmentData"
				:itemsName="itemsName"
				:additionalSettings="additionalSettings"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef } from 'vue';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

const { tt } = Lang;

defineOptions({
	name: 'BannerSensorWrapper',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	additionalSettings: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);

const itemFormComponentRef = ref(null);
const equipmentData = shallowRef(null);
const equipmentLoading = ref(false);

const itemsName = computed(() => ({
	one: tt('Item'),
	mult: tt('Items'),
}));

const fetchEquipment = (id) => {
	equipmentLoading.value = true;
	api_request
		.get(`/equipments/${id}`, { notNotify: true })
		.then(({ value }) => {
			equipmentData.value = value || {};
		})
		.finally(() => {
			equipmentLoading.value = false;
		});
};

const validateForm = () => {
	itemFormComponentRef.value?.validateForm?.();
};

const { handleEvent } = useEventHandler({}, emit);

onMounted(() => {
	if (props.itemData?.equipment_id) {
		fetchEquipment(props.itemData.equipment_id);
	} else {
		equipmentData.value = {};
	}
});

defineExpose({
	validateForm,
});
</script>
