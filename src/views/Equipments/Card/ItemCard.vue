<template>
	<div :class="['item-card-container equipment-card-item', equipmentStatusClass]">
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
				:sensorsStatusClass="equipmentStatusClass"
				showEquipmentTypeImg
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
								labelClassName="capitalize"
							/>
						</ul>

						<div v-if="currentEquipmentTypesList.length > 1" class="radio-buttons-wrapper">
							<RadioButtonsBlock
								:model-value="activeEquipmentTypeTab"
								:settings="radioBlockOptions"
								:optionsList="currentEquipmentTypesList"
								@update:model-value="switchEquipmentTypeTab"
								@onChange="switchEquipmentTypeTab"
							/>
						</div>
					</div>

					<div :class="['images-part', { 'has-equipment-img': equipmentPicture }]">
						<div class="imgWrapper">
							<div v-if="cardData.pictures?.length" class="images-part-overlay dark-overlay" @click="togglePreviewModal">
								<div class="caption">
									<i class="icomoon icon-zoom-in"></i>
								</div>
							</div>
							<img
								:class="{ 'type-img': !equipmentPicture }"
								:src="equipmentPicture || cardData.equipment_type_img"
								alt="img error"
							/>
						</div>
					</div>
				</div>

				<div class="data-section last">
					<div
						v-for="(item, idx) in currentEquipmentTypesList"
						:key="`item-${cardData.id}_tab-${activeEquipmentTypeTab}_idx-${idx}`"
						class="tab-container"
					>
						<TypeOptionBlock v-if="activeEquipmentTypeTab === item.id" :equipmentTypeData="item" />
					</div>
				</div>
			</div>
		</div>

		<div :class="['sensors-block', `equipment_${cardData.id}-sensors-drag-n-drop-wrapper`]">
			<div
				v-if="sensorsAndMultiviewsList.length"
				:key="resetReorder"
				class="sensors-list drag-n-drop-list relative"
			>
				<div
					v-for="(item, idx) in sensorsAndMultiviewsList"
					:key="`sensor-${item.id}_idx-${idx}`"
					class="drag-n-drop-item"
					:data-card_item_order="item.equipment_card_item_order"
				>
					<CardSensorItem
						v-if="item.data_set"
						v-show="!item.is_archived || filters.archivedNodes"
						:itemData="item"
						:enableReorder="enableReorder"
						:enableResetRuntime="isIndustrialMatrix"
						@event="handleEvent"
					/>

					<CardMultiViewItem
						v-else
						:itemData="item"
						:enableReorder="enableReorder"
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { findItemBy, sortArrayByKeyNumber } from '@/helpers';
import { SENSOR_ALARM_TYPES } from '@/constants/global';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { Lang } from '@/localization';
import { buildProps, useItemCard } from '@/composables/mixins/useItemCard';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useDragNdropSortable } from '@/composables/mixins/useDragNdropSortable';

import GridItemCardHeader from '@/components/gridTable/GridItemCardHeader.vue';
import InfoItem from '@/components/itemDetails/InfoItem.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import CardSensorItem from './CardSensorItem.vue';
import CardMultiViewItem from './CardMultiViewItem.vue';
import TypeOptionBlock from './TypeOptionBlock.vue';

const { translate } = Lang;

defineOptions({ name: 'EquipmentItemCard' });

const props = defineProps(buildProps());
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const equipmentsStore = useEquipmentsStore();
const { filters } = storeToRefs(equipmentsStore);
const activeEquipmentTypeTab = ref(null);
const resetReorder = ref(1);

const equipmentTypesList = computed(() => Object.freeze(props.additionalProps?.equipmentTypesList || []));
const dashboardSensors = computed(() => props.cardData.dashboardSensors || []);
const multiViewsList = computed(() => Object.freeze(props.cardData.metric_multi_views || []));
const sensorsAndMultiviewsList = computed(() =>
	sortArrayByKeyNumber([...dashboardSensors.value, ...multiViewsList.value], 'equipment_card_item_order'),
);
const isIndustrialMatrix = computed(() => authStore.isIndustrialMatrix || authStore.isDeveloper);
const enableReorder = computed(() => dashboardSensors.value.length > 1 && isIndustrialMatrix.value);
const draggingLocked = computed(() => !enableReorder.value);
const dragNdropWrapperSelector = computed(() => `.equipment_${props.cardData.id}-sensors-drag-n-drop-wrapper`);
const titleLinkRoute = computed(() => `/equipments/${props.cardData.id}/details`);
const radioBlockOptions = Object.freeze({ hideTitle: true, buttonType: 'primary' });
const mainInfoSettingsList = computed(() => {
	const { is_store_room, asset_id } = props.cardData;
	if (is_store_room) {
		return Object.freeze(translate([
			{ prop: 'production_line_name', label: 'Production_line' },
			{ prop: 'equipment_type_name', label: 'Item_type' },
			{ prop: 'brand_name', label: 'Brand' },
			{ prop: 'brand_model_name', label: 'Part' },
		]));
	}
	if (dashboardSensors.value.length) {
		return Object.freeze(translate([
			{ prop: 'asset_name', label: 'Asset' },
			{ prop: 'location_name', label: 'location_in_plant' },
			{ prop: 'production_line_name', label: 'Production_line' },
		]));
	}
	if (asset_id) {
		return Object.freeze(translate([
			{ prop: 'plant_name', label: 'Plant' },
			{ prop: 'brand_name', label: 'Brand' },
			{ prop: 'brand_model_name', label: 'Part' },
			{ prop: 'machine_name', label: 'Machine' },
		]));
	}
	return [];
});
const equipmentPicture = computed(() => {
	const pictures = props.cardData.pictures || [];
	if (pictures.length) {
		return sortArrayByKeyNumber(pictures, 'display_order')[0]?.full_thumb_file_name;
	}
	return null;
});
const currentEquipmentTypesList = computed(() => {
	const {
		equipment_type_id,
		equipment_type_name,
		equipment_subtype_id,
		subtype_brand_model_name,
		brand_model_name,
		typeOptions,
		subTypeOptions,
	} = props.cardData;
	const equipmentType = findItemBy('id', equipment_type_id, equipmentTypesList.value) || {};
	const list = [{ ...equipmentType, id: equipment_type_id, title: equipment_type_name, brand_model_name, typeOptions }];
	if (equipment_subtype_id) {
		const equipmentSubType = findItemBy('id', equipment_subtype_id, equipmentTypesList.value) || {};
		list.push({
			...equipmentSubType,
			id: equipment_subtype_id,
			title: equipmentSubType.name,
			brand_model_name: subtype_brand_model_name,
			typeOptions: subTypeOptions,
		});
	}
	return Object.freeze(list.filter((item) => item.id));
});
const equipmentStatusClass = computed(() => {
	const alerts = dashboardSensors.value.flatMap((sensor) => sensor.current_metric_issue_alerts || []);
	if (alerts.some((alert) => alert.alert_type === SENSOR_ALARM_TYPES.ALARM)) return 'alarm';
	if (alerts.some((alert) => alert.alert_type === SENSOR_ALARM_TYPES.WARNING)) return 'warning';
	return '';
});

const switchEquipmentTypeTab = (id) => {
	activeEquipmentTypeTab.value = id;
};
const dragStartHandler = (event) => {
	const target = event?.sensorEvent?.data?.target;
	return !!target?.classList?.contains('can-dragging');
};
const reorderHandler = (event) => {
	const { oldIndex, newIndex } = event || {};
	const { card_item_order: cardItemOrder } = event?.data?.dragEvent?.data?.originalSource?.dataset || {};

	if (oldIndex === newIndex || cardItemOrder == null) return;

	const payload = {
		notNotify: true,
		data: {
			current_display_order: +cardItemOrder,
			desired_display_order: newIndex
		}
	}

	/*if (process.env.NODE_ENV === 'development') {
		if (payload) {
			console.log('reorderHandler', payload.data);
			resetReorder.value++;
			destroySortable();

			setTimeout(() => {
				nextTick(setupDraggable);
			}, 0)

			return;
		}
	}*/

	api_request.put(`/equipments/${props.cardData.id}/card-items-order`, payload)
		.catch((error) => {
			console.log(error);
			resetReorder.value++;
			destroySortable();
			nextTick(setupDraggable);
		});
};
const { togglePreviewModal, handleTitleClick } = useItemCard({
	cardData: computed(() => props.cardData),
	titleLinkRoute,
	emit,
});
const { handleEvent } = useEventHandler({ handleTitleClick }, emit, 'itemCard');
const { setupDraggable, destroySortable } = useDragNdropSortable({
	wrapperSelector: dragNdropWrapperSelector,
	draggingLockedProp: draggingLocked,
	reorderHandler,
	dragStartHandler,
});

watch(
	currentEquipmentTypesList,
	(list) => {
		if (!activeEquipmentTypeTab.value && list.length) {
			activeEquipmentTypeTab.value = list[0].id;
		}
	},
	{ immediate: true },
);

watch(
	[enableReorder, sensorsAndMultiviewsList],
	() => {
		destroySortable();
		nextTick(setupDraggable);
	},
	{ immediate: true, flush: 'post' },
);

</script>
