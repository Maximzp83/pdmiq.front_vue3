<template>
	<div class="el-form-item">
		<div v-show="!isPhoneVerified && !verificationCodeReceived" class="mcol-xs-6">
			<div class="flex mrow">
				<div class="mcol-xs-4">
					<el-button
						type="primary"
						native-type="button"
						class="item-action-button small"
						:loading="verificationCodeSending"
						@click="confirmPhone"
					>
						<span>{{ tt('phrases.confirm_phone_number') }}</span>
					</el-button>
				</div>
			</div>
		</div>

		<div v-show="!isPhoneVerified && verificationCodeReceived && !verificationCodeValid">
			<div class="flex mrow">
				<div class="mcol-xs-4">
					<CustomInput
						v-model="verificationCode"
						class="mini"
						:placeholder="`${tt('input')} ${tt('code')}`"
					/>
				</div>

				<div class="mcol-xs-8">
					<el-button
						type="primary"
						native-type="button"
						class="item-action-button small capitalize"
						:loading="verificationCodeSending"
						@click="checkReceivedCode"
					>
						<span>{{ tt('phrases.check_code') }}</span>
					</el-button>

					<el-button
						type="primary"
						native-type="button"
						class="item-action-button small capitalize"
						@click="confirmPhone"
					>
						<span>{{ tt('phrases.resend_code') }}</span>
					</el-button>
				</div>
			</div>
		</div>

		<div v-show="isPhoneVerified && verificationCodeValid" class="semi-bold">
			{{ tt('aliases.verification_ok') }}
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useNotify } from '@/composables/useNotify';

const { tt } = Lang;
const { Notify } = useNotify();

defineOptions({
	name: 'UsersPhoneVerificationBlock',
});

const props = defineProps({
	phone_number: { type: String, default: '' },
	isPhoneVerified: Boolean,
});

const emit = defineEmits(['phoneVerified']);

const verificationCodeReceived = ref(false);
const verificationCodeSending = ref(false);
const verificationCodeValid = ref(false);
const verificationCode = ref('');

const confirmPhone = () => {
	if (!props.phone_number) {
		Notify({
			type: 'warning',
			message: tt('phrases.phone_is_required'),
		});
		return;
	}

	verificationCodeSending.value = true;
	api_request
		.post('/users/phone-number/code', {
			data: { phone_number: props.phone_number },
			resultMessage: tt('aliases.mfa_code_send_msg'),
			returnResponseOnly: true,
		})
		.then(({ value }) => {
			if (value?.data?.status === 'ok') {
				verificationCodeReceived.value = true;
			}
		})
		.finally(() => {
			verificationCodeSending.value = false;
		});
};

const checkReceivedCode = () => {
	verificationCodeSending.value = true;

	api_request
		.post('/users/phone-number/verify', {
			data: { code: verificationCode.value },
			resultMessage: tt('aliases.verification_ok'),
			returnResponseOnly: true,
		})
		.then(({ value }) => {
			if (value?.data?.status === 'ok') {
				verificationCodeValid.value = true;
				emit('phoneVerified', true);
			}
		})
		.finally(() => {
			verificationCodeSending.value = false;
		});
};

watch(
	() => props.isPhoneVerified,
	() => {
		verificationCodeReceived.value = false;
		verificationCodeSending.value = false;
		verificationCodeValid.value = false;
		verificationCode.value = '';
	},
);
</script>
