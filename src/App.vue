<script setup>
import { /*RouterLink,*/ RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
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
