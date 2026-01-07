<template>
	<div class="remote-login-page">
		<VueElementLoading
			:active="true"
			:text="`${tt('Authorization')}...`"
			:is-full-screen="true"
		/>
	</div>
</template>

<script>
import { getParamsFromUrl } from '@/services/api/api_helpers';

export default {
	methods: {
		signIn(token) {
			this.$store.dispatch('auth/get_auth_user', token).then(() => {
				// this.isAuthChecking = false;
				this.$router.push('/dashboard');
			});
		}
	},

	mounted() {
		// console.log('RemoteLogin.vue');
		// const currentPath = this.$router.currentRoute.fullPath + '?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9wZG1pcS5iYWNrLmxvYzo4MDg5XC9hcGlcL2F1dGhcL2xvZ2luIiwiaWF0IjoxNTg4MjQyNzY1LCJleHAiOjE1ODgyNDYzNjUsIm5iZiI6MTU4ODI0Mjc2NSwianRpIjoiUW9aYWxTaUk1S05sZHVtTCIsInN1YiI6MSwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.wIgju_wRUG8hhoWFxglm5lPIHWWocYoO29GXTC87cVU';
		const url = this.$router.currentRoute.fullPath;
		const { token } = getParamsFromUrl(url);

		// console.log(token)
		this.signIn(token);

		this.$store.dispatch('auth/set_data', {
			stateProp: 'first_loading_app',
			value: false
		});
	}
};
</script>
