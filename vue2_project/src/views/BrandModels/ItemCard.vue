<template>
	<div class="item-card-container storeroom-card-item">
		<!-- <div class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div> -->

		<div class="data-content-wrapper">
			<GridItemCardHeader
				@event="handleEventNew"
				:route="detailsRoute"
				:cardData="cardData"
				:selectedIds="selectedIds"
				:operationsSettings="operationsSettings"
			/>

			<div class="card-content">
				<div class="data-section main">
					<div class="info-part">
						<ul class="info-list">
							<InfoItem
								v-for="item in mainInfoSettingsList"
								:key="`info-${item.label}`"
								:settingItem="item"
								:itemData="cardData"
							/>
						</ul>
					</div>
					<div class="images-part">
						<div class="imgWrapper" v-if="cardData.full_file_name">
							<div
								class="images-part-overlay dark-overlay"
								@click="togglePreviewModal"
							>
								<div class="caption">
									<i class="icomoon icon-zoom-in"></i>
								</div>
							</div>
							<img :src="cardData.full_file_name" alt="img error" />
						</div>
					</div>
				</div>

				<div class="data-section">
					<ul class="info-list">
						<InfoItem
							v-for="item in typeOptionsValuesList"
							:key="`count-${item.label}`"
							:settingItem="{ prop: 'value', label: item.label }"
							:cardData="item"
						/>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { findItemBy } from '@/helpers';
import { setupTypeOptionsValuesList } from '@/helpers/specialHelpers';

import { itemCardMixin, eventHandler } from '@/mixins';

export default {
	mixins: [itemCardMixin(), eventHandler()],
	components: {
		GridItemCardHeader: () =>
			import('@/components/gridTable/GridItemCardHeader.vue'),
		InfoItem: () => import('@/components/itemDetails/InfoItem.vue')
	},

	props: {
		additionalProps: Object
	},

	computed: {
		detailsRoute() {
			return `/brand-models/${this.cardData.id}/details?plantId=${this.additionalProps.plantId}`;
		},
		equipmentTypeData() {
			const { cardData, additionalProps } = this;
			if (additionalProps.equipmentTypesList.length && cardData.type_id) {
				return findItemBy(
					'id',
					cardData.type_id,
					additionalProps.equipmentTypesList
				);
			}
			return null;
		},

		mainInfoSettingsList() {
			return Object.freeze([
				{ prop: 'plant.name', label: 'Plant' },
				{ prop: 'brand.name', label: 'Brand' },
				{ prop: 'type.name', label: 'Item Type' }
				/*{
					prop: 'locations',
					label: 'Locations',
					meta: {
						fromArray: { subProp: 'name', delimeter: ', ', inline: true }
					}
				},*/
			]);
		},

		// -------
		currentDataList: that =>
			Object.freeze((that.cardData && that.cardData.type_option_values) || []),

		typeOptionsValuesList() {
			const { currentDataList, equipmentTypeData } = this;

			return Object.freeze(
				setupTypeOptionsValuesList(currentDataList, equipmentTypeData, {
					excludeCategory: true,
					inEquipmentCardOnly: true
				})
			);
		}
	}
};
</script>
