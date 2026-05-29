<template>
	<ul class="default-list">
		<li v-for="file in filesList" :key="file.id || file.file_path || file.name">
			<a v-if="file.file_path" :href="file.file_path" target="_blank" v-text="file.name || file.file_name || file.file_path"></a>
			<span v-else v-text="file.name || file.file_name || '-'"></span>
		</li>
		<li v-if="!filesList.length">-</li>
	</ul>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'MaintenanceLogFilePopoverContent',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
});

const filesList = computed(() => Object.freeze(props.propsData.attachments || props.propsData.files || []));
</script>
