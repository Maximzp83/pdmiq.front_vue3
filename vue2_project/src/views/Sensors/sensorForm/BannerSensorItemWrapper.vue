<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="equipmentLoading"
			:itemsName="itemsName.one"
		/>

		<div class="form-wrapper" v-if="equipmentData">
			<ItemForm
				@event="handleEventNew"
				ref="ItemFormComponent"
				editInModal
				ignoreLocalSubmit
				:itemData="itemData"
				:equipmentData="equipmentData"
				:itemsName="itemsName"
				:additionalSettings="additionalSettings"
			/>
		</div>

	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { /*SENSOR_TYPES,*/ NCD_REQUEST_STATUSES } from '@/constants/global';

import { fetchItemsHelper, eventHandler } from '@/mixins';

export default {
	mixins: [fetchItemsHelper(), eventHandler()],
	name: 'BannerSensorWrapper',
	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	props: {
		itemData: Object,
		additionalSettings: Object
	},

	data: () => ({
		equipmentData: null,
		equipmentLoading: false,
	}),

	computed: {
		itemsName() {
			return {
				one: this.$t('Item'),
				mult: this.$t('Items')
			};
		},
	},

	methods: {
		...mapActions({
			fetch_equipment: 'equipments/fetch_equipment'
			// fetch_global_plants: 'fetch_global_plants'
		}),

		fetchEquipment(id) {
			this.doFetchAction('fetch_equipment', 'equipmentData', 'equipmentLoading', {
				itemId: id
			});
		},

		validateForm() {
			this.$refs.ItemFormComponent.validateForm();
		}
	},

	created() {
		if (this.itemData && this.itemData.equipment_id) {
			this.fetchEquipment(this.itemData.equipment_id);
		} else {
			this.equipmentData = {};
		}
	}
};
</script>
