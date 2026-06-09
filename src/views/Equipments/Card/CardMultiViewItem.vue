<template>
	<div class="sensor-item multiview-item">
		<div class="content-container sensor-main-block relative">
			<div class="semi-bold capitalize fluid">{{ itemData.name }}</div>

			<TableCell
				v-for="(column, columnIdx) in iconsAndButtonsSettings"
				:key="`icon-${columnIdx}`"
				class="icon-item"
				:rowData="itemData"
				:columnIdx="columnIdx"
				:column="column"
				@event="handleEvent"
			/>

			<div v-if="enableReorder" class="reorder-button can-dragging">
				<img class="can-dragging" :src="icon_drag" alt="" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { icon_drag } from '@/constants/global';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import TableCell from '@/components/table/TableCell.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentCardMultiViewItem' });

const props = defineProps({
	itemData: { type: Object, required: true },
	enableReorder: Boolean,
});
const emit = defineEmits(['event']);

const iconsAndButtonsSettings = computed(() =>
	Object.freeze([
		{
			show_anyway: true,
			meta: {
				additionalActions: [
					{
						linkSettings: {
							linkRoute: `equipments/${props.itemData.equipment_id}/details/multi-view/${props.itemData.id}`,
						},
						tooltip_text: tt('phrases.Multi_view_Charts'),
						icon: 'icomoon icon-chart3',
					},
				],
			},
		},
	]),
);

const { handleEvent } = useEventHandler({}, emit);
</script>
