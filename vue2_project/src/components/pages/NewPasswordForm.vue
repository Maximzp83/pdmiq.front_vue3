<template>
	<div>
		<div class="card-header filled">
			<h2 class="tilte page-title text-center bold">{{
				tt('phrases.enter_your_password')
			}}</h2>
		</div>

		<div class="card-content">
			<el-form 
				class="standard-form relative"
				:model="formData"
			>
				<SimpleSpinner :active="isLoading"/>

				<div class="form-row">
					<PasswordCheckList
						:show="showPassTooltip"
						:password="formData.password"
						:equalsToAccountName="equalsToAccountName"
					>
						<el-input
							@focus="showPassTooltip = true"
							@blur="showPassTooltip = false"
							v-model="formData.password"
							placeholder="password"
							type="password"
							show-password
							name="new-password" autocomplete="new-password"
						>
							<i slot="prefix" class="icomoon icon-lock" />
						</el-input>
					</PasswordCheckList>
				</div>

				<div class="form-row">
					<el-input
						v-model="formData.password_confirmation"
						placeholder="repeat password"
						type="password"
						show-password
					>
						<i slot="prefix" class="icomoon icon-lock" />
					</el-input>
				</div>

				<div class="submit-button-container text-center">
					<el-button
						type="primary"
						@click="handleSubmit"
						:loading="isLoading"
						class="semi-bold mcol-xs-12"
					>Send
					</el-button>
				</div>
			</el-form>
		</div>		
	</div>
</template>

<script>
import { isPasswordStrong } from '@/helpers/specialHelpers';
import { getParamsFromUrl } from '@/services/api/api_helpers';

export default {
	components: {
		PasswordCheckList: () => import('./PasswordCheckList.vue')
	},

	data() {
		return {
			isLoading: false,
			showPassTooltip: false,
			email: '',

			formData: {
				token: '',
				password: '',
				password_confirmation: ''					
			}
		};
	},

	computed: {
		equalsToAccountName() {
			return this.email === this.formData.password;
		},		
	},

	methods: {
		handleSubmit() {
			let data = { ...this.formData };
			data.password = data.password.trim();
			data.password_confirmation = data.password_confirmation.trim();

			if (isPasswordStrong(data.password).isStrong && !this.equalsToAccountName) {
				if (data.password === data.password_confirmation) {
					// console.log(data)
					this.$store.dispatch('auth/password_reset', { data }).then(() => {
						this.$router.push('/login');
					});
				} else {
					this.$notify({
						type: 'warning',
						title: this.$t('Warning'),
						message: this.$t(`aliases.passwords_compar_error`),
						duration: 0
					});
					return false;
				}
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('Warning'),
					message: this.$t(`aliases.password_validation`),
					duration: 0
				});
				return false;
			}
			// console.log(data)
		},

		checkToken({token, email}) {
			const data = { token };
			this.isLoading = true;
			this.$store.dispatch('auth/check_password_token', { data }).then(() => {
				this.formData.token = token;
				this.email = email;
				this.isLoading = false;				
			}).catch((error) => {
				this.isLoading = false;				

				if (error.response.status === 422) {
					this.$notify({
						type: 'warning',
						title: this.$t('Warning'),
						message: this.$t(`aliases.creation_link_exp`),
						dangerouslyUseHTMLString: true,
						duration: 0
					});
					this.$router.push('/login/password/forgot');					
				}
			});
		}


	},

	created() {
		const { email } = getParamsFromUrl(this.$route.fullPath);
		const { token } = this.$route.params;
		// console.log('token', token)
		if (token) {
			this.checkToken({token, email})
		}	
	}
};
</script>
