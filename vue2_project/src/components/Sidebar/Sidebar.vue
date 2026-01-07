<template>
	<div :class="['sidebar', { 'sidebar-show': isShow }]">
		<div class="logo">
			<a class="simple-text logo-normal" href="/">
				<div class="logo-img">
					<img :src="main_logo" alt="logo" />
				</div>
				<!-- <div class="logo-text">
					<span class="tertiary-color">Industrial</span>
					<span class="primary-color">Matrix <sup>TM</sup></span>
					<div class="description tertiary-color">Where technology meets industry</div>
				</div> -->
			</a>

			<div class="navbar-minimize xs-hide md-show">
				<button
					class="minimize-button xs-hide md-show-inline"
					@click="emitEvent('minimizeSidebar')"
				>
					<i class="icomoon icon-menu text-center"></i>
				</button>
			</div>

			<span class="md-hide mobile-close-sidebar" @click="emitEvent('toggleSidebar')"
				><i class="icomoon icon-cross"></i
			></span>
		</div>

		<div class="sidebar-wrapper" ref="sidebarScrollArea">
			<div class="sidebar-item user-menu">
				<!-- <el-menu-item index="/logout"> -->
				<div class="user-menu-container">
					<div class="collapse-text">
						<span class="ellipsis user-name">
							<b>{{
								`${tt('hello')}, ${authUser.first_name} ${authUser.last_name}`
							}}</b>
						</span>

						<!-- <div class="gray-color" v-if="authUser.company">{{
							authUser.company.name
						}}</div> -->
					</div>

					<div class="ml-auto">
						<i class="icomoon icon-testing" @click="editProfile" />
						<!-- <i
							v-if="isPlantAdmin && authUser.company && authUser.company.can_update"
							class="icomoon icon-testing"
							@click="editSSO"
						/> -->
						<i
							class="icomoon icon-sign-out"
							@click="changeRoute({ path: '/logout' })"
						/>
					</div>
				</div>
				<!-- </el-menu-item> -->
			</div>

			<el-menu
				:unique-opened="true"
				:collapseTransition="false"
				:default-active="currentPath"
				class="el-menu-sidebar"
				:class="{ 'el-menu--collapse': isCollapse }"
				:menu-trigger="!isCollapse ? 'hover' : 'click'"
			>
				<!-- @select="path => changeRoute({ path: path })" -->
				<!-- <li class="sidebar-item user-menu">
					<el-menu-item index="/logout">
						<div class="user-menu-container">
							<span>
								<b>{{ authUser.full_name }}</b>
							</span>
							<i class="suffix icomoon icon-sign-out" />
						</div>
					</el-menu-item>
				</li> -->

				<div
					class="sidebar-item"
					v-for="menuCategory in navMenuItems"
					:key="'sidebar_nav_cat-' + menuCategory.name"
				>
					<!-- <div class="" v-if="menuCategory.children && menuCategory.children.length"> -->
					<el-submenu
						v-if="menuCategory.children && menuCategory.children.length"
						:index="`category-${menuCategory.name}`"
					>
						<template slot="title">
							<i :class="['icomoon', menuCategory.icon]" />
							<span class="capitalize">{{ menuCategory.name }}</span>
						</template>

						<el-menu-item
							v-for="menuItem in menuCategory.children"
							:key="'sidebar_nav_link-' + menuItem.name"
							:index="menuItem.path"
						>
							<div class="">
								<router-link :to="menuItem.path">
									<i v-if="menuItem.icon" :class="['icomoon', menuItem.icon]" />
									<span class="capitalize">{{ menuItem.name }}</span>
								</router-link>
							</div>
						</el-menu-item>
					</el-submenu>
					<!-- </div> -->

					<el-menu-item
						:index="menuCategory.path"
						:class="{ 'is-active': isActiveItem(menuCategory.path) }"
						v-else-if="menuCategory.path"
					>
						<div>
							<router-link :to="menuCategory.path">
								<i
									v-if="menuCategory.icon"
									:class="['icomoon', menuCategory.icon]"
								/>
								<span class="capitalize">{{ menuCategory.name }}</span>
								<span
									v-if="
										menuCategory.requestCounter &&
											authUser.work_order_requests_count > 0
									"
									class="round-counter"
									>{{ authUser.work_order_requests_count }}</span
								>
							</router-link>
						</div>
					</el-menu-item>
					<el-menu-item
						v-else-if="labelHasChildren(menuCategory.category_label)"
						class="category-name"
					>
						<div>
							<span class="capitalize">{{ menuCategory.name }}</span>
						</div>
					</el-menu-item>
				</div>
			</el-menu>

			<div class="sidebar-footer">
				<div class="footer-item motorLinkItem" v-if="motorIQLink">
					<a :href="motorIQLink" target="_blank" class="remote-auth-link standard">
						<img :src="logoSrc" alt="motorIQ" />
						<span class="collapse-text">MotorIQ</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { menuItems } from '@/constants/menuItems';
import { navigation } from '@/mixins';
import { logoSrc, main_logo } from '@/constants/global';
import { hasAccessTo } from '@/utils/hasAccessTo';
import { validateBySettings, findItemBy, cloneDeep } from '@/helpers';
// import { USER_TYPES } from '@/constants/global';

export default {
	mixins: [navigation()],

	components: {
		// NavbarToggleButton,
		// MovingArrow
	},
	props: {
		isCollapse: Boolean,
		isShow: Boolean,
		currentPath: String,

		logoMini: {
			type: String,
			default: '',
			description: 'Sidebar Logo mini'
		}
	},

	/*provide() {
		return {
			// autoClose: this.autoClose
		};
	},*/

	computed: {
		authUser() {
			return this.$store.state.auth.authUser;
		},

		logoSrc: () => logoSrc,
		main_logo: () => main_logo,
		// that.authUser.plant && that.authUser.plant.file
		// ? that.authUser.plant.file :
		// main_logo,

		motorIQLink() {
			return this.$store.state.auth.motorIQLink;
		},

		// hasAccessMap: that => that.$store.getters['auth/hasAccessMap'],
		// hasAccessTo: that => that.$store.getters['auth/hasAccessTo'](['create-controller']),

		navMenuItems() {
			// console.log('sidebar navMenuItems')
			const { company, role } = this.authUser;
			let menuItemsCopy = cloneDeep(menuItems());
			// console.log(menuItemsCopy)
			let filtered = this.$translate(
				menuItemsCopy.filter(link => {
					let results = [true];
					const { meta, id } = link;

					if (meta && meta.permissions) {
						results.push(hasAccessTo({ role, permissionKeys: meta.permissions }));
					}
					// console.log(meta && meta.conditionSettings)
					if (meta && meta.conditionSettings) {
						results.push(
							validateBySettings({
								...meta.conditionSettings,
								// data_value: cellValue,
								dataObj: this.authUser
							})
						);
					}
					/*if (meta && meta.userTypes) {
							results.push(meta.userTypes.some(ti => type === ti));
						}*/

					if (id) {
						results.push(this.valiadateByCompanySettings(id, company));
						/*if (role.id === 1) {
								results.push(true);
							} else 	if (role.permissions) {
								const permission = role.permissions.find(p => p.app_section === id);
								if (permission) {
									results.push(permission.is_viewing);
								}
							}*/
					}

					if (link.children) {
						link.children = this.$translate(this.filterChildrens(link.children));
						results.push(link.children.length);
						// console.log(link.children)
					}

					return results.every(r => r);
				})
			);
			return Object.freeze(filtered);
		}
	},

	methods: {
		filterChildrens(children) {
			const { type, role } = this.authUser;

			return children.filter(ci => {
				let checks = [];
				const { meta } = ci;

				if (meta && meta.permissions) {
					checks.push(hasAccessTo({ role, permissionKeys: meta.permissions }));
				}

				if (meta && meta.userTypes) {
					checks.push(meta.userTypes.some(ci => type === ci));
				}
				return checks.every(c => c);
			});
		},

		valiadateByCompanySettings(menuId, company) {
			if (company && company.menu_items) {
				const { menu_items } = company;
				const menuItem = findItemBy('id', menuId, menu_items);
				// console.log(menuItem)
				if (menuItem) {
					return menuItem.on;
				}
			}
			return true;
		},
		/*handleOpen(key, keyPath) {
			console.log(key, keyPath);
		},
		handleClose(key, keyPath) {
			console.log(key, keyPath);
		},*/
		labelHasChildren(label) {
			const { navMenuItems } = this;
			return navMenuItems.some(mi => {
				if (mi.children) {
					return mi.belongs_to_label == label && mi.children.length > 0;
				}
				return mi.belongs_to_label == label;
			});
		},

		emitEvent(eventName, data) {
			this.$emit('event', eventName, data);
		},

		isActiveItem(itemPath) {
			const parts = this.$route.fullPath.split('/');
			if (parts.length) {
				const categoryPath = '/' + parts[1];
				if (categoryPath === itemPath) {
					return true;
				}
			}
			return false;
		},

		editProfile() {
			this.changeRoute({ path: '/profile' });
		}

		/*editSSO() {
			this.changeRoute({ path: `/companies/${this.authUser.company_id}` });
		}*/
	}
};
</script>
