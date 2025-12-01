<template>
	<div
		class="dashboard-layout"
		tabindex="0"
		v-if="isAuthenticated"
	>
		<!-- <VueElementLoading
			:active="authIsLoading || overlayData.show || mainPreloader"
			:text="overlayData.text"
			:textStyle="overlayData.textStyle"
			:is-full-screen="true"
		/> -->
		<div
			v-if="!authIsLoading && !isAuthChecking"
			:class="['dashboard-wrapper wrapper', { 'sidebar-mini': isSidebarCollapse }]"
		>
			<!-- <CoverOverlay
				:active="overlayData.show || isSidebarShow"
				:text="overlayData.text"
				:z="isSidebarShow ? 800 : overlayData.zIndex"
				@onClick="overlayClick"
			/> -->

			<!-- <RouterView
				v-slot="{ Component }"
				name="sidebar"
			>
				<component
					:is="Component"
					@event="handleEvent"
					:isCollapse="isSidebarCollapse"
					:isShow="isSidebarShow"
					:currentPath="currentPath"
				/>
			</RouterView> -->

			<Sidebar
				:isCollapse="isSidebarCollapse"
				:isShow="isSidebarShow"
				:currentPath="currentPath"
			/>

			<div class="main-panel">
				<TopNavbar
				/>

				<div class="dashboard-content-wrapper">
					<div class="dashboard-content-container">
						<div class="page-top-bg-addition" />

						<RouterView
							ref="viewContent"
							:key="viewContentComponentKey"
						/>

						<!-- <RouterView v-slot="{ Component }">
							<transition name="component-scale" mode="out-in">
								<component :is="Component"
									ref="viewContent"
									:key="viewContentComponentKey"
									@event="handleEventNew"
								/>
							</transition>
						</RouterView> -->							
					</div>
				</div>
			</div>

			<!-- <DynamicFormContainer editModalProp="editModal" />
			<DynamicFormContainer editModalProp="editModalSecond" />
			<DynamicFormContainer
				editModalProp="editModalClassic"
				@event="handleEventNew"
			/>
			<DynamicFormContainer editModalProp="editModalClassicSecond" /> -->
		</div>

		<!-- <ImagePreviewModal
			hideTitle
			showProgressBar
			@closeModal="closePreviewModal"
			:imgDialogOpen="imgPreviewOpen"
			:imgId.sync="currentImageId"
			:pictures="imagesList"
		/> -->
	</div>
</template>

<script setup>
	import { ref, onMounted, defineAsyncComponent, computed, provide, useTemplateRef } from 'vue';
	import { useRoute } from 'vue-router';
	import { storeToRefs } from 'pinia';

	const TopNavbar = defineAsyncComponent(() => import('@/components/layout/TopNavbar.vue'))
	const Sidebar = defineAsyncComponent(() => import('@/components/layout/Sidebar/Sidebar.vue'));

// @ is an alias to /src
/*import langEn from 'element-ui/lib/locale/lang/en';
import langEs from 'element-ui/lib/locale/lang/es';
import locale from 'element-ui/lib/locale';

import { mapState, mapActions } from 'vuex';
import { eventHandler, navigation } from '@/mixins';
import { getParamsFromUrl } from '@/services/api/api_helpers';
import IdleTimer from '@/utils/IdleTimer';
import { LANGUAGE_TYPES } from '@/localization/utils';*/

	// -----Composables-----
	
	// import { useHelpers } from "@/composables/mixins/useHelpers";
	// const { useLoadStore } = useHelpers();

	// ==========Store===========
	// -----Auth------
	import { useAuthStore } from "@/stores/AuthStore";
	// const authStore = useAuthStore();
	const {
		authUser,
		isAuthenticated,
		authIsLoading,
		isAuthChecking,
	} = storeToRefs(useAuthStore());
	
	// -----Global------
	import { useGlobalStore } from "@/stores/GlobalStore";
	const globalStore = useGlobalStore();
	const { 
		viewContentComponentKey, overlayData,	editModal,
		editModalSecond, editModalClassic, editModalClassicSecond,
		redirectTo, isSidebarCollapse, mainPreloader,
		globalFilters,
	} = storeToRefs(globalStore);

	const { set_value: set_global_store } = globalStore;

	// ========== Data ==========
	const isSidebarShow = ref(false);
	

	const plantItem = null;

	const currentPath = useRoute().fullPath;
	// console.log(currentPath)
	
	// ----methods---
	const testEvent = () => {
		isSidebarShow.value = !isSidebarShow.value;
	};

	const set_compare_list = (data)=> {
		set_global_store('compareList', data);
	};

	const createItem = () => {
		const inputRef = useTemplateRef('inputElement');

		if (this.$refs.viewContent.handleCreateItem) {
			this.$refs['viewContent'].handleCreateItem();
		}
	};

	const handleLayoutClick = ({ target }) => {
		// console.log(target)
		set_global_store('layout_click_target', target);
		// this.$store.dispatch('set_layout_click', target);
	};

	provide('DashboardLayout.methods', {
		testEvent,
		set_compare_list,
		createItem,
	});


	

	onMounted(() => {
	  console.log(`DashboardLayout`)
	})

// export default {
	/*setup() {
		const plantItem = null;
		const isAuthenticated = ref(true);
		const authIsLoading = ref(false);
		const isAuthChecking = ref(false);
		const isSidebarCollapse = false;
		const isSidebarShow = false;
		const currentPath = ref('');
		const viewContentComponentKey = ref(1);
		let test = '';
		// ----methods---
		const handleLayoutClick = () => {	console.log('Layout clicked'); };
		const handleEvent = (event) => { console.log('Event handled:', event); };
		const handleEventNew = (event) => {	console.log('New event handled:', event);	};

		onMounted(() => {
		  console.log(`DashboardLayout`)
		})

		return {
			plantItem,
			isAuthenticated,
			authIsLoading,
			isAuthChecking,
			isSidebarCollapse,
			isSidebarShow,
			currentPath,
			viewContentComponentKey,

			handleLayoutClick,
			handleEvent,
			handleEventNew,
		}
	},*/
	// mixins: [eventHandler(), navigation()],
	// name: 'DashboardLayout',
	/*components: {
		DynamicFormContainer: () =>
			import('../components/form/DynamicFormContainer.vue'),
		ImagePreviewModal: () => import('@/components/common/ImagePreviewModal.vue')
	},*/
	/*data() {
		return {
			isSidebarShow: false,
			isAuthChecking: true,

			// isTimeout: null,
			// setIsTimeout: null,

			// idleTimer: null,
			// mouseTimer: null,

			currentImageId: '',
			imgPreviewOpen: false,
			imagesList: []
		};
	},*/

	/*computed: {
		...mapState({
			viewContentComponentKey: state => state.global.viewContentComponentKey,
			// DashboardLayoutComponentKey: state => state.global.DashboardLayoutComponentKey,
			overlayData: state => state.global.overlay,
			editModal: state => state.global.editModal,
			editModalSecond: state => state.global.editModalSecond,
			editModalClassic: state => state.global.editModalClassic,
			editModalClassicSecond: state => state.global.editModalClassicSecond,
			authIsLoading: state => state.auth.isLoading,
			isAuthenticated: state => state.auth.isAuthenticated,
			authUser: state => state.auth.authUser,
			redirectTo: state => state.auth.redirectTo,
			isSidebarCollapse: state => state.global.isSidebarCollapse,
			mainPreloader: state => state.global.mainPreloader
		}),

		currentPath() {
			return this.$route.fullPath;
		}
	},*/

	/*methods: {
		...mapActions({
			get_auth_user: 'auth/get_auth_user',
			minimizeSidebar: 'minimizeSidebar',
			set_layout_click: 'set_layout_click',
			set_compare_list: 'set_compare_list',
			set_global_state: 'set_global_state',
			show_edit_modal: 'show_edit_modal',
			auth_set_data: 'auth/set_data',
			save_visit_analytics: 'save_visit_analytics'
		}),

		signIn(token) {
			this.get_auth_user(token).then(() => {
				this.$router.push('/dashboard');
			});
		},

		toggleSidebar() {
			this.isSidebarShow = !this.isSidebarShow;
		},

		closePreviewModal() {
			this.currentImageId = null;
			this.imgPreviewOpen = false;
		},
		togglePreviewModal({ pictureId, picturesList }) {
			this.currentImageId = pictureId + '';
			this.imagesList = picturesList;
			this.imgPreviewOpen = true;
		},

		// -------------------
		overlayClick() {
			this.isSidebarShow = false;
			this.show_edit_modal({
				editModalProp: 'editModal',
				show: false
			});
			this.show_edit_modal({
				editModalProp: 'editModalSecond',
				show: false
			});
			this.show_edit_modal({
				editModalProp: 'editModalClassic',
				show: false
			});
			this.show_edit_modal({
				editModalProp: 'editModalClassicSecond',
				show: false
			});
		},

		createItem() {
			if (this.$refs.viewContent.handleCreateItem) {
				this.$refs['viewContent'].handleCreateItem();
			}
		},

		saveItem() {
			if (this.$refs.viewContent.handleSaveItem) {
				this.$refs['viewContent'].handleSaveItem();
			}
		},
		cleanForm() {
			if (this.$refs.viewContent.handleCleanForm) {
				this.$refs['viewContent'].handleCleanForm();
			}
		},
		deleteItems() {
			if (this.$refs.viewContent.handleDeleteItems) {
				this.$refs['viewContent'].handleDeleteItems();
			}
		},

		handleLayoutClick({ target }) {
			// console.log(target)
			this.set_layout_click(target);
			// this.$store.dispatch('set_layout_click', target);
		},

		printHTML({ querySelector }) {
			const printContentsElement = document.querySelector(querySelector);
			const clone = printContentsElement.cloneNode(true);

			document.body.classList.add('enable-print');
			clone.classList.add('section-to-print');
			document.body.appendChild(clone);

			window.print();

			document.body.classList.remove('enable-print');
			document.body.removeChild(clone);
		},

		logout() {
			this.$store.dispatch('auth/set_data', {
				stateProp: 'redirectTo',
				value: this.currentPath
			});
			this.$store.dispatch('auth/sign_out', {
				message: 'You were logged out due to inactivity',
				type: 'warning',
				duration: 0
			});
		}
	},*/

	/*watch: {
		currentPath(path) {
			if (process.env.NODE_ENV !== 'development') {
				this.save_visit_analytics({
					data: { url: path }
				});
			}
			// console.log(path)
		}
	},*/

	/*created() {
		this.$store.dispatch('auth/set_data', {
			stateProp: 'first_loading_app',
			value: false
		});
	},

	beforeMount() {
		const { pathOnly } = getParamsFromUrl(this.currentPath);
		// console.log('DashboardLayout.vue', pathOnly)
		const currentPath = pathOnly || this.currentPath;
		// console.log(this.redirectTo)
		this.get_auth_user().then(() => {
			// console.log(this.redirectTo)
			// this.$Lang.set(this.authUser.language);
			// console.log('beforeMount', this.$Lang.currentLangId)
			if (this.$Lang.currentLangId === LANGUAGE_TYPES.ENGLISH) {
				locale.use(langEn);
			} else if (this.$Lang.currentLangId === LANGUAGE_TYPES.SPANISH) {
				locale.use(langEs);
			}

			this.isAuthChecking = false;
			// this.currentPath = this.$router.currentRoute.fullPath;
			if (this.redirectTo) {
				this.$router.push(this.redirectTo);
				this.auth_set_data({
					stateProp: 'redirectTo',
					value: null
				});
			} else if (currentPath === '/') {
				let path = '';
				// let path = '/sensors';
				if (!this.$hasAccessTo(['view_dashboard'])) {
					if (this.$hasAccessTo(['view_oee'])) path = '/processes';
					else if (this.$hasAccessTo(['view_requisitions'])) path = '/requisitions';
				} else {
					path = '/dashboard';
				}

				this.$router.push(path);
			}
		});
	},

	mounted() {
		if (process.env.NODE_ENV !== 'development' && this.authUser && this.authUser.id !== 2) {
			// console.log(IdleTimer)
			// 1800000 // 30 mins
			// 300000 // 5 mins
			// 1000 * 60 * 30, // 30 mins

			this.timer = new IdleTimer({
				timeout: 1200000, //20 mins
				onTimeout: () => {
					// console.log('onTimeout');
					this.timer.cleanUp();
					this.timer = null;
					this.logout();
				}
			});
		}
	},

	beforeDestroy() {
		if (this.timer) {
			this.timer.cleanUp();
			// clearTimeout(this.idleTimer);
		}
	}*/
// };
</script>
