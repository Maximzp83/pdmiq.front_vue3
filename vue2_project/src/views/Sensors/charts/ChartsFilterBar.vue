<template>
	<div class="button-item charts-filter-bar">
		<el-popover
			placement="bottom-end"
			popper-class="charts-filters-popover"
			trigger="manual"
			v-model="chartFiltersPopoverShow"
			:width="210"
		>
			<form class="popover-content"
				@submit.prevent="applyChartsFilters"
			>
				<!-- @submit.prevent="handleValidateRefsItems" -->
				<div class="filter-options-list">
					<FilterOption
						ref="FilterOption"
						v-for="item in sensorParametersList"
						:key="'sensorParam_id-' + item.id"
						:optionData="item"
						:filterData="filters[`chart-${item.id}`]"
					/>
				</div>

				<!-- :disabled="!chartFilter.min" -->
				<div class="footer-block">
					<!-- @click="handleSaveItem" -->
					<el-button
						type="primary"
						native-type="submit"
						class=""
						:loading="isLoading"
						v-text="tt('Apply')"
					/>

					<!-- <el-button
						@click="clearChartsFilter"
						:disabled="isLoading"
						type="primary"
						native-type="button"
						class="inverted"
						v-text="'Clear'"
					/> -->
				</div>
			</form>

			<el-button
				slot="reference"
				type="primary"
				native-type="button"
				@click="chartFiltersPopoverShow = !chartFiltersPopoverShow"
				:class="['chart-filter-selector', { active: chartFiltersPopoverShow }]"
			>
				<div>
					<span v-text="activeFilters.text" class="text"></span>
					<i class="icomoon icon-path_2 icon"></i>
				</div>
			</el-button>
		</el-popover>

		<el-button
			v-show="activeFilters.count"
			@click="clearChartsFilter"
			:disabled="isLoading"
			native-type="button"
			class="clearFilter-button icon disable-flex"
			icon="icomoon icon-cross"
		/>
	</div>
</template>

<script>
import FilterOption from './FilterOption.vue';
import { subItemsListMixin } from '@/mixins';

export default {
	mixins: [subItemsListMixin()],
	components: { FilterOption },
	props: {
		sensorParametersList: {
			type: Array,
			required: true
		},
		isLoading: Boolean
	},

	data() {
		return {
			chartFiltersPopoverShow: false
		};
	},

	computed: {
		filters() {
			return this.$store.state.sensors.charts_filters;
		},

		activeFilters() {
			let text = '';
			let count = 0;

			const { filters } = this;

			for (let param of this.sensorParametersList) {
				const filter = filters[`chart-${param.id}`];

				if (filter && filter.y_min) {
					text += `${param.name}, `;
					count++;
				}
			}
			if (text.length > 1) {
				text = text.slice(0, -2);
			}

			text = text.length > 0 ? text : this.tt('Filter');

			return { text: text, count: count };
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'FilterOption', returnArray: true },
		]),
	},

	methods: {
		clearChartsFilter() {
			this.subItemsSettings.forEach(settingsItem => {
				this.operateRefs({
					settingsItem,
					operation: Instance => { Instance.clearFilter(); }
				})
			});
			this.applyChartsFilters();
		},

		applyChartsFilters() {
			var collectedFilters = this.collectDataFromSubItems(this.subItemsSettings);
			
			if ( collectedFilters.result?.every(fi => fi.isValid) ) {
				var newFilters = { ...this.filters };
				collectedFilters.result.forEach(fi => {
					newFilters[`chart-${fi.sensorParameterId}`] = { y_min: fi.value };
				});
				this.$store.dispatch('sensors/set_charts_filters', newFilters);
			} else {
				this.$notify({
					type: 'warning',
					// title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.all_values_must_be_a_number`),
				});
			}
		},
	}
};
</script>
