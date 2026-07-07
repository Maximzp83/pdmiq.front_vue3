<template>
	<div class="view-wrapper dashboard-page-wrapper settings-page">
		<div class="mcontainer">
			<div class="section-row flex mrow align-center">
				<div class="mcol-xs-auto fluid">
					<NavigationButtons
						small
						className="settings-navtabs"
						:currentPath="currentPath"
						:linksList="navigationLinksList"
						:isActive="checkIsLinkActive"
						@changeRoute="handleChangeRoute"
					/>
				</div>
			</div>

			<div class="section-row">
				<router-view v-slot="{ Component }" preventSetNavbar>
					<transition name="standard-fade" mode="out-in">
						<component :is="Component" />
					</transition>
				</router-view>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { FAULTS_TYPES } from '@/constants/global';
import { useGlobalStore } from '@/stores/GlobalStore';

import NavigationButtons from '@/components/common/NavigationButtons.vue';

defineOptions({
	name: 'SettingsPage',
});

const route = useRoute();
const router = useRouter();
const globalStore = useGlobalStore();

const currentPath = computed(() => route.fullPath);

const navigationLinksList = computed(() => [
	{ id: 3, title: 'Faults', path: `/settings/faults?type=${FAULTS_TYPES.BASE}` },
	{ id: 11, title: 'NCD Faults', path: `/settings/faults?type=${FAULTS_TYPES.NCD}` },
	{ id: 6, title: 'Custom Formulas', path: '/settings/custom-formulas' },
	{ id: 7, title: 'Back-End Register Writing', path: '/settings/backend-registers' },
	{ id: 8, title: 'Bearing', path: '/settings/bearing' },
	{ id: 9, title: 'Lube Type', path: '/settings/lube-type' },
	{ id: 10, title: 'Industrial Services', path: '/settings/industrial-services' },
	{ id: 12, title: 'Statistics', path: '/settings/statistics' },
	{ id: 13, title: 'Banner V2 Subtypes', path: '/settings/banner-v2-subtypes' },
	{ id: 14, title: 'Import', path: '/settings/import/logs' },
]);

const setupNavbar = () => {
	globalStore.setup_navbar({
		showFilter: false,
		pageTitle: 'Settings',
	});
};

const checkIsLinkActive = ({ link, currentPath: path }) => path === link.path;

const handleChangeRoute = (link) => {
	router.push(link.path);
};

onMounted(() => {
	setupNavbar();
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
