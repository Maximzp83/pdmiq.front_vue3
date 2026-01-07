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
import { LANGUAGE_TYPES } from '@/localization/utils';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin()],
	name: 'PlantsVendorPage',

	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	computed: {
		itemsName() {
			const prefix =
				this.$Lang.currentLangId == LANGUAGE_TYPES.ENGLISH ? 'Plants' : '';
			return {
				one: `${prefix} ${this.$t('Vendor')}`,
				mult: `${prefix} ${this.$t('Vendors')}`,
				instanceName: 'plants_vendors'
			};
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'plants_vendors/fetch_plants_vendor',
			save_item: 'plants_vendors/save_plants_vendor'
		})
	}
};
</script>
