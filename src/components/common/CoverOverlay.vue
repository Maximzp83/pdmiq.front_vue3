<template>
	<Transition name="overlay">
		<div
			v-show="active"
			:style="{ zIndex: z }"
			:class="['dark-overlay', { 'full-screen': fullScreen }]"
			@click="handleClick"
		>
			<div v-if="text" class="caption">{{ text }}</div>
		</div>
	</Transition>
</template>

<script setup>
defineProps({
	active: {
		type: Boolean,
		default: false,
	},
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
		default: 1000,
	},
});

const emit = defineEmits(['onClick']);

const handleClick = () => {
	emit('onClick');
};
</script>
