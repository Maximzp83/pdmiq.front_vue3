<template>
	<div class="item-card-container production-line-card-item">
		<div class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="data-content-wrapper">
			<GridItemCardHeader
				:cardData="cardData"
				:route="titleLinkRoute"
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
					<div v-if="cardData.full_file_name" class="images-part">
						<div class="imgWrapper">
							<div class="images-part-overlay dark-overlay" @click="togglePreviewModal">
								<div class="caption"><i class="icomoon icon-zoom-in"></i></div>
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

<script setup>
import { computed } from 'vue';

import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemCard, buildProps } from '@/composables/mixins/useItemCard';
import { useNavigation } from '@/composables/mixins/useNavigation';

import GridItemCardHeader from '@/components/gridTable/GridItemCardHeader.vue';
import InfoItem from '@/components/itemDetails/InfoItem.vue';

const { tt } = Lang;

defineOptions({ name: 'ProductionLinesItemCard' });

const props = defineProps(buildProps());
const emit = defineEmits(['event']);
const { changeRoute } = useNavigation();

const titleLinkRoute = computed(() => `/production-lines/${props.cardData.id}/details`);
const mainInfoSettingsList = computed(() =>
	Object.freeze([
		{ prop: 'plant.name', label: 'Plant' },
		{
			prop: 'locations',
			label: `${tt('Location')}s`,
			meta: { fromArray: { subProp: 'name', delimeter: ', ', inline: true } },
		},
	]),
);
const itemsCountersList = computed(() =>
	Object.freeze([
		{ prop: 'machines_count', label: `${tt('Machine')}s` },
		{ prop: 'assets_count', label: `${tt('Asset')}s` },
		{ prop: 'equipments_count', label: `${tt('Item')}s` },
	]),
);
const resetPageFiltersList = Object.freeze({
	filters: [
		{ action: 'machines/set_machines_filters', params: ['page'] },
		{ action: 'assets/set_assets_filters', params: ['page'] },
		{ action: 'equipments/set_equipments_filters', params: ['page'] },
	],
	value: 1,
});
const { togglePreviewModal, handleTitleClick } = useItemCard({
	cardData: computed(() => props.cardData),
	changeRoute,
	titleLinkRoute,
	resetPageFiltersList,
	emit,
});
const { handleEvent } = useEventHandler({ handleTitleClick }, emit);
</script>
