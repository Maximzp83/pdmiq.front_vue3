<template>
	<div class="el-form-item">
		<div class="mcol-xs-6" v-show="!isPhoneVerified && !verificationCodeReceived">
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
						@click="confirmPhone"
						:loading="verificationCodeSending"
						type="primary"
						native-type="button"
						class="item-action-button small"
					>
						<span>{{ tt('phrases.confirm_phone_number') }}</span>
					</el-button>
				</div>
			</div>
		</div>

		<div v-show="!isPhoneVerified && (verificationCodeReceived && !verificationCodeValid)">
			<div class="flex mrow">
				<div class="mcol-xs-4">
					<CustomInput
						class="mini"
						v-model="verification_code"
						:placeholder="`${tt('input')} ${tt('code')}`"
					/>
				</div>
				
				<div class="mcol-xs-8">
					<el-button
						@click="checkReceivedCode"
						:loading="verificationCodeSending"
						type="primary"
						native-type="button"
						class="item-action-button small capitalize"
					>
						<span>{{ tt('phrases.check_code') }}</span>
					</el-button>

					<el-button
						@click="confirmPhone"
						type="primary"
						native-type="button"
						class="item-action-button small capitalize"
					>
						<span>{{ tt('phrases.resend_code') }}</span>
					</el-button>
				</div>
			</div>
		</div>

		<div v-show="isPhoneVerified && verificationCodeValid" class="semi-bold">{{ tt('aliases.verification_ok') }}</div>
	</div>
</template>

<script>

import { mapActions } from 'vuex';

export default {
	props: {
		phone_number: {
			type: String,
			default: ''
		},
		isPhoneVerified: Boolean
	},

	data() {
		return {
			verificationCodeReceived: false,
			verificationCodeSending: false,
			verificationCodeValid: false,

			verification_code: ''
		};
	},

	computed: {
	},

	methods: {
		...mapActions({
			get_phone_number_verification_code: 'users/get_phone_number_verification_code',
			verify_phone_number_code: 'users/verify_phone_number_code',
		}),

		confirmPhone() {
			if (this.phone_number) {
				const payload = {
					data: {	phone_number: this.phone_number }
				}

				this.verificationCodeSending = true;
				this.get_phone_number_verification_code(payload).then(({value}) => {
					if (value) {
						const { status } = value.data;
						// this.mfa_phone = '';
						this.verificationCodeSending = false;
						if (status == 'ok') {
							this.verificationCodeReceived = true;
						}
					}
				}).catch(() => {
					this.verificationCodeSending = false;
				})
			} else {
				this.$notify({
					type: 'warning',
					message: this.$t(`phrases.phone_is_required`),
				});
				return false;
			}
		},

		checkReceivedCode() {
			const payload = {
				data: {	code: this.verification_code }
			}
			this.verificationCodeSending = true;

			this.verify_phone_number_code(payload).then(({value}) => {
				if (value) {
					const { status } = value.data;
					// console.log(value)
					this.verificationCodeSending = false;
					if (status == 'ok') {
						this.verificationCodeValid = true;
						this.$emit('phoneVerified', true);
					}
				}
			}).catch(() => {
				this.verificationCodeSending = false;
			})
		},
	},

	watch: {
		isPhoneVerified(/*verified*/) {
			// console.log('isPhoneVerified', verified)

			this.verificationCodeReceived = false;
			this.verificationCodeSending = false;
			this.verificationCodeValid = false;
		}
	}
};
</script>
