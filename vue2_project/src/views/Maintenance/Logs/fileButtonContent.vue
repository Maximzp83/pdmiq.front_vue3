<template functional>
	<div class="files-button-content">
		<!-- v-if="action.img" -->
		<img class="button-image" :src="props.additionalProps.img" />
		<span class="quantity">{{
			props.additionalProps.name == 'openFile'
				? props.propsData.attachments.length
				: props.propsData.images.length
		}}</span>
	</div>
</template>

<script>
export default {
	functional: true,
	props: {
		propsData: { type: Object, required: true },
		additionalProps: { type: Object, required: true }
	}
};
</script>
