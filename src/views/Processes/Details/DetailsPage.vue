<template>
	<div class="details-page fix-height">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div v-if="loadContent" class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="section-row">
					<div class="flex align-center nav-tabs-container very-small">
						<ButtonsNavbar
							inline
							bold
							:itemsList="navbarList"
						/>
					</div>
				</div>

						<!-- :processData="itemData" -->
						<!-- preventSetNavbar -->
				<div v-if="itemData" class="section-row nested-view-content-wrapper">
					<RouterView
						v-slot="{ Component }"
					>
						<Transition name="standard-fade" mode="out-in">
							<component
								:is="Component"
								preventSetNavbar
								:processData="itemData"
							/>
						</Transition>
					</RouterView>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Lang } from '@/localization';
import { useProcesses } from '@/composables/useProcesses';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ButtonsNavbar from '@/components/common/ButtonsNavbar.vue';

const { tt } = Lang;

defineOptions({ name: 'ProcessDetailsPage' });

const route = useRoute();
const globalStore = useGlobalStore();
const { changeRoute } = useNavigation();
const { fetchProcess } = useProcesses();

const itemData = ref(null);
const itemLoading = ref(false);
const loadContent = ref(false);
const itemsName = computed(() => Object.freeze({
	one: tt('Process'),
	mult: tt('Processes'),
	instanceName: 'processes',
}));

const pageTitle = computed(() => itemData.value?.name || '');
const navbarList = computed(() => {
	const { id } = route.params;
	if (!id) return [];

	return Object.freeze([
		{ path: `/processes/${id}/details/dashboard`, label: 'Dashboard', className: 'is-round mini' },
		{ path: `/processes/${id}/details/logs`, label: 'Logs', className: 'is-round mini' },
	]);
});
const navbarSettings = computed(() => ({
	showStandardNavItem: { backButton: { path: '/processes' } },
	pageTitle: pageTitle.value,
	showFilter: true,
	infoOnly: true,
}));

watch(navbarSettings, (settings) => {
	globalStore.setup_navbar(settings);
});

const fetchItem = () => {
	const itemId = route.params.id;
	if (!itemId) return Promise.resolve();

	itemLoading.value = true;
	return fetchProcess({ itemId })
		.then(({ value }) => {
			itemData.value = value || {};
			loadContent.value = true;
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

onBeforeMount(() => {
	if (route.name === 'ProcessDetailsPage' && navbarList.value.length) {
		changeRoute({ path: navbarList.value[0].path });
	}
});

onMounted(() => {
	fetchItem();
});
</script>
