import { standardTableOperations } from '@/constants/table';
import { sensorParametersList } from '@/modules/charts_factory/controllers/Sensor/enums';

export default {
	columns: [
		{
			prop: 'title',
			label: 'Title',
			sortable: true,
			meta: {
				/*formFieldData: {
					type: 'text',
					prop: 'title',
					required: true,
					placeholder: 'input title',
					errorText: 'title is required'
				}*/
			}
		},
		{
			prop: 'equipmentTypes',
			label: 'Type of equipment',
			sortable: true,
			meta: {
				fromArray: { subProp: 'name', delimeter: ', ', inline: true }
				// getItemValue: { prop: 'name', listName: 'equipmentTypesList' },
				/*formFieldData: {
					type: 'select',
					prop: 'equipment_types',
					listName: 'equipmentTypesList',
					selectOptionLabel: 'name',
					required: true,
					placeholder: 'select equipment types',
					errorText: 'equipment type is required',
					multiple: true
				}*/
			}
		},
		{
			prop: 'sensor_parameter_types',
			label: 'Parameter',
			sortable: true,
			meta: {
				getItemValue: { prop: 'name', list: sensorParametersList() }
				/*formFieldData: {
					type: 'select',
					prop: 'sensor_parameter_types',
					listName: 'sensorParametersList',
					selectOptionLabel: 'name',
					required: true,
					placeholder: 'select sensor parameter',
					errorText: 'sensor parameter is required',
					multiple: true
				}*/
			}
		},
		{
			prop: 'alert_rules',
			label: 'Alert rule',
			sortable: true,
			meta: {
				getItemValue: { prop: 'name', listName: 'alertRulesList' }
				/*formFieldData: {
					type: 'select',
					prop: 'alert_rules',
					listName: 'alertRulesList',
					selectOptionLabel: 'name',
					required: true,
					placeholder: 'select alert rule',
					errorText: 'alert rule is required',
					multiple: true
				}*/
			}
		}
	],
	operations: {
		// editInTable: true,
		actions: this.$translate(
			[standardTableOperations.edit, standardTableOperations.delete],
			{ key: 'tooltip_text' }
		)
		// edit: true,
		// delete: true,
	}
};
