import { useItemsData } from '@/composables/mixins/useItemsData';
import { useLibraryStore } from '@/stores/LibraryStore';

export function useLibrary(options = {}) {
	const libraryStore = useLibraryStore();
	const itemsData = useItemsData({
		entityKey: 'Library',
		itemStore: libraryStore,
		options,
	});

	return {
		libraryStore,
		...itemsData,
	};
}
