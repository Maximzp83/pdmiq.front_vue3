<template functional>
	<div
		:class="[
			'custom-dialog-wrapper',
			props.className || '',
			{ active: props.active }
		]"
	>
		<div class="popupContentWrapper" v-if="props.active !== undefined">
			<VueElementLoading
				:active="props.activeSpinner"
				spinner="ring"
				:text="props.spinnerText || ''"
				:background-color="'rgba(255, 255, 255, .7)'"
			/>

			<div :class="['dialog-header flex wrap relative', props.headerClass]">
				<slot name="header"></slot>

				<div class="modal-title" v-if="props.title">{{ props.title }}</div>
				<button class="popupCloseButton" type="button" @click="listeners.onClose">
					<i class="icomoon icon-plus"></i>
				</button>
			</div>

			<div class="dialog-content">
				<slot></slot>
			</div>

			<div class="dialog-footer" v-if="!props.hideFooter">
				<slot name="footer"></slot>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	functional: true,

	props: {
		// filters: Object,
		active: Boolean,
		className: String,
		title: String,
		activeSpinner: Boolean,
		spinnerText: String,
		hideFooter: Boolean
	}
};
</script>
