<template>
	<div class="flex relative">
		<div
			v-if="enableRpmBlock && !currentSensorType.isNCDEnv && !currentSensorType.isHumiditySensor"
			class="grouped-buttons-block-wrapper"
		>
			<div class="grouped-buttons-block">
				<div class="icon-part"><i class="icomoon el-icon-odometer primary-color"></i></div>
				<div class="group-title">RPM:</div>

				<div class="buttons-list">
					<div v-if="!isCompare && authStore.hasAccessTo(['edit_dashboard'])" class="button-item">
						<el-popover
							:disabled="isRpmParamsSet"
							placement="bottom"
							popper-class="standard-popover"
							:title="`${tt('phrases.you_need_to_select_rpm_source_first')}!`"
							trigger="hover"
							width="200"
							:close-delay="0"
						>
							<template #reference>
								<el-button
									native-type="button"
									:class="[
										'small',
										{
											'is-active': equipmentData && equipmentData.is_rpm_visible,
											'is-disabled with-pointer-events': !isRpmParamsSet,
										},
									]"
									:loading="loadingRPM"
									@click="toggleRpmOverlay"
								>
									<i class="icomoon icon-eye"></i>
								</el-button>
							</template>
						</el-popover>
					</div>

					<div class="button-item">
						<el-button
							native-type="button"
							class="small"
							:loading="loadingRPM"
							@click="showRpmSettings"
						>
							<i class="icomoon icon-testing"></i>
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<div v-if="enableFFT" class="grouped-buttons-block-wrapper">
			<div class="grouped-buttons-block">
				<SensorFFTRequestButton class="icon-part" :itemData="sensorData" />
				<div class="group-title">FFT:</div>

				<div class="buttons-list">
					<div v-if="!isCompare && authStore.hasAccessTo(['edit_dashboard'])" class="button-item">
						<el-popover
							disabled
							placement="bottom"
							popper-class="standard-popover"
							:title="`${tt('phrases.fft_locked_out_remaining_time')}: ${remainingFftActionTime} ${tt('Minutes')}`"
							trigger="hover"
							width="200"
							:close-delay="0"
						>
							<template #reference>
								<el-button
									native-type="button"
									:class="['small', { 'is-disabled': sensorData.is_fft_processing }]"
									:loading="sendingFFTRequest"
									@click="confirmFFTRequest"
								>
									<span>{{ tt('Request') }}</span>
								</el-button>
							</template>
						</el-popover>
					</div>

					<div class="button-item">
						<el-button
							native-type="button"
							class="small"
							:loading="loadingFFT"
							@click="handleLastFFT"
						>
							<span>{{ tt('Last') }}</span>
						</el-button>
					</div>

					<div v-if="showUnlockFFTButton" class="button-item">
						<el-button
							native-type="button"
							class="small"
							:loading="loadingFFT"
							@click="handleUnlockFFT"
						>
							<span class="capitalize">{{ tt('Unlock').toLowerCase() }}</span>
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<div v-if="enablePDF" class="button-item sub-button-item pdf-item relative">
			<SimpleSpinner :active="sensorJobSaving || pdfReportProcessing || pdfReportRequesting" />

			<el-button
				v-if="!pdfReportURL"
				type="primary"
				native-type="button"
				class="inverted report-button"
				:disabled="sensorJobSaving || pdfReportProcessing || pdfReportRequesting"
				@click="startPDFreportRequest"
			>
				<i
					v-show="!pdfReportProcessing && !sensorJobSaving && !pdfReportRequesting"
					class="icomoon icon-pdf"
				></i>
				<span class="text">
					{{ pdfReportProcessing ? `${tt('Processing')}...` : tt('Export') }}
				</span>
			</el-button>

			<a
				v-else
				:href="pdfReportURL"
				target="_blank"
				class="el-button el-button--primary inverted report-button"
				@click="pdfReportURL = ''"
			>
				<span>
					<i class="icomoon icon-upload"></i>
					<span class="text">{{ tt('Download') }}</span>
				</span>
			</a>

			<div v-show="sensorJobSaving || pdfReportProcessing" class="process-description">
				{{ tt('phrases.it_will_take_some_time') }}
			</div>
		</div>

		<FFTRequestBlock
			ref="fftRequestBlockRef"
			v-model:isLoading="loadingFFT"
			v-model:isSending="sendingFFTRequest"
			:sensorData="sensorData"
			:rootFilters="rootFilters"
			:currentSensorType="currentSensorType"
			@event="handleEvent"
			@onSocketSuccess="handleFFTSuccess"
		/>

		<el-dialog
			v-if="initiatedRPMDialog"
			v-model="showRpmSettingsDialog"
			append-to-body
			top
			class="tiny dialog-decorate-header title-center rpm-settings-dialog"
			:title="`${tt('Machine')} ${tt('speed')}`"
		>
			<SimpleSpinner :active="loadingRPM" />
			<RPMSettingsDialog
				:sensorData="sensorData"
				:rootFilters="rootFilters"
				:currentRpmSource="currentRpmSource"
				@save="saveRpmParams"
				@close="showRpmSettingsDialog = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { storeToRefs } from 'pinia';

import {
	FFT_LOCK_STATUSES,
	ITEM_SPEED_OPTIONS,
	itemSpeedOptionsList,
} from '@/constants/global';
import { findItemBy, prepareRangeParams } from '@/helpers';
import { generateUrl } from '@/utils/url-helpers';
import { getCurrentRpmSource } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useSensorsStore } from '@/stores/SensorsStore';
import { api_request } from '@/api/request_provider';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNotify } from '@/composables/useNotify';
import { useSensors } from '@/composables/useSensors';
import { useWebSocket } from '@/composables/mixins/useWebSocket';

import FFTRequestBlock from './FFTRequestBlock.vue';
import RPMSettingsDialog from './RPMSettingsDialog.vue';
import SensorFFTRequestButton from '../SensorFFTRequestButton.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'PDFandFFTrequestsBlock',
});

const props = defineProps({
	enablePDF: { type: Boolean, default: true },
	enableFFT: Boolean,
	isCompare: Boolean,
	sensorData: { type: Object, default: () => ({}) },
	currentSensorType: { type: Object, default: () => ({}) },
	sensors: { type: Array, default: () => [] },
	sensorsProp: { type: Array, default: () => [] },
	sensor_ids: { type: Array, default: () => [] },
	plantId: { type: [Number, String, null], default: null },
	selectedRange: { type: Array, default: () => [] },
	equipmentData: { type: Object, default: null },
	rootFilters: { type: Object, default: () => ({}) },
	enableRpmBlock: Boolean,
});

const emit = defineEmits(['event']);

const authStore = useAuthStore();
const sensorsStore = useSensorsStore();
const { sensorJobSaving, statistics_filters: filters } = storeToRefs(sensorsStore);
const { Notify } = useNotify();
const { pdfReportRequest, plantGraphsPdfReport } = useSensors();
const { setupWebSocket, closeWebSocket } = useWebSocket();

const pdfReportRequesting = ref(false);
const pdfReportProcessing = ref(false);
const pdfReportURL = ref('');
const sendingFFTRequest = ref(false);
const loadingFFT = ref(false);
const loadingRPM = ref(false);
const showRpmSettingsDialog = ref(false);
const initiatedRPMDialog = ref(false);
const fftRequestBlockRef = ref(null);
const exportingPdfSocketInterval = ref(null);

const sensorsList = computed(() => props.sensors.length ? props.sensors : props.sensorsProp);
const currentRpmSource = computed(() =>
	getCurrentRpmSource({
		sensorData: props.sensorData,
		rpm_source_item: props.equipmentData?.rpm_source_item,
		rootFilters: props.rootFilters,
	}),
);
const isRpmParamsSet = computed(() => {
	if (!props.enableRpmBlock || !props.equipmentData) return false;
	if (props.equipmentData.rpm_source_item) return true;

	const sources = props.sensorData?.rpmSources;
	if (!sources) return false;

	return !!(
		sources.external_rpm_evaluated ||
		sources.line_speed_rpm_evaluated ||
		sources.specification_rpm_evaluated
	);
});
const defaultRpmSourceItem = computed(() => {
	const sources = props.sensorData?.rpmSources;
	if (!sources) return null;

	if (sources.external_rpm_evaluated) return ITEM_SPEED_OPTIONS.EXTERNAL;
	if (sources.line_speed_rpm_evaluated) return ITEM_SPEED_OPTIONS.LINESPEED_RPM;
	if (sources.specification_rpm_evaluated) return ITEM_SPEED_OPTIONS.SPECIFICATION_RPM;
	return null;
});
const remainingFftActionTime = computed(() => props.sensorData?.lastWorkerFFTRequest?.remaining_action_time || 0);
const showUnlockFFTButton = computed(() => {
	const lock = props.sensorData?.last_fft_lock;
	return lock ? lock.status !== FFT_LOCK_STATUSES.UNLOCKED : false;
});
const socketChannel = computed(() => authStore.authUser ? `user.${authStore.authUser.uuid}` : null);

const closeComparePdfSocket = () => {
	if (exportingPdfSocketInterval.value) {
		clearInterval(exportingPdfSocketInterval.value);
		exportingPdfSocketInterval.value = null;
	}
	closeWebSocket({ socketName: 'compare_pdf_socket' });
};
const createCompareExportWebSocket = () => {
	closeWebSocket({ socketName: 'compare_pdf_socket' });
	setupWebSocket({
		socketName: 'compare_pdf_socket',
		socketChannel: socketChannel.value,
		onMessage: comparePdfSocketCallback,
	});
};
const startPDFreportRequest = () => {
	if (props.isCompare) {
		startPDFCompareReport();
		return;
	}
	sendPDFreportRequest();
};
const startPDFCompareReport = () => {
	const list = sensorsList.value;
	const daterange = props.selectedRange.length ? props.selectedRange : filters.value?.daterange;
	if (!list.length) {
		Notify({
			type: 'warning',
			message: tt('phrases.sensors_should_be_selected'),
		});
		return;
	}

	const sensorIds = props.sensor_ids.length ? props.sensor_ids : list.map((item) => item.id);
	const finalPlantId = props.plantId || list[0]?.equipment?.plant_id;
	const payload = {
		plantId: finalPlantId,
		data: {
			sensor_ids: sensorIds,
			...prepareRangeParams(daterange, {
				dateStartKey: 'date_start',
				dateFinishKey: 'date_end',
			}),
		},
	};

	if (!payload.data.date_end) {
		Notify({
			type: 'warning',
			message: tt('phrases.select_daterange_first'),
		});
		return;
	}

	pdfReportRequesting.value = true;
	plantGraphsPdfReport(payload)
		.then(() => {
			pdfReportRequesting.value = false;
			pdfReportProcessing.value = true;
			createCompareExportWebSocket();
			exportingPdfSocketInterval.value = setInterval(createCompareExportWebSocket, 600000);
		})
		.catch(() => {
			pdfReportRequesting.value = false;
		});
};
const comparePdfSocketCallback = ({ type, data } = {}) => {
	if (type !== 'REPORT.GRAPHICAL') return;
	const safeData = data?.data || data || {};

	Notify({ type: 'success', title: tt('Success') });
	pdfReportURL.value = generateUrl({
		path: `plants/${safeData.plant_id}/graphical-comparison-reports/${safeData.id}/pdf`,
	});
	pdfReportProcessing.value = false;
	closeComparePdfSocket();
};
const sendPDFreportRequest = () => {
	if (!props.sensorData.id) return;

	const rangeParams = prepareRangeParams(filters.value?.daterange, {
		dateStartKey: 'date_start',
		dateFinishKey: 'date_end',
	});
	const payload = {
		sensorId: props.sensorData.id,
		params: {
			parameterType: 1,
			measurement: filters.value?.measurement,
			...rangeParams,
		},
	};

	pdfReportRequesting.value = true;
	pdfReportRequest(payload)
		.then(() => {
			pdfReportProcessing.value = true;
			setupWebSocket({
				socketName: 'pdf_socket',
				socketChannel: socketChannel.value,
				resources: props.sensorData.id,
				onMessage: pdfSocketCallback,
			});
			pdfReportRequesting.value = false;
		})
		.catch(() => {
			pdfReportRequesting.value = false;
		});
};
const pdfSocketCallback = (response = {}) => {
	const { type, data } = response;
	const safeData = data?.data || data || {};
	if (type !== 'REPORT.GRAPHICAL') return;

	const { report_filename, report_by_sensor_ids = [] } = safeData;
	const compareSensorIds = sensorsList.value.map((item) => item.id);
	const hasCurrentSensor = report_by_sensor_ids.includes(props.sensorData.id);
	const hasCompareSensor = report_by_sensor_ids.some((id) => compareSensorIds.includes(id));

	if (hasCurrentSensor || hasCompareSensor) {
		Notify({
			type: 'success',
			message: tt('phrases.Report_created'),
		});
		pdfReportURL.value = report_filename;
	}

	pdfReportProcessing.value = false;
	closeWebSocket({ socketName: 'pdf_socket' });
};
const confirmFFTRequest = () => {
	if (props.sensorData.is_fft_processing) return;
	fftRequestBlockRef.value?.confirmFFTRequest?.();
};
const handleLastFFT = () => {
	fftRequestBlockRef.value?.handleLastFFT?.();
};
const handleUnlockFFT = (payload) => {
	fftRequestBlockRef.value?.handleUnlockFFT?.(payload);
};
const handleFFTSuccess = () => {
	emit('event', {
		eventName: 'update_sensor',
		data: {
			id: props.sensorData.id,
			sensor: { ...props.sensorData, is_fft_processing: true },
		},
		onward: true,
	});
};
const showRpmSettings = () => {
	initiatedRPMDialog.value = true;
	showRpmSettingsDialog.value = !showRpmSettingsDialog.value;
};
const saveEquipmentRpmParams = (data) => {
	const equipment = props.equipmentData || {};
	const selectedRpmOption = findItemBy('id', equipment.rpm_source_item, itemSpeedOptionsList());
	let finalRpmSourceItem = equipment.rpm_source_item;

	if (selectedRpmOption) {
		finalRpmSourceItem = props.sensorData?.rpmSources?.[selectedRpmOption.source_key]
			? finalRpmSourceItem
			: defaultRpmSourceItem.value;
	}

	loadingRPM.value = true;
	return api_request.put(`/equipments/${equipment.id}/rpm-params`, {
		notNotify: true,
		data: {
			is_rpm_visible: !!equipment.is_rpm_visible,
			rpm_source_item: finalRpmSourceItem || defaultRpmSourceItem.value,
			...data,
		},
	})
		.then(({ value }) => {
			showRpmSettingsDialog.value = false;
			emit('event', {
				eventName: 'updateEquipment',
				data: value,
				onward: true,
			});
		})
		.finally(() => {
			loadingRPM.value = false;
		});
};
const saveRpmParams = (data) => {
	if (!props.equipmentData?.id) return;
	saveEquipmentRpmParams(data);
};
const toggleRpmOverlay = () => {
	if (!isRpmParamsSet.value) return;
	saveRpmParams({
		is_rpm_visible: !props.equipmentData.is_rpm_visible,
	});
};

const { handleEvent } = useEventHandler({}, emit);

onBeforeUnmount(() => {
	closeWebSocket({ socketName: 'pdf_socket' });
	closeComparePdfSocket();
});

defineExpose({
	startPDFCompareReport,
	handleUnlockFFT,
	handleLastFFT,
	confirmFFTRequest,
});
</script>
