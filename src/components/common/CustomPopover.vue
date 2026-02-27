<template>
	<div :class="[`custom-popover ${classList}`]">
		<slot name="reference"></slot>

		<transition name="overlay">
			<div
				v-show="show"
				:class="['custom-popover-content-container', { 'full-screen': fullScreen }]"
				:style="{ zIndex: z }"
			>
				<slot></slot>
			</div>
		</transition>
	</div>
</template>

<script setup>
defineProps({
	show: Boolean,
	text: {
		type: String,
		default: '',
	},
	fullScreen: {
		type: Boolean,
		default: false,
	},
	z: {
		type: Number,
		default: 0,
	},
	classList: {
		type: String,
		default: '',
	},
});
</script>
