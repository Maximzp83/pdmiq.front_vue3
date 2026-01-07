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
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id" class="">
				<CustomSelect
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
					v-model="formData.plant_id"
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
import { required } from '@/constants/validation';
import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],
	components: {
		FormOperationsButtons: () =>
			import('@/components/form/FormOperationsButtons.vue')
	},

	data() {
		return {
			plantsList: [],
			plantsLoading: false,

			formData: {
				name: '',
				plant_id: null
			},

			rules: {
				name: required,
				plant_id: required
			}
		};
	},

	computed: {
		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_plants',
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			save_item: 'plant_work_stations/save_work_station'
		})
	}
};
</script>
