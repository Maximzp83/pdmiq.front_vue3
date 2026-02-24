<template>
	<div class="details-page fix-height main-instance-item equipment-details">
		<!-- <button @click="reloadPage">reload</button> -->
		<!-- <button @click="updateEquipment({
						// is_rpm_visible: !!is_rpm_visible,
						id: itemData.id,	
					})">reload</button> -->
		<!-- <button @click="fetchMultiViews(38795)">fetchMultiViews</button> -->
		<VueElementLoadingWrapper
			:isLoading="itemLoading || equipmentsLoading"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper" v-if="loadContent">
			<div class="mcontainer">
				<div class="content-row card ">
					<div class="card-content navbar-card">
						<div class="flex mrow wrap capitalize navbar-container">
							<ButtonsNavbar
								inline
								bold
								:itemsList="navbarList"
								:class="[
									'mcol-xs-auto',
									{ 'mr-auto': !$hasAccessTo(['edit_dashboard']) }
								]"
							/>

							<!-- <div class="mcol-xs-12 mcol-sm-auto"></div> -->
							<div class="">
								<el-button
									v-if="$hasAccessTo(['edit_dashboard'])"
									@click="editEquipment"
									type="primary"
									native-type="button"
									class="inverted"
								>
									<span class="bold capitalize">{{ tt('Edit') }}</span>
								</el-button>

								<!-- @click="()=>editPDM(item)" -->
								<!-- <el-button
									v-for="item in dashboardSensors"
									:key="`pdm-${item.id}`"
									@click="() => toPdmStatistics(item.id)"
									type="primary"
									native-type="button"
									class="inverted"
								>
									<span class="bold">PDM</span>
								</el-button> -->
							</div>

							<div class="mr-auto" v-if="$hasAccessTo(['edit_dashboard'])">
								<el-button
									@click="moveEquipment"
									type="primary"
									native-type="button"
									class="inverted"
								>
									<span class="bold">{{ tt('Move') }}</span>
								</el-button>
							</div>

							<div class="pdm-buttons-block" v-if="dashboardSensors.length || multiViewsList.length">
									<!-- @click="moveEquipment" -->
								<PdmButton
									v-for="item in multiViewsList"
									:key="`mv-${item.id}`"
									:itemData="item"
									:routeParamsId="routeParamsId"
									@forceRerender="detailsComponentKey++"
									buttonTextKey="name"
									isMultiView
								/>

								<PdmButton
									v-for="sensor in dashboardSensors"
									:key="`pdm-${sensor.id}`"
									:itemData="sensor"
									isSensor
									:routeParamsId="routeParamsId"
									@forceRerender="detailsComponentKey++"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- <FileUploadBlock
					ref="ItemImagesBlock"
					multiple
					rotate
					showDeleteButton
					enableReorderFiles
					:pictures="itemImagesList"
					imgItemClass="drag-n-drop-item"
					:additionalFormData="{ type: EQUIPMENT_IMG_TYPES.EQUIPMENT }"
					:blockId="EQUIPMENT_IMG_TYPES.EQUIPMENT"
				/> -->

				<div class="equipment-types-row content-row">
					<!-- <div class="title-block section-row">
						<h1 class="title page-title outside-bg-addition">
							<span class="muted">Asset:</span> {{ pageTitle }}
						</h1>
					</div> -->

					<div class="section-row radio-container">
						<div class="flex">
							<TabsBar
								class="mcol-xs-12"
								v-if="activeTab && activeTab.prop"
								notRound
								withScroll
								@switchTab="switchTab"
								:activeTab="activeTab"
								:tabsList="tabsList"
								:height="40"
								:buttonsType="'secondary'"
								:initialAutoSelect="activeTabIdx"
								className="like-in-browser-tabs"
							/>
							
							<div class="ml-auto" v-if="enableShareLinkButton">
								<el-button
									class="share-button"
									@click="handleShareLinkClick"
									type="secondary"
									native-type="button"
								>
									<span class="span-block">{{ tt('Share') }}</span>
									<i class="span-block el-icon-share"></i>
								</el-button>
							</div>

						</div>
					</div>
				</div>

				<div
					class="nested-view-content-wrapper"
					v-if="activeTab && activeTab.equipmentData"
				>
					<transition name="standard-fade" mode="out-in">
						<router-view
							ref="nestedViewContent"
							@event="handleEventNew"
							:equipmentData="activeTab.equipmentData"
							:crossoverList="crossoverList"
							:crossoverLoading="analoguesLoading || subTypeAnaloguesLoading"
							:key="detailsComponentKey"
							:multiViewsList="multiViewsList"
						/>
					</transition>
				</div>

				<div v-else class="text-center">
					{{ tt('phrases.this_asset_has_not_equipments') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { findItemBy, cloneDeep } from '@/helpers';

import { copyToClipboard } from '@/helpers/specialHelpers';
// import { encodeUrl } from '@/services/api/api_helpers';

import {
	initPageDataMixin,
	fetchItemsHelper,
	tabsMixin,
	navigation,
	eventHandler
} from '@/mixins';

import { 
 EQUIPMENT_IMG_TYPES
} from '@/constants/global';

export default {
	mixins: [
		initPageDataMixin(),
		fetchItemsHelper(),
		tabsMixin(),
		navigation(),
		eventHandler()
	],
	name: 'EquipmentDetailsPage',

	components: {
		ButtonsNavbar: () => import('@/components/common/ButtonsNavbar.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		PdmButton: () => import('./PdmButton.vue'),
		// FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),

	},

	data() {
		return {
			// testRpmItem: 3,
			displayMainSection: false,
			detailsComponentKey: 1,

			prevRouteName: false,
			analoguesIsFetched: false,

			activeTabIdx: 0,

			sensorsList: [],
			sensorsLoading: false,
			equipmentsList: [],
			equipmentsLoading: false,
			analoguesList: [],
			analoguesLoading: false,
			subTypeAnaloguesList: [],
			subTypeAnaloguesLoading: false,

			multiViewsList: [],
			multiViewsLoading: false,
		};
	},

	computed: {
		...mapState({
			statistics_filters: state => state.sensors.statistics_filters,
			authUser: state => state.auth.authUser,
		}),

		copyToClipboard: () => copyToClipboard,

		itemsName() {
			return Object.freeze({
				one: this.$t('Item'),
				mult: this.$t('Items')
			});
		},

		routeParamsId() {
			return +this.$route.params.id;
		},

		routeName() {
			return this.$route.name;
		},

		enableShareLinkButton() {
			const { params } = this.$route;
			return params && (params.sensorId || params.multiViewId);
		},

		/*pageTitle() {
			if (this.itemData) {
				return `${this.itemData.name}`;
			}
			return '';
		},*/

		navbarList() {
			if (this.$route) {
				const { routeParamsId } = this;

				let list = [
					{ path: `/equipments/${routeParamsId}/details/main`, label: 'View' },
					{ path: `/equipments/${routeParamsId}/details/quote`, label: 'Quote' },
					{ path: `/equipments/${routeParamsId}/details/service`, label: 'Service' }
				];

				// console.log(this.$route)
				/*if (this.dashboardSensors.length) {
					for (const sensor of this.dashboardSensors) {
						list.push({
							path: `/equipments/${routeParamsId}/details/pdm/${sensor.id}`,
							label: `PDM`,
							id: `pdm-${sensor.id}`
						});
					}
				}*/

				return Object.freeze(this.$translate(list));
			}
			return [];
		},

		tabsList() {
			let tabs = [];
			// console.log('computed tabsList', this.equipmentsList.length)
			if (this.equipmentsList.length) {
				this.equipmentsList.forEach(e => {
					tabs.push({
						id: e.id,
						title: `${e.equipment_type_name} ${e.loc_on_machine || ''}`,
						prop: `${e.equipment_type_name}Tab-${e.id}`,
						equipmentData: e,
						prefix_img: e.brand_model_img
						/*prefix_img: getBrandModelImgByType({
							id: e.equipment_type_id,
							equipment_type_img: e.equipment_type_img,
							brandModelsList: this.brandModelsList
						})*/
					});
				});
			}

			return Object.freeze(tabs);
		},

		navbarSettings() {
			const { activeTab } = this;
			let settings = {
				// navigateButton: { history: true, steps: -1 },
				// showStandardNavItem: { backButton: { path: '/dashboard/items/equipments' } },
				showStandardNavItem: true,
				pageTitle: `${this.$t('Item')} ${this.$t('Details')}`
				// editButton: { parent: true, steps: 1 },
				// showFilter: true
			};

			if (activeTab && activeTab.equipmentData) {
				settings.showPlantName = {
					id: activeTab.equipmentData.plant_id,
					name: activeTab.equipmentData.plant_name
				};
			}

			return Object.freeze(settings);
		},

		/*requestsToDoList() {
			const { id } = this.$route.params;

			let items = [
				{
					action: 'fetch_equipments',
					payload: { params: { assetId: id } },
					localProp: 'equipmentsList',
					localLoadProp: 'equipmentsLoading'
				},
				// {
				// 	action: 'fetch_sensors',
				// 	payload: { params: { max: -1, equipmentId: id } },
				// 	localProp: 'sensorsList',
				// 	localLoadProp: 'sensorsLoading'
				// },
			];
			return items;
		},*/

		crossoverList() {
			const { analoguesList, subTypeAnaloguesList, activeTab } = this;
			let result = {};

			if (activeTab.equipmentData) {
				const { equipment_type_name, equipmentSubType } = activeTab.equipmentData;

				if (Object.keys(analoguesList).length > 1) {
					result.mainType = this.setupCrossoverList(
						equipment_type_name,
						analoguesList
					);
				}

				if (equipmentSubType && Object.keys(subTypeAnaloguesList).length > 1) {
					result.subType = this.setupCrossoverList(
						equipmentSubType.name,
						subTypeAnaloguesList
					);
				}
				// console.log('analogues response:', analoguesList);
			}

			return Object.freeze(result);
		},

		dashboardSensors() {
			if (this.activeTab) {
				const { equipmentData } = this.activeTab;

				if (equipmentData && equipmentData.dashboardSensors) {
					return Object.freeze(cloneDeep(equipmentData.dashboardSensors));
				}
			}

			return [];
		},

		routeQuery() {
			const { query } = this.$route;
			return Object.keys(query).length ? query : null;
		},

		EQUIPMENT_IMG_TYPES() {
			return EQUIPMENT_IMG_TYPES;
		},

		itemImagesList() {
			return this.getPicturesByType(EQUIPMENT_IMG_TYPES.EQUIPMENT);
		},

		/*isFetchAnalogues() {
			return (
				this.$route.name !== 'DetailsStatPage' &&
				this.$route.name !== 'DetailsStatPage'
			);
		}*/
		// brandModelsList: that => that.itemData ? that.itemData.brandModels : [],
	},

	methods: {
		...mapActions({
			fetch_item: 'equipments/fetch_equipment',
			// fetch_item: 'assets/fetch_asset',
			fetch_equipments: 'equipments/fetch_equipments_dashboard',
			// fetch_equipments_in_process: 'equipments/fetch_equipments_in_process',
			fetch_sensors: 'sensors/fetch_sensors',
			show_edit_modal: 'show_edit_modal',
			fetch_analogues: 'equipments/fetch_analogues',

			fetch_metric_multi_views: 'equipments/fetch_metric_multi_views',
		}),

		getPicturesByType(type) {
			if (this.itemData && this.itemData.pictures) {
				return this.itemData.pictures.filter(p => p.type === type);
			}
		},

		handleShareLinkClick() {
			// const statisticsPage = this.$refs.nestedViewContent;
			// if (statisticsPage) {
				// console.log(statisticsPage)
				// statisticsPage.getDateRange();
			// }
			const { daterange } = this.statistics_filters;
			const path = `${window.location.origin}${this.$route.path}?dateStart=${encodeURIComponent(daterange[0])}&dateFinish=${encodeURIComponent(daterange[1])}`;

			this.copyToClipboard(path, {
				messageType: 'success',
				messageText: this.tt('aliases.to_clipboard_msg')
			});
		},

		setupCrossoverList(equipment_type_name, analoguesList) {
			const newAnaloguesList = {
				our_in_store_room: analoguesList.our_in_store_room,
				analogue_in_store_room: analoguesList.analogue_in_store_room,
				our_in_asset: analoguesList.our_in_asset,
				analogue_in_asset: analoguesList.analogue_in_asset
			};

			return Object.freeze(
				Object.keys(newAnaloguesList).map(key => {
					let item = {};

					switch (key) {
						case 'our_in_store_room':
							item = {
								label: `Spare ${equipment_type_name}s are in the storeroom`
							};
							break;

						case 'analogue_in_store_room':
							item = {
								label: `Compatible replacement ${equipment_type_name}s are in the storeroom`
							};
							break;

						case 'our_in_asset':
							item = {
								label: `${equipment_type_name}s are in the plant but are on other machines`
							};
							break;

						case 'analogue_in_asset':
							item = {
								label: `Compatible replacement ${equipment_type_name}s are on other machines`
							};
							break;
					}

					item.quantity = analoguesList[key].length;
					item.list = analoguesList[key];

					return item;
				})
			);
		},

		fetchEquipments(asset_id) {
			const payload = {
				params: { assetId: asset_id, max: -1, archivedNodes: true },
				prepareDataSettings: {
					addSettingItems: [
						{ key: 'equipmentSubType', val_key: 'equipmentSubType' },
						{ key: 'subTypeBrand', val_key: 'subTypeBrand' },
						{ key: 'subTypeModel', val_key: 'subTypeModel' },
						// { key: 'asset', val_key: 'asset' }
					]
				}
			};

			this.doFetchAction(
				'fetch_equipments',
				'equipmentsList',
				'equipmentsLoading',
				payload
			);
		},

		editEquipment() {
			this.show_edit_modal({
				show: true,
				instanceData: this.activeTab.equipmentData,
				instanceName: 'Equipments',
				componentPath: 'Equipments/ItemFormWrapper',
				itemName: this.itemsName ? this.itemsName.one : '',
				callback: this.successEquipmentSave
			});
		},

		moveEquipment() {
			this.show_edit_modal({
				show: true,
				title: `${this.$t('Move')} ${this.$t('Item')}`,
				instanceData: this.activeTab.equipmentData,
				instanceName: 'Equipments',
				editModalProp: 'editModalClassic',
				componentPath: 'BrandModels/Details/MoveForm',
				modalClassName: 'fixed-header-footer small-header small-footer',
				itemName: this.itemsName ? this.itemsName.one : '',
				additionalModalSettings: {
					plantId: this.itemData.plant_id,
					equipmentId: this.itemData.id
				},
				callback: this.successEquipmentSave
			});
		},

		successEquipmentSave() {
			this.initialPageSetup(this.$route);
			this.show_edit_modal({ show: false });
		},

		editPDM(item) {
			this.show_edit_modal({
				show: true,
				instanceData: item,
				instanceName: 'Sensors',
				itemName: 'Sensor'
			});
		},

		toPdmStatistics(id) {
			this.changeRoute({ path: `/sensors/${id}/statistics` });
		},

		rfqSuccess() {
			this.changeRoute({
				path: `/equipments/${this.routeParamsId}/details/main`
			});
		},

		forceRerender() {
			this.detailsComponentKey++;
		},

		fetchAnalogues(id, settings = {}) {
			let { listProp, loadingProp, params } = settings;
			params = params || {};
			this.doFetchAction(
				'fetch_analogues',
				listProp || 'analoguesList',
				loadingProp || 'analoguesLoading',
				{ itemId: id, params: { max: -1, ...params } }
			);
			this.analoguesIsFetched = true;
		},

		reloadPage(/*{is_rpm_visible, rpm_source_item}*/) {
			// this.itemData.is_rpm_visible = is_rpm_visible;
			// this.itemData.rpm_source_item = rpm_source_item;

			// this.fetchPageData(this.itemData.id);
			this.initialPageSetup(this.$route);
			this.activeTab = {};
			this.equipmentsList = [];
			this.forceRerender();
			// this.fetchPageData(this.$route.params.id);
		},

		updateEquipment(equipment) {
			var { index } = findItemBy('id', equipment.id, this.equipmentsList, {returnIndex:1});

			// console.log('updateEquipment', equipment.rpm_source_item)
			if (index != null) {
				this.equipmentsList[index].rpm_source_item = equipment.rpm_source_item;
				this.equipmentsList[index].is_rpm_visible = equipment.is_rpm_visible;
				
				// this.loadContent = false;
				// this.equipmentsList = [];
				// setTimeout(() => {

				/*var newEquipment = prepareDataFunctions['prepareEquipmentsList'](
					equipment,
					{
						addSettingItems: [
							{ key: 'equipmentSubType', val_key: 'equipmentSubType' },
							{ key: 'subTypeBrand', val_key: 'subTypeBrand' },
							{ key: 'subTypeModel', val_key: 'subTypeModel' },
						]
					}
				);*/
				
				// this.testRpmItem = this.testRpmItem == 3 ? 5 : 3
				// this.equipmentsList[index].rpm_source_item = this.testRpmItem;
				// this.loadContent = true;
				// }, 100);
			}
		},

		// ---------------
		fetchMultiViews(equipmentId) {
			this.doFetchAction(
				'fetch_metric_multi_views',
				`multiViewsList`,
				`multiViewsLoading`,
				{ 
					equipmentId,
					params:	{	max: -1, orderByColumn: 'name',	orderByMethod: 'asc', }
				}
			);
		},
	},

	watch: {
		/*'$route'({name}) {

			// console.log('route', name, this.isFetchAnalogues, Object.keys(this.analoguesList).length, this.routeParamsId)
			// this.displayMainSection = name == 'EquipmentsDetailsPage';
		},*/
		// analoguesLoading(x) {console.log('analoguesLoading', x)},
		// subTypeAnaloguesLoading(x) {console.log('subTypeAnaloguesLoading', x)},
		navbarSettings(settings) {
			this.setup_navbar(settings);
		},

		itemData(item) {
			// console.log('itemData')
			if (!item.asset_id || item.equipments_count === 1) {
				this.equipmentsList = [item];
			} else {
				this.fetchEquipments(item.asset_id);
			}
		},

		routeName(name) {
			if (
				name != 'DetailsStatPage' &&
				this.prevRouteName == 'DetailsStatPage' &&
				!this.analoguesIsFetched
			) {
				this.fetchAnalogues(this.routeParamsId);
			}
			this.prevRouteName = name;
		},

		activeTab(tab) {
			// console.log('activeTab', tab.equipmentData)
			if (tab && tab.equipmentData) {

				this.fetchMultiViews(tab.equipmentData.id);
				// this.multiViewsList = tab.equipmentData.metric_multi_views || [];

				this.analoguesIsFetched = false;

				const { id, dashboardSensors, equipmentSubType } = tab.equipmentData;
				if (this.routeParamsId !== id) {
					const { params } = this.$route;

					if (params.sensorId && dashboardSensors.length) {
						const newSensorId = dashboardSensors[0].id;
						this.$router.replace(`/equipments/${id}/details/pdm/${newSensorId}`);
						this.forceRerender();
						// console.log(fullPath, params,
					} else {
						this.$router.replace(`/equipments/${id}/details/main`);
					}
				}

				this.activeTabIdx = this.tabsList.findIndex(
					t => t.id === tab.equipmentData.id
				);
				// console.log('activeTab', this.$route.path, this.navbarList)
				if (this.$route.name != 'DetailsStatPage') {
					this.fetchAnalogues(id);
					
					if (equipmentSubType) {
						this.fetchAnalogues(tab.equipmentData.id, {
							listProp: 'subTypeAnaloguesList',
							loadingProp: 'subTypeAnaloguesLoading',
							params: { subtype: true }
						});
					}
				}
			}
		},

		tabsList(tabs) {
			if (!tabs.length) return;

			const { routeParamsId } = this;
			if (routeParamsId) {
				// console.log(routeParamsId, tabs)
				this.activeTab = findItemBy('id', routeParamsId, tabs);
			}

			/*if (this.$route.query && this.$route.query.activeTab) {
				const equipmentId = +this.$route.query.activeTab;
				const activeTab = findItemBy('id', equipmentId, tabs);
				// console.log(equipmentId, this.tabsList)
				if (activeTab) this.activeTab = activeTab;
				else this.activeTab = tabs[0];
			} else {
				this.activeTab = tabs[0];
			}*/
		}
	},

	beforeMount() {
		this.prevRouteName = this.$route.name;
		// const { id } = this.$route.params;
		// this.displayMainSection = this.$route.name == 'EquipmentsDetailsPage';
	}
};
</script>
