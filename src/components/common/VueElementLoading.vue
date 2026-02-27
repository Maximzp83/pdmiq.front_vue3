<template>
	<div
		v-show="active"
		:class="[
			'vue-element-loading-container',
			{ 'is-full-screen': isFullScreen },
			attrs.class,
		]"
		:style="containerStyle"
	>
		<div class="vue-element-loading-spinner">
			<el-icon class="vue-element-loading-icon" :size="size">
				<Loading />
			</el-icon>
			<p v-if="text" class="vue-element-loading-text" :style="textStyle">
				{{ text }}
			</p>
		</div>
	</div>
</template>

<script setup>
import { computed, useAttrs, watch, onBeforeUnmount } from 'vue';
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
		default: false,
	},
	backgroundColor: {
		type: String,
		default: 'rgba(0, 0, 0, 0.7)',
	},
	spinner: {
		type: String,
		default: 'ring',
	},
	size: {
		type: Number,
		default: 32,
	},
	lockScroll: {
		type: Boolean,
		default: false,
	},
});

const attrs = useAttrs();

const containerStyle = computed(() => ({
	backgroundColor: props.backgroundColor,
	position: props.isFullScreen ? 'fixed' : 'absolute',
	inset: 0,
	...(attrs.style || {}),
}));

const updateBodyScrollLock = (isLocked) => {
	if (!props.lockScroll || !props.isFullScreen) return;
	document.body.style.overflow = isLocked ? 'hidden' : '';
};

watch(
	() => props.active,
	(isActive) => {
		updateBodyScrollLock(Boolean(isActive));
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	updateBodyScrollLock(false);
});
</script>

<style scoped>
.vue-element-loading-container {
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0.7);
}

.vue-element-loading-container:not(.is-full-screen) {
	z-index: 10;
}

.vue-element-loading-spinner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #000;
}

.vue-element-loading-text {
	margin-top: 16px;
	font-size: 14px;
	color: #000;
	text-align: center;
}

.vue-element-loading-icon {
	display: inline-flex;
	animation: vue-element-loading-rotate 1.2s linear infinite;
	color: #000;
	will-change: transform;
}

@keyframes vue-element-loading-rotate {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
