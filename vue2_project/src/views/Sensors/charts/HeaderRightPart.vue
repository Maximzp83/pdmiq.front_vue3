<template>
	<div class="buttons-container flex">
		<div class="header-item rebase-line-wrapper" v-if="isRebaseline">
			<span class="rebase-wheel animate">
				<img :class="[`suffix-icon`]" :src="rebase_wheel" />
			</span>
			<span class="rebase-lines">
				<img :class="[`suffix-icon`]" :src="rebase_lines" />
			</span>
		</div>

		<div class="header-item" v-if="is_high_speed">
			<div class="high-speed-icon-container">
				<i :class="`icomoon icon-high-speed`" />
			</div>
		</div>

		<div class="header-item problem-block" v-if="problems.length && !hideProblems">
			<el-popover
				placement="bottom-end"
				popper-class="problems-popover"
				title="Possible problems"
				width="354"
				trigger="hover"
			>
				<ul class="problems-list">
					<li
						v-for="(item, idx) in problems"
						:key="`problem-${item.id || idx * 5}-idx-${idx}`"
					>
						<i
							:class="
								`icomoon ${getItemValue(item.alert_rule, 'icon', alertRulesList)}`
							"
						/>
						<span class="value" v-text="item.title"></span>
					</li>
				</ul>

				<el-button slot="reference" class="problems-popover-button">
					<i :class="`icomoon icon-${problemIcon} ${problemAnimation}`" />
				</el-button>
			</el-popover>
		</div>

		<div class="header-item export-buttons" v-if="!hideExportButton">
			<el-button
				@click="handleExportChart"
				type="success"
				icon="icomoon icon-docs"
				class="inverted"
				size="mini"
				native-type="button"
			/>
		</div>

		<div class="header-item navigator-button" v-if="showToggleNavigator">
			<el-button
				@click="toggleNavigator"
				type="primary"
				icon="icomoon icon-zoom-in"
				:class="['inverted', { active: toggleNavigatorButtonActive }]"
				size="mini"
				native-type="button"
			/>
		</div>
	</div>
</template>

<script>
import { getItemValue, prepareRangeParams } from '@/helpers';

import {
	alertRulesList,
	rebase_wheel,
	rebase_lines,
	// equipmentTypesList
} from '@/constants/global';

import { exportListToFileMixin } from '@/mixins';

export default {
	mixins: [exportListToFileMixin()],
	props: {
		isRebaseline: Boolean,
		problems: { type: Array, default: () => [] },
		hideProblems: Boolean,
		is_high_speed: Boolean,
		parameterTypeItems: Array,
		hideExportButton: Boolean,
		showToggleNavigator: Boolean,
		toggleNavigatorButtonActive: Boolean,
		rootFilters: Object,
		sensorId: Number,
		// ChartInstance: Object
	},

	data: () => ({}),

	computed: {
		rebase_lines: () => rebase_lines,
		rebase_wheel: () => rebase_wheel,
		alertRulesList: () => alertRulesList,
		getItemValue: () => getItemValue,
		access_token: that => that.$store.state.auth.access_token,

		problemIcon() {
			/*if (this.problems.length) {

					return getItemValue(
						this.sensorIquipment.equipment_type,
						'img',
						equipmentTypesList
					);
				}*/
			// return '';
			return 'motor';
		},

		problemAnimation() {
			if (this.problems.length) {
				return `animate-${this.parameterTypeItems[0].axis}`;
			}
			return '';
		},
	},

	methods: {
		toggleNavigator() {
			this.$emit('event', { eventName: 'toggleNavigator' });
		},

		prepareFilters(filters) {
			let newFilters = { ...filters };

			if (newFilters.daterange && newFilters.daterange.length) {
				newFilters = {
					...newFilters,
					...prepareRangeParams(newFilters.daterange)
				};
				delete newFilters.daterange;
			}

			return newFilters;
		},

		handleExportChart() {
			let parameterType = this.parameterTypeItems.length
				? this.parameterTypeItems[0].id
				: null;

			this.handleExportItem({
				url: `sensors/jobs/${this.sensorId}/export`,
				filters: { parameterType, ...this.rootFilters }
			});
		}
	}
};
</script>
