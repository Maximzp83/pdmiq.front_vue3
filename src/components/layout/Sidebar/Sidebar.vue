<template>
	<div :class="['sidebar', { 'sidebar-show': isShow }]">
		<div class="logo">
			<a class="simple-text logo-normal" href="/">
				<div class="logo-img">
					<img :src="main_logo" alt="logo" />
				</div>
			</a>

			<div class="navbar-minimize xs-hide md-show">
				<button
					class="minimize-button xs-hide md-show-inline"
					@click="minimizeSidebar"
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
				<div class="user-menu-container">
					<div class="collapse-text">
						<span class="ellipsis user-name">
							<b>{{ greetingUserText }}</b>
						</span>
					</div>

					<div class="ml-auto">
						<i class="icomoon icon-testing" @click="changeRoute({ path: '/profile' })" />
						<i
							class="icomoon icon-sign-out"
							@click="changeRoute({ path: '/logout' })"
						/>
					</div>
				</div>
			</div>

			<el-menu
				:unique-opened="true"
				:collapseTransition="false"
				:default-active="currentPath"
				class="el-menu-sidebar"
				:class="{ 'el-menu--collapse': isCollapse }"
				:menu-trigger="!isCollapse ? 'hover' : 'click'"
			>
				<div
					class="sidebar-item"
					v-for="menuCategory in navMenuItems"
					:key="'sidebar_nav_cat-' + menuCategory.name"
				>
					<el-sub-menu
						v-if="menuCategory.children && menuCategory.children.length"
						:index="`category-${menuCategory.name}`"
					>
						<template #title>
							<i :class="['icomoon', menuCategory.icon]" />
							<span class="capitalize">{{ menuCategory.name }}</span>
						</template>

						<el-menu-item
							v-for="menuItem in menuCategory.children"
							:key="'sidebar_nav_link-' + menuItem.name"
							:index="menuItem.path"
						>
							<div class="submenu-item">
								<router-link :to="menuItem.path">
									<i v-if="menuItem.icon" :class="['icomoon', menuItem.icon]" />
									<span class="capitalize">{{ menuItem.name }}</span>
								</router-link>
							</div>
						</el-menu-item>
					</el-sub-menu>

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
						v-else-if="isLabelHasChildren(menuCategory.category_label)"
						class="category-name"
						:index="menuCategory.name"
					>
						<div>
							<span class="capitalize">{{ menuCategory.name }}</span>
						</div>
					</el-menu-item>
				</div>
			</el-menu>

			<div class="sidebar-footer">
			<!-- 	<div class="footer-item motorLinkItem" v-if="motorIQLink">
					<a :href="motorIQLink" target="_blank" class="remote-auth-link standard">
						<img :src="logoSrc" alt="motorIQ" />
						<span class="collapse-text">MotorIQ</span>
					</a>
				</div> -->
			</div>
		</div>
	</div>
</template>

<script setup>
/*import { menuItems } from '@/constants/menuItems';
import { navigation } from '@/mixins';

import { hasAccessTo } from '@/utils/hasAccessTo';
import { validateBySettings, findItemBy, cloneDeep } from '@/helpers';*/
// import { USER_TYPES } from '@/constants/global';

import { computed } from 'vue';
// import { storeToRefs } from 'pinia';

import { validateBySettings, findItemBy, cloneDeep } from '@/helpers';
import { logoSrc, main_logo } from '@/constants/global';
import { hasAccessTo } from '@/utils/hasAccessTo';
import { menuItems } from '@/constants/menuItems';

import { Lang } from '@/localization';
const { tt, translate } = Lang;

// -----Store-----
import { useAuthStore } from "@/stores/AuthStore";
const authStore = useAuthStore();
const authUser = authStore.authUser;

import { useGlobalStore } from "@/stores/GlobalStore";
const { set_value: set_global_store } = useGlobalStore();

// -----Composables-----
import { useNavigation } from "@/composables/mixins/useNavigation";
const { changeRoute } = useNavigation();

// =========================
const props = defineProps({
	currentPath: String,
	isCollapse: Boolean,
	isShow: Boolean
});

// ========== User ===========
const greetingUserText = computed(
	() => `${tt('hello')}, ${authUser.first_name} ${authUser.last_name}`
);

// ========== Menu ==============
const valiadateByCompanySettings = (menuId, company) => {
	if (company && company.menu_items) {
		const { menu_items } = company;
		const menuItem = findItemBy('id', menuId, menu_items);
		// console.log(menuItem)
		if (menuItem) {
			return menuItem.on;
		}
	}
	return true;
};

const filterChildrens = (children) => {
	const { type, role } = authUser;

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
};

const navMenuItems = computed(() => {
	// console.log('sidebar navMenuItems', cloneDeep)
	const { company, role } = authUser;
	let menuItemsCopy = cloneDeep(menuItems());
	// console.log(menuItemsCopy)
	let filtered = translate(
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
						dataObj: authUser
					})
				);
			}

			if (id) {
				results.push(valiadateByCompanySettings(id, company));
			}

			if (link.children) {
				link.children = translate( filterChildrens(link.children) );
				results.push(link.children.length);
				// console.log(link.children)
			}

			return results.every(r => r);
		})
	);
	return Object.freeze(filtered);
});

// console.log('navMenuItems', navMenuItems)
const isLabelHasChildren = (label) => {
	// console.log(label, navMenuItems)
	return navMenuItems.value.some(mi => {
		if (mi.children) {
			return mi.belongs_to_label == label && mi.children.length > 0;
		}
		return mi.belongs_to_label == label;
	});
};

const isActiveItem = (itemPath) => {
	// console.log('itemPath',itemPath)
	const parts = props.currentPath.split('/');
	if (parts.length) {
		const categoryPath = '/' + parts[1];
		// console.log('categoryPath',categoryPath)
		if (categoryPath === itemPath) {
			return true;
		}
	}
	return false;
};

const editProfile = () => {
	changeRoute({ path: '/profile' });
};

const minimizeSidebar = () => {
	set_global_store('isSidebarCollapse', !props.isCollapse);
};

const emitEvent = () => {}


// ========== Hooks ==============
/*onMounted(() => {
	console.log('Sidebar mounted', Lang);
});*/
</script>
