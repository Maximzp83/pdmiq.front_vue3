// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const { apiGet, notify } = vi.hoisted(() => ({
	apiGet: vi.fn(),
	notify: vi.fn(),
}));

vi.mock('@/api/request_provider', () => ({
	api_request: { get: apiGet },
}));
vi.mock('@/composables/useNotify', () => ({
	useNotify: () => ({ Notify: notify }),
}));

import { useAuthStore } from '@/stores/AuthStore';

describe('AuthStore.sign_out', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		localStorage.clear();
		vi.clearAllMocks();
		vi.stubEnv('PROD', true);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('keeps authentication available until the production logout request finishes', async () => {
		let resolveLogout;
		apiGet.mockReturnValue(new Promise((resolve) => {
			resolveLogout = resolve;
		}));
		const authStore = useAuthStore();
		authStore.access_token = 'access-token';
		authStore.authUser = { id: 1 };
		authStore.isAuthenticated = true;

		const signOutPromise = authStore.sign_out();

		expect(apiGet).toHaveBeenCalledWith('/auth/logout', { notNotify: true });
		expect(authStore.preventRequests).toBe(false);
		expect(authStore.access_token).toBe('access-token');

		resolveLogout();
		await signOutPromise;

		expect(authStore.preventRequests).toBe(true);
		expect(authStore.access_token).toBeNull();
		expect(authStore.authUser).toBeNull();
		expect(notify).toHaveBeenCalledOnce();
	});

	it('still completes client-side logout when the request cannot be started', async () => {
		apiGet.mockReturnValue(undefined);
		const authStore = useAuthStore();
		authStore.access_token = 'access-token';
		authStore.authUser = { id: 1 };

		await expect(authStore.sign_out()).resolves.toBeUndefined();

		expect(authStore.preventRequests).toBe(true);
		expect(authStore.access_token).toBeNull();
		expect(authStore.authUser).toBeNull();
	});
});
