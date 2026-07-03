<template>
	<div class="card">
		<div class="card-header filled bold flex relative">
			<span>Values</span>
			<button
				v-if="showClose"
				class="ml-auto popupCloseButton"
				type="button"
				@click="emit('closeDialog')"
			>
				<i class="icomoon icon-plus"></i>
			</button>
		</div>
		<div class="card-content">
			<RadioButtonsBlock
				:value="value"
				:settings="radioOptions"
				:optionsList="options"
				@onChange="radioChange"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';

import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';

defineOptions({ name: 'ImportAlternateOptionsList' });

defineProps({
	showClose: Boolean,
	options: { type: Array, default: () => [] },
});
const emit = defineEmits(['radioChange', 'closeDialog']);
const value = ref(null);
const radioOptions = Object.freeze({
	className: 'el-checkbox',
	isCheckbox: true,
});
const radioChange = (nextValue) => {
	value.value = nextValue;
	emit('radioChange', nextValue);
};
</script>
