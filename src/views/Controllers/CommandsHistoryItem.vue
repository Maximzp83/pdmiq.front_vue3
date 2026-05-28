<template>
	<div class="commands-history-item">
		<div class="content-row muted" v-text="createdAt"></div>
		<div class="content-row semi-bold" v-text="itemData.message_body"></div>
		<div
			class="content-row semi-bold"
			v-text="itemData.message_response || '-'"
		></div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { cleanDateString } from '@/helpers';

defineOptions({
	name: 'ControllerCommandsHistoryItem',
});

const props = defineProps({
	itemData: { type: Object, required: true },
});

const createdAt = computed(() => cleanDateString(props.itemData.created_at));
</script>
