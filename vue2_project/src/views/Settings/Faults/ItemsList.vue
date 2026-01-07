<template>
	<div class="section-row view-list-wrapper">
		<div class="view-content-card card content-row">
			<div class="card-content">
				<Filterbar
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					hidePerPageFilter
					:hideCreate="!hasAccesToCreate"
					:hideDelete="!hasAccesToDelete"
				/>

				<CustomDataListTable
					ref="ItemsTableContainer"
					@event="handleEventNew"
					:disableSelection="!hasAccesToDelete"
					:itemsLoading="itemsLoading"
					:tableData="filteredItemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
				/>

				<!-- <PaginationContainer
					v-if="filteredItemsList.length"
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
				/> -->
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	formOperationsInItemsListMixin,
	navigation
} from '@/mixins';
import { FAULTS_TYPES } from '@/constants/global';
import {
	sensorParametersList,
	sensorParametersListNCD,
	sensorParametersListNCDOnly
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { LANGUAGE_TYPES } from '@/localization/utils';

import { standardTableOperations } from '@/constants/table';
import { findItemBy } from '@/helpers';

// import tableSettings from './tableSettings';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		formOperationsInItemsListMixin(),
		navigation()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')

		// PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
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
			collectedData: []
		};
	},

	computed: {
		...mapState({
			filters: state => state.equipments.filters
		}),

		hasAccesToCreate: that => that.$hasAccessTo(['create_settings']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_settings']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_settings']),

		itemsName: that => ({
			one: that.$t('Fault'),
			mult: that.$t('Faults'),
			instanceName: 'equipments'
		}),

		/*navbarSettings: () => ({
			// showCreateButtonForTableForm: true,
			showDeleteButton: true,
			showFilter: true,
			pageTitle: 'Settings'
		}),*/

		instanceName: () => 'Faults',
		// tableSettings: () => Object.freeze(tableSettings),

		predefinedFilters: () => Object.freeze({ max: -1 }),
		excludeGetParams: () =>
			Object.freeze([
				'hasSensors',
				'daterange',
				'storeroomId',
				'dataSet',
				'sensorType',
				'assetId',
				'productionLineId',
				'machineId',
				'isAsset',
				'plantId'
			]),

		localModalSettings() {
			const { fault_type } = this;
			let componentPath = '';

			if (fault_type == FAULTS_TYPES.BASE) {
				componentPath = 'Settings/Faults/ItemForm';
			} else if (fault_type == FAULTS_TYPES.NCD) {
				componentPath = 'Settings/Faults/ItemFormNCD';
			}

			return Object.freeze({
				componentPath: componentPath,
				single: true,
				callback: () => {
					this.refetchItemsList();
					this.show_edit_modal({ show: false });
				}
			});
		},

		fault_type() {
			const { $route } = this;
			if ($route.query) {
				return $route.query.type;
			}
			return null;
		},

		filteredItemsList() {
			const { itemsList, fault_type } = this;
			return itemsList.filter(li => li.type == fault_type);
		},

		isEnglish: that => that.$Lang.currentLangId === LANGUAGE_TYPES.ENGLISH,
		isSpanish: that => that.$Lang.currentLangId === LANGUAGE_TYPES.SPANISH,

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'title',
						label: 'Title',
						sortable: true,
						meta: {
							prepareValue: { localMethod: this.setupTitleCell, useAllInstanceData: true }
							// getItemValue: { prop: 'name', listName: 'sensorParametersList' }
						}
					},
					{
						prop: 'equipmentTypes',
						label: 'Type_of_equipment',
						// sortable: true,
						meta: {
							fromArray: { subProp: 'name', delimeter: ', ', inline: true }
						}
					},
					{
						prop: 'sensor_parameter_types',
						label: 'Parameters',
						// sortable: true,
						meta: {
							prepareValue: { localMethod: this.setupParametersCell }
							// getItemValue: { prop: 'name', listName: 'sensorParametersList' }
						}
					},
					{
						prop: 'alert_rules',
						label: 'Alert_rule',
						// sortable: true,
						meta: {
							getItemValue: { prop: 'name', listName: 'alertRulesList' }
						}
					}
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		},

		sensorParametersList: () => Object.freeze(sensorParametersList()),
		sensorParametersListNCD: () => Object.freeze(sensorParametersListNCD()),
		sensorParametersListNCDOnly: () => Object.freeze(sensorParametersListNCDOnly())

		/*fetchItemsPayload: that => ({
			faultType: that.fault_type
		}),*/
	},

	methods: {
		...mapActions({
			forceRerender: 'forceRerender',

			fetch_items: 'equipments/fetch_equipments_faults',
			save_item: 'equipments/save_equipments_fault',
			delete_item: 'equipments/delete_equipments_faults',

			set_filters: 'equipments/set_equipments_filters'
		}),

		setupParametersCell(params) {
			let result = '<ul>';
			let hasVal = false;
			params.forEach((param_id, idx) => {
				let parameterItem =
					findItemBy('id', param_id, this.sensorParametersList) ||
					findItemBy('id', param_id, this.sensorParametersListNCD) ||
					findItemBy('id', param_id, this.sensorParametersListNCDOnly);

				if (parameterItem) {
					hasVal = true;
					const isLast = idx == params.length - 1;
					result += `<li>${parameterItem.name}${isLast ? '' : ','}</li>`;
				}
			});
			return `${result}${hasVal ? '' : '-'}<div>`;
		},

		setupTitleCell(row) {
			if (this.isEglish) {
				return row.title_en || row.title;
			}
			if (this.isSpanish) {
				return row.title_es || row.title;
			}

			return row.title;
		}

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
