import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { api_request } from '@/api/request_provider';
import { validateRouteParams } from '@/helpers';
import { checkUploadSettings } from '@/helpers/specialHelpers';
import { useNotify } from '@/composables/useNotify';
import { Lang } from '@/localization';

export function useItemPage({
	apiRoute,
	itemRoute,
	itemsName,
	additionalNavbarSettings,
	preventSetNavbar,
	preventSetupNavbar,
	preventDestroyNavbar,
	paramsId,
	fetchItem,
	successFetchItemCallback,
	loadContent,
	itemLoading,
	hasAccessTo,
	uploadSettings,
	preparePayload,
	localSubmit,
	saveItem,
	changeRoute,
	successSubmitCallback,
	itemData,
	itemFormRef,
} = {}) {
	const route = useRoute();
	const router = useRouter();
	const globalStore = useGlobalStore();
	const authStore = useAuthStore();
	const { Notify } = useNotify();
	const itemSaving = ref(false);
	const _loadContent = loadContent || ref(false);
	const _itemData = itemData || ref(null);
	const _itemLoading = itemLoading || ref(false);
	const authUser = computed(() => authStore.authUser);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const pageTitle = computed(() => {
		const itemName = resolve(itemsName)?.one || 'Item';
		if (_itemData.value) {
			return `${itemName}`;
		}
		return `${Lang.tt('New')} ${itemName}`;
	});

	const navbarSettings = computed(() =>
		Object.freeze({
			pageTitle: pageTitle.value,
			...(additionalNavbarSettings || {}),
		}),
	);

	const setup_navbar = (settings) => {
		const { meta } = route;
		if ((!meta || !meta.preventSetupNavbar) && !preventSetupNavbar && !preventSetNavbar) {
			globalStore.setup_navbar(settings);
		}
	};

	const handleSaveItem = () => {
		const form = itemFormRef?.value;
		if (form?.validateForm) {
			form.validateForm();
		}
	};

	const handleSubmitForm = (data) => {
		let payload = {
			data,
			itemName: resolve(itemsName)?.one || '',
		};

		if (uploadSettings) {
			payload = checkUploadSettings(payload, uploadSettings);
		}

		if (preparePayload) {
			payload = preparePayload(payload);
		}

		if (localSubmit) {
			localSubmit(payload);
		} else {
			itemSaving.value = true;

			const saveItemAction =
				typeof saveItem === 'function'
					? saveItem
					: (requestPayload) => {
							if (!apiRoute) {
								console.warn('[useItemPage] apiRoute is not defined');
								return Promise.resolve(null);
							}

							const id = paramsId || route.params?.id;
							return id === 'new'
								? api_request.post(apiRoute, requestPayload)
								: api_request.put(`${apiRoute}/${id}`, requestPayload);
						};

			if (typeof saveItemAction !== 'function') {
				console.warn('[useItemPage] saveItem action is not a function');
				itemSaving.value = false;
				return;
			}

			saveItemAction(payload)
				.then((answer) => {
					if (!answer?.request_payload?.setToStore) {
						if (_itemData && 'value' in _itemData) {
							_itemData.value = answer.data;
						}
					}

					return Promise.resolve(
						typeof successSubmitCallback === 'function'
							? successSubmitCallback(answer)
							: answer,
					).then(() => {
						if (changeRoute && itemRoute) {
							changeRoute({ path: itemRoute });
						} else if (changeRoute) {
							changeRoute({ parent: true });
						}
						itemSaving.value = false;
						return answer;
					});
				})
				.catch(() => {
					itemSaving.value = false;
				});
		}
	};

	const handleCloseButton = () => {
		if (changeRoute) {
			changeRoute({ history: true, steps: -1 });
		}
	};

	const fetchPageData = (id, options) => {
		const fetchItemAction =
			typeof fetchItem === 'function'
				? fetchItem
				: (requestPayload) => {
						if (!apiRoute) {
							console.warn('[useItemPage] apiRoute is not defined');
							return Promise.resolve(null);
						}

						return api_request.get(`${apiRoute}/${requestPayload.itemId}`, {
							notNotify: true,
							...requestPayload,
						});
					};

		_itemLoading.value = true;

		return fetchItemAction({ itemId: id, ...options })
			.then((answer) => {
				const { value, request_payload } = answer || {};
				_loadContent.value = true;
				if (!request_payload?.setToStore) {
					_itemData.value = value;
				}
				if (successFetchItemCallback) {
					successFetchItemCallback(value);
				}
				return answer;
			})
			.catch((error) => {
				if (error?.response?.status === 404) {
					let path = '';
					const canAccess =
						typeof hasAccessTo === 'function' ? hasAccessTo : authStore.hasAccessTo;

					if (!canAccess?.(['view_dashboard'])) {
						if (canAccess?.(['view_oee'])) path = '/processes';
						else if (canAccess?.(['view_requisitions'])) path = '/requisitions';
					} else {
						path = '/dashboard';
					}

					router.push(path);
					setTimeout(() => {
						Notify({
							type: 'warning',
							title: Lang.tt('Redirect'),
							message: `${resolve(itemsName)?.one} ${Lang.tt('with')} id "${id}" ${Lang.tt(
								'phrases.not_found',
							)}`,
						});
					}, 200);
				}
				return Promise.reject(error);
			})
			.finally(() => {
				_itemLoading.value = false;
			});
	};

	const initialPageSetup = ({ params, path }) => {
		_loadContent.value = false;
		setup_navbar(navbarSettings.value);
		let id = paramsId || params?.id;

		if (path === '/profile') {
			id = authUser.value?.id;
		}

		if (validateRouteParams(id)) {
			if (id === 'new') {
				_itemData.value = null;
				_loadContent.value = true;
			} else {
				return fetchPageData(id, { notNotify: true });
			}
		} else {
			router.push({ name: 'NotFoundPage' });
		}

		return Promise.resolve(null);
	};

	watch(pageTitle, () => {
		setup_navbar(navbarSettings.value);
	});

	onMounted(() => {
		initialPageSetup(route);
	});

	onBeforeUnmount(() => {
		if (!preventDestroyNavbar && !preventSetNavbar) {
			setup_navbar({});
		}
	});

	return {
		itemSaving,
		authUser,
		pageTitle,
		navbarSettings,
		loadContent: _loadContent,
		itemData: _itemData,
		itemLoading: _itemLoading,
		handleSaveItem,
		handleSubmitForm,
		handleCloseButton,
		initialPageSetup,
		setup_navbar,
		fetchPageData,
	};
}
