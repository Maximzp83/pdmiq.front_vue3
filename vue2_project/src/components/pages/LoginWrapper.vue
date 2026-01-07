<template>
	<div class="login-page">
		<div class="bg top" />
		<div class="bg bottom" />

		<div
			class="wrapper wrapper-full-page inlineImg"
			style="background-image: url(/static/img/background/background_login.png)"
		>
			<div class="logo">
				<!-- <div class="logo-normal">
					<div class="logo-text">
						<span class="">Industrial</span>
						<span class="">Matrix</span>
					</div>
				</div> -->
				<div class="logo-img">
					<img src="/static/img/top-logo-white.png" alt="logo" />
				</div>
				<div class="description">
					<div class="title common-title semi-bold">
						Sign In To Industrial Matrix
					</div>
					<div class="sub-description ">
						Enter your details to login to your account:
					</div>
				</div>
			</div>

			<div class="login-content">
				<div class="card">
					<transition name="standard-fade" mode="out-in">
						<router-view/>
						<!-- <LoginForm v-if="showSignInForm" @event="handleEventNew"/> -->
						<!-- <ForgotPasswordForm v-else-if="showForgotPasswordForm" @event="handleEventNew"/> -->
						<!-- <NewPasswordForm v-else-if="showNewPasswordForm" @event="handleEventNew"/> -->
						<!-- <MfaCheckForm v-else-if="showMfaCheckForm" @event="handleEventNew"/> -->
					</transition>
				</div>
			</div>

			<!-- <div class="full-page-background"></div> -->
		</div>
	</div>
</template>

<script>
// import { logoSrc } from '@/constants/global';
// import { getParamsFromUrl } from '@/services/api/api_helpers';
// import { getYmdDateString } from '@/helpers';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		// LoginForm: () => import('./Login.vue'),
		// ForgotPasswordForm: () => import('./ForgotPasswordForm.vue'),
		// NewPasswordForm: () => import('./NewPasswordForm.vue'),
		// MfaCheckForm: () => import('./MfaCheckForm.vue')
	},

	/*data() {
		return {
			showSignInForm: true,
			showForgotPasswordForm: false,
			showNewPasswordForm: false,
			showMfaCheckForm: false
		};
	},*/

	computed: {
		
		

		/*logoSrc() {
			return logoSrc;
		}*/
	},

	methods: {
		/*toggleForm(key) {
			this.showSignInForm = false;
			this.showForgotPasswordForm = false;
			this.showNewPasswordForm = false;
			this.showMfaCheckForm = false;

			this[key] = true;
		},*/

	},

	created() {
		this.$store.dispatch('auth/set_data', {
			stateProp: 'first_loading_app',
			value: false
		});
		this.$store.dispatch('auth/set_data', {
			stateProp: 'preventRequests',
			value: false
		});
	},

	beforeMount() {

	}
};
</script>
