<template>
	<div class="edit-form-container" :class="{ 'half-width': !resolvedFromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('application')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:disabled="!plantsList.length || resolvedSettings.disablePlant"
					:class="{ showJustInfo: resolvedSettings.disablePlant }"
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { api_request } from '@/api/request_provider';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';

import CustomInput from '@/components/form/CustomInput.vue';
import CustomSelectV2 from '@/components/form/CustomSelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'ApplicationsItemForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
	settings: { type: Object, default: () => ({}) },
	editModal: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'onCancel', 'event']);

const globalStore = useGlobalStore();
const plantsEntity = ENTITIES.Plants;

const itemFormRef = ref(null);
const plantsList = ref([]);
const plantsLoading = ref(false);
const isMobile = ref(false);

const initialFormData = {
	name: '',
	plant_id: null,
};

const formData = ref({ ...initialFormData });

const rules = {
	name: required,
	plant_id: required,
};

const resolvedSettings = computed(() => props.settings || {});
const resolvedFromAnotherInstance = computed(
	() => props.fromAnotherInstance || !!resolvedSettings.value.fromAnotherInstance
);
const isEditMode = computed(() => !!props.itemData?.id);

const setupForm = (item) => {
	if (item) {
		formData.value = {
			name: item.name ?? '',
			plant_id: item.plant_id ?? item.plant?.id ?? null,
		};
	} else {
		formData.value = {
			...initialFormData,
			plant_id: resolvedSettings.value.disablePlant
				? globalStore.globalFilters?.plantId ?? null
				: initialFormData.plant_id,
		};
	}
};

const fetchPlantsRequest = createGetRequest(plantsEntity.apiBase);

const fetchPlants = async () => {
	plantsLoading.value = true;
	try {
		const { value } = await fetchPlantsRequest({
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

const submitForm = async () => {
	const payload = { ...formData.value };

	if (props.fromModal) {
		emit('event', { eventName: 'toggleSaving', data: true, onward: true });
		try {
			const answer = isEditMode.value
				? await api_request.put(`/applications/${props.itemData.id}`, {
						data: payload,
						itemName: tt('Application'),
					})
				: await api_request.post('/applications', {
						data: payload,
						itemName: tt('Application'),
					});

			emit('event', { eventName: 'toggleSaving', data: false, onward: true });
			emit('event', {
				eventName: 'successModalSubmit',
				data: answer,
				onward: true,
			});
		} catch (error) {
			emit('event', { eventName: 'toggleSaving', data: false, onward: true });
			throw error;
		}
		return;
	}

	emit('submit', payload);
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
