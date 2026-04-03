<template>
	<div class="edit-form-container relative">
		<SimpleSpinner :active="isLoading"/>
		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<el-form
			:class="['item-edit-form']"
			label-width="0px"
			ref="VibrationAnalysisForm"
			:model="formData"
			:label-position="'left'"
		>
			<el-form-item>
				<div class="semi-bold article-title uppercase">
					{{ `${tt('Analysis')} ${tt('Item')}` }}
				</div>
				<div class="options-container  wrapperBlock">
					<div
						v-if="vibrationAnalysisItems.length"
						:class="['content-row', { fluid: fromModal }]"
					>
						<AnalysisItem
							ref="AnalysisItem"
							v-for="(item, idx) in vibrationAnalysisItems"
							:key="`va-${item.id}`"
							:item-data="item"
							:item-index="idx"
							:showLabelsIndex="showLabelsIndex"
							:measurementUnitsList="measurementUnitsList"
							:measurementUnitsLoading="measurementUnitsLoading"
							@onRemove="id => removeFormItem(id, 'vibrationAnalysisItems')"
						/>
					</div>

					<div class="margin-top-row button-row">
						<el-button
							class="action-button create-button small with-text"
							size="mini"
							type="success"
							@click="addFormItem('vibrationAnalysisItems', 'va_i-')"
						>
							<span class="capitalize">{{
								`${tt('add')} ${tt('Analysis')}`
							}}</span>
							<i class="suffix-icon icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { findItemBy } from '@/helpers';
// import { required } from '@/constants/validation';
import {
	itemFormMixin,
	subItemMixin,
	fetchItemsHelper,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		subItemMixin(),
		fetchItemsHelper(),
		subItemsListMixin()
	],
	components: {
		AnalysisItem: () => import('./AnalysisItem.vue'),
	},

	props: {
		equipmentTypeId: Number,
		itemData: { type: Object, default: () => ({}) },
		showLabelsIndex: Boolean,
		fromModal: Boolean
	},

	data() {
		return {
			vibrationAnalysisLoading: false,
			vibrationAnalysisList: [],
			vibrationAnalysisItems: [],
			measurementUnitsList: [],
			measurementUnitsLoading: false,

			isLoading: false,

			formData: {
				data: []
			},
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'AnalysisItem', targetProp: 'data' },
		]),

		/*vibrationAnalysisItems: that => that.setupFormSubItemsList(
			that.vibrationAnalysisList, 'va_i'
		)*/
	},

	methods: {
		...mapActions({
			fetch_vibration_analysis_rules: 'equipments/fetch_vibration_analysis_rules',
			update_vibration_analysis_rules: 'equipments/update_vibration_analysis_rules',
			fetch_measurement_units: 'measurement_units/fetch_measurement_units',
		}),

		fetchVibrationAnalysis() {
			const payload = { 
				equipmentTypeId: this.equipmentTypeId,
				// params: { max: -1 }
			};

			this.doFetchAction(
				'fetch_vibration_analysis_rules',
				'vibrationAnalysisList',
				'vibrationAnalysisLoading',
				payload
			);
		},

		fetchMeasurementUnits() {
			this.doFetchAction(
				'fetch_measurement_units',
				'measurementUnitsList',
				'measurementUnitsLoading',
				{ params: { max: -1 }, notNotify: true }
			);
		},

		localGetFormDataCallback() {
			// this.formData = {};
			this.handleValidationResult([true]);

			return null;
		},

		localSubmit(data) {
			if (data.data) {
				let payload = {
					equipmentTypeId: this.equipmentTypeId,
					data: data
					// method: 'PUT'
				};

				this.isLoading = true;
				// console.log(data, payload);

				this.update_vibration_analysis_rules(payload)
					.then(() => {
						this.isLoading = false;
					})
					.catch(() => {
						this.isLoading = false;
					});
			}

		}
		/*localSetupPage(itemData) {
			if (itemData) {
				this.typeOptionValuesItemsList = this.setupFormSubItemsList(
					itemData.type_option_values || [],
					'to_i'
				);
			}
		}*/
	},

	watch: {
		vibrationAnalysisList(list) {
			if (list) {
				this.vibrationAnalysisItems = this.setupFormSubItemsList(list, 'va_i');
			}
		}
	},

	created() {
		this.fetchVibrationAnalysis();
		this.fetchMeasurementUnits();
	}
};
</script>
