<template>
	<div class="navbar navBar-wrapper">
		<div class="mcontainer navBar-container">
			<div class="mrow flex wrap align-center buttonsBlock 1vertical-margin-0">
				<div class="menu-block burger-button-container md-hide">
					<button
						type="button"
						class="navbar-toggle"
						@click="emitEvent('toggleSidebar')"
					>
						<i class="icomoon icon-lists" />
					</button>
				</div>

				<transition name="standard-fade" mode="out-in">
					<div
						class="menu-block title-block mcol-xs-8 mcol-sm-auto"
						v-if="navbarSettings.showStandardNavItem"
					>
						<div class="flex align-center section-row">
							<div class="ellipsis">
								<div class="navbar-title ellipsis" v-html="pageTitle"></div>
								<!-- <h1 class="title page-title">{{ pageTitle }}</h1> -->
								<div
									class="prev-button link"
									@click="
										handleDisposableHistoryButton(
											navbarSettings.showStandardNavItem.backButton,
											navbarSettings.showStandardNavItem
										)
									"
								>
									<i class="icomoon icon-path_2"></i>
									<span class="capitalize">{{ tt('back') }}</span>
								</div>
							</div>
						</div>
					</div>

					<div
						v-else-if="pageTitle"
						class="menu-block title-block mcol-xs-8 mcol-sm-auto"
					>
						<div class="mrow flex align-center section-row">
							<div class="mcol-xs-auto">
								<div class="navbar-title" v-html="pageTitle"></div>
								<div
									v-if="!navbarSettings.hideBackButton"
									class="prev-button link"
									@click="() => handleDisposableHistoryButton()"
								>
									<i class="icomoon icon-path_2"></i>
									<span>{{ tt('back') }}</span>
								</div>
							</div>
						</div>
					</div>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<div
						class="flex align-center mcol-xs-8 mcol-sm-5 mcol-lg-auto fluid"
						v-if="navbarSettings.datepickerSettings"
					>
						<div
							class="bold div-block"
							v-if="navbarSettings.datepickerSettings.label"
							v-text="navbarSettings.datepickerSettings.label"
						></div>
						<Datepicker
							class="div-block no-min-width"
							setupDaterangeFilter
							enableShortcuts
							@input="
								range =>
									setFilters(navbarSettings.datepickerSettings.setFiltersAction, {
										...datepickerFilters,
										daterange: range,
										daterange_setted_at: Date.now()
									})
							"
							:value="datepickerFilters.daterange"
							clearingTo="last_7_days"
							type="daterange"
						/>
					</div>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<SearchBar
						v-if="navbarSettings.showSearchbar"
						class="menu-block search-block mcol-xs-12 mcol-sm-3"
						@submit="searchSubmit"
						:options="{ prepend: true }"
						:query="report_filters.q"
						:clearable="true"
					/>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<div
						class="menu-block buttonWrapper flex compareList"
						v-if="
							navbarSettings.showCompareButton &&
								compareList.length &&
								compareList.length > 1
						"
					>
						<router-link
							to="/sensors/compare/statistics"
							class="el-button el-button--secondary inverted"
						>
							{{ tt('compare') }}
							<i class="suffix-icon icomoon icon-compare"></i>
						</router-link>

						<el-button
							@click="emitEvent('set_compare_list', [])"
							type="secondary"
							native-type="button"
							:class="'clear-compare-button'"
							>{{ `${tt('clear')} ${tt('compare')}` }}</el-button
						>
					</div>
				</transition>

				<template v-if="!fromDashboard">
					<transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCreateButtonForTableForm"
						>
							<el-button
								@click="emitEvent('createItem')"
								type="secondary"
								native-type="button"
								:class="'shadow'"
								icon="icomoon icon-plus"
							/>
							<!-- </el-button> -->
						</div>
					</transition>

					<!-- <transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCreateButton"
						>
							<el-button
								@click="changeRoute({ path: '/new', addToCurrent: true })"
								type="secondary"
								native-type="button"
								:class="'shadow'"
								icon="icomoon icon-plus"
							>
								<span v-if="navbarSettings.showCreateButton.text">{{
									navbarSettings.showCreateButton.text
								}}</span>
							</el-button>
						</div>
					</transition> -->

					<!-- <transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCreateButtonForUltraSound"
						>
							<el-button
								@click="changeRoute({ path: '/new_ultra_sound', addToCurrent: true })"
								type="secondary"
								native-type="button"
								:class="'shadow'"
								icon="icomoon icon-plus"
							>
								<span v-if="navbarSettings.showCreateButtonForUltraSound.text">{{
									navbarSettings.showCreateButtonForUltraSound.text
								}}</span>
							</el-button>
						</div>
					</transition>

					<transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCreateButtonForUltraSoundWhiteRiver"
						>
							<el-button
								@click="
									changeRoute({
										path: '/new_ultra_sound_white_river',
										addToCurrent: true
									})
								"
								type="secondary"
								native-type="button"
								:class="'shadow'"
								icon="icomoon icon-plus"
							>
								<span
									v-if="navbarSettings.showCreateButtonForUltraSoundWhiteRiver.text"
									>{{
										navbarSettings.showCreateButtonForUltraSoundWhiteRiver.text
									}}</span
								>
							</el-button>
						</div>
					</transition> -->

					<!-- <transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showDeleteButton"
						>
							<el-button
								@click="emitEvent('deleteItems')"
								type="secondary"
								native-type="button"
								plain
								:class="'shadow delete-button'"
								icon="icomoon icon-cross delete"
							/>
						</div>
					</transition> -->

					<!-- <transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showSaveButton"
						>
							<el-button
								@click="emitEvent('saveItem')"
								:class="'shadow save-button'"
								type="secondary"
								native-type="button"
								:loading="saving"
								icon="icomoon icon-check"
							/>
						</div>
					</transition> -->

					<!-- <transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCloseButton"
						>
							<el-button
								plain
								@click="handleCloseButton"
								type="secondary"
								native-type="button"
								:class="'shadow'"
								icon="icomoon icon-cross"
							/>
						</div>
					</transition> -->

					<transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.navigateButton"
						>
							<el-button
								@click="changeRoute(navbarSettings.navigateButton)"
								:class="'shadow save-button'"
								type="secondary"
								native-type="button"
								icon="icomoon icon-path_2"
							/>
						</div>
					</transition>

					<transition name="standard-fade" mode="out-in">
						<div class="menu-block buttonWrapper" v-if="navbarSettings.editButton">
							<el-button
								@click="changeRoute(navbarSettings.editButton)"
								:class="'shadow save-button'"
								type="secondary"
								native-type="button"
								icon="icomoon icon-pencil"
							/>
						</div>
					</transition>
					<transition name="standard-fade" mode="out-in">
						<div
							class="menu-block buttonWrapper"
							v-if="navbarSettings.showCleanButton"
						>
							<el-button
								@click="emitEvent('cleanForm')"
								type="secondary"
								native-type="button"
								plain
								:class="'shadow clean-button'"
								icon="icomoon icon-clean"
							/>
						</div>
					</transition>
				</template>

				<transition
					name="standard-fade"
					mode="out-in"
					v-if="factUserRoleType.isIndustrialMatrix"
				>
					<div
						class="menu-block role-select filter-block mcol-xs-6 mcol-sm-2 text-right ml-auto relative"
					>
						<SimpleSpinner :active="userRolesLoading" />
						<el-select
							filterable
							clearable
							v-show="globalFilters.plantId || authUser.temp_role_id"
							:disabled="!plantsList.length"
							@change="setTempRole"
							:value="authUser.temp_role_id"
							:placeholder="`${tt('select')} ${tt('role')}`"
						>
							<el-option
								v-for="item in userRolesList"
								:key="'plant_id-' + item.id"
								:label="item.name"
								:value="item.id"
							/>
						</el-select>
						<!-- <CustomSelect
							filterable
							clearable
							v-if="isIndustrialMatrix || authUser.temp_role_id"
							v-show="globalFilters.plantId || authUser.temp_role_id"
							:optionsLoading="userRolesLoading"
							:optionsList="userRolesList"
							:placeholder="`${tt('select')} ${tt('role')}`"
							@change="setTempRole"
							:value="authUser.temp_role_id"
						/> -->
					</div>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<div
						class="menu-block plant-select filter-block mcol-xs-6 mcol-sm-3 text-right ml-auto relative"
						v-if="navbarSettings.showFilter"
					>
						<CustomSelect
							filterable
							clearable
							:className="
								plantsList.length < 2 && (isCustomer || navbarSettings.infoOnly)
									? 'isClient'
									: ''
							"
							:optionsLoading="plantsLoading"
							:optionsList="plantsList"
							:placeholder="`${tt('select')} ${tt('plant')}`"
							@change="id => setGlobalFilters({ id: id, filterName: 'plantId' })"
							:value="globalFilters.plantId"
						/>
					</div>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<div
						class="menu-block plant-select filter-block mcol-xs-6 mcol-sm-3 text-right ml-auto relative"
						v-if="enableCompaniesFilter"
					>
						<CustomSelect
							filterable
							clearable
							:className="
								companiesList.length < 2 && (isCustomer || navbarSettings.infoOnly)
									? 'isClient'
									: ''
							"
							:optionsLoading="companiesLoading"
							:optionsList="companiesList"
							:placeholder="`${tt('select')} ${tt('company')}`"
							@change="id => setGlobalFilters({ id: id, filterName: 'companyId' })"
							:value="globalFilters.companyId"
						/>
					</div>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<div
						class="menu-block plant-select filter-block mcol-xs-6 mcol-sm-auto text-right ml-auto"
						v-if="showPlant"
					>
						<div class="">{{ showPlant.name }}</div>
					</div>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<div
						class="menu-block buttonWrapper ml-auto"
						v-if="navbarSettings.printButtonSettings"
					>
						<el-button
							@click="emitEvent('printHTML', navbarSettings.printButtonSettings)"
							type="secondary inverted"
							native-type="button"
							:class="''"
							:icon="navbarSettings.printButtonSettings.icon || 'el-icon-printer'"
						/>
					</div>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<div
						:class="[
							'menu-block creation-button-wrapper mcol-sm-auto',
							navbarSettings.datepickerSettings ? 'mcol-xs-1' : 'mcol-xs-2'
						]"
						v-if="creationMenuList.length"
					>
						<div class="ml-auto">
							<el-popover
								placement="bottom-end"
								popper-class="creation-menu-popover"
								trigger="manual"
								v-model="showCreationMenu"
								:width="230"
								:close-delay="0"
							>
								<el-button
									slot="reference"
									@click="showCreationMenu = !showCreationMenu"
									type="secondary"
									native-type="button"
									:class="'creation-menu-button'"
									icon="icomoon icon-plus"
								/>

								<ul class="creation-menu-list">
									<li
										v-for="item in creationMenuList"
										:key="`creation-item-${item.label}`"
										:class="{
											disabled:
												item.checkPlant && !globalFilters.plantId && !showPlant
										}"
										@click="createItemByMenu(item)"
									>
										<i :class="item.icon"></i>
										<span class="label">{{ item.label }}</span>
									</li>
								</ul>
							</el-popover>
						</div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script>
import { MAINTENANCE_TYPES } from '@/constants/global';
import { hasAccessTo } from '@/utils/hasAccessTo';
import { USER_ROLES_TYPES } from '@/constants/global';

import { navigation, fetchItemsHelper } from '@/mixins';
import { mapActions, mapState } from 'vuex';
import { findItemBy } from '@/helpers';
export default {
	mixins: [navigation(), fetchItemsHelper()],

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		currentPath: String,
		loading: Boolean,
		saving: Boolean
		// filters: Object
	},

	data: () => ({
		userRolesList: [],
		userRolesLoading: false,
		showCreationMenu: false,
		keepGlobalFilters: false,
		// companiesLoading: false,
		// companiesList: []
	}),

	computed: {
		...mapState({
			report_filters: state => state.sensors.report_filters,
			navbarSettings: state => state.global.navbarSettings,

			globalFilters: state => state.global.globalFilters,
			// globalSelectedPlant: state => state.global.globalSelectedPlant,
			plantsLoading: state => state.global.globalPlantsLoading,
			companiesLoading: state => state.global.globalCompaniesLoading,
			plantsList: state => state.global.globalPlantsList,
			companiesList: state => state.global.globalCompaniesList,
			authUser: state => state.auth.authUser,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,
			isCustomer: state => state.auth.isCustomer,

			compareList: state => state.global.compareList,
			fromDashboard: state => state.global.fromDashboard,
			disposableHistoryButton: state => state.global.disposableHistoryButton,
			userRolesListState: state => state.user_roles.itemsList
		}),

		pageTitle() {
			const { navbarSettings } = this;
			// console.log(navbarSettings)
			if (navbarSettings) {
				return navbarSettings.pageTitle || '';
			}

			return '';
		},

		enableCompaniesFilter: that => that.navbarSettings.enableCompaniesFilter,

		factUserRoleType() {
			let result = {};
			if (this.authUser.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX) {
				result.isIndustrialMatrix = true;
			} else if (this.authUser.type === USER_ROLES_TYPES.DEVELOPER) {
				result.isIndustrialMatrix = true;
				result.isDeveloper = true;
			} else if (this.authUser.type === USER_ROLES_TYPES.CUSTOMER) {
				result.isCustomer = true;
			}

			return Object.freeze(result);
		},
		// isCustomer: that => that.authUser && that.authUser.plants.length == 1,

		creationMenuModalSettings: () =>
			Object.freeze({
				editModalProp: 'editModalClassic',
				modalClassName: 'fixed-header-footer small-header small-footer'
			}),

		baseCreationMenuList() {
			return Object.freeze([
				{
					label: this.tt('common.Production_line'),
					instance: 'ProductionLines',
					checkPlant: true,
					icon: 'icomoon icon-production_lines',
					permissions: ['create_dashboard']
				},
				{
					label: this.tt('common.Utility'),
					instance: 'Utilities',
					checkPlant: true,
					componentPath: 'ProductionLines/ItemForm',
					icon: 'icomoon icon-production_lines',
					permissions: ['create_dashboard']
				},
				{
					label: this.tt('common.Machine'),
					instance: 'Machines',
					checkPlant: true,
					icon: 'icomoon icon-machines',
					permissions: ['create_dashboard']
				},
				{
					label: this.tt('common.Asset'),
					instance: 'Assets',
					checkPlant: true,
					icon: 'icomoon icon-assets',
					permissions: ['create_dashboard']
				},
				{
					label: this.tt('common.Item'),
					componentPath: 'Equipments/ItemFormWrapper',
					checkPlant: true,
					icon: 'icomoon icon-equipments',
					permissions: ['create_dashboard']
				},
				{
					label: this.tt('common.Work_Order'),
					componentPath: 'Maintenance/MaintenanceFormWrapper',
					icon: 'icomoon icon-maintenance',
					checkPlant: true,
					permissions: ['create_maintenance'],
					additionalModalSettings: {
						switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
						plantId: this.globalFilters.plantId
					}
				},
				{
					label: this.tt('common.Maintenance_Log'),
					componentPath: 'Maintenance/MaintenanceFormWrapper',
					checkPlant: true,
					icon: 'icomoon icon-maintenance',
					permissions: ['create_maintenance'],
					additionalModalSettings: {
						switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG },
						plantId: this.globalFilters.plantId
					}
				}
			]);
		},

		creationMenuList() {
			return Object.freeze(
				this.baseCreationMenuList.filter(mi =>
					hasAccessTo({ role: this.authUser.role, permissionKeys: mi.permissions })
				)
			);
		},

		showPlant() {
			if (this.navbarSettings && this.navbarSettings.showPlantName) {
				const { id, name } = this.navbarSettings.showPlantName;

				return Object.freeze({ id, name });
			}
			return null;
		},

		datepickerFilters() {
			if (this.navbarSettings.datepickerSettings) {
				const filtersPath = this.navbarSettings.datepickerSettings.filtersState.split(
					'.'
				);

				return this.$store.state[filtersPath[0]][filtersPath[1]];
			}
			return null;
		}
		// SCOPES: () => SCOPES,
	},

	methods: {
		...mapActions({
			show_edit_modal: 'show_edit_modal',
			fetch_user_roles: 'user_roles/fetch_user_roles',

			// set_global_filters: 'set_global_filters',
			set_global_filters: 'set_global_filters',
			set_report_filters: 'sensors/set_report_filters',
			fetch_global_plants: 'fetch_global_plants',
			fetch_global_companies: 'fetch_global_companies',

			// fetch_companies: 'companies/fetch_companies',
			set_global_state: 'set_global_state',
			set_temp_role: 'auth/set_temp_role',
			get_auth_user: 'auth/get_auth_user',
			set_user_roles: 'user_roles/set_user_roles',
			set_auth_user: 'auth/set_auth_user'
		}),

		fetchUserRoles() {
			this.doFetchAction('fetch_user_roles', 'userRolesList', 'userRolesLoading', {
				// toStore: true,
				params: { max: -1 }
			});
		},

		emitEvent(eventName, data) {
			this.$emit('event', eventName, data);
		},

		searchSubmit(payload) {
			// console.log(payload)
			// this.$emit('event', 'searchSubmit', payload);
			// this.$emit('searchSubmit', payload);
			const newFilters = { ...this.report_filters, q: payload.q };
			// console.log(newFilters)
			this.set_report_filters(newFilters);
		},

		handleCloseButton() {
			this.changeRoute({ history: true, steps: -1 });
		},

		handleDisposableHistoryButton(settings, additionalSettings) {
			// console.log(settings)
			this.changeRoute(settings || { history: true, steps: -1 });
			if (additionalSettings && additionalSettings.callback) {
				additionalSettings.callback();
			}
			/*this.set_global_state({
				stateProp: 'disposableHistoryButton',
				value: false
			});*/
		},

		setGlobalFilters({ id, filterName }) {
			const newFilters = { ...this.globalFilters, [filterName]: id };
			this.set_global_filters(newFilters);
		},

		setTempRole(role_id) {
			// console.log(role_id)
			this.userRolesLoading = true;
			let payload = {};
			if (role_id) {
				payload.method = 'POST';
				payload.data = {
					plant_id: this.globalFilters.plantId,
					role_id
				};
			} else {
				payload.method = 'DELETE';
			}

			/*if (payload) {
				console.log(this.$route.path.split('/'))
				return				
			}*/
			this.set_temp_role(payload)
				.then(user => {
					const userRolesToStorage =
						payload.method == 'POST' ? this.userRolesList : [];
					this.set_user_roles(userRolesToStorage);
					// console.log(user)
					if (user.temp_role && !user.temp_role.permissions) {
						const permissions = findItemBy(
							'id',
							user.temp_role_id,
							this.userRolesList
						).permissions;
						// console.log(permissions)
						let newUser = { ...user, role: { ...user.role, permissions } };
						this.set_auth_user(newUser);

						if (user && user.plant_id) {
							this.setGlobalFilters({
								id: user.plant_id,
								filterName: 'plantId'
							});
						}
					}

					this.fetchPlants();

					// const primaryRoute = this.$route.path.split('/')[1];
					// let path = '';

					/*if (type === USER_TYPES.OEE_PROCCESS) {
						path = '/processes';
					} else {
						path = '/dashboard';
					}*/
					// this.keepGlobalFilters = true;
					// this.get_auth_user();
					// console.log(primaryRoute, path)

					/*if (`/${primaryRoute}` != path) {
						this.changeRoute({ path: path });
					}*/

					this.userRolesLoading = false;
				})
				.catch(() => {
					this.userRolesLoading = false;
				});
		},

		createItemByMenu(item) {
			// console.log(item)
			const settings = {
				...this.creationMenuModalSettings,
				show: true,
				itemName: item.label,
				componentPath: item.componentPath,
				instanceName: item.instance,
				additionalModalSettings: item.additionalModalSettings
			};
			// console.log(settings)
			this.show_edit_modal(settings);
			this.showCreationMenu = false;
		},

		globalClick({ target }) {
			if (
				!target.closest('creation-menu-list') &&
				!target.closest('.creation-menu-button')
			) {
				this.showCreationMenu = false;
			}
		},

		setFilters(path, filters) {
			// const { setFiltersAction } = this.navbarSettings;
			// const {datepickerFilters} = this;
			this.$store.dispatch(path, filters);
		},

		fetchPlants() {
			this.fetch_global_plants({
				params: {
					max: -1,
					// archivedCompanies: false,
					orderByColumn: 'name',
					orderByMethod: 'asc'
				}
			});
		},

		fetchCompanies() {
			this.fetch_global_companies({
				params: {
					max: -1,
					orderByColumn: 'name',
					orderByMethod: 'asc'
				}
			});
		}

		/*fetchCompanies() {
			this.doFetchAction(
				'fetch_companies',
				'companiesList',
				'companiesLoading',
				{ params:	{	max: -1, orderByColumn: 'name',	orderByMethod: 'asc' } }
			)
		}*/
	},

	watch: {
		$route(/*to*/) {
			if (this.disposableHistoryButton) {
				this.set_global_state({
					stateProp: 'disposableHistoryButton',
					value: false
				});
			}
		},

		showCreationMenu(show) {
			if (show) {
				document.addEventListener('click', this.globalClick);
			} else {
				document.removeEventListener('click', this.globalClick);
			}
		},

		enableCompaniesFilter(enable) {
			if (enable && !this.companiesList.length) {
				this.fetchCompanies();				
			}
		}
	},

	created() {
		if (this.isIndustrialMatrix) {
			this.fetchUserRoles();
		} else {
			this.userRolesList = this.userRolesListState;
		}

		this.fetchPlants();

		if (this.authUser && this.authUser.plant_id && this.isCustomer) {
			this.setGlobalFilters({
				id: this.authUser.plant_id,
				filterName: 'plantId'
			});
		}

		if (this.authUser && this.authUser.company_id && this.isCustomer) {
			this.setGlobalFilters({
				id: this.authUser.company_id,
				filterName: 'companyId'
			});
		}
		
	},

	beforeDestroy() {
		// if (!this.keepGlobalFilters) {
		this.set_global_filters({ plantId: null, companyId: null });
		// }
	}
};
</script>
