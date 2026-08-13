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
			<el-form-item :label="tt('Name')" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { buildProps, useItemForm } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'WorkStationsItemForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const plantsList = shallowRef([]);
const plantsLoading = ref(false);
const formData = ref({
	name: '',
	plant_id: null,
});

const rules = Object.freeze({
	name: required,
	plant_id: required,
});
const methodsMap = {
	fetch_plants: createGetRequest(ENTITIES.Plants.apiBase),
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
]);

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'WorkStations',
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
