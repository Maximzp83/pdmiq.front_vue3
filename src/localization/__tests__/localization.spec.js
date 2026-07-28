import { afterEach, describe, expect, it } from 'vitest';

import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';

describe('localization', () => {
	afterEach(async () => {
		await Lang.set(LANGUAGE_TYPES.ENGLISH);
	});

	it('uses English translations by default', () => {
		expect(Lang.tt('select')).toBe('Select');
	});

	it('loads Spanish translations before switching language', async () => {
		await Lang.set(LANGUAGE_TYPES.SPANISH);

		expect(Lang.currentLangId).toBe(LANGUAGE_TYPES.SPANISH);
		expect(Lang.tt('select')).toBe('Seleccionar');
	});
});
