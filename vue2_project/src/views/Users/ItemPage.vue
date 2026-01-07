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
				{ title: this.tt('Notifications'), prop: 'notificationsTab' },
			];

			if (this.itemData) {
				list.push({ title: this.tt('Reports'), prop: 'reportsTab' })
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

		successSubmitCallback({ data }) {
			// console.log(data.data)
			if (data.data && data.data.id === this.authUser.id) {
				this.get_auth_user();
			}
		}
	},

	watch: {
		$route(route) {
			this.initialPageSetup(route);
		}
	}
};
</script>
