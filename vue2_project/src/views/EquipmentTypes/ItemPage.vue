<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper equipment-types-page">
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

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin()],
	name: 'EquipmentTypePage',

	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('Item_Type'),
				mult: this.$t('Item_Types')
			};
		},

		uploadSettings: () => ({
			fileProp: 'file'
			// multiple: true
		})
	},

	methods: {
		...mapActions({
			fetch_item: 'equipment_types/fetch_equipment_type',
			save_item: 'equipment_types/save_equipment_type'
		}),

		preparePayload(payload) {
			if (!payload.withFile && payload.data.type_options) {
				payload.withFile = payload.data.type_options.some(to => {
					return to.predefined_values && to.predefined_values.some(pv => !!pv.file);
				});
			}

			return payload;
		}
	}
};
</script>
