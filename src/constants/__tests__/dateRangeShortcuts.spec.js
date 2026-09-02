import dayjs from 'dayjs';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { datePickerAllTimeShortcut, datePickerCorporateShortcuts } from '@/constants/date_time';
import { prepareRangeParams } from '@/helpers';
import { executeChartFactory } from '@/modules/charts_factory/controllers/Maintenance/classes/Chart.js';

// Covers every date range option on the Success Dashboard main page
// (MainDashboard.vue datepickerOptions) and the Corporate Dashboard navbar:
// which range each one resolves to, and the billing months the ROI gauge
// derives from it.
//
// Pinned to a fixed "today" so the quarter fallbacks are deterministic; change
// NOW to re-check against another date.
const NOW = new Date(2026, 7, 31, 12, 0, 0); // 2026-08-31, matches the reported session
const PLANT = { name: 'paperworks - Greensboro', billing_plan_cost: 60000, joined_at: '2024-03-01' };

// Mirrors Datepicker.vue: shortcut values go through dayjs and are emitted with
// value-format="YYYY-MM-DD".
const normalize = (value) =>
	Array.isArray(value) ? value.map((item) => dayjs(item).format('YYYY-MM-DD')) : value;

const collectShortcuts = (joinedDate) => {
	const list = [
		...datePickerCorporateShortcuts(joinedDate),
		datePickerAllTimeShortcut(joinedDate)
	];

	return list.map((shortcut) => {
		let emitted;
		shortcut.onClick({ $emit: (_eventName, value) => (emitted = value) });

		return {
			label: shortcut.rangeName || shortcut.text,
			daterange: normalize(emitted)
		};
	});
};

const gaugeFor = (daterange) =>
	executeChartFactory('SuccessGaugeChart', {
		chart_config: { chart_id: 'ranges', chartTitle: 'ROI' },
		events: {},
		filters: { daterange },
		payload_1: {
			fetch_action_url: 'plants/196/roi-cost',
			billing_plan_cost: PLANT.billing_plan_cost,
			joined_at: PLANT.joined_at,
			prorateBillingCost: true
		}
	});

// Fake timers are installed at module scope so the shortcut list is available
// when it.each collects its cases.
vi.useFakeTimers();
vi.setSystemTime(NOW);

const shortcuts = collectShortcuts(new Date(PLANT.joined_at));

afterAll(() => {
	vi.useRealTimers();
});

describe(`date range options - ${PLANT.name}`, () => {
	it.each(shortcuts)('$label sends a valid, fully bounded range', ({ daterange }) => {
		const params = prepareRangeParams(daterange);

		expect(params.dateStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(params.dateFinish).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(params.dateStart <= params.dateFinish).toBe(true);

		// Only the current quarter may reach past today, and the billing months
		// calculation clamps that back, so nothing is billed in advance.
		expect(gaugeFor(daterange).getBillingMonthsInRange()).toBeGreaterThan(0);
	});

	it('resolves Q1-Q3 to the current year and Q4 to last year', () => {
		const quarters = shortcuts.filter((item) => /^q[1-4]$/.test(item.label));
		const byLabel = Object.fromEntries(quarters.map((q) => [q.label, q.daterange]));

		// Q1-Q3 2026 have all started, so they stay in 2026. Q4 has not, so it
		// falls back to 2025 - the quarter buttons deliberately mix years.
		expect(byLabel.q1).toEqual(['2026-01-01', '2026-03-31']);
		expect(byLabel.q2).toEqual(['2026-04-01', '2026-06-30']);
		expect(byLabel.q3).toEqual(['2026-07-01', '2026-09-30']);
		expect(byLabel.q4).toEqual(['2025-10-01', '2025-12-31']);
	});

	it('does not bill for a quarter that has not finished yet (Q3)', () => {
		const q3 = shortcuts.find((item) => item.label === 'q3');
		const months = gaugeFor(q3.daterange).getBillingMonthsInRange();

		// Q3 runs Jul 1 - Sep 30 but only Jul + Aug have elapsed by Aug 31.
		expect(months).toBeCloseTo(2, 6);
	});

	it('bills nothing for a range entirely in the future', () => {
		const months = gaugeFor(['2026-10-01', '2026-12-31']).getBillingMonthsInRange();
		expect(months).toBe(0);
	});
});
