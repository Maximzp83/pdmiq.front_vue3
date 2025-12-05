/**
 * Mapping of all available stores for dynamic loading
 * Key - store filename (without extension)
 * Value - function for dynamic import
 */
const STORE_LOADERS = {
	AuthStore: () => import('@/stores/AuthStore').then((m) => m.useAuthStore),
	GlobalStore: () => import('@/stores/GlobalStore').then((m) => m.useGlobalStore),
	PlantsStore: () => import('@/stores/PlantsStore').then((m) => m.usePlantsStore),
	SensorsStore: () => import('@/stores/SensorsStore').then((m) => m.useSensorsStore),
	counter: () => import('@/stores/counter').then((m) => m.useCounterStore),
};

/**
 * Cache for already loaded stores
 * Key - store name, value - store instance
 */
const storeCache = new Map();

/**
 * Composables for working with stores
 * @returns {Object} Object with methods for working with stores
 */
export function useHelpers() {
	/**
	 * Dynamically loads and returns a store by name
	 * Uses caching to optimize repeated calls
	 *
	 * @param {string} storeName - Store name (e.g., 'PlantsStore', 'SensorsStore')
	 * @returns {Promise<Store|null>} Promise with store instance or null on error
	 *
	 * @example
	 * const { useLoadStore } = useHelpers();
	 * const store = await useLoadStore('PlantsStore');
	 * if (store) {
	 *   store.set_value('filters', newFilters);
	 * }
	 */
	const useLoadStore = async (storeName) => {
		// Validate store name
		if (!storeName || typeof storeName !== 'string') {
			console.error('[useLoadStore] Некорректное имя store:', storeName);
			return null;
		}

		// Check cache
		if (storeCache.has(storeName)) {
			return storeCache.get(storeName);
		}

		// Get loader for store
		const loader = STORE_LOADERS[storeName];
		if (!loader) {
			console.error(
				`[useLoadStore] Store "${storeName}" не найден в STORE_LOADERS.`,
				`Доступные stores: ${Object.keys(STORE_LOADERS).join(', ')}`,
			);
			return null;
		}

		try {
			// Dynamic loading and instance creation
			const useStore = await loader();
			if (typeof useStore !== 'function') {
				console.error(
					`[useLoadStore] Экспорт use${storeName} не является функцией в "${storeName}.js"`,
				);
				return null;
			}

			const store = useStore();

			// Cache successfully loaded store
			storeCache.set(storeName, store);

			return store;
		} catch (err) {
			console.error(`[useLoadStore] Ошибка при загрузке store "${storeName}":`, err);
			return null;
		}
	};

	/**
	 * Preloads specified stores
	 * Useful for optimizing loading of critical stores
	 *
	 * @param {string[]} storeNames - Array of store names to preload
	 * @returns {Promise<Object>} Promise with object of loaded stores
	 *
	 * @example
	 * const { preloadStores } = useHelpers();
	 * await preloadStores(['PlantsStore', 'SensorsStore']);
	 */
	const preloadStores = async (storeNames = []) => {
		const results = {};
		await Promise.allSettled(
			storeNames.map(async (name) => {
				const store = await useLoadStore(name);
				if (store) {
					results[name] = store;
				}
			}),
		);
		return results;
	};

	/**
	 * Clears the store cache
	 * Useful for testing or when reload is needed
	 */
	const clearStoreCache = () => {
		storeCache.clear();
	};

	/**
	 * Gets list of all available stores
	 *
	 * @returns {string[]} Array of available store names
	 */
	const getAvailableStores = () => {
		return Object.keys(STORE_LOADERS);
	};

	return {
		useLoadStore,
		preloadStores,
		clearStoreCache,
		getAvailableStores,
	};
}
