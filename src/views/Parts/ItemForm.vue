<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Part')} ${tt('Number')}`" prop="part_number">
				<CustomInput v-model="formData.part_number" :placeholder="`${tt('input')} ${tt('number')}`" />
			</el-form-item>

			<el-form-item :label="tt('Type')" prop="type">
				<CustomInput v-model="formData.type" :placeholder="`${tt('input')} ${tt('type')}`" />
			</el-form-item>

			<el-form-item :label="tt('Description')" prop="description">
				<CustomInput v-model="formData.description" type="textarea" :placeholder="tt('description')" />
			</el-form-item>

			<el-form-item :label="tt('Price')" prop="price">
				<el-input-number v-model="formData.price" :precision="2" :min="0" />
			</el-form-item>

			<el-form-item :label="`${tt('Stock')} ${tt('quantity')}`" prop="stock_quantity">
				<el-input-number v-model="formData.stock_quantity" :min="0" />
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'PartsItemForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);
const plantsEntity = ENTITIES.Plants;

const itemFormRef = ref(null);
const plantsLoading = ref(false);
const plantsList = shallowRef([]);

const formData = ref({
	plant_id: null,
	part_number: '',
	type: '',
	description: '',
	price: 0,
	stock_quantity: 0,
});

const rules = {
	plant_id: required,
	part_number: required,
	price: required,
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_plants,
			localProp: plantsList,
			localLoadProp: plantsLoading,
			payload: {
				params: { orderByColumn: 'name', orderByMethod: 'asc' },
			},
		},
	]),
);

const methodsMap = {
	fetch_plants: createGetRequest(plantsEntity.apiBase),
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Parts',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
});
</script>
