<template>
	<div class="section-row">
		<div class="content-row card view-content-card">
			<div class="card-header">
				<el-button
					@click="handleSaveEmails"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span>Save {{ itemsName.mult }}</span>
					<!-- <i class="icomoon icon-plus"></i> -->
				</el-button>
			</div>
			<div class="card-content">
				<FormulasForm ref="FormulasForm" />
			</div>
		</div>
	</div>
</template>

<script>
// import { mapState, mapActions } from 'vuex';
// import { itemPageMixin } from '@/mixins';

export default {
	// mixins: [itemPageMixin],
	components: {
		FormulasForm: () => import('./FormulasForm.vue')
	},

	computed: {
		/*navbarSettings: () => ({
			showFilter: true,
			showSaveButton: true,
			pageTitle: 'Settings'
			// showCleanButton: true
		}),*/
		itemsName: that => ({
			one: that.$t('Custom_formula'),
			mult: that.$t('Custom_formulas')
		})
	},

	methods: {
		handleSaveEmails() {
			if (this.$refs['FormulasForm'].handleSubmit) {
				this.$refs['FormulasForm'].handleSubmit();
			}
		}
	}
};
</script>
