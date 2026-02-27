<template>
	<div class="card-header">
		<div class="title-block">
			<el-checkbox
				v-if="operationsSettings.allowDelete"
				:model-value="isChecked"
				@change="handleChecked"
			/>

			<div class="equipmentTypeImg imgWrapper relative" v-if="showEquipmentTypeImg">
				<div :class="['status-round-block1', sensorsStatusClass]">
					<a class="absolute stretch" :href="route" @click.prevent="handleTitleClick"></a>
					<img :src="cardData.equipment_type_img" alt="img error" />
				</div>
			</div>

			<el-tooltip effect="dark" placement="top">
				<template #content>
					<div v-html="cardTitle"></div>
				</template>

				<div class="title semi-bold">
					<a
						class="standard"
						:href="route"
						@click.prevent="handleTitleClick"
						v-html="cardTitle"
					></a>
				</div>
			</el-tooltip>
		</div>

		<div class="buttons-block">
			<TableAction
				v-for="(action, idx) in operationsSettings.buttons"
				:key="`card_action-${action.name}-${idx}`"
				:rowData="cardData"
				:action="action"
				@event="forwardEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { equipmentCardTitle } from '@/helpers/specialHelpers';
import TableAction from '@/components/table/TableAction.vue';

defineOptions({
	name: 'GridItemCardHeader',
});

const props = defineProps({
	cardData: { type: Object, required: true },
	operationsSettings: { type: Object, default: () => ({}) },
	selectedIds: { type: Array, default: () => [] },
	showEquipmentTypeImg: Boolean,
	route: { type: String, required: true },
	sensorsStatusClass: String,
});

const emit = defineEmits(['event']);

const isChecked = computed(() => props.selectedIds.indexOf(props.cardData.id) !== -1);

const titles = computed(() => {
	const { is_store_room } = props.cardData;
	const titlesList = props.operationsSettings.titles || [];
	return is_store_room
		? titlesList.filter((ti) => ti.prop == 'id')
		: titlesList.filter((ti) => ti.prop != 'id');
});

const cardTitle = computed(() => equipmentCardTitle(titles.value, props.cardData));

const handleChecked = () => {
	emit('event', {
		eventName: 'handleSelectionChange',
		data: props.cardData.id,
		onward: true,
	});
};

const handleTitleClick = () => {
	emit('event', { eventName: 'handleTitleClick' });
};

const forwardEvent = (payload) => {
	emit('event', payload);
};
</script>
