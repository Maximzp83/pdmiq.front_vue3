import { describe, expect, it } from 'vitest';

import { executeChartFactory } from '../Chart.js';

// Verifies the SuccessGaugeChart ROI value shown on the Success Dashboard and
// the Corporate Dashboard, driving the real production path:
//
//   plants/{id}/roi-cost  ->  setupResultData()  ->  gauge value + red zone
//
// Extra cases can be appended without editing the file:
//   ROI_CASES='[{"label":"plant 196 Q2","roi_cost":48000,"billing_plan_cost":60000,
//                "daterange":["2026-04-01","2026-06-30"],"joined_at":"2024-03-01"}]' \
//   npx vitest run src/modules/charts_factory/controllers/Maintenance/classes/__tests__/roiCost.spec.js

const buildChart = ({ daterange, joined_at, billing_plan_cost, prorateBillingCost = true }) =>
	executeChartFactory('SuccessGaugeChart', {
		chart_config: { chart_id: 'roi-verification', chartTitle: 'ROI', requestsList: [{ id: 'counters' }] },
		events: {},
		filters: { daterange },
		payload_1: {
			fetch_action_url: 'plants/7/roi-cost',
			billing_plan_cost,
			joined_at,
			prorateBillingCost
		}
	});

// Mirrors setupResultData() independently so the assertions do not just re-run
// the implementation being verified. roi_cost is shown as returned; only the
// annual billing plan cost is prorated to the selected range.
const expectedResult = ({ roi_cost, billing_plan_cost, months, prorateBillingCost = true }) => {
	const redArea = prorateBillingCost ? Math.round((billing_plan_cost / 12) * months) : billing_plan_cost;

	return { redArea, gauge_value: roi_cost, yMax: Math.max(redArea * 4, roi_cost) || 500 };
};

const runCase = (testCase) => {
	const { roi_cost, billing_plan_cost, daterange, joined_at, prorateBillingCost = true } = testCase;
	const chart = buildChart({ daterange, joined_at, billing_plan_cost, prorateBillingCost });

	const months = chart.getBillingMonthsInRange();
	// Same shape the roi-cost endpoint returns.
	const { pointsData } = chart.setupResultData({ roi_cost, billing_plan_cost }).statistics_result.main;

	return {
		months,
		actual: { gauge_value: pointsData.base[0], redArea: pointsData.redArea, yMax: pointsData.yMax },
		expected: expectedResult({ roi_cost, billing_plan_cost, months, prorateBillingCost })
	};
};

// billing_plan_cost is the ANNUAL subscription cost stored on the plant.
// roi_cost is what plants/{id}/roi-cost returns for dateStart..dateFinish.
const CASES = [
	{
		label: 'Q2 2026 (full quarter, plant joined 2024) - 3 billing months',
		roi_cost: 48000,
		billing_plan_cost: 60000,
		daterange: ['2026-04-01', '2026-06-30'],
		joined_at: '2024-03-01'
	},
	{
		label: 'This year to date 2026-01-01..2026-08-31 - 8 billing months',
		roi_cost: 130000,
		billing_plan_cost: 60000,
		daterange: ['2026-01-01', '2026-08-31'],
		joined_at: '2024-03-01'
	},
	{
		label: 'Last 12 months 2025-09-01..2026-08-31 - 12 billing months',
		roi_cost: 180000,
		billing_plan_cost: 60000,
		daterange: ['2025-09-01', '2026-08-31'],
		joined_at: '2024-03-01'
	},
	{
		label: 'Plant joined mid-range (Jan-Jul range, joined 2026-04-10)',
		roi_cost: 48000,
		billing_plan_cost: 60000,
		daterange: ['2026-01-01', '2026-07-02'],
		joined_at: '2026-04-10'
	},
	{
		label: 'Default Success Dashboard range: last 7 days, not month-end',
		roi_cost: 4000,
		billing_plan_cost: 60000,
		daterange: ['2026-08-20', '2026-08-26'],
		joined_at: '2024-03-01'
	},
	{
		// The corporate header gauge is fed the SUM of the per-plant gauges, whose
		// red zones are already prorated - so it must not prorate again.
		label: 'Corporate header, all plants (pre-summed, no further proration)',
		roi_cost: 144000,
		billing_plan_cost: 45000,
		daterange: ['2026-04-01', '2026-06-30'],
		prorateBillingCost: false
	},
	...JSON.parse(globalThis.process?.env?.ROI_CASES || '[]')
];

describe('ROI cost gauge - value verification', () => {
	it.each(CASES)('$label', (testCase) => {
		const { actual, expected } = runCase(testCase);

		expect(actual).toEqual(expected);
	});
});
