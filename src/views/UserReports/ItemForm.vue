<template>
	<div
		:class="[
			'edit-form-container user-report-form',
			{ 'half-width': !fromAnotherInstance && !isMobile },
		]"
	>
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="name" required>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item :label="tt('Type')" prop="type" required>
				<CustomSelectV2
					v-model="formData.type"
					className="capitalize"
					optionClassName="capitalize"
					:optionsList="userReportTypesListOptions"
					:placeholder="`${tt('Select')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.COMPARE"
				:label="tt('Measurement')"
				prop="graph_data_measurement"
				required
			>
				<CustomSelectV2
					v-model="formData.graph_data_measurement"
					className="capitalize"
					optionClassName="capitalize"
					:optionsList="metricSystemsListOptions"
					:placeholder="`${tt('Select')} ${tt('Measurement')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Range')" prop="report_for_range_days" required>
				<div class="flex align-center">
					<el-input-number v-model="formData.report_for_range_days" class="div-block" :min="1" />
					<span class="div-block">{{ tt('days') }}</span>
				</div>
			</el-form-item>

			<el-form-item :label="tt('Days')" prop="launch_on_weekdays" required>
				<RadioButtonsBlock
					v-model="formData.launch_on_weekdays"
					:settings="daysRadioOptions"
					:optionsList="weekDaysList"
				/>
			</el-form-item>

			<el-form-item :label="tt('time')" prop="launch_time" class="time-select">
				<el-time-select
					v-model="formData.launch_time"
					:picker-options="{ start: '00:00', step: '00:15', end: '23:45' }"
					:placeholder="`${tt('select')} ${tt('time')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.COMPARE"
				:label="tt('Sensors')"
				prop="report_by_sensor_ids"
			>
				<FetchByQuerySelect
					v-if="enableSensorsLoadmore"
					v-model="formData.report_by_sensor_ids"
					clearable
					multiple
					enableLoadmore
					preventResetOptionsWhenQueryIsCleared
					:optionsLoading="sensorsLoading"
					:optionsList="sensorsList"
					:settings="sensorQueryOptions"
					:setupLabelSettings="sensorLabelOptions"
					:placeholder="`${tt('Select')} ${tt('sensors')}`"
					prefixIcon="icomoon icon-sensor"
					:minOptionsToFetch="6"
					@update:optionsLoading="(value) => (sensorsLoading = value)"
					@update:optionsList="(value) => (sensorsList = value)"
				/>

				<CustomSelectV2
					v-else
					v-model="formData.report_by_sensor_ids"
					filterable
					multiple
					prefixIcon="icomoon icon-sensor"
					:optionsLoading="props.additionalSettings?.sensorsLoadingProps"
					:optionsList="props.additionalSettings?.sensorsListProps || []"
					:placeholder="`${tt('Select')} ${tt('sensors')}`"
					:setupLabelSettings="sensorLabelOptions"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.notifiable_plants')"
			>
				<el-switch v-model="formData.is_report_by_notifiable_plants" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.Report_plants')"
				prop="report_by_plant_ids"
			>
				<CustomSelectV2
					v-model="formData.report_by_plant_ids"
					filterable
					multiple
					:disabled="!!isCSM || !!formData.is_report_by_notifiable_plants"
					:optionsList="props.additionalSettings?.plantsListProps || []"
					:placeholder="`${tt('Select')} ${tt('plants')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.thresholds_only')"
			>
				<el-switch v-model="formData.is_check_missing_thresholds_only" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.baseline_delta')"
				prop="baseline_delta"
			>
				<el-input-number v-model="formData.baseline_delta" :precision="2" />
				<b> %</b>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.warning_and_alarm_delta')"
				prop="warning_and_alarm_delta"
			>
				<el-input-number v-model="formData.warning_and_alarm_delta" :precision="2" />
				<b> %</b>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { weekdays } from '@/constants/date_time';
import { USER_REPORT_TYPES, userReportTypesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { metricSystemsList } from '@/modules/charts_factory/controllers/Sensor/enums';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';

import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';

const { tt } = Lang;

defineOptions({
	name: 'UserReportsItemForm',
});

const props = defineProps(buildProps({
	additionalSettings: { type: Object, default: () => ({}) },
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const sensorsList = ref([]);
const sensorsLoading = ref(false);

const sensorsEntity = ENTITIES.Sensors;
const fetchSensors = createGetRequest(sensorsEntity.apiBase);
const fetchSensorById = createGetByIdRequest(sensorsEntity.apiBase);

const formData = ref({
	id: null,
	name: '',
	type: null,
	graph_data_measurement: null,
	report_for_range_days: 1,
	report_by_sensor_ids: [],
	launch_on_weekdays: [],
	launch_time: '',
	report_by_plant_ids: [],
	is_report_by_notifiable_plants: 0,
	is_check_missing_thresholds_only: 0,
	baseline_delta: 10,
	warning_and_alarm_delta: 50,
});

const rules = ref({
	name: required,
	report_by_plant_ids: null,
	is_report_by_notifiable_plants: null,
});

const userId = computed(() => props.additionalSettings?.userId);
const isCSM = computed(() => props.additionalSettings?.isCSM);
const enableBaselineReport = computed(() => props.additionalSettings?.enableBaselineReport);
const enableSensorsLoadmore = computed(
	() => !(props.additionalSettings?.sensorsListProps || []).length,
);

const metricSystemsListOptions = computed(() => Object.freeze(metricSystemsList()));
const userReportTypesListOptions = computed(() => {
	const list = userReportTypesList();
	if (!enableBaselineReport.value) {
		return Object.freeze(list.filter((item) => item.id !== USER_REPORT_TYPES.BASELINING));
	}
	return Object.freeze(list);
});

const daysRadioOptions = Object.freeze({
	className: 'standard semi-bold button-rounded',
	inline: true,
	disableInlineWrap: true,
	valueAsArray: true,
});

const weekDaysList = computed(() =>
	Object.freeze(
		weekdays().map((day, idx) => ({
			name: day[0],
			id: idx,
		})),
	),
);

const sensorQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: fetchSensors,
		fetchByIdAction: fetchSensorById,
		params: {
			orderByColumn: 'name',
			orderByMethod: 'asc',
		},
	}),
);

const sensorLabelOptions = Object.freeze({
	accessors: ['equipment.asset.machine.name', 'equipment.asset.name', 'location_in_equipment'],
	delimeter: ',',
});

const localPrepareSubmitData = (data) => {
	const nextData = { ...data };

	if (nextData.type === USER_REPORT_TYPES.COMPARE) {
		nextData.report_by_plant_ids = [];
		delete nextData.baseline_delta;
		delete nextData.warning_and_alarm_delta;
		delete nextData.is_report_by_notifiable_plants;
		delete nextData.is_check_missing_thresholds_only;
	} else if (nextData.type === USER_REPORT_TYPES.BASELINING) {
		nextData.report_by_sensor_ids = [];
		delete nextData.graph_data_measurement;
	}

	return nextData;
};

const preparePayload = (payload) => ({
	...payload,
	userId: userId.value,
});

const { isMobile, validateForm } = useItemForm({
	// debug: true,
	apiRoute: `/users/${userId.value}/scheduled-reports`,
	formData,
	formRef: itemFormRef,
	itemData: computed(() => props.itemData),
	fromModal: props.fromModal,
	editModal: props.editModal,
	localPrepareSubmitData,
	preparePayload,
	prepareSubmitDataSettings: undefined,
	emit,
});

watch(
	() => formData.value.report_by_plant_ids,
	(ids) => {
		rules.value.is_report_by_notifiable_plants = ids?.length ? null : required;
	},
	{ deep: true, immediate: true },
);

watch(
	() => formData.value.is_report_by_notifiable_plants,
	(isTrue) => {
		rules.value.report_by_plant_ids = isCSM.value || isTrue ? null : required;
		formData.value.report_by_plant_ids = [];
	},
	{ immediate: true },
);

defineExpose({
	validateForm,
});
</script>
