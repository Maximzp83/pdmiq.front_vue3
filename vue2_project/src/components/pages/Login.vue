<template>
	<div class="">
		<div
			:class="[
				'card-header filled',
				{ 'underline-tabs full-width': !hideTabsBar }
			]"
		>
			<TabsBar
				v-if="!hideTabsBar"
				@switchTab="switchTab"
				:activeTab="activeTab"
				:tabsList="tabsList"
				:buttonsType="'primary'"
			/>
			<!-- <h2 v-else class="tilte page-title text-center bold">Login</h2> -->
			<h2 class="tilte page-title text-center bold">{{ pageTitle	}}</h2>
		</div>

		<div
			v-if="activeTab.prop == tabsList[0].prop"
			:key="tabsList[0].prop"
			class="tab-container card-content"
		>
			<div class="standard-form">
				<div class="form-row" v-show="!isVerification">
					<el-input type="email" v-model="formData.email" placeholder="email">
						<i slot="prefix" class="icomoon icon-envelope" />
					</el-input>
				</div>

				<div class="form-row" v-show="!isVerification">
					<el-input
						v-model="formData.password"
						placeholder="password"
						type="password"
						show-password
					>
						<i slot="prefix" class="icomoon icon-lock" />
					</el-input>
				</div>

				<div class="form-row" v-show="isVerification">
					<el-input type="text" v-model="formData.verification_code" placeholder="code">
						<i slot="prefix" class="icomoon icon-envelope" />
					</el-input>
				</div>

				<div class="form-row" v-show="isVerification">
					<el-checkbox
						v-model="formData.is_mfa_muted"
						:true-label="1"
						:false-label="0"
						>{{ tt('aliases.skip_mfa_check') }}</el-checkbox
					>
				</div>

				<!-- <p-checkbox v-model="form.rememberMe">
						Subscribe to newsletter
						remember me
					</p-checkbox> -->

				<div class="form-row text-center" v-show="!isVerification">
					<router-link
						to="/login/password/forgot"
						class="secondary-color semi-bold"
					>
						{{tt('phrases.forgot_password')}}?
					</router-link>
				</div>

				<div class="section-row submit-button-container text-center">
					<el-button
						type="primary"
						native-type="button"
						@click="handleSubmit"
						:loading="isLoading"
						class="semi-bold  mcol-xs-12"
					>{{ isVerification ? 'Send' : 'Sign In'}}
					</el-button>
				</div>

				<div class="section-row divider" v-show="!isVerification">
				  <span>or</span>
				</div>

				<div class="section-row social-login" v-show="!isVerification">
				  <!-- <el-button class="social-button google"
				  	@click="handleGoogle"
				  >
				    <div class="button-content">
				    	<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google icon">
				    	<span>Continue with Google</span>				    	
				    </div>
				  </el-button> -->

				  <a class="social-button google el-button"
					  :href="googleAuthUrl"
					 >
					  <div class="button-content">
					  	<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google icon">
					  	<span>Continue with Google</span>
					  </div>
					</a>

				  <a class="social-button google el-button"
						:href="microsoftAuthUrl"
					>
					  <div class="button-content">
					  	<img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Google icon">
					  	<span>Continue with Microsoft</span>
					  </div>
					</a>

				  <!-- <a class="social-button facebook el-button"
				  	href="https://api.testmatrix.assetmatrix.com/api/auth/facebook/redirect"
				  >
				    <div class="button-content">
				    	<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="Facebook icon">
				    	<span>Continue with Facebook</span>
				    </div>
				  </a> -->

				  <!-- <el-button class="social-button facebook"
				  	@click="handleFacebook"
				  	:loading="isProcessing"
				  >
				    <div class="button-content">
				    	<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="Facebook icon">
				    	<span>Continue with Facebook</span>				    	
				    </div>
				  </el-button> -->
				</div>
			</div>
		</div>
		<!-- <div class="card-header">
			<h2 class="tilte page-title text-center bold">SSO</h2>
		</div> -->
		<div
			v-if="activeTab.prop == tabsList[1].prop"
			:key="tabsList[1].prop"
			class="tab-container card-content wrapperBlock"
		>
			<a
				class="sso-button el-button el-button--secondary inverted"
				:href="ssoLink"
			>
				<img :src="azure_logo" alt="Azure" />
			</a>
		</div>
	</div>
</template>

<script>
// import { logoSrc } from '@/constants/global';
import { getParamsFromUrl } from '@/services/api/api_helpers';
import { getYmdDateString } from '@/helpers';
const azure_logo = require('@/assets/img/azure.svg');
import { tabsMixin } from '@/mixins';

export default {
	mixins: [tabsMixin()],

	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue')
	},

	data() {
		return {
			alternateForm: false,
			isProcessing: false,
			isVerification: false,

			formData: {
				email: process.env.NODE_ENV === 'development' ? 'maximzp83@gmail.com' : '',
				password: process.env.NODE_ENV === 'development' ? '7577c5fb4bc7D&dc5382' : '',
				verification_code: '',
				is_mfa_muted: 0
			}
		};
	},

	computed: {
		pageTitle() {
			return this.isVerification ? this.tt('phrases.Enter_MFA_Code') : 'Login';
		},
		hideTabsBar() {
			return this.$route.path !== '/kruger';
		},

		isLoading() {
			return this.$store.state.auth.isLoading;
		},

		azure_logo: () => azure_logo,

		authApiUrl() {
			if (process.env.VUE_APP_API_URL) {
				return `${process.env.VUE_APP_API_URL}`;
			}

			if (window.location.origin === 'https://app.industrialmatrix.com') {
				return 'https://api.pdmmatrix.assetmatrix.com/api';
			} 

			return 'https://api.testmatrix.assetmatrix.com/api';
		},

		googleAuthUrl() {
			return `${this.authApiUrl}/auth/google/redirect`;			
		},

		microsoftAuthUrl() {
			return `${this.authApiUrl}/auth/microsoft/redirect`;			
		},

		ssoLink() {
			if (window.location.origin === 'https://testmatrix.assetmatrix.com') {
				return 'https://api.testmatrix.assetmatrix.com/api/saml2/eeb51ba5-9f56-4ff2-9c46-2ea7e23b40b5/login';
			} else if (window.location.origin === 'https://app.industrialmatrix.com') {
				return 'https://api.pdmmatrix.assetmatrix.com/api/saml2/6eebf9df-d90c-460a-9a4c-5cdc3e36bb38/login';
			}

			return '';
		},

		tabsList: () =>
			Object.freeze([
				{ title: 'E-mail', prop: 'emailTab' },
				{ title: 'SSO', prop: 'ssoTab' }
			])

		/*logoSrc() {
			return logoSrc;
		}*/
	},

	methods: {
		handleSubmit() {
			let data = { ...this.formData };

			if (this.alternateForm) {
				data._secret_key = data.password;
				delete data.password;
			}

			if (!this.isVerification) {
				delete data.verification_code;
				delete data.is_mfa_muted;
			}
			// console.log(data)
			// this.isLoading = true;
			this.$store.dispatch('auth/sign_in', { data }).then(responseData => {
				// console.log(responseData)
				const { /*user,*/ access_token, status } = responseData.data;
				if (status && status == 'verification') { 
					this.isVerification = true;
				} else if (access_token) {
					this.$store.dispatch('auth/set_access_token', access_token);
					this.isVerification = false;
					this.$router.push('/');
				}
				// console.log(responseData.data.user)
			});
		},
	},

	/*created() {
		this.$store.dispatch('auth/set_data', {
			stateProp: 'first_loading_app',
			value: false
		});
	},*/

	beforeMount() {
		const { _secret } = getParamsFromUrl(this.$route.fullPath);

		if (
			_secret &&
			_secret ==
				getYmdDateString({
					dateObj: new Date(),
					withTime: true,
					format: 'lodash'
				})
		) {
			// if (true) {}
			this.alternateForm = true;
		}
		// console.log(_secret, this.alternateForm)
	}
};
</script>

<style lang="scss" scoped>
	.social-button {
		display: inline-block;
		width: 100%;
		background-color: #fff;
		border: 0;
		box-shadow: 0 6px 10px -4px rgba(0,0,0,.15);

		.button-content {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		& + .social-button {
			margin-left: 0;
			margin-top: 15px;
		}
		img {
			width: 18px;
			height: 18px;
			margin-right: 10px;
		}

		&.google {
		  color: black;
		  background-color: #ffffff;
		}

		&.google:hover {
		  background-color: #f5f5f5;
		}

		&.facebook:hover {
		  background-color: #145dbf !important;
		  // background-color: #1877f2;
		  color: white;
		}
	}

	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 20px 0;

		&:before,
		&:after {
			content: '';
			flex: 1;
			border-bottom: 1px solid #ccc;
		}

		span {
		  margin: 0 10px;
		  color: #666;
		  font-size: 12px;
		  font-weight: 500;
		}
	}
	 
</style>
