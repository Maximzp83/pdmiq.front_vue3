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
			<el-form-item :label="`${tt('application')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<SimpleSpinner :active="plantsLoading" />
				<el-select
					:disabled="!plantsList.length"
					v-model="formData.plant_id"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
					:class="{ showJustInfo: settings.disablePlant }"
				>
					<el-option
						v-for="item in plantsList"
						:key="'plant_id-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
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
		requestsToDoList: () => [
			{
				action: 'fetch_plants',
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}
		]
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			save_item: 'applications/save_application'
		})
	}
};
</script>
