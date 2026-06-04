<template>
	<div class="content-container roi-update-history card content-row">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">{{ tt('phrases.history_roi_one_pager') }}</div>
		</div>
		<div class="card-content">
			<div v-for="item in itemsList" :key="item.id || item.created_at" class="content-row">
				<div class="semi-bold">{{ cleanDateString(item.created_at) }}</div>
				<div>{{ item.description || item.final_roi || '-' }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardROIsHistory' });

defineProps({
	itemsList: { type: Array, default: () => [] },
});
</script>
