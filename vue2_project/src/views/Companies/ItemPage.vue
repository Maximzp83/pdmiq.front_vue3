<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<!-- <h1 class="title page-title">{{ pageTitle }}</h1> -->
				<!-- class="mcol-xs-auto" -->
				<div class="content-row">
					<!-- <div class="content-row" v-if="!isPlantAdmin"> -->
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
						<!-- :hideMainTab="isPlantAdmin" -->
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
	name: 'CompanyPage',

	components: {
		ItemForm: () => import('./ItemForm.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue')
	},

	computed: {
		isIndustrialMatrix() {
			return this.$store.state.auth.isIndustrialMatrix;
		},

		itemsName() {
			return {
				one: this.$t('Company'),
				mult: this.$t('Companies')
			};
		},

		additionalNavbarSettings: () =>
			Object.freeze({
				showStandardNavItem: true
			}),

		// hideTabsBar: that => that.isPlantAdmin,

		tabsList() {
			let list = [{ title: 'Main', prop: 'mainTab' }];

			/*if (this.authUser.type === USER_TYPES.SUPER_ADMIN || 
					this.authUser.type === USER_TYPES.DISTRIBUTOR) {
				list.push({ title: 'Main', prop: 'mainTab' });
			}*/

			if (this.isIndustrialMatrix) {
				list.push({ title: 'Menu', prop: 'menuTab' });
			}

			if (this.itemData) {
				if (this.itemData.can_update) {
					list.push({ title: 'SSO', prop: 'SSOTab' });
				}
			} else {
				list.push({ title: 'SSO', prop: 'SSOTab' });
			}

			return this.$translate(list);
		},

		uploadSettings: () => ({
			fileProp: 'saml2_idp_base64_certificate'
		})
	},

	methods: {
		...mapActions({
			fetch_item: 'companies/fetch_company',
			save_item: 'companies/save_company'
		})
	},

	created() {
		/*if (this.isPlantAdmin) {
			this.switchTab(this.tabsList[1]);
		}*/
	}
};
</script>
