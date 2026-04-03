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
			<el-form-item
				:label="tt('name')"
				prop="name"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item
				:label="tt('Model_number')"
				prop="model_number"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<CustomInput v-model="formData.model_number" :placeholder="tt('model_number')" />
			</el-form-item>

			<el-form-item
				:label="tt('Part_number')"
				prop="part_number"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<CustomInput v-model="formData.part_number" :placeholder="tt('part_number')" />
			</el-form-item>

			<el-form-item prop="sensor_class" :label="tt('Tag')">
				<CustomSelect
					clearable
					class="capitalize"
					optionClassName="capitalize"
					:optionsList="sensorClassesList"
					:placeholder="`${tt('Select')} ${tt('tag')}`"
					v-model="formData.sensor_class"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('default')"
				prop="is_default"
			>
				<el-switch
					v-model="formData.is_default"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Allow')} FFT`"
				prop="is_fft_allowed"
			>
				<el-switch
					v-model="formData.is_fft_allowed"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<div :label="tt('IO_Parameters')" prop="parameters" class="el-form-item">
				<div class="title article-title">{{ tt('IO_Parameters') }}:</div>
				<div class="form-subitems-wrapper">
					<div v-if="ioParametersItemsList.length" class="form-subitems-list content-row">
							<IOParameterItem
								ref="IOParameterItem"
								v-for="(item, idx) in ioParametersItemsList"
								:key="`io_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:measurementUnitsList="measurementUnitsList"
								:measurementUnitsLoading="measurementUnitsLoading"
								fromModal
								@onRemove="id => removeFormItem(id, 'ioParametersItemsList')"
							/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="create-button content-row with-text small"
							size="mini"
							type="success"
							@click="addFormItem('ioParametersItemsList', 'p_i-')"
						>
							<span class="capitalize" v-text="`${tt('Add')} ${tt('constants.Metric')}`"></span>
							<i class="icomoon icon-plus"></i>
						</el-button>
					</div>
				</div>
			</div>

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
import { sensorClassesList } from '@/constants/global';

// import { sensorParametersList } from '@/modules/charts_factory/controllers/Sensor/enums';

import { required } from '@/constants/validation';
import { itemFormMixin, subItemsListMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), subItemsListMixin(), requestsListMixin()],
	components: {
		IOParameterItem: () => import('./IOParameterItem.vue'),
	},
	data() {
		return {
			ioParametersItemsList: [],
			measurementUnitsList: [],
			measurementUnitsLoading: false,

			formData: {
				name: '',
				model_number: '',
				part_number: '',
				is_default: 0,
				parameters: [],
				sensor_class: null,
				is_fft_allowed: 0,
			}
		};
	},

	computed: {
		rules: () => ({
			name: required,
		}),

		prepareSubmitDataSettings: () =>
			Object.freeze({
				skipValueValidationProps: ['sensor_class']
			}),

		subItemsSettings: () => Object.freeze([
			{ ref: 'IOParameterItem', targetProp: 'parameters' }
		]),
		requestsToDoList: () => Object.freeze([
			{
				action: 'fetch_measurement_units',
				localProp: 'measurementUnitsList',
				localLoadProp: 'measurementUnitsLoading',
				// payload: { params: { max: -1 }, notNotify: true }
			}
		]),
		sensorClassesList: () => Object.freeze(sensorClassesList()),

		/*refsList: () => ['IOParameterItem'],
		refsOperationsSettings: () => ({
			submitActionName: 'submitForm',
			dataAsArray: true,
			itemSubmitMethod: 'validateItemForm'
			// submitSettings: { formProp: 'locations' }
		}),*/

		/*subItemsSettings: () => [
			{ ref: 'IOParameterItem', targetProp: { prop: 'parameters' } },
		],*/
	},

	methods: {
		...mapActions({
			save_item: 'banner_v2_subtypes/save_subtype',
			fetch_measurement_units: 'measurement_units/fetch_measurement_units',
		}),

		localSetupPage(itemData) {
			if (itemData) {
				this.formData.parameters = [];
				this.ioParametersItemsList = this.setupFormSubItemsList(
					itemData.parameters,
					'p_i'
				);
			}
		}
	},
};
</script>
