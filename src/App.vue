<script setup>
import { onBeforeMount } from 'vue';
import { Lang } from '@/localization';

import { /*RouterLink,*/ RouterView } from 'vue-router';

	onBeforeMount(() => {
		if (!Lang.currentLangId) {
			Lang.set(1);
		}
		/*if (window.location.origin === 'https://app.industrialmatrix.com') {
			// if (process.env.NODE_ENV !== 'development') {
			let videoScript = document.createElement('script');
			videoScript.setAttribute('type', 'text/javascript');
			videoScript.setAttribute('src', '/static/screenvideorecord.js');
			// console.log(process.env.NODE_ENV, videoScript)
			document.head.appendChild(videoScript);
			// }
		}*/
	})
</script>

<template>
	<div class="main-wrapper">
		<router-view v-slot="{ Component }">
			<transition name="fade" mode="out-in">
		    <component :is="Component" />
		  </transition>
		</router-view>
	</div>
</template>
