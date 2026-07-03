<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form section-row"
			label-width="100px"
			:model="formData"
			:rules="rules"
		>
			<el-form-item :label="tt('Machine')" prop="machine_id">
				<CustomSelectV2
					v-model="formData.machine_id"
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('Select')} ${tt('machine')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Fault')" prop="fault_id">
				<CustomSelectV2
					v-model="formData.fault_id"
					filterable
					:optionsList="processData?.faults || []"
					:placeholder="`${tt('Select')} ${tt('fault')}`"
					labelKey="title"
				/>
			</el-form-item>

			<el-form-item
				prop="finish_time"
				class="small-paddings-time"
				:label="tt('Break_time')"
			>
				<div class="flex mrow">
					<div class="mcol-xs-6">
						<el-time-select
							v-model="formData.new_start_time"
							value-format="HH:mm"
							:placeholder="tt('start')"
							start="00:00"
							step="00:15"
							end="23:45"
							:min-time="processData.start_work_day"
							:max-time="processData.finish_work_day"
							@blur="clearValidate"
							@change="setFinishTime"
						/>
					</div>

					<div class="mcol-xs-6">
						<el-time-select
							v-model="formData.new_finish_time"
							disabled
							value-format="HH:mm"
							:placeholder="tt('finish')"
							start="00:00"
							step="00:15"
							end="23:45"
							:min-time="formData.new_start_time"
							:max-time="processData.finish_work_day"
						/>
					</div>
				</div>
			</el-form-item>

			<el-form-item prop="cause_description" :label="tt('Description')">
				<CustomInput
					v-model="formData.cause_description"
					type="textarea"
					:placeholder="tt('comments')"
				/>
			</el-form-item>
		</el-form>

		<div class="dialog-footer section-row text-center">
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
import { getTimeDifference, getYmdDateString } from '@/helpers';
import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useProcesses } from '@/composables/useProcesses';

const { tt } = Lang;

defineOptions({ name: 'ProcessEditBreakTimeForm' });

const props = defineProps(buildProps({
	processData: { type: Object, default: () => ({}) },
	visible: Boolean,
	showSubmitButtons: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event', 'closeDialog', 'successSubmit']);

const { changeProcessBreakTime } = useProcesses();

const itemFormRef = ref(null);
const machinesLoading = ref(false);
const machinesList = ref([]);
const initialDiff = ref(0);
const initialFormData = Object.freeze({
	cause_description: '',
	machine_id: null,
	fault_id: null,
	new_start_time: '',
	new_finish_time: '',
});
const formData = ref({ ...initialFormData });
const rules = reactive({
	machine_id: required,
	fault_id: required,
	new_start_time: required,
	new_finish_time: required,
});

const processData = computed(() => props.processData || {});

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
const closeDialog = () => {
	emit('closeDialog');
};
const setFinishTime = (newStartTime) => {
	const newStartMs = new Date(`01/01/2007 ${newStartTime}`).getTime();
	const newFinishDate = new Date(newStartMs + initialDiff.value);
	const finishTime = getYmdDateString({
		dateObj: newFinishDate,
		withTime: true,
		timeOnly: true,
	});

	formData.value.new_finish_time = finishTime.split(':').slice(0, -1).join(':');
};
const localSetupPage = (item) => {
	if (!item) {
		machinesList.value = [];
		return;
	}

	fetchMachines(processData.value?.machines_ids || []);
	formData.value.new_start_time = item.start_time;
	formData.value.new_finish_time = item.finish_time;
	initialDiff.value = getTimeDifference({
		to: item.finish_time,
		from: item.start_time,
		timeOnly: true,
	}).ms;
};
const successSubmitCallback = () => {
	emit('successSubmit');
};
const localSubmit = (payload) =>
	changeProcessBreakTime({
		data: payload,
		itemId: props.itemData?.id,
	}).then(successSubmitCallback);

const { validateForm, setupPage, clearValidate } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	initialFormData,
	formRef: itemFormRef,
	cleanFormDataAfterClose: true,
	localSetupPage,
	localSubmit,
	successSubmitCallback,
	emit,
});

watch(
	() => props.visible,
	(isVisible) => {
		if (!isVisible) {
			setupPage(null);
			machinesList.value = [];
		} else {
			setupPage(props.itemData);
		}
	},
);

defineExpose({
	validateForm,
	setupPage,
});
</script>
