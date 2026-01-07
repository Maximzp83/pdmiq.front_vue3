<template>
	<div class="color-picker-list flex relative">
		<SimpleSpinner :active="itemsSaving" />

			<!-- @changeActiveColor="applyColor" -->
		<ChartColorPickerItem
			ref="ChartColorPickerItem"
			@saveColorScheme="saveColorScheme"
			class="flex align-center div-block"
			v-for="(item, idx) in metric_threshold_levels_color_schemes"
			:key="`color_item-${idx}`"
			:itemData="item"
			:predefineColors="predefineColors"
		/>			
	</div>
</template>

<script>
	import { mapActions } from 'vuex';

// import { findItemBy } from '@/helpers';

import {
	NCD_ALARM_TYPES,
	SENSOR_THRESHOLD_TYPES,
	// sensorThresholdsTypesList
} from '@/constants/global';

import { subItemsListMixin } from '@/mixins';

export default {
	mixins: [subItemsListMixin()],
	props: {
		ChartInstance: {type: Object, required: true},
		// ChartAPI: {type: Object, required: true},
		hasStatistics: Boolean,
		sensorId: Number
	},

	components: {
		ChartColorPickerItem: () => import('./ChartColorPickerItem.vue'),
	},

	data: () => ({
		predefineColors: [
			'#660000','#663200','#666600','#006600','#006666','#000066','#1e0034','#370066',
			'#990000','#994c00','#999900','#009900','#009999','#000099','#2d004e','#530099',
			'#cc0000','#cc6600','#cccc00','#00cc00','#00cccc','#0000cc','#3c0068','#6f00cc',
			'#ff0000','#ff7f00','#ffff00','#00ff00','#00ffff','#0000ff','#4b0082','#8b00ff',
			'#ff3333','#ff9933','#ffff33','#33ff33','#33ffff','#3333ff','#6f339b','#a233ff',
			'#ff6666','#ffb266','#ffff66','#66ff66','#66ffff','#6666ff','#9366b4','#b966ff',
			'#ff9999','#ffcc99','#ffff99','#99ff99','#99ffff','#9999ff','#b763cd','#d099ff',
			'#ffcccc','#ffe5cc','#ffffcc','#ccffcc','#ccffff','#ccccff','#dbcce6','#e7ccff',

			/*"#ff2600","#ff9300","#ffd100","#4cd964","#5ac8fa","#007aff","#5856d6","#ff2d55",'#942192','#aa7942','#919191','#000',

			'#00364a','#001e57','#11053b','#2e073e','#3c081b','#5c0700','#5a1c00','#583400','#553d00','#666100','#4f5503','#263e0f',
			'#1a5163','#1a3970','#2c2353','#482257','#572239','#76301a','#76361a','#744d1a','#71561a','#81791a','#6a6d1d','#425929',
			'#346c7c','#355388','#463d6c','#643870','#733853','#924734','#925134','#916934','#8e6f34','#9b912b','#849737','#5d7443',
			'#4e8795','#507ea1','#615885','#7f4f89','#8f526d','#ae5f4e','#ae6d4e','#ad824e','#aa893e','#b6ab45','#9fb052','#779f5c',
			'#68a2ae','#6a98bb','#7b74a0','#9b67a2','#ab6c87','#ca775f','#ca855f','#c79a5f','#c6a04a','#d1c551','#b9ca6d','#92b976',
			'#82bcc7','#83b3d4','#968fbb','#b67ebc','#c786a1','#e68f79','#e69b79','#e4b279','#e2b866','#ece06c','#d4e387','#acd390',
			'#9cd7e0','#9dcde9','#b0aad6','#d196d6','#e3a1bb','#ffb792','#ffbf92','#ffcb92','#ffd182','#fff985','#eefca2','#c7edaa',
			'#b6f1f9','#b6eaff','#cbc4f0','#ebb0ef','#fbc0d6','#ffd1ac','#ffd8ac','#ffe4ac','#ffea9e','#ffffa0','#ffffba','#e1ffd4',
			'#d0fbff','#d0f5ff','#e6deff','#f6d6ff','#ffe9f3','#ffeadd','#ffefdd','#fff3dd','#fff7d1','#ffffd4','#ffffe1','#f3ffed'		*/
		],
		colorShemeItemslist: [],
		itemsSaving: false,
		
		formData: {
			metric_type: null,
			color_schemes: [],
		}
	}),

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'ChartColorPickerItem', returnArray: true },
		]),

		// sensorThresholdsTypesList: () => Object.freeze(sensorThresholdsTypesList()),

		defaultList() {
			const {  chart_parameter_id, resources } = this.ChartInstance;
			const { parameterItem } = resources.chart_config.customSettings;

			if (parameterItem) {
				const { alarm_type } = parameterItem;
				// const { series, navigator } = this.ChartAPI;
				const { ALARM, WARNING, BASELINE } = SENSOR_THRESHOLD_TYPES;

				if (alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM) {
					return Object.freeze([
						{ 
							// chart_serie_idx: this.getSeriesIndex(series, ALARM),
							// chart_navigator_serie_idx: this.getSeriesIndex(navigator.series, ALARM),
							label: this.tt('phrases.High_Alarm'),
							threshold_level: ALARM,
							color_scheme: '#ff0000',
							metric_type: chart_parameter_id,
						},
						{ 
							// chart_serie_idx: this.getSeriesIndex(series, WARNING),
							// chart_navigator_serie_idx: this.getSeriesIndex(navigator.series, WARNING),
							label: this.tt('phrases.Low_Alarm'),
							threshold_level: WARNING,
							color_scheme: '#0e52ef',
							metric_type: chart_parameter_id,
						}
					]);
				} else if (alarm_type === NCD_ALARM_TYPES.WARNING_ALARM) {
					return Object.freeze([
						{ 
							// chart_serie_idx: this.getSeriesIndex(series, ALARM),
							// chart_navigator_serie_idx: this.getSeriesIndex(navigator.series, ALARM),
							label: this.tt('constants.Alarm'),
							threshold_level: ALARM,
							color_scheme: '#ff0000',
							metric_type: chart_parameter_id,
						},
						{ 
							// chart_serie_idx: this.getSeriesIndex(series, WARNING),
							// chart_navigator_serie_idx: this.getSeriesIndex(navigator.series, WARNING),
							label: this.tt('constants.Warning'),
							threshold_level: WARNING,
							color_scheme: '#ffde32',
							metric_type: chart_parameter_id,
						},
						{ 
							// chart_serie_idx: this.getSeriesIndex(series, BASELINE),
							// chart_navigator_serie_idx: this.getSeriesIndex(navigator.series, BASELINE),
							label: this.tt('constants.Good'),
							threshold_level: BASELINE,
							color_scheme: '#059966',
							metric_type: chart_parameter_id,
						}
					]);
				}
			}

			return [];
		},

		metric_threshold_levels_color_schemes() {
			// const { fetched_statistics_data, chart_parameter_id } = this.ChartInstance;
			const { hasStatistics } = this;
			
			if (hasStatistics) {
				let list = this.ChartInstance.getColorSchemesList();
				list = list.length ? list : this.defaultList;

				// console.log('calc list', list)
				return list;
			}

		 	return this.defaultList;
		},
	},

	methods: {
		...mapActions({
			set_sensor_chart_color_scheme: 'sensors/set_sensor_chart_color_scheme',
		}),

		/*getSeriesIndex(series, threshold_level) {
			return series.findIndex(
				si => si.options.customSettings && si.options.customSettings.threshold_level === threshold_level
			);
		},*/

		/*applyColor(data = {}) {
			const { chart_serie_idx, color, chart_navigator_serie_idx } = data;
			this.ChartAPI.series[chart_serie_idx].color = color;
			this.ChartAPI.navigator.series[chart_navigator_serie_idx].color = color;
			// setTimeout(() => { this.ChartAPI.redraw(); }, 100);
			this.ChartAPI.redraw();
		},*/

		saveColorScheme() {
			const payload = {
				itemId: this.sensorId,
				data: {
					metric_type: this.ChartInstance.chart_parameter_id,
					color_schemes: this.collectDataFromSubItems(this.subItemsSettings).result
				}
			}

			/*if (payload) {
				console.log(payload)
				return
			}*/
			this.itemsSaving = true;
			this.set_sensor_chart_color_scheme(payload)
				.then(({value}) => {
					// console.log(response)
					this.ChartInstance.updateFetchedColorSchemes(value)
					this.itemsSaving = false;
				})
				.catch(e => {
					this.itemsSaving = false;
					console.warn(e);
				});
		}
	},

	watch: {
		metric_threshold_levels_color_schemes(list) {
			console.log('metric_threshold_levels_color_schemes', list)
		}
	},

	created() {
		// console.log(this.ChartAPI)
		// window['ChartAPI'] = this.ChartAPI;
		/*if (this.metric_threshold_levels_color_schemes) {
			this.colorShemeItemslist = this.setupFormSubItemsList(list, 'mv_i');
		}*/

	}
};
</script>
