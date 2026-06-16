<template>
	<el-form ref="itemFormRef" class="flex mrow bottom align-center" :model="formData">
		<el-form-item prop="node_parameter" class="mcol-xs-6" required>
			<label v-if="itemIndex === 0">{{ tt('Parameter') }}</label>
			<CustomSelectV2
				v-model="formData.node_parameter"
				:optionsList="parametersList"
				:placeholder="`${tt('Select')} ${tt('parameter')}`"
			/>
		</el-form-item>

		<div class="running-threshold-suffix">&gt;</div>

		<el-form-item prop="baseline_value" class="mcol-xs-3" required>
			<label v-if="itemIndex === 0">{{ tt('Value') }}</label>
			<el-input v-model="formData.baseline_value" :placeholder="tt('value')" />
		</el-form-item>

		<div class="mcol-xs-2 running-threshold-suffix and">{{ isLast ? '' : 'AND' }}</div>

		<div>
			<el-button
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="removeItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'RunningThresholdItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	parametersList: { type: Array, default: () => [] },
	isLast: Boolean,
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	node_parameter: null,
	baseline_value: null,
});

const { validateItemForm, getFormData, removeItem, isInitialSetup } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	localGetFormDataCallback: (data) => ({
		...data,
		baseline_value: +data.baseline_value,
	}),
	emit,
});

watch(
	() => props.parametersList,
	(parametersList) => {
		if (!isInitialSetup.value) {
			const hasCurrentParameter = parametersList?.some(
				(item) => item.id === formData.value.node_parameter,
			);
			if (hasCurrentParameter) return;

			formData.value.node_parameter = null;
		}
	},
);

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
