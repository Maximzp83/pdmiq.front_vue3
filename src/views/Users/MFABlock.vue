<template>
	<div class="flex wrap align-center">
		<el-form-item :label="`MFA ${tt('type')}`" prop="mfa_type" required class="mcol-xs-12 content-row label-align-center">
			<SimpleSpinner :active="mfaTypeSelectBusy" />
			<el-select
				:model-value="modelValue"
				:disabled="disabled"
				:placeholder="`${tt('Select')} ${tt('type')}`"
				@change="handleMfaTypeChange"
			>
				<el-option
					v-for="item in translatedMfaTypesList"
					:key="`mfa_id-${item.id}`"
					:label="item.name"
					:value="item.id"
					:disabled="item.id === MFA_TYPES.SMS && !isPhoneVerified"
				/>
			</el-select>
		</el-form-item>

		<div v-if="isPhoneVerified" v-show="modelValue === MFA_TYPES.SMS" class="mcol-xs-12 content-row">
			<div v-show="!mfaCodeReceived" class="mcol-xs-6">
				<div class="flex mrow">
					<div class="mcol-xs-4">
						<el-button
							type="primary"
							native-type="button"
							class="item-action-button small"
							:disabled="disabled"
							:loading="mfaCodeSending"
							@click="sendMfaCode"
						>
							<span>{{ tt('phrases.send_code') }}</span>
						</el-button>
					</div>
				</div>
			</div>

			<div v-show="mfaCodeReceived && !mfaCodeValid">
				<div class="flex mrow">
					<div class="mcol-xs-4">
						<CustomInput
							v-model="mfaCode"
							class="mini"
							:placeholder="`${tt('input')} ${tt('code')}`"
						/>
					</div>

					<div class="mcol-xs-8">
						<el-button
							type="primary"
							native-type="button"
							class="item-action-button small capitalize"
							:loading="mfaCodeSending"
							@click="checkMfaCode"
						>
							<span>{{ tt('phrases.check_code') }}</span>
						</el-button>

						<el-button
							type="primary"
							native-type="button"
							class="item-action-button small capitalize"
							@click="sendMfaCode"
						>
							<span>{{ tt('phrases.resend_code') }}</span>
						</el-button>
					</div>
				</div>
			</div>

			<div v-show="mfaCodeValid" class="semi-bold">{{ tt('aliases.verification_ok') }}</div>
		</div>

		<div v-show="modelValue === MFA_TYPES.GOOGLE_AUTHENTICATOR" class="el-form-item">
			<div v-if="qrCode && !qrCodeValid">
				<div class="imgWrapper content-row">
					<img class="qr-code" :src="qrCode" alt="QR Code" />
				</div>

				<div class="content-row">
					<div class="flex mrow">
						<div class="mcol-xs-4">
							<CustomInput
								v-model="qrCodeInput"
								class="mini"
								:placeholder="`${tt('input')} ${tt('code')}`"
							/>
						</div>

						<div class="mcol-xs-8">
							<el-button
								type="primary"
								native-type="button"
								class="item-action-button small capitalize"
								@click="checkQrCode"
							>
								<span>{{ tt('phrases.check_code') }}</span>
							</el-button>
						</div>
					</div>
				</div>
			</div>

			<div v-else-if="qrCodeValid" class="semi-bold">{{ tt('aliases.verification_ok') }}</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { MFA_TYPES, mfaTypesList } from '@/constants/global';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'UsersMFABlock',
});

const props = defineProps({
	modelValue: null,
	phone_number: { type: String, default: '' },
	disabled: Boolean,
	isPhoneVerified: Boolean,
});

const emit = defineEmits(['update:modelValue', 'input', 'change']);

const authStore = useAuthStore();

const mfaCodeSending = ref(false);
const mfaCodeReceived = ref(false);
const mfaCodeValid = ref(false);
const mfaTypeSelectBusy = ref(false);
const qrCode = ref(null);
const qrCodeValid = ref(false);
const mfaCode = ref('');
const qrCodeInput = ref('');

const translatedMfaTypesList = computed(() => translate(mfaTypesList()));

const updateValue = (value) => {
	emit('update:modelValue', value);
	emit('input', value);
	emit('change', value);
};

const resetSmsState = () => {
	mfaCodeReceived.value = false;
	mfaCodeValid.value = false;
	mfaCode.value = '';
};

const resetQrState = () => {
	qrCode.value = null;
	qrCodeValid.value = false;
	qrCodeInput.value = '';
};

const handleMfaTypeChange = (type) => {
	if (props.disabled) return;

	updateValue(type);
	resetSmsState();
	resetQrState();
	if (type === MFA_TYPES.GOOGLE_AUTHENTICATOR) {
		mfaTypeSelectBusy.value = true;
		authStore
			.fetchQrCode()
			.then(({ value }) => {
				if (value?.status === 'ok') {
					qrCode.value = value.qr_code_url;
				}
			})
			.finally(() => {
				mfaTypeSelectBusy.value = false;
			});
	}
};

const sendMfaCode = () => {
	if (props.disabled) return;

	mfaCodeSending.value = true;
	authStore
		.sendMfaCode()
		.then(({ value }) => {
			if (value?.status === 'ok') {
				mfaCodeReceived.value = true;
			}
		})
		.finally(() => {
			mfaCodeSending.value = false;
		});
};

const checkMfaCode = () => {
	if (props.disabled) return;

	mfaCodeSending.value = true;
	authStore
		.checkMfaCode({ code: mfaCode.value })
		.then(({ value }) => {
			if (value?.status === 'ok') {
				mfaCodeValid.value = true;
			}
		})
		.finally(() => {
			mfaCodeSending.value = false;
		});
};

const checkQrCode = () => {
	if (props.disabled) return;

	authStore.checkQrCode({ code: qrCodeInput.value }).then(({ value }) => {
		if (value?.status === 'ok') {
			qrCodeValid.value = true;
		}
	});
};

watch(
	() => props.isPhoneVerified,
	(isVerified) => {
		if (!isVerified && props.modelValue === MFA_TYPES.SMS) {
			updateValue(null);
			resetSmsState();
		}
	},
);
</script>
