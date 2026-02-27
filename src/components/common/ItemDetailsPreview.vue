<template>
	<div>
		dfgdh
	</div>
</template>

<script setup>
defineProps({
	itemData: {
		type: Object,
		default: () => null,
	},
	settings: {
		type: Object,
		default: () => ({}),
	},
	formSettings: {
		type: Object,
		default: () => ({}),
	},
	additionalSettings: {
		type: Object,
		default: () => ({}),
	},
});
</script>
