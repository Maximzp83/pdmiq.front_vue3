<template>
	<Teleport to="body">
		<div
			v-if="active"
			:class="['vue-element-loading-container', attrs.class]"
			:style="containerStyle"
		>
			<div class="vue-element-loading-spinner">
				<el-icon class="is-loading" :size="40">
					<Loading />
				</el-icon>
				<p v-if="text" class="vue-element-loading-text" :style="textStyle">
					{{ text }}
				</p>
			</div>
		</div>
	</Teleport>
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import { Loading } from '@element-plus/icons-vue';

defineOptions({
	inheritAttrs: false,
});

const props = defineProps({
	active: {
		type: Boolean,
		default: false,
	},
	text: {
		type: String,
		default: '',
	},
	textStyle: {
		type: [Object, String],
		default: () => ({}),
	},
	isFullScreen: {
		type: Boolean,
		default: true,
	},
	backgroundColor: {
		type: String,
		default: 'rgba(0, 0, 0, 0.7)',
	},
	spinner: {
		type: String,
		default: 'ring',
	},
});

const attrs = useAttrs();

const containerStyle = computed(() => ({
	backgroundColor: props.backgroundColor,
	...(attrs.style || {}),
}));
</script>

<style scoped>
.vue-element-loading-container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0.7);
}

.vue-element-loading-spinner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #fff;
}

.vue-element-loading-text {
	margin-top: 16px;
	font-size: 14px;
	color: #fff;
	text-align: center;
}

.el-icon.is-loading {
	animation: rotating 2s linear infinite;
	color: #fff;
}

@keyframes rotating {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
