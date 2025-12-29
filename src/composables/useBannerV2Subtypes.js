import { api_request } from '@/api/request_provider';
import { useBannerV2SubtypesStore } from '@/stores/BannerV2SubtypesStore';

export function useBannerV2Subtypes() {
	const bannerv2subtypesStore = useBannerV2SubtypesStore();

	const fetchBannerV2Subtypes = (params = {}) => {
		return api_request.get('/banner-v2-subtypes', {
			params: { max: bannerv2subtypesStore.filters.max, page: bannerv2subtypesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'bannerv2subtypesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchBannerV2SubtypesSingle = (id) => {
		return api_request.get(`/banner-v2-subtypes/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'bannerv2subtypesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createBannerV2SubtypesSingle = (data) => {
		return api_request.post('/banner-v2-subtypes', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'bannerv2subtypesStore',
			notify: true,
			resultMessage: 'Banner V2 subtype created successfully',
		});
	};

	const updateBannerV2SubtypesSingle = (id, data) => {
		return api_request.put(`/banner-v2-subtypes/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'bannerv2subtypesStore',
			notify: true,
			resultMessage: 'Banner V2 subtype updated successfully',
		});
	};

	const deleteBannerV2SubtypesSingle = (id) => {
		return api_request.delete(`/banner-v2-subtypes/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'bannerv2subtypesStore',
			notify: true,
			resultMessage: 'Banner V2 subtype deleted successfully',
		});
	};

	return { bannerv2subtypesStore, fetchBannerV2Subtypes, fetchBannerV2SubtypesSingle, createBannerV2SubtypesSingle, updateBannerV2SubtypesSingle, deleteBannerV2SubtypesSingle };
}
