<template>
	<div class="pdf-and-fft-requests-block flex wrap mrow">
		<div v-if="enablePDF" class="button-item pdf-item relative">
			<SimpleSpinner :active="requestLoading" />
			<el-button
				type="primary"
				native-type="button"
				class="inverted report-button"
				:disabled="requestLoading"
				@click="requestPdfReport"
			>
				<i class="icomoon icon-pdf"></i>
				<span class="text">{{ tt('Export') }}</span>
			</el-button>
		</div>

		<div v-if="enableFFT" class="button-item relative">
			<SimpleSpinner :active="requestLoading" />
			<el-button
				type="primary"
				native-type="button"
				class="inverted report-button"
				:disabled="requestLoading"
				@click="requestFFT"
			>
				<span class="text">FFT</span>
			</el-button>
		</div>

		<div v-if="enableRpmBlock && equipmentData" class="button-item">
			<el-button
				type="primary"
				native-type="button"
				class="inverted report-button"
				@click="rpmSettingsDialogOpen = true"
			>
				<span class="text">{{ tt('rpm') }}</span>
			</el-button>
		</div>

		<el-dialog
			v-model="rpmSettingsDialogOpen"
			append-to-body
			center
			class="tiny dialog-decorate-header title-center rpm-settings-dialog"
			:title="tt('rpm')"
		>
			<RPMSettingsDialog
				:sensorData="sensorData"
				:rootFilters="rootFilters"
				:currentRpmSource="currentRpmSource"
				@save="saveRpmParams"
				@close="rpmSettingsDialogOpen = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { getCurrentRpmSource } from '@/helpers/specialHelpers';
import { useSensors } from '@/composables/useSensors';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import RPMSettingsDialog from './RPMSettingsDialog.vue';

const { tt } = Lang;
const { pdfReportRequest, requestNcdFft, sendRpm } = useSensors();

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
	equipmentData: { type: Object, default: null },
	rootFilters: { type: Object, default: () => ({}) },
	enableRpmBlock: Boolean,
});

const emit = defineEmits(['event']);
const requestLoading = ref(false);
const rpmSettingsDialogOpen = ref(false);

const currentRpmSource = computed(() =>
	getCurrentRpmSource({
		sensorData: props.sensorData,
		rpm_source_item: props.equipmentData?.rpm_source_item,
		rootFilters: props.rootFilters,
	}),
);

const requestPdfReport = () => {
	if (!props.sensorData.id) return;
	requestLoading.value = true;
	pdfReportRequest({
		sensorId: props.sensorData.id,
		data: {
			...props.rootFilters,
			is_compare: props.isCompare,
			sensor_ids: props.sensors.map((item) => item.id),
		},
	})
		.finally(() => {
			requestLoading.value = false;
		});
};

const requestFFT = () => {
	if (!props.sensorData.id) return;
	requestLoading.value = true;
	requestNcdFft({
		sensorId: props.sensorData.id,
		data: { ...props.rootFilters },
	})
		.finally(() => {
			requestLoading.value = false;
		});
};

const saveRpmParams = (data) => {
	if (!props.sensorData.id) return;
	requestLoading.value = true;
	sendRpm({
		sensorId: props.sensorData.id,
		data,
	})
		.then(() => {
			emit('event', {
				eventName: 'rpmParamsSaved',
				data,
				onward: true,
			});
			rpmSettingsDialogOpen.value = false;
		})
		.finally(() => {
			requestLoading.value = false;
		});
};
</script>
