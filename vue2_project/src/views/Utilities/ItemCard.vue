<template>
	<div class="item-card-container">
		<div class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="data-content-wrapper">
			<GridItemCardHeader
				@event="handleEventNew"
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
					<div class="images-part" v-if="cardData.full_file_name">
						<div class="imgWrapper">
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
							v-for="item in itemsCountersList"
							:key="`info-${item.label}`"
							:settingItem="item"
							:itemData="cardData"
						/>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { itemCardMixin, eventHandler } from '@/mixins';

export default {
	mixins: [itemCardMixin(), eventHandler()],
	components: {
		GridItemCardHeader: () =>
			import('@/components/gridTable/GridItemCardHeader.vue'),
		InfoItem: () => import('@/components/itemDetails/InfoItem.vue')
	},

	computed: {
		mainInfoSettingsList() {
			return [
				{ prop: 'plant.name', label: 'Plant' },
				{
					prop: 'locations',
					label: 'Locations',
					meta: {
						fromArray: { subProp: 'name', delimeter: ', ', inline: true }
					}
				}
			];
		},

		itemsCountersList() {
			return [
				{ prop: 'machines_count', label: 'Machines' },
				{ prop: 'assets_count', label: 'Assets' },
				{ prop: 'equipments_count', label: 'Items' }
			];
		}
	}
};
</script>
