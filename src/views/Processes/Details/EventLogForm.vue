<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form section-row"
			label-width="120px"
			:model="formData"
			:rules="rules"
		>
			<el-form-item
				v-if="downtimeDateRange"
				class="one-line-item"
				:label="`${tt('Date')}:`"
				prop="origin_type"
			>
				<b v-html="downtimeDateRange.date"></b>
			</el-form-item>

			<el-form-item
				v-if="downtimeDateRange"
				:label="`${tt('timerange')}:`"
				prop="origin_type"
				class="no-margin one-line-item"
			>
				<b v-html="downtimeDateRange.time"></b>
			</el-form-item>

			<div
				v-if="settings.submitActionProp === 'save_process_downtime'"
				class="mt-20"
			>
				<el-form-item :label="tt('origin_type')" prop="origin_type">
					<CustomSelectV2
						v-model="formData.origin_type"
						:optionsList="downtimeOriginTypesList"
						:placeholder="`${tt('Select')} ${tt('type')}`"
						labelKey="label"
					/>
				</el-form-item>

				<el-form-item
					v-show="
						formData.origin_type === DOWNTIME_ORIGIN_TYPES.DEVIATION ||
							formData.origin_type === DOWNTIME_ORIGIN_TYPES.EXTREMAL_DEVIATION
					"
					:label="tt('Loss_count')"
					prop="loss_count"
				>
					<el-input-number v-model="formData.loss_count" :min="0" />
				</el-form-item>

				<el-form-item :label="tt('timerange')" prop="finish_time" class="">
					<Datepicker
						v-model="selectedDate"
						class="no-max-width"
						className=" "
						type="datetimerange"
						format="YYYY/MM/DD HH:mm"
						value-format="YYYY-MM-DD HH:mm"
						:default-time="defaultTime"
					/>
				</el-form-item>
			</div>

			<el-form-item :label="tt('Machine')" prop="machine_id" class="mt-20">
				<CustomSelectV2
					v-model="formData.machine_id"
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('select')} ${tt('machine')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Fault')" prop="fault_id">
				<CustomSelectV2
					v-model="formData.fault_id"
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="processData?.faults || []"
					:placeholder="`${tt('select')} ${tt('fault')}`"
					labelKey="title"
				/>
			</el-form-item>

			<el-form-item prop="cause_description" :label="tt('Description')">
				<CustomInput
					v-model="formData.cause_description"
					type="textarea"
					placeholder=" "
				/>
			</el-form-item>
		</el-form>

		<div v-if="!hideSave" class="dialog-footer section-row text-center">
			<el-button type="primary" class="uppercase" @click="() => validateForm()">
				{{ tt('SAVE') }}
			</el-button>
			<el-button @click="closeDialog">{{ tt('Cancel') }}</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

import { Lang } from '@/localization';
import { required } from '@/constants/validation';
import { DOWNTIME_ORIGIN_TYPES, downtimeOriginTypesList as getDowntimeOriginTypesList } from '@/constants/global';
import { cleanDateString, getYmdDateString, getTimeDifference } from '@/helpers';
import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useProcesses } from '@/composables/useProcesses';

import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({ name: 'ProcessEventLogForm' });

const props = defineProps(buildProps({
	processDataProp: { type: Object, default: () => ({}) },
	visible: Boolean,
	showSubmitButtons: Boolean,
	hideSave: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event', 'closeDialog', 'successSubmit']);

const { closeProcessDowntime, saveProcessDowntime } = useProcesses();

const itemFormRef = ref(null);
const machinesLoading = ref(false);
const machinesList = ref([]);
const processData = ref(null);
const selectedDate = ref([]);
const initialFormData = Object.freeze({
	id: null,
	cause_description: '',
	machine_id: null,
	fault_id: null,
	origin_type: null,
	start_time: '',
	finish_time: '',
	loss_count: null,
});
const formData = ref({ ...initialFormData });
const rules = reactive({
	origin_type: null,
	loss_count: null,
});

const settings = computed(() => props.settings || {});
const downtimeOriginTypesList = computed(() => getDowntimeOriginTypesList());
const defaultTime = computed(() => [
	`${processData.value?.start_work_day || '00:00'}:00`,
	`${processData.value?.finish_work_day || '23:45'}:00`,
]);
const downtimeDateRange = computed(() => {
	if (!selectedDate.value?.length) return '';

	const start = cleanDateString(selectedDate.value[0]);
	const finish = cleanDateString(selectedDate.value[1]);
	const { minutes_total: minutesTotal } = getTimeDifference({ from: start, to: finish });

	return Object.freeze({
		date: getYmdDateString({ ms: start, format: 'localeStr' }),
		time: `${getYmdDateString({
			ms: start,
			withTime: true,
			timeOnly: true,
			withoutSeconds: true,
		})} - ${getYmdDateString({
			ms: finish,
			withTime: true,
			timeOnly: true,
			withoutSeconds: true,
		})} Total Time: ${minutesTotal} Minutes`,
	});
});

const fetchMachines = (ids = []) => {
	const params = { max: -1 };
	if (ids?.length) {
		params.ids = ids;
	} else if (processData.value?.plant_id) {
		params.plantId = processData.value.plant_id;
	}

	machinesLoading.value = true;
	return createGetRequest(ENTITIES.Machines.apiBase)({ params })
		.then(({ value }) => {
			machinesList.value = value || [];
		})
		.finally(() => {
			machinesLoading.value = false;
		});
};
const localSetupPage = (item) => {
	processData.value = settings.value.processData || props.processDataProp || {};
	fetchMachines(processData.value?.machines_ids || []);

	if (item?.id) {
		selectedDate.value = [
			cleanDateString(item.start_time),
			cleanDateString(item.finish_time),
		];
	}

	rules.origin_type = settings.value.submitActionProp === 'save_process_downtime' ? required : null;
};
const localPrepareSubmitData = (data) => {
	const preparedData = { ...data };

	if (selectedDate.value?.length) {
		preparedData.start_time = selectedDate.value[0];
		preparedData.finish_time = selectedDate.value[1];
	}

	if (settings.value.submitActionProp !== 'save_process_downtime') {
		delete preparedData.origin_type;
		delete preparedData.start_time;
		delete preparedData.finish_time;
		delete preparedData.loss_count;
	}

	if (
		preparedData.origin_type !== DOWNTIME_ORIGIN_TYPES.DEVIATION &&
		preparedData.origin_type !== DOWNTIME_ORIGIN_TYPES.EXTREMAL_DEVIATION
	) {
		delete preparedData.loss_count;
	}

	return preparedData;
};
const localSubmit = (payload) => {
	const requestPayload = {
		data: payload,
		itemId: formData.value.id,
		processId: processData.value?.id,
	};

	if (settings.value.submitActionProp === 'save_process_downtime') {
		return saveProcessDowntime(requestPayload).then(successSubmitCallback);
	}
	return closeProcessDowntime(requestPayload).then(successSubmitCallback);
};
const successSubmitCallback = () => {
	emit('successSubmit');
};
const closeDialog = () => {
	if (props.showSubmitButtons) {
		emit('closeDialog');
	} else {
		emit('event', { eventName: 'handleCloseEditModal', onward: true });
	}
};

const { validateForm, setupPage } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	initialFormData,
	formRef: itemFormRef,
	cleanFormDataAfterClose: true,
	localSetupPage,
	localPrepareSubmitData,
	localSubmit,
	successSubmitCallback,
	emit,
});

watch(
	() => formData.value.origin_type,
	(type) => {
		rules.loss_count = [
			DOWNTIME_ORIGIN_TYPES.DEVIATION,
			DOWNTIME_ORIGIN_TYPES.EXTREMAL_DEVIATION,
		].includes(type) ? required : null;
	},
);

defineExpose({
	validateForm,
	setupPage,
});
</script>
