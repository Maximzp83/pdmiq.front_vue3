<template>
	<ul class="default-list">
		<li v-for="log in logsList" :key="`log-${log.id}`">
			<span v-text="log.serial_number || log.created_at || log.id"></span>
		</li>
		<li v-if="!logsList.length">-</li>
	</ul>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'LogsButtonContent',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
});

const logsList = computed(() => Object.freeze(props.propsData.logs || []));
</script>
