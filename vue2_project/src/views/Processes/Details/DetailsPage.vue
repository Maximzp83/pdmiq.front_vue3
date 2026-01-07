<template>
	<div class="details-page fix-height">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper" v-if="loadContent">
			<div class="mcontainer">
				<div class="section-row">
					<div class="flex align-center nav-tabs-container very-small">
						<ButtonsNavbar
							inline
							bold
							:itemsList="navbarList"
							buttonType="is-round"
						/>
					</div>
				</div>

				<div class="section-row nested-view-content-wrapper" v-if="itemData">
					<transition name="standard-fade" mode="out-in">
						<router-view
							preventSetNavbar
							ref="nestedViewContent"
							:processData="itemData"
						/>
					</transition>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { findItemBy } from '@/helpers';

import { initPageDataMixin, navigation } from '@/mixins';

export default {
	mixins: [initPageDataMixin(), navigation()],
	name: 'ProcessDetailsPage',

	components: {
		ButtonsNavbar: () => import('@/components/common/ButtonsNavbar.vue')
		// TabsBar: () => import('@/components/common/TabsBar.vue')
	},

	data() {
		return {
			displayMainSection: false,

			sensorsList: [],
			sensorsLoading: false,
			equipmentsList: [],
			equipmentsLoading: false,
			analoguesList: [],
			analoguesLoading: false
		};
	},

	computed: {
		authUser() {
			return this.$store.state.auth.authUser;
		},
		itemsName() {
			return {
				one: this.$t('Item'),
				mult: this.$t('Items')
			};
		},

		pageTitle() {
			if (this.itemData) {
				return `${this.itemData.name}`;
			}
			return '';
		},

		navbarList() {
			if (this.$route) {
				const { id } = this.$route.params;
				let list = [
					{ path: `/processes/${id}/details/dashboard`, label: 'Dashboard' },
					{ path: `/processes/${id}/details/logs`, label: 'Logs' }
				];

				/*if (this.isSuperAdmin || this.isDistributor || this.isPlantAdmin || this.isPlantSuperintendent) {
					list.push({ path: `/processes/${id}/details/dashboard`, label: 'Dashboard' })
				}

				list.push({ path: `/processes/${id}/details/logs`, label: 'Logs' });*/

				return list;
			}
			return [];
		},

		navbarSettings() {
			// const { activeTab } = this;
			let settings = {
				// navigateButton: { history: true, steps: -1 },
				showStandardNavItem: { backButton: { path: '/processes' } },
				pageTitle: this.pageTitle,
				showFilter: true,
				infoOnly: true
			};

			/*if (activeTab.equipmentData) {
				settings.showPlantName = { name: activeTab.equipmentData.plant_name };
			}*/

			return settings;
		},

		requestsToDoList() {
			// const { id } = this.$route.params;

			let items = [
				/*{
					action: 'fetch_equipments',
					payload: { params: { assetId: id } },
					localProp: 'equipmentsList',
					localLoadProp: 'equipmentsLoading'
				}*/
				/*{
					action: 'fetch_sensors',
					payload: { params: { max: -1, equipmentId: id } },
					localProp: 'sensorsList',
					localLoadProp: 'sensorsLoading'
				},*/
			];
			return items;
		},

		isIndustrialMatrix() {
			return this.$store.state.auth.isIndustrialMatrix;
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'processes/fetch_process',
			// fetch_equipments: 'equipments/fetch_equipments',
			show_edit_modal: 'show_edit_modal'
		}),

		editEquipment() {
			this.show_edit_modal({
				show: true,
				instanceData: this.activeTab.equipmentData,
				instanceName: 'Equipments',
				itemName: this.itemsName ? this.itemsName.one : ''
			});
		}
	},

	watch: {
		/*'$route'({name}) {
			this.displayMainSection = name == 'EquipmentsDetailsPage';
		},*/
		navbarSettings(settings) {
			this.setup_navbar(settings);
		}
	},

	beforeMount() {
		const { navbarList } = this;

		if (navbarList.length) {
			this.changeRoute({ path: navbarList[0].path });
		}

		// const { id } = this.$route.params;
		// this.displayMainSection = this.$route.name == 'EquipmentsDetailsPage';
	}
};
</script>
