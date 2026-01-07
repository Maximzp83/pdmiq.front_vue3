<template functional>
	<transition name="overlay">
		<div
			@click="listeners.onClick"
			v-show="props.active"
			:style="{ zIndex: props.z }"
			:class="['dark-overlay', { 'full-screen': props.fullScreen }]"
		>
			<div class="caption" v-if="props.text">{{ props.text }}</div>
		</div>
	</transition>
</template>

<script>
export default {
	functional: true,
	props: {
		active: Boolean,
		text: String,
		fullScreen: {
			type: Boolean,
			default: false
		},
		z: Number
	}
};
</script>
