<template>
	<div class="edit-form-container maintenance-form" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row bolded-labels"
			label-width="150px"
			label-position="top"
			:model="formData"
			:rules="rules"
		>
			<div class="el-form-item flex mrow wrap">
				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item v-if="itemData" :label="`${tt('Work_Order')} ${tt('Request')} #`" class="showJustInfo">
						<b>{{ itemData.serial_number || itemData.id }}</b>
					</el-form-item>

					<el-form-item :label="`${tt('Name')} ${tt('Work_Order')} ${tt('Request')}`" prop="title" required>
						<CustomInput v-model="formData.title" :placeholder="tt('name')" />
					</el-form-item>

					<div class="el-form-item">
						<div class="mrow flex bottom">
							<el-form-item :label="tt('Due_Date')" prop="finish_date" class="mcol-xs-6" required>
								<Datepicker
									v-model="formData.finish_date"
									:placeholder="`${tt('Select')} ${tt('date')}`"
									className=" "
								/>
							</el-form-item>
						</div>
					</div>

					<el-form-item prop="description" :label="tt('Description')" required>
						<CustomInput v-model="formData.description" :placeholder="tt('text')" type="textarea" rows="5" />
					</el-form-item>

					<el-form-item :label="tt('phrases.Assigned_to')" prop="request_recipient_id" required>
						<CustomSelectV2
							v-model="formData.request_recipient_id"
							filterable
							clearable
							:optionsLoading="usersLoading"
							:optionsList="usersList"
							labelKey="full_name"
							:placeholder="`${tt('Select')} ${tt('User')}`"
						/>
					</el-form-item>
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item :label="tt('Production_Line')" prop="production_line_id">
						<CustomSelectV2
							v-model="formData.production_line_id"
							filterable
							clearable
							:optionsLoading="productionLinesLoading"
							:optionsList="productionLinesList"
							:placeholder="`${tt('select')} ${tt('production_line')}`"
							@change="() => {
								formData.machine_id = null;
								formData.asset_id = null;
								formData.equipment_id = null;
							}"
						/>
					</el-form-item>

					<el-form-item :label="tt('Machine')" prop="machine_id">
						<CustomSelectV2
							v-model="formData.machine_id"
							filterable
							clearable
							:optionsLoading="machinesLoading"
							:optionsList="machinesList"
							:placeholder="`${tt('Select')} ${tt('machine')}`"
							@change="() => {
								formData.asset_id = null;
								formData.equipment_id = null;
							}"
						/>
					</el-form-item>

					<el-form-item :label="tt('Asset')" prop="asset_id">
						<FetchByQuerySelect
							v-model="formData.asset_id"
							:disabled="!formData.machine_id"
							clearable
							enableLoadmore
							:loadmoreIsActive="!formData.machine_id"
							:settings="assetQueryOptions"
							:placeholder="tt('asset')"
							@change="() => {
								formData.equipment_id = null;
							}"
						/>
					</el-form-item>

					<el-form-item :label="tt('Item')" prop="equipment_id">
						<FetchByQuerySelect
							v-model="formData.equipment_id"
							:disabled="!formData.asset_id"
							clearable
							enableLoadmore
							:loadmoreIsActive="!formData.asset_id"
							:settings="equipmentsQueryOptions"
							:setupLabelSettings="equipmentLabelOptions"
							:placeholder="tt('item')"
						/>
					</el-form-item>
				</div>
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { USER_ROLES_TYPES } from '@/constants/global';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import Datepicker from '@/components/common/Datepicker.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'WorkOrderRequestItemForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const productionLinesLoading = ref(false);
const productionLinesList = shallowRef([]);
const machinesLoading = ref(false);
const machinesList = shallowRef([]);
const usersLoading = ref(false);
const usersList = shallowRef([]);

const formData = ref({
	plant_id: null,
	parent_id: null,
	production_line_id: null,
	machine_id: null,
	asset_id: null,
	equipment_id: null,
	finish_date: '',
	title: '',
	description: '',
	request_recipient_id: null,
});

const rules = {
	title: required,
	finish_date: required,
	description: required,
	request_recipient_id: required,
};

const plantId = computed(() => props.itemData?.plant_id || props.additionalSettings?.plantId || null);
const methodsMap = {
	fetch_users: createGetRequest(ENTITIES.Users.apiBase),
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
	fetch_asset: createGetByIdRequest(ENTITIES.Assets.apiBase),
	fetch_equipments: createGetRequest(ENTITIES.Equipments.apiBase),
	fetch_equipment: createGetByIdRequest(ENTITIES.Equipments.apiBase),
};

const assetQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_assets,
		fetchByIdAction: methodsMap.fetch_asset,
		payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
		bindTo: [
			{ getValue: () => plantId.value, param: 'plantId', withoutClean: true },
			{ getValue: () => formData.value.production_line_id, param: 'productionLineId' },
			{ getValue: () => formData.value.machine_id, param: 'machineId' },
		],
	}),
);

const equipmentsQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_equipments,
		fetchByIdAction: methodsMap.fetch_equipment,
		payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
		bindTo: [
			{ getValue: () => plantId.value, param: 'plantId', withoutClean: true },
			{ getValue: () => formData.value.production_line_id, param: 'productionLineId' },
			{ getValue: () => formData.value.machine_id, param: 'machineId' },
			{ getValue: () => formData.value.asset_id, param: 'assetId' },
		],
	}),
);

const equipmentLabelOptions = Object.freeze({
	accessors: ['brand_name', 'machine_name', 'production_line_name', 'location_name'],
	delimeter: ',',
});

const localSetupPage = () => {
	formData.value.plant_id = plantId.value;
};

const localPrepareSubmitData = (data) => ({
	...data,
	plant_id: plantId.value,
	production_line_id: data.production_line_id || null,
	machine_id: data.machine_id || null,
	asset_id: data.asset_id || null,
	equipment_id: data.equipment_id || null,
});

useRequestsList({
	methodsMap,
	requestsToDoList: computed(() =>
		Object.freeze([
			{
				actionName: 'fetch_users',
				localProp: usersList,
				localLoadProp: usersLoading,
				payload: { params: { type: USER_ROLES_TYPES.CUSTOMER } },
				bindTo: [{ getValue: () => plantId.value, param: 'plantId' }],
			},
			{
				actionName: 'fetch_production_lines',
				localProp: productionLinesList,
				localLoadProp: productionLinesLoading,
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				bindTo: [{ getValue: () => plantId.value, param: 'plantId' }],
			},
			{
				actionName: 'fetch_machines',
				localProp: machinesList,
				localLoadProp: machinesLoading,
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				bindTo: [
					{ getValue: () => plantId.value, param: 'plantId' },
					{ getValue: () => formData.value.production_line_id, param: 'productionLineId' },
				],
			},
		])
	),
});

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'WorkOrderRequests',
	itemData: computed(() => props.itemData),
	formData,
	fromModal: props.fromModal,
	editModal: props.editModal,
	formRef: itemFormRef,
	localSetupPage,
	localPrepareSubmitData,
	successSubmitCallback: (response) => props.editModal?.callback?.(response),
	emit,
});

defineExpose({
	validateForm,
});
</script>
