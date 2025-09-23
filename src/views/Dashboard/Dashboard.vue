<template>
	<div class="details-page plant-dashboard">
		<!-- <VueElementLoadingWrapper
			:isLoading="plantsLoading"
			:itemsName="itemsName.one"
		/> -->

		<div class="view-wrapper item-page-wrapper">
			<!-- <div class="mcontainer" v-if="plantItem && plantItem.id"> -->
			<div class="mcontainer">
				<div class="content-row nested-view-content-wrapper">
					<RouterView v-slot="{ Component }">
						<transition name="component-scale" mode="out-in">
							<component
								:is="Component"
								ref="nestedViewContent"
								:key="detailsComponentKey"
							/>
						</transition>
					</RouterView>
							<!-- <router-view
								ref="nestedViewContent"
								@event="handleEventNew"
								:key="detailsComponentKey"
								:plantItem="plantItem"
								:plantId="plantId"
								:additionalModalSettings="modalSettingsForItemsLists"
							/> -->
				</div>
			</div>

			<!-- <div v-else-if="!plantsLoading" class="mcontainer">
				<PageMockImg />
			</div> -->
		</div>

		<!-- <ImagePreviewModal
			hideTitle
			@closeModal="closePreviewModal"
			:imgDialogOpen="imgPreviewOpen"
			:imgId="currentImageId"
			:pictures="imagesList"
		/> -->
	</div>
</template>

<script setup>
/*import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
import annotations from 'highcharts/modules/annotations';
highchartsMore(Highcharts);
stockInit(Highcharts);
boost(Highcharts);
annotations(Highcharts);

import { mapActions, mapState } from 'vuex';
import { setFiltersViaList } from '@/helpers/specialHelpers';*/

// import { findItemBy } from '@/helpers';

// import { getBrandModelImgByType } from '@/helpers/specialHelpers';

/*import {
	fetchItemsHelper,
	navigation,
	eventHandler
	// requestsListMixin
} from '@/mixins';*/
	import { ref, onMounted } from 'vue';

	const plantItem = null;
	const plantsLoading = ref(false);
	const detailsComponentKey = ref(1);

	onMounted(() => {
	  console.log(`Dashboard.vue`)
	})

// export default {
	/*mixins: [
		fetchItemsHelper(),
		navigation(),
		eventHandler()
		// requestsListMixin
	],*/
	// name: 'PlantDashboard',

	/*components: {
		PageMockImg: () => import('@/components/common/PageMockImg.vue')
		// ButtonsNavbar: () => import('@/components/common/ButtonsNavbar.vue'),
	},*/

	/*data() {
		return {
			// displayMainSection: false,
			// imgPreviewOpen: false,
			// imagesList: [],
			// currentImageId: null,

			plantItem: null,
			plantsLoading: false,
			// sensorsList: [],
			// sensorsLoading: false,

			detailsComponentKey: 1
		};
	},*/

	/*computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			// plantsLoading: state => state.global.globalPlantsLoading,
			// plantsList: state => state.global.globalPlantsList,
			authUser: state => state.auth.authUser
		}),

		modalSettingsForItemsLists: () => ({
			multiform: true,
			componentPath: 'Dashboard/MultiFormWrapper'
		}),

		plantId() {
			const { plants_ids, plant_id } = this.authUser;
			let id;

			if (!plant_id) {
				id = this.globalFilters.plantId;
			} else if (!plants_ids.length) {
				id = plant_id;
			} else id = this.globalFilters.plantId;
			return id;
		},

		itemsName() {
			return {
				one: this.$t('Plant'),
				mult: this.$t('Plants')
			};
		},

		navbarSettings() {
			return Object.freeze({
				// navigateButton: { history: true, steps: -1 },
				showStandardNavItem: true,
				showFilter: true,
				pageTitle: this.$t('phrases.Plant_Dashboard')
			});
		}
	},*/

	/*methods: {
		...mapActions({
			fetch_plant: 'plants/fetch_plant'
			// fetch_sensors: 'sensors/fetch_sensors',
			// show_edit_modal: 'show_edit_modal',
		}),

		fetchPlant(plantId) {
			const payload = { itemId: plantId };

			this.doFetchAction('fetch_plant', 'plantItem', 'plantsLoading', payload);
		},

		setup_navbar(settings) {
			const { meta } = this.$route;
			if ((!meta || !meta.preventSetupNavbar) && !this.preventSetupNavbar) {
				this.$store.dispatch('setup_navbar', settings);
			}
		},

		closePreviewModal() {
			this.currentImageId = null;
			this.imgPreviewOpen = false;
		},

		setFiltersViaList(payload) {
			return setFiltersViaList(payload);
		}
	},*/

	/*watch: {
		'globalFilters.plantId'() {
			// this.plantItem = findItemBy('id', id, this.plantsList);
			// this.detailsComponentKey++;

			this.setFiltersViaList({
				filters: [
					{
						action: 'production_lines/set_production_lines_filters',
						params: ['locationId', { key: 'page', val: 1 }]
					},
					{
						action: 'machines/set_machines_filters',
						params: [
							'productionLineId',
							'locationId',
							'applicationId',
							{ key: 'page', val: 1 }
						]
					},
					{
						action: 'assets/set_assets_filters',
						params: [
							'productionLineId',
							'locationId',
							'machineId',
							{ key: 'page', val: 1 }
						]
					},
					{
						action: 'equipments/set_equipments_filters',
						params: [
							'productionLineId',
							'machineId',
							'assetId',
							'locationId',
							'brandId',
							'brandModelId',
							{ key: 'page', val: 1 }
						]
					}
				],
				value: null
			});
		},

		'plantId'(id) {
			this.plantItem = null;
			// this.sensorsList = [];

			if (id) {
				this.fetchPlant(id);
				// this.fetchSensors(id);
			}
		}
	},*/

	/*beforeMount() {
		if (this.plantId) {
			this.fetchPlant(this.plantId);
			// this.fetchSensors(this.plantId);
		}

		this.setup_navbar(this.navbarSettings);
		// const { id } = this.$route.params;
		// this.displayMainSection = this.$route.name == 'EquipmentsDetailsPage';
	},*/

	/*beforeDestroy() {
		if (!this.preventDestroyNavbar) {
			this.setup_navbar({});
		}
	}*/
// };
</script>
