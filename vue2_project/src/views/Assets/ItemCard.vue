<template>
	<div class="item-card-container asset-card-item">
		<div class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="data-content-wrapper">
			<GridItemCardHeader
				@event="handleEventNew"
				:route="titleLinkRoute"
				:cardData="cardData"
				:selectedIds="selectedIds"
				:operationsSettings="operationsSettings"
			/>

			<div class="card-content">
				<div class="data-section main">
					<div class="info-part 1mcol-xs-6">
						<ul class="info-list capitalize">
							<InfoItem
								v-for="item in mainInfoSettingsList"
								:key="`info-${item.label}`"
								:settingItem="item"
								:itemData="cardData"
							/>
						</ul>
					</div>

					<div class="images-part" v-if="equipmentTypesList.length">
						<div
							class=""
							v-for="item in equipmentTypesList"
							:key="`equipment_img-${item.id}`"
						>
							<div class="imgWrapper" v-if="item.full_file_name">
								<img
									:src="
										getBrandModelImgByType({
											id: item.id,
											equipment_type_img: item.full_file_name,
											brandModelsList: brandModelsList
										})
									"
									alt="img error"
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="data-section footer-info">
					<ul class="info-list">
						<InfoItem
							v-for="item in brandModelsList"
							:key="`footer-${item.id}`"
							:settingItem="item"
							labelClassName="capitalize"
							:labelMethod="getTypeName"
							valueProp="name"
						/>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { findItemBy } from '@/helpers';
import { getBrandModelImgByType } from '@/helpers/specialHelpers';
import { itemCardMixin, eventHandler, navigation } from '@/mixins';

export default {
	mixins: [itemCardMixin(), eventHandler(), navigation()],
	components: {
		GridItemCardHeader: () =>
			import('@/components/gridTable/GridItemCardHeader.vue'),
		InfoItem: () => import('@/components/itemDetails/InfoItem.vue')
	},

	computed: {
		getBrandModelImgByType: () => getBrandModelImgByType,

		mainInfoSettingsList() {
			return [
				{ prop: 'plant.name', label: this.$t('Plant') },
				{ prop: 'machine.productionLine.name', label: this.$t('Production_Line') },
				{ prop: 'machine.name', label: this.$t('Machine') },
				{ prop: 'location.name', label: this.$t('Location') }
			];
		},

		equipmentTypesList: that => that.cardData.equipmentTypes,
		brandModelsList: that => that.cardData.brandModels,

		titleLinkRoute() {
			return `/assets/${this.cardData.id}/details`;
		},

		resetPageFiltersList: () =>
			Object.freeze({
				filters: [
					{
						action: 'equipments/set_equipments_filters',
						params: ['page']
					}
				],
				value: 1
			})
	},

	methods: {
		getTypeName(brandModel) {
			// console.log(brandModel)
			if (brandModel.type) {
				return brandModel.type.name;
			} else {
				const item = findItemBy('id', brandModel.type_id, this.equipmentTypesList);
				if (item) return item.name;
			}
			return '';
		}

		/*getBrandModels(equipment) {
			if (this.brandModelsList.length) {
				const item = findItemBy('type_id', equipment.id, this.brandModelsList);
				if (item) return item.name;
			}
			return null;
		}*/
	}
};
</script>
