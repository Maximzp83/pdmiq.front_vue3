<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container part-option-item', { mrow: !showJustInfo }]"
		:model="formData"
	>
		<el-form-item
			prop="part_id"
			required
			:class="[showJustInfo ? 'mcol-xs-5' : 'mcol-xs-8']"
		>
			<label v-if="!showJustInfo && itemIndex === 0">
				{{ `${tt('Part')} ${tt('name')}` }}
			</label>
			<CustomSelectV2
				v-model="formData.part_id"
				:optionsLoading="partsLoading"
				:optionsList="partsList"
				:placeholder="`${tt('select')} ${tt('part')}`"
				labelKey="part_number"
			/>
		</el-form-item>

		<el-form-item class="mcol-xs-4" prop="quantity" required>
			<label v-if="!showJustInfo && itemIndex === 0">{{ tt('Quantity') }}</label>
			<el-input v-model.number="formData.quantity" :placeholder="tt('quantity')" />
		</el-form-item>

		<div v-if="!showJustInfo">
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
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'TaskProceduresPartItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	partsLoading: Boolean,
	partsList: { type: Array, default: () => [] },
	showJustInfo: Boolean,
	isLast: Boolean,
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	part_id: null,
	quantity: 0,
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
