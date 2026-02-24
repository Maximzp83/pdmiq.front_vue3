/**
 * Domain-specific data preparation functions
 * Migrated from vue2_project/src/services/api/api_helpers.js
 */

import { setupWarningsData, setupTresholdsOurList } from '@/helpers/specialHelpers';
import { getObjectVal, capitalizeFirstLetter } from '@/helpers';
import { SENSOR_TYPES } from '@/constants/global';

/**
 * Prepare warnings data from API response
 * Handles both pdmiq/dxm combined data and pdmiq-only data
 * @param {Object} data - Raw warnings data
 * @returns {Object} Formatted warnings data with meta and counts
 */
export const prepareWarningsData = (data) => {
	let newData = {};

	if (data.pdmiq && data.dxm) {
		const pdmiqData = setupWarningsData(data.pdmiq);
		const dxmData = setupWarningsData(data.dxm);

		newData = {
			pdmiq: pdmiqData.newData,
			pdmiq_meta: pdmiqData.meta,
			pdmiq_alarms_count: pdmiqData.alarms_count,
			pdmiq_warnings_count: pdmiqData.warnings_count,

			dxm: dxmData.newData,
			dxm_meta: dxmData.meta,
			dxm_alarms_count: dxmData.alarms_count,
			dxm_warnings_count: dxmData.warnings_count,
		};
	} else {
		const pdmiqData = setupWarningsData(data);

		newData = {
			pdmiq: pdmiqData.newData,
			pdmiq_meta: pdmiqData.meta,
			pdmiq_alarms_count: pdmiqData.alarms_count,
			pdmiq_warnings_count: pdmiqData.warnings_count,
		};
	}
	return newData;
};

/**
 * Prepare thresholds data with pagination
 * @param {Object} data - Raw thresholds data with meta
 * @returns {Object} Formatted thresholds with list and pagination meta
 */
export const prepareTresholdsOurData = (data) => {
	const newData = {
		list: setupTresholdsOurList(data.data),
		meta: {
			current_page: data.meta.current_page,
			last_page: data.meta.last_page,
		},
	};
	return newData;
};

/**
 * Prepare global plants data
 * Extracts only essential plant fields (id, name, time_zone)
 * @param {Array} data - Raw plants array
 * @returns {Array} Simplified plants array
 */
export const prepareGlobalPlantsData = (data) =>
	data.map((plant) => ({
		id: plant.id,
		name: plant.name,
		time_zone: plant.time_zone,
	}));

/**
 * Filter ultrasound sensors only from sensors list
 * @param {Array} data - Raw sensors array
 * @returns {Array} Filtered ultrasound sensors with specific fields
 */
export const ultrasoundSensorsOnly = (data) => {
	const list = [];

	for (let i = 0; i < data.length; i++) {
		const sensor = data[i];
		if (sensor.type === SENSOR_TYPES.ULTRA_SOUND) {
			list.push({
				id: sensor.id,
				uuid: sensor.uuid,
				name: sensor.equipment.machine_name,
				item_type: sensor.equipment.item_type,
			});
		}
	}
	return list;
};

/**
 * Prepare counters data for dashboard
 * Formats counter totals into structured items with routing info
 * @param {Object} counters - Raw counters object
 * @returns {Array} Formatted counter items
 */
export const prepareCountersData = (counters) => {
	const list = [];

	for (const key in counters) {
		const counterName = key.replace('total', '');
		const value = counters[key];

		if (
			['Utilities', 'ProdLines', 'Machines', 'Assets', 'Equipments'].indexOf(
				counterName,
			) !== -1
		) {
			let item = {
				title: counterName,
				instance: counterName,
				itemName: capitalizeFirstLetter(counterName.slice(0, -1)),
				iconName: counterName.toLowerCase(),
				path: counterName.toLowerCase(),
			};

			if (counterName === 'ProdLines') {
				item.instance = 'ProductionLines';
				item.itemName = 'Production Line';
				item.iconName = 'production_lines';
				item.path = 'production-lines';
			}

			if (counterName === 'Equipments') {
				item.title = 'Items';
				item.itemName = 'Item';
			}

			item.count = value;
			list.push(item);
		}
	}

	return list;
};

/**
 * Prepare equipments list with extensive field mapping
 * Maps nested object properties to flat structure
 * @param {Array|Object} data - Raw equipment data
 * @param {Object} settings - Configuration settings
 * @param {Array} settings.addSettingItems - Additional field mappings
 * @returns {Array|Object} Formatted equipment(s)
 */
export const prepareEquipmentsList = (data, settings = {}) => {
	const list = [];
	const newData = data instanceof Array ? data : [data];

	let settingsList = [
		{ key: 'id', val_key: 'id' },
		{ key: 'equipment_type_id', val_key: 'equipment_type_id' },
		{ key: 'brand_id', val_key: 'brand_id' },
		{ key: 'brand_name', val_key: 'brand.name' },
		{ key: 'brand_is_crossover_excluded', val_key: 'brand.is_crossover_excluded' },
		{ key: 'brand_model_id', val_key: 'brand_model_id' },
		{ key: 'sensor_location', val_key: 'sensor_location' },
		{ key: 'application_name', val_key: 'asset.machine.application.name' },
		{ key: 'location_name', val_key: 'asset.location.name' },
		{ key: 'asset_name', val_key: 'asset.name' },
		{ key: 'equipments_count', val_key: 'asset.equipments_count' },
		{ key: 'machine_id', val_key: 'asset.machine.id' },
		{ key: 'machine_name', val_key: 'asset.machine.name' },
		{ key: 'production_line_id', val_key: 'asset.machine.production_line_id' },
		{ key: 'production_line_name', val_key: 'asset.machine.productionLine.name' },
		{ key: 'machine_pictures', val_key: 'asset.machine.pictures' },
		{ key: 'plant_name', val_key: 'plant.name' },
		{ key: 'company_name', val_key: 'plant.company.name' },
		{ key: 'brand_model_name', val_key: 'model.name' },
		{ key: 'brand_model_img', val_key: 'model.full_file_name' },
		{
			key: 'brand__model_is_crossover_excluded',
			val_key: 'model.is_crossover_excluded',
		},
		{ key: 'equipment_type_name', val_key: 'equipmentType.name' },
		{ key: 'equipment_type_img', val_key: 'equipmentType.full_file_name' },
		{ key: 'asset_id', val_key: 'asset_id' },
		{ key: 'plant_id', val_key: 'plant_id' },
		{ key: 'is_limbo', val_key: 'is_limbo' },
		{ key: 'is_store_room', val_key: 'is_store_room' },
		{ key: 'loc_on_machine', val_key: 'loc_on_machine' },
		{ key: 'location_name', val_key: 'asset.location.name' },
		{ key: 'notes', val_key: 'notes' },
		{ key: 'has_breakdown', val_key: 'has_breakdown' },
		{ key: 'repairNow', val_key: 'repairNow' },
		{ key: 'storeRooms', val_key: 'storeRooms' },
		{ key: 'equipmentStoreRooms', val_key: 'equipmentStoreRooms' },
		{ key: 'dashboardSensors', val_key: 'dashboardSensors' },
		{ key: 'className', val_key: 'className' },
		{ key: 'equipmentType', val_key: 'equipmentType' },
		{ key: 'typeOptions', val_key: 'typeOptions' },
		{ key: 'pictures', val_key: 'pictures' },
		{ key: 'histories', val_key: 'histories' },
		{ key: 'equipment_subtype_id', val_key: 'equipment_subtype_id' },
		{ key: 'subtype_brand_id', val_key: 'subtype_brand_id' },
		{ key: 'subtype_brand_model_id', val_key: 'subtype_brand_model_id' },
		{ key: 'subtype_brand_model_name', val_key: 'subTypeModel.name' },
		{ key: 'subTypeOptions', val_key: 'subTypeOptions' },
		{
			key: 'plant_is_equipment_runtime_tracking',
			val_key: 'plant.is_equipment_runtime_tracking',
		},
		{
			key: 'linespeedSensor',
			val_key: 'asset.machine.productionLine.linespeedSensor',
		},
		{ key: 'is_rpm_params_set', val_key: 'is_rpm_params_set' },
		{ key: 'is_rpm_visible', val_key: 'is_rpm_visible' },
		{ key: 'rpm_source_item', val_key: 'rpm_source_item' },
		{ key: 'rpm_option_value_id', val_key: 'rpm_option_value_id' },
		{ key: 'rpm_value', val_key: 'rpm_value' },
		{ key: 'external_rpm_id', val_key: 'external_rpm_id' },
		{ key: 'rpm_formula', val_key: 'rpm_formula' },
		{ key: 'rpm_external_node_id', val_key: 'rpm_external_node_id' },
		{ key: 'rpm_external_node_parameter', val_key: 'rpm_external_node_parameter' },
		{ key: 'rpmSources', val_key: 'rpmSources' },
		{ key: 'rpm_external_value', val_key: 'rpm_external_value' },
		{ key: 'rpm_external_source_type', val_key: 'rpm_external_source_type' },
		{ key: 'rpm_unit_expression', val_key: 'rpm_unit_expression' },
		{
			key: 'prodline_rpm_source_type',
			val_key: 'asset.machine.productionLine.rpm_source_type',
		},
		{
			key: 'prodline_rpm_value',
			val_key: 'asset.machine.productionLine.rpm_value',
		},
		{
			key: 'prodline_rpm_node_parameter',
			val_key: 'asset.machine.productionLine.rpm_node_parameter',
		},
		{
			key: 'prodline_rpm_node_id',
			val_key: 'asset.machine.productionLine.rpm_node_id',
		},
		{ key: 'child_components', val_key: 'child_components' },
		{ key: 'vibration_analysis_rules', val_key: 'vibration_analysis_rules' },
		{ key: 'option_values', val_key: 'option_values' },
		{ key: 'metric_multi_views', val_key: 'metric_multi_views' },
		{ key: 'is_my_favorite', val_key: 'is_my_favorite' },
		{ key: 'is_company_favorite', val_key: 'is_company_favorite' },
	];

	if (settings.addSettingItems) {
		settingsList = settingsList.concat(settings.addSettingItems);
	}

	for (let i = 0; i < newData.length; i++) {
		const resultItem = {};
		const equipment = newData[i];

		for (const setting of settingsList) {
			resultItem[setting.key] = getObjectVal(equipment, setting.val_key);
		}

		if (
			!resultItem.asset &&
			equipment.equipmentStoreRooms &&
			equipment.equipmentStoreRooms.length
		) {
			resultItem['last_asset_name'] =
				equipment.equipmentStoreRooms[0].last_asset_name;
		}

		list.push(resultItem);
	}

	return data instanceof Array ? list : list[0];
};

/**
 * Registry of all data preparation functions
 * Used for string-based lookup in api_request
 */
export const prepareDataFunctions = {
	prepareWarningsData,
	prepareTresholdsOurData,
	prepareGlobalPlantsData,
	ultrasoundSensorsOnly,
	prepareCountersData,
	prepareEquipmentsList,
};
