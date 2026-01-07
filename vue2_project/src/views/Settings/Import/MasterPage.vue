<template>
	<div :class="['section-row', routeMeta.containerClassName]">
		<ImportContainer
			uploadSubmitActionProp="upload_masterDB"
			componentPath="views/Settings/Import/ImportOptionsContainer"
		/>
		<!-- submitActionProp="maintenance_work_order_import"						 -->
	</div>
</template>

<script>
export default {
	name: 'SettingsImportPage',

	components: {
		ImportContainer: () => import('@/components/Import/ImportContainer.vue')
	},

	computed: {
		routeMeta() {
			return this.$route.meta;
		}
	},

	methods: {
		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		}
	},

	beforeMount() {
		if (this.routeMeta && this.routeMeta.navbarSettings) {
			this.setup_navbar(this.routeMeta.navbarSettings);
		}
	},

	beforeDestroy() {
		this.setup_navbar({});
	}
};
</script>
