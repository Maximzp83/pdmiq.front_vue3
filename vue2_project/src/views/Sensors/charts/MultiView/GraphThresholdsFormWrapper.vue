<template>
	<div class="edit-form-container graph-thresholds-form-container">
		<SimpleSpinner :active="isSaving" />

		<div class="section-row">
			<div v-if="graphThresholdsItemsList.length" class="content-row">
				<ThresholdItem
					class="threshold-item"
					ref="ThresholdItem"
					v-for="(item, idx) in graphThresholdsItemsList"
					:key="`thresold_item-${item.id}`"
					:item-data="item"
					:item-index="idx"
					:metricItemsList="metricItemsList"
					:requestsList="requestsList"
					@onRemove="id => removeFormItem(id, 'graphThresholdsItemsList')"
				/>
			</div>

			<div class="margin-top-row flex">
				<el-button
					class="div-block create-button with-text inverted small"
					type="primary"
					@click="addFormItem('graphThresholdsItemsList', 't_i-', {
						formData: {type:MULTIVIEW_ALARM_TYPES.COMPARE}
					})"
				>
					<span class="span-block capitalize text-middle" v-text="`${tt('Add')} ${tt('Compare')}`"></span>
					<i class="span-block icomoon icon-plus text-middle"></i>
				</el-button>

				<el-button
					class="div-block create-button with-text inverted small"
					type="primary"
					@click="addFormItem('graphThresholdsItemsList', 't_i-', {
						formData: {type: MULTIVIEW_ALARM_TYPES.STANDARD_WARNING_ALARM}
					})"
				>
					<span class="span-block capitalize text-middle" v-text="`${tt('Add')} ${tt('Alarm')}/${tt('Warning')}`"></span>
					<i class="span-block icomoon icon-plus text-middle"></i>
				</el-button>

				<el-button
					class="div-block create-button with-text inverted small"
					type="primary"
					@click="addFormItem('graphThresholdsItemsList', 't_i-', {
						formData: {type: MULTIVIEW_ALARM_TYPES.STANDARD_LOW_HIGH}
					})"
				>
					<span class="span-block capitalize text-middle" v-text="`${tt('Add')} ${tt('Low')}/${tt('High')}`"></span>
					<i class="span-block icomoon icon-plus text-middle"></i>
				</el-button>
			</div>
		</div>

		<div class="dialog-decorate-footer dialog-footer section-row text-center">
			<el-button
				type="primary"
				:loading="isSaving"
				@click="() => validateForm()"
				class="uppercase"
				>{{ tt('SAVE') }}</el-button
			>
			<el-button @click="closeDialog">{{ tt('Cancel') }}</el-button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
// import { required } from '@/constants/validation';
import {
	MULTIVIEW_ALARM_TYPES
} from '@/constants/global';

import { subItemsListMixin } from '@/mixins';

export default {
	mixins: [subItemsListMixin()],
	props: {
		thresholdsSetupData: { type: Object,	default: () => ({}) },
		visible: Boolean,
		multiViewData: {type: Object, required: true }
	},

	components: {
		ThresholdItem: () => import('./ThresholdItem.vue'),
	},

	data() {
		return {
			isSaving: false,
			graphThresholdsItemsList: [],
		};
	},

	computed: {
		...mapState({
			// sensorJobSaving: state => state.sensors.sensorJobSaving
		}),

		graphItemData: that => that.thresholdsSetupData.graphItemData,
		requestsList: that => that.thresholdsSetupData.requestsList,
		MULTIVIEW_ALARM_TYPES: () => Object.freeze(MULTIVIEW_ALARM_TYPES),
		
		metricItemsList() {
			if (this.graphItemData) {
				return this.graphItemData.graph_items;
			}
			return [];
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'ThresholdItem', targetProp: 'thresholdsItems', returnArray:1 },
		]),
	},

	methods: {
		...mapActions({
			save_metric_multi_views_thresholds: 'equipments/save_metric_multi_views_thresholds'
		}),

		validateForm() {
			this.handleValidationResult([
				this.validateSubItemsForm(this.subItemsSettings)
			]);
		},

		handleValidationResult(validationResults, options) {
			if ( validationResults.every(item => item) ) {
				// console.log('all valid', validationResults)
				if (this.subItemsSettings) {
					if (this.collectDataFromSubItems) {
						this.resetFormDataBySubItems(this.subItemsSettings);
						// console.log('formData 1', this.formData)
						let { thresholdsItems } = this.collectDataFromSubItems(this.subItemsSettings, options);
						this.submitGraphThresholds(thresholdsItems);

					}
				}			
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
				return false;
			}
		},

		submitGraphThresholds(thresholdsItems) {
			let payload = { 
				data: { data: thresholdsItems || [] },
				multiViewId:this.multiViewData.id,
				graphId: this.graphItemData.id,
				itemName: 'Graph Thresholds'
			}
			/*if (process.env.NODE_ENV === 'development') {
				console.log(payload);
				return;
			}*/

			this.isSaving = true;

			this.save_metric_multi_views_thresholds(payload)
				.then(() => {
					this.$emit('event', {
						eventName: 'fetchMultiViews',
						data: this.multiViewData.equipment_id,
						onward: true,
					});
					this.closeDialog();
					this.isSaving = false;
				})
				.catch(() => {
					this.isSaving = false;
				});
		},

		closeDialog() {
			this.$emit('closeDialog');
		},
	},

	watch: {
		visible(visible) {
			if (visible) {
				this.graphThresholdsItemsList = this.setupFormSubItemsList(this.graphItemData.graph_thresholds, 't_i');
			} else {
				this.graphThresholdsItemsList = [];
			}
		}
	},

	created() {
		this.graphThresholdsItemsList = this.setupFormSubItemsList(this.graphItemData.graph_thresholds, 't_i');
	}
};
</script>
