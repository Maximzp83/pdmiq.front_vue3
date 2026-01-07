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
				<div class="view-content-card card">
					<div class="form-wrapper card-content" v-if="loadContent">
						<ItemForm
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemsName="itemsName"
							:showJustInfo="showJustInfo"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { navigation, itemPageMixin, initPageDataMixin } from '@/mixins';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin()],
	name: 'RFQSPage',

	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	data() {
		return {
			showJustInfo: true
		};
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('phrases.Request_for_quotation'),
				mult: this.$t('phrases.Request_for_quotations')
			};
		},

		navbarSettings: () => ({
			showSaveButton: false,
			showCloseButton: true
		})
	},

	methods: {
		...mapActions({
			fetch_item: 'rfqs/fetch_rfq'
			// save_item: 'rfqs/save_rfq'
		})
	},

	watch: {
		loadContent(isLoad) {
			if (isLoad && (!this.itemData || !this.itemData.id)) {
				this.showJustInfo = false;

				this.setup_navbar({
					...this.navbarSettings,
					showSaveButton: true
				});
			}
		}
	}
};
</script>
