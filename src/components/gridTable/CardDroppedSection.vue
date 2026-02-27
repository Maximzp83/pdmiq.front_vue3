<template>
	<div class="dropped-section">
		<a
			:href="route"
			class="el-button el-button--primary inverted"
			@click.prevent="changeRoute({ path: route })"
		>
			<i class="icomoon icon-eye"></i>
			<span>{{ buttonText }}</span>
		</a>
	</div>
</template>

<script setup>
import { useNavigation } from '@/composables/mixins/useNavigation';

defineOptions({
	name: 'CardDroppedSection',
});

defineProps({
	route: { type: String, required: true },
	buttonText: { type: String, default: '' },
});

const { changeRoute } = useNavigation();
</script>
