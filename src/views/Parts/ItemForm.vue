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
import { onMounted, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';

import CustomInput from '@/components/form/CustomInput.vue';
import CustomSelectV2 from '@/components/form/CustomSelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'PartsItemForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
});

const emit = defineEmits(['submit', 'onCancel']);

const itemFormRef = ref(null);
const isMobile = ref(false);
const plantsList = ref([]);
const plantsLoading = ref(false);

const initialFormData = {
	plant_id: null,
	part_number: '',
	type: '',
	description: '',
	price: 0,
	stock_quantity: 0,
};

const formData = ref({ ...initialFormData });

const rules = {
	plant_id: required,
	part_number: required,
	price: required,
};

const setupForm = (item) => {
	if (item) {
		formData.value = {
			plant_id: item.plant_id ?? item.plant?.id ?? null,
			part_number: item.part_number ?? '',
			type: item.type ?? '',
			description: item.description ?? '',
			price: item.price ?? 0,
			stock_quantity: item.stock_quantity ?? 0,
		};
		return;
	}

	formData.value = { ...initialFormData };
};

const fetchPlants = async () => {
	plantsLoading.value = true;
	try {
		const { value } = await api_request.get('/plants', {
			notNotify: true,
			params: {
				max: -1,
				orderByColumn: 'name',
				orderByMethod: 'asc',
			},
		});
		plantsList.value = value || [];
	} finally {
		plantsLoading.value = false;
	}
};

const submitForm = () => {
	emit('submit', { ...formData.value });
};

const validateForm = () => {
	if (!itemFormRef.value?.validate) return;

	itemFormRef.value.validate((valid) => {
		if (valid) {
			submitForm();
		}
	});
};

const handleCancel = () => {
	emit('onCancel');
};

watch(
	() => props.itemData,
	(item) => {
		setupForm(item);
	},
	{ immediate: true }
);

onMounted(() => {
	isMobile.value = window.innerWidth < 768;
	fetchPlants();
});

defineExpose({
	validateForm,
});
</script>
