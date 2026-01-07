<template>
	<div :class="['section-row', routeMeta.containerClassName]">
		<!-- showRevert -->
		<!-- revertAction="plant_revert" -->
		<!-- afterImportRedirectTo="/plant-import" -->
		<ImportContainer
			enableProgressbar
			uploadSubmitActionProp="upload_motorIQ"
			componentPath="views/Settings/Import/Plant/ImportOptionsContainer"
		/>
	</div>
</template>

<script>
export default {
	components: {
		// ImportForm: () => import('@/components/Import/ImportForm.vue')
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
