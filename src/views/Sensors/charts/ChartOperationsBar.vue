<template>
	<div class="chart-actions-block">
		<div class="flex wrap mrow medium-padding">
			<div v-for="item in actionButtons" :key="`button-${item.id}`">
				<el-popover
					v-if="item.isPeriodicCursors"
					trigger="click"
					placement="bottom"
					width="490"
					:close-delay="0"
					popper-class="periodic-cursors-popover"
					@show="event(item.event, item.args)"
					@hide="event(item.event, item.args)"
				>
					<template #reference>
						<el-button
							:type="item.type || 'primary'"
							native-type="button"
							:class="[
								'item-action-button capitalize',
								item.className,
								{ active: activeButtonValues[item.activeKey] },
							]"
						>
							<i v-if="item.prefix_icon" :class="[`icomoon ${item.prefix_icon}`]"></i>
							<span v-if="item.text">{{ item.text }}</span>
							<i v-if="item.icon" :class="[`icomoon ${item.icon}`]"></i>
							<i v-else-if="item.without_icon"></i>
						</el-button>
					</template>

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
									type="primary"
									native-type="button"
									:class="['item-action-button capitalize small inverted']"
									@click="generatePeriodicCursors"
								>
									{{ tt('Enter') }}
								</el-button>
							</div>
						</div>
					</div>
				</el-popover>

				<el-button
					v-else
					:type="item.type || 'primary'"
					native-type="button"
					:class="[
						'item-action-button capitalize',
						{ 'delete-button inverted': item.isDelete },
						item.className,
						{ active: activeButtonValues && activeButtonValues[item.activeKey] },
					]"
					:loading="item.loadingKey && activeButtonValues && activeButtonValues[item.loadingKey]"
					@click="event(item.event, item.args)"
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

<script setup>
import { ref, watch } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'ChartOperationsBar',
});

const props = defineProps({
	actionButtons: { type: Array, default: () => [] },
	activeButtonValues: { type: Object, default: () => ({}) },
	xAxisTitle: String,
	chartPeaks: { type: Array, default: () => [] },
});

const emit = defineEmits(['event']);

const formData = ref({
	start: 0,
	step: 0,
	max_steps: 10,
});

const event = (name, data) => {
	emit('event', name, data);
};

const generatePeriodicCursors = () => {
	event('generatePeriodicCursors', formData.value);
};

watch(
	() => props.chartPeaks,
	(list) => {
		formData.value.start = list[0] ? list[0].x : 0;
		formData.value.step = formData.value.start;
	},
);
</script>
