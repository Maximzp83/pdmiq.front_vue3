<template>
	<div class="info-list">
		<div class="info-item">
			<div class="div-block">
				<b>{{ tt('Task_procedure') }}:</b>
			</div>
			<div class="div-block info" v-text="taskProcedure?.name || '-'"></div>
		</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'TaskProcedureInfo',
});

defineProps({
	taskProcedure: { type: Object, default: () => ({}) },
});
</script>
