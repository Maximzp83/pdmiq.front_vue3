<template>
	<div
		:class="[
			'edit-form-container code-mirror-form relative',
			{ 'width-75': !isMobile }
		]"
	>
		<VueElementLoading
			class="section-block"
			:active="itemsLoading || itemsSaving"
			spinner="line-scale"
			:text="`${tt('Templates')} ${tt('loading')}...`"
			:background-color="'rgba(255, 255, 255, .7)'"
		/>

		<div class="mail_template_form" v-if="formulasReady">
			<FormulasFormItem
				ref="FormulasFormItem"
				v-for="item in filteredDataSetsList"
				:key="`dataset-${item.id}`"
				:datasetItem="item"
				:itemData="getFormulaItem(item.id)"
			/>
		</div>
	</div>
</template>

<script>
import { /*mapState,*/ mapActions } from 'vuex';

import { dataSetsList, CONTROLLER_TYPES, DATASET } from '@/constants/global';
import { findItemBy } from '@/helpers';
import { requestsListMixin, subItemsListMixin /*itemFormMixin*/ } from '@/mixins';

export default {
	mixins: [requestsListMixin(), subItemsListMixin() /*itemFormMixin*/],
	components: {
		FormulasFormItem: () => import('./FormulasFormItem.vue')
	},

	props: {},

	data() {
		return {
			formulasReady: false,
			isMobile: false,

			formulasList: [],

			itemsLoading: false,
			itemsSaving: false
		};
	},

	computed: {
		showSubmitButtons: () => true,

		subItemsSettings: () => Object.freeze([
			{ ref: 'FormulasFormItem', returnArray: true },
		]),

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_dataset_formulas',
					localProp: 'formulasList',
					localLoadProp: 'itemsLoading'
				}
			]),

		filteredDataSetsList: () =>
			dataSetsList().filter(ds => {
				if (ds.controller_type === CONTROLLER_TYPES.ULTRA_SOUND) {
					return (
						ds.id === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
						ds.id === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20 ||
						ds.id === DATASET.SDT_SENSOR_FULL_SPECTRUM ||
						ds.id === DATASET.LUBE_MATRIX_SDT_TEMP_C ||
						ds.id === DATASET.LUBE_MATRIX_SDT_TEMP_F
					);
				} else if (ds.controller_type === CONTROLLER_TYPES.BANNER) {
					return ds.id === DATASET.CM1L;
				} else if (ds.controller_type === CONTROLLER_TYPES.NCD) {
					return (
						ds.id === DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM ||
						ds.id === DATASET.NCD_4_20MA
					);
				}
			})
	},

	methods: {
		...mapActions({
			fetch_dataset_formulas: 'sensors/fetch_dataset_formulas',
			save_dataset_formulas: 'sensors/save_dataset_formulas'
		}),

		getFormulaItem(data_set) {
			return findItemBy('data_set', data_set, this.formulasList);
		},

		handleSubmit() {
			if ( this.validateSubItemsForm(this.subItemsSettings) ) {
				this.saveFormulas({
					data: {
						formulas: this.collectDataFromSubItems(this.subItemsSettings).result
					}
				});	
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
				return false;
			}
		},

		saveFormulas(payload) {
			/*if (payload) {
				console.log(payload)
				return
			}*/
			this.itemsSaving = true;
			this.save_dataset_formulas(payload)
				.then(() => {
					this.itemsSaving = false;
				})
				.catch(e => {
					this.itemsSaving = false;
					console.warn(e);
				});
		}
	},

	watch: {
		formulasList(list) {
			if (list.length) {
				this.formulasReady = true;
			}
		}
	},

	beforeMount() {
		this.isMobile = document.documentElement.clientWidth < 992;
	}
};
</script>
