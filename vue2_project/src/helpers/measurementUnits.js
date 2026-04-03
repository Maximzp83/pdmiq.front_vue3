import { buildFormula, findItemBy } from '@/helpers';
import { METRIC_SYSTEM_TYPES } from '@/modules/charts_factory/controllers/Sensor/enums';

const { METRIC, IMPERIAL } = METRIC_SYSTEM_TYPES;

const MEASUREMENT_UNIT_SYSTEM_KEYS = Object.freeze({
	[METRIC]: {
		id: 'metric_unit_id',
		name: 'metric_name',
		formula: 'to_metric_formula'
	},
	[IMPERIAL]: {
		id: 'imperial_unit_id',
		name: 'imperial_name',
		formula: 'to_imperial_formula'
	}
});

export const getMeasurementUnitLabel = unit =>
	unit ? `${unit.metric_name || '-'} / ${unit.imperial_name || '-'}` : '';

export const getMeasurementUnitsOptions = units =>
	(units || []).map(unit => ({
		id: unit.id,
		name: getMeasurementUnitLabel(unit)
	}));

export const resolveMeasurementUnitName = ({ unit, measurement }) => {
	if (!unit) return '';
	return measurement === IMPERIAL ? unit.imperial_name : unit.metric_name;
};

export const getMeasurementUnitSystemConfig = measurement =>
	MEASUREMENT_UNIT_SYSTEM_KEYS[measurement] || MEASUREMENT_UNIT_SYSTEM_KEYS[METRIC];

export const getMeasurementUnitSystemIdKey = measurement =>
	getMeasurementUnitSystemConfig(measurement).id;

export const getMeasurementUnitSystemNameKey = measurement =>
	getMeasurementUnitSystemConfig(measurement).name;

export const getMeasurementUnitSystemFormulaKey = measurement =>
	getMeasurementUnitSystemConfig(measurement).formula;

export const getMeasurementUnitsOptionsBySystem = (units, measurement) => {
	const { id: idKey, name: nameKey } = getMeasurementUnitSystemConfig(measurement);

	return (units || []).map(unit => ({
		id: unit[idKey] != null ? unit[idKey] : unit.id,
		name: unit[nameKey] || '',
		unit,
		measurement
	}));
};

export const getMeasurementUnitById = (measurementUnitId, items = []) =>
	findItemBy('id', measurementUnitId, items);

export const resolveMeasurementUnitObject = ({
	unit,
	measurementUnitId,
	items = []
}) => unit || getMeasurementUnitById(measurementUnitId, items) || null;

export const buildMeasurementUnitFormula = formula => {
	if (!formula) return null;

	try {
		const parsedFormula = buildFormula(formula);
		return value => parsedFormula({ value });
	} catch (e) {
		console.warn('Invalid measurement unit formula', formula, e);
		return null;
	}
};

export const getMeasurementUnitDefaultMeasurement = parameterItem => {
	if (!parameterItem) return null;
	if (parameterItem.defaultMeasurement != null) return parameterItem.defaultMeasurement;
	if (parameterItem.metric_unit_id != null) return METRIC;
	if (parameterItem.imperial_unit_id != null) return IMPERIAL;
	return null;
};

export const getMeasurementUnitIdByMeasurement = ({ parameterItem, measurement }) => {
	if (!parameterItem) return null;

	const idKey = getMeasurementUnitSystemIdKey(measurement);
	return parameterItem[idKey] != null ? parameterItem[idKey] : null;
};

export const getMeasurementUnitFormulaForMeasurement = ({ unit, measurement }) => {
	if (!unit) return null;
	return unit[getMeasurementUnitSystemFormulaKey(measurement)] || null;
};

export const shouldConvertMeasurementUnit = ({ unit, measurement, defaultMeasurement }) =>
	!!unit &&
	defaultMeasurement != null &&
	measurement != null &&
	measurement !== defaultMeasurement &&
	!!getMeasurementUnitFormulaForMeasurement({ unit, measurement });
