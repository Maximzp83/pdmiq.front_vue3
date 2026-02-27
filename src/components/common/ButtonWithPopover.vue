<template>
	<el-popover
		:disabled="finalDisabled"
		:placement="placement"
		:popper-class="popperClass"
		:title="title"
		trigger="hover"
		:width="finalWidth"
	>
		<template #reference>
			<el-button
				:disabled="finalButtonDisabled"
				:class="finalButtonClass"
				native-type="button"
				@click="handleClick"
				:size="settings.buttonSize"
				:type="finalButtonType"
				:icon="finalButtonIcon"
			>
				<i v-if="buttonIconClass" :class="buttonIconClass"></i>
			</el-button>
		</template>
	</el-popover>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	title: { type: String, default: '' },
	settings: { type: Object, default: () => ({}) },
	width: { type: String, default: '' },
	disabled: Boolean,
	buttonType: { type: String, default: '' },
	buttonDisabled: Boolean,
	buttonIcon: { type: String, default: '' },
	buttonClass: { type: null, default: null },
});

const emit = defineEmits(['onClick']);

const placement = computed(() => props.settings.placement || 'bottom');
const finalDisabled = computed(() => props.disabled || props.settings.popoverDisabled || false);
const popperClass = computed(() => props.settings.popperClass || '');
const finalWidth = computed(() => props.width || props.settings.width);
const buttonIconClass = computed(() => props.settings.buttonIconClass);
const finalButtonClass = computed(() => props.buttonClass || props.settings.buttonClass || '');
const finalButtonIcon = computed(() => props.buttonIcon || props.settings.buttonIcon || '');
const finalButtonDisabled = computed(
	() => props.buttonDisabled || props.settings.buttonDisabled || false
);
const finalButtonType = computed(() => props.buttonType || props.settings.buttonType || 'primary');

const handleClick = () => {
	emit('onClick');
};
</script>
