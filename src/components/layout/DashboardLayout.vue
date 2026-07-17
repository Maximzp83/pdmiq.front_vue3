<template>
	<div class="dashboard-layout" tabindex="0" v-if="isAuthenticated" @click="handleLayoutClick">
		<VueElementLoading
			:active="authIsLoading || overlayData.show || mainPreloader"
			:text="overlayData.text"
			:textStyle="overlayData.textStyle"
			:is-full-screen="true"
		/>
		<div
			v-if="!authIsLoading && isAuthenticated && !isAuthChecking"
			:class="['dashboard-wrapper wrapper', { 'sidebar-mini': isSidebarCollapse }]"
		>
			<CoverOverlay
				:active="overlayData.show || isSidebarShow"
				:text="overlayData.text"
				:z="isSidebarShow ? 800 : overlayData.zIndex"
				@onClick="overlayClick"
			/>

			<Sidebar
				:isCollapse="isSidebarCollapse"
				:isShow="isSidebarShow"
				:currentPath="currentPath"
			/>

			<div class="main-panel">
				<div
					class="mfa-warning-block"
					v-if="enableMfaWarning"
					v-show="showMfaWarning"
				>
					<div class="mcontainer">
						<div class="flex mrow">
							<div class="mcol-xs-auto"><i class="el-icon-warning"></i></div>
							<div class="mcol-xs-auto">
								<b>{{ tt('aliases.mfa_warn_1') }}! </b>
								<span>{{ tt('aliases.mfa_warn_2') }}. </span>
								<router-link class="info-color" to="/profile">{{
									tt('aliases.mfa_warn_link')
								}}!</router-link>
							</div>
							<div class="mcol-xs-auto">
								<button
									class="item-action-button"
									@click="showMfaWarning = false"
								>
									<i class="icomoon icon-plus rotate"></i>
								</button>
							</div>
						</div>
					</div>
				</div>

				<TopNavbar />

				<div class="dashboard-content-wrapper">
					<div class="dashboard-content-container">
						<div class="page-top-bg-addition" />

						<router-view v-slot="{ Component }">
							<transition name="component-scale" mode="out-in">
						    <component
						    	:is="Component"
						    	ref="viewContent"
									:key="viewContentComponentKey"
									@event="handleEvent"
						    />
						  </transition>
						</router-view>
					</div>
				</div>
			</div>

			<DynamicFormContainer editModalProp="editModal" />
			<DynamicFormContainer editModalProp="editModalSecond" />
			<DynamicFormContainer
				editModalProp="editModalClassic"
				@event="handleEvent"
			/>
			<DynamicFormContainer editModalProp="editModalClassicSecond" />
		</div>

		<ImagePreviewModal
			hideTitle
			showProgressBar
			@closeModal="closePreviewModal"
			:imgDialogOpen="imgPreviewOpen"
			v-model:imgId="currentImageId"
			:pictures="imagesList"
		/>
	</div>
</template>

<script setup>
import {
	ref,
	onMounted,
	onBeforeMount,
	onBeforeUnmount,
	defineAsyncComponent,
	computed,
	provide,
	watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useEventHandler } from '@/composables/mixins/useEmitter';

const VueElementLoading = defineAsyncComponent(
	() => import('@/components/common/VueElementLoading.vue'),
);
const TopNavbar = defineAsyncComponent(
	() => import('@/components/layout/TopNavbar.vue'),
);
const Sidebar = defineAsyncComponent(
	() => import('@/components/layout/Sidebar/Sidebar.vue'),
);
const CoverOverlay = defineAsyncComponent(
	() => import('@/components/common/CoverOverlay.vue'),
);
const DynamicFormContainer = defineAsyncComponent(
	() => import('@/components/form/DynamicFormContainer.vue'),
);
const ImagePreviewModal = defineAsyncComponent(
	() => import('@/components/common/ImagePreviewModal.vue'),
);

// Utils and helpers
import { getParamsFromUrl } from '@/utils/url-helpers';
import IdleTimer from '@/utils/IdleTimer';
import { Lang } from '@/localization';
import { findItemBy, validateBySettings } from '@/helpers';
import { menuItems } from '@/constants/menuItems';

const { tt } = Lang;

// ==========Store===========
// -----Auth------
import { useAuthStore } from '@/stores/AuthStore';
const authStore = useAuthStore();
const { authUser, isAuthenticated, authIsLoading } =
	storeToRefs(authStore);

// -----Global------
import { useGlobalStore } from '@/stores/GlobalStore';
const globalStore = useGlobalStore();
const {
	viewContentComponentKey,
	overlayData,
	redirectTo,
	isSidebarCollapse,
	mainPreloader,
	globalFilters,
} = storeToRefs(globalStore);

const { set_value: set_global_store, set_compare_list } = globalStore;

// ========== Composables ==========
const route = useRoute();
const router = useRouter();

// ========== Data ==========
const isSidebarShow = ref(false);
const currentImageId = ref('');
const imgPreviewOpen = ref(false);
const imagesList = ref([]);
const showMfaWarning = ref(true);
const timer = ref(null);
const isAuthChecking = ref(true);

// ========== Computed ==========
const currentPath = computed(() => route.fullPath);

const enableMfaWarning = computed(() => {
	if (authUser.value && !authUser.value.is_mfa_enabled) {
		const plantAdminsIds = [4, 5, 6, 12];
		return plantAdminsIds.some((id) => id === authUser.value.role_id);
	}
	return false;
});

// ========== Methods ==========
const testEvent = (payload) => {
	console.log('testEvent:', payload)
	// isSidebarShow.value = !isSidebarShow.value;
};

const toggleSidebar = () => {
	isSidebarShow.value = !isSidebarShow.value;
};

/*const set_compare_list = (data) => {
	set_compare_list(data);
};*/

const setGlobalFilters = ({ id, filterName }) => {
	const newFilters = { ...globalFilters.value, [filterName]: id };
	globalStore.set_global_filters(newFilters);
};

const signIn = (token) => {
	authStore.get_auth_user(token).then(() => {
		router.push('/dashboard');
	});
};

const validateByCompanySettings = (menuId, company) => {
	if (!menuId || !company?.menu_items) return true;

	const menuItem = findItemBy('id', menuId, company.menu_items);
	return menuItem ? menuItem.on : true;
};

const hasAccessToMenuItem = (item, user) => {
	const { meta = {}, id } = item;
	const checks = [validateByCompanySettings(id, user?.company)];

	if (meta.permissions) {
		checks.push(authStore.hasAccessTo(meta.permissions, meta.permissionsMethod));
	}

	if (meta.conditionSettings) {
		checks.push(validateBySettings({ ...meta.conditionSettings, dataObj: user }));
	}

	if (meta.userTypes) {
		checks.push(meta.userTypes.includes(user?.type));
	}

	return checks.every(Boolean);
};

const findFirstAvailableMenuPath = (items, user) => {
	for (const item of items) {
		if (!hasAccessToMenuItem(item, user)) continue;

		if (item.children?.length) {
			const childPath = findFirstAvailableMenuPath(item.children, user);
			if (childPath) return childPath;
		}

		if (item.path) return item.path;
	}

	return '';
};

const getDefaultRedirectPath = () => {
	return findFirstAvailableMenuPath(menuItems(), authUser.value) || '/profile';
};

const handleLayoutClick = ({ target }) => {
	set_global_store('layout_click_target', target);
};

const closePreviewModal = () => {
	currentImageId.value = null;
	imgPreviewOpen.value = false;
};

const togglePreviewModal = ({ pictureId, picturesList }) => {
	currentImageId.value = pictureId + '';
	imagesList.value = picturesList;
	imgPreviewOpen.value = true;
};

const overlayClick = () => {
	isSidebarShow.value = false;
	globalStore.show_edit_modal({
		editModalProp: 'editModal',
		show: false,
	});
	globalStore.show_edit_modal({
		editModalProp: 'editModalSecond',
		show: false,
	});
	globalStore.show_edit_modal({
		editModalProp: 'editModalClassic',
		show: false,
	});
	globalStore.show_edit_modal({
		editModalProp: 'editModalClassicSecond',
		show: false,
	});
};

/*const handleEvent = (event) => {
	console.log('handleEvent:', event);
};*/

/*const handleEvent = (event) => {
	console.log('handleEvent:', event);
};*/

const printHTML = ({ querySelector }) => {
	globalStore.set_global_state({
		stateProp: 'printHTMLWindowIsOpen',
		value: true,
	});

	setTimeout(() => {
		const printContentsElement = document.querySelector(querySelector);
		const clone = printContentsElement.cloneNode(true);

		document.body.classList.add('enable-print');
		clone.classList.add('section-to-print');
		document.body.appendChild(clone);

		window.print();

		document.body.classList.remove('enable-print');
		document.body.removeChild(clone);

		globalStore.set_global_state({
			stateProp: 'printHTMLWindowIsOpen',
			value: false,
		});
	}, 100);
};

const autoLogout = () => {
	authStore.set_redirect_to(currentPath.value);
	authStore.sign_out({
		message: 'You were logged out due to inactivity',
		type: 'warning',
		duration: 0,
	});
};

const methodsMap = {
	autoLogout,
	printHTML,
	closePreviewModal,
	togglePreviewModal
};

const emit = defineEmits(['event']);
const { handleEvent } = useEventHandler(methodsMap, emit);


// ========== Provide ==========
provide('DashboardLayout.methods', {
	testEvent,
	toggleSidebar,
	set_compare_list,
	// createItem,
	// saveItem,
	// cleanForm,
	// deleteItems,
	togglePreviewModal,
	printHTML,
	setGlobalFilters,
	// handleEvent,
	signIn,
});

// ========== Watchers ==========
watch(currentPath, (path) => {
	if (import.meta.env.MODE !== 'development') {
		globalStore.save_visit_analytics({
			data: { url: path },
		});
	}
});

// ========== Lifecycle Hooks ==========
onBeforeMount(() => {
	setGlobalFilters({ id: null, filterName: 'companyId' });
	// console.log('DashboardLayout onBeforeMount', isAuthChecking.value);
	authStore.set_value('first_loading_app', false );

	const { pathOnly } = getParamsFromUrl(currentPath.value);
	const path = pathOnly || currentPath.value;

	authStore.get_auth_user().then(() => {
		isAuthChecking.value = false;

		if (redirectTo.value) {
			router.push(redirectTo.value);
			authStore.set_redirect_to(null);
		} else if (path === '/') {
			const redirectPath = getDefaultRedirectPath();

			router.push(redirectPath);
		}
	});
});

onMounted(() => {
	// console.log('DashboardLayout mounted');

	if (
		import.meta.env.MODE !== 'development' &&
		authUser.value &&
		authUser.value.id !== 2
	) {
		timer.value = new IdleTimer({
			timeout: 1200000, // 20 mins
			onTimeout: () => {
				if (timer.value) {
					timer.value.cleanUp();
					timer.value = null;
				}
				autoLogout();
			},
		});
	}
});

onBeforeUnmount(() => {
	if (timer.value) {
		timer.value.cleanUp();
		timer.value = null;
	}
});
</script>
