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
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('plant')" prop="plant_id" required>
				<CustomSelect
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
					v-model="formData.plant_id"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Part')} ${tt('Number')}`" prop="part_number">
				<CustomInput
					v-model="formData.part_number"
					:placeholder="`${tt('input')} ${tt('number')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Type')" prop="type">
				<CustomInput
					v-model="formData.type"
					:placeholder="`${tt('input')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Description')" prop="description">
				<CustomInput
					type="textarea"
					v-model="formData.description"
					:placeholder="tt('description')"
				/>
			</el-form-item>

			<el-form-item :label="tt('Price')" required prop="price">
				<el-input-number v-model="formData.price" :precision="2" :min="0" />
			</el-form-item>

			<el-form-item
				:label="`${tt('Stock')} ${tt('quantity')}`"
				prop="stock_quantity"
			>
				<el-input-number v-model="formData.stock_quantity" :min="0" />
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
// import { required } from '@/constants/validation';
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
				plant_id: null,
				part_number: '',
				type: '',
				description: '',
				price: 0,
				stock_quantity: 0
			}

			/*rules: {
				name: required,
				plant_id: required
			}*/
		};
	},

	computed: {
		requestsToDoList: () => [
			{
				action: 'fetch_plants',
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}
		]
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			save_item: 'parts/save_part'
		})
	}
};
</script>
