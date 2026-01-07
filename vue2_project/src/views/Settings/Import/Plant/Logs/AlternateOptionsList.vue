<template>
	<div class="card">
		<div class="card-header filled bold flex relative">
			<span>Values</span>
			<button
				v-if="showClose"
				class="ml-auto popupCloseButton"
				type="button"
				@click="closeDialog"
			>
				<i class="icomoon icon-plus"></i>
			</button>
		</div>
		<div class="card-content">
			<RadioButtonsBlock
				@onChange="radioChange"
				:value="value"
				:settings="radioOptions"
				:optionsList="options"
			/>
		</div>
	</div>
</template>

<script>
export default {
	components: {
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue')
	},
	props: {
		showClose: Boolean,
		options: Array
	},

	data() {
		return {
			value: null
		};
	},

	computed: {
		radioOptions: () =>
			Object.freeze({
				className: 'el-checkbox',
				isCheckbox: true
				// hideLabel: true
			})
	},

	methods: {
		radioChange(value) {
			this.value = value;
			this.$emit('radioChange', value);
		},
		closeDialog() {
			this.$emit('closeDialog');
		}
	}
};
</script>
