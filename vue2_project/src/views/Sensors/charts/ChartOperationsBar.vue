<template>
	<div class="chart-actions-block">
		<div class="flex wrap mrow medium-padding">
			<div class="" v-for="item in actionButtons" :key="`button-${item.id}`">
				<!-- trigger="manual" -->
				<!-- :value="activeButtonValues[item.activeKey]" -->
				<el-popover
					trigger="click"
					v-if="item.isPeriodicCursors"
					:placement="'bottom'"
					width="490"
					:close-delay="0"
					@show="event(item.event, item.args)"
					@hide="event(item.event, item.args)"
					popper-class="periodic-cursors-popover"
				>
					<!-- @click="event(item.event, item.args)" -->
					<el-button
						slot="reference"
						:type="item.type || 'primary'"
						native-type="button"
						:class="[
							'item-action-button capitalize',
							item.className,
							{ active: activeButtonValues[item.activeKey] }
						]"
					>
						<i v-if="item.prefix_icon" :class="[`icomoon ${item.prefix_icon}`]"></i>
						<span v-if="item.text">{{ item.text }}</span>
						<i v-if="item.icon" :class="[`icomoon ${item.icon}`]"></i>
						<i v-else-if="item.without_icon"></i>
					</el-button>

					<div class="periodic-cursors-bar">
						<div class="flex align-center">
							<div class="flex wrap mrow align-center mcol-xs-12 mcol-sm-11">
								<div class="mcol-xs-12 mcol-sm-4">
									<span class="label">{{ tt('Start') }}</span>
									<CustomInput v-model="formData.start" class="mini" />
									<span class="unit">{{ xAxisTitle }}</span>
								</div>

								<div class="mcol-xs-12 mcol-sm-4">
									<span class="label">&#916;f</span>
									<CustomInput v-model="formData.step" class="mini" />
									<span class="unit">{{ xAxisTitle }}</span>
								</div>

								<div class="mcol-xs-12 mcol-sm-4">
									<span class="label">{{ `${tt('Max')}` }} &#916;f</span>
									<CustomInput v-model="formData.max_steps" class="mini" />
								</div>
							</div>

							<div class="mcol-xs-auto submit-button">
								<el-button
									type="primary inverted"
									native-type="button"
									:class="['item-action-button capitalize small']"
									@click="generatePeriodicCursors"
									>{{ tt('Enter') }}</el-button
								>
							</div>
						</div>
					</div>
				</el-popover>

				<el-button
					v-else
					@click="event(item.event, item.args)"
					:type="item.type || 'primary'"
					native-type="button"
					:class="[
						'item-action-button capitalize',
						{ 'delete-button inverted': item.isDelete },
						item.className,
						{ active: activeButtonValues && activeButtonValues[item.activeKey] }
					]"
					:loading="item.loadingKey && (activeButtonValues &&activeButtonValues[item.loadingKey])"
				>
					<i v-if="item.prefix_icon" :class="[`icomoon ${item.prefix_icon}`]"></i>
					<span v-if="item.text">{{ item.text }}</span>
					<i v-if="item.icon" :class="[`icomoon ${item.icon}`]"></i>
					<i v-else-if="item.without_icon"></i>
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		actionButtons: { type: Array },
		activeButtonValues: { type: Object, default: () => ({}) },
		xAxisTitle: String,
		chartPeaks: Array,

	},

	data: () => ({
		formData: {
			start: 0,
			step: 0,
			max_steps: 10
		}
	}),

	methods: {
		event(name, data) {
			this.$emit('event', name, data);
		},

		generatePeriodicCursors() {
			this.event('generatePeriodicCursors', this.formData);
		}
	},

	watch: {
		chartPeaks(list) {
			this.formData.start = list[0] ? list[0].x : 0;
			this.formData.step = this.formData.start;
		},

		/*activeButtonValues(x) {
			console.log('activeButtonValues', x)
		}*/
	}
};
</script>
