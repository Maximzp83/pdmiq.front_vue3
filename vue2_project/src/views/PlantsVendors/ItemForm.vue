<template>
	<div
		class="edit-form-container "
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="name">
				<CustomInput v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="`${tt('Contact')} ${tt('name')}`" prop="contact_name">
				<CustomInput v-model="formData.contact_name" />
			</el-form-item>

			<el-form-item :label="tt('Email')" prop="email">
				<el-input
					v-model="formData.email"
					type="email"
					autocomplete="new-password"
				/>
			</el-form-item>

			<el-form-item :label="tt('Phone')" prop="phone_number">
				<CustomInput v-model="formData.phone_number" :placeholder="tt('number')" />
			</el-form-item>

			<el-form-item
				:label="`${tt('Enable')} ${tt('one_click')}`"
				prop="is_one_click"
			>
				<el-switch
					v-model="formData.is_one_click"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelect
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
					v-model="formData.plant_id"
				/>
			</el-form-item>

			<el-form-item
				prop="equipment_type_for_buy_ids"
				:label="`${tt('Equipment_types')} ${tt('for_buy')}`"
			>
				<CustomSelect
					filterable
					multiple
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('types')}`"
					v-model="formData.equipment_type_for_buy_ids"
				/>
			</el-form-item>

			<el-form-item
				prop="equipment_type_for_service_ids"
				:label="`${tt('Equipment_types')} ${tt('for_service')}`"
			>
				<CustomSelect
					filterable
					multiple
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('types')}`"
					v-model="formData.equipment_type_for_service_ids"
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

<script>
import { mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
import { required /*number*/ } from '@/constants/validation';
import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],

	data() {
		return {
			plantsLoading: false,
			plantsList: [],
			equipmentTypesLoading: false,
			equipmentTypesList: [],

			formData: {
				plant_id: null,
				name: '',
				contact_name: '',
				email: '',
				phone_number: '',
				is_one_click: true,

				equipment_type_for_buy_ids: [],
				equipment_type_for_service_ids: []
			}
		};
	},

	computed: {
		rules: () => ({
			name: required,
			email: required,
			plant_id: required,
			phone_number: [required /*, number*/]
		}),

		requestsToDoList: () => [
			{
				action: 'fetch_plants',
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			},
			{
				action: 'fetch_equipment_types',
				localProp: 'equipmentTypesList',
				localLoadProp: 'equipmentTypesLoading'
			}
		]
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			save_item: 'plants_vendors/save_plants_vendor'
			// save_plant: 'plants/save_plant'
		}),

		localSetupPage() {
			const { itemId, globalFilters, navbarSettings } = this;
			if (!itemId && (globalFilters.plantId || navbarSettings.showPlantName)) {
				if (globalFilters.plantId) {
					this.formData.plant_id = globalFilters.plantId;
				} else if (navbarSettings.showPlantName) {
					this.formData.plant_id = navbarSettings.showPlantName.id;
				}
			}
		}
	}
};
</script>
