<template>
	<div>
		<el-form-item :label="`MFA ${tt('type')}`" prop="mfa_type"
			required
		>
			<!-- <CustomSelect
				:disabled="disabled"
				:optionsLoading="mfaTypeSelectBusy"
				:optionsList="mfaTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
				:value="mfa_type"
				@change="handleMfaTypeChange"
			/> -->
			<SimpleSpinner :active="mfaTypeSelectBusy" />
			<el-select
				:disabled="disabled"
				@change="handleMfaTypeChange"
				:value="mfa_type"
				:placeholder="`${tt('Select')} ${tt('type')}`"
			>
				<el-option
					v-for="item in mfaTypesList"
					:disabled="item.id === MFA_TYPES.SMS && !isPhoneVerified"
					:key="'mfa_id-' + item.id"
					:label="item.name"
					:value="item.id"
				/>
			</el-select>
		</el-form-item>

		<div class="el-form-item"
			v-if="isPhoneVerified"
			v-show="mfa_type === MFA_TYPES.SMS"
		>
			<div class="mcol-xs-6" v-show="!mfaCodeReceived">
				<div class="flex mrow">
					<!-- <div class="mcol-xs-8">
						<CustomInput
							class="mini"
							v-model="mfa_phone"
							:placeholder="`${tt('input')} ${tt('phone')}`"
						/>
					</div> -->
					
					<div class="mcol-xs-4">
						<el-button
							:disabled="disabled"
							@click="sendMfaCode"
							:loading="mfaCodeSending"
							type="primary"
							native-type="button"
							class="item-action-button small"
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
							class="mini"
							v-model="mfa_code"
							:placeholder="`${tt('input')} ${tt('code')}`"
						/>
					</div>
					
					<div class="mcol-xs-8">
						<el-button
							@click="checkMfaCode"
							:loading="mfaCodeSending"
							type="primary"
							native-type="button"
							class="item-action-button small capitalize"
						>
							<span>{{ tt('phrases.check_code') }}</span>
						</el-button>

						<el-button
							@click="sendMfaCode"
							type="primary"
							native-type="button"
							class="item-action-button small capitalize"
						>
							<span>{{ tt('phrases.resend_code') }}</span>
						</el-button>
					</div>
				</div>
			</div>

			<div v-show="mfaCodeValid" class="semi-bold">{{ tt('aliases.verification_ok') }}</div>
		</div>
		
		<div class="el-form-item"
			v-show="mfa_type === MFA_TYPES.GOOGLE_AUTHENTICATOR"
		>
			<div class="" v-if="qrCode && !qrCodeValid">
				<div class="imgWrapper content-row">
					<img
						class="qr-code"
						:src="qrCode"
						alt="QR Code"
					/>
				</div>

				<div class="content-row">
					<div class="flex mrow">
						<div class="mcol-xs-4">
							<CustomInput
								class="mini"
								v-model="code_from_qr"
								:placeholder="`${tt('input')} ${tt('code')}`"
							/>
						</div>
						
						<div class="mcol-xs-8">
							<el-button
								@click="checkQrCode"
								type="primary"
								native-type="button"
								class="item-action-button small capitalize"
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

<script>

import { mapActions } from 'vuex';
import { MFA_TYPES, mfaTypesList } from '@/constants/global';

export default {
	props: {
		phone_number: {
			type: String,
			default: ''
		},
		value: null,
		disabled: Boolean,
		isPhoneVerified: Boolean
	},

	data() {
		return {
			mfaCodeSending: false,
			mfaCodeReceived: false,
			mfaCodeValid: false,
			mfaTypeSelectBusy: false,
			qrCodeReceived: false,
			qrCode: null,
			qrCodeValid: false,

			mfa_code: '',
			code_from_qr: '',
		};
	},

	computed: {
		mfaTypesList: () => Object.freeze(mfaTypesList()),
		MFA_TYPES: () => Object.freeze(MFA_TYPES),

		mfa_type: that => that.value,
	},

	methods: {
		...mapActions({
			send_mfa_code: 'auth/send_mfa_code',
			check_mfa_code: 'auth/check_mfa_code',
			resend_mfa_code: 'auth/resend_mfa_code',
			fetch_qr_code: 'auth/fetch_qr_code',
			check_qr_code: 'auth/check_qr_code'
		}),

		handleMfaTypeChange(type) {
			if (this.disabled) return;

			this.$emit('input', type);
			this.$emit('change', type);

			if (type === MFA_TYPES.GOOGLE_AUTHENTICATOR) {
				this.mfaTypeSelectBusy = true;
					// this.qrCodeReceived = true;
				this.fetch_qr_code().then(({value}) => {
					if (value) {
						const { status, qr_code_url } = value.data;
						// console.log(status, qr_code_url)
						if (status == 'ok') {
							this.qrCode = qr_code_url;
							this.mfaTypeSelectBusy = false;
						}
					}	
				})
			}
		},

		sendMfaCode() {
			if (this.disabled) return;

			// this.mfaCodeReceived = true;
			/*if (this.phone_number) {
				const payload = {
					data: {	phone_number: this.phone_number }
				}*/

				this.mfaCodeSending = true;
				this.send_mfa_code().then(({value}) => {
					if (value) {
						const { status } = value.data;
						// this.mfa_phone = '';
						this.mfaCodeSending = false;
						if (status == 'ok') {
							this.mfaCodeReceived = true;
						}
					}
				}).catch(() => {
					this.mfaCodeSending = false;
				})
			/*} else {
				this.$notify({
					type: 'warning',
					message: this.$t(`phrases.phone_is_required`),
				});
				return false;
			}*/
		},

		checkMfaCode() {
			if (this.disabled) return;

			const payload = {
				data: {	code: this.mfa_code }
			}
			this.mfaCodeSending = true;

			this.check_mfa_code(payload).then(({value}) => {
				if (value) {
					const { status } = value.data;
					// console.log(value)
					this.mfaCodeSending = false;
					if (status == 'ok') {
						this.mfaCodeValid = true;
					}
				}
			}).catch(() => {
				this.mfaCodeSending = false;
			})
		},
		checkQrCode() {
			if (this.disabled) return;

			const payload = {
				data: {	code: this.code_from_qr }
			}
			this.mfaCodeSending = true;

			this.check_qr_code(payload).then(({value}) => {
				if (value) {
					const { status } = value.data;
					// console.log(value)
					this.mfaCodeSending = false;
					if (status == 'ok') {
						this.code_from_qr = '';
						this.qrCodeValid = true;
					}
				}
			}).catch(() => {
				this.mfaCodeSending = false;
			})
		},

		handleInput(e) {
			if (this.disabled) return;
			
			this.$emit('input', e);
			this.$emit('change', e);
		},
	},
};
</script>
