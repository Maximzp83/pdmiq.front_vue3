<template>
	<div class="nested-view-content-wrapper ">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div class="logs-page-container">
			<!-- <div class="mcontainer"> -->
			<!-- <h1 class="title page-title">{{ pageTitle }}</h1> -->
			<div class="view-content-card card overflowHidden">
				<div class="card-header filled">
					<div class="article-title semi-bold">Errors</div>
					<div class="closeButton-container ml-auto">
						<el-button
							@click="changeRoute({ path: `/settings/import/history` })"
							class="closeButton"
							native-type="button"
							icon="icomoon icon-cross"
						/>
					</div>
				</div>

				<div class="card-content" v-if="loadContent">
					<div class="info-list">
						<div class="info-item" v-if="isErrorsTable">
							<div class="index semi-bold">Row</div>
							<div class="text  semi-bold">Issue</div>
						</div>
						<div class="info-item" v-else>
							<div class="index semi-bold">Brand model name</div>
							<div class="text  semi-bold">Count</div>
						</div>

						<div
							class="info-item"
							v-for="error in itemData.items"
							:key="`error-${error.id}`"
						>
							<div
								class="index"
								v-text="isErrorsTable ? error.row_number : error.brand_model_name"
							></div>
							<div
								class="text"
								v-text="isErrorsTable ? error.error : error.count"
							></div>
						</div>
					</div>
				</div>
			</div>
			<!-- </div> -->
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { navigation, initPageDataMixin } from '@/mixins';

export default {
	mixins: [navigation(), initPageDataMixin()],
	name: 'LogsPage',

	computed: {
		itemsName() {
			return {
				one: this.$t('Log'),
				mult: this.$t('Logs')
			};
		},

		navbarSettings: () => ({
			// showCreateButtonForTableForm: true,
			showFilter: true,
			pageTitle: 'Settings',
			infoOnly: true
		}),

		preventDestroyNavbar: () => true,

		isErrorsTable() {
			const { itemData } = this;
			if (itemData) {
				return (
					itemData.items.length &&
					Object.keys(itemData.items[0]).some(k => k == 'error')
				);
			}
			return false;
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'testing/fetch_log'
			// save_item: 'applications/save_application'
		})
	}
};
</script>
