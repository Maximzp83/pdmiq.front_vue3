<template>
	<div class="item-card-container asset-card-item">
		<div class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="data-content-wrapper">
			<GridItemCardHeader
				:route="titleLinkRoute"
				:cardData="cardData"
				:selectedIds="selectedIds"
				:operationsSettings="operationsSettings"
				@event="handleEvent"
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

					<div v-if="equipmentTypesList.length" class="images-part">
						<div v-for="item in equipmentTypesList" :key="`equipment_img-${item.id}`">
							<div v-if="item.full_file_name" class="imgWrapper">
								<img
									:src="
										getBrandModelImgByType({
											id: item.id,
											equipment_type_img: item.full_file_name,
											brandModelsList,
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

<script setup>
import { computed } from 'vue';

import { findItemBy } from '@/helpers';
import { getBrandModelImgByType } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import GridItemCardHeader from '@/components/gridTable/GridItemCardHeader.vue';
import InfoItem from '@/components/itemDetails/InfoItem.vue';

const { tt } = Lang;

defineOptions({ name: 'AssetItemCard' });

const props = defineProps({
	cardData: { type: Object, default: () => ({}) },
	selectedIds: { type: Array, default: () => [] },
	operationsSettings: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const mainInfoSettingsList = computed(() =>
	Object.freeze([
		{ prop: 'plant.name', label: tt('Plant') },
		{ prop: 'machine.productionLine.name', label: tt('Production_Line') },
		{ prop: 'machine.name', label: tt('Machine') },
		{ prop: 'location.name', label: tt('Location') },
	]),
);
const equipmentTypesList = computed(() => props.cardData.equipmentTypes || []);
const brandModelsList = computed(() => props.cardData.brandModels || []);
const titleLinkRoute = computed(() => `/assets/${props.cardData.id}/details`);

const getTypeName = (brandModel) => {
	if (brandModel.type) {
		return brandModel.type.name;
	}
	const item = findItemBy('id', brandModel.type_id, equipmentTypesList.value);
	return item?.name || '';
};

const { handleEvent } = useEventHandler({}, emit);
</script>
