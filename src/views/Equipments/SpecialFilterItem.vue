<template>
	<div class="special-filter-item">
		<CustomSelectV2
			v-model="selectedValues"
			filterable
			clearable
			multiple
			enabled
			collapse-tags
			:optionsLoading="valuesLoading"
			:optionsList="valuesList"
			:placeholder="typeOption.name"
			:setupLabelSettings="labelOptions"
			@focus="fetchValues"
		/>
	</div>
</template>

<script setup>
import { ref, shallowRef, watch } from 'vue';

import { createGetRequest } from '@/api/request_factories';

defineOptions({ name: 'EquipmentSpecialFilterItem' });

const props = defineProps({
	typeOption: { type: Object, required: true },
});
const emit = defineEmits(['change']);

const selectedValues = ref([]);
const valuesList = shallowRef([]);
const valuesLoading = ref(false);
const predefinedOptionsValuesIDs = ref([]);
const rawOptionsValuesIDs = ref([]);

const labelOptions = Object.freeze({
	accessors: ['value', 'predefinedValue.value'],
	delimeter: ',',
});

const fetchValuesRequest = createGetRequest(
	`/equipments/types/options/${props.typeOption.id}/values`,
);

const fetchValues = () => {
	if (valuesList.value.length || valuesLoading.value) return;

	valuesLoading.value = true;
	fetchValuesRequest({ params: { max: -1 } })
		.then(({ value }) => {
			valuesList.value = value || [];
		})
		.catch(() => {
			valuesList.value = [];
		})
		.finally(() => {
			valuesLoading.value = false;
		});
};

watch(selectedValues, (valueIds = []) => {
	const selectedItems = valuesList.value.filter((item) => valueIds.includes(item.id));

	predefinedOptionsValuesIDs.value = props.typeOption.has_predefined_values
		? selectedItems.map((item) => item.predefined_value_id).filter(Boolean)
		: [];
	rawOptionsValuesIDs.value = props.typeOption.has_predefined_values
		? []
		: selectedItems.flatMap((item) => item.similar_ids || []);

	emit('change', {
		typeOptionId: props.typeOption.id,
		predefinedOptionsValuesIDs: predefinedOptionsValuesIDs.value,
		rawOptionsValuesIDs: rawOptionsValuesIDs.value,
	});
});

defineExpose({
	predefinedOptionsValuesIDs,
	rawOptionsValuesIDs,
});
</script>
