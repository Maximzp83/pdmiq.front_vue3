<template>
	<div class="item-card-container machine-card-item">
		<div class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="data-content-wrapper">
			<GridItemCardHeader
				@event="handleEvent"
				:route="titleLinkRoute"
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
						<div
							class="imgWrapper"
							v-if="cardData.pictures && cardData.pictures.length"
						>
							<div
								class="images-part-overlay dark-overlay"
								@click="togglePreviewModal"
							>
								<div class="caption">
									<i class="icomoon icon-zoom-in"></i>
								</div>
							</div>
							<img
								:src="cardData.pictures[0].full_thumb_file_name"
								alt="img error"
							/>
						</div>
					</div>
				</div>

				<div class="data-section">
					<ul class="info-list">
						<InfoItem
							v-for="item in itemsCountersList"
							:key="`count-${item.label}`"
							:settingItem="item"
							:itemData="cardData"
						/>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import GridItemCardHeader from '@/components/gridTable/GridItemCardHeader.vue';
import InfoItem from '@/components/itemDetails/InfoItem.vue';

defineOptions({
	name: 'MachineItemCard',
});

const props = defineProps({
	cardData: { type: Object, default: () => ({}) },
	selectedIds: { type: Array, default: () => [] },
	operationsSettings: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);

const mainInfoSettingsList = Object.freeze([
	{ prop: 'plant.name', label: 'Plant' },
	{ prop: 'productionLine.name', label: 'Production Line' },
	{
		prop: 'locations',
		label: 'Locations',
		meta: {
			fromArray: { subProp: 'name', delimeter: ', ', inline: true },
		},
	},
	{ prop: 'application.name', label: 'Application' },
]);

const itemsCountersList = Object.freeze([
	{ prop: 'assets_count', label: 'Assets' },
	{ prop: 'equipments_count', label: 'Items' },
]);

const titleLinkRoute = computed(() => `/machines/${props.cardData.id}/details`);

const togglePreviewModal = () => {
	emit('event', {
		eventName: 'togglePreviewModal',
		data: props.cardData,
		onward: true,
	});
};

const { handleEvent } = useEventHandler({}, emit);
</script>
