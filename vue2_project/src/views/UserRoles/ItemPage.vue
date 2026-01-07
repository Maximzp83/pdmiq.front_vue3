<template>
	<div>
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
import { mapActions } from 'vuex';
import { navigation, itemPageMixin, initPageDataMixin, tabsMixin } from '@/mixins';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin(), tabsMixin()],
	name: 'UserRolesPage',

	components: {
		ItemForm: () => import('./ItemForm.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue')
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('sidebar_menu.user_roles'),
				mult: this.$t('sidebar_menu.user_roles')
			};
		},

		tabsList() {
			return Object.freeze([
				{ title: 'Main', prop: 'mainTab' },
				{ title: 'Requisition', prop: 'requisitionTab' },
				{ title: 'Sections', prop: 'permissionsTab' }
			]);
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'user_roles/fetch_user_role',
			save_item: 'user_roles/save_user_role',
			get_auth_user: 'auth/get_auth_user'
		}),

		successSubmitCallback({ data }) {
			// console.log(data.data, this.authUser.role)
			if (data.data && data.data.id === this.authUser.role.id) {
				this.get_auth_user();
			}
		}
	}
};
</script>
