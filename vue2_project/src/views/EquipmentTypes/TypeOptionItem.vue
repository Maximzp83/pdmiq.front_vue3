<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container type-option-item', { fromModal: fromModal }]"
		:model="formData"
	>
		<!-- <div :class="['flex mrow content-container content-row',
			{'withAbsoluteRow rows-2': formData.crossover_rule_type === CROSSOVER_RULES_TYPES.RANGE }
		]"> -->
		<div :class="['flex mrow content-container content-row', { wrap: fromModal }]">
			<el-form-item
				prop="category_ids"
				:class="[fromModal ? 'mcol-xs-4' : 'mcol-xs-2']"
			>
				<label>{{ `${tt('Type')} ${tt('Category')}` }}</label>
				<CustomSelect
					className="mini"
					multiple
					collapse-tags
					:optionsList="typesCategoriesList"
					:placeholder="`${tt('Select')} ${tt('category')}`"
					v-model="formData.category_ids"
				/>
			</el-form-item>

			<el-form-item prop="name" :class="[fromModal ? 'mcol-xs-4' : 'mcol-xs-2']" required>
				<label>{{ tt('Name') }}</label>
				<CustomInput v-model="formData.name" :placeholder="tt('name')"/>
			</el-form-item>

			<el-form-item
				prop="crossover_rule_type"
				:class="[fromModal ? 'mcol-xs-4' : 'mcol-xs-2', 'relative']"
			>
				<label>{{ tt('phrases.Crossover_Rule_Type') }}</label>
				<CustomSelect
					clearable
					:optionsList="crossoverRulesTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.crossover_rule_type"
				/>

				<div
					class="flex mrow wrap sub-row"
					v-if="formData.crossover_rule_type === CROSSOVER_RULES_TYPES.RANGE"
				>
					<el-form-item class="mcol-xs-12" prop="range_type">
						<label>{{ `${tt('Range')} ${tt('type')}` }}</label>
						<CustomSelect
							clearable
							:optionsList="crossoverRuleRangeTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							v-model="formData.range_type"
						/>
					</el-form-item>

					<el-form-item class="mcol-xs-6" prop="value_minus">
						<label>{{ tt('Minus') }}</label>
						<CustomInput v-model="formData.value_minus" :placeholder="tt('value')" />
					</el-form-item>

					<el-form-item class="mcol-xs-6" prop="value_plus">
						<label>{{ tt('Plus') }}</label>
						<CustomInput v-model="formData.value_plus" :placeholder="tt('value')" />
					</el-form-item>
				</div>
			</el-form-item>

			<!-- <div class="el-form-item switchers-block mcol-xs-8 flex mrow"> -->
			<el-form-item
				prop="has_predefined_values"
				:class="[
					fromModal ? 'mcol-xs-4' : 'mcol-xs-2',
					'predefined-switch relative switchers-block'
				]"
			>
				<label class="small-lh">{{ `${tt('has')} ${tt('predefined')}` }}</label>
				<el-switch
					class="without-margin"
					v-model="formData.has_predefined_values"
					:active-value="1"
					:inactive-value="0"
				/>

				<div class="flex mrow wrap" v-if="formData.has_predefined_values">
					<el-form-item prop="predefined_values" class="predefined-values">
						<!-- <label>Predefined values</label> -->

						<div class="options-container relative">
							<div v-if="predefinedValuesItemsList.length" class="content-row">
								<PredefinedValueItem
									ref="PredefinedValueItem"
									v-for="(item, idx) in predefinedValuesItemsList"
									:key="`pv_item-${item.id}`"
									:item-data="item"
									:item-index="idx"
									@onRemove="id => removeFormItem(id, 'predefinedValuesItemsList')"
								/>
							</div>

							<div class="create-button-container">
								<el-button
									:disabled="!formData.has_predefined_values"
									class="action-button create-button"
									size="mini"
									type="success"
									icon="icomoon icon-cross"
									@click="addFormItem('predefinedValuesItemsList', 'pv_i-')"
								/>
							</div>
						</div>
					</el-form-item>
				</div>
			</el-form-item>

			<el-form-item prop="is_in_dashboard_view" class="mcol-xs-1 switchers-block ">
				<label class="small-lh">{{ `${tt('phrases.show_in_filter')}` }}</label>
				<el-switch
					class="without-margin"
					v-model="formData.is_in_dashboard_view"
					:active-value="1"
					:inactive-value="0"
				/>
				<!-- <el-checkbox v-model="formData.is_in_dashboard_view" /> -->
			</el-form-item>

			<el-form-item prop="is_in_equipment_card" class="mcol-xs-1 switchers-block">
				<label>{{ `${tt('phrases.show_in_item')}` }}</label>
				<el-switch
					v-model="formData.is_in_equipment_card"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="is_visible_in_vibration_analysis" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ `${tt('phrases.show_in_Analysis')}` }}</label>
				<el-switch
					class="without-margin"
					v-model="formData.is_visible_in_vibration_analysis"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				prop="convert_to_predefined_values"
				class="mcol-xs-1 switchers-block "
			>
				<label class="small-lh">{{
					`${tt('phrases.convert_to_predefined')}`
				}}</label>
				<el-switch
					class="without-margin"
					v-model="formData.convert_to_predefined_values"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="is_rpm" class="mcol-xs-1 switchers-block">
				<label>{{ tt('Is_RPM') }}</label>
				<el-switch v-model="formData.is_rpm" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item prop="is_fla" class="mcol-xs-1 switchers-block">
				<label>{{ tt('Is_FLA') }}</label>
				<el-switch v-model="formData.is_fla" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<div class="">
				<el-button
					class="action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>
			<!-- </div> -->
		</div>
	</el-form>
</template>

<script>
import {
	CROSSOVER_RULES_TYPES,
	crossoverRulesTypesList,
	crossoverRuleRangeTypesList
} from '@/constants/global';
import { subItemMixin, createFormItemMixin } from '@/mixins';
import { removeObjProps } from '@/helpers';

export default {
	mixins: [subItemMixin(), createFormItemMixin()],
	components: {
		PredefinedValueItem: () => import('./PredefinedValueItem.vue')
	},
	props: {
		showLabelsIndex: {
			type: Number,
			default: 0
		},
		typesCategoriesList: { type: Array, default: () => [] },
		fromModal: Boolean
	},
	data() {
		return {
			predefinedValuesItemsList: [],

			formData: {
				id: null,
				category_ids: null,
				name: '',
				has_predefined_values: false,
				predefined_values: [],
				crossover_rule_type: null,
				range_type: null,
				value_minus: '',
				value_plus: '',
				is_in_dashboard_view: false,
				is_in_equipment_card: false,
				is_visible_in_vibration_analysis: false,
				is_rpm: false,
				is_fla: false,
				convert_to_predefined_values: false
			}
		};
	},

	computed: {
		deleteNewId: () => true,
		CROSSOVER_RULES_TYPES: () => CROSSOVER_RULES_TYPES,
		crossoverRulesTypesList: () => Object.freeze(crossoverRulesTypesList()),
		crossoverRuleRangeTypesList: () => Object.freeze(crossoverRuleRangeTypesList()),

	},

	methods: {
		localSetupPageActions(itemData) {
			if (itemData) {
				this.predefinedValuesItemsList = this.setupFormSubItemsList(
					itemData.predefined_values,
					'pv_i'
				);
			}
		},

		localGetFormDataCallback(data) {
			const {
				has_predefined_values,
				crossover_rule_type,
				// predefined_values
			} = data;

			let deleteProps = [];

			if (crossover_rule_type !== CROSSOVER_RULES_TYPES.RANGE) {
				deleteProps.push('range_type', 'value_minus', 'value_plus');
			} else {
				let { value_minus, value_plus } = data;
				data.value_minus = value_minus ? value_minus + '' : value_minus;
				data.value_plus = value_plus ? value_plus + '' : value_plus;
			}

			if (has_predefined_values) {
				data.predefined_values = this.$refs.PredefinedValueItem.map(
					pi => pi.getFormData()
				);
			} else {
				deleteProps.push('predefined_values');				
			}

			if (!crossover_rule_type) {
				deleteProps.push('crossover_rule_type');
			}

			data = removeObjProps(data, deleteProps);
			// data.predefined_values = predefined_values;
			// console.log('2', data)
			return data;
		},

		removeItem() {
			const { tt } = this;
			this.$confirm({
				title: 'Warning',
				message: `${tt('phrases.Do_you_really_want_to')} ${tt(
					'phrases.delete_this_option'
				)}? ${tt('Continue')}?`,
				confirmButtonText: tt('Confirm'),
				showCancelButton: true,
				cancelButtonText: tt('Cancel'),
				iconClass: 'icomoon icon-warning',
				type: 'warning'
			})
				.then(() => {
					this.$emit('onRemove', this.itemId);
				})
				.catch(() => {
					//
				});
		}
	},

	/*mounted() {
		console.log('mounted')

		// this.$emit('mounted')
	}*/
};
</script>
