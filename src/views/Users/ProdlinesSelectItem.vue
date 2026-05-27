<template>
	<el-form-item v-if="plantItem" :label="plantItem.name" prop="notifiable_prodlines">
		<CustomSelectV2
			v-model="formData.notifiable_prodlines"
			filterable
			multiple
			:optionsLoading="productionLinesLoading"
			:optionsList="productionLinesList"
			:placeholder="`${tt('Select')} ${tt('prodlines')}`"
		/>
	</el-form-item>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'UsersProdlinesSelectItem',
});

const props = defineProps({
	plantId: { type: Number, required: true },
	plantsList: { type: Array, default: () => [] },
	currentNotifiableProdlinesIds: { type: Array, default: () => [] },
});

const productionLinesLoading = ref(false);
const productionLinesList = ref([]);
const formData = ref({
	notifiable_prodlines: [],
});

const fetchProductionLines = createGetRequest(ENTITIES.ProductionLines.apiBase);

const plantItem = computed(() => findItemBy('id', props.plantId, props.plantsList));

const fetchProdlines = (plantId) => {
	productionLinesLoading.value = true;
	fetchProductionLines({
		params: { max: -1, plantId },
	})
		.then(({ value }) => {
			productionLinesList.value = value || [];
		})
		.finally(() => {
			productionLinesLoading.value = false;
		});
};

const getFormData = () => formData.value.notifiable_prodlines;

watch(
	() => props.plantId,
	(plantId) => {
		formData.value.notifiable_prodlines = [];
		if (plantId) {
			fetchProdlines(plantId);
		}
	},
	{ immediate: true },
);

watch(
	() => productionLinesList.value,
	(list) => {
		if (!list.length || !props.currentNotifiableProdlinesIds.length) return;

		formData.value.notifiable_prodlines = props.currentNotifiableProdlinesIds.filter((id) =>
			findItemBy('id', id, list),
		);
	},
	{ deep: true },
);

defineExpose({
	getFormData,
});
</script>
