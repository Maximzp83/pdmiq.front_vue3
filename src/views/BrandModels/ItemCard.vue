<template>
	<div class="item-card-container storeroom-card-item">
		<div class="data-content-wrapper">
			<GridItemCardHeader
				:route="detailsRoute"
				:cardData="cardData"
				:selectedIds="selectedIds"
				:operationsSettings="operationsSettings"
				@event="handleEvent"
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
						<div v-if="cardData.full_file_name" class="imgWrapper">
							<div class="images-part-overlay dark-overlay" @click="togglePreviewModal">
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
							:itemData="item"
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
import { setupTypeOptionsValuesList } from '@/helpers/specialHelpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemCard, buildProps } from '@/composables/mixins/useItemCard';

import GridItemCardHeader from '@/components/gridTable/GridItemCardHeader.vue';
import InfoItem from '@/components/itemDetails/InfoItem.vue';

defineOptions({
	name: 'BrandModelsItemCard',
});

const props = defineProps(buildProps());

const emit = defineEmits(['event']);

const detailsRoute = computed(
	() => `/brand-models/${props.cardData.id}/details?plantId=${props.additionalProps?.plantId}`,
);

const equipmentTypeData = computed(() => {
	const list = props.additionalProps?.equipmentTypesList || [];
	if (list.length && props.cardData.type_id) {
		return findItemBy('id', props.cardData.type_id, list);
	}
	return null;
});

const mainInfoSettingsList = computed(() =>
	Object.freeze([
		{ prop: 'plant.name', label: 'Plant' },
		{ prop: 'brand.name', label: 'Brand' },
		{ prop: 'type.name', label: 'Item Type' },
	]),
);

const currentDataList = computed(() =>
	Object.freeze(props.cardData?.type_option_values || []),
);

const resetPageFiltersList = computed(() =>
	Object.freeze({
		filters: [
			{
				storeName: 'BrandModelsStore',
				stateKey: 'filters',
				storageKey: 'brand_models_filters',
				params: ['page'],
			},
		],
		value: 1,
	}),
);

const typeOptionsValuesList = computed(() =>
	Object.freeze(
		setupTypeOptionsValuesList(currentDataList.value, equipmentTypeData.value, {
			excludeCategory: true,
			inEquipmentCardOnly: true,
		}),
	),
);

const { togglePreviewModal, handleTitleClick } = useItemCard({
	cardData: computed(() => props.cardData),
	titleLinkRoute: detailsRoute,
	resetPageFiltersList,
	emit,
});

const methodsMap = {
	handleTitleClick, //called in GridItemCardHeader
};

const { handleEvent } = useEventHandler(methodsMap, emit);
</script>
