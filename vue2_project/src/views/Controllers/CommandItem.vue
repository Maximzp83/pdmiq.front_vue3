<template>
	<div class="card relative">
		<SimpleSpinner :active="isProcessing" />

		<div class="card-header filled uppercase bold">{{ itemData.title }}</div>

		<div class="card-content moderate-paddings">
			<el-form-item
				:class="['content-row', { showJustInfo: isPreInstalled }]"
				:label="tt('Command')"
				prop="message_body"
			>
				<CustomInput
					v-model="message_body"
					:placeholder="`${tt('input')} ${tt('command')}`"
				/>
			</el-form-item>

			<div
				class="content-row showJustInfo"
				v-if="itemData.dxm_response !== undefined"
			>
				<div class="el-form-item__label">{{ tt('Response') }}</div>
				<div class="value-instead-input el-form-item__content bold">
					<div class="value" v-text="dxm_response"></div>
				</div>
			</div>

			<div class="content-row flex">
				<el-button
					@click="handleSend"
					type="primary"
					native-type="button"
					class="item-action-button mcol-xs-6"
				>
					<span class="uppercase">{{ tt('Send') }}</span>
				</el-button>

				<el-button
					class="item-action-button mcol-xs-6"
					v-if="!isPreInstalled"
					@click="handleClear"
					native-type="button"
				>
					<span class="uppercase">{{ tt('Clear') }}</span>
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
// import { dynamicItemFormMixin } from '@/mixins';

export default {
	// mixins: [dynamicItemFormMixin()],
	props: {
		isProcessing: Boolean,
		itemData: { type: Object, required: true }
	},

	data() {
		return {
			message_body: '',
			dxm_response: ''
		};
	},

	computed: {
		isPreInstalled: that => that.itemData.isPreInstalled
	},

	methods: {
		handleSend() {
			this.$emit('onSend', this.message_body);
		},

		handleClear() {
			this.message_body = '';
		}
	},

	watch: {
		'itemData.dxm_response'(dxm_response) {
			this.dxm_response = dxm_response;
		},

		'itemData.message_body'(message_body) {
			this.message_body = message_body;
		}
	},

	created() {
		this.message_body = this.itemData.message_body;
		this.dxm_response = this.itemData.dxm_response;
	}
};
</script>
