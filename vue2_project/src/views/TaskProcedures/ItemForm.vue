<template>
	<div class="edit-form-container ">
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item
				:label="tt('plant')"
				prop="plant_id"
				required
				:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
			>
				<CustomSelect
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
					v-model="formData.plant_id"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Name')"
				prop="name"
				:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
			>
				<CustomInput
					required
					v-model="formData.name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Processes')" prop="processes">
				<div class="options-container process-options">
					<div v-if="processesItemsList.length" class="content-row">
						<ProcessItem
							ref="ProcessItem"
							v-for="(item, idx) in processesItemsList"
							:key="`process_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							:partsLoading="partsLoading"
							:partsList="partsList"
							@onRemove="id => removeFormItem(id, 'processesItemsList')"
						/>
					</div>

					<div class="margin-top-row button-row">
						<el-button
							class="create-button small"
							size="mini"
							type="success"
							@click="addFormItem('processesItemsList', 'pr_i-')"
						>
							<span>{{ `${tt('Add')} ${tt('Process')}` }}</span>
							<i class="suffix-icon icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
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
import {
	itemFormMixin,
	requestsListMixin,
	createFormItemMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		createFormItemMixin(),
		subItemsListMixin()
	],
	components: {
		FormOperationsButtons: () =>
			import('@/components/form/FormOperationsButtons.vue'),
		ProcessItem: () => import('./ProcessItem.vue')
	},

	data() {
		return {
			plantsList: [],
			plantsLoading: false,
			partsList: [],
			partsLoading: false,

			processesItemsList: [],

			formData: {
				plant_id: null,
				name: '',
				processes: [],
			}

			/*rules: {
				name: required,
				plant_id: required
			}*/
		};
	},

	computed: {
		instanceName: () => 'TaskProcedures',

		subItemsSettings: () => Object.freeze([
			{ ref: 'ProcessItem', targetProp: 'processes' }
		]),

	/*	refsList: () => ['ProcessItem'],
		refsOperationsSettings: () => ({
			submitActionName: 'submitForm',
			dataAsArray: true,
			itemSubmitMethod: 'validateItemForm'
		}),*/
		requestsToDoList: () => [
			{
				action: 'fetch_plants',
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			},
			{
				action: 'fetch_parts',
				// payload: { params: { max: -1, plantId: that.globalFilters.plantId } },
				bindTo: [
					{
						prop: 'formData.plant_id',
						// clean_prop: 'formData.machine_id',
						param: 'plantId'
						// fetchAnyWay: true
					}
				],
				localProp: 'partsList',
				localLoadProp: 'partsLoading'
			}
		]
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			fetch_parts: 'parts/fetch_parts',
			save_item: 'task_procedures/save_task_procedure'
		}),

		localSetupPage(item) {
			if (item) {
				this.processesItemsList = this.setupFormSubItemsList(item.processes, 'pr_i');
			}
		}
	}
};
</script>
