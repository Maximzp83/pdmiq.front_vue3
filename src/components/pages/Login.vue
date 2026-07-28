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
			<h2 class="tilte page-title text-center bold">{{ pageTitle }}</h2>
		</div>

		<div
			v-if="activeTab.prop == tabsList[0].prop"
			:key="tabsList[0].prop"
			class="tab-container card-content"
		>
			<div class="standard-form">
				<div class="form-row" v-show="!isVerification">
					<el-input type="email" v-model="formData.email" placeholder="email">
						<template #prefix>
							<i class="icomoon icon-envelope" />
						</template>
					</el-input>
				</div>

				<div class="form-row" v-show="!isVerification">
					<el-input
						v-model="formData.password"
						placeholder="password"
						type="password"
						show-password
					>
						<template #prefix>
							<i class="icomoon icon-lock" />
						</template>
					</el-input>
				</div>

				<div class="form-row" v-show="isVerification">
					<el-input type="text" v-model="formData.verification_code" placeholder="code">
						<template #prefix>
							<i class="icomoon icon-envelope" />
						</template>
					</el-input>
				</div>

				<div class="form-row" v-show="isVerification">
					<el-checkbox v-model="formData.is_mfa_muted">
						{{ tt('aliases.skip_mfa_check') }}
					</el-checkbox>
				</div>

				<div class="form-row text-center" v-show="!isVerification">
					<router-link
						to="/login/password/forgot"
						class="secondary-color semi-bold"
					>
						{{ tt('phrases.forgot_password') }}?
					</router-link>
				</div>

				<div class="section-row submit-button-container text-center">
					<el-button
						type="primary"
						native-type="button"
						@click="handleSubmit"
						:loading="isLoading"
						class="semi-bold mcol-xs-12"
					>
						{{ isVerification ? 'Send' : 'Sign In' }}
					</el-button>
				</div>

				<div class="section-row divider" v-show="!isVerification">
					<span>or</span>
				</div>

				<div class="section-row social-login" v-show="!isVerification">
					<a class="social-button google el-button" :href="googleAuthUrl">
						<div class="button-content">
							<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google icon">
							<span>Continue with Google</span>
						</div>
					</a>

					<a class="social-button google el-button" :href="microsoftAuthUrl">
						<div class="button-content">
							<img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft icon">
							<span>Continue with Microsoft</span>
						</div>
					</a>
				</div>
			</div>
		</div>

		<div
			v-if="activeTab.prop == tabsList[1].prop"
			:key="tabsList[1].prop"
			class="tab-container card-content wrapperBlock"
		>
			<a
				class="sso-button el-button el-button--secondary inverted"
				:href="ssoLink"
			>
				<img :src="azureLogo" alt="Azure" />
			</a>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeMount, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/AuthStore';
import { getParamsFromUrl } from '@/utils/url-helpers';
import { getYmdDateString } from '@/helpers';
import { Lang } from '@/localization';
// import TabsBar from '@/components/common/TabsBar.vue';
import azureLogo from '@/assets/img/azure.svg';

const TabsBar = defineAsyncComponent(() =>
	import('@/components/common/TabsBar.vue')
);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const { tt } = Lang;

defineOptions({ name: 'LoginPage' });

// Data
const alternateForm = ref(false);
const isVerification = ref(false);
const activeTab = ref({});

const formData = reactive({
	email: import.meta.env.MODE === 'development' ? 'maximzp83@gmail.com' : '',
	password: import.meta.env.MODE === 'development' ? '7577c5fb4bc7D&dc5382' : '',
	verification_code: '',
	is_mfa_muted: 0
});

// Computed
const pageTitle = computed(() => isVerification.value ? tt('phrases.Enter_MFA_Code') : 'Login');

const hideTabsBar = computed(() => route.path !== '/kruger');

const isLoading = computed(() => authStore.isLoading);

const authApiUrl = computed(() => {
	if (import.meta.env.VITE_API_BASE_URL) {
		return `${import.meta.env.VITE_API_BASE_URL}`;
	}

	if (window.location.origin === 'https://app.industrialmatrix.com') {
		return 'https://api.industrialmatrix.tools/api';
	}

	return 'https://api.industrialmatrix-dev.tools/api';
});

const googleAuthUrl = computed(() => `${authApiUrl.value}/auth/google/redirect`);

const microsoftAuthUrl = computed(() => `${authApiUrl.value}/auth/microsoft/redirect`);

const ssoLink = computed(() => {
	if (window.location.origin === 'https://testmatrix.assetmatrix.com') {
		return 'https://api.testmatrix.assetmatrix.com/api/saml2/eeb51ba5-9f56-4ff2-9c46-2ea7e23b40b5/login';
	} else if (window.location.origin === 'https://app.industrialmatrix.com') {
		return 'https://api.pdmmatrix.assetmatrix.com/api/saml2/6eebf9df-d90c-460a-9a4c-5cdc3e36bb38/login';
	}

	return '';
});

const tabsList = Object.freeze([
	{ title: 'E-mail', prop: 'emailTab' },
	{ title: 'SSO', prop: 'ssoTab' }
]);

// Methods
const switchTab = (tab) => {
	activeTab.value = tab;
};

const handleSubmit = () => {
	let data = { ...formData };

	if (alternateForm.value) {
		data._secret_key = data.password;
		delete data.password;
	}

	if (!isVerification.value) {
		delete data.verification_code;
		delete data.is_mfa_muted;
	}

	authStore.sign_in(data)
		.then((responseData) => {
			const { access_token, status } = responseData;

			if (status && status == 'verification') {
				isVerification.value = true;
			} else if (access_token) {
				isVerification.value = false;
				router.push('/');
			}
		})
		.catch(() => {
			// Error handling is done in the store
		});
};

// Lifecycle
onBeforeMount(() => {
	// Initialize active tab
	if (hideTabsBar.value) {
		activeTab.value = activeTab.value.prop ? activeTab.value : tabsList[0];
	}

	// Check for alternate form secret
	const { _secret } = getParamsFromUrl(route.fullPath);

	if (
		_secret &&
		_secret ==
			getYmdDateString({
				dateObj: new Date(),
				withTime: true,
				format: 'lodash'
			})
	) {
		alternateForm.value = true;
	}
});
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
