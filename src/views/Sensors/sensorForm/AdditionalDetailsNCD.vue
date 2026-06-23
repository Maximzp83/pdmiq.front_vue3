<template>
	<div class="ncd-additional-details-container">
		<div class="flex mrow wrap">
			<div class="mcol-xs-12 mcol-sm-3">
				<div class="label">{{ `${tt('phrases.connection_strength_average')}:` }}</div>
				<div class="value semi-bold common-title">
					{{ itemData.connection_strength_average }}
				</div>
			</div>

			<div v-if="isNCDSDT" class="mcol-xs-12 mcol-sm-3">
				<div class="label">{{ `${tt('phrases.Sensor_Boot_Time')} (s)` }}</div>
				<el-input-number
					v-if="itemData.is_ncd_config"
					v-model="formData.ncd_config_sensor_boot_time_420ma"
					class="mini"
					:controls="false"
				/>
			</div>

			<div v-if="isTempVibeSensor" class="mcol-xs-12">
				<div class="flex mrow wrap">
					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('phrases.Frequency_Range')} (Hz)` }}</div>
								<div v-show="itemData.is_ncd_config" class="value semi-bold common-title">
									{{ itemData.ncd_low_frequency }} - {{ itemData.ncd_high_frequency }} Hz
								</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('RPM')}:` }}</div>
								<div class="value semi-bold common-title">{{ rpmValue.str }}</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('phrases.output_data_rate')}:` }}</div>
								<CustomSelectV2
									v-model="formData.ncd_config_output_data_rate"
									className="mini"
									:optionsList="outputDataRateList"
									:placeholder="`${tt('select')} ${tt('rate')}`"
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('phrases.Sample_Duration')} (ms):` }}</div>
								<CustomInput
									v-if="itemData.is_ncd_config"
									v-model="formData.ncd_config_sampling_duration"
									class="mini"
									placeholder=" "
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled enable-filtering-ncd-checkbox">
								<div class="label">{{ `${tt('phrases.enable_filtering')}:` }}</div>
								<el-checkbox
									v-if="itemData.is_ncd_config"
									v-model="formData.ncd_config_filter_status"
									:true-value="1"
									:false-value="0"
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('phrases.low_pass_filter')} (${tt('High_Limit')})` }}</div>
								<div v-if="formData.ncd_config_filter_status" class="flex align-center">
									<CustomSelectV2
										v-model="formData.ncd_config_low_pass_filter_coefficient"
										class="span-block"
										className="mini"
										:optionsList="passFiltersList"
										:placeholder="`${tt('select')} ${tt('rate')}`"
									/>
									<span v-if="itemData.is_ncd_config" class="span-block semi-bold no-wrap">
										{{ formData.ncd_config_output_data_rate / formData.ncd_config_low_pass_filter_coefficient }} Hz
									</span>
								</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('phrases.high_pass_filter')} (${tt('Low_Limit')})` }}</div>
								<div v-if="formData.ncd_config_filter_status" class="flex align-center">
									<CustomSelectV2
										v-model="formData.ncd_config_high_pass_filter_coefficient"
										class="span-block"
										className="mini"
										:optionsList="passFiltersList"
										:placeholder="`${tt('select')} ${tt('rate')}`"
									/>
									<span v-if="itemData.is_ncd_config" class="span-block semi-bold no-wrap">
										{{ formData.ncd_config_output_data_rate / formData.ncd_config_high_pass_filter_coefficient }} Hz
									</span>
								</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('Deadband')} (mg)` }}</div>
								<el-input-number
									v-if="itemData.is_ncd_config"
									v-model="formData.ncd_config_deadband"
									class="mini"
									:controls="false"
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label is-required">
									{{ `${tt('acceleration')} ${tt('phrases.low_cut_filter')}` }}
								</div>
								<el-input-number
									v-model="formData.fft_acceleration_low_cut_filter"
									class="mini"
									:controls="false"
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label is-required">
									{{ `${tt('acceleration')} ${tt('phrases.high_cut_filter')}` }}
								</div>
								<el-input-number
									v-model="formData.fft_acceleration_high_cut_filter"
									class="mini"
									:controls="false"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';

import { getRoundedValue, removeObjProps } from '@/helpers';
import { NCD_REQUEST_STATUSES } from '@/constants/global';
import { Lang } from '@/localization';
import { useItemForm } from '@/composables/mixins/useItemForm';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useWebSocket } from '@/composables/mixins/useWebSocket';
import { useNotify } from '@/composables/useNotify';
import { useSensors } from '@/composables/useSensors';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useAuthStore } from '@/stores/AuthStore';

const { tt } = Lang;

defineOptions({
	name: 'AdditionalDetailsNCD',
});

const props = defineProps({
	itemData: { type: Object, required: true },
});

const emit = defineEmits(['event', 'submit']);

const { Notify } = useNotify();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { requestNcdConfig } = useSensors();
const { setupWebSocket, closeWebSocket } = useWebSocket();
const { currentSensorType } = useSensorType({
	currentSensorTypeData: computed(() => props.itemData),
});

const formData = ref({
	ncd_config_output_data_rate: null,
	ncd_config_sampling_duration: '',
	ncd_config_filter_status: true,
	ncd_config_high_pass_filter_coefficient: null,
	ncd_config_low_pass_filter_coefficient: null,
	ncd_config_deadband: 0,
	ncd_config_sensor_boot_time_420ma: 0,
	fft_acceleration_low_cut_filter: 0,
	fft_acceleration_high_cut_filter: 0,
});

const isTempVibeSensor = computed(() => {
	const type = currentSensorType.value || {};
	return type.isNCDTempVibe || type.isNCDWiredTempVibe || type.isNCDTempVibeCurr;
});

const isNCDSDT = computed(() => currentSensorType.value?.isNCDSDT);

const rpmValue = computed(() => {
	if (isTempVibeSensor.value) {
		return {
			str: `${props.itemData.equipment_rpm} (${getRoundedValue(props.itemData.equipment_rpm / 60, 0, 2)} Hz)`,
			value: props.itemData.equipment_rpm,
		};
	}
	return { str: '', value: null };
});

const outputDataRateList = Object.freeze([
	{ id: 100, name: '100' },
	{ id: 200, name: '200' },
	{ id: 400, name: '400' },
	{ id: 800, name: '800' },
	{ id: 1600, name: '1600' },
	{ id: 3200, name: '3200' },
	{ id: 6400, name: '6400' },
	{ id: 12800, name: '12800' },
	{ id: 25600, name: '25600' },
]);

const passFiltersList = Object.freeze([
	{ id: 4, name: '4' },
	{ id: 8, name: '8' },
	{ id: 16, name: '16' },
	{ id: 32, name: '32' },
	{ id: 64, name: '64' },
	{ id: 128, name: '128' },
	{ id: 256, name: '256' },
	{ id: 512, name: '512' },
	{ id: 1024, name: '1024' },
	{ id: 2048, name: '2048' },
]);

const localValidationHook = () => {
	const {
		fft_acceleration_low_cut_filter,
		fft_acceleration_high_cut_filter,
	} = formData.value;
	const checks = [true];

	if (isTempVibeSensor.value) {
		checks.push(
			!!fft_acceleration_low_cut_filter &&
				!!fft_acceleration_high_cut_filter &&
				fft_acceleration_low_cut_filter < fft_acceleration_high_cut_filter,
		);
	}

	if (checks.every(Boolean)) return true;

	let message = `${tt('phrases.check_form_fields')}: `;
	if (!fft_acceleration_low_cut_filter && !fft_acceleration_high_cut_filter) {
		message += `${tt('acceleration')} ${tt('phrases.low_cut_filter')}, ${tt('acceleration')} ${tt('phrases.high_cut_filter')}.`;
	}
	if (fft_acceleration_low_cut_filter > fft_acceleration_high_cut_filter) {
		message += ` ${tt('acceleration')} ${tt('phrases.low_cut_filter')}, ${tt('phrases.should_be_lower_than')} ${tt('acceleration')} ${tt('phrases.high_cut_filter')}.`;
	}

	Notify({
		type: 'warning',
		title: tt('phrases.form_isnt_ready'),
		message,
	});
	return false;
};

const localPrepareSubmitData = (data) => {
	let nextData = { ...data };
	delete nextData.id;

	if (!isNCDSDT.value) {
		delete nextData.ncd_config_sensor_boot_time_420ma;
	}
	if (!isTempVibeSensor.value) {
		nextData = removeObjProps(nextData, [
			'ncd_config_output_data_rate',
			'ncd_config_sampling_duration',
			'ncd_config_filter_status',
			'ncd_config_high_pass_filter_coefficient',
			'ncd_config_low_pass_filter_coefficient',
			'ncd_config_deadband',
			'fft_acceleration_low_cut_filter',
			'fft_acceleration_high_cut_filter',
		]);
	}

	if (!nextData.ncd_config_filter_status) {
		nextData = removeObjProps(nextData, [
			'ncd_config_high_pass_filter_coefficient',
			'ncd_config_low_pass_filter_coefficient',
		]);
	}

	return nextData;
};

const toggleMainPreloader = (open, text) => {
	globalStore.set_value('overlay', open ? { text: text || '', textStyle: { fontSize: '25px' } } : {});
	globalStore.set_value('mainPreloader', !!open);
};

const handleConfigRequest = () => {
	setupWebSocket({
		socketName: 'ncd_socket',
		socketChannel: `user.${authStore.authUser?.uuid}`,
		onError: configRequestWebsocketErrorHandler,
		onMessage: configRequestSocketCallback,
	});
	toggleMainPreloader(true, `${tt('phrases.working_config')}...`);
};

const configRequestSocketCallback = ({ type, data }) => {
	const safeData = data?.data || data || {};
	if (`${type || ''}`.toLowerCase() !== 'ncd.command' || safeData.sensor_id !== props.itemData.id) return;

	if (safeData.status === NCD_REQUEST_STATUSES.SUCCESS) {
		Notify({
			type: 'success',
			title: tt('Success'),
			message: tt('phrases.ncd_config_saved_successfully'),
		});
		closeWebSocket({ socketName: 'ncd_socket' });
		toggleMainPreloader(false);
		emit('event', { eventName: 'successModalSubmit', data: safeData });
		emit('event', { eventName: 'handleCloseEditModal' });
	}

	if (safeData.status === NCD_REQUEST_STATUSES.FAIL) {
		Notify({
			type: 'warning',
			title: tt('Fail'),
			message: tt('phrases.error_check_controller_connectivity'),
			duration: 0,
		});
		closeWebSocket({ socketName: 'ncd_socket' });
		toggleMainPreloader(false);
	}
};

const configRequestWebsocketErrorHandler = (error) => {
	console.warn(error);
	toggleMainPreloader(false);
	Notify({
		type: 'warning',
		title: tt('Fail'),
		message: tt('phrases.web_socket_error'),
		duration: 0,
	});
	closeWebSocket({ socketName: 'ncd_socket' });
};

const localSubmit = (preparedData) => {
	if (!localValidationHook()) return;

	emit('event', { eventName: 'toggleSaving', data: true });

	requestNcdConfig({
		sensorId: props.itemData.id,
		data: preparedData,
		itemName: 'Config',
	})
		.then((response) => {
			if (response.value === 'processing') {
				handleConfigRequest();
			} else if (response.value === 'processed') {
				emit('event', { eventName: 'successModalSubmit', data: null });
				emit('event', { eventName: 'handleCloseEditModal' });
			}
			emit('event', { eventName: 'toggleSaving', data: false });
		})
		.catch(() => {
			emit('event', { eventName: 'toggleSaving', data: false });
		});
};

const { validateForm, submitForm, setupPage } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	initialFormData: formData.value,
	localPrepareSubmitData,
	localSubmit,
	emit,
});

onBeforeMount(() => {
	setupPage(props.itemData);
	const { value } = rpmValue.value;
	const {
		fft_acceleration_low_cut_filter,
		fft_acceleration_high_cut_filter,
	} = formData.value;

	if (value && (!fft_acceleration_low_cut_filter || !fft_acceleration_high_cut_filter)) {
		if (value < 600) {
			formData.value.fft_acceleration_low_cut_filter = 100;
			formData.value.fft_acceleration_high_cut_filter = 280;
		} else if (600 <= value && value <= 3600) {
			formData.value.fft_acceleration_low_cut_filter = 400;
			formData.value.fft_acceleration_high_cut_filter = 1120;
		} else if (value > 3600) {
			formData.value.fft_acceleration_low_cut_filter = 800;
			formData.value.fft_acceleration_high_cut_filter = 2240;
		}
	}
});

onBeforeUnmount(() => {
	closeWebSocket({ socketName: 'ncd_socket' });
});

defineExpose({
	validateForm,
	submitForm,
});
</script>
