<template>
	<div>
		<div class="section-row equipments-tabsbar">
			<div class="underline-tabs full-width">
				<TabsBar
					customDisable
					@switchTab="switchTab"
					:activeTab="activeTab"
					:tabsList="tabsList"
					:disableTabs="disableTabs"
					:buttonsType="'primary'"
				/>
			</div>
		</div>

		<!-- :key="tabsList[0].prop" -->
		<div
			v-show="activeTab.prop == tabsList[0].prop"
			class="tab-container section-row"
		>
			<ItemForm
				ref="ItemFormComponent"
				@event="handleEvent"
				:fromModal="fromModal"
				:fromMultiformModal="fromMultiformModal"
				:itemData="itemData"
				:itemsName="itemsName"
				:instancesItemsData="instancesItemsData"
				:multiFormFilters="multiFormFilters"
			/>
		</div>

		<!-- :key="tabsList[1].prop" -->
		<div
			v-show="tabsList[1] && activeTab.prop == tabsList[1].prop"
			class="tab-container section-row"
		>
				<!-- :sensorsList="sensorsList" -->
				<!-- :sensorsLoading="sensorsLoading" -->
			<SensorItemFormWrapper
				@event="handleEventNew"
				@onRemove="removeSensorItem"
				v-for="item in sensorFormsList"
				:key="`sensorForm-${item.id}`"
				ref="SensorFormComponent"
				:fromModal="fromModal"
				:equipmentData="itemData"
				:itemData="item"
				:hasAccessToCreate="$hasAccessTo(['create_dashboard'])"
				:formulasList="formulasList"
				:bearingsList="bearingsList"
				:lubeTypesList="lubeTypesList"
				:banner_controllersList="banner_controllersList"
				:ultrasound_controllersList="ultrasound_controllersList"
				:ncd_controllersList="ncd_controllersList"
				:banner_subtypesList="banner_subtypesList"
				:commonItemsLoadings="commonItemsLoadings"
			/>
			<!-- :commonItemsLists="commonItemsLists" -->

			<el-button
				v-if="$hasAccessTo(['create_dashboard'])"
				class="create-button content-row with-text"
				size="mini"
				type="success"
				@click="addFormItem('sensorFormsList', 's_i-')"
			>
				<span class="capitalize" v-text="`${tt('Add')} ${tt('sensor')}`"></span>
				<i class="icomoon icon-plus"></i>
			</el-button>
			<!-- icon="icomoon icon-plus" -->
		</div>

		<div
			v-show="tabsList[2] && activeTab.prop == tabsList[2].prop"
			class="tab-container section-row"
		>
			<MultiViewItemForm
				class="section-row"
				ref="MultiViewItemForm"
				v-for="item in multiViewFormsList"
				:key="`multiViewForm-${item.id}`"
				:fromModal="fromModal"
				:equipmentData="itemData"
				:itemData="item"
				@event="handleEventNew"
				@onRemove="id => removeFormItem(id, 'multiViewFormsList')"				
			/>

			<el-button
				v-if="$hasAccessTo(['create_dashboard'])"
				class="section-row create-button content-row with-text"
				size="mini"
				type="success"
				@click="addFormItem('multiViewFormsList', 'mv_i-')"
			>
				<span class="capitalize" v-text="`${tt('Add')} ${tt('View')}`"></span>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { prepareSubmitData } from '@/helpers';

import {
	eventHandler,
	navigation,
	tabsMixin,
	subItemsListMixin,
	fetchItemsHelper
} from '@/mixins';

export default {
	mixins: [
		eventHandler(),
		navigation(),
		tabsMixin(),
		subItemsListMixin(),
		fetchItemsHelper()
	],
	// name: 'SensorPage',

	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		ItemForm: () => import('./ItemForm.vue'),
		MultiViewItemForm: () => import('./MultiView/MultiViewItemForm.vue'),
		SensorItemFormWrapper: () => import('../Sensors/sensorForm/ItemFormWrapper.vue')
	},

	props: {
		fromModal: Boolean,
		fromMultiformModal: Boolean,
		itemData: {
			type: Object,
			default: () => ({})
		},
		itemsName: {
			type: Object,
			default: () => ({})
		},
		instancesItemsData: { type: Object },
		multiFormFilters: { type: Object },
		editModal: Object
	},

	data() {
		return {
			// item_type: CONTROLLER_TYPES.BANNER,
			disableTabs: false,
			formSubmitFinishCount: 0,
			formSubmitSuccessCount: 0,

			sensorFormsList: [],
			multiViewFormsList: [],

			multiViewsList: [],
			multiViewsLoading: false,

			// sensorsList: [],
			// sensorsLoading: false,

			bearings_initiated: false,
			bearingsList: [],
			bearingsLoading: false,
			lubeTypes_initiated: false,
			lubeTypesList: [],
			lubeTypesLoading: false,
			formulas_initiated: false,
			formulasList: [],
			formulasLoading: false,
			banner_controllers_initiated: false,
			banner_controllersList: [],
			banner_controllersLoading: false,
			ultrasound_controllers_initiated: false,
			ultrasound_controllersList: [],
			ultrasound_controllersLoading: false,
			ncd_controllers_initiated: false,
			ncd_controllersList: [],
			ncd_controllersLoading: false,
			banner_subtypes_initiated: false,
			banner_subtypesList: [],
			banner_subtypesLoading: false,			
		};
	},

	computed: {
		tabsList() {
			let list = [{ title: this.tt('main'), prop: 'mainTab' }];

			if (this.$hasAccessTo(['create_dashboard', 'edit_dashboard'])) {
				list.push({
					title: 'pdm',
					prop: 'pdmTab',
					disabled: !this.itemData || !this.itemData.id,
					placement: 'top',
					popover: {
						disabled: this.itemData && !!this.itemData.id,
						text: this.$t('phrases.create_item_first')
					}
				});
				
				list.push({
					title: 'Multi View',
					prop: 'mitliViewTab',
					disabled: !this.itemData || !this.itemData.id,
					placement: 'top',
					popover: {
						disabled: this.itemData && !!this.itemData.id,
						text: this.$t('phrases.create_item_first')
					}
				});
			}

			return Object.freeze(list);
		},

		/*commonItemsLists() {
			const {
				formulasList,
				banner_controllersList,
				banner_subtypesList,
				ncd_controllersList,
				bearingsList,
				lubeTypesList,
				ultrasound_controllersList
			} = this;

			return Object.freeze({
				formulasList,
				banner_controllersList,
				banner_subtypesList
				ultrasound_controllersList,
				ncd_controllersList,
				bearingsList,
				lubeTypesList: lubeTypesList()
			});
		},*/

		commonItemsLoadings() {
			const {
				formulasLoading,
				banner_controllersLoading,
				ncd_controllersLoading,
				bearingsLoading,
				lubeTypesLoading,
				ultrasound_controllersLoading,
				banner_subtypesLoading
			} = this;

			return Object.freeze({
				formulasLoading,
				banner_controllersLoading,
				ultrasound_controllersLoading,
				ncd_controllersLoading,
				bearingsLoading,
				lubeTypesLoading,
				banner_subtypesLoading
			});
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'ItemFormComponent', targetProp: 'equipmentSubmitPayload' },
			{ ref:'SensorFormComponent', submitInSubItem:1 },
			{ ref: 'MultiViewItemForm', targetProp: 'multiViewsItems', returnArray:1},
		]),
	},

	methods: {
		...mapActions({
			fetch_sensors: 'sensors/fetch_sensors',
			save_equipment: 'equipments/save_equipment',
			reorder_equipment: 'equipments/reorder_equipment',

			// fetch_item: 'sensors/fetch_sensor',
			show_edit_modal: 'show_edit_modal',
			set_global_state: 'set_global_state',
			delete_sensor: 'sensors/delete_sensor',

			set_assets: 'assets/set_assets',

			fetch_dataset_formulas: 'sensors/fetch_dataset_formulas',
			fetch_controllers: 'controllers/fetch_controllers',
			fetch_bearings: 'bearings/fetch_bearings',
			fetch_lube_types: 'lube_types/fetch_lube_types',
			fetch_banner_subtypes: 'banner_v2_subtypes/fetch_subtypes',

			fetch_metric_multi_views: 'equipments/fetch_metric_multi_views',
			save_metric_multi_views: 'equipments/save_metric_multi_views'
		}),

		toggleSaving(val) {
			this.$emit('event', { eventName: 'toggleSaving', data: val });
		},

		successModalSubmit(val) {
			// console.log('successModalSubmit 3', val)
			this.$emit('event', 'successModalSubmit', val);
		},

		validateForm() {
			this.formSubmitFinishCount = 0;
			this.formSubmitSuccessCount = 0;
			this.formsCount = 0;

			this.handleValidationResult([
				this.validateSubItemsForm(this.subItemsSettings)
			]);
		},

		handleValidationResult(validationResults, options) {
			if ( validationResults.every(item => item) ) {
				// console.log('all valid', validationResults)
				if (this.subItemsSettings) {
					if (this.collectDataFromSubItems) {
						this.resetFormDataBySubItems(this.subItemsSettings);
						// console.log('formData 1', this.formData)
						let { equipmentSubmitPayload, multiViewsItems } = this.collectDataFromSubItems(this.subItemsSettings, options);

						// 1 = equipment
						this.formsCount = 1+this.sensorFormsList.length;

						this.submitEquipment(equipmentSubmitPayload);
						
						if (this.itemData && this.itemData.id) {
							this.formsCount += 1; // multiViews
							this.submitMultiViews(multiViewsItems);							
						}
					}
				}			
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
				return false;
			}
		},

		// -----------------------
		submitEquipment(equipmentSubmitPayload) {
			const {equipmentForm, withFile, desiredId, className} = equipmentSubmitPayload;
			let payload = {
				data: { ...prepareSubmitData(equipmentForm) },
				withFile: withFile,
				itemName: 'Item'
			};

			/*if (payload) {
				console.log('payload equipment', payload.data)
				return
			}*/
			this.$emit('event', { eventName: 'toggleSaving', data: true });

			this.save_equipment(payload)
				.then(() => {
					if (desiredId) {
						this.submitReorder({
							currentId: equipmentForm.id,
							desiredId: desiredId,
							className: className
						});
					}

					this.handleFormSubmitFinish(true);
				})
				.catch(() => {
					this.handleFormSubmitFinish(false);
				});
		},

		submitMultiViews(multiViewsItems) {
			/*if (process.env.NODE_ENV === 'development') {
				console.log('multiviews', multiViewsItems);
				return;
			}*/
			
			this.$emit('event', { eventName: 'toggleSaving', data: true });
			
			this.save_metric_multi_views({ 
				data: { data:multiViewsItems || [] },
				equipmentId:this.itemData.id,
				itemName: 'Multi Views'
			})
				.then(() => {
					this.handleFormSubmitFinish(true);
				})
				.catch(() => {
					this.handleFormSubmitFinish(false);
				});
		},

		handleFormSubmitFinish(success) {
			this.formSubmitFinishCount++;
			if (success) {
				this.formSubmitSuccessCount++;				
			}
			// console.log(this.formSubmitFinishCount , this.formsCount)
			if (this.formSubmitFinishCount >= this.formsCount) {
				this.toggleSaving(false);
				
				if (this.formSubmitSuccessCount >= this.formsCount) {
					this.successModalSubmit(true);
					if (this.successSubmitCallback) {
						// console.log('successSubmitCallback')
						this.successSubmitCallback();
					}

					if (this.propsSuccessSubmitCallback) {
						// console.log('propsSuccessSubmitCallback')						
						this.propsSuccessSubmitCallback();
					}					
				}
			}
		},

		removeSensorItem({ sensorId, isNew }) {
			if (isNew) {
				this.removeFormItem(sensorId, 'sensorFormsList');
			} else {
				this.handleDeleteSensor(sensorId);
			}
		},

		test() {
			this.set_global_state({
				stateProp: 'updateItemsList',
				value: { key:'equipmentsList', val: true }
			});
		},

		handleDeleteSensor(sensorId) {
			const { tt } = this;
			this.$confirm({
				title: tt('Warning'),
				message: `${tt('aliases.del_sensor')}. ${tt('Continue')}?`,
				confirmButtonText: tt('Remove'),
				showCancelButton: true,
				cancelButtonText: tt('Cancel'),
				iconClass: 'icomoon icon-warning',
				type: 'warning'
			})
				.then(() => {
					this.delete_sensor({ data: { ids: [sensorId] } }).then(() => {
						this.removeFormItem(sensorId, 'sensorFormsList');
						this.set_global_state({
							stateProp: 'updateItemsList',
							value: { key:'equipmentsList', val: true }
						});
					});
				})
				.catch(() => {
					/*this.$message({
						type: 'info',
						message: 'Delete canceled'
					});*/
				});
		},

		submitReorder(data) {
			this.formsCount++;

			const payload = {
				notNotify: true,
				data: data
			};
			// console.log(payload);
			this.reorder_equipment(payload);
		},

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

		// -------------
		handleFetch(fetchList) {
			fetchList.forEach(li => {
				const { action, keyPrefix, payload } = li;
				// console.log(li, keyPrefix, this[`${keyPrefix}_initiated`])
				if (!this[`${keyPrefix}_initiated`]) {
					this[`${keyPrefix}_initiated`] = true;
					this.doFetchAction(
						action,
						`${keyPrefix}List`,
						`${keyPrefix}Loading`,
						payload || {}
					);
				}
			});
		}
	},

	watch: {
		multiViewsList(list) {
			this.multiViewFormsList = this.setupFormSubItemsList(list, 'mv_i');
		}
	},

	created() {
		if (this.itemData && this.itemData.id) {
			this.fetchMultiViews(this.itemData.id);
		}
	},

	beforeMount() {

		// const payload = { params: { max: -1, withoutEquipments: true } };
		// this.doFetchAction('fetch_sensors', 'sensorsList', 'sensorsLoading', payload);

		// console.log(this.itemData)
		const { itemData } = this;
		if (itemData) {
			this.sensorFormsList = this.setupFormSubItemsList(
				itemData.dashboardSensors,
				's_i'
			);			
		}
	},

	beforeDestroy() {
		this.set_assets([]);
	}
};
</script>
