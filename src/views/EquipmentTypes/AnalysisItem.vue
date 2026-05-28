<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container type-option-item']"
		:model="formData"
	>
		<div class="flex mrow content-container content-row analysis">
			<el-form-item prop="name" class="mcol-xs-2" required>
				<label>{{ tt('Name') }}</label>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item prop="unit" class="mcol-xs-2">
				<label>{{ tt('Unit') }}</label>
				<CustomInput v-model="formData.unit" :placeholder="tt('unit')" />
			</el-form-item>

			<el-form-item prop="crossover_tags" class="mcol-xs-3" required>
				<label>{{ tt('crossover_tags') }}</label>
				<CustomInput v-model="formData.crossover_tags" placeholder="DA, NDA e.t.c..." />
			</el-form-item>

			<el-form-item prop="formula" class="mcol-xs-20">
				<label>{{ tt('formula') }}</label>
				<CustomInput v-model="formData.formula" placeholder="{rpm}/{value}" />
			</el-form-item>

			<el-form-item prop="harmonics" class="mcol-xs-2">
				<label>{{ tt('harmonics') }}</label>
				<CustomInput v-model="formData.harmonics" :placeholder="tt('harmonics')" />
			</el-form-item>

			<el-form-item prop="is_visible" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ tt('phrases.Show_in_analysis') }}</label>
				<el-switch
					v-model="formData.is_visible"
					class="without-margin"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="is_editable" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ tt('editable') }}</label>
				<el-switch
					v-model="formData.is_editable"
					class="without-margin"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

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
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'EquipmentTypesAnalysisItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	name: '',
	unit: '',
	crossover_tags: '',
	is_visible: 0,
	is_editable: 0,
	formula: '',
	harmonics: 5,
});

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
