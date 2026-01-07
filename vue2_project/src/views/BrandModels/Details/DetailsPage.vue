<template>
	<div class="details-page fix-height main-instance-item">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper" v-if="loadContent">
			<div class="mcontainer">
				<div class="nested-view-content-wrapper">
					<div class="view-content-card">
						<div class="section-row">
							<div class=" mrow flex wrap big-padding">
								<div class="mcol-xs-12 mcol-lg-6">
									<ItemInfoBlock
										:blockTitle="`${tt('Part_Number')} ${tt('details')}`"
										dotsInText
										:itemData="itemData"
										:settingsList="mainInfoSettingsList"
									/>
									<!-- :additionalInfoItems="typeOptionsValuesList" -->
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemImagesBlock
										@event="handleEventNew"
										:itemData="itemData"
										imgObjFitContain
									/>
								</div>

								<div class="mcol-xs-12">
									<LocationList
										@event="handleEventNew"
										preventSetNavbar
										fromDetailsPage
										showCardHeader
										:propsFilters="itemsListsFilters"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- <div v-else class="text-center">This asset has not equipments</div> -->
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { setupTypeOptionsValuesList } from '@/helpers/specialHelpers';

import { initPageDataMixin, eventHandler, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [initPageDataMixin(), eventHandler(), fetchItemsHelper()],
	name: 'BrandModelDetailsPage',

	components: {
		ItemInfoBlock: () => import('@/components/itemDetails/ItemInfoBlock.vue'),
		ItemImagesBlock: () => import('@/components/itemDetails/ItemImagesBlock.vue'),
		LocationList: () => import('./LocationList.vue')
	},

	data() {
		return {
			equipmentTypeData: null,
			equipmentTypeLoading: false
		};
	},

	computed: {
		...mapState({
			filters: state => state.brand_models.filters,
			authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Part_Number'),
				mult: this.$t('Part_Numbers')
			};
		},

		// instanceViewName: () => 'Assets',

		itemsListsFilters() {
			if (this.loadContent) {
				return Object.freeze({
					isStoreroom: true,
					brandModelId: this.itemData.id,
					page: 1,
					max: -1
				});
			}
			return {};
		},

		navbarSettings() {
			const { itemData } = this;
			if (itemData) {
				return Object.freeze({
					showStandardNavItem: true,
					pageTitle: itemData.name || this.$t('phrases.part_number_without_name'),
					showPlantName: { name: itemData.plant ? itemData.plant.name : '' }
				});
			}

			return {};
		},

		predefinedFilters: that =>
			Object.freeze({
				plantId: that.itemData.plant_id
			}),

		mainInfoSettingsList() {
			let settings = [
				{ label: this.$t('Part_Number'), prop: 'name' },
				{ label: this.$t('Brand'), prop: 'brand.name' }
				// { prop: 'location.name', label: 'Location' },
				/*{
					prop: 'locations',
					label: 'Locations',
					meta: {
						fromArray: { subProp: 'name' }
					}
				},*/
				/*{
					label: 'Brand Models',
					prop: 'brandModels',
					meta: {
						fromArray: { subProp: 'name' }
					}
				}*/
			];

			const { typeOptionsValuesList } = this;

			if (typeOptionsValuesList.length) {
				settings = settings.concat(typeOptionsValuesList);
			}

			return Object.freeze(settings);
		},

		currentDataList: that =>
			Object.freeze((that.itemData && that.itemData.type_option_values) || []),

		typeOptionsValuesList() {
			const { currentDataList, equipmentTypeData } = this;

			if (equipmentTypeData && currentDataList.length) {
				return Object.freeze(
					setupTypeOptionsValuesList(currentDataList, equipmentTypeData)
				);
			}
			return [];
		}

		/*typeOptionsValuesSettings() {
			const { typeOptionsValuesList } = this;
			let settings = [];

			if (typeOptionsValuesList.length) {
				typeOptionsValuesList.forEach(to => {
					settings.push({
						{	label: 'Part Number',	prop: 'name' },						
					})

				})


				return Object.freeze({
					settingsList: typeOptionsValuesList,
					constSettingItem: {prop: 'value', label: item.label}
				})
			}

			return {};
		}*/
	},

	methods: {
		...mapActions({
			fetch_item: 'brand_models/fetch_brand_model',
			show_edit_modal: 'show_edit_modal',
			fetch_equipment_type: 'equipment_types/fetch_equipment_type'
			// set_filters: 'assets/set_statistics_filters'
		}),

		fetchequipmentType(type_id) {
			this.doFetchAction(
				'fetch_equipment_type',
				'equipmentTypeData',
				'equipmentTypeLoading',
				{ itemId: type_id }
			);
		}
	},

	watch: {
		itemData(item) {
			if (item) {
				this.fetchequipmentType(item.type_id);
			}
		}
	}
};
</script>
