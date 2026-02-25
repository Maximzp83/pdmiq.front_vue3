import { executeTransformator as executeSensorStatisticsTransformator } from '../controllers/Sensor/classes/StatisticsTransformator';
import { executeTransformator as executeFFTStatisticsTransformator } from '../controllers/Sensor/classes/FFTStatisticsTransformator';
import { executeTransformator as executeOEEStatisticsTransformator } from '../controllers/OEE/classes/StatisticsTransformator';

import {
	standard_datetime,
	line_charts_datetime,
	// average_statistics
} from '../controllers/Sensor/methods';
import {
	standard_counters,
	counters_breakSerieByDay
} from '../controllers/OEE/methods';

export const setupStatisticsTransformator = (name, resources) => {
	switch (name) {
		case 'sensorStatistics':
			return executeSensorStatisticsTransformator(name, resources);
		case 'FFTStatistics':
			return executeFFTStatisticsTransformator(name, resources);
		case 'OEEStatistics':
			return executeOEEStatisticsTransformator(name, resources);

		default:
			return null;
	}
};

export const pointsDataMethodSelector = (name, payload) => {
	// console.log('pointsDataMethodSelector', name)
	switch (name) {
		case 'standard_datetime':
			return standard_datetime(payload);
		case 'line_charts_datetime':
			return line_charts_datetime(payload);
		case 'standard_counters':
			return standard_counters(payload);
		case 'counters_breakSerieByDay':
			return counters_breakSerieByDay(payload);
		// case 'average_statistics':
			// return average_statistics(payload);

		default:
			return null;
	}
};
