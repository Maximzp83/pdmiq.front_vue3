// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia, storeToRefs } from 'pinia';

vi.mock('@/api/request_provider', () => ({
	api_request: vi.fn(),
}));
vi.mock('element-plus', () => ({
	ElNotification: { warning: vi.fn() },
}));

import { useGlobalStore } from '@/stores/GlobalStore';

describe('GlobalStore', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('keeps the chart redirect state compatible with storeToRefs after clearing it', () => {
		const globalStore = useGlobalStore();

		globalStore.set_value('redirectTo', '/dashboard');
		globalStore.set_value('redirectTo', null);

		const { redirectTo } = storeToRefs(globalStore);

		expect(redirectTo.value).toBeNull();
	});
});
