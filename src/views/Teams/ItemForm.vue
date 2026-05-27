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
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'TeamsItemForm',
});

const props = defineProps(buildProps({
	hideCompanies: Boolean,
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const plantsEntity = ENTITIES.Plants;
const usersEntity = ENTITIES.Users;

const itemFormRef = ref(null);
const plantsLoading = ref(false);
const plantsList = shallowRef([]);
const usersLoading = ref(false);
const usersList = shallowRef([]);

const isIndustrialMatrix = computed(() => !!authStore.isIndustrialMatrix);
const authUser = computed(() => authStore.authUser || {});

const formData = ref({
	name: '',
	plant_id: null,
	users_ids: [],
});

const rules = {
	name: required,
	users_ids: required,
};

const requestsToDoList = computed(() => [
	{
		action: methodsMap.fetch_plants,
		localProp: plantsList,
		localLoadProp: plantsLoading,
		payload: {
			params: {
				max: -1,
				orderByColumn: 'name',
				orderByMethod: 'asc',
			},
		},
	},
	{
		action: methodsMap.fetch_users,
		localProp: usersList,
		localLoadProp: usersLoading,
		payload: {
			params: {
				max: -1,
				orderByColumn: 'full_name',
				orderByMethod: 'asc',
			},
		},
		bindTo: [
			{
				param: 'plantId',
				getValue: () => formData.value?.plant_id,
				onTrigger: () => formData.value.users_ids = [],
				fetchAnyWay: !isIndustrialMatrix.value,
			},
		],
	},
]);

const methodsMap = {
	fetch_plants: createGetRequest(plantsEntity.apiBase),
	fetch_users: createGetRequest(usersEntity.apiBase),
};

const localSetupPage = () => {
	if (!isIndustrialMatrix.value && authUser.value?.plant_id) {
		formData.value.plant_id = authUser.value.plant_id;
	}
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Teams',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
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
