<template>
	<div :class="[`custom-popover ${classList}`]">
		<slot name="reference"></slot>

		<transition name="overlay">
			<div
				:class="[`custom-popover-content-container`, { 'full-screen': fullScreen }]"
				v-show="show"
				:style="{ zIndex: z }"
			>
				<slot></slot>
			</div>
		</transition>
	</div>
</template>

<script>
export default {
	props: {
		show: Boolean,
		text: String,
		fullScreen: {
			type: Boolean,
			default: false
		},
		z: Number,
		classList: {
			type: String,
			default: ''
		}
	}
};
</script>
