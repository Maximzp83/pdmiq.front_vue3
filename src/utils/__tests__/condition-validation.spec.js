import { describe, expect, it } from 'vitest';

import { compareValues, validateBySettings } from '../condition-validation';

describe('condition validation', () => {
	it('compares values with the supported operators', () => {
		expect(compareValues({ val1: 2, val2: '2', method: '==' })).toBe(true);
		expect(compareValues({ val1: 3, val2: 2, method: '>' })).toBe(true);
		expect(compareValues({ val1: '', method: 'empty' })).toBe(true);
	});

	it('validates nested properties', () => {
		expect(
			validateBySettings({
				dataObj: { role: { type: 'admin' } },
				conditions: [{ prop: 'role.type', control_value: 'admin' }],
			}),
		).toBe(true);
	});

	it('supports array comparison and chained conditions', () => {
		expect(
			validateBySettings({
				dataObj: { status: 2, enabled: true },
				conditions: [
					{
						prop: 'status',
						control_value: [1, 2],
						array_method: 'some',
						next_conditions: [{ prop: 'enabled', control_value: true }],
					},
				],
			}),
		).toBe(true);
	});
});
