<template>
	<div class="section-row">
		<div class="title article-title capitalize">
			Data set:
			<span class="bold">{{ datasetItem.alt_label || datasetItem.label }}</span>
		</div>

		<el-form ref="itemFormRef" label-width="100px" label-position="left" :model="formData">
			<el-form-item :label="tt('Expression')" prop="expression">
				<CustomInput
					v-model.lazy="formData.expression"
					:placeholder="`${tt('example')}: 0.000253*{reg}+96.67 - Gain`"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'FormulasFormItem',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	datasetItem: { type: Object, required: true },
});

const itemFormRef = ref(null);
const formData = ref({
	data_set: null,
	expression: '',
});

const localSetupPageActions = (itemData) => {
	if (!itemData) {
		formData.value.data_set = props.datasetItem.id;
	}
};

const { validateItemForm, getFormData } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions,
});

defineExpose({
	validateItemForm,
	getFormData,
});
</script>
