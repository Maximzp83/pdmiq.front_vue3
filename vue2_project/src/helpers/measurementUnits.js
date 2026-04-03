import { buildFormula, findItemBy } from '@/helpers';
import { METRIC_SYSTEM_TYPES } from '@/modules/charts_factory/controllers/Sensor/enums';

const { METRIC, IMPERIAL } = METRIC_SYSTEM_TYPES;

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

export const resolveMeasurementUnitByPrimary = unit => {
	if (!unit) return '';
	return unit.primary_system === IMPERIAL ? unit.imperial_name : unit.metric_name;
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

export const shouldConvertMeasurementUnit = ({ unit, measurement }) =>
	!!unit &&
	!!unit.to_secondary_formula &&
		((measurement === IMPERIAL && unit.primary_system === METRIC) ||
			(measurement === METRIC && unit.primary_system === IMPERIAL));
