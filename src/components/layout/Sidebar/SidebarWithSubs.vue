<template>
	<div :class="['sidebar', { 'sidebar-show': isShow }]">
		<div class="logo">
			<a class="simple-text logo-normal" href="/">
				<div class="logo-img">
					<img :src="logoSrc" alt="logo" />
				</div>
			</a>

			<div class="navbar-minimize xs-hide md-show">
				<button
					id="minimizeSidebar"
					class="minimize-button xs-hide md-show-inline"
					@click="minimizeSidebar"
				>
					<i class="icomoon icon-arrow text-center"></i>
				</button>
			</div>

			<el-button
				type="primary"
				circle
				class="md-hide mobile-close-sidebar"
				@click="toggleSidebar"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
		<div class="sidebar-wrapper" ref="sidebarScrollArea">
			<el-menu
				:unique-opened="true"
				:collapseTransition="false"
				:default-active="currentPath"
				class="el-menu-sidebar"
				:class="{ 'el-menu--collapse': isCollapse }"
				:menu-trigger="isCollapse ? 'hover' : 'click'"
				@select="changeRoute"
			>
				<el-submenu
					:index="`category-${menuCategory.name}`"
					v-for="menuCategory in navMenuItems"
					:key="'sidebar_nav_cat-' + menuCategory.name"
				>
					<template #title>
						<i :class="['icomoon', menuCategory.icon]" />
						<span>{{ menuCategory.name }}</span>
					</template>

					<div class="" v-if="menuCategory.children && menuCategory.children.length">
						<el-menu-item
							:index="menuItem.path"
							v-for="menuItem in menuCategory.children"
							:key="'sidebar_nav_link-' + menuItem.name"
						>
							<i v-if="menuItem.icon" :class="['icomoon', menuItem.icon]" />
							{{ menuItem.name }}
						</el-menu-item>
					</div>
				</el-submenu>
			</el-menu>
		</div>
	</div>
</template>

<script>
import { menuItems } from '@/constants/menuItems';
import { navigation } from '@/mixins';

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
		logoSrc: {
			type: String,
			default: '/static/img/vue-logo.png',
			description: 'Sidebar Logo'
		},
		logoMini: {
			type: String,
			default: '/static/img/logo_atlantis_2.svg',
			description: 'Sidebar Logo mini'
		}
	},

	/*provide() {
		return {
			// autoClose: this.autoClose
		};
	},*/

	computed: {
		authRole() {
			/*if (this.$auth.user()) {
					return this.roles[this.$auth.user().role];
					// return 'editor'
				}*/
			return false;
		},

		navMenuItems() {
			var result = menuItems();
			// console.log(this.authRole)
			/*
				if (this.authRole === 'superAdmin' || this.authRole === 'admin') {
						result = this.sidebarLinks
					} else {
						var _this = this;

						for (var i = 0; i < this.sidebarLinks.length; i++) {
							var subLinks = {name: this.sidebarLinks[i].name}
							
							subLinks.children = this.sidebarLinks[i].children.filter(function(link) {
								if (link.roles) {
									// console.log(link)
									let mathed = link.roles.some(function(role) {
										// console.log(_this)
										return role === _this.authRole
									})
									// console.log(mathed)
									return mathed;
								}
								// return true
							})
							// console.log(subLinks)
							subLinks.children.length ? result.push(subLinks) : null;
						}
					}
				*/
			return result;
		}
	},

	methods: {
		handleOpen(key, keyPath) {
			console.log(key, keyPath);
		},
		handleClose(key, keyPath) {
			console.log(key, keyPath);
		},
		minimizeSidebar() {
			this.$emit('minimizeSidebar');
		},
		toggleSidebar() {
			this.$emit('toggleSidebar');
		}
	},

	mounted() {
		// this.$auth.user().role = 2
		// this.filteredLinks()
		// var sidebar = {}
		// this.sidebarWrapper = document.querySelector('.sidebar-wrapper');
		// if (sidebar.wrapper) {
		// sidebar.navMenu = document.querySelector('.sidebar-wrapper > .nav');
		// sidebar.wrapper = document.querySelector('.sidebar-wrapper');
		// sidebar.wrapper = document.querySelector('.sidebar-wrapper');
		// }
		// this.initScrollBarAsync();
		// this.findActiveLink()
	},
	watch: {
		/*$route: function (newRoute, oldRoute) {
				this.findActiveLink()
			}*/
	},

	beforeUnmount() {
		/*if (this.$sidebar.showSidebar) {
			this.$sidebar.showSidebar = false;
		}*/
	}
};
</script>

<style></style>
