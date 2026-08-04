<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading || fftLoading || equipmentLoading"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper statistics-page fft-statistics-page">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div
						class="card-header flex mrow wrap align-center space-between main-card-header"
						v-if="loadContent && fftReady && equipmentData"
					>
						<SimpleSpinner :active="fftLoading" />
						
						<div class="images-part mcol-xs-12 mcol-sm-2">
							<EquipmentPictureBlock
								@event="handleEventNew"
								:equipmentData="equipmentData"
							/>
						</div>

						<div class="flex wrap align-center fluid mcol-xs-8">
							<div
								class="title outside-bg-addition article-title capitalize span-block fluid"
							>
								<div v-html="sensorTitle"></div>
							</div>
							<span class="ml-auto mt-0 article-title outside-bg-addition timestamp">
								{{ fftTimeStamp }}</span
							>

							<div class="mcol-xs-12 flex">
								<div class="card filled_4 request-type-block">
									<span v-if="isManualRoute">{{ fftMetricName }}</span>
									<template v-else>
										<span v-if="isUltrasoundFFT">Fmax = </span>
										<span v-else>{{ requestType }} - </span>
										<span class="no-margin">{{ requestFMax }}</span>
									</template>
								</div>
								
							</div>
						</div>

						<div class="mcol-xs-auto flex align-center prev-next-buttons-block">
							<div
								:class="['button prev-button', { disabled: !prevFFTItem }]"
								@click="handleFFT({ prev: 1 })"
							>
								<i class="icomoon icon-path_2"></i>
							</div>

							<div
								:class="['button next-button', { disabled: !nextFFTItem }]"
								@click="handleFFT({ next: 1 })"
							>
								<i class="icomoon icon-path_2 rotate"></i>
							</div>
						</div>

						<div class="rpm-block content-row" v-if="equipmentRPM">
							{{ `${tt('rpm')}: ${equipmentRPM}` }}
						</div>

						<div class="mcol-xs-12 content-row">
							<AnalysisFFTContainer
								ref="AnalysisFFTContainer"
								:itemData="equipmentData"
								:sensorData="itemData"
								:fftItem="currentFFTItem"
								@event="handleEventNew"
								:selectedChildComponentIds="selectedChildComponentIds"
								:rootFilters="{ measurement }"
								:metaDataEntries="metaDataEntries"
							/>
						</div>
					</div>

					<div
						class="section-row margin-top-row axis-selection-container flex justify-center"
					>
						<RadioButtonsBlock
							v-if="!isManualRoute"
							v-show="!splitCharts"
							@onChange="val => (activeAxis = val)"
							:settings="axisRadioBlockSettings"
							:optionsList="axisRadioButtonsList"
							:value="activeAxis"
						/>

						<div class="toggle-dropdown-button">
							<el-button
								:type="'primary'"
								native-type="button"
								:class="[
									'action-button inverted re-baseline-button operations-button toggle-additional-filters',
									{ active: showFilterbar }
								]"
								:icon="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"
								@click="e => toggleFilterbar(e)"
							/>
						</div>
					</div>

					<DropdownFilterbar
						ref="DropdownFilterbar"
						hideToggleButton
						filterbarDropdownId="statisticsPageDropdownFilterbar"
					>
						<div
							class="charts-page-operations flex justify-end triangle pos-top mcol-xs-12"
						>
							<div class="button-item">
								<el-button
									v-if="!isManualRoute"
									@click="handleSplitCharts"
									type="primary"
									native-type="button"
									:class="['report-button', { active: splitCharts }]"
									:icon="`icomoon icon-overlay`"
									class="inverted"
									>{{ tt('Split') }}
								</el-button>
							</div>
							<div class="button-item">
								<el-button-group>
									<el-button
										v-for="item in metricSystemsList"
										:key="`metricSystem-${item.id}`"
										@click="switchMetricSystem(item)"
										type="primary"
										native-type="button"
										v-text="item.name"
										:class="{ active: measurement === item.id }"
										class="inverted"
									/>
								</el-button-group>
							</div>
						</div>
					</DropdownFilterbar>

					<div class="1section-row card-content" v-if="loadContent && fftReady && currentFFTItem && equipmentData">
						<FFTChartsListWrapper
							ref="FFTChartsListWrapper"
							@event="handleEventNew"
							:activeAxis="activeAxis"
							:sensorId="itemData.id"
							:fftId="+fftId"
							:sensorData="itemData"
							:splitCharts="splitCharts"
							:rootFilters="{ measurement }"
							:prevFFTItems="prevFFTPreparedItems"
							:currentFFTItem="currentFFTItem"
							:additionalProps="chartsAdditionalProps"
							:getParamsByIds="getParamsByIds"
						/>
					</div>

					<!-- <div class="text-center" v-if="!fftLoading && loadContent && !fftReady">{{ tt('phrases.FFT_data_is_not_valid') }}</div> -->
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
// import HighchartsVue from 'highcharts-vue';
// Vue.use(HighchartsVue);

import Highcharts from 'highcharts';
// console.log('Highcharts 1', Highcharts)

import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
import draggablePoints from 'highcharts/modules/draggable-points';

import highchartsMore from 'highcharts/highcharts-more';
import annotations from 'highcharts/modules/annotations';

// import highcharts3d from 'highcharts/highcharts-3d';

stockInit(Highcharts);
boost(Highcharts);
draggablePoints(Highcharts);

highchartsMore(Highcharts);
annotations(Highcharts);

// highcharts3d(Highcharts);

import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapActions, mapState } from 'vuex';
import {
	/*getYmdDateString,*/ cleanDateString,
	cloneDeep,
	findItemBy,
	getRoundedValue,
	getItemValue
} from '@/helpers';
import {
	getSensorMetricSystemType,
	getSensorTitle
} from '@/helpers/specialHelpers';
// import { timeZonesList } from '@/constants/date_time';

import {
	bannerRequestFmaxTypesList,
	bannerRequestTypesList
} from '@/constants/global';

import {
	sensorParametersListNCD,
	ncdAxisList,
	metricSystemsList,
	METRIC_SYSTEM_TYPES,
	NCD_SENSOR_PARAMETERS_TYPES,
	SENSOR_PARAMETERS_TYPES,
	manualRouteSensorParametersList
} from '@/modules/charts_factory/controllers/Sensor/enums';

import { initPageDataMixin, sensorTypeMixin, fetchItemsHelper, eventHandler } from '@/mixins';

export default {
	mixins: [initPageDataMixin(), sensorTypeMixin(), fetchItemsHelper(), eventHandler()],
	name: 'FFTStatPage',

	components: {
		DropdownFilterbar: () => import('@/components/common/DropdownFilterbar.vue'),
		FFTChartsListWrapper: () => import('./charts/fft/FFTChartsListWrapper.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		EquipmentPictureBlock: () => import('./charts/EquipmentPictureBlock.vue'),
		AnalysisFFTContainer: () => import('./AnalysisFFT/AnalysisFFTContainer.vue')
	},

	data: () => ({
		activeAxis: 1,
		prevFFTItems: [],
		prevFFTItem: null,
		currentFFTItem: null,
		nextFFTItem: null,
		fftLoading: false,
		fftReady: false,

		showFilterbar: false,
		splitCharts: false,
		measurement: null,

		// -------------
		equipmentLoading: false,
		equipmentData: null,

		selectedChildComponents: []
	}),

	computed: {
		...mapState({
			filters: state => state.sensors.fft_statistics_filters
		}),

		metricSystemsList: () => Object.freeze(metricSystemsList()),

		itemsName() {
			return {
				one: this.$t('FFT'),
				mult: this.$t('FFTs')
			};
		},
		navbarSettings() {
			let settings = {
				// navigateButton: { history: true, steps: -1 },
				// showStandardNavItem: true,
				hideBackButton: true,
				pageTitle: `${this.$t('phrases.Spectrum_Analysis')} ${this.$t('Page')}`
			};

			return Object.freeze(settings);
		},

		/*timeZone() {
			if (this.currentFFTItem) {
				return findItemBy('id', this.currentFFTItem.controller.plant.time_zone, timeZonesList)
			}
			return null;
		},*/

		axisRadioBlockSettings: () =>
			Object.freeze({
				hideTitle: true,
				inline: true,
				buttonType: 'primary',
				className: 'inverted standard'
			}),

		axisRadioButtonsList() {
			let result = [];

			if (this.itemData) {
				const {
					ncd_active_vertical_axis,
					is_hidden_ncd_active_vertical_axis
				} = this.itemData;

				const { isUltrasoundFFT } = this;

				ncdAxisList.forEach(axis => {
					const axis_name = isUltrasoundFFT ? axis.ultrasound_fft_name : axis.name;
					if (ncd_active_vertical_axis === axis.id) {
						if (!is_hidden_ncd_active_vertical_axis) {
							result.push({ ...axis, name: axis_name + ' (V)' });
						}
					} else {
						result.push({ ...axis, name: axis_name });
					}
				});
			}

			return Object.freeze(result);
		},

		// prevFFTItem: that => that.prevFFTItems.length ? that.prevFFTItems[0] : null,

		fftId: that => +that.$route.params.fftId,
		prevFFTId: that => (that.prevFFTItem ? that.prevFFTItem.id : null),

		prevFFTPreparedItems() {
			if (this.currentFFTItem) {
				let items = [];
				items.push({
					id: this.currentFFTItem.id,
					created_at: cleanDateString(this.currentFFTItem.created_at),
					isCurrent: true
				});

				this.prevFFTItems.forEach(item => {
					items.push({
						id: item.id,
						created_at: cleanDateString(item.created_at)
					});
				});

				return items;
			}

			return [];
		},

		fftTimeStamp() {
			/*const { currentFFTItem, timeZone } = this;
			if (currentFFTItem && timeZone) {
				return getYmdDateString({
					dateObj: convertTZ(currentFFTItem.created_at, timeZone.label),
					withTime: true
				});
			}*/
			const { currentFFTItem } = this;
			if (currentFFTItem) {
				return cleanDateString(currentFFTItem.created_at);
			}

			return '';
		},

		equipmentRPM() {
			const { currentFFTItem, itemData, measurement } = this;
			if (currentFFTItem && currentFFTItem.rpm_value != null) {
				return `${currentFFTItem.rpm_value} RPM`;
			}
			if (itemData && itemData.equipment_rpm) {
				if (measurement === METRIC_SYSTEM_TYPES.IMPERIAL) {
					return `${itemData.equipment_rpm} CPM`;
				} else if (measurement === METRIC_SYSTEM_TYPES.METRIC) {
					return `${getRoundedValue(+itemData.equipment_rpm / 60, 0, 2)} Hz`;
				}
			}
			return '';
		},

		isUltrasoundFFT: that => that.currentSensorType.isBannerM25,
		isManualRoute: that => that.currentSensorType.isManualRoute,

		getParamsByIds() {
			if (this.isManualRoute && this.currentFFTItem) {
				return this.currentFFTItem.metric_type
					? [Number(this.currentFFTItem.metric_type)]
					: [];
			}
			if(this.isUltrasoundFFT) {
				return [
					NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM,
					NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM,
					// NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION,
					SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION,
					// NCD_SENSOR_PARAMETERS_TYPES.Y_TRANSFORM_ACCELERATION,
					NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION,
					// NCD_SENSOR_PARAMETERS_TYPES.Z_TRANSFORM_ACCELERATION,
					SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION,
					NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM,
					SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY
				]
			}
			return [];
		},

		fftMetricName() {
			if (this.currentFFTItem) {
				const parameter = manualRouteSensorParametersList(
					this.currentFFTItem.metric_type
				);
				return parameter ? parameter.name : this.tt('constants.fft');
			}
			return '';
		},

		metaDataEntries() {
			if (
				this.currentFFTItem &&
				this.currentFFTItem.meta_data &&
				typeof this.currentFFTItem.meta_data === 'object'
			) {
				return Object.keys(this.currentFFTItem.meta_data).map(key => ({
					key,
					value: this.currentFFTItem.meta_data[key]
				}));
			}
			return [];
		},

		requestType() {
			if (this.itemData && this.currentFFTItem) {
				const { banner_request_type } = this.currentFFTItem;
				return getItemValue(banner_request_type, 'name', bannerRequestTypesList());
			}
			return '';
		},

		requestFMax() {
			if (this.itemData && this.currentFFTItem) {
				const { banner_request_fmax } = this.currentFFTItem;
				return getItemValue(
					banner_request_fmax,
					'name',
					bannerRequestFmaxTypesList()
				);
			}
			return '';
		},

		currentSensorTypeDataKey: () => 'itemData',

		sensorTitle() {
			if (this.itemData && this.currentFFTItem) {
				// console.log(this.itemData)
				return getSensorTitle(this.itemData, { 
					boldLabels: true,
					linkSettings: {
						key: 'location_in_equipment',
						to: this.isManualRoute
							? `/equipments/${this.itemData.equipment_id}/details/manual-route`
							: `/equipments/${this.itemData.equipment_id}/details/pdm/${this.itemData.id}`
					}
				});
			}
			return '';
		},

		chartsAdditionalProps() {
			return {
				selectedChildComponents: this.selectedChildComponents,
				equipmentData: this.equipmentData,
				isUltrasoundFFT: this.isUltrasoundFFT,
				isManualRoute: this.isManualRoute
			}
		},

		selectedChildComponentIds() {
			return this.selectedChildComponents.map(item => item.id);
		},
	},

	methods: {
		...mapActions({
			fetch_item: 'sensors/fetch_sensor',
			fetch_equipment: 'equipments/fetch_equipment',

			fetch_ncd_fft: 'sensors/fetch_ncd_fft',
			fetch_global_plants: 'fetch_global_plants',
			set_filters: 'sensors/set_fft_statistics_filters'
		}),

		toggleFilterbar(e) {
			this.showFilterbar = !this.showFilterbar;
			this.$refs.DropdownFilterbar.toggleFilterbar(e);
		},

		updateEquipmentAndFFT({equipmentItem, fftItem, skipFFTReload, updateRpmValue, updateVibrationAnalysisRules}) {
			// console.log('reFetchEquipment', equipmentItem, fftItem, skipFFTReload, updateRpmValue)
			// this.fetchEquipment(this.itemData.equipment_id);
			/*if (callChartsMethod) {
				if (this.$refs.FFTChartsListWrapper) {
					this.$refs.FFTChartsListWrapper.callChartsMethod({
						name: callChartsMethod.name,
						payload: fftItem
					});
				}
			}*/

			// ---------------
			if (equipmentItem) {
				setTimeout(() => {
					this.equipmentData = equipmentItem;
				}, 10)
			}
			if (fftItem) {
				if (updateRpmValue) {
					// console.log('fftItem', fftItem)
					this.currentFFTItem.rpm_value = fftItem.rpm_value;
				}

				if (updateVibrationAnalysisRules) {
					this.currentFFTItem.vibration_analysis_rules = fftItem.vibration_analysis_rules;
				}

				if (!skipFFTReload) {
					this.fftReady = false;	
					setTimeout(() => {
						this.currentFFTItem = fftItem;
					}, 10)
				}
			}
			// this.selectedChildComponents = [];
		},

		fetchEquipment(id) {
			this.doFetchAction('fetch_equipment', 'equipmentData', 'equipmentLoading', {
				itemId: id,
				prepareDataSettings: {
					addSettingItems: [
						{ key: 'brand', val_key: 'brand' },
						{ key: 'brand_model', val_key: 'model' },
					]
				}
				/*params: {
					rpm: 1000
				}*/
			});
		},

		fetchFFT({ urlPostfix, FFTItemKey }) {
			const payload = {
				sensorId: this.itemData.id,
				urlPostfix: urlPostfix,
				notNotifyError: true
			};
			this.fftLoading = true;

			this.fetch_ncd_fft(payload)
				.then(({ value }) => {
					this[FFTItemKey] = value;
					this.fftLoading = false;
				})
				.catch(() => {
					this[FFTItemKey] = null;
					this.fftLoading = false;
					this.fftReady = true;
				});
		},

		handleFFT({ prev, next }) {
			// console.log(prev, next, this.$route)
			const { currentFFTItem, prevFFTItem, nextFFTItem, itemData } = this;
			const {isBannerTempVibe2, isBannerV2_1, isBannerV2Generic } = this.currentSensorType;
			const url_type = (isBannerTempVibe2 || isBannerV2_1 || isBannerV2Generic) ? 'banner' : 'ncd';

			if (prev) {
				if (prevFFTItem) {
					this.fftReady = false;
					this.$router.replace(`/${url_type}/${itemData.id}/fft/${prevFFTItem.id}`);
					this.nextFFTItem = cloneDeep(currentFFTItem);
					this.currentFFTItem = cloneDeep(prevFFTItem);
					this.fetchFFT({
						FFTItemKey: 'prevFFTItems',
						urlPostfix: `/${prevFFTItem.id}/prev?max=9`
					});
				}
			} else if (next) {
				if (nextFFTItem) {
					this.fftReady = false;

					this.$router.replace(`/${url_type}/${itemData.id}/fft/${nextFFTItem.id}`);
					// this.prevFFTItem = cloneDeep(currentFFTItem);
					this.currentFFTItem = cloneDeep(nextFFTItem);
					this.fetchFFT({
						FFTItemKey: 'prevFFTItems',
						urlPostfix: `/${nextFFTItem.id}/prev?max=11`
					});
					this.fetchFFT({
						FFTItemKey: 'nextFFTItem',
						urlPostfix: `/${nextFFTItem.id}/next`
					});
				}
			}
		},

		handleSplitCharts() {
			this.splitCharts = !this.splitCharts;
		},

		switchMetricSystem({ id }) {
			this.measurement = id;
		},

		toggleEquipmentSaving(val) {
			this.equipmentLoading = val;			
		},

		addChildComponentToSelected(component) {
			const isSelected = this.selectedChildComponents.some(item => item.id === component.id);
			if (!isSelected) {
				this.selectedChildComponents.push(component);
			} else {
				this.selectedChildComponents = this.selectedChildComponents.filter(item => item.id !== component.id);
			}
		},

		clearSelectedChildComponentsOnCharts() {
			this.selectedChildComponents = [];
		},

		handleRpmCursorDrop(data) {
			const AnalysisFFTContainer = this.$refs.AnalysisFFTContainer;
			if (AnalysisFFTContainer) {
				AnalysisFFTContainer.saveRpmParams(data, {
					successMessage: `RPM ${this.tt('updated')}`,
					updateRpmValue: true,
					skipFFTReload: true,
					// callChartsMethod: {name: 'handleFFTRpmUpdated'}
				});
			}
		}
	},

	watch: {
		equipmentData(equipment) {
			if (equipment && this.itemData) {
				this.measurement = getSensorMetricSystemType(this.itemData, equipment);
			}
		},

		itemData(sensor) {
			if (sensor) {
				// console.log(sensor, this.itemData)

				this.fetchEquipment(sensor.equipment_id);

				this.fetchFFT({
					FFTItemKey: 'currentFFTItem',
					urlPostfix: `/${this.fftId}`
				});
				this.fetchFFT({
					FFTItemKey: 'prevFFTItems',
					urlPostfix: `/${this.fftId}/prev?max=9`
				});
				this.fetchFFT({
					FFTItemKey: 'nextFFTItem',
					urlPostfix: `/${this.fftId}/next`
				});

				this.measurement = getSensorMetricSystemType(sensor, this.equipmentData);
			}
		},

		prevFFTItems(items) {
			this.prevFFTItem = items && items.length ? items[0] : null;
		},

		currentFFTItem(fft) {
			if (fft && fft.alarm) {
				const { sensor_parameter_type } = fft.alarm;
				const paramItem = findItemBy(
					'id',
					sensor_parameter_type,
					sensorParametersListNCD()
				);
				if (paramItem && paramItem.axis_id) {
					this.activeAxis = paramItem.axis_id;
				}
			}

			setTimeout(() => {
				this.fftReady = true;
			}, 100);
		}
	}
};
</script>
