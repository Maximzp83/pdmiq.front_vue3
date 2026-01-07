<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div class="form-wrapper card-content" v-if="loadContent">
						<ItemForm
							@event="handleEventNew"
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemLoading="itemLoading"
							:itemsName="itemsName"
							:equipmentTypesList="equipmentTypesList"
						/>
					</div>
				</div>
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
	fetchItemsHelper,
	eventHandler
} from '@/mixins';

export default {
	mixins: [
		navigation(),
		itemPageMixin(),
		initPageDataMixin(),
		fetchItemsHelper(),
		eventHandler()
	],
	name: 'PlantImportLogPage',

	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	data: () => ({
		equipmentTypesLoading: false,
		equipmentTypesList: []
	}),

	computed: {
		itemsName() {
			return {
				one: this.$t('sidebar_menu.Plant_Import_Log'),
				mult: this.$t('sidebar_menu.Plant_Import_Logs')
			};
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'testing/fetch_log',
			// save_item: 'testing/save_application',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types'
		}),

		fetchEquipmentTypes() {
			this.doFetchAction(
				'fetch_equipment_types',
				'equipmentTypesList',
				'equipmentTypesLoading',
				{ params: { max: -1 } }
			);
		},

		updatePageData() {
			console.log(this);
			this.fetchPageData(this.itemData.id, { notNotify: true });
		},

		handleDeleteRow({ id }) {
			this.itemData.rows = this.itemData.rows.filter(row => row.id !== id);
			/*if (id) {
				console.log(id)
				return				
			}*/

			/*this.delete_row({ rowId: id })
				.then(() => {
					this.fetchPageData(this.itemData.id, { notNotify: true });
				})
				.finally(() => {
					this.itemLoading = false;
				});	*/
		}
	},

	created() {
		this.fetchEquipmentTypes();
	}
};
</script>
