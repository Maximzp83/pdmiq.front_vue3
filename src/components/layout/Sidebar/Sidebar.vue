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
				<div class="user-menu-container">
					<div class="collapse-text">
						<span class="ellipsis user-name">
							<b>{{
								// `${tt('hello')}, ${authUser.first_name} ${authUser.last_name}`
								`${'hello'}, ${authUser.first_name} ${authUser.last_name}`
							}}</b>
						</span>
					</div>

					<!-- <div class="ml-auto">
						<i class="icomoon icon-testing" @click="editProfile" />
						<i
							class="icomoon icon-sign-out"
							@click="changeRoute({ path: '/logout' })"
						/>
					</div> -->
				</div>
			</div>

			<!-- <ul class="article-title">
				<li><RouterLink to="/dashboard/plant">Plant Details</RouterLink></li>
				<li><RouterLink to="/dashboard/machines">Machines List</RouterLink></li>
			</ul> -->

			<!-- <el-menu
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
			</el-menu> -->

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

import { menuItems } from '@/constants/menuItems';
import { validateBySettings, findItemBy, cloneDeep } from '@/helpers';
import { logoSrc, main_logo } from '@/constants/global';
import { hasAccessTo } from '@/utils/hasAccessTo';
import { ref, onMounted, computed, shallowReactive} from 'vue';
// =========================

const isShow = true;
const authUser = shallowReactive({
	"id": 84,
	"uuid": "8dddfa19-4763-47a7-836d-89e91b5400fe",
	"type": 1,
	"role_id": 2,
	"temp_role_id": null,
	"temp_type": null,
	"first_name": "Maxim",
	"last_name": "Mironov",
	"full_name": "Maxim Mironov",
	"email": "maximzp83@gmail.com",
	"phone_number": "+380500763435",
	"country_code": null,
	"language": 1,
	"is_mfa_enabled": true,
	"is_mfa_verified": true,
	"mfa_type": 1,
	"work_order_role": 0,
	"hourly_rate": 0,
	"is_real_time_notify": false,
	"is_day_summary_notify": false,
	"is_receive_sensors_anomaly_notification": true,
	"is_alarms_notes_notification": false,
	"is_amplitude_alarm_notifiable": false,
	"is_controller_offline_notification": false,
	"is_mail_sensor_job_notify": false,
	"is_sms_sensor_job_notify": false,
	"is_device_notifiable": false,
	"daily_summary_notify_at": "00:00",
	"work_order_requests_count": 0,
	"location": null,
	"company_id": null,
	"plant_id": null,
	"role": {
		"id": 2,
		"type": 1,
		"name": "Industrial Matrix",
		"child_role_ids": [
			2,
			4,
			4,
			4,
			5,
			5,
			5,
			5,
			6,
			6,
			6,
			7,
			7,
			7,
			7,
			8,
			8,
			9,
			9,
			9,
			10,
			10,
			11
		],
		"is_requisitioner": true,
		"is_fab_shop_manager": false,
		"is_technic": false,
		"is_forced_mfa": false,
		"permissions": [
			{
				"id": 32,
				"role_id": 2,
				"app_section": 1,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 33,
				"role_id": 2,
				"app_section": 2,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 34,
				"role_id": 2,
				"app_section": 3,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 35,
				"role_id": 2,
				"app_section": 4,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 36,
				"role_id": 2,
				"app_section": 5,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": true
			},
			{
				"id": 37,
				"role_id": 2,
				"app_section": 6,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": true
			},
			{
				"id": 38,
				"role_id": 2,
				"app_section": 7,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 39,
				"role_id": 2,
				"app_section": 8,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 40,
				"role_id": 2,
				"app_section": 9,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 41,
				"role_id": 2,
				"app_section": 10,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 42,
				"role_id": 2,
				"app_section": 11,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 43,
				"role_id": 2,
				"app_section": 12,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 44,
				"role_id": 2,
				"app_section": 13,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 45,
				"role_id": 2,
				"app_section": 14,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 46,
				"role_id": 2,
				"app_section": 15,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 47,
				"role_id": 2,
				"app_section": 16,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 48,
				"role_id": 2,
				"app_section": 17,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 49,
				"role_id": 2,
				"app_section": 18,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 50,
				"role_id": 2,
				"app_section": 19,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 51,
				"role_id": 2,
				"app_section": 20,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 52,
				"role_id": 2,
				"app_section": 21,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 53,
				"role_id": 2,
				"app_section": 22,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 54,
				"role_id": 2,
				"app_section": 23,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 55,
				"role_id": 2,
				"app_section": 24,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 56,
				"role_id": 2,
				"app_section": 25,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 57,
				"role_id": 2,
				"app_section": 26,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 58,
				"role_id": 2,
				"app_section": 27,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 59,
				"role_id": 2,
				"app_section": 28,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 60,
				"role_id": 2,
				"app_section": 29,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 61,
				"role_id": 2,
				"app_section": 30,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 62,
				"role_id": 2,
				"app_section": 31,
				"is_viewing": true,
				"is_creating": true,
				"is_updating": true,
				"is_deleting": true,
				"is_archiving": false
			},
			{
				"id": 343,
				"role_id": 2,
				"app_section": 32,
				"is_viewing": false,
				"is_creating": false,
				"is_updating": false,
				"is_deleting": false,
				"is_archiving": false
			}
		]
	},
	"temp_role": null,
	"company_ids": [],
	"plants_ids": [],
	"notifiable_plants": [],
	"companies": [],
	"plants": [],
	"notification_rules": [
		{
			"message_type": 1,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 2,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 3,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 4,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 5,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 6,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 7,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 8,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 9,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 10,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 11,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 12,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 13,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 14,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 15,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 16,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 17,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 18,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		},
		{
			"message_type": 19,
			"is_email": false,
			"is_sms": false,
			"is_push": false
		}
	]
});

// ------Computed---------
const navMenuItems = computed(() => {
	// console.log('sidebar navMenuItems')
	const { company, role } = authUser;
	let menuItemsCopy = cloneDeep(menuItems());
	// console.log(menuItemsCopy)
	let filtered = /*this.$translate(*/
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
				link.children = /*this.$translate(*/filterChildrens(link.children)/*)*/;
				results.push(link.children.length);
				// console.log(link.children)
			}

			return results.every(r => r);
		})
	/*);*/
	return Object.freeze(filtered);
})


// ----------Methods-------
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

const emitEvent = () => {}



/*onMounted(() => {
	console.log('Sidebar mounted');
});

onUpdated(() => {
	console.log('Sidebar updated');
});*/

// export default {
	// mixins: [navigation()],

	// components: {
		// NavbarToggleButton,
		// MovingArrow
	// },
	/*props: {
		isCollapse: Boolean,
		isShow: Boolean,
		currentPath: String,

		logoMini: {
			type: String,
			default: '',
			description: 'Sidebar Logo mini'
		}
	},*/

	/*computed: {
		authUser() {
			return this.$store.state.auth.authUser;
		},

		logoSrc: () => logoSrc,
		main_logo: () => main_logo,

		motorIQLink() {
			return this.$store.state.auth.motorIQLink;
		},

		
	},*/

	/*methods: {
		

		

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
	}*/
// };
</script>
