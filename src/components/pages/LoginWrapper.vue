<template>
	<div class="login-page">
		<div class="bg top" />
		<div class="bg bottom" />

		<div
			class="wrapper wrapper-full-page inlineImg"
			:style="{ backgroundImage: `url(${backgroundImage})` }"
		>
			<div class="logo">
				<div class="logo-img">
					<img :src="logoImage" alt="logo" />
				</div>
				<div class="description">
					<div class="title common-title semi-bold">
						Sign In To Industrial Matrix
					</div>
					<div class="sub-description">
						Enter your details to login to your account:
					</div>
				</div>
			</div>

			<div class="login-content">
				<div class="card">
					<router-view v-slot="{ Component }">
						<transition name="standard-fade" mode="out-in">
							<component :is="Component" />
						</transition>
					</router-view>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import backgroundImage from '@/assets/img/background/background_login.png';
import logoImage from '@/assets/img/top-logo-white.png';

const authStore = useAuthStore();

onMounted(() => {
	// Reset first_loading_app and preventRequests flags on login page
	authStore.set_value('first_loading_app', false);
	authStore.set_value('preventRequests', false);
});
</script>
