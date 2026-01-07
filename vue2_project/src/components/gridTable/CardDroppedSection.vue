<template>
	<div class="dropped-section">
		<a
			:href="route"
			@click.prevent="changeRoute({ path: route })"
			:class="['el-button el-button--primary inverted']"
		>
			<i class="icomoon icon-eye"></i>
			<span>{{ buttonText }}</span>
		</a>
	</div>
</template>

<script>
import { navigation } from '@/mixins';

export default {
	mixins: [navigation()],
	props: {
		route: { type: String, required: true },
		buttonText: { type: String, default: '' }
	}
};
</script>
