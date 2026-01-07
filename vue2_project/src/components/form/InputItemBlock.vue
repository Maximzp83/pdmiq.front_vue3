<template>
	<div class="input-item-block">
		<el-input v-model="value" />
	</div>
</template>

<script>
export default {
	props: {
		options: {
			type: Object,
			default: () => ({})
		},
		additional_payload: {
			type: Object,
			default: () => ({})
		}
	},

	data() {
		return {
			value: ''
		};
	},

	methods: {
		cleanBlock() {
			this.value = '';
		},

		validateBlock() {
			try {
				let payload = { isValid: null, data: {} };
				const { validate, addToPayload } = this.options;

				if (addToPayload) {
					payload.additional_payload = { ...this.additional_payload };
				}

				if (validate) {
					payload.isValid = this.value ? true : false;
				} else {
					payload.isValid = true;
				}

				payload.data.value = this.value;
				// console.log(payload)
				this.$emit('blockReady', payload);
			} catch (e) {
				console.warn(e);
			}
		}
	}
};
</script>
