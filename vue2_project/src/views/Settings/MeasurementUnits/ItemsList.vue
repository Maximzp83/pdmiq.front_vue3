<template>
	<div class="section-row view-list-wrapper">
		<div class="view-content-card card content-row">
			<div class="card-content">
				<Filterbar
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:hideCreate="!hasAccesToCreate"
					:hideDelete="!hasAccesToDelete"
				/>

				<CustomDataListTable
					ref="ItemsTableContainer"
					@event="handleEventNew"
					:disableSelection="!hasAccesToDelete"
					:itemsLoading="itemsLoading"
					:tableData="itemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
				/>

				<PaginationContainer
					v-if="itemsList.length"
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';

import { standardTableOperations } from '@/constants/table';
// import { metricSystemsList } from '@/modules/charts_factory/controllers/Sensor/enums';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
		// CreateItemForm: () => import('./CreateItemForm.vue')
	},

	props: {
		editInModal: {
			type: Boolean,
			default: true
		}
	},

	data() {
		return {
			// openCreateForm: false,
			// collectedData: []
		};
	},

	computed: {
		...mapState({
			filters: state => state.measurement_units.filters
		}),

		itemsName: () => ({
			one: 'Measurement Unit',
			mult: 'Measurement Units'
		}),

		hasAccesToCreate: that => that.$hasAccessTo(['create_settings']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_settings']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_settings']),

		/*navbarSettings: () => ({
			// showCreateButtonForTableForm: true,
			showDeleteButton: true,
			showFilter: true,
			pageTitle: 'Settings'
		}),*/

		instanceName: () => 'MeasurementUnits',

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push({					
					...standardTableOperations.delete,
					conditionSettings: {
						conditions: [
							{
								prop: 'is_locked',
								method: '==',
								control_value: false,
							}
						]
					}
				});
			}

			const { tt } = this;

			return Object.freeze({
				columns: [
					{
						prop: 'metric_name',
						label: 'Metric Name',
						sortable: true
					},
					{
						prop: 'imperial_name',
						label: 'Imperial Name',
						sortable: true
					},
					{
						prop: 'to_imperial_formula',
						label: tt('phrases.Metric_To_imperial_formula')
					},
					{
						prop: 'to_metric_formula',
						label: tt('phrases.Imperial_To_metric_formula')
					}
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		},

		localModalSettings() {
			let componentPath = 'Settings/MeasurementUnits/ItemForm';

			return {
				componentPath: componentPath,
				single: true,
				callback: () => {
					this.fetchItems({ ...this.filters, ...this.globalFilters });
					this.show_edit_modal({ show: false });
				}
			};
		}
	},

	methods: {
		...mapActions({
			forceRerender: 'forceRerender',

			fetch_items: 'measurement_units/fetch_measurement_units',
			save_item: 'measurement_units/save_measurement_unit',
			delete_item: 'measurement_units/delete_measurement_unit',

			set_filters: 'measurement_units/set_measurement_units_filters'
		}),

		localModalSettingsHook({modalSettings, itemData}) {
			if (itemData && itemData.is_locked) {
				modalSettings.hideSubmitButtons = true;
			}
			return modalSettings;
		},

		// localRouteQueryHandler:()=>null,

		/*createItem() {
			const payload = {
				show: true,
				instanceName: this.instanceName,
				itemName: this.itemName,
				instanceData: null,
				componentPath: 'Settings/Faults'
			};

			this.show_edit_modal(payload);
		}*/
	},

	watch: {
		/*fault_type(type) {
			if (type) {
				this.forceRerender('faultsComponentKey')
			}
		}*/
	},

	beforeMount() {
		// console.log(this.fault_type)
	}
};
</script>
