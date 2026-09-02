import { describe, expect, it } from 'vitest';

import { executeChartFactory } from '../Chart.js';

const buildChart = ({ daterange, joined_at, prorateBillingCost = true } = {}) =>
	executeChartFactory('SuccessGaugeChart', {
		chart_config: { chart_id: 'test', chartTitle: 'Test' },
		events: {},
		filters: { daterange },
		payload_1: {
			fetch_action_url: 'test/roi',
			billing_plan_cost: 1200,
			joined_at,
			prorateBillingCost
		}
	});

// Months are day-weighted: every calendar month the range touches contributes
// the share of its own days that fall inside the range.
describe('SuccessGaugeChart.getBillingMonthsInRange', () => {
	it('counts whole months when the range covers them end to end (Apr 1 - Jun 30 = 3)', () => {
		const chart = buildChart({ daterange: ['2026-04-01', '2026-06-30'] });
		expect(chart.getBillingMonthsInRange()).toBe(3);
	});

	it('counts partial months as fractions (May 15 - Jul 2)', () => {
		const chart = buildChart({ daterange: ['2026-05-15', '2026-07-02'] });
		expect(chart.getBillingMonthsInRange()).toBeCloseTo(17 / 31 + 1 + 2 / 31, 6);
	});

	it('counts a full end month as 1 (May 15 - Jul 31)', () => {
		const chart = buildChart({ daterange: ['2026-05-15', '2026-07-31'] });
		expect(chart.getBillingMonthsInRange()).toBeCloseTo(17 / 31 + 1 + 1, 6);
	});

	it('counts a single day as its share of that month, not 0 (May 15 = 1/31)', () => {
		const chart = buildChart({ daterange: ['2026-05-15', '2026-05-15'] });
		expect(chart.getBillingMonthsInRange()).toBeCloseTo(1 / 31, 6);
	});

	it('counts a week inside one month as a fraction, not 0 (Aug 20 - Aug 26 = 7/31)', () => {
		const chart = buildChart({ daterange: ['2026-08-20', '2026-08-26'] });
		expect(chart.getBillingMonthsInRange()).toBeCloseTo(7 / 31, 6);
	});

	it('counts a full single calendar month as 1 month', () => {
		const chart = buildChart({ daterange: ['2026-05-01', '2026-05-31'] });
		expect(chart.getBillingMonthsInRange()).toBe(1);
	});

	it('counts across a year boundary (Nov 20 - Jan 5)', () => {
		const chart = buildChart({ daterange: ['2025-11-20', '2026-01-05'] });
		expect(chart.getBillingMonthsInRange()).toBeCloseTo(11 / 30 + 1 + 5 / 31, 6);
	});

	it('counts across a year boundary up to a full end month (Nov 20 - Jan 31)', () => {
		const chart = buildChart({ daterange: ['2025-11-20', '2026-01-31'] });
		expect(chart.getBillingMonthsInRange()).toBeCloseTo(11 / 30 + 1 + 1, 6);
	});

	it('counts a rolling 12 month range as exactly 12', () => {
		const chart = buildChart({ daterange: ['2025-09-01', '2026-08-31'] });
		expect(chart.getBillingMonthsInRange()).toBe(12);
	});

	it('clamps the range start to joined_at when the plant joined mid-range', () => {
		// Range is Jan - Jul, plant joined Apr 10, so only Apr 10 onward is billed.
		const chart = buildChart({
			daterange: ['2026-01-01', '2026-07-02'],
			joined_at: '2026-04-10'
		});
		expect(chart.getBillingMonthsInRange()).toBeCloseTo(21 / 30 + 1 + 1 + 2 / 31, 6);
	});

	it('returns 0 for an invalid/reversed range', () => {
		const chart = buildChart({ daterange: ['2026-07-02', '2026-05-15'] });
		expect(chart.getBillingMonthsInRange()).toBe(0);
	});

	it('defaults to 12 months when no daterange is set', () => {
		const chart = buildChart({ daterange: undefined });
		expect(chart.getBillingMonthsInRange()).toBe(12);
	});
});

describe('SuccessGaugeChart.setupResultData', () => {
	const pointsData = (chart, data) => chart.setupResultData(data).statistics_result.main.pointsData;

	it('shows roi_cost exactly as returned and prorates only the billing plan cost', () => {
		const chart = buildChart({ daterange: ['2026-04-01', '2026-06-30'] });
		const { base, redArea } = pointsData(chart, { roi_cost: 48000, billing_plan_cost: 60000 });

		expect(base[0]).toBe(48000);
		expect(redArea).toBe(15000); // 60000 / 12 * 3 months
	});

	it('keeps roi_cost intact for a short range instead of collapsing to 0', () => {
		const chart = buildChart({ daterange: ['2026-08-20', '2026-08-26'] });
		const { base, redArea, yMax } = pointsData(chart, { roi_cost: 4000, billing_plan_cost: 60000 });

		expect(base[0]).toBe(4000);
		expect(redArea).toBe(Math.round((60000 / 12) * (7 / 31)));
		expect(yMax).toBeGreaterThan(0);
	});

	it('does not prorate when prorateBillingCost is off (all-plants gauge)', () => {
		const chart = buildChart({
			daterange: ['2026-04-01', '2026-06-30'],
			prorateBillingCost: false
		});
		const { base, redArea } = pointsData(chart, { roi_cost: 480000, billing_plan_cost: 600000 });

		expect(base[0]).toBe(480000);
		expect(redArea).toBe(600000);
	});

	// The green plot band runs from redArea to yMax, so yMax must always clear
	// redArea - otherwise Highcharts gets an inverted band and drops the green
	// zone entirely.
	it.each([
		['omitted', { billing_plan_cost: 60000 }, 5000],
		['null', { roi_cost: null, billing_plan_cost: 60000 }, 5000],
		// No billing_plan_cost in the payload, so it falls back to the plant's 1200.
		['an empty array response', [], 100],
		['an empty object response', {}, 100]
	])('keeps the green zone above the red zone when roi_cost is %s', (_label, payload, expectedRedArea) => {
		const chart = buildChart({ daterange: ['2026-07-01', '2026-07-31'] });
		const { base, redArea, yMax } = pointsData(chart, payload);

		expect(base).toEqual([0]);
		expect(redArea).toBe(expectedRedArea); // annual / 12 * 1 month
		expect(yMax).toBeGreaterThan(redArea);
	});

	it('coerces a decimal string roi_cost to a number', () => {
		const chart = buildChart({ daterange: ['2026-07-01', '2026-07-31'] });
		const { base, yMax } = pointsData(chart, { roi_cost: '5000.00', billing_plan_cost: 1200 });

		expect(base).toEqual([5000]);
		expect(yMax).toBe(5000);
	});

	it.each([
		['undefined', undefined],
		['null', null]
	])('survives a %s response instead of killing the chart', (_label, payload) => {
		const chart = buildChart({ daterange: ['2026-07-01', '2026-07-31'] });
		const result = chart.setupResultData(payload);

		expect(result).toBeDefined();
		expect(result.statistics_result.main.pointsData.base).toEqual([0]);

		// handleResponse() assigns resultData before reading hasStatistics; if
		// setupResultData returned undefined this would throw and the chart would
		// never emit its ready event.
		chart.resultData = result;
		expect(chart.checkIsHasStatistics()).toBeTruthy();
	});

	it('falls back to a non-zero axis when there is nothing to show', () => {
		const chart = buildChart({ daterange: ['2026-07-02', '2026-05-15'] });
		const { base, yMax } = pointsData(chart, { roi_cost: 0, billing_plan_cost: 60000 });

		expect(base).toEqual([0]);
		expect(yMax).toBe(500);
	});
});
