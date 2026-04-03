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
					@save="validateRuleItem(idx)"
					:rootFilters="rootFilters"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { cloneDeep } from 'lodash';
import { findItemBy } from '@/helpers';

import { subItemsListMixin } from '@/mixins';

export default {
	mixins: [ subItemsListMixin()],
	props: {
		// actionButtons: { type: Array },
		// activeButtonValues: { type: Object, default: () => ({}) },
		componentItem: { type: Object, required: true },
		equipmentData: { type: Object, required: true },
		currentFFTItem: { type: Object, default: null },
		sensorId: { type: Number, required: true },
		selectedAnalysisRules: Array,
		rootFilters: Object,
	},

	components: {
		AnalysisRuleItem: () => import('@/views/Equipments/AnalysisRuleItem.vue'),
	},

	data: () => ({
		savingInProgress: false,
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
			save_fft_vibration_analysis_rule_override: 'sensors/save_fft_vibration_analysis_rule_override',
			delete_fft_vibration_analysis_rule_override: 'sensors/delete_fft_vibration_analysis_rule_override',
		}),

		event(name, data) {
			this.$emit('event', name, data);
		},

		addAnalysisRuleToSelected(rule) {
			this.event('addAnalysisRuleToSelected', rule);
		},

		validateRuleItem(idx) {
			if ( this.validateSubItemsForm(this.subItemsSettings) ) {
				const { analysisRules } = this.collectDataFromSubItems(this.subItemsSettings);
				this.handleSaveRuleItem(  analysisRules[idx] );	
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
				return false;
			}
		},


		handleSaveRuleItem(currentRuleData) {
			if (currentRuleData) {
				const rule = findItemBy('original_rule_id', currentRuleData.original_rule_id, this.rulesList);

				const harmonics = currentRuleData && currentRuleData.harmonics != null ? `${currentRuleData.harmonics}`.trim() : '';
				/*const defaultHarmonics = rule.original_rule && rule.original_rule.harmonics != null
					? `${rule.original_rule.harmonics}`.trim()
					: '';*/
				const shouldDeleteOverride = !harmonics //|| harmonics === defaultHarmonics;
				const payload = {
					sensorId: this.sensorId,
					fftId: this.currentFFTItem.id,
					originalRuleId: rule.original_rule_id
				};


				const action = shouldDeleteOverride
					? this.delete_fft_vibration_analysis_rule_override(payload)
					: this.save_fft_vibration_analysis_rule_override({
						...payload,
						data: {
							original_rule_id: rule.original_rule_id,
							harmonics
						}
					});

					/*if (process.env.NODE_ENV === 'development') {
						if (payload) {
							console.log(shouldDeleteOverride ? payload : {
						...payload,
								data: {
									original_rule_id: rule.original_rule_id,
									harmonics
								}
							})
							return;
						}
					}*/
				this.savingInProgress = true;

				action
					.then(() => {
						this.emitUpdatedFFTItem({
							originalRuleId: rule.original_rule_id,
							harmonics,
							shouldDeleteOverride
						});
						if (this.$refs.AnalysisRuleItem) {
							this.$refs.AnalysisRuleItem.forEach(ref => {
								ref.showAnalysisRuleFormDialog = false;
							})
						}
						this.savingInProgress = false;
					})
					.catch(() => {
						this.savingInProgress = false;
					});
			}
			/*const ruleRef = this.$refs.AnalysisRuleItem && this.$refs.AnalysisRuleItem[idx];
			const rule = this.rulesList[idx];

			if (!ruleRef || !rule) return;

			if (!ruleRef.validateItemForm()) return;
			if (!this.currentFFTItem) return;

			let currentRuleData = null;
			if (this.subItemsSettings) {
				if (this.collectDataFromSubItems) {
					let { analysisRules } = this.collectDataFromSubItems(this.subItemsSettings);
					if (analysisRules) {
						console.log(analysisRules, this.componentItem.id, this.equipmentData.child_components)
						currentRuleData = findItemBy('id', rule.id, analysisRules);
					}
				}
			}
			if (!currentRuleData) return;

			const harmonics = currentRuleData && currentRuleData.harmonics != null ? `${currentRuleData.harmonics}`.trim() : '';
			const defaultHarmonics = rule.original_rule && rule.original_rule.harmonics != null
				? `${rule.original_rule.harmonics}`.trim()
				: '';
			const shouldDeleteOverride = !harmonics || harmonics === defaultHarmonics;
			const payload = {
				sensorId: this.sensorId,
				fftId: this.currentFFTItem.id,
				originalRuleId: rule.original_rule_id
			};


			const action = shouldDeleteOverride
				? this.delete_fft_vibration_analysis_rule_override(payload)
				: this.save_fft_vibration_analysis_rule_override({
					...payload,
					data: {
						original_rule_id: rule.original_rule_id,
						harmonics
					}
				});

				if (process.env.NODE_ENV === 'development') {
					if (payload) {
						console.log(shouldDeleteOverride ? payload : {
					...payload,
							data: {
								original_rule_id: rule.original_rule_id,
								harmonics
							}
						})
						return;
					}
				}
			this.savingInProgress = true;

			action
				.then(() => {
					this.emitUpdatedFFTItem({
						originalRuleId: rule.original_rule_id,
						harmonics,
						shouldDeleteOverride
					});
					if (this.$refs.AnalysisRuleItem) {
						this.$refs.AnalysisRuleItem.forEach(ref => {
							ref.showAnalysisRuleFormDialog = false;
						})
					}
					this.savingInProgress = false;
				})
				.catch(() => {
					this.savingInProgress = false;
				});*/
		},

		emitUpdatedFFTItem({ originalRuleId, harmonics, /*shouldDeleteOverride*/ }) {
			const fftItem = cloneDeep(this.currentFFTItem);
			const {index} = findItemBy('original_rule_id', originalRuleId, fftItem.vibration_analysis_rules, {returnIndex: true});

			if (index == null) {
				fftItem.vibration_analysis_rules.push({
					original_rule_id: originalRuleId,
					harmonics
				})
			} else {
				fftItem.vibration_analysis_rules[index] = {
					original_rule_id: originalRuleId,
					harmonics
				}
			}

			/*const overrides = Array.isArray(fftItem.vibration_analysis_rules)
				? [...fftItem.vibration_analysis_rules]
				: [];
			const overrideIndex = overrides.findIndex(item => item.original_rule_id === originalRuleId);

			if (shouldDeleteOverride) {
				if (overrideIndex !== -1) {
					overrides.splice(overrideIndex, 1);
				}
			} else {
				const nextItem = {
					original_rule_id: originalRuleId,
					harmonics
				};

				if (overrideIndex === -1) {
					overrides.push(nextItem);
				} else {
					overrides.splice(overrideIndex, 1, nextItem);
				}
			}
			*/

			this.$emit('event', {
				eventName: 'updateEquipmentAndFFT',
				data: { fftItem, updateVibrationAnalysisRules:1, skipFFTReload:1 },
				onward: 1
			});
		},
	},
};
</script>
