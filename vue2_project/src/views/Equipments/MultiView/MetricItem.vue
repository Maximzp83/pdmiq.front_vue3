<template>
	<el-form ref="itemForm" :class="['flex mrow bottom']" :model="formData">
		<el-form-item prop="sensor_id" class="mcol-xs-5" required>
			<label v-if="itemIndex == 0">{{ tt('Sensor') }}</label>
			<FetchByQuerySelect
				@change="handleSensorChange"
				clearable
				enableLoadmore
				v-model="formData.sensor_id"
				:optionsLoading.sync="sensorsLoading"
				:optionsList.sync="sensorsList"
				:settings="sensorQueryOptions"
				:placeholder="`${tt('select')} ${tt('sensor')}`"
				:setupLabelMethod="setupSensorLabelMethod"
			/>
		</el-form-item>

		<el-form-item prop="metric_type" class="mcol-xs-5" required>
			<label v-if="itemIndex == 0">{{ tt('constants.Metric') }}</label>
			<el-select
				v-if="currentSensorType"
				@change="handleMetricTypeChange"
				filterable
				:placeholder="tt('parameter')"
				v-model="formData.metric_type"
			>
				<el-option
					v-for="item in sensorParametersList"
					:key="'param-' + item.id"
					:label="item.name"
					:value="item[selectValueKey]"
				/>
			</el-select>

			<!-- <CustomSelect
				v-if="currentSensorType"
				@change="handleMetricTypeChange"
				filterable
				:optionsList="sensorParametersList"
				:placeholder="tt('parameter')"
				v-model="formData.metric_type"
				:valueKey="selectValueKey"
			/> -->
		</el-form-item>

		<div class="mcol-xs-2">
			<el-button
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
import { mapActions } from 'vuex';
import { subItemMixin, sensorTypeMixin, fetchItemsHelper } from '@/mixins';
import { DATASET } from '@/constants/global';
import { chartsListsConfig } from '@/modules/charts_factory/controllers/Sensor/chartsListsConfig';

import { findItemBy, setupLabel, removeDuplicatesObjectsArray } from '@/helpers';

export default {
	mixins: [subItemMixin(), sensorTypeMixin(), fetchItemsHelper()],
	components: {
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
	},

	props: {},

	data() {
		return {
			sensorItem: null,
			sensorsList: [],
			sensorsLoading: false,

			formData: {
				id: null,
				sensor_id: null,
				metric_type: null,
				banner_v2_subtype_parameter_id: null
			}
		};
	},

	computed: {
		// targetPropName: () => 'characters',
		deleteNewId: () => true,

		selectedSensorData() {
			const { formData, sensorsList } = this;

			if (formData.sensor_id && sensorsList.length) {
				return findItemBy('id', formData.sensor_id, this.sensorsList);
			}

			return undefined;
		},

		selectValueKey: that => (that.currentSensorType && that.currentSensorType.isBannerV2Generic) ? 'node_parameter' : 'id',

		sensorQueryOptions() {
			return Object.freeze({
				fetchAction: 'sensors/fetch_sensors',
				params: { 
					max: 30,
					// plantId: this.plantId || this.globalFilters.plantId
				},

				// params: { plantId: this.plantId || this.globalFilters.plantId }
			});
		},

		sensorLabelOptions: () =>
			Object.freeze({
				accessors: ['asset_numbers', 'data_set', 'controller.name', 'port_number'],
				useGetItemValue: [
					{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }
				],
				delimeter: ','
			}),

		currentSensorTypeDataKey: () => 'selectedSensorData',

		sensorParametersList() {
			const {	
				chartSettingsKey,
				// isBanner,	isBannerCM1L, isBannerTempVibe2,
				// isBannerV2_1,
				// isBannerS22UVT,
				isBannerV2Generic,
			} = this.currentSensorType;

			if (isBannerV2Generic) {
				if (this.selectedSensorData.bannerV2Subtype) {
					return Object.freeze(this.selectedSensorData.bannerV2Subtype.parameters);
				}
			} else if (chartSettingsKey) {
				const configsList = chartsListsConfig(chartSettingsKey);
				// console.log('configsList', configsList)
				if (configsList) {
					let result = [];
					configsList.forEach(ci => {
						result = result.concat(ci.requestsList);
					})

					return Object.freeze(removeDuplicatesObjectsArray(result, 'id'));
				}
			}
			return [];
		},
	},

	methods: {
		...mapActions({
			fetch_sensor: 'sensors/fetch_sensor',
		}),

		handleSensorChange() {
			this.formData.metric_type = null;
			this.formData.banner_v2_subtype_parameter_id = null;
		},

		handleMetricTypeChange(node_parameter) {
			const parameterItem = findItemBy('node_parameter', node_parameter, this.sensorParametersList);
			if (parameterItem) {
				this.formData.banner_v2_subtype_parameter_id = parameterItem.id;
			}
		},

		setupSensorLabelMethod(sensor) {
			const {data_set, device_address_id, controller, fft_sensor_id} = sensor;

			if (data_set === DATASET.BANNER_TEMP_VIBE_V2 || data_set === DATASET.BANNER_V2_GENERIC) {
				return `${controller.name}, D${device_address_id}, S${fft_sensor_id}`;
			} else {
				return setupLabel(sensor, this.sensorLabelOptions);
			}
		},

		fetchSensor(id) {
			this.doFetchAction(
				'fetch_sensor',
				`sensorItem`,
				`sensorsLoading`,
				{ itemId: id }
			);
		},

		localGetFormDataCallback(formData) {
			if (!this.currentSensorType || !this.currentSensorType.isBannerV2Generic) {
				delete formData.banner_v2_subtype_parameter_id;
			}
			return formData;
		}
	},

	watch: {
		sensorItem(sensor) {
			this.sensorsList = [sensor];
		}
	},

	created() {
		if (this.itemData && this.itemData.sensor_id) {
			this.fetchSensor(this.itemData.sensor_id);
		}
	}
};
</script>
