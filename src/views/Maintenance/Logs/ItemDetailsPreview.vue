<template>
	<div class="item-details-preview">
		<div class="section-title" v-text="itemData?.parent?.title || itemData?.serial_number || '-'"></div>
		<div class="content-row" v-html="itemData?.description || '-'"></div>
		<div class="info-list">
			<div class="info-item">
				<div class="div-block"><b>{{ tt('Time') }}:</b></div>
				<div class="div-block info" v-text="totalTime"></div>
			</div>
			<div class="info-item">
				<div class="div-block"><b>{{ tt('Reason') }}:</b></div>
				<div class="div-block info" v-text="reasonLabel"></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { maintenanceReasonTypesList } from '@/constants/global';
import { convertMsToHours, findItemBy } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'MaintenanceLogItemDetailsPreview',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	propsData: { type: Object, default: () => ({}) },
});

const itemData = computed(() => props.itemData || props.propsData || {});
const totalTime = computed(() => convertMsToHours(itemData.value.total_time) || '-');
const reasonLabel = computed(() => {
	const item = findItemBy('id', itemData.value.reason_type, maintenanceReasonTypesList());
	return item?.label || '-';
});
</script>
