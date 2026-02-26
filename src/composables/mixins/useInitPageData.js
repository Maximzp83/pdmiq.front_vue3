import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { validateRouteParams } from '@/helpers';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useNotify } from '@/composables/useNotify';
import { Lang } from '@/localization';

export function useInitPageData({
	itemsName,
	additionalNavbarSettings,
	preventSetNavbar,
	preventSetupNavbar,
	preventDestroyNavbar,
	paramsId,
	fetchItem,
	successFetchItemCallback,
	itemData,
	loadContent,
	itemLoading,
	hasAccessTo,
} = {}) {
	const route = useRoute();
	const router = useRouter();
	const globalStore = useGlobalStore();
	const authStore = useAuthStore();
	const { Notify } = useNotify();

	const _loadContent = loadContent || ref(false);
	const _itemData = itemData || ref(null);
	const _itemLoading = itemLoading || ref(false);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const authUser = computed(() => authStore.authUser);

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
		if (
			(!meta || !meta.preventSetupNavbar) &&
			!preventSetupNavbar &&
			!preventSetNavbar
		) {
			globalStore.setup_navbar(settings);
		}
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
				_loadContent.value = true;
			} else {
				fetchPageData(id, { notNotify: true });
			}
		} else {
			router.push({ name: 'NotFoundPage' });
		}
	};

	const fetchPageData = (id, options) => {
		if (typeof fetchItem !== 'function') {
			console.warn('[useInitPageData] fetchItem is not a function');
			return;
		}

		_itemLoading.value = true;

		fetchItem({ itemId: id, ...options })
			.then(({ value, request_payload }) => {
				_loadContent.value = true;
				if (!request_payload.setToStore) {
					_itemData.value = value;
				}
				if (successFetchItemCallback) {
					successFetchItemCallback(value);
				}
				_itemLoading.value = false;
			})
			.catch((error) => {
				_itemLoading.value = false;
				if (error?.response?.status === 404) {
					let path = '';
					const canAccess =
						typeof hasAccessTo === 'function'
							? hasAccessTo
							: authStore.hasAccessTo;

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
			});
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
		authUser,
		pageTitle,
		navbarSettings,
		loadContent: _loadContent,
		itemData: _itemData,
		itemLoading: _itemLoading,
		initialPageSetup,
		setup_navbar,
		fetchPageData,
	};
}
