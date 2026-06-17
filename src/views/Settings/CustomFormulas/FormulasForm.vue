<template>
	<div :class="['edit-form-container code-mirror-form relative', { 'width-75': !isMobile }]">
		<VueElementLoadingWrapper
			:isLoading="itemsLoading || itemsSaving"
			:itemsName="`${tt('Templates')} ${tt('loading')}...`"
		/>

		<div v-if="formulasReady" class="mail_template_form">
			<FormulasFormItem
				v-for="(item, idx) in filteredDataSetsList"
				:ref="(el) => setSubItemRef('FormulasFormItem', el, idx)"
				:key="`dataset-${item.id}`"
				:datasetItem="item"
				:itemData="getFormulaItem(item.id)"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, ref, shallowRef } from 'vue';

import { CONTROLLER_TYPES, DATASET, dataSetsList } from '@/constants/global';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useNotify } from '@/composables/useNotify';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSensors } from '@/composables/useSensors';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import FormulasFormItem from './FormulasFormItem.vue';

const { tt } = Lang;
const { Notify } = useNotify();
const { fetchDatasetFormulas, saveDatasetFormulas } = useSensors();

defineOptions({
	name: 'FormulasForm',
});

const isMobile = ref(document.documentElement.clientWidth < 992);
const formulasReady = ref(false);
const formulasList = shallowRef([]);
const itemsLoading = ref(false);
const itemsSaving = ref(false);
const refsMap = reactive({});

const subItemsSettings = computed(() => [{ ref: 'FormulasFormItem', returnArray: true }]);

const filteredDataSetsList = computed(() =>
	dataSetsList().filter((dataSet) => {
		if (dataSet.controller_type === CONTROLLER_TYPES.ULTRA_SOUND) {
			return [
				DATASET.ULTRA_SOUND_SDT_DECIBELS,
				DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20,
				DATASET.SDT_SENSOR_FULL_SPECTRUM,
				DATASET.LUBE_MATRIX_SDT_TEMP_C,
				DATASET.LUBE_MATRIX_SDT_TEMP_F,
			].includes(dataSet.id);
		}
		if (dataSet.controller_type === CONTROLLER_TYPES.BANNER) return dataSet.id === DATASET.CM1L;
		if (dataSet.controller_type === CONTROLLER_TYPES.NCD) {
			return [DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM, DATASET.NCD_4_20MA].includes(dataSet.id);
		}
		return false;
	}),
);

const { setSubItemRef, validateSubItemsForm, collectDataFromSubItems } = useSubItemsList({
	refsMap,
});

const getFormulaItem = (dataSet) => findItemBy('data_set', dataSet, formulasList.value);

const saveFormulas = (payload) => {
	itemsSaving.value = true;
	saveDatasetFormulas(payload)
		.finally(() => {
			itemsSaving.value = false;
		});
};

const handleSubmit = async () => {
	if (await validateSubItemsForm(subItemsSettings.value)) {
		saveFormulas({
			data: {
				formulas: collectDataFromSubItems(subItemsSettings.value).result,
			},
		});
		return;
	}

	Notify({
		type: 'warning',
		title: tt('phrases.form_isnt_ready'),
		message: tt('phrases.Please_check_fields_errors_first'),
	});
};

const requestsToDoList = computed(() => [
	{
		action: fetchDatasetFormulas,
		localProp: formulasList,
		localLoadProp: itemsLoading,
		callback: ({ data }) => {
			formulasList.value = data || [];
			formulasReady.value = true;
		},
	},
]);

useRequestsList({ requestsToDoList });

defineExpose({
	handleSubmit,
});
</script>
