<template>
	<div>
		<!-- <ItemEditNavbar
			@exitPage="exitPage"
			@saveItem="handleSaveItem"
			:saving="itemSaving"
		/> -->
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="content-row">
					<TabsBar
						@switchTab="switchTab"
						:activeTab="activeTab"
						:tabsList="tabsList"
					/>
				</div>

				<div class="content-row view-content-card card">
					<div class="form-wrapper card-content" v-if="loadContent">
						<ItemForm
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemsName="itemsName"
							:activeTab="activeTab"
							:tabsList="tabsList"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { navigation, itemPageMixin, initPageDataMixin, tabsMixin } from '@/mixins';
import { MENU_TYPES } from '@/constants/menuItems';
import { hasAccessTo } from '@/utils/hasAccessTo';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin(), tabsMixin()],
	name: 'UserPage',

	components: {
		ItemForm: () => import('./ItemForm.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue')
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('User'),
				mult: this.$t('Users')
			};
		},

		tabsList() {
			let list = [
				{ title: this.tt('Personal'), prop: 'mainTab' },
				{ title: this.tt('Notifications'), prop: 'notificationsTab' }
			];

			if (this.itemData) {
				list.push({ title: this.tt('Reports'), prop: 'reportsTab' });
			}

			if (this.itemData) {
				const role = this.itemData.role;
				//console.log('role', role, this.$hasAccessTo(['edit_users']), hasAccessTo({ role, permissionKeys: ['view_client_api']}));
				if (
					(this.$hasAccessTo(['edit_users']) || this.authUser.id == this.itemData.id ) &&
					hasAccessTo({ role, permissionKeys: ['view_client_api']})
				) {
					list.push({ title: 'API', prop: 'apiTab' });
				}
			}

			return Object.freeze(list);
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'users/fetch_user',
			save_item: 'users/save_user',
			get_auth_user: 'auth/get_auth_user'
		}),

		resolveApiTabVisibility(itemData) {
			const role = itemData && (itemData.temp_role || itemData.role);
			const permissions = role && role.permissions ? role.permissions : [];
			const apiPermission = permissions.find(
				item => item.app_section === MENU_TYPES.CLIENT_API
			);
			return !!(apiPermission && apiPermission.is_viewing);
		},

		successSubmitCallback({ data }) {
			// console.log(data.data)
			if (data.data && data.data.id === this.authUser.id) {
				this.get_auth_user();
			}
		}
	},

	watch: {
		itemData: {
			immediate: true,
			handler(itemData) {
				this.apiTabVisible = this.resolveApiTabVisibility(itemData);
			}
		},

		$route(route) {
			this.initialPageSetup(route);
		}
	}
};
</script>
