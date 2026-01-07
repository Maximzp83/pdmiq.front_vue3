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

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin()],
	name: 'SolenoidPage',

	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('Solenoid'),
				mult: this.$t('Solenoids')
			};
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'solenoids/fetch_solenoid',
			save_item: 'solenoids/save_solenoid'
		})
	}
};
</script>
