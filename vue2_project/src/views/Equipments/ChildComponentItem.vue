<template>
	<div class="child-component-item analysis-item"
		v-if="fromFFTPage"
	>
		<!-- <div class="content-row">
			<b class="capitalize">Rules For {{ childEquipmentType.name }}:</b>
		</div> -->
		<!-- <div class="card-header">dfgdfg</div> -->
		<div class="article-title">{{childOriginalComponent.name}}</div>
		<div class="card filled_4 bordered pointer relative"
			v-if="formData.brand_model_id"
			@click="addChildComponentToSelected"
		>
			<SimpleSpinner :active="ruleOptionsLoading" />
			<div class="card-content">
				<div class="flex align-center">
					<div class="imgWrapper equipmentTypeImg div-block">
						<img :src="childEquipmentType && childEquipmentType.full_file_name" alt="">
					</div>
					<div class="div-block text-values">
						<div class="semi-bold" v-if="brandName">{{ brandName }}</div>
						<div class="semi-bold" v-if="brandModelName">{{ brandModelName }}</div>
					</div>

					<div class="div-block">
						<el-button
							:disabled="!preparedVibrationAnalysisItems.length"
							native-type="button"
							:class="[
								'action-button settings-button',
								// { active: showFilterbar }
							]"
							icon="el-icon-setting"
							@click.stop="handleShowAnalysisRuleFormDialog"
						/>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="bold">-</div>

		<el-dialog
			v-if="initiatedAnalisysRulesDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-analysis-values-dialog"
			:title="`${tt('Vibration_Analysis')}`"
			:visible.sync="showAnalisysRulesDialog"
		>	
			<AnalysisRuleItem
				:crossoverRulesList="crossoverRulesStore[rule.original_rule_id]"
				class="inside-child-component"
				ref="AnalysisRuleItem"
				v-for="(rule, idx) in preparedVibrationAnalysisItems"
				:key="`va-${rule.original_rule_id}`"
				:item-data="rule"
				:item-index="idx"
				:equipmentTypeId="formData.child_equipment_type_id"
				:rpm_source_value="rpm_source_value"
				:brandModelId="formData.brand_model_id"
				:savingInProgress="savingInProgress"
			/>

			<div class="dialog-footer dialog-decorate-footer text-center">
				<el-button
					type="primary"
					:loading="savingInProgress"
					@click="handleSave"
					class="uppercase semi-bold"
					>{{ tt('Save') }}</el-button
				>

				<el-button
					class="uppercase semi-bold"
					@click="showAnalisysRulesDialog = false"
					>{{ tt('Cancel') }}</el-button
				>
			</div>
			<!-- insideChildComponentItem -->
		</el-dialog>
	</div>

	<!-- --------------------- -->

	<div class="form-section type_2 paint_v2 content-row" v-else>
		<div class="content-row">
			<div class="flex mrow align-center">
				<b class="capitalize mcol-xs-auto">{{ childOriginalComponent.name }}</b>

				<CustomSelect
					@change="handleChildEquipmentTypeChange"
					:class="['mcol-xs-4', {'showJustInfo': childsEquipmentTypesList.length < 2}]"
					className="mini"
					:optionsLoading="equipmentTypesLoading"
					:optionsList="childsEquipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.child_equipment_type_id"
				/>				
			</div>
		</div>
		
		<el-form
			ref="itemForm"
			:class="['option-item-container content-row']"
			:model="formData"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div >
				<el-form-item
					:label="`${tt('Brand')}`"
					prop="brand_id"
					class="half-width"
				>
					<FetchByQuerySelect
						@change="handleChangeBrand"
						clearable
						enableLoadmore
						v-model="formData.brand_id"
						:optionsLoading.sync="brandsLoading"
						:optionsList.sync="brandsList"
						:settings="brandQueryOptions"
						:placeholder="`${tt('select')} ${tt('brand')}`"
					/>
				</el-form-item>

				<el-form-item
					:label="`${tt('Part')} ${tt('Number')}`"
					prop="brand_model_id"
					class="half-width"
				>
						<!-- :loadmoreIsActive="!formData.brand_id" -->
					<FetchByQuerySelect
						clearable
						enableLoadmore
						v-model="formData.brand_model_id"
						:optionsLoading.sync="brandModelsLoading"
						:optionsList.sync="brandModelsList"
						:settings="brandModelsQueryOptions"
						:placeholder="`${tt('select')} ${tt('part_number')}`"
					/>
				</el-form-item>

				<div class="el-form-item"
					v-if="preparedVibrationAnalysisItems.length && formData.brand_model_id"
				>
					<div class="content-row">
						<b>{{tt('Vibration_Analysis')}}:</b>
					</div>

					<AnalysisRuleItem
						:crossoverRulesList="crossoverRulesStore[rule.original_rule_id]"
						class="el-form-item content-row"
						ref="AnalysisRuleItem"
						v-for="(rule, idx) in preparedVibrationAnalysisItems"
						:key="`va-${rule.original_rule_id}`"
						:item-data="rule"
						:item-index="idx"
						:equipmentTypeId="formData.child_equipment_type_id"
						:brandModelId="formData.brand_model_id"
						:rpm_source_value="rpm_source_value"						
					/>
				</div>
			</div>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { findItemBy } from '@/helpers';

import { subItemMixin, subItemsListMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [subItemMixin(), subItemsListMixin(), fetchItemsHelper()],
	props: {
		fromFFTPage: Boolean,
		equipmentTypesList: Array,
		equipmentTypesLoading: Boolean,
		savingInProgress: Boolean,
		rpm_source_value: null
		// equipmentTypeId: Number,
		// brandModelId: Number
	},

	components: {
		AnalysisRuleItem: () => import('./AnalysisRuleItem.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
	},

	data() {
		return {
			isMobile: false,
			brandsLoading: false,
			brandsList:[],
			brandModelsLoading: false,
			brandModelsList:[],

			vibrationAnalysisList: [],
			vibrationAnalysisLoading: false,

			formData: {
				id: null,
				original_component_id: null,
				brand_id: null,
				brand_model_id: null,
				vibration_analysis_rules: [],


				// -----------------
				child_equipment_type_id: null,
			},

			initiatedAnalisysRulesDialog: false,
			showAnalisysRulesDialog: false,

			ruleOptionsLoading: false,
			crossoverRulesStore: {},

		};
	},

	computed: {
		deleteNewId: () => true,

		subItemsSettings: () => Object.freeze([
			{ ref: 'AnalysisRuleItem', targetProp: 'vibration_analysis_rules' },
		]),

		childOriginalComponent: that => that.itemData.original_component,
		// childEquipmentType: that => that.childOriginalComponent.child,
		childEquipmentType: that => that.itemData.child_equipment_type,

		// ------new feature---
		childsEquipmentTypesList: that => that.childOriginalComponent.child_types || [],

		// ----------------------

		brandQueryOptions() {
			return Object.freeze({
				fetchAction: 'brands/fetch_brands',
				params: {
					orderByColumn: 'name',
					orderByMethod: 'asc',
					equipmentTypeId: this.formData.child_equipment_type_id || this.itemData.original_component_id,
					// machineId: this.multiFormFilters ? this.multiFormFilters.machineId : null
				}
			});
		},

		brandModelsQueryOptions() {
			return Object.freeze({
				fetchAction: 'brand_models/fetch_brand_models',
				params: {
					brandId: this.formData.brand_id,
					equipmentTypeId: this.formData.child_equipment_type_id || this.itemData.original_component_id,
				}
			});
		},

		/*requestsToDoList() {
			// console.log(3, this.filtersStateName, this.filters.assetId)
			let { brand_id, brand_model_id } = this.itemData;

			return Object.freeze([
				{
					action: 'fetch_brands',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: brand_id
						? {
								fetchById: { action: 'brands/fetch_brand', itemId: brand_id }
						  }
						: null,
					bindTo: [],
					localProp: 'brandsList',
					localLoadProp: 'brandsLoading'
				},
				{
					action: 'fetch_brand_models',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: brand_model_id
						? {
								fetchById: {
									action: 'brand_models/fetch_brand_model',
									itemId: brand_model_id
								}
						  }
						: null,
					bindTo: [
						{
							prop: 'formData.brandId',
							param: 'brandId'
						}
					],
					localProp: 'brandModelsList',
					localLoadProp: 'brandModelsLoading'
				}
			]);
		},*/

		preparedVibrationAnalysisItems() {
			// console.log('preparedVibrationAnalysisItems', this.vibrationAnalysisList, this.itemData)
			if (this.vibrationAnalysisList.length) {
				return this.vibrationAnalysisList.map(rule => {
					const existingRule = findItemBy('original_rule_id', rule.id, this.itemData.vibration_analysis_rules || []);

					if (existingRule) {
						return {...existingRule	};
					}

					return {
						original_rule: {...rule},
						id: null,
						original_rule_id: rule.id
					}
				})
			}

			return [];
		},

		preparedVibrationAnalysisItemsWithCrossoverValue() {
			if (this.preparedVibrationAnalysisItems && Object.keys(this.crossoverRulesStore).length) {
				return this.preparedVibrationAnalysisItems.map(rule => {
					const ruleOptionsList = this.crossoverRulesStore[rule.original_rule_id] || [];
					const item = ruleOptionsList.find(item => item.id === rule.option_value_id);
					// console.log(ruleOptionsList, rule, item)
					return {
						...rule,
						vibration_analysis_value: item ? item.vibration_analysis_value : null
					}
				});
			}
			return this.preparedVibrationAnalysisItems;
		},

		brandName() {
			if (this.brandsList.length && this.formData.brand_id) {
				const item = findItemBy('id', this.formData.brand_id, this.brandsList);
				if (item) {
					return item.name;
				}
			}
			return '';
		},
		brandModelName() {
			if (this.brandModelsList.length && this.formData.brand_model_id) {
				const item = findItemBy('id', this.formData.brand_model_id, this.brandModelsList);
				if (item) {
					return item.name;
				}
			}
			return '';
		},		
	},

	methods: {
		...mapActions({
			fetch_vibration_analysis_rules: 'equipments/fetch_vibration_analysis_rules',
			fetch_vibration_analysis_rule_crossover_options: 'equipments/fetch_vibration_analysis_rule_crossover_options',

		}),

		handleChangeBrand() {
			this.formData.brand_model_id = null;
			this.brandModelsList = [];
		},

		fetchVibrationAnalysis(equipmentTypeId) {
			const payload = { 
				equipmentTypeId,
				// params: { max: -1 }
			};

			this.doFetchAction(
				'fetch_vibration_analysis_rules',
				'vibrationAnalysisList',
				'vibrationAnalysisLoading',
				payload
			);
		},

		fetchAnalysisRuleCrossoverOptions({ ruleId, equipmentTypeId }) {
			const payload = { 
				equipmentTypeId,
				ruleId,
				params: { brand_model_id: this.formData.brand_model_id, rpm: this.rpm_source_value }
			};

			this.ruleOptionsLoading = true;

			return this.fetch_vibration_analysis_rule_crossover_options(payload).then(({value}) => {
				this.crossoverRulesStore[ruleId] = value;
			});
		},

		localSetupPageActions(item) {
			if (item.brand) this.brandsList.push(item.brand);
			if (item.brand_model) this.brandModelsList.push(item.brand_model);

			// -------new (temp)-----
			if (item) {
				if (!item.child_equipment_type_id && item.original_component && item.original_component.child_type_ids.length) {
					this.formData.child_equipment_type_id = item.original_component.child_type_ids[0];
				}
			}
			/*if (this.childsEquipmentTypesList.length) {
				this.formData.child_equipment_type_id = this.childsEquipmentTypesList[0].id;	
			}*/
		},

		/*localGetFormDataCallback(formData) {
			if (!formData.vibration_analysis_rules.length) {
				delete formData.vibration_analysis_rules;
			}
			return formData;
		},*/

		handleSave() {
			this.$emit('save');
		},

		// -----------------
		fetchCrossoverAnalysisOptionsAndDoAction(callback) {
			if (this.preparedVibrationAnalysisItems) {
				let responses = 0;

				this.preparedVibrationAnalysisItems.forEach(rule => {
					if (this.crossoverRulesStore[rule.original_rule_id]) {
						responses++;
						if (responses >= this.preparedVibrationAnalysisItems.length) {
							this.ruleOptionsLoading = false;
							callback();
						}
					} else {
						this.fetchAnalysisRuleCrossoverOptions({
							ruleId: rule.original_rule_id,
							equipmentTypeId: this.formData.child_equipment_type_id,
						}).then(() => {	
							responses++;
							if (responses >= this.preparedVibrationAnalysisItems.length) {
								this.ruleOptionsLoading = false;								
								callback();
							}
						})
					}
				})
			}
		},

		handleShowAnalysisRuleFormDialog() {
			this.fetchCrossoverAnalysisOptionsAndDoAction(() => {
				this.initiatedAnalisysRulesDialog = true;
				this.showAnalisysRulesDialog = true;
			});
		},

		addChildComponentToSelected() {
			this.fetchCrossoverAnalysisOptionsAndDoAction(() => {
				this.$emit('event', {
					eventName: 'addChildComponentToSelected',
					data: {
						...this.itemData,
						vibration_analysis_rules: this.preparedVibrationAnalysisItemsWithCrossoverValue,
						crossoverRulesStore: this.crossoverRulesStore || {}
					},
					onward: true
				})
			});
		},

		handleChildEquipmentTypeChange() {
			this.brandsList = [];
			this.formData.brand_id = null;
			this.brandModelsList = [];
			this.formData.brand_model_id = null;
		}

	},

	watch: {
		'formData.child_equipment_type_id'(id) {
			// console.log('child_equipment_type_id', id)
			if (
				id/* && (
					!this.itemData.vibration_analysis_rules || !this.itemData.vibration_analysis_rules.length
				)*/
			) {
				this.fetchVibrationAnalysis(id);
			}
		},

		/*preparedVibrationAnalysisItems(items) {
			if (items) {
				items.forEach(rule => {
					this.fetchAnalysisRuleCrossoverOptions({
						ruleId: rule.original_rule_id,
						equipmentTypeId: this.formData.child_equipment_type_id,
					});
				})
			}
		}*/
	},

	created() {
		if (
			this.itemData.child_equipment_type_id && (
				!this.itemData.vibration_analysis_rules || !this.itemData.vibration_analysis_rules.length
			)
		) {
			this.fetchVibrationAnalysis(this.itemData.child_equipment_type_id);
		}
	},

	beforeMount() {
		this.isMobile = document.documentElement.clientWidth < 992;
	},

};
</script>
