<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemsLoading"
			:isSaving="itemsSaving"
			:itemsName="itemsName.mult"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div class="form-wrapper card-content import-rows-wrapper flex column">
						<Filterbar
							hideCreate
							hideDelete
							hideSearchbar
							@event="handleEvent"
							:itemsLoading="itemsLoading"
							:filters="filters"
							:itemsName="itemsName"
						/>

						<ItemForm
							@event="handleEventNew"
							ref="ItemFormComponent"
							:itemRows="itemsList"
							:itemsName="itemsName"
							:equipmentTypesList="equipmentTypesList"
						/>

						<div class="mt-auto">
							<PaginationContainer
								@setFilters="setFilters"
								:itemsName="itemsName"
								:filters="filters"
								:meta="meta"
								scrollTo=".import-rows-wrapper"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import {
	itemsDataMixin,
	eventHandler,
	navigation,
	fetchItemsHelper
} from '@/mixins';
// import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), fetchItemsHelper()],
	name: 'PlantImportLogErrors',

	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		// CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		ItemForm: () => import('./ItemForm.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	data: () => ({
		equipmentTypesLoading: false,
		equipmentTypesList: [],

		itemsSaving: false
	}),

	computed: {
		...mapState({
			filters: state => state.testing.filters
			// plantsList: state => state.global.globalPlantsList
		}),

		/*predefinedFilters: () => Object.freeze({ 
			type: 1, orderByColumn: 'date_end', orderByMethod: 'desc'
		}),*/

		itemsName() {
			return {
				one: this.$t('sidebar_menu.Plant_Import_Log'),
				mult: `${this.$t('sidebar_menu.Plant_Import_Logs')} ${this.$t('errors')}`,
				instanceName: 'testing'
			};
		},

		fetchItemsPayload() {
			return Object.freeze({
				itemId: this.$route.params ? this.$route.params.id : null
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'testing/fetch_log_errors',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',

			set_filters: 'testing/set_settings_filters'
		}),

		fetchEquipmentTypes() {
			this.doFetchAction(
				'fetch_equipment_types',
				'equipmentTypesList',
				'equipmentTypesLoading',
				{ params: { max: -1 } }
			);
		},

		/*updatePageData() {
			// this.fetchPageData(this.itemData.id, { notNotify: true });
		},*/

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
		},

		localFetchItemsCatch(error) {
			if (error.response.status === 404) {
				let path = '';
				// let path = '/sensors';
				if (!this.$hasAccessTo(['view_dashboard'])) {
					if (this.$hasAccessTo(['view_oee'])) path = '/processes';
					else if (this.$hasAccessTo(['view_requisitions'])) path = '/requisitions';
				} else {
					path = '/dashboard';
				}
				this.$router.push(path);
				setTimeout(() => {
					this.$notify({
						type: 'warning',
						title: 'Redirect',
						message: `${this.itemsName.one} with id "${this.fetchItemsPayload.itemId}" not found`
					});
				}, 200);
			}
		}

		/*handleShowInfo({ row }) {
			this.changeRoute({ path: `/brand-models/${row.id}/details?plantId=${this.plantId}` });
		},*/
	},

	created() {
		this.fetchEquipmentTypes();
	}
};
</script>
