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
			<el-form-item :label="`${tt('Team')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item v-if="isIndustrialMatrix" :label="tt('plant')" prop="plant_id">
				<SimpleSpinner :active="plantsLoading" />
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:disabled="!plantsList.length"
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Users')" prop="users_ids">
				<SimpleSpinner :active="usersLoading" />
				<CustomSelectV2
					v-model="formData.users_ids"
					multiple
					filterable
					collapse-tags
					:disabled="!usersList.length"
					:optionsLoading="usersLoading"
					:optionsList="usersList"
					:placeholder="`${tt('Select')} ${tt('users')}`"
					labelKey="full_name"
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
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';

import CustomSelectV2 from '@/components/form/CustomSelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'TeamsItemForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
	hideCompanies: Boolean,
});

const emit = defineEmits(['submit', 'onCancel']);

const authStore = useAuthStore();
const plantsEntity = ENTITIES.Plants;
const usersEntity = ENTITIES.Users;

const itemFormRef = ref(null);
const isMobile = ref(false);
const plantsLoading = ref(false);
const plantsList = ref([]);
const usersLoading = ref(false);
const usersList = ref([]);

const isIndustrialMatrix = computed(() => authStore.isIndustrialMatrix);
const authUser = computed(() => authStore.authUser || {});

const initialFormData = {
	name: '',
	plant_id: null,
	users_ids: [],
};

const formData = ref({ ...initialFormData });

const rules = {
	name: required,
	users_ids: required,
};

const currentPlantId = computed(() => {
	if (isIndustrialMatrix.value) {
		return formData.value.plant_id;
	}

	return authUser.value?.plant_id ?? formData.value.plant_id;
});

const setupForm = (item) => {
	if (item) {
		formData.value = {
			name: item.name ?? '',
			plant_id: item.plant_id ?? item.plant?.id ?? authUser.value?.plant_id ?? null,
			users_ids: item.users_ids ?? item.users?.map((user) => user.id) ?? [],
		};
		return;
	}

	formData.value = {
		...initialFormData,
		plant_id: !isIndustrialMatrix.value ? authUser.value?.plant_id ?? null : null,
	};
};

const fetchPlantsRequest = createGetRequest(plantsEntity.apiBase);
const fetchUsersRequest = createGetRequest(usersEntity.apiBase);

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

const fetchUsers = async (plantId) => {
	usersLoading.value = true;
	try {
		const params = {
			max: -1,
			orderByColumn: 'full_name',
			orderByMethod: 'asc',
		};

		if (plantId) {
			params.plantId = plantId;
		}

		const { value } = await fetchUsersRequest({
			params,
		});
		usersList.value = value || [];
	} finally {
		usersLoading.value = false;
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

watch(
	currentPlantId,
	(plantId, previousPlantId) => {
		if (plantId !== previousPlantId) {
			formData.value.users_ids = [];
		}

		fetchUsers(plantId);
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
