<template>
	<el-form
		ref="itemFormRef"
		class="flex mrow relative content-row"
		:model="formData"
		:rules="rules"
		:label-position="fromModal ? 'left' : 'top'"
	>
		<el-form-item prop="name" class="mini mcol-xs-5">
			<CustomInput
				v-model="formData.name"
				class="mini"
				:placeholder="tt('material')"
				@input="calcActualPrice"
			/>
		</el-form-item>

		<el-form-item prop="price" class="mini mcol-xs-5">
			<CustomInput
				v-model="formData.price"
				class="mini"
				:placeholder="tt('cost')"
				@input="calcActualPrice"
			/>
		</el-form-item>

		<div :class="['action-buttons-container', { 'flex bottom': !fromModal }]">
			<el-button
				v-if="!isLast"
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="removeCurrentItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>

			<el-button
				v-else
				class="action-button create-button"
				size="small"
				type="success"
				@click="$emit('onCreate')"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({ name: 'RequisitionMaterialItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	isLast: Boolean,
	fromModal: Boolean,
});
const emit = defineEmits(['onCreate', 'onRemove', 'calcActualPrice']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	name: '',
	price: '',
});
const rules = ref({
	name: null,
	price: null,
});
const deleteNewId = computed(() => true);

const updateRules = () => {
	if (formData.value.name || formData.value.price) {
		rules.value = { name: required, price: required };
		return;
	}
	rules.value = { name: null, price: null };
};

const calcActualPrice = () => {
	updateRules();
	emit('calcActualPrice');
};

const {
	itemId,
	removeItem,
	validateItemForm,
	getFormData,
	handleResetValidate,
} = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId,
	emit,
});

const removeCurrentItem = () => {
	removeItem();
	emit('calcActualPrice');
};

watch(
	formData,
	() => {
		updateRules();
		setTimeout(handleResetValidate, 10);
	},
	{ deep: true },
);

defineExpose({
	itemId,
	validateItemForm,
	getFormData,
});
</script>
