<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container mrow relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="name" class="mcol-xs-6">
			<label v-if="itemIndex == 0">{{ tt('name') }}</label>
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item prop="machines_ids" class="mcol-xs-6">
			<SimpleSpinner :active="machinesLoading" />
			<label v-if="itemIndex == 0">{{ tt('Machines') }}</label>
			<el-select
				class="not-tags-align "
				filterable
				multiple
				collapse-tags
				:disabled="!machinesList.length"
				v-model="formData.machines_ids"
				:placeholder="`${tt('Select')} ${tt('machines')}`"
			>
				<el-option
					v-for="item in machinesList"
					:key="'machine_id-' + item.id"
					:label="item.name"
					:value="item.id"
				/>
			</el-select>
		</el-form-item>

		<div class="action-buttons-container absolute">
			<el-button
				class="action-button remove-button "
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
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
	machines_ids: [],
});

const rules = computed(() => ({
	name: props.required ? requiredRule : null,
	machines_ids: props.required ? requiredRule : null,
}));

const { removeItem } = useSubItem({
	itemData: props.itemData,
	formData,
	itemFormRef: itemForm,
	deleteNewId: true,
	emit,
});
</script>
