<template>
	<div class="remote-login-page">
		<VueElementLoading
			:active="true"
			:text="`${tt('Authorization')}...`"
			:is-full-screen="true"
		/>
	</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import VueElementLoading from '@/components/common/VueElementLoading.vue';
import { Lang } from '@/localization';
import { getParamsFromUrl } from '@/utils/url-helpers';
import { useAuthStore } from '@/stores/AuthStore';

const { tt } = Lang;

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const signIn = (token) => {
	if (!token) {
		router.push('/');
		return;
	}

	authStore
		.get_auth_user(token)
		.then(() => {
			router.push('/dashboard');
		})
		.catch(() => {
			router.push('/');
		});
};

onMounted(() => {
	const url = route.fullPath;
	const { token } = getParamsFromUrl(url);

	signIn(token);
	authStore.set_value('first_loading_app', false);
});
</script>
