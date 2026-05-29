<template>
	<div class="item-details-preview">
		<div class="section-title" v-text="itemData?.title || itemData?.serial_number || '-'"></div>
		<div class="content-row" v-html="itemData?.description || '-'"></div>
		<div class="info-list">
			<div class="info-item">
				<div class="div-block"><b>{{ tt('Status') }}:</b></div>
				<div class="div-block info" v-text="statusLabel"></div>
			</div>
			<div class="info-item">
				<div class="div-block"><b>{{ tt('Due_Date') }}:</b></div>
				<div class="div-block info" v-text="itemData?.finish_date || '-'"></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { getWOStatus } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'WorkOrderItemDetailsPreview',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	propsData: { type: Object, default: () => ({}) },
});

const itemData = computed(() => props.itemData || props.propsData || {});
const statusLabel = computed(() => getWOStatus(itemData.value.status) || '-');
</script>
