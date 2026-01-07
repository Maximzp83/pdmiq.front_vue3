<template functional>
	<div class="spinner" v-show="props.active"><div class="lds-dual-ring"></div></div>
</template>

<script>
export default {
	functional: true,
	props: {
		active: Boolean
	}
};
</script>
