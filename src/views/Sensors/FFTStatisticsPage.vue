<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading || fftLoading || equipmentLoading"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper statistics-page fft-statistics-page">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div
						v-if="loadContent && fftReady && equipmentData"
						class="card-header flex mrow wrap align-center space-between main-card-header"
					>
						<SimpleSpinner :active="fftLoading" />

						<div class="images-part mcol-xs-12 mcol-sm-2">
							<EquipmentPictureBlock
								:equipmentData="equipmentData"
								@event="handleEvent"
							/>
						</div>

						<div class="flex wrap align-center fluid mcol-xs-8">
							<div class="title outside-bg-addition article-title capitalize span-block fluid">
								<div v-html="sensorTitle"></div>
							</div>
							<span class="ml-auto mt-0 article-title outside-bg-addition timestamp">
								{{ fftTimeStamp }}
							</span>

							<div class="mcol-xs-12 flex">
								<div class="card filled_4 request-type-block">
									<span v-if="isManualRoute">{{ fftMetricName }}</span>
									<template v-else>
										<span v-if="isUltrasoundFFT">Fmax = </span>
										<span v-else>{{ requestType }} - </span>
										<span class="no-margin">{{ requestFMax }}</span>
									</template>
								</div>
							</div>
						</div>

						<div class="mcol-xs-auto flex align-center prev-next-buttons-block">
							<div
								:class="['button prev-button', { disabled: !prevFFTItem }]"
								@click="handleFFT({ prev: 1 })"
							>
								<i class="icomoon icon-path_2"></i>
							</div>

							<div
								:class="['button next-button', { disabled: !nextFFTItem }]"
								@click="handleFFT({ next: 1 })"
							>
								<i class="icomoon icon-path_2 rotate"></i>
							</div>
						</div>

						<div v-if="equipmentRPM" class="rpm-block content-row">
							{{ `${tt('rpm')}: ${equipmentRPM}` }}
						</div>

						<div class="mcol-xs-12 content-row">
							<AnalysisFFTContainer
								ref="analysisFFTContainerRef"
								:fftItem="currentFFTItem"
								:itemData="equipmentData"
								:sensorData="sensorData"
								:selectedChildComponentIds="selectedChildComponentIds"
								:rootFilters="{ measurement }"
								:metaDataEntries="metaDataEntries"
								@event="handleEvent"
								@save="handleAnalysisSave"
							/>
						</div>
					</div>

					<div class="section-row margin-top-row axis-selection-container flex justify-center">
						<RadioButtonsBlock
							v-if="!isManualRoute"
							v-show="!splitCharts"
							:settings="axisRadioBlockSettings"
							:optionsList="axisRadioButtonsList"
							:value="activeAxis"
							@onChange="(value) => (activeAxis = value)"
						/>

						<div class="toggle-dropdown-button">
							<el-button
								type="primary"
								native-type="button"
								:class="[
									'action-button inverted re-baseline-button operations-button toggle-additional-filters mini',
									{ active: showFilterbar },
								]"
								@click="toggleFilterbar"
							>
								<i :class="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"></i>
							</el-button>
						</div>
					</div>

					<DropdownFilterbar
						ref="dropdownFilterbarRef"
						hideToggleButton
						filterbarDropdownId="statisticsPageDropdownFilterbar"
					>
						<div class="charts-page-operations flex justify-end triangle pos-top mcol-xs-12">
							<div class="button-item">
								<el-button
									v-if="!isManualRoute"
									type="primary"
									native-type="button"
									:class="['report-button inverted', { active: splitCharts }]"
									@click="handleSplitCharts"
								>
									<i class="icomoon icon-overlay"></i>
									{{ tt('Split') }}
								</el-button>
							</div>
							<div class="button-item">
								<el-button-group>
									<el-button
										v-for="item in metricSystemsList"
										:key="`metricSystem-${item.id}`"
										type="primary"
										native-type="button"
										:class="['inverted', { active: measurement === item.id }]"
										@click="switchMetricSystem(item)"
									>
										{{ item.name }}
									</el-button>
								</el-button-group>
							</div>
						</div>
					</DropdownFilterbar>

					<div
						v-if="loadContent && fftReady && currentFFTItem && equipmentData"
						class="1section-row card-content"
					>
						<FFTChartsListWrapper
							ref="fftChartsListWrapperRef"
							:activeAxis="activeAxis"
							:sensorId="sensorData.id"
							:fftId="currentFFTItem.id"
							:sensorData="sensorData"
							:splitCharts="splitCharts"
							:rootFilters="{ measurement }"
							:prevFFTItems="prevFFTPreparedItems"
							:currentFFTItem="currentFFTItem"
							:additionalProps="chartsAdditionalProps"
							:getParamsByIds="getParamsByIds"
							@event="handleEvent"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Highcharts from '@/config/highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
import draggablePoints from 'highcharts/modules/draggable-points';
import highchartsMore from 'highcharts/highcharts-more';
import annotations from 'highcharts/modules/annotations';

import { createGetByIdRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { initHighchartsModule } from '@/helpers/charts';
import {
	cleanDateString,
	cloneDeep,
	findItemBy,
	getItemValue,
	getRoundedValue,
} from '@/helpers';
import {
	getSensorMetricSystemType,
	getSensorTitle,
} from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useSensors } from '@/composables/useSensors';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useGlobalStore } from '@/stores/GlobalStore';
import {
	bannerRequestFmaxTypesList,
	bannerRequestTypesList,
} from '@/constants/global';
import {
	METRIC_SYSTEM_TYPES,
	NCD_SENSOR_PARAMETERS_TYPES,
	SENSOR_PARAMETERS_TYPES,
	metricSystemsList as getMetricSystemsList,
	manualRouteSensorParametersList,
	ncdAxisList,
	sensorParametersListNCD,
} from '@/modules/charts_factory/controllers/Sensor/enums';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import DropdownFilterbar from '@/components/common/DropdownFilterbar.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import EquipmentPictureBlock from './charts/EquipmentPictureBlock.vue';
import AnalysisFFTContainer from './AnalysisFFT/AnalysisFFTContainer.vue';
import FFTChartsListWrapper from './charts/fft/FFTChartsListWrapper.vue';

initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);
initHighchartsModule(draggablePoints, Highcharts);
initHighchartsModule(highchartsMore, Highcharts);
initHighchartsModule(annotations, Highcharts);

defineOptions({
	name: 'FFTStatisticsPage',
});

const emit = defineEmits(['event']);
const { tt } = Lang;
const route = useRoute();
const router = useRouter();
const globalStore = useGlobalStore();
const { fetchSensor, fetchNcdFft } = useSensors();
const { doFetchAction } = useRequestsList();
const fetchEquipmentById = createGetByIdRequest(ENTITIES.Equipments.apiBase);

const sensorData = ref(null);
const equipmentData = ref(null);
const currentFFTItem = ref(null);
const prevFFTItems = ref([]);
const prevFFTItem = ref(null);
const nextFFTItem = ref(null);
const itemLoading = ref(false);
const equipmentLoading = ref(false);
const fftLoading = ref(false);
const fftReady = ref(false);
const showFilterbar = ref(false);
const splitCharts = ref(false);
const measurement = ref(null);
const activeAxis = ref(1);
const selectedChildComponents = ref([]);
const dropdownFilterbarRef = ref(null);
const analysisFFTContainerRef = ref(null);

const sensorId = computed(() => route.params.id || route.params.sensorId);
const fftId = computed(() => route.params.fftId || route.query.fftId);
const loadContent = computed(() => !!sensorData.value);
const itemsName = computed(() => Object.freeze({
	one: tt('FFT'),
	mult: tt('FFTs'),
}));
const navbarSettings = computed(() => Object.freeze({
	hideBackButton: true,
	pageTitle: `${tt('phrases.Spectrum_Analysis')} ${tt('Page')}`,
}));
const metricSystemsList = computed(() => Object.freeze(getMetricSystemsList()));
const { currentSensorType } = useSensorType({
	currentSensorTypeData: sensorData,
});
const isUltrasoundFFT = computed(() => currentSensorType.value.isBannerM25);
const isManualRoute = computed(() => currentSensorType.value.isManualRoute);
const axisRadioBlockSettings = computed(() => Object.freeze({
	hideTitle: true,
	inline: true,
	buttonType: 'primary',
	className: 'inverted standard',
}));
const axisRadioButtonsList = computed(() => {
	const result = [];
	const sensor = sensorData.value;
	if (!sensor) return Object.freeze(result);

	const {
		ncd_active_vertical_axis,
		is_hidden_ncd_active_vertical_axis,
	} = sensor;

	ncdAxisList.forEach((axis) => {
		const axisName = isUltrasoundFFT.value ? axis.ultrasound_fft_name : axis.name;
		if (ncd_active_vertical_axis === axis.id) {
			if (!is_hidden_ncd_active_vertical_axis) {
				result.push({ ...axis, name: `${axisName} (V)` });
			}
		} else {
			result.push({ ...axis, name: axisName });
		}
	});

	return Object.freeze(result);
});
const prevFFTPreparedItems = computed(() => {
	if (!currentFFTItem.value) return [];

	return [
		{
			id: currentFFTItem.value.id,
			created_at: cleanDateString(currentFFTItem.value.created_at),
			isCurrent: true,
		},
		...prevFFTItems.value.map((item) => ({
			id: item.id,
			created_at: cleanDateString(item.created_at),
		})),
	];
});
const fftTimeStamp = computed(() =>
	currentFFTItem.value ? cleanDateString(currentFFTItem.value.created_at) : '',
);
const equipmentRPM = computed(() => {
	if (currentFFTItem.value?.rpm_value != null) {
		return `${currentFFTItem.value.rpm_value} RPM`;
	}

	const rpm = currentFFTItem.value?.equipment_rpm || sensorData.value?.equipment_rpm;
	if (!rpm) return '';

	if (measurement.value === METRIC_SYSTEM_TYPES.IMPERIAL) return `${rpm} CPM`;
	if (measurement.value === METRIC_SYSTEM_TYPES.METRIC) {
		return `${getRoundedValue(+rpm / 60, 0, 2)} Hz`;
	}

	return '';
});
const getParamsByIds = computed(() => {
	if (isManualRoute.value && currentFFTItem.value) {
		return currentFFTItem.value.metric_type
			? [Number(currentFFTItem.value.metric_type)]
			: [];
	}
	if (isUltrasoundFFT.value) {
		return [
			NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM,
			NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM,
			SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION,
			NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION,
			SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION,
			NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM,
			SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY,
		];
	}
	if (Array.isArray(route.query.params)) return route.query.params.map(Number);
	if (route.query.param) return [Number(route.query.param)];
	return [];
});
const fftMetricName = computed(() => {
	if (!currentFFTItem.value) return '';

	const parameter = manualRouteSensorParametersList(
		currentFFTItem.value.metric_type,
	);
	return parameter?.name || tt('constants.fft');
});
const metaDataEntries = computed(() => {
	const metaData = currentFFTItem.value?.meta_data;
	if (!metaData || typeof metaData !== 'object') return [];

	return Object.keys(metaData).map((key) => ({
		key,
		value: metaData[key],
	}));
});
const requestType = computed(() => {
	if (!sensorData.value || !currentFFTItem.value) return '';
	return getItemValue(
		currentFFTItem.value.banner_request_type,
		'name',
		bannerRequestTypesList(),
	);
});
const requestFMax = computed(() => {
	if (!sensorData.value || !currentFFTItem.value) return '';
	return getItemValue(
		currentFFTItem.value.banner_request_fmax,
		'name',
		bannerRequestFmaxTypesList(),
	);
});
const sensorTitle = computed(() => {
	if (!sensorData.value || !currentFFTItem.value) return '';
	return getSensorTitle(sensorData.value, {
		boldLabels: true,
		linkSettings: {
			key: 'location_in_equipment',
			to: `/equipments/${sensorData.value.equipment_id}/details/pdm/${sensorData.value.id}`,
		},
	});
});
const chartsAdditionalProps = computed(() => ({
	selectedChildComponents: selectedChildComponents.value,
	equipmentData: equipmentData.value,
	isUltrasoundFFT: isUltrasoundFFT.value,
	isManualRoute: isManualRoute.value,
	hcInstance: Highcharts,
}));
const selectedChildComponentIds = computed(() =>
	selectedChildComponents.value.map((item) => item.id),
);

const setFFTReadySoon = () => {
	setTimeout(() => {
		fftReady.value = true;
	}, 100);
};
const setupActiveAxisByFFT = (fft) => {
	if (fft?.alarm) {
		const paramItem = findItemBy(
			'id',
			fft.alarm.sensor_parameter_type,
			sensorParametersListNCD(),
		);
		if (paramItem?.axis_id) {
			activeAxis.value = paramItem.axis_id;
		}
	}
};
const normalizeFftResponse = (value) => {
	if (Array.isArray(value)) return value;
	if (Array.isArray(value?.items)) return value.items;
	if (Array.isArray(value?.data)) return value.data;
	return value || null;
};
const fetchEquipment = (id) => {
	if (!id) return;
	doFetchAction(
		fetchEquipmentById,
		equipmentData,
		equipmentLoading,
		{
			itemId: id,
			prepareData: 'prepareEquipmentsList',
			prepareDataSettings: {
				addSettingItems: [
					{ key: 'brand', val_key: 'brand' },
					{ key: 'brand_model', val_key: 'model' },
				],
			},
		},
	);
};
const fetchFFT = ({ urlPostfix = '', target, settings = {} } = {}) => {
	if (!sensorData.value?.id || !target) return Promise.resolve();

	const requestPayload = settings.requestPayload || {};

	fftLoading.value = true;
	return fetchNcdFft({
		sensorId: sensorData.value.id,
		urlPostfix,
		notNotifyError: true,
		...requestPayload,
	})
		.then(({ value }) => {
			target.value = normalizeFftResponse(value);
		})
		.catch(() => {
			target.value = Array.isArray(target.value) ? [] : null;
			fftReady.value = true;
		})
		.finally(() => {
			fftLoading.value = false;
		});
};
const fetchFFTBundle = () => {
	const selectedFftId = fftId.value;
	if (!sensorData.value?.id) return;

	fftReady.value = false;
	fetchFFT({
		target: currentFFTItem,
		urlPostfix: selectedFftId ? `/${selectedFftId}` : '',
	});
	if (selectedFftId) {
		fetchFFT({
			target: prevFFTItems,
			urlPostfix: `/${selectedFftId}/prev?max=9`,
		});
		fetchFFT({
			target: nextFFTItem,
			urlPostfix: `/${selectedFftId}/next`,
			settings: {
				requestPayload: { notNotify: true }
			}
		});
	}
};
const setupMeasurement = (sensor) => {
	measurement.value = getSensorMetricSystemType(sensor, equipmentData.value);
};
const fetchPageData = () => {
	if (!sensorId.value) return;

	itemLoading.value = true;
	fetchSensor({ itemId: sensorId.value })
		.then(({ value }) => {
			sensorData.value = value || null;
			if (sensorData.value) {
				fetchEquipment(sensorData.value.equipment_id);
				setupMeasurement(sensorData.value);
				fetchFFTBundle();
			}
		})
		.finally(() => {
			itemLoading.value = false;
		});
};
const toggleFilterbar = (event) => {
	showFilterbar.value = !showFilterbar.value;
	dropdownFilterbarRef.value?.toggleFilterbar(event);
};

const updateEquipmentAndFFT = ({
	equipmentItem,
	fftItem,
	skipFFTReload,
	updateRpmValue,
	updateVibrationAnalysisRules,
} = {}) => {
	if (equipmentItem) {
		setTimeout(() => {
			equipmentData.value = equipmentItem;
		}, 10);
	}
	if (fftItem && currentFFTItem.value) {
		if (updateRpmValue) {
			currentFFTItem.value.rpm_value = fftItem.rpm_value;
		}
		if (updateVibrationAnalysisRules) {
			currentFFTItem.value.vibration_analysis_rules = fftItem.vibration_analysis_rules;
		}
		if (!skipFFTReload) {
			fftReady.value = false;
			setTimeout(() => {
				currentFFTItem.value = fftItem;
			}, 10);
		}
	}
};

const handleFFT = ({ prev, next } = {}) => {
	if (!sensorData.value || !currentFFTItem.value) return;

	const {
		isBannerTempVibe2,
		isBannerV2_1,
		isBannerV2Generic,
	} = currentSensorType.value;
	const urlType = (isBannerTempVibe2 || isBannerV2_1 || isBannerV2Generic) ? 'banner' : 'ncd';

	if (prev && prevFFTItem.value) {
		fftReady.value = false;
		router.replace(`/${urlType}/${sensorData.value.id}/fft/${prevFFTItem.value.id}`);
		nextFFTItem.value = cloneDeep(currentFFTItem.value);
		currentFFTItem.value = cloneDeep(prevFFTItem.value);
		fetchFFT({
			target: prevFFTItems,
			urlPostfix: `/${prevFFTItem.value.id}/prev?max=9`,
		});
	} else if (next && nextFFTItem.value) {
		fftReady.value = false;
		router.replace(`/${urlType}/${sensorData.value.id}/fft/${nextFFTItem.value.id}`);
		currentFFTItem.value = cloneDeep(nextFFTItem.value);
		fetchFFT({
			target: prevFFTItems,
			urlPostfix: `/${nextFFTItem.value.id}/prev?max=11`,
		});
		fetchFFT({
			target: nextFFTItem,
			urlPostfix: `/${nextFFTItem.value.id}/next`,
		});
	}
};
const handleSplitCharts = () => {
	splitCharts.value = !splitCharts.value;
};
const switchMetricSystem = ({ id }) => {
	measurement.value = id;
};
const addChildComponentToSelected = (component) => {
	const isSelected = selectedChildComponents.value.some((item) => item.id === component.id);
	selectedChildComponents.value = isSelected
		? selectedChildComponents.value.filter((item) => item.id !== component.id)
		: [...selectedChildComponents.value, component];
};
const clearSelectedChildComponentsOnCharts = () => {
	selectedChildComponents.value = [];
};
const handleRpmCursorDrop = (data) => {
	analysisFFTContainerRef.value?.saveRpmParams?.(data, {
		successMessage: `RPM ${tt('updated')}`,
		updateRpmValue: true,
		skipFFTReload: true,
	});
};
const handleAnalysisSave = ({ clearSelectedChildComponentsOnCharts: clearSelected } = {}) => {
	if (clearSelected) clearSelectedChildComponentsOnCharts();
};
const rpmParamsSaved = (data) => {
	updateEquipmentAndFFT({
		fftItem: data,
		updateRpmValue: true,
		skipFFTReload: true,
	});
};
const togglePreviewModal = (data) => {
	emit('event', {
		eventName: 'togglePreviewModal',
		data,
		onward: true,
	});
};

const { handleEvent } = useEventHandler({
	updateEquipmentAndFFT,
	addChildComponentToSelected,
	clearSelectedChildComponentsOnCharts,
	handleRpmCursorDrop,
	rpmParamsSaved,
	togglePreviewModal,
}, emit);

watch(prevFFTItems, (items) => {
	prevFFTItem.value = items?.length ? items[0] : null;
});
watch(equipmentData, (equipment) => {
	if (equipment && sensorData.value) {
		measurement.value = getSensorMetricSystemType(sensorData.value, equipment);
	}
});
watch(currentFFTItem, (fft) => {
	if (!fft) return;
	setupActiveAxisByFFT(fft);
	setFFTReadySoon();
});
watch(
	() => [sensorId.value, fftId.value],
	() => fetchPageData(),
);

onMounted(() => {
	globalStore.setup_navbar(navbarSettings.value);
	fetchPageData();
});
onBeforeUnmount(() => globalStore.setup_navbar({}));
</script>
