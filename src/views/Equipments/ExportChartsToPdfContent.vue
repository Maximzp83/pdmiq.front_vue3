<template>
	<div class="">
		<div class="section-row card-content">
			<div class="el-form-item flex mrow">
				<div class="mcol-xs-6">
					<CustomSelectV2
						v-model="formData.report_by_sensor_ids"
						filterable
						multiple
						:optionsLoading="sensorsLoading"
						:optionsList="sensorsList"
						:placeholder="`${tt('Select')} ${tt('sensors')}`"
						prefixIcon="icomoon icon-sensor"
						:setupLabelSettings="sensorLabelOptions"
					/>
				</div>

				<div class="mcol-xs-6">
					<Datepicker
						class="no-max-width"
						v-model="selectedRange"
						type="datetimerange"
						format="YYYY/MM/DD HH:mm"
						value-format="YYYY-MM-DD HH:mm:ss"
						:default-time="['00:00:00', '23:59:59']"
						:picker-options="pickerOptions"
						setupDaterangeFilter
					/>
				</div>
			</div>
		</div>

		<div class="section-row dialog-footer section-row text-center flex mrow justify-center charts-page-operations">
			<div class="button-item">
				<el-button class="capitalize" @click="close">{{ tt('Cancel') }}</el-button>
			</div>

			<div class="button-item pdf-item relative">
				<SimpleSpinner :active="pdfReportProcessing || pdfReportRequesting" />

				<el-button
					v-if="!pdfReportURL"
					type="primary"
					native-type="button"
					class="inverted report-button"
					:disabled="pdfReportProcessing || pdfReportRequesting"
					@click="startPDFreportRequest"
				>
					<i class="icomoon icon-pdf" v-show="!pdfReportProcessing || !pdfReportRequesting"></i>
					<span class="text">{{ pdfReportProcessing ? `${tt('Processing')}...` : tt('Export') }}</span>
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

				<div class="process-description" v-show="pdfReportProcessing">
					{{ tt('phrases.it_will_take_some_time') }}
				</div>
			</div>

			<div class="button-item">
				<el-button
					type="primary"
					class="capitalize"
					:disabled="pdfReportProcessing || pdfReportRequesting"
					:loading="pdfReportProcessing || pdfReportRequesting"
					@click="handleLastExport"
				>
					{{ tt('phrases.load_last_export') }}
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';

import { datePickerAdditionalShortcuts, datePickerShortcuts } from '@/constants/date_time';
import { getDateRange, prepareRangeParams } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useNotify } from '@/composables/useNotify';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSensors } from '@/composables/useSensors';
import { useWebSocket } from '@/composables/mixins/useWebSocket';
import { generateUrl } from '@/utils/url-helpers';

import CustomSelectV2 from '@/components/form/CustomSelectV2.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({ name: 'ExportChartsToPdfContent' });

const props = defineProps({
	plantId: { type: [Number, String], default: null },
});
const emit = defineEmits(['close']);

const authStore = useAuthStore();
const { Notify } = useNotify();
const { fetchSensors, plantGraphsPdfReport, fetchPlantGraphsPdfReportLast } = useSensors();
const { doFetchAction } = useRequestsList();
const { setupWebSocket, closeWebSocket } = useWebSocket();

const sensorsList = ref([]);
const sensorsLoading = ref(false);
const pickedRange = ref({});
const selectedRange = ref([]);
const formData = ref({ report_by_sensor_ids: [] });
const pdfReportURL = ref('');
const pdfReportRequesting = ref(false);
const pdfReportProcessing = ref(false);
const exportingPdfSocketInterval = ref(null);

const socketChannel = computed(() => authStore.authUser ? `user.${authStore.authUser.uuid}` : null);
const sensorLabelOptions = Object.freeze({
	accessors: [
		'equipment.asset.machine.name',
		'equipment.asset.name',
		'location_in_equipment',
	],
	delimeter: ',',
});
const pickerOptions = computed(() => {
	const mainShortcuts = datePickerShortcuts().filter((shortcut) => !shortcut.disabledForCompare);
	const timeRanges = ['1_hour', '3_hours', '12_hours'];
	const shortcuts = [...datePickerAdditionalShortcuts(), ...mainShortcuts].map((shortcut) => {
		const item = {
			...shortcut,
				onClick: (picker) => {
					const withTime = timeRanges.some((rangeName) => rangeName === shortcut.rangeName);
					setTimeout(() => {
						picker.$emit('pick', getDateRange(shortcut.rangeName, { withTime }));
					}, 100);
				},
		};

		if (shortcut.rangeName === 'today') item.text = 'Today (Live)';
		return item;
	});

	return Object.freeze({
		shortcuts,
		onPick(range) {
			pickedRange.value = range;
		},
		disabledDate(date) {
			const { minDate } = pickedRange.value;
			if (!minDate) return false;

			const minDateMs = minDate.getTime();
			const dateMs = date.getTime();
			return dateMs < minDateMs - 604800000 || dateMs > minDateMs + 604800000;
		},
	});
});

const close = () => {
	emit('close');
};
const fetchSensorsListRequest = (payload = {}) => {
	const { params = {}, ...settings } = payload;
	return fetchSensors(params, settings);
};
const fetchSensorsList = () => {
	doFetchAction(fetchSensorsListRequest, sensorsList, sensorsLoading, {
		params: { max: -1, plantId: props.plantId },
		notNotify: true,
		notSetToStore: true,
	});
};
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
	if (!formData.value.report_by_sensor_ids.length) {
		Notify({
			type: 'warning',
			message: tt('phrases.sensors_should_be_selected'),
		});
		return;
	}

	const payload = {
		plantId: props.plantId,
		data: {
			sensor_ids: formData.value.report_by_sensor_ids,
			...prepareRangeParams(selectedRange.value, {
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
const handleLastExport = () => {
	pdfReportProcessing.value = true;
	fetchPlantGraphsPdfReportLast({
		plantId: props.plantId,
		notSetToStore: true,
		returnResponseOnly: true,
	})
		.then((response) => {
			const value = response?.data?.value || response?.data?.data || response?.data;
			if (value?.report_by_sensor_ids) {
				formData.value.report_by_sensor_ids = value.report_by_sensor_ids;
			}
		})
		.finally(() => {
			pdfReportProcessing.value = false;
		});
};

onBeforeMount(() => {
	fetchSensorsList();
});
onBeforeUnmount(() => {
	closeComparePdfSocket();
});
</script>

<style lang="scss" scoped>

</style>
