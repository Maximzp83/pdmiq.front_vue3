<template>
	<div class="nested-view-content-wrapper">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div class="logs-page-container">
			<div class="view-content-card card overflowHidden">
				<div class="card-header filled">
					<div class="article-title semi-bold">Errors</div>
					<div class="closeButton-container ml-auto">
						<el-button
							class="closeButton"
							native-type="button"
							@click="changeRoute({ path: '/settings/import/history' })"
						>
							<i class="icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>

				<div v-if="loadContent" class="card-content">
					<div class="info-list">
						<div v-if="isErrorsTable" class="info-item">
							<div class="index semi-bold">Row</div>
							<div class="text semi-bold">Issue</div>
						</div>
						<div v-else class="info-item">
							<div class="index semi-bold">Brand model name</div>
							<div class="text semi-bold">Count</div>
						</div>

						<div
							v-for="error in itemData.items"
							:key="`error-${error.id}`"
							class="info-item"
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
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Lang } from '@/localization';
import { useTestingStore } from '@/stores/TestingStore';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({ name: 'SettingsImportLogPage' });

const route = useRoute();
const testingStore = useTestingStore();
const { changeRoute } = useNavigation();
const itemData = ref({ items: [] });
const itemLoading = ref(false);
const loadContent = ref(false);

const itemsName = computed(() => Object.freeze({
	one: tt('Log'),
	mult: tt('Logs'),
}));
const isErrorsTable = computed(() =>
	!!itemData.value?.items?.length &&
	Object.keys(itemData.value.items[0]).some((key) => key === 'error'),
);
const fetchItem = () => {
	itemLoading.value = true;
	testingStore.fetch_log({ itemId: route.params.id })
		.then(({ value }) => {
			itemData.value = value || { items: [] };
			loadContent.value = true;
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

onMounted(fetchItem);
</script>
