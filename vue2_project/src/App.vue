<template>
	<!-- :class="{ 'nav-open': $sidebar.showSidebar }" -->
	<div class="main-wrapper">
		<!-- <router-view name="header"></router-view> -->

		<transition name="fade" mode="out-in">
			<router-view/>
		</transition>

		<!-- <side-bar type="sidebar" :sidebar-links="$sidebar.sidebarLinks" /> -->
		<!-- <router-view name="footer"></router-view> -->
	</div>

	<!-- <div id="nav">
		<router-link to="/">Home</router-link> |
		<router-link to="/about">About</router-link>
	</div> -->

	<!-- <router-view /> -->
</template>

<script>
// import { mapState } from 'vuex';

export default {
	/*computed: {
		...mapState({
			DashboardLayoutComponentKey: state => state.global.DashboardLayoutComponentKey,
		})
	},*/

	mounted() {
		if (!this.$Lang.currentLangId) {
			this.$Lang.set(1);
		}
		if (window.location.origin === 'https://app.industrialmatrix.com') {
			// if (process.env.NODE_ENV !== 'development') {
			let videoScript = document.createElement('script');
			videoScript.setAttribute('type', 'text/javascript');
			videoScript.setAttribute('src', '/static/screenvideorecord.js');
			// console.log(process.env.NODE_ENV, videoScript)
			document.head.appendChild(videoScript);
			// }
		}
	}
};
</script>
