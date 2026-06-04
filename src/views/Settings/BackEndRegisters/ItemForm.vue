<template>
	<div :class="['edit-form-container relative', { 'width-75': !isMobile }]">
		<SimpleSpinner :active="registerSaving" />

		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			label-position="top"
		>
			<div class="el-form-item flex mrow content-row">
				<el-form-item class="mcol-xs-4" :label="tt('Company')" prop="company_id">
					<CustomSelectV2
						v-model="companyId"
						filterable
						:optionsLoading="companiesLoading"
						:disabled="!companiesList.length"
						:optionsList="companiesList"
						:placeholder="`${tt('Select')} ${tt('company')}`"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-4" :label="tt('plant')" prop="plant_id">
					<SimpleSpinner :active="plantsLoading" />
					<el-select
						v-model="plantId"
						:placeholder="`${tt('Select')} ${tt('plant')}`"
						:disabled="!plantsList.length"
					>
						<el-option
							v-for="item in plantsList"
							:key="`plant-id-${item.id}`"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>

				<el-form-item class="mcol-xs-4" :label="tt('Controller')" prop="controller_id">
					<SimpleSpinner :active="controllersLoading" />
					<el-select
						v-model="formData.controller_id"
						:placeholder="`${tt('Select')} ${tt('controller')}`"
						:disabled="!controllersList.length"
					>
						<el-option
							v-for="item in controllersList"
							:key="`controller-id-${item.id}`"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
			</div>

			<div class="el-form-item flex mrow wrap content-row">
				<el-form-item :label="`${tt('Register')} ${tt('Number')}`" prop="register_number" class="mcol-xs-12 mcol-sm-6">
					<el-input-number v-model="formData.register_number" :min="0" />
				</el-form-item>

				<el-form-item :label="`${tt('Register')} ${tt('Value')}`" prop="register_value" class="mcol-xs-12 mcol-sm-6">
					<CustomInput v-model="formData.register_value" />
				</el-form-item>
			</div>

			<el-form-item class="content-row">
				<el-button type="primary" native-type="button" class="item-action-button" @click="validateForm">
					<span>Write Value to Register</span>
				</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSettings } from '@/composables/useSettings';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'BackEndRegisterForm',
});

const { fetchCompanies, fetchPlants, fetchControllers, registerCommand } = useSettings();
const itemFormRef = ref(null);
const companyId = ref(null);
const plantId = ref(null);
const companiesList = shallowRef([]);
const plantsList = shallowRef([]);
const controllersList = shallowRef([]);
const companiesLoading = ref(false);
const plantsLoading = ref(false);
const controllersLoading = ref(false);
const registerSaving = ref(false);

const formData = ref({
	controller_id: null,
	register_number: 0,
	register_value: '',
});

const rules = {
	controller_id: required,
	register_number: required,
	register_value: required,
};

const isMobile = computed(() => document.documentElement.clientWidth < 992);

const requestsToDoList = computed(() => [
	{
		action: fetchCompanies,
		localProp: companiesList,
		localLoadProp: companiesLoading,
	},
	{
		action: fetchPlants,
		bindTo: [
			{
				getValue: () => companyId.value,
				param: 'companyId',
				onTrigger: () => {
					plantId.value = null;
					formData.value.controller_id = null;
				},
			},
		],
		localProp: plantsList,
		localLoadProp: plantsLoading,
		blockInitialFetch: true,
	},
	{
		action: fetchControllers,
		bindTo: [
			{
				getValue: () => plantId.value,
				param: 'plantId',
				onTrigger: () => {
					formData.value.controller_id = null;
				},
			},
		],
		localProp: controllersList,
		localLoadProp: controllersLoading,
		blockInitialFetch: true,
	},
]);

const localSubmit = (data) => {
	registerSaving.value = true;
	registerCommand({ data })
		.finally(() => {
			registerSaving.value = false;
		});
};

const { validateForm } = useItemForm({
	formData,
	formRef: itemFormRef,
	localSubmit,
});

useRequestsList({ requestsToDoList });
</script>
