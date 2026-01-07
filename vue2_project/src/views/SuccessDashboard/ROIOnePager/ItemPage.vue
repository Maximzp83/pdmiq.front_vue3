<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="item-page-wrapper">
			<div class="form-wrapper " v-if="loadContent">
				<ItemForm
					@event="handleEventNew"
					ref="ItemFormComponent"
					@submit="handleSubmitForm"
					@onCancel="handleCloseButton"
					:itemData="itemData"
					:itemsName="itemsName"
					:sensorsList="sensorsList"
					:sensorsLoading="sensorsLoading"
					:plantItem="plantItem"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import {
	navigation,
	itemPageMixin,
	initPageDataMixin,
	eventHandler
} from '@/mixins';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin(), eventHandler()],
	name: 'ROIOnePagerPageNew',

	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	props: {
		sensorsLoading: Boolean,
		sensorsList: Array,
		plantItem: Object
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('ROI_One_Pager'),
				mult: this.$t('ROI_One_Pagers')
			};
		},

		uploadSettings: () =>
			Object.freeze([{ fileProp: 'pictures', multiple: true }, { fileProp: 'file' }])
	},

	methods: {
		...mapActions({
			fetch_item: 'roi_one_pagers/fetch_roi_one_pager',
			save_item: 'roi_one_pagers/save_roi_one_pager'
		})
	}
};
</script>
