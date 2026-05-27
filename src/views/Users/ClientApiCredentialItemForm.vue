<template>
	<div
		:class="[
			'edit-form-container user-api-credential-form',
			{ 'half-width': !fromAnotherInstance && !isMobile },
		]"
	>
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="name" required>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<div v-if="generatedCredential" class="generated-credential-block">
				<el-form-item label="API Key">
					<div class="api-credential-value-row">
						<span class="api-credential-value">{{ generatedCredential.api_key }}</span>
						<i
							class="icomoon icon-copy api-credential-copy"
							@click="copyToClipboard(generatedCredential.api_key)"
						/>
					</div>
				</el-form-item>

				<el-form-item label="API Secret">
					<div class="api-credential-value-row">
						<span class="api-credential-value">{{ generatedCredential.api_secret }}</span>
						<i
							class="icomoon icon-copy api-credential-copy"
							@click="copyToClipboard(generatedCredential.api_secret)"
						/>
					</div>
				</el-form-item>

				<div class="el-form-item">
					<div class="warning-block el-form-item__content flex align-center">
						<i class="icomoon icon-warning warning-color section-title span-block" />
						<span class="span-block primary-color">{{ tt('aliases.api_secret_warn') }}</span>
					</div>
				</div>
			</div>

			<div class="el-form-item flex justify-end">
				<el-button
					v-if="generatedCredential"
					type="primary"
					native-type="button"
					class="el-form-item item-action-button"
					@click="closeModal"
				>
					<span class="uppercase">ok</span>
				</el-button>

				<el-button
					v-else
					type="primary"
					native-type="button"
					class="el-form-item item-action-button"
					@click="validateForm"
				>
					<span class="uppercase">{{ tt('save') }}</span>
				</el-button>
			</div>
		</el-form>
	</div>
</template>

<script setup>
import { ref } from 'vue';

import { api_request } from '@/api/request_provider';
import { required } from '@/constants/validation';
import { copyToClipboard } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useGlobalStore } from '@/stores/GlobalStore';

const { tt } = Lang;

defineOptions({
	name: 'UsersClientApiCredentialItemForm',
});

const props = defineProps(buildProps());

const globalStore = useGlobalStore();
const itemFormRef = ref(null);
const generatedCredential = ref(null);

const formData = ref({
	name: '',
});

const rules = {
	name: required,
};

const closeModal = () => {
	globalStore.show_edit_modal({ show: false });
};

const localSubmit = (preparedData) =>
	api_request
		.post('/client-api-credentials', {
			data: preparedData,
			notNotify: true,
		})
		.then((answer) => {
			generatedCredential.value = answer?.data?.data || null;
			return answer;
		});

const { isMobile, validateForm } = useItemForm({
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSubmit,
	ignoreLocalSubmit: false,
});

defineExpose({
	validateForm,
});
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
