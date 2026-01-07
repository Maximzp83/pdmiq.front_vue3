<template>
	<div :class="['edit-form-container relative', { 'width-75': !isMobile }]">
		<SimpleSpinner :active="registerSaving" />

		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="'top'"
		>
			<div class="el-form-item flex mrow content-row">
				<el-form-item class="mcol-xs-4" :label="tt('Company')" prop="company_id">
					<CustomSelect
						filterable
						:optionsLoading="companiesLoading"
						:disabled="!companiesList.length"
						:optionsList="companiesList"
						:placeholder="`${tt('Select')} ${tt('company')}`"
						v-model="company_id"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-4" :label="tt('plant')" prop="plant_id">
					<SimpleSpinner :active="plantsLoading" />
					<el-select
						:placeholder="`${tt('Select')} ${tt('plant')}`"
						:disabled="!plantsList.length"
						v-model="plant_id"
					>
						<el-option
							v-for="item in plantsList"
							:key="'plant-id-' + item.id"
							:label="item.name"
							:value="item.id"
						>
						</el-option>
					</el-select>
				</el-form-item>

				<el-form-item
					class="mcol-xs-4"
					:label="tt('Controller')"
					prop="controller_id"
				>
					<SimpleSpinner :active="controllersLoading" />
					<el-select
						:placeholder="`${tt('Select')} ${tt('controller')}`"
						:disabled="!controllersList.length"
						v-model="formData.controller_id"
					>
						<el-option
							v-for="item in controllersList"
							:key="'controller-id-' + item.id"
							:label="item.name"
							:value="item.id"
						>
						</el-option>
					</el-select>
				</el-form-item>
			</div>

			<div class="el-form-item flex mrow wrap content-row">
				<el-form-item
					:label="`${tt('Register')} ${tt('Number')}`"
					prop="register_number"
					class="mcol-xs-12 mcol-sm-6"
				>
					<el-input-number v-model="formData.register_number" :min="0" />
				</el-form-item>

				<el-form-item
					:label="`${tt('Register')} ${tt('Value')}`"
					prop="register_value"
					class="mcol-xs-12 mcol-sm-6"
				>
					<el-input v-model="formData.register_value" />
				</el-form-item>
			</div>

			<el-form-item class="content-row">
				<!-- <el-button
					@click="listeners.onCancel"
					native-type="button"
					class="item-action-button"
				>
					<span>CANCEL</span>
				</el-button> -->

				<el-button
					@click="validateForm"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span>Write Value to Register</span>
				</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { /*mapState,*/ mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
// import { sensorParametersList } from '@/constants/global';

import { required } from '@/constants/validation';
import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],

	data() {
		return {
			companiesList: [],
			plantsList: [],
			controllersList: [],
			companiesLoading: false,
			plantsLoading: false,
			controllersLoading: false,

			registerSaving: false,

			company_id: null,
			plant_id: null,

			formData: {
				controller_id: null,
				register_number: 0,
				register_value: ''
			}
		};
	},

	computed: {
		// sensorParametersList: () => sensorParametersList,
		// alertRulesList: () => alertRulesList,

		rules: () =>
			Object.freeze({
				controller_id: required,
				register_number: required,
				register_value: required
			}),

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_companies',
					localProp: 'companiesList',
					localLoadProp: 'companiesLoading'
				},
				{
					action: 'fetch_plants',
					bindTo: [
						{
							prop: 'company_id',
							param: 'companyId',
							clean_prop: 'plant_id'
						}
					],
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				},
				{
					action: 'fetch_controllers',
					bindTo: [
						{
							prop: 'plant_id',
							param: 'plantId',
							clean_prop: 'formData.controller_id'
						}
					],
					localProp: 'controllersList',
					localLoadProp: 'controllersLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_companies: 'companies/fetch_companies',
			fetch_plants: 'plants/fetch_plants',
			fetch_controllers: 'controllers/fetch_controllers',
			save_item: 'controllers/register_cmd'
		}),

		localSubmit(data) {
			let payload = {
				data: data
			};

			this.registerSaving = true;
			/*if (payload) {
				console.log(2, payload)
				return
			}*/

			this.save_item(payload)
				.then(() => {
					this.registerSaving = false;
				})
				.catch(() => {
					this.registerSaving = false;
				});
		}

		/*localSetupPage(item) {
			if (item) {
				this.formData.type = [item.type];
			}
		}*/
	}
};
</script>
