<template>
	<div
		class="edit-form-container user-api-credential-form"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>

			<el-form-item prop="name" :label="tt('Name')" required>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<div v-if="generatedCredential" class="generated-credential-block">
				<el-form-item label="API Key">
					<div class="api-credential-value-row">
						<span class="api-credential-value">{{
							generatedCredential.api_key
						}}</span>
						<i
							class="icomoon icon-copy api-credential-copy"
							@click="copyToClipboard(generatedCredential.api_key)"
						></i>
					</div>
				</el-form-item>

				<el-form-item label="API Secret">
					<div class="api-credential-value-row">
						<span class="api-credential-value">{{
							generatedCredential.api_secret
						}}</span>
						<i
							class="icomoon icon-copy api-credential-copy"
							@click="copyToClipboard(generatedCredential.api_secret)"
						></i>
					</div>
				</el-form-item>

				<div class="el-form-item">
					<div class="warning-block el-form-item__content flex align-center">
						<i class="icomoon icon-warning warning-color section-title span-block"></i>
						<span class="span-block primary-color">{{
							tt('aliases.api_secret_warn')
						}}</span>
					</div>
				</div>
			</div>

			<div class="el-form-item flex justify-end">
				<el-button
					v-if="generatedCredential"
					@click="show_edit_modal({ show: false })"
					type="primary"
					native-type="button"
					class="el-form-item item-action-button"
				>
					<span class="uppercase">ok</span>
				</el-button>

				<el-button
					v-else
					@click="validateForm"
					type="primary"
					native-type="button"
					class="el-form-item item-action-button"
				>
					<span class="uppercase">{{ tt('save') }}</span>
				</el-button>
			</div>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';
import { copyToClipboard } from '@/helpers/specialHelpers';

export default {
	mixins: [itemFormMixin()],

	data() {
		return {
			formData: {
				name: ''
			},
			generatedCredential: null,
			rules: {
				name: required
			}
		};
	},

	computed: {
		initialFormData() {
			return Object.freeze({
				name: ''
			});
		}
	},

	methods: {
		...mapActions({
			save_item: 'users/create_client_api_credential'
		}),

		copyToClipboard,

		successSubmitCallback(answer) {
			this.generatedCredential = answer && answer.data ? answer.data.data : null;
		}
	}
};
</script>

<style lang="scss" scoped>
.generated-credential-block {
	padding-top: 10px;

	.warning-block {
		margin-left: 150px;	
	}
}

.api-credential-value-row {
	display: flex;
	align-items: center;
	gap: 12px;
	line-height: 20px;
	min-height: 40px;
}

.api-credential-value {
	word-break: break-all;
}

.api-credential-copy {
	cursor: pointer;
	font-size: 16px;
}
</style>
