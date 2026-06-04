<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container 1mrow relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="name" class="mcol-xs-12">
			<label v-if="itemIndex == 0">{{ tt('name') }}</label>
			<el-input v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<div class="action-buttons-container absolute">
			<el-button
				class="action-button remove-button "
				size="mini"
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

import { required as requiredRule } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

const props = defineProps({
	itemIndex: { type: Number, default: 0 },
	itemData: { type: Object, required: true },
	required: { type: Boolean, default: false },
	machinesList: { type: Array, default: () => [] },
	machinesLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['onRemove', 'onCreate']);

const itemForm = ref(null);
const formData = ref({
	id: null,
	name: '',
	plant_id: null,
});

const rules = computed(() => ({
	name: props.required ? requiredRule : null,
}));

const { removeItem } = useSubItem({
	itemData: props.itemData,
	formData,
	itemFormRef: itemForm,
	deleteNewId: true,
	emit,
});
</script>
