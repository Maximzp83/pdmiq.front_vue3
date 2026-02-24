<template>
	<div
		class="dashboard-layout"
		tabindex="0"
		v-if="isAuthenticated"
	>
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
			<!-- <idle-view /> -->
			<CoverOverlay
				:active="overlayData.show || isSidebarShow"
				:text="overlayData.text"
				:z="isSidebarShow ? 800 : overlayData.zIndex"
				@onClick="overlayClick"
			/>

			<router-view
				name="sidebar"
				@event="handleEvent"
				:isCollapse="isSidebarCollapse"
				:isShow="isSidebarShow"
				:currentPath="currentPath"
			/>

			<div class="main-panel">
				<!-- <div class="">lang test: {{ tt('hello') }}</div> -->
				<div class="mfa-warning-block"
					v-if="enableMfaWarning"
					v-show="showMfaWarning"
				>
					<div class="mcontainer">
						<div class="flex mrow">
							<div class="mcol-xs-auto"><i class="el-icon-warning"></i></div>
							<div class="mcol-xs-auto">
								<b>{{ tt('aliases.mfa_warn_1') }}! </b>
								<span>{{ tt('aliases.mfa_warn_2') }}. </span>
								<router-link
									class="info-color"
									to="/profile"
								>{{ tt('aliases.mfa_warn_link') }}!</router-link>
							</div>
							<div class="mcol-xs-auto">
								<button class="item-action-button"
									@click="showMfaWarning = false"
								>
									<i class="icomoon icon-plus rotate"></i>									
								</button>
							</div>
						</div>
					</div>
				</div>

				<router-view name="navbar" @event="handleEvent" :currentPath="currentPath" />

				<div class="dashboard-content-wrapper">
					<div class="dashboard-content-container">
						<div class="page-top-bg-addition" />

						<transition name="component-scale" mode="out-in">
							<router-view
								ref="viewContent"
								:key="viewContentComponentKey"
								@event="handleEventNew"
							/>
						</transition>
					</div>
				</div>
			</div>

			<!-- <SingleFormContainer v-if="editModal.single"/> -->
			<DynamicFormContainer editModalProp="editModal" />
			<DynamicFormContainer editModalProp="editModalSecond" />
			<DynamicFormContainer
				editModalProp="editModalClassic"
				@event="handleEventNew"
			/>
			<DynamicFormContainer editModalProp="editModalClassicSecond" />
		</div>

		<ImagePreviewModal
			hideTitle
			showProgressBar
			@closeModal="closePreviewModal"
			:imgDialogOpen="imgPreviewOpen"
			:imgId.sync="currentImageId"
			:pictures="imagesList"
		/>
		<!-- :imgId="currentImageId" -->
	</div>
</template>

<script>
// @ is an alias to /src
import langEn from 'element-ui/lib/locale/lang/en';
import langEs from 'element-ui/lib/locale/lang/es';
import locale from 'element-ui/lib/locale';

import { mapState, mapActions } from 'vuex';
import { eventHandler, navigation } from '@/mixins';
import { getParamsFromUrl } from '@/services/api/api_helpers';
import IdleTimer from '@/utils/IdleTimer';
import { LANGUAGE_TYPES } from '@/localization/utils';

export default {
	mixins: [eventHandler(), navigation()],
	name: 'DashboardLayout',
	components: {
		DynamicFormContainer: () =>
			import('../components/form/DynamicFormContainer.vue'),
		ImagePreviewModal: () => import('@/components/common/ImagePreviewModal.vue')
	},
	data() {
		return {
			isSidebarShow: false,
			isAuthChecking: true,

			// isTimeout: null,
			// setIsTimeout: null,

			// idleTimer: null,
			// mouseTimer: null,

			currentImageId: '',
			imgPreviewOpen: false,
			imagesList: [],

			showMfaWarning: true,
		};
	},

	computed: {
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
			mainPreloader: state => state.global.mainPreloader,
			globalFilters: state => state.global.globalFilters,

		}),

		/* isIdle() {
			return this.$store.state.idleVue.isIdle;
		}, */

		currentPath() {
			return this.$route.fullPath;
		},

		enableMfaWarning() {
			// console.log('1', this.authUser)
			/*if (this.authUser && !this.authUser.is_mfa_enabled) {
				const plantAdminsIds = [4,5,6,12];
				return plantAdminsIds.some(id => id === this.authUser.role_id);
			}*/
			return false;
		},
	},

	methods: {
		...mapActions({
			get_auth_user: 'auth/get_auth_user',
			minimizeSidebar: 'minimizeSidebar',
			set_layout_click: 'set_layout_click',
			set_compare_list: 'set_compare_list',
			set_global_state: 'set_global_state',
			show_edit_modal: 'show_edit_modal',
			auth_set_redirect_to: 'auth/set_redirect_to',
			save_visit_analytics: 'save_visit_analytics',
			set_global_filters: 'set_global_filters',
		}),

		setGlobalFilters({ id, filterName }) {
			const newFilters = { ...this.globalFilters, [filterName]: id };
			this.set_global_filters(newFilters);
		},

		signIn(token) {
			this.get_auth_user(token).then(() => {
				this.$router.push('/dashboard');
			});
		},

		toggleSidebar() {
			this.isSidebarShow = !this.isSidebarShow;
			/*this.overlayOptions = {
				show: this.isSidebarShow,
				zIndex: 800
			};*/
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
		/*show_edit_modal(data) {
			this.$store.dispatch('show_edit_modal', data);
		},*/

		overlayClick() {
			this.isSidebarShow = false;
			this.show_edit_modal({
				/*...this.editModal,*/ editModalProp: 'editModal',
				show: false
			});
			this.show_edit_modal({
				/*...this.editModalSecond,*/ editModalProp: 'editModalSecond',
				show: false
			});
			this.show_edit_modal({
				/*...this.editModalClassic,*/ editModalProp: 'editModalClassic',
				show: false
			});
			this.show_edit_modal({
				/*...this.editModalClassic,*/ editModalProp: 'editModalClassicSecond',
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

		/*resetIdle() {
			// console.log('resetIdle')
			if (this.idleTimer) {
				clearTimeout(this.idleTimer);
			}

			this.idleTimer = setTimeout(() => {
				console.log(this.idleTimer, 'is idle - logout')
				this.idleTimer = null;
				clearTimeout(this.idleTimer);
				this.logout();
			}, 
				// 1800000 // 30 mins
				// 300000 // 5 mins
				// 1000 * 60 * 30, // 30 mins
				20000
				// 2000
			);
		},*/

		printHTML({ querySelector }) {
			this.set_global_state({	stateProp: 'printHTMLWindowIsOpen',	value: true });
			
			setTimeout(() => {
				const printContentsElement = document.querySelector(querySelector);
				const clone = printContentsElement.cloneNode(true);
				// console.log(clone)

				document.body.classList.add('enable-print');
				clone.classList.add('section-to-print');
				document.body.appendChild(clone);

				window.print();

				document.body.classList.remove('enable-print');
				document.body.removeChild(clone);

				this.set_global_state({	stateProp: 'printHTMLWindowIsOpen',	value: false });
			}, 100);


			/*setTimeout(function() {
				document.body.innerHTML = originalContents;				
			}, 10);*/
		},

		logout() {
			this.$store.dispatch('auth/set_redirect_to', this.currentPath);
			this.$store.dispatch('auth/sign_out', {
				message: 'You were logged out due to inactivity',
				type: 'warning',
				duration: 0
			});
		}
	},

	watch: {
		/*isAppIdle(val) {
			if (val) {
				this.$store.dispatch('auth/set_data', {
					stateProp: 'redirectTo',
					value: this.currentPath
				});
				this.$store.dispatch('auth/sign_out', {
					message: 'You was logged out because of inactivity',
					type: 'warning'
				});
			}
		}*/
		/*$route(to) {
			// , to,from
			this.currentPath = to.fullPath;
		}*/
		currentPath(path) {
			if (process.env.NODE_ENV !== 'development') {
				this.save_visit_analytics({
					data: { url: path }
				});
			}
			// console.log(path)
		}
	},

	created() {
		this.setGlobalFilters({ id: null, filterName: 'companyId' });
		
		this.$store.dispatch('auth/set_data', {
			stateProp: 'first_loading_app',
			value: false
		});


		/*window.testTime = () => console.time('load')
		window.testEndTime = () => console.timeEnd('load')
		window.testTime()*/
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
				this.auth_set_redirect_to(null);
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
	}
};
</script>
