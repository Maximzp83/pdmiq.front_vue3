<template>
	<div class="vibration-analysis-block flex mrow">
		<div class="mcol-xs-12 mcol-sm-3 mcol-lg-auto part-number-options ">
			<!-- <div class="brand-logo">logo</div> -->

			<div class="flex filled_4">
				<ul class="div-block semi-bold">
					<li
						v-for="type_option in brandModelTypeOptionValuesVisible"
						:key="`option-${type_option.equipment_type_option_id}`"
						class="option-item flex mrow"
					>
						<div class="mcol-xs-5">{{ type_option.name }}</div>
						<div class="mcol-xs-7" v-html="type_option.value"></div>
					</li>
				</ul>
				
				<div class="div-block ">
					<el-button
						native-type="button"
						:class="[
							'action-button settings-button',
							// { active: showFilterbar }
						]"
						icon="el-icon-setting"
						@click="showOptionValues"
					/>
				</div>
			</div>
		</div>

		<div class="mcol-xs-12 mcol-sm-9 vibration-analysis-options">
			<div class="flex mrow wrap medium-padding">
				
				<div class="analysis-item mcol-xs-auto" v-if="currentRpmSource">
					<div class="article-title">{{ tt('Speed') }}</div>
					<div class="card filled_4 bordered">
						<div class="card-content">
							<i class="el-icon-odometer"></i>
							<div class="value">{{ currentRpmSource.value }} RPM</div>
							<el-button
								native-type="button"
								:class="[
									'action-button settings-button',
									// { active: showFilterbar }
								]"
								icon="el-icon-setting"
								@click="showRpmSettings"
							/>
						</div>
					</div>
				</div>

				<AnalysisRuleItem
					class="mcol-xs-auto"
					ref="AnalysisRuleItem"
					v-for="(rule, idx) in preparedVibrationAnalysisItems"
					:key="`va-${rule.original_rule_id}`"
					:item-data="rule"
					:item-index="idx"
					:equipmentTypeId="itemData.equipment_type_id"
					:brandModelId="itemData.brand_model_id"
					fromFFTPage					
					@save="handleSaveForm"
					:savingInProgress="savingInProgress"
				/>

				<div
					class="content-row paint child-components-wrapper"
					v-if="preparedChildComponentsItems.length"
				>
					<div class="flex mrow wrap medium-padding">
						<ChildComponentItem
							@event="handleEventNew"
							:class="['mcol-xs-auto', {'isActive': selectedChildComponentIds.some(id=>id===child.id)}]"
							ref="ChildComponentItem"
							v-for="(child, idx) in preparedChildComponentsItems"
							:key="`child_component-${child.id}`"
							:item-data="child"
							:item-index="idx"
							fromFFTPage
							:rpm_source_value="rpm_source_value"
							@save="handleSaveForm"
							:savingInProgress="savingInProgress"
						/>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="initiatedOptionValuesDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-analysis-values-dialog"
			title="Characteristics"
			:visible.sync="showOptionValuesDialog"
		>	
			<div class="options-container">
				<div v-if="preparedTypeOptionValueItems.length" class="content-row">
					<TypeOptionValueItem
						ref="TypeOptionValueItem"
						v-for="(option, idx) in preparedTypeOptionValueItems"
						:key="`va-${option.equipment_type_option_id}`"
						:item-data="option"
						:item-index="idx"
					/>
				</div>
			</div>
			<div class="dialog-footer dialog-decorate-footer text-center">
				<el-button
					type="primary"
					@click="handleSaveForm"
					class="uppercase semi-bold"
					>{{ tt('Save') }}</el-button
				>

				<el-button
					class="uppercase semi-bold"
					@click="showOptionValuesDialog = false"
					>{{ tt('Cancel') }}</el-button
				>
			</div>
		</el-dialog>

		<el-dialog
			v-if="initiatedRPMDialog"
			append-to-body
			top
			class="tiny dialog-decorate-header title-center rpm-settings-dialog"
			:title="`${tt('Machine')} ${tt('speed')}`"
			:visible.sync="showRpmSettingsDialog"
		>	
			<SimpleSpinner :active="loadingRPM" />

			<RPMSettingsDialog
				:sensorData="sensorData"
				:currentRpmSource="itemData && itemData.rpm_source_item"
				@save="saveRpmParams"
				@close="showRpmSettingsDialog = false"
			/>
		</el-dialog>
	</div>
</template>

<script>
import { mapActions, /*mapState*/ } from 'vuex';
import { RPM_SOURCES_TYPES, itemSpeedOptionsList, ITEM_SPEED_OPTIONS } from '@/constants/global';
import { findItemBy } from '@/helpers';
import { setupItemSpeedOptionsList } from '@/helpers/specialHelpers';

import { requestsListMixin, itemFormMixin, subItemsListMixin, eventHandler, saveRPMParamsMixin } from '@/mixins';

export default {
	mixins: [requestsListMixin(), itemFormMixin(), subItemsListMixin(), eventHandler(), saveRPMParamsMixin()],
	components: {
		// OptionValuesDialog: () => import('./OptionValuesDialog.vue'),
		TypeOptionValueItem: () => import('./TypeOptionValueItem.vue'),
		AnalysisRuleItem: () => import('@/views/Equipments/AnalysisRuleItem.vue'),
		ChildComponentItem: () => import('@/views/Equipments/ChildComponentItem.vue'),
		RPMSettingsDialog: () => import('@/views/Sensors/FilterBlock/RPMSettingsDialog.vue'),
	},

	props: {
		itemData: {
			type: Object,
			required: true
		},
		sensorData: {
			type: Object,
			required: true
		},
		selectedChildComponentIds: Array
	},

	data() {
		return {
			showRpmSettingsDialog: false,
			initiatedRPMDialog: false,
			loadingRPM: false,

			initiatedOptionValuesDialog: false,
			showOptionValuesDialog: false,

			brandModel: null,
			brandModelLoading: false,
			equipmentTypesList: [],
			equipmentTypesLoading: null,

			savingInProgress: false,

			// ------------------
			equipmentTypeHasChanged: false,
			childComponentsList: [],
			vibrationAnalysisLoading: false,
			vibrationAnalysisList: [],
			// typeOptionValueItems: [],

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

			// brandModelTypeOptionValues: [],
			// brandModelTypeOptionValuesLoading: false,
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'AnalysisRuleItem', targetProp: 'vibration_analysis_rules' },
			{ ref: 'ChildComponentItem', targetProp: 'child_components' },
			{ ref: 'TypeOptionValueItem', targetProp: 'option_values' },
		]),
		brandModelTypeOptionValues() {
			if (this.brandModel && this.selectedEquipmentType) {
				return Object.freeze(this.brandModel.type_option_values.map(bi => {
					let optionItem = { ...bi };

					if (!bi.value && bi.predefined_value_ids.length) {
						const { equipment_type_option_id } = optionItem;
						const { type_options } = this.selectedEquipmentType;
						const option = findItemBy('id', equipment_type_option_id, type_options);
						if (option) {
							let value = '';
							
							bi.predefined_value_ids.forEach(id => {
								const predefined_value = findItemBy('id', id, option.predefined_values);
								if (predefined_value) value += `<div>${predefined_value.value}</div>`
							})

							optionItem.value = value;
						}
					}
					return optionItem;
				}));
			}
			return [];
		},

		brandModelTypeOptionValuesVisible() {
			if (this.brandModel) {
				return Object.freeze(
					this.preparedTypeOptionValueItems.filter(toi => toi.is_visible_in_vibration_analysis)
				);
			}
			return [];
		},

		itemSpeedOptionsList: () => itemSpeedOptionsList(),
		preparedItemSpeedOptionsList: that => setupItemSpeedOptionsList({
			sensorData: that.sensorData,
			itemSpeedOptionsList: that.itemSpeedOptionsList
		}),

		currentRpmSource() {
			const { formData, preparedItemSpeedOptionsList } = this;
			if (formData.rpm_source_item) {
				return findItemBy('id', formData.rpm_source_item, preparedItemSpeedOptionsList);
			}
			return null;
		},

		// ------------------
		selectedEquipmentType() {
			const { equipmentTypesList, formData } = this;
			if (equipmentTypesList.length && formData.equipment_type_id) {
				return findItemBy('id', formData.equipment_type_id, equipmentTypesList);
			}
			return null;
		},

		childComponentsForSelectedEquipmentType() {
			const { selectedEquipmentType } = this;
			if (selectedEquipmentType) {
				// return selectedEquipmentType.child_components.map(ci => ci.child);
				// return selectedEquipmentType.child_components;
				return selectedEquipmentType.child_components.map(ci => ({
					original_component: { ...ci },
					id: null,
					original_component_id: ci.id,
				}));
			}
			return [];
		},

		preparedChildComponentsItems() {
			if (this.equipmentTypeHasChanged) {
				return this.childComponentsForSelectedEquipmentType;
			} else {
				// console.log(this.itemData)
				if (this.itemData && this.itemData.child_components && this.itemData.child_components.length) {
					if (this.equipmentTypesList.length) {
						return this.itemData.child_components.map(ci => {
							const childItem = findItemBy('id', ci.original_component.child_id, this.equipmentTypesList);

							return {
								...ci,
								original_component: {
									...ci.original_component,
									child: childItem
								}
							}
						});
					}
					return [];
				} else {
					return this.childComponentsForSelectedEquipmentType;
				}
			}
		},

		preparedVibrationAnalysisItems() {
			if (this.vibrationAnalysisList.length) {
				return this.vibrationAnalysisList.map(rule => ({
					original_rule: {...rule},
					id: null,
					original_rule_id: rule.id
				}))
			} else if (this.itemData && this.itemData.vibration_analysis_rules) {
				return this.itemData.vibration_analysis_rules;
			}
			return [];
		},

		preparedTypeOptionValueItems() {
			const { brandModelTypeOptionValues, itemData } = this;
			if (brandModelTypeOptionValues.length) {
				return Object.freeze(brandModelTypeOptionValues.map(vi => {
					const { equipment_type_option_id, option, value } = vi

					let optionItem = {
						equipment_type_option_id,
						name: option.name,
						value
					}

					const thatOptionForEquipment = findItemBy('equipment_type_option_id', equipment_type_option_id, itemData.option_values);

					// console.log(optionItem.name, thatOptionForEquipment, equipment_type_option_id)

					optionItem.is_visible_in_vibration_analysis = thatOptionForEquipment
						? thatOptionForEquipment.is_visible_in_vibration_analysis
						: option.is_visible_in_vibration_analysis;

					return optionItem;
				}))
			}

			return [];
		},

		requestsToDoList() {
			// console.log(this.itemData)
			return Object.freeze([
				{
					action: 'fetch_equipment_types',
					localProp: 'equipmentTypesList',
					localLoadProp: 'equipmentTypesLoading'
				},
				{
					action: 'fetch_brand_model',
					payload: {itemId: this.itemData.brand_model_id },
					localProp: 'brandModel',
					localLoadProp: 'brandModelLoading'
				},
			])
		},

		// ------------
		defaultRpmSourceItem() {
			if (this.sensorData && this.sensorData.rpmSources) {
				var {
					external_rpm_evaluated,
					line_speed_rpm_evaluated,
					specification_rpm_evaluated
				} = this.sensorData.rpmSources;

				if (external_rpm_evaluated) {
					return ITEM_SPEED_OPTIONS.EXTERNAL;
				} else if (line_speed_rpm_evaluated) {
					return ITEM_SPEED_OPTIONS.LINESPEED_RPM;
				} else if (specification_rpm_evaluated) {
					return ITEM_SPEED_OPTIONS.SPECIFICATION_RPM;
				}
			}
			return null;
		},

		rpm_source_value: that => that.itemData.rpmSources ? that.itemData.rpmSources.rpm_source_value_evaluated : null,

		successRpmSaveCallback() {
			return () => {
				this.$emit('event', { eventName: 'reFetchEquipment' });
			};
		}

	},

	methods: {
		...mapActions({
			fetch_brand_model: 'brand_models/fetch_brand_model',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			fetch_vibration_analysis_rules: 'equipments/fetch_vibration_analysis_rules',
			save_equipment: 'equipments/save_equipment',
			set_equipment_rpm_params: 'equipments/set_equipment_rpm_params',
		}),

		/*fetchBrandModel(itemId) {
			this.doFetchAction(
				'fetch_brand_model',
				'brandModel',
				'brandModelLoading',
				{	itemId }
			);
		},*/

		fetchVibrationAnalysis(equipmentTypeId) {
			this.doFetchAction(
				'fetch_vibration_analysis_rules',
				'vibrationAnalysisList',
				'vibrationAnalysisLoading',
				{ equipmentTypeId }
			);
		},

		showOptionValues() {
			this.initiatedOptionValuesDialog = true;
			this.showOptionValuesDialog = !this.showOptionValuesDialog;
		},

		showRpmSettings() {
			this.initiatedRPMDialog = true;
			this.showRpmSettingsDialog = !this.showRpmSettingsDialog;
		},

		/*handleSaveRpmParams(data) {
			this.saveRpmParams({rpm_source_item: data.id, rpm_value: data.value});
		},*/

		/*saveRpmParams(data) {
			// if (this.enableRpmBlock) {
				let {id, is_rpm_visible, rpm_source_item } = this.itemData;
				let { rpmSources } = this.sensorData;
				let selectedRpmOption = findItemBy('id', rpm_source_item, this.itemSpeedOptionsList);
				let final_rpm_source_item = rpm_source_item;
				
				if (selectedRpmOption) {
					final_rpm_source_item = rpmSources[selectedRpmOption.source_key]
						? final_rpm_source_item
						: this.defaultRpmSourceItem;
				}

				const payload = {
					itemId: id,
					notNotify: true,				
					data: {
						is_rpm_visible: !!is_rpm_visible,
						rpm_source_item: final_rpm_source_item || this.defaultRpmSourceItem,
						...data
					}
				};

				if (process.env.NODE_ENV === 'development') {
					if (payload.data) {

						console.log(payload)
						return;
					}
				}

				this.loadingRPM = true;

				this.set_equipment_rpm_params(payload).then(() => {
					// console.log(response)
					this.showRpmSettingsDialog = false;
					
					this.loadingRPM = false;
				}).catch(()=>{
					this.loadingRPM = false;
				});
			// }
		},*/

		// ---------------

		localSetupPage(equipmentData) {
			// this.typeOptionValueItems = this.setupFormSubItemsList(equipmentData.option_values, 'to_i');

			if (
				(!equipmentData.vibration_analysis_rules || !equipmentData.vibration_analysis_rules.length) 
				&& equipmentData.equipment_type_id
			) {
				this.fetchVibrationAnalysis(equipmentData.equipment_type_id)
			}
		},

		handleSaveForm() {
			this.handleValidationResult([]);
		},

		localSubmit(formData) {
			let payload = {
				data: formData,
				itemName: this.tt('Item'),
			};
			/*if (process.env.NODE_ENV === 'development') {
				if (payload) {
					console.log(payload)
					return;
				}
			}*/
			this.savingInProgress = true;
			this.$emit('event', { eventName: 'toggleEquipmentSaving', data: true });

			this.save_equipment(payload)
				.then(() => {
					// const { data, updateRoute } = answer;
					this.showOptionValuesDialog = false;

					if (this.$refs.AnalysisRuleItem) {
						this.$refs.AnalysisRuleItem.forEach(ref => {
							ref.showAnalysisRuleFormDialog = false;
						})
					}

					if (this.$refs.ChildComponentItem) {
						this.$refs.ChildComponentItem.forEach(ref => {
							ref.showAnalisysRulesDialog = false;
						})
					}

					this.$emit('event', { eventName: 'reFetchEquipment' });
					this.$emit('event', { eventName: 'toggleEquipmentSaving', data: false });	
					this.savingInProgress = false;
				})
				.catch(() => {
					this.$emit('event', { eventName: 'toggleEquipmentSaving', data: false });	
					this.savingInProgress = false;
				});
		}
	},

	watch: {
		
	},

	created() {
		// this.fetchBrandModel(this.itemData.brand_model_id);
	}
};
</script>
