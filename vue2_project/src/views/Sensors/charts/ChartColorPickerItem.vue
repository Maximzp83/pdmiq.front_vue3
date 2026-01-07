<template>
	<div class="">
		<!-- @active-change="handleActiveChange" -->
		<el-color-picker
			class="span-block"
			@change="handleChange"
			v-model="formData.color_scheme"
			:predefine="predefineColors"
			color-format="hex"
			size="small"
		/>
		<span class="span-block">{{ itemData.label }}</span>
	</div>
</template>

<script>
// import { getItemValue, prepareRangeParams } from '@/helpers';

import {
	// equipmentTypesList
} from '@/constants/global';

import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		predefineColors: { type: Array, default: () => [] },
	},

	components: {
		ElColorPicker: () => import(/* webpackChunkName: "ElColorPicker" */ 'element-ui/lib/color-picker')
	},

	data: () => ({
		currentColorScheme: '',

		formData: {
			// sensor_id: null,
			// metric_type: null,
			threshold_level: null,
			color_scheme: ''
		}
	}),

	computed: {

	},

	methods: {
		handleActiveChange(color) {
			if (color) {
				this.$emit('changeActiveColor', {
					color,
					threshold_level: this.formData.threshold_level,
					metric_type: this.itemData.metric_type,
					chart_serie_idx: this.itemData.chart_serie_idx,
					chart_navigator_serie_idx: this.itemData.chart_navigator_serie_idx,
				});
			}
		},

		handleChange(color) {
			if (color) {
				// console.log(color);
				// this.formData.color_scheme = color;
				this.$emit('saveColorScheme', color)
			} else {
				this.formData.color_scheme = this.currentColorScheme;				
				/*this.$emit('changeActiveColor', {
					color: this.currentColorScheme,
					threshold_level: this.formData.threshold_level,
					metric_type: this.itemData.metric_type,
					chart_serie_idx: this.itemData.chart_serie_idx,
					chart_navigator_serie_idx: this.itemData.chart_navigator_serie_idx,
				});*/
			}
		},

		localSetupPageActions(itemData) {
			if (itemData) {
				this.currentColorScheme = itemData.color_scheme;

				/*if (itemData.applyOnCreate) {
					// console.log('changeActiveColor', itemData.color_scheme)
					this.$emit('changeActiveColor', {
						color: itemData.color_scheme,
						threshold_level: this.formData.threshold_level,
						metric_type: this.itemData.metric_type,
						chart_serie_idx: this.itemData.chart_serie_idx,
						chart_navigator_serie_idx: this.itemData.chart_navigator_serie_idx,
					});
				}*/
			}
		}
	}
};
</script>
