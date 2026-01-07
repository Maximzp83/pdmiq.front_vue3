<template>
	<div class="special-filter-item">
		<!-- <SimpleSpinner :active="valuesLoading" /> -->
		<!-- @change="handleChange" -->
		<!-- :filter-method="q => selectQuery(q, queryOptions)" -->
		<CustomSelect
			filterable
			clearable
			multiple
			enabled
			collapse-tags
			:optionsLoading="valuesLoading"
			:optionsList="valuesList"
			:placeholder="`${type_option.name}`"
			@focus="fetchValues"
			v-model="selectedValues"
			:setupLabelSettings="labelOptions"
		/>

		<!-- <el-select
			className="multiple-select"
			filterable
			clearable
			multiple
			@focus="fetchValues"
			collapse-tags
			v-model="selectedValues"
			:placeholder="`${type_option.name}`"
		>
			<el-option
				v-for="(item, idx) in valuesList"
				:key="`option_id-${item.id}_index-${idx}`"
				:label="setupLabel(item, labelOptions)"
				:value="item.id"
			/>
		</el-select> -->
	</div>
</template>

<script>
import { /*setupLabel,*/ findItemBy /*getValues*/ } from '@/helpers';
// import { fetchByQueryMixin } from '@/mixins';

export default {
	// mixins: [fetchByQueryMixin],

	props: {
		// clearable: Boolean,
		// query: String,
		type_option: {
			type: Object,
			required: true
		}
		// currentRawOptionsValuesIDs: Array
	},

	data() {
		return {
			initialMount: true,
			selectedValues: [],

			valuesList: [],
			valuesLoading: false,

			predefinedOptionsValuesIDs: [],
			rawOptionsValuesIDs: []
		};
	},

	computed: {
		// setupLabel: () => setupLabel,

		/*queryOptions() {
			return {
				fetchAction: 'fetch_equipment_type_option_values',
				loadingProp: 'valuesLoading',
				listProp: 'valuesList',
				minQueryLength: 2,
				cleanValues: ['valuesList', 'selectedValues']
				// params: { plantId: this.userPlantId }
			};
		},*/

		labelOptions: () => ({
			accessors: [
				'value',
				'predefinedValue.value'
				// 'machine_name',
				// 'production_line_name',
				// 'location_name'
			],
			delimeter: ','
		})
	},

	methods: {
		/*collectedDataWithoutInjectToForm(payload) {
			let newPayload = {
				...payload,
				itemId: this.type_option.id
			}

			return newPayload;
		},*/

		fetchValues() {
			if (!this.valuesList.length) {
				this.valuesLoading = true;

				const payload = {
					itemId: this.type_option.id,
					params: { max: -1 }
				};

				this.fetch_equipment_type_option_values(payload)
					.then(({ value }) => {
						this.valuesList = value;
						this.valuesLoading = false;
					})
					.catch(e => {
						this.valuesLoading = false;
						console.log(e);
					});
			}
		},

		fetch_equipment_type_option_values(payload) {
			return this.$store.dispatch(
				'equipment_types/fetch_equipment_type_option_values',
				payload
			);
		}
	},

	watch: {
		selectedValues(values_ids) {
			/*console.log(this.initialMount)
			if (this.initialMount) {
				this.initialMount = false;
			} else {*/
			this.predefinedOptionsValuesIDs = [];
			this.rawOptionsValuesIDs = [];

			if (this.type_option.has_predefined_values) {
				if (values_ids.length) {
					values_ids.forEach(val_id => {
						const val = findItemBy('id', val_id, this.valuesList);

						if (val.predefined_value_id) {
							this.predefinedOptionsValuesIDs.push(val.predefined_value_id);
						}
					});
				}
			} else {
				if (values_ids.length) {
					values_ids.forEach(val_id => {
						const val = findItemBy('id', val_id, this.valuesList);

						this.rawOptionsValuesIDs = this.rawOptionsValuesIDs.concat(
							val.similar_ids
						);
					});
				}
			}

			this.$emit('change');
			// }
		}
	}

	/*created() {
		// console.log('created')
		if (this.currentRawOptionsValuesIDs) {
			// this.selectedValues = 
		}
	}*/
};
</script>
