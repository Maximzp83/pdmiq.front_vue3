<template>
	<div class="view-wrapper dashboard-page-wrapper settings-page">
		<div class="mcontainer">
			<div class="section-row flex mrow align-center">
				<!-- <div class="mcol-xs-auto">
					<h1 class="title page-title">Settings</h1>
				</div> -->

				<div class="mcol-xs-auto fluid">
					<NavigationButtons
						small
						@changeRoute="handleChangeRoute"
						:currentPath="currentPath"
						:linksList="navigationLinksList"
						:isActive="checkIsLinkActive"
						className="settings-navtabs"
					/>
				</div>
			</div>

			<div class="section-row">
				<transition name="standard-fade" mode="out-in">
					<router-view
						ref="SettingsContent"
						preventSetNavbar
						:key="faultsComponentKey"
					/>
					<!-- :fault_type="fault_type" -->
				</transition>
			</div>
		</div>
	</div>
</template>

<script>
// import { mapState, mapActions } from 'vuex';
import { navigation } from '@/mixins';

import { FAULTS_TYPES } from '@/constants/global';

export default {
	mixins: [navigation()],

	components: {
		NavigationButtons: () => import('@/components//common/NavigationButtons.vue')
	},

	data() {
		return {
			// metric: 1
			faultsComponentKey: 1
		};
	},

	computed: {
		currentPath() {
			return this.$route.fullPath;
		},

		navbarSettings: () => ({
			showFilter: false,
			// infoOnly: true,
			pageTitle: 'Settings'
		}),

		tabsList: () => [
			{ title: 'mail', prop: 'mailTabActive' }
			// { title: 'auto', prop: 'autoTabActive' }
		],
		navigationLinksList: () => [
			{ id: 3, title: 'Faults', path: `/settings/faults?type=${FAULTS_TYPES.BASE}` },
			{
				id: 11,
				title: 'NCD Faults',
				path: `/settings/faults?type=${FAULTS_TYPES.NCD}`
			},
			{ id: 5, title: 'Import', path: '/settings/import' },
			{ id: 6, title: 'Custom Formulas', path: '/settings/custom-formulas' },
			{
				id: 7,
				title: 'Back-End Register Writing',
				path: '/settings/backend-registers'
			},
			{ id: 8, title: 'Bearing', path: '/settings/bearing' },
			{ id: 9, title: 'Lube Type', path: '/settings/lube-type' },
			{
				id: 10,
				title: 'Industrial Services',
				path: '/settings/industrial-services'
			},
			{ id: 14, title: 'Measurement Units', path: '/settings/measurement-units' },
			{ id: 12, title: 'Statistics', path: '/settings/statistics' },
			{ id: 13, title: 'Banner V2 Subtypes', path: '/settings/banner-v2-subtypes' }
		]
	},

	methods: {
		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		},

		checkIsLinkActive({ link, currentPath }) {
			// console.log(link, currentPath)
			if (currentPath == link.path) return true;
			return /\/import/.test(link.path) && /\/import/.test(currentPath);
		},

		handleChangeRoute(route) {
			this.changeRoute(route);
			this.faultsComponentKey++;
		}

		/*handleCreateItem() {
			if (this.$refs.SettingsContent.handleCreateItem) {
				this.$refs['SettingsContent'].handleCreateItem();
			}
		},

		handleCleanForm() {
			if (this.$refs['SettingsContent'].handleCleanForm) {
				this.$refs['SettingsContent'].handleCleanForm();
			}
		},

		handleSaveItem() {
			if (this.$refs['SettingsContent'].handleSaveItem) {
				this.$refs['SettingsContent'].handleSaveItem();
			}
		}*/
	},

	beforeMount() {
		this.setup_navbar(this.navbarSettings);

		if (this.currentPath === '/settings') {
			this.$router.push(this.navigationLinksList[0].path);
		}
	}
};
</script>
