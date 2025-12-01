export function useHelpers() {
	const useLoadStore = async (storeName) => {
		try {
			const module = await import(`../../stores/${storeName}.js`);
			const useStore = module[`use${storeName}`];
			// console.log('useLoadStore', useStore)
			if (!useStore) {
				console.error(`[useLoadStore] Экспорт use${storeName} не найден в "${storeName}.js"`);
				return null;
			}

			return useStore();
		} catch (err) {
			console.error(`[useLoadStore] Ошибка при загрузке стора "${storeName}":`, err);
			return null;
		}
	};

	return { useLoadStore };
}
