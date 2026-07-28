import { describe, expect, it } from 'vitest';

import { isArray, isEmptyString, isExternal, isNumber, isString } from '../validate';

describe('validation utilities', () => {
	it('detects external URLs and contact links', () => {
		expect(isExternal('https://example.com')).toBe(true);
		expect(isExternal('mailto:user@example.com')).toBe(true);
		expect(isExternal('/dashboard')).toBe(false);
	});

	it('checks common value types', () => {
		expect(isString('sensor')).toBe(true);
		expect(isString(42)).toBe(false);
		expect(isArray([])).toBe(true);
		expect(isArray({})).toBe(false);
	});

	it('checks empty strings and numeric values', () => {
		expect(isEmptyString('   ')).toBe(true);
		expect(isEmptyString(' value ')).toBe(false);
		expect(isNumber('12.5')).toBe(true);
		expect(isNumber('not-a-number')).toBe(false);
	});
});
