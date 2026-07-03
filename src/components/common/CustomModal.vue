<template>
	<div
		:class="[
			'custom-dialog-wrapper',
			className || '',
			{ active: active }
		]"
	>
		<div v-if="active !== undefined" class="popupContentWrapper">
			<VueElementLoading
				:active="activeSpinner"
				spinner="ring"
				:text="spinnerText || ''"
				:background-color="'rgba(255, 255, 255, .7)'"
			/>

			<div :class="['dialog-header flex wrap relative', headerClass]">
				<slot name="header"></slot>

				<div v-if="title" class="modal-title">{{ title }}</div>
				<button class="popupCloseButton" type="button" @click="handleClose">
					<i class="icomoon icon-plus"></i>
				</button>
			</div>

			<div class="dialog-content">
				<slot></slot>
			</div>

			<div v-if="!hideFooter" class="dialog-footer">
				<slot name="footer"></slot>
			</div>
		</div>
	</div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const VueElementLoading = defineAsyncComponent(
	() => import('@/components/common/VueElementLoading.vue')
);

defineProps({
	active: {
		type: Boolean,
		default: false,
	},
	className: {
		type: String,
		default: '',
	},
	headerClass: {
		type: String,
		default: '',
	},
	title: {
		type: String,
		default: '',
	},
	activeSpinner: {
		type: Boolean,
		default: true,
	},
	spinnerText: {
		type: String,
		default: '',
	},
	hideFooter: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['onClose']);

const handleClose = () => {
	emit('onClose');
};
</script>
