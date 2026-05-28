<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item
				:label="tt('plant')"
				prop="plant_id"
				required
				:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
			>
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Name')"
				prop="name"
				:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
			>
				<CustomInput
					v-model="formData.name"
					required
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Processes')" prop="processes">
				<div class="options-container process-options">
					<div v-if="processesItemsList.length" class="content-row">
						<ProcessItem
							v-for="(item, idx) in processesItemsList"
							:key="`process_item-${item.id}`"
							:ref="(el) => setSubItemRef('ProcessItem', el, idx)"
							:item-data="item"
							:item-index="idx"
							:partsLoading="partsLoading"
							:partsList="partsList"
							@onRemove="(id) => removeFormItem(id, processesItemsList)"
						/>
					</div>

					<div class="margin-top-row button-row">
						<el-button
							class="create-button small"
							size="small"
							type="success"
							@click="addFormItem(processesItemsList, 'pr_i-')"
						>
							<span>{{ `${tt('Add')} ${tt('Process')}` }}</span>
							<i class="suffix-icon icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
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
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import ProcessItem from './ProcessItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'TaskProceduresItemForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);

const plantsEntity = ENTITIES.Plants;
const partsEntity = ENTITIES.Parts;

const itemFormRef = ref(null);
const plantsList = shallowRef([]);
const plantsLoading = ref(false);
const partsList = shallowRef([]);
const partsLoading = ref(false);
const processesItemsList = ref([]);
const refsMap = ref({
	ProcessItem: [],
});

const formData = ref({
	plant_id: null,
	name: '',
	processes: [],
});

const rules = {
	name: required,
	plant_id: required,
};

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'ProcessItem', targetProp: 'processes' },
	]),
);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const methodsMap = {
	fetch_plants: createGetRequest(plantsEntity.apiBase),
	fetch_parts: createGetRequest(partsEntity.apiBase),
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_plants,
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
		{
			action: methodsMap.fetch_parts,
			bindTo: [
				{
					getValue: () => formData.value.plant_id,
					param: 'plantId',
				},
			],
			localProp: partsList,
			localLoadProp: partsLoading,
		},
	]),
);

const itemData = computed(() => props.itemData);

const localSetupPage = (item) => {
	if (item) {
		processesItemsList.value = setupFormSubItemsList(item.processes, 'pr_i');
	}
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'TaskProcedures',
	itemData,
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
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
