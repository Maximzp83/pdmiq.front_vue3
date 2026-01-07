<template>
	<div class="sensor-form-item content-row">
		<VueElementLoadingWrapper :isSaving="!!sensorSaving" :itemsName="itemsName.one" />

		<div class="section-row edit-form-container " v-if="isNew">
			<div class="el-form-item flex align-center inline-form-row">
				<div class="el-form-item__label">{{ tt('phrases.Existing_sensors') }}</div>
				<div class="el-form-item__content">
					<FetchByQuerySelect
						clearable
						enableLoadmore
						v-model="sensor_id"
						:optionsLoading.sync="sensorsLoading"
						:optionsList.sync="sensorsList"
						:settings="sensorQueryOptions"
						:placeholder="`${tt('select')} ${tt('sensor')}`"
						:setupLabelMethod="setupSensorLabelMethod"
					/>

					<!-- <CustomSelect
						clearable
						filterable
						:optionsLoading="sensorsLoading"
						:optionsList="sensorsList"
						:placeholder="`${tt('select')} ${tt('sensor')}`"
						v-model="sensor_id"
						:setupLabelMethod="setupSensorLabelMethod"
					/> -->
						<!-- :setupLabelSettings="sensorLabelOptions" -->
				</div>
			</div>
		</div>

		<div class="section-row sensor-tabsbar card-tabs">
			<TabsBar
				card
				@switchTab="switchTab"
				:activeTab="activeTab"
				:tabsList="tabsList"
				:disableTabs="disableTabs"
				:buttonsType="'info inverted'"
			/>
		</div>

		<div class="section-row content-row flex">
			<div class="article-title bold">{{ `${tt('Sensor')} ${sensorTitle}` }}</div>

			<el-button
				v-if="
					$hasAccessTo(['delete_dashboard']) &&
						(activeTab.prop != 'NCDTab' || isNew || itemData.is_archived)
				"
				class="ml-auto action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</div>

		<!-- <div class="form-wrapper card-content" v-if="loadContent"> -->
		<div
			v-if="activeTab.prop == tabsList[0].prop"
			:key="tabsList[0].prop"
			class="tab-container content-row"
		>
			<!-- v-if="itemType === SENSOR_TYPES.BANNER" -->
			<ItemForm
				:class="{ showJustInfo: !hasAccessToCreate }"
				ref="ItemFormComponent"
				@event="handleEventNew"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				:formulasList="formulasList"
				:controllersList="banner_controllersList"
				:bannerSubtypesList="banner_subtypesList"
				:ultrasound_controllersList="ultrasound_controllersList"
				:commonItemsLoadings="commonItemsLoadings"
				:lubeTypesList="lubeTypesList"
				:bearingsList="bearingsList"
			/>
		</div>

		<div
			v-if="activeTab.prop == tabsList[1].prop"
			:key="tabsList[1].prop"
			class="tab-container section-row"
		>
			<!-- v-if="itemType === SENSOR_TYPES.ULTRA_SOUND" -->
			<!-- @submit="handleSubmitUltrasoundForm" -->
			<ItemFormUltraSound
				:class="{ showJustInfo: !hasAccessToCreate }"
				ref="ItemFormComponent"
				@event="handleEvent"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				:formulasList="formulasList"
				:bearingsList="bearingsList"
				:lubeTypesList="lubeTypesList"
				:controllersList="ultrasound_controllersList"
				:commonItemsLoadings="commonItemsLoadings"
			/>
				<!-- :banner_controllersList="banner_controllersList" -->
		</div>

		<div
			v-if="activeTab.prop == tabsList[2].prop"
			:key="tabsList[2].prop"
			class="tab-container content-row"
		>
			<ItemFormNCD
				:class="{ showJustInfo: !hasAccessToCreate }"
				ref="ItemFormComponent"
				@event="handleEvent"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				:formulasList="formulasList"
				:controllersList="ncd_controllersList"
				:commonItemsLoadings="commonItemsLoadings"
			/>
		</div>

		<!-- <div
			v-if="activeTab.prop == tabsList[2].prop"
			:key="tabsList[2].prop"
			class="tab-container section-row"
		>
			<ItemFormUltraSoundWhiteRiver
				ref="ItemFormComponent"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:new_item_type="SENSOR_TYPES.ULTRA_SOUND_WHITE_RIVER"
			/>
		</div> -->
		<!-- </div> -->
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { navigation, tabsMixin, eventHandler, subItemsListMixin } from '@/mixins';
import { SENSOR_TYPES, DATASET } from '@/constants/global';
import { LUBE_VERSIONS } from '@/constants/ultrasound';
import { findItemBy, setupLabel } from '@/helpers';

export default {
	mixins: [
		navigation(),
		tabsMixin(),
		eventHandler(),
		// webSocketMixin(),
		subItemsListMixin()
	],
	// name: 'SensorPage',

	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		ItemForm: () => import('./ItemForm.vue'),
		ItemFormUltraSound: () => import('./ItemFormUltraSound.vue'),
		ItemFormNCD: () => import('./ItemFormNCD.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
	},

	props: {
		fromModal: Boolean,
		itemData: {
			type: Object,
			default: () => ({})
		},
		equipmentData: {
			type: Object,
			default: () => ({})
		},

		hasAccessToCreate: Boolean,

		/*itemsName: {
			type: Object,
			default: () => ({})
		},*/

		// sensorsList: Array,
		// sensorsLoading: Boolean,

		formulasList: Array,
		bearingsList: Array,
		lubeTypesList: Array,
		banner_controllersList: Array,
		banner_subtypesList: Array,
		ultrasound_controllersList: Array,
		ncd_controllersList: Array,
		commonItemsLoadings: Object
	},

	data() {
		return {
			// item_type: SENSOR_TYPES.BANNER,
			sensorsList: [],
			sensorsLoading: false,

			sensorSaving: false,
			// pumpSaving: false,
			disableTabs: false,
			sensor_id: null,
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'ItemFormComponent', submitInSubItem:1  /*targetProp: 'sensorItemSubmit'*/ },
		]),

		itemsName() {
			return {
				one: this.$t('Sensor'),
				mult: this.$t('Sensors')
			};
		},
		isNew: that => that.itemData.new,

		sensorQueryOptions() {
			return Object.freeze({
				fetchAction: 'sensors/fetch_sensors',
				params: { 
					max: 100, withoutEquipments: true,
					// plantId: this.plantId || this.globalFilters.plantId
				},

				// params: { plantId: this.plantId || this.globalFilters.plantId }
			});
		},

		selectedSensorData() {
			const { itemData, sensorsList, isNew } = this;

			if (isNew) {
				if (this.sensor_id && sensorsList.length) {
					return findItemBy('id', this.sensor_id, this.sensorsList);
				}
			} else if (itemData && itemData.id) {
				return Object.freeze(itemData);
			}
			return undefined;
		},

		sensorTitle() {
			const { itemData, isNew } = this;

			if (isNew) {
				return this.$t('New');
			} else if (itemData) {
				return itemData.asset_numbers || '';
			}

			return '';
		},

		sensorType: {
			get: function() {
				if (this.selectedSensorData) {
					return this.selectedSensorData.type;
				}
				return null;
			}

			/*set: function(val) {
				this.item_type = val;
			}*/
		},

		SENSOR_TYPES: () => SENSOR_TYPES,

		tabsList: that =>
			Object.freeze([
				{ title: 'banner', prop: 'bannerTab', item_type: SENSOR_TYPES.BANNER },
				{
					title: 'ultraSound',
					prop: 'ultrasoundTab',
					item_type: SENSOR_TYPES.ULTRA_SOUND
				},
				{
					title: `NCD ${that.tt('Sensor')}`,
					prop: 'NCDTab',
					item_type: SENSOR_TYPES.NCD
				}
				/*{
				title: 'whiteRiver',
				prop: 'whiteRiverTab',
				item_type: SENSOR_TYPES.ULTRA_SOUND_WHITE_RIVER
			}*/
			]),

		sensorLabelOptions: () =>
			Object.freeze({
				accessors: ['asset_numbers', 'data_set', 'controller.name', 'port_number'],
				useGetItemValue: [
					{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }
				],
				delimeter: ','
			}),
	},

	methods: {
		...mapActions({
			show_edit_modal: 'show_edit_modal',
			set_global_state: 'set_global_state'
		}),

		/*successModalSubmit(val) {
			// console.log('successModalSubmit 2')
			this.$emit('event', 'successModalSubmit', val);
		},*/
		setupSensorLabelMethod(sensor) {
			const {data_set, device_address_id, controller, fft_sensor_id} = sensor;

			if (data_set === DATASET.BANNER_TEMP_VIBE_V2 || data_set === DATASET.BANNER_V2_GENERIC) {
				return `${controller.name}, D${device_address_id}, S${fft_sensor_id}`;
			} else {
				return setupLabel(sensor, this.sensorLabelOptions);
			}
		},

		// это надо бы вынести в миксин типа SubItemMixin, но без методов работы с формой
		validateItemForm() { 
			let validationResults = [];
			if (this.hasAccessToCreate) {
				// this.formPayload = {};
				// this.$refs.ItemFormComponent.validateForm();
				validationResults.push(
					this.validateSubItemsForm(this.subItemsSettings)
				);
			} else {
				this.$notify({
					type: 'warning',
					title: this.tt('phrases.restricted_actions'),
					message: `${this.tt(
						'phrases.you_do_not_have_permissions_to_save'
					)} ${this.tt('sensors')}`
				});

				validationResults.push(false);
			}

			// console.log('validationResults', validationResults)
			return validationResults.every(item => item);
		},

		// это надо бы вынести в миксин типа SubItemMixin, но без методов работы с формой
		submitItemForm() {
			// console.log('submitItemForm');
			// здесь это по сути submit сенсора из его компонента
			this.collectDataFromSubItems(this.subItemsSettings); 
		},

		// ---------------

		handleFormSubmitFinish({isLoading, success}) {
			this.toggleSpinner(isLoading);
			this.$emit('event', { eventName: 'handleFormSubmitFinish', data: success });
		},

		toggleSpinner(val) {
			this.sensorSaving = val;
		},

		removeItem() {
			this.$emit('onRemove', { sensorId: this.itemData.id, isNew: this.isNew });
		},

		toggleSaving(val) {
			this.$emit('event', { eventName: 'toggleSaving', data: val });
		},

		toggleMainPreloader(open, text) {
			if (open) {
				this.set_global_state({
					stateProp: 'overlay',
					value: {
						text: text || '',
						textStyle: { fontSize: '25px' }
					}
				});
				this.set_global_state({ stateProp: 'mainPreloader', value: true });
			} else {
				this.set_global_state({ stateProp: 'mainPreloader', value: false });
				this.set_global_state({ stateProp: 'overlay', value: {} });
				this.sensorSaving = false;
			}
		}
	},

	watch: {
		sensorType(type) {
			if (type) {
				for (const tab of this.tabsList) {
					if (tab.item_type === type) {
						this.activeTab = tab;
						this.disableTabs = true;
					}
				}
			} else {
				this.disableTabs = false;
			}
		}
	},

	created() {
		if (!this.isNew && this.itemData && this.itemData.id) {
			// для работы в форме banner сенсора
			const type = this.itemData.lube_version === LUBE_VERSIONS.V3
				? SENSOR_TYPES.BANNER
				: this.itemData.type;

			this.activeTab = findItemBy('item_type', type, this.tabsList);
			this.disableTabs = true;
		}
	},	
};
</script>
