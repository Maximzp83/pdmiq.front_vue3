<template>
	<div class="edit-form-container import-log-container">
		<LogRowItem
			v-for="item in itemRows"
			ref="logRowItemRefs"
			:key="`log-row-${item.id}-${item.row_number}`"
			:rowData="item"
			:equipmentTypesList="equipmentTypesList"
			@event="handleEvent"
		/>

		<div v-if="!itemRows.length" class="text-center">
			Something Wrong. Error rows are empty...
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';

import { useEventHandler } from '@/composables/mixins/useEmitter';

import LogRowItem from './LogRowItem.vue';

defineOptions({ name: 'ImportLogRowsForm' });

defineProps({
	itemRows: { type: Array, default: () => [] },
	equipmentTypesList: { type: Array, default: () => [] },
});
const emit = defineEmits(['event']);
const logRowItemRefs = ref([]);
const { handleEvent } = useEventHandler({}, emit);
</script>
