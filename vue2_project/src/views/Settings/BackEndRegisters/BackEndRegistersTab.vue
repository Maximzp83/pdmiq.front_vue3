<template>
	<div class="section-row">
		<div class="content-row card view-content-card">
			<!-- <div class="card-header">
				<el-button
					@click="handleSaveRegister"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span>Save {{ itemsName.one }}</span>
				</el-button>
			</div> -->

			<div class="card-content">
				<ItemForm ref="ItemForm" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	computed: {
		itemsName: that => ({
			one: that.$t('Back-End Register'),
			mult: that.$t('Back-End Registers')
		})
	}
};
</script>
