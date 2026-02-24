<template>
	<div :class="['analysis-item', {'flex align-center': insideChartAnalysisRulesBar}]" v-if="fromFFTPage">
		<div :class="[insideChartAnalysisRulesBar ? 'semi-bold title-block' : 'article-title']">{{ original_rule.name }}</div>
		<div :class="[
			{'card filled_4 bordered': !insideChildComponentItem && !insideChartAnalysisRulesBar },
			{'ml-auto': insideChildComponentItem },
		]">
			<div :class="[
				{'card-content': !insideChildComponentItem && !insideChartAnalysisRulesBar},
				{'data-block': insideChildComponentItem},
				{'flex align-center data-block': insideChartAnalysisRulesBar},
			]">
				<SimpleSpinner :active="ruleOptionsLoading" />
				<div class="value">{{selectedRuleItemTextValue}}</div>
				<div class="unit">{{original_rule.unit}}</div>
				<el-button
					@click.stop="handleShowAnalysisRuleFormDialog"
					native-type="button"
					:class="[
						'action-button settings-button',
						// { active: showFilterbar }
					]"
					icon="el-icon-setting"
				/>
			</div>
		</div>

		<el-dialog
			v-if="initiatedAnalysisRuleFormDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-analysis-values-dialog"
			title="Settings"
			:visible.sync="showAnalysisRuleFormDialog"
		>	
			<el-form
				ref="itemForm"
				:class="['option-item-container']"
				:model="formData"
				label-width="200px"
				:label-position="isMobile ? 'top' : 'left'"
			>
				<el-form-item
					:label="original_rule.name"
					prop="option_value_id"
					class=""
				>
					<div class="flex align-center">
							<!-- default-first-option -->
						<CustomSelect
							class="mcol-xs-11 span-block"
							filterable
							clearable
							allow-create
							:enabled="true"
							:optionsLoading="ruleOptionsLoading"
							:optionsList="ruleOptionsList"
							:placeholder="`${tt('Select')} ${tt('option')}`"
							labelKey="vibration_analysis_value"
							v-model="formData.option_value_id"
						/>
					
						<span class="span-block mcol-xs-1"> {{original_rule.unit}}</span>
					</div>
				</el-form-item>
			</el-form>
			
			<div class="dialog-footer dialog-decorate-footer text-center">
				<!-- :loading="sensorJobSaving" -->
				<el-button
					type="primary"
					:loading="savingInProgress"
					@click="handleSave"
					class="uppercase semi-bold"
					>{{ tt('Save') }}</el-button
				>

				<el-button
					class="uppercase semi-bold"
					@click="showAnalysisRuleFormDialog = false"
					>{{ tt('Cancel') }}</el-button
				>
			</div>
		</el-dialog>
	</div>

	<el-form
		v-else
		ref="itemForm"
		:class="['option-item-container']"
		:model="formData"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item
			:label="original_rule.name"
			prop="option_value_id"
			class=""
		>
			<div class="flex align-center" >
					<!-- default-first-option -->
				<CustomInput
					class="mcol-xs-8"
					v-if="original_rule.is_editable && isCustomEnabled"
					:placeholder="`${tt('Input')}`"
					v-model="formData.custom_value"
				/>

				<CustomSelect
					v-else
					class="mcol-xs-8"
					filterable
					clearable
					:optionsLoading="ruleOptionsLoading"
					:optionsList="ruleOptionsList"
					:placeholder="`${tt('Select')} ${tt('option')}`"
					labelKey="vibration_analysis_value"
					v-model="formData.option_value_id"
				/>
				<span class="mcol-xs-2 text-center"> {{original_rule.unit}}</span>
				
				<div v-if="original_rule.is_editable"
					class="pointer mcol-xs-2 ml-auto"
					@click="isCustomEnabled = !isCustomEnabled"
				>
					{{ isCustomEnabled ? 'Spec' : tt('Custom') }}
				</div>
			</div>
		</el-form-item>
	</el-form>

</template>

<script>
import { mapActions } from 'vuex';

import { subItemMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [subItemMixin(), fetchItemsHelper()],
	props: {
		equipmentTypeId: Number,
		brandModelId: Number,
		fromFFTPage: Boolean,
		insideChildComponentItem: Boolean,
		insideChartAnalysisRulesBar: Boolean,
		savingInProgress: Boolean,
		rpm_source_value: null,
		crossoverRulesList: null
	},

	data() {
		return {
			initiatedAnalysisRuleFormDialog: false,
			showAnalysisRuleFormDialog: false,

			ruleOptionsLoading: false,
			localCrossoverOptionsList: [],
			isMobile: false,

			isCustomEnabled: false,

			formData: {
				id: null,
				original_rule_id: null,
				option_value_id: null,
				custom_value: null,
				// vibration_analysis_value: null,
			}
		};
	},

	computed: {
		deleteNewId: () => true,
		original_rule: that => that.itemData.original_rule,

		selectedRuleItemTextValue() {
			const { custom_value, option_value_id } = this.itemData;
			if (custom_value) {
				return custom_value
			} else if (option_value_id) {
				const item = this.ruleOptionsList.find(item => item.id === option_value_id);
				return item ? (item.vibration_analysis_value || item.value) : '-'
			}
			return '-';
		},

		ruleOptionsList: that => that.crossoverRulesList || that.localCrossoverOptionsList
	},

	methods: {
		...mapActions({
			fetch_vibration_analysis_rule_crossover_options: 'equipments/fetch_vibration_analysis_rule_crossover_options',
		}),

		handleShowAnalysisRuleFormDialog() {
			this.initiatedAnalysisRuleFormDialog = true;
			this.showAnalysisRuleFormDialog = true;
		},

		handleSave() {
			this.$emit('save');
		},

		fetchAnalysisRuleCrossoverOptions() {
			const payload = { 
				equipmentTypeId: this.equipmentTypeId,
				ruleId: this.itemData.original_rule_id,
				params: { brand_model_id: this.brandModelId, rpm: this.rpm_source_value }
			};

			this.doFetchAction(
				'fetch_vibration_analysis_rule_crossover_options',
				'localCrossoverOptionsList',
				'ruleOptionsLoading',
				payload
			);
		},

		/*localSetupPageActions() {
			this.isCustomEnabled = this.original_rule.is_editable;
		},*/

		localGetFormDataCallback(formData) {
			if (this.isCustomEnabled) {
				formData.option_value_id = null;
			} else {
				formData.custom_value = null;
			}
			return formData;
		}
	},

	watch: {
		brandModelId() {
			// console.log('brandModelId', id)
			this.fetchAnalysisRuleCrossoverOptions();			
		}
	
	},

	created() {
		// console.log(this.equipmentTypeId)
		if (this.equipmentTypeId && !this.crossoverRulesList) {
			this.fetchAnalysisRuleCrossoverOptions();			
		}

	},

	beforeMount() {
		this.isMobile = document.documentElement.clientWidth < 992;
	},
};
</script>
