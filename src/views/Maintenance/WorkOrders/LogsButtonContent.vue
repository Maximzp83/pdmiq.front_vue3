<template>
	<ul>
		<li v-for="log in logsList" :key="`log-${log.id}`">
			<el-button
				:class="['action-button link underline info-color']"
				@click.stop="showLog(log)"
			>
				<span>{{ log.id }}</span>
			</el-button>
		</li>
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
const emit = defineEmits(['event']);

const logsList = computed(() => Object.freeze(props.propsData.logs || []));

const showLog = (log) => {
	emit('event', {
		eventName: 'handleShowLog',
		data: {
			order: props.propsData,
			log,
		},
		onward: true,
	});
};
</script>
