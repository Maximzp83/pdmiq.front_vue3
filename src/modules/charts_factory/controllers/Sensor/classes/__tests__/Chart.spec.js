import { describe, expect, it } from 'vitest';

import { SensorChartBase } from '../Chart.js';

describe('SensorChartBase.assignDataToYAxis', () => {
	const buildChart = (yAxis) => {
		const chart = new SensorChartBase();
		chart.resources = {
			chart_config: {
				withoutReserveForMax: true,
				withoutReserveForMin: true,
			},
			payload_1: {},
		};
		chart.options.yAxis = yAxis;
		return chart;
	};
	const resultData = {
		statistics_result: {},
		chart_all_data_max_value: 10,
		chart_all_data_min_value: 0,
		chart_points_max_value: 8,
	};

	it('preserves the overlay axis scale while updating the main axis', () => {
		const overlayAxis = {
			custom_id: 'overlay_chart_axis',
			max: 2400,
			min: 100,
			softMax: 2200,
			softMin: 100,
		};

		const chart = buildChart([
			{ max: 1, min: 0, softMax: 1, customSettings: {} },
			{ ...overlayAxis },
		]);

		chart.assignDataToYAxis(resultData);

		expect(chart.options.yAxis[0]).toMatchObject({ max: 10, softMax: 8 });
		expect(chart.options.yAxis[1]).toEqual(overlayAxis);
	});

	it('calculates the primary axis of the overlay chart from its own statistics', () => {
		const chart = buildChart([
			{
				custom_id: 'overlay_chart_axis',
				max: 1,
				min: 0,
				softMax: 1,
				customSettings: {},
			},
		]);

		chart.assignDataToYAxis(resultData);

		expect(chart.options.yAxis[0]).toMatchObject({ max: 10, softMax: 8 });
	});
});
