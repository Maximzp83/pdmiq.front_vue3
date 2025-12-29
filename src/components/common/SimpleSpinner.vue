<template>
	<div class="spinner" v-show="active">
		<div class="lds-dual-ring"></div>
	</div>
</template>

<script setup>
defineProps({
	active: Boolean
});
</script>
