<template>
	<div
		:class="[
			'table-cell',
			{ hasError: hasError || hasProdlineWithoutMachine },
			{ 'flex align-center': enableAlternateModal }
		]"
	>
		<el-checkbox
			class="parallel-checkbox"
			v-if="enableParallelCheckbox"
			@change="handleParallelCheckbox"
			:value="parallelIsChecked"
		></el-checkbox>

		<el-checkbox
			v-if="enableCheckbox"
			@change="handleCheckbox"
			v-model="columnIsChecked"
			>{{ initialValue }}
		</el-checkbox>

		<CustomInput
			className="is-error"
			v-else-if="enableInput"
			v-model="value"
			placeholder=" "
		/>

		<RadioButtonsBlock
			@onChange="radioChange"
			v-else-if="enableRadio"
			:value="action"
			:settings="radioSettings"
			:optionsList="radioOptionsList"
		/>

		<CustomSelect
			v-else-if="enableSelect"
			filterable
			clearable
			mini
			:optionsList="selectOptionsList"
			:optionsLoading="selectOptionsLoading"
			:placeholder="tt('select')"
			@change="handleSelectChange"
			v-model="selectedValue"
		/>

		<span v-else v-text="cellData.value || '-'"></span>

		<!-- <div v-if="enableAlternateModal" class="postfix-button link underline"
			@click="showAlternateModal = true"
		>
			Another Value...
		</div> -->

		<el-dialog
			v-if="enableAlternateModal"
			center
			:show-close="false"
			:append-to-body="true"
			:visible.sync="showAlternateModal"
			:class="'small rounded hide-header hide-body'"
		>
			<AlternateOptionsList
				@radioChange="handleAlternateValue"
				showClose
				:options="alternateOptions"
				@closeDialog="showAlternateModal = false"
			/>
		</el-dialog>
	</div>
</template>

<script>
// import { required } from '@/constants/validation';
import { mapActions } from 'vuex';
import { findItemBy } from '@/helpers';

import { fetchItemsHelper } from '@/mixins';

export default {
	mixins: [fetchItemsHelper()],
	components: {
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		AlternateOptionsList: () => import('./AlternateOptionsList.vue')
	},

	props: {
		cellData: { type: Object, required: true },
		enableInputProp: Boolean,
		enableRadioProp: null,
		// enableCheckbox: Boolean,
		hasProdlineWithoutMachine: Boolean,
		hasStoreroomAndLocationConflict: Boolean,
		plantId: Number
		// errorItem: null,

		/*equipmentTypesList: {
			type: Array,
			default: () => []
		}*/
	},

	data() {
		return {
			initialValue: null,
			columnIsChecked: false,
			parallelIsChecked: false,
			isRequired: false,

			value: null,
			action: null,

			checkList: [],

			selectOptionsList: [],
			selectOptionsLoading: false,
			selectedValue: null,

			showAlternateModal: false,
			updating_value: null
		};
	},

	computed: {
		errorItem: that => that.cellData.errorItem,
		hasError: that => !!that.errorItem,

		// existing_value_item: that => that.errorItem.existing_value ? that.errorItem.existing_value[0] : null,

		enableAlternateModal: that => that.errorItem && that.errorItem.is_predefined,

		alternateOptions: that =>
			that.errorItem && that.errorItem.existing_values
				? that.errorItem.existing_values.map(item => ({
						id: item,
						name: item
				  }))
				: [],

		enableRadio: that =>
			that.errorItem &&
			!!(
				that.enableRadioProp ||
				(that.errorItem.imported_value && that.errorItem.existing_values)
			),
		// value - один из вари exist value, delete action, updating_val
		// Upd value - exist value, delete action, updating_val

		// -----------------------------------------------
		// (imported_value  - action, updating_val,)

		// In System: value - null, action - 1 delete updating_val
		// Update: value - imported_value, action - 2 updating_val - один из вари exist value (этот пункт для predefined values  (is_predefined) )
		// Import: value - imported_value, action - 3 delete updating_val

		// existing_value разделить не через запятую

		enableInput: that =>
			that.errorItem &&
			(that.enableInputProp ||
				(!that.enableRadio && !that.enableSelect && !that.errorItem.imported_value)),

		radioOptionsList() {
			if (this.enableRadioProp) {
				return this.enableRadioProp.radioOptionsList;
			} else if (this.errorItem && this.enableRadio) {
				const { existing_values, imported_value, is_predefined } = this.errorItem;

				let list = [
					{
						id: 1,
						name: `In System ${existing_values ? existing_values.join(', ') : '-'}`
					}
				];

				if (is_predefined && existing_values) {
					const { updating_value } = this;
					list.push({ id: 2, name: `Update ${updating_value || ''}` }); //id: existing_value,
				}

				list.push({ id: 3, name: `Import ${imported_value}` }); //id: imported_value

				return Object.freeze(list);
			}

			return [];
		},

		radioSettings: () =>
			Object.freeze({
				className: 'el-checkbox',
				inline: true,
				isCheckbox: true,
				alwaysSwitch: true
				// hideLabel: true
			}),

		enableCheckbox() {
			const {
				hasStoreroomAndLocationConflict,
				errorItem,
				hasProdlineWithoutMachine,
				cellData
			} = this;

			if (hasStoreroomAndLocationConflict && errorItem) {
				return (
					errorItem.column_name == 'storeroom' || errorItem.column_name == 'location'
				);
			}

			if (hasProdlineWithoutMachine && errorItem) {
				return cellData.column_name == 'production_line_name';
			}
			return false;
		},

		enableParallelCheckbox() {
			if (this.hasProdlineWithoutMachine && this.errorItem) {
				if (this.cellData.column_name == 'machine_name') {
					this.handleParallelCheckbox(true);
					return true;
				} else if (this.cellData.column_name == 'production_line_name') {
					this.handleCheckbox(true);
				}
			}
			return false;
		},

		enableSelect() {
			const { hasProdlineWithoutMachine, cellData, errorItem } = this;

			if (hasProdlineWithoutMachine && errorItem) {
				if (cellData.column_name == 'machine_name') {
					this.fetchMachines();
					return true;
				}
			}
			return false;
		}

		// targetPropName: () => 'errors',
		// deleteNewId: () => true
	},

	methods: {
		...mapActions({
			fetch_machines: 'machines/fetch_machines'
		}),
		/*changeCheckbox(e) {
			console.log(e)
		},*/

		/*handleChecked(isChecked) {
			if (isChecked) {
				this.value = this.initialValue;
			} else {
				this.value = '';
			}
		},*/
		fetchMachines() {
			this.doFetchAction(
				'fetch_machines',
				'selectOptionsList',
				'selectOptionsLoading',
				{ params: { plantId: this.plantId } }
			);
		},

		handleParallelCheckbox(isChecked) {
			this.parallelIsChecked = isChecked;
		},

		handleCheckbox(isChecked) {
			this.columnIsChecked = isChecked;
		},

		handleSelectChange(id) {
			const item = findItemBy('id', id, this.selectOptionsList);
			this.value = item ? item.name : null;
		},

		handleAlternateValue(value) {
			// this.value = value;
			this.updating_value = value;
		},

		radioChange(action) {
			this.action = action;
			this.updating_value = null;

			switch (action) {
				case 1:
					this.value = null;
					break;
				case 2:
					this.value = this.errorItem.imported_value;
					this.showAlternateModal = true;
					break;
				case 3:
					this.value = this.errorItem.imported_value;
					break;
			}

			// console.log(val)
			// this.showAlternateModal = true;
		},

		getFormData() {
			let data = {
				log_item_id: this.errorItem ? this.errorItem.id : null,
				column_name: this.cellData.column_name,
				value: this.value
			};

			if (this.enableRadio) {
				data.action = this.action;
				data.updating_value = this.updating_value;
			}

			let payload = {	
				data,
				isValid: this.isRequired ? !!this.value : true,
			};

			return payload;
		},
	},

	watch: {
		columnIsChecked(isChecked) {
			// console.log('columnIsChecked')
			if (isChecked) {
				this.value = this.initialValue;
			} else {
				this.value = '';
			}

			if (this.cellData.pair_column_name) {
				this.$emit('event', {
					eventName: 'handleColumnChecked',
					data: {
						column_name: this.cellData.column_name,
						pair_column_name: this.cellData.pair_column_name,
						is_checked: isChecked
					}
				});
			}
		},

		parallelIsChecked(isChecked) {
			this.isRequired = isChecked;
			if (!isChecked) {
				this.value = '';
				this.selectedValue = null;
			}
		}
	},

	beforeMount() {
		if (this.enableCheckbox) {
			this.initialValue = this.cellData.value;
		} /* else {
			this.value = this.cellData.value;			
		}*/

		/*if (this.enableParallelCheckbox) {
			this.initialValue = this.cellData.value;
		}*/
	}
};
</script>
