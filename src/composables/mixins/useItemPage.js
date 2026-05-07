import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { api_request } from '@/api/request_provider';
import { validateRouteParams } from '@/helpers';
import { checkUploadSettings } from '@/helpers/specialHelpers';
import { useNotify } from '@/composables/useNotify';
import { executeFormSubmit } from '@/composables/mixins/executeFormSubmit';
import { useNavigation } from '@/composables/mixins/useNavigation';
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
	successFetchItemCallback,
	hasAccessTo,
	uploadSettings,
	preparePayload,
	localSubmit,
	successSubmitCallback,
	propsSuccessSubmitCallback,
	itemFormRef,
	localPageTitle,
	customButtons,
	localPreSubmitHook,
	returnToListAfterSave,
	debug
} = {}) {
	const { changeRoute } = useNavigation();
	const route = useRoute();
	const router = useRouter();
	const globalStore = useGlobalStore();
	const authStore = useAuthStore();
	const { Notify } = useNotify();
	const itemSaving = ref(false);
	const _loadContent = ref(false);
	const _itemData = shallowRef(null);
	const _itemLoading = ref(false);
	const authUser = computed(() => authStore.authUser);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const getRouteItemId = () => {
		if (paramsId) {
			return paramsId;
		}

		if (route.params?.id) {
			return route.params.id;
		}

		const routePathParts = route.path.split('/').filter(Boolean);
		const lastPathPart = routePathParts[routePathParts.length - 1];

		if (lastPathPart === 'new') {
			return 'new';
		}

		return undefined;
	};

	const pageTitle = computed(() => {
		if (localPageTitle && typeof localPageTitle === 'function') {
			return localPageTitle(_itemData.value);
		}
		const itemName = resolve(itemsName)?.one || 'Item';
		if (_itemData.value) {
			return `${itemName}`;
		}
		return `${Lang.tt('New')} ${itemName}`;
	});

	const _customButtons = computed(() => {
		if (customButtons && typeof customButtons === 'function') {
			return customButtons(_itemData.value);
		}
		return customButtons;
	});

	const navbarSettings = computed(() =>
		Object.freeze({
			pageTitle: pageTitle.value,
			customButtons: _customButtons.value,
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

	const handleSubmitForm = (preparedData, ) => {
		if (!apiRoute) {
			console.warn('[useItemPage] apiRoute is not defined');
			itemSaving.value = false;
			return;
		}

		executeFormSubmit({
			itemSaving,
			itemId: getRouteItemId(),
			formData: preparedData,
			itemName: resolve(itemsName)?.one || 'Item',
			uploadSettings,
			preparePayload,
			localPreSubmitHook,
			debug,
			successSubmitCallback,
			propsSuccessSubmitCallback,
			apiRoute
		})
		.then((answer) => {
			if (returnToListAfterSave) {
				const path = itemRoute ? itemRoute : {parent: true};
				changeRoute({ path });				
			} else if (!answer?.request_payload?.setToStore) {
				_itemData.value = answer.data;
			}
		})
	};

	const handleCloseButton = () => {
		if (changeRoute) {
			changeRoute({ history: true, steps: -1 });
		}
	};

	const fetchPageData = (id, options) => {
		if (!apiRoute) {
			console.warn('[useItemPage] apiRoute is not defined');
			return Promise.resolve(null);
		}

		_itemLoading.value = true;

		return api_request.get(`${apiRoute}/${id}`, {
			notNotify: true,
			itemId: id,
			...options,
		})
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

	const initialPageSetup = ({ path }) => {
		_loadContent.value = false;
		setup_navbar(navbarSettings.value);
		let id = getRouteItemId();

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
			router.push({ name: 'NotFound' });
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
