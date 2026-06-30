<template>
	<el-form
		ref="itemFormRef"
		label-width="122px"
		class="item-edit-form"
		:model="formData"
		label-position="left"
	>
		<div class="text-center bold title article-title">{{ title }}</div>
		<div class="flex mrow">
			<div class="mcol-xs-11">
				<div class="el-form-item content-row">
					<div class="flex mrow wrap align-center">
						<el-form-item
							:label="tt('constants.metric')"
							prop="is_monitor_all_metrics"
							class="mcol-xs-12 mcol-sm-7"
						>
							<div class="flex align-center">
								<el-switch
									v-model="formData.is_monitor_all_metrics"
									class="div-block"
									:active-value="1"
									:inactive-value="0"
									@change="selectedMetricsIds = []"
								/>
								<div class="div-block">{{ tt('phrases.all_metrics') }}</div>
							</div>
						</el-form-item>

						<el-form-item prop="monitor_metrics" class="mcol-xs-12 mcol-sm-5 label-margin-0">
							<el-select
								v-model="selectedMetricsIds"
								multiple
								class="multiple-select"
								:disabled="!!formData.is_monitor_all_metrics"
								:placeholder="`${tt('Select')} ${tt('constants.metric')}`"
							>
								<el-option
									v-for="item in requestsList"
									:key="`metric_id-${item.metric_item_id}`"
									:label="setupMetricLabelMethod(item)"
									:value="item.metric_item_id"
								/>
							</el-select>
						</el-form-item>
					</div>
				</div>

				<div v-if="isCompareType" class="el-form-item content-row">
					<div class="flex mrow wrap align-center">
						<el-form-item
							required
							prop="time_delta"
							class="mcol-xs-12 mcol-sm-7"
							:label="tt('constants.time_delta')"
						>
							<el-input-number v-model="formData.time_delta" :min="0" />
						</el-form-item>

						<el-form-item prop="time_delta_unit" class="mcol-xs-12 mcol-sm-5 label-margin-0" required>
							<CustomSelectV2
								v-model="formData.time_delta_unit"
								:optionsList="metricUnitTypes"
								:placeholder="`${tt('Select')} ${tt('constants.unit')}`"
							/>
						</el-form-item>
					</div>
				</div>

				<div class="flex mrow wrap content-row">
					<div class="mcol-xs-12 mcol-sm-6">
						<el-form-item
							:label="isLowHighType ? tt('constants.high_zone') : tt('constants.Alarm_Zone')"
							required
							prop="alarm_level"
						>
							<el-input-number v-model="formData.alarm_level" :precision="3" />
						</el-form-item>

						<el-form-item
							:label="isLowHighType ? tt('constants.low_zone') : tt('constants.Warning_Zone')"
							required
							prop="warning_level"
						>
							<el-input-number v-model="formData.warning_level" :precision="3" />
						</el-form-item>
					</div>

					<div v-if="!isCompareType" class="mcol-xs-12 mcol-sm-6">
						<el-form-item :label="tt('phrases.acute_samples')" prop="acute_samples">
							<el-input-number v-model="formData.acute_samples" :min="1" />
						</el-form-item>

						<el-form-item :label="tt('phrases.stable_samples')" prop="stable_samples">
							<el-input-number v-model="formData.stable_samples" :min="1" />
						</el-form-item>

						<el-form-item
							class="label_padding_top-0"
							:label="tt('phrases.re_trigger_samples')"
							prop="re_trigger_samples"
						>
							<el-input-number v-model="formData.re_trigger_samples" :min="1" />
						</el-form-item>
					</div>
				</div>
			</div>

			<div>
				<el-button
					class="action-button remove-button"
					size="small"
					type="danger"
					@click="removeItem"
				>
					<i class="icomoon icon-cross"></i>
				</el-button>
			</div>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { findItemBy } from '@/helpers';
import {
	metricUnitTypesList,
	MULTIVIEW_ALARM_TYPES,
	multiviewAlarmTypesList,
} from '@/constants/global';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'MultiViewThresholdItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	metricItemsList: { type: Array, default: () => [] },
	requestsList: { type: Array, default: () => [] },
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const selectedMetricsIds = ref([]);
const formData = ref({
	is_monitor_all_metrics: 0,
	monitor_metrics: [],
	time_delta: null,
	time_delta_unit: null,
	warning_level: null,
	alarm_level: null,
	type: null,
	acute_samples: 1,
	stable_samples: 5,
	re_trigger_samples: 30,
});

const isLowHighType = computed(() => formData.value.type === MULTIVIEW_ALARM_TYPES.STANDARD_LOW_HIGH);
const title = computed(() => {
	const alarmType = findItemBy('id', props.itemData.type, multiviewAlarmTypesList());
	return alarmType ? alarmType.name : '';
});
const metricUnitTypes = computed(() => metricUnitTypesList());
const isCompareType = computed(() => formData.value.type === MULTIVIEW_ALARM_TYPES.COMPARE);

const setupMetricLabelMethod = (item) => `${item.sensor_name} - ${item.name}`;

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	localSetupPageActions: (itemData) => {
		if (itemData && !itemData.new) {
			selectedMetricsIds.value = [];
			itemData.monitor_metrics?.forEach((metric) => {
				const requestItem = props.requestsList.filter(
					(item) => item.id === metric.metric_type && item.sensor_id === metric.sensor_id,
				);
				if (requestItem.length) {
					selectedMetricsIds.value.push(requestItem[0].metric_item_id);
				}
			});
		}
	},
	localGetFormDataCallback: (data) => {
		const nextData = { ...data };
		nextData.monitor_metrics = selectedMetricsIds.value
			.map((id) => {
				const requestItem = findItemBy('metric_item_id', id, props.requestsList);
				if (requestItem) {
					return { sensor_id: requestItem.sensor_id, metric_type: requestItem.id };
				}
				return null;
			})
			.filter(Boolean);
		if (!isCompareType.value) {
			delete nextData.time_delta;
			delete nextData.time_delta_unit;
		}
		if (isCompareType.value) {
			delete nextData.acute_samples;
			delete nextData.stable_samples;
			delete nextData.re_trigger_samples;
		}
		return nextData;
	},
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
