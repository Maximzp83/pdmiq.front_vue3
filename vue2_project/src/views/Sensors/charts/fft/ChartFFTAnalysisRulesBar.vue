<template>
	<div class="chart-actions-block fftAnalysisBar">
		<div class="flex wrap mrow medium-padding align-center">
			<div class="semi-bold">{{ barTitle }}</div>
			<div
				v-for="(item, idx) in rulesList" :key="`button-${item.id}`"
				@click="addAnalysisRuleToSelected(item)"
			>
				<AnalysisRuleItem
					:crossoverRulesList="componentItem.crossoverRulesStore[item.original_rule_id]"
					:class="[{'isActive': item.isActive}]"
					:style="{ borderColor: item.borderColor }"					
					ref="AnalysisRuleItem"
					:item-data="item"
					:item-index="idx"
					:savingInProgress="savingInProgress"
					fromFFTPage
					insideChartAnalysisRulesBar
					@save="handleSaveRuleItem"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { updateFormData, findItemBy, prepareSubmitData } from '@/helpers';
import { RPM_SOURCES_TYPES } from '@/constants/global';

import { subItemsListMixin } from '@/mixins';

export default {
	mixins: [ subItemsListMixin()],
	props: {
		// actionButtons: { type: Array },
		// activeButtonValues: { type: Object, default: () => ({}) },
		componentItem: { type: Object, required: true },
		equipmentData: { type: Object, required: true },
		selectedAnalysisRules: Array
	},

	components: {
		AnalysisRuleItem: () => import('@/views/Equipments/AnalysisRuleItem.vue'),
	},

	data: () => ({
		savingInProgress: false,
		// analysisRuleFormData: {},

		formData: { // equipment form
			id: null,
			plant_id: null,
			asset_id: null,
			brand_id: null,
			brand_model_id: null,
			equipment_type_id: null,
			drive_type_id: null,
			is_limbo: false,
			loc_on_machine: '',
			is_store_room: 0,
			store_room_id: null,
			libraries: [],
			pictures: [],

			equipment_subtype_id: null,
			subtype_brand_id: null,
			subtype_brand_model_id: null,
			rpm_formula: '',

			rpm_value: '',
			rpm_option_value_id: null,
			rpm_external_node_id: null,
			rpm_external_node_parameter: null,
			rpm_external_source_type: RPM_SOURCES_TYPES.EXTERNAL_INPUT,
			rpm_source_item: null,

			vibration_analysis_rules: [],
			child_components: [],
			option_values: []
		},
	}),

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'AnalysisRuleItem', returnArray:1, targetProp: 'analysisRules' },
		]),

		rulesList() {
			if (this.componentItem.vibration_analysis_rules) {
				// console.log('1', this.componentItem.vibration_analysis_rules)
				return this.componentItem.vibration_analysis_rules.filter(ri => ri.custom_value || ri.option_value_id /*|| ri.vibration_analysis_value || ri.vibration_analysis_custom_value */).map(ri => ({
					...ri,
					isActive: this.selectedAnalysisRules.some(sri => sri.id === ri.id),
					borderColor: ri.color,
					// borderColor: this.calcBorderColor(ri),
				}));
			
			}
			return [];
		},

		barTitle() {
			const { original_component } = this.componentItem;
			let title = '';

			if (original_component) {
				title += original_component.name;

				if (original_component.child_types) {
					original_component.child_types.forEach((ti, idx) => {
						title += idx ? '/' : ' ';						
						title += ` ${ti.name}`;
					})
				}
			}
			return title;
		}
	},

	methods: {
		...mapActions({
			save_equipment: 'equipments/save_equipment',
		}),

		event(name, data) {
			this.$emit('event', name, data);
		},

		addAnalysisRuleToSelected(rule) {
			this.event('addAnalysisRuleToSelected', rule);
		},

		calcBorderColor(rule) {
			const ruleItem = findItemBy('id', rule.id, this.selectedAnalysisRules);
			// console.log(this.selectedAnalysisRules, ruleItem)
			return ruleItem ? ruleItem.color : '';
		},

		handleSaveRuleItem() {
			// this.formData = updateFormData(this.equipmentData, this.formData);
			
			if (this.subItemsSettings) {
				if (this.collectDataFromSubItems) {
					let { analysisRules } = this.collectDataFromSubItems(this.subItemsSettings);
					if (analysisRules) {
						const { index } = findItemBy('id', this.componentItem.id, this.equipmentData.child_components, {returnIndex:1});

						if (index != null) {
							this.formData = {
								...updateFormData(this.equipmentData, this.formData),
							};
							this.formData.child_components[index].vibration_analysis_rules = analysisRules;

							// console.log(this.formData)
							this.submitEquipment({...this.formData, });
						}
					}
				}
			}
		},

		submitEquipment(formData) {
			let payload = {
				data: prepareSubmitData(formData),
				itemName: this.tt('Item'),
			};
			/*if (process.env.NODE_ENV === 'development') {
				if (payload) {
					console.log(payload)
					return;
				}
			}*/
			this.savingInProgress = true;
			this.$emit('event', { eventName: 'toggleEquipmentSaving', data: true, onward:1 });

			this.save_equipment(payload)
				.then(({value}) => {
					// const { data, updateRoute } = answer;
					if (this.$refs.AnalysisRuleItem) {
						this.$refs.AnalysisRuleItem.forEach(ref => {
							ref.showAnalysisRuleFormDialog = false;
						})
					}
					this.savingInProgress = false;					
					this.$emit('event', {
						eventName: 'updateEquipmentAndFFT',
						data: {equipmentItem: value},
						onward:1
					});
					this.$emit('event', { eventName: 'toggleEquipmentSaving', data: false, onward:1 });	
				})
				.catch(() => {
					this.savingInProgress = false;					
					this.$emit('event', { eventName: 'toggleEquipmentSaving', data: false, onward:1 });	
				});
		},
	},
};
</script>
