<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="sensorLoading || overlaySensorLoading"
			:itemsName="itemsName.one"
		/>

		<div
			:class="[
				'view-wrapper item-page-wrapper statistics-page specifications-block-wrapper',
				{ 'with-compare': isCompare },
			]"
		>
			<div :class="{ mcontainer: isCompare }">
				<div :class="[{ card: isCompare }, 'section-row']">
					<div
						:class="[
							{ 'card-content': isCompare },
							'mrow flex wrap page-header align-center relative',
						]"
					>
						<div v-if="!isCompare && equipmentData" class="images-part mcol-xs-12 mcol-sm-2">
							<EquipmentPictureBlock
								:equipmentData="equipmentData"
								@event="handleEvent"
							/>
						</div>

						<div class="mcol-xs-12 mcol-sm-2 mcol-lg-2 fluid flex align-center wrap">
							<div class="title page-title capitalize span-block" v-html="sensorTitle"></div>

							<div
								v-if="sensorData?.is_runtime_tracking"
								class="runtime-tracking-section"
							>
								<span class="span-block value">{{ tt('runtime') }}:</span>
								<span class="span-block value">{{ totalRuntime }}</span>
							</div>
						</div>

						<div
							v-if="!currentSensorType.isBannerV2Generic"
							class="mcol-xs-auto legend-container"
						>
							<div class="legend-list">
								<div
									v-for="(item, idx) in legendList"
									:key="`legend_item-${idx}`"
									class="item"
								>
									<span :class="['label', item.className]"></span>
									<span>{{ item.label }}</span>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-20 text-right ml-auto">
							<Datepicker
								className="no-min-width"
								:value="filters.daterange"
								type="datetimerange"
								format="YYYY/MM/DD HH:mm"
								value-format="YYYY-MM-DD HH:mm:ss"
								:default-time="['00:00:00', '23:59:59']"
								:picker-options="pickerOptions"
								setupDaterangeFilter
								@input="handleDaterange"
							/>
						</div>

						<div class="button-item">
							<el-button
								type="primary"
								native-type="button"
								:class="[
									'inverted re-baseline-button operations-button toggle-additional-filters',
									{ active: showFilterbar },
								]"
								@click="toggleFilterbar"
							>
								<i :class="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"></i>
							</el-button>
						</div>

						<DropdownFilterbar
							ref="dropdownFilterbarRef"
							hideToggleButton
							disableTriangle
							disableCard
							filterbarDropdownId="statisticsPageDropdownFilterbar"
							@event="handleEvent"
						>
							<BannerFilterBlock
								v-if="enableFilterBlock.banner"
								ref="bannerFilterBlockRef"
								:key="dropdownFilterbarUpdated"
								:sensorData="sensorData"
								:sensors="sensors"
								:itemsLoading="sensorLoading"
								:showHistory="showHistory"
								:joinChartsBy="joinChartsBy"
								:splitNCDCharts="splitNCDCharts"
								:splitChartsButtonEnabled="splitChartsButtonEnabled"
								:currentSensorType="currentSensorType"
								:isCompare="isCompare"
								:enableFFT="enableFFT"
								:equipmentData="equipmentData"
								:statsThresholdsActive="statsThresholdsActive"
								:v21ViewActive="v21ViewActive"
								:hasOffAlarm="hasOffAlarm"
								@event="handleEvent"
							/>

							<UltrasoundFilterBlock
								v-if="enableFilterBlock.ultrasound"
								:key="`ultrasound-${dropdownFilterbarUpdated}`"
								:class="{ 'ml-5': enableLubeTriggerButton }"
								:enableLubeTriggerButtonOnly="enableLubeTriggerButton"
								:sensorData="sensorData"
								:isCompare="isCompare"
								:showHistory="showHistory"
								:currentSensorType="currentSensorType"
								:isLubeMatrixV3="isLubeMatrixV3"
								@event="handleEvent"
							/>

							<CustomPDMFilterBlock
								v-else-if="enableFilterBlock.customPDM"
								:key="`custom-${dropdownFilterbarUpdated}`"
								:sensorData="sensorData"
								:showHistory="showHistory"
								:isCompare="isCompare"
								:enableFFT="enableFFT"
								:currentSensorType="currentSensorType"
								:enablePDFButton="!currentSensorType.isNCDPressure"
								:equipmentData="equipmentData"
								:enableChartFilters="enableCustomPDMChartFilters"
								:enableStatsBlock="currentSensorType.isBannerV2Generic"
								:statsThresholdsActive="statsThresholdsActive"
								@event="handleEvent"
							/>
						</DropdownFilterbar>
					</div>
				</div>

				<div
					v-if="isCompare && sensors.length && sensors.length === compareList.length"
					class="compare-title-section section-row"
				>
					<div class="mrow flex">
						<div
							v-for="sensor in sensors"
							:key="`compare_sensor-${sensor.id}`"
							class="compare-title-item"
						>
							<div class="card">
								<div
									class="card-content title"
									v-html="getSensorTitle(sensor, { boldLabels: true })"
								></div>
							</div>
						</div>
					</div>
				</div>

				<div class="tab-container reportBlock-tab show_tab">
					<div
						:class="[
							'tab-container',
							{
								showHistory,
								'show-RPM': equipmentData?.is_rpm_visible,
							},
						]"
					>
						<PossibleProblemsBlock
							v-if="enableProblemsBlock"
							:currentSensor="sensorData"
							:sensorParamsForSetupProblems="sensorParamsForSetupProblems"
							:daterange="filters.daterange"
							:isNCDSensor="isNCDSensor"
						/>

						<div
							v-if="enableAxisSelector && splitNCDCharts && (!joinChartsBy.prop || joinChartsBy.prop === 'split')"
							class="section-row margin-top-row axis-selection-container flex justify-center"
						>
							<RadioButtonsBlock
								:settings="axisRadioBlockSettings"
								:optionsList="axisRadioButtonsList"
								:value="activeAxis"
								@onChange="(value) => (activeAxis = value)"
							/>
						</div>

						<div
							v-if="allSensorsReady"
							:class="[
								'section-row',
								{ 'compare-section flex mrow': isCompare },
								{ 'show-statistics-lines': statsThresholdsActive },
							]"
						>
							<ChartsListWrapper
								v-for="(sensor, idx) in sensors"
								:key="`wrapper_chart-${sensor.id}-key_${dropdownFilterbarUpdated}`"
								:ref="(el) => setChartsListWrapperRef(el, idx)"
								:chartsContainerIdx="idx"
								:loadingQueue="loadingQueue"
								:rootFilters="filters"
								:sensorData="sensor"
								:linespeedOverlaySensorData="linespeedOverlaySensorData"
								:rpmOverlayData="rpmOverlayData"
								:joinChartsBy="joinChartsBy"
								:activeAxis="activeAxis"
								:enableAxisSelector="enableAxisSelector"
								:additionalProps="additionalProps"
								@event="handleEvent"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="chartMessageDialogInit"
			v-model="showNewMessage"
			center
			:title="tt('phrases.Add_new_note_to_point')"
			append-to-body
			class="small report-item-dialog"
		>
			<ChartMessageForm
				:itemData="showNewMessage ? pointData : null"
				:sensorId="sensorData?.id"
				@closeDialog="showNewMessage = false"
				@success="(chartId) => reloadChart(chartId, { reloadAll: 1 })"
			/>
		</el-dialog>

		<el-dialog
			v-model="showZoneSetup"
			center
			:title="tt('phrases.Setup_thresholds')"
			append-to-body
			class="small report-item-dialog vertical-margin"
		>
			<LevelZoneFormWrapper
				v-if="showZoneSetup"
				:sensorData="sensorData"
				:currentSensorType="currentSensorType"
				:settings="levelZoneSetupSettings"
				@closeDialog="closeLevelZoneSetup"
				@zoneUpdated="(chartId) => reloadChart(chartId)"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, nextTick, onBeforeMount, onMounted, ref, watch, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import Highcharts from '@/config/highcharts';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

import { initHighchartsModule } from '@/helpers/charts';
import { Lang } from '@/localization';
import { useSensors } from '@/composables/useSensors';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNotify } from '@/composables/useNotify';
import { useNavigation } from '@/composables/mixins/useNavigation';
const { changeRoute } = useNavigation();

import { useSensorsStore } from '@/stores/SensorsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useAuthStore } from '@/stores/AuthStore';
import {
	cloneDeep,
	convertMsToHours,
	findItemBy,
	getDateRange,
} from '@/helpers';
import { getSensorTitle } from '@/helpers/specialHelpers';
import {
	datePickerAdditionalShortcuts,
	datePickerShortcuts,
	localeMonths,
	localeMonthsFull,
	weekdays,
} from '@/constants/date_time';
import {
	DATASET,
	ITEM_SPEED_OPTIONS,
	NCD_ALARM_TYPES,
	NCD_NODE_TYPES,
	RPM_SOURCES_TYPES,
} from '@/constants/global';
import { LUBE_VERSIONS } from '@/constants/ultrasound';
import {
	BANNER_V2_1_VIBRATION_PARAMETERS_TYPES,
	ncdAxisList,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { LANGUAGE_TYPES } from '@/localization/utils';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import DropdownFilterbar from '@/components/common/DropdownFilterbar.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import ChartsListWrapper from './charts/ChartsListWrapper.vue';
import EquipmentPictureBlock from './charts/EquipmentPictureBlock.vue';


const PossibleProblemsBlock = defineAsyncComponent(() => import('./PossibleProblemsBlock.vue'));
const BannerFilterBlock = defineAsyncComponent(() => import('./FilterBlock/BannerFilterBlock.vue'));
const UltrasoundFilterBlock = defineAsyncComponent(() => import('./FilterBlock/UltrasoundFilterBlock.vue'));
const CustomPDMFilterBlock = defineAsyncComponent(() => import('./FilterBlock/CustomPDMFilterBlock.vue'));
const ChartMessageForm = defineAsyncComponent(() => import('./ChartMessageForm.vue'));
const LevelZoneFormWrapper = defineAsyncComponent(() => import('./LevelZoneFormWrapper.vue'));

initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);

const { tt } = Lang;
const route = useRoute();
const router = useRouter();
const sensorsStore = useSensorsStore();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const emit = defineEmits(['event']);
const { statistics_filters: filters } = storeToRefs(sensorsStore);
const { compareList } = storeToRefs(globalStore);
const { fetchSensor, toggleUltrasoundCommand } = useSensors();

const localToUtcYmdHis = (dateString) => {
	const normalized = `${dateString || ''}`.replace(/Z$/, '');
	const date = new Date(normalized);
	const pad = (value) => String(value).padStart(2, '0');

	if (Number.isNaN(date.getTime())) return dateString;

	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
};

defineOptions({
	name: 'StatisticsPage',
});

const dropdownFilterbarRef = ref(null);
const bannerFilterBlockRef = ref(null);
const chartsListWrapperRefs = ref([]);
const dropdownFilterbarUpdated = ref(1);
const statsThresholdsActive = ref(false);
const v21ViewActive = ref(false);
const initialSensorDataSet = ref(null);
const joinChartsBy = ref({ prop: '' });
const isTodayRangeClicked = ref(false);
const splitNCDCharts = ref(false);
const rangeWithTime = ref(false);
const pickedRange = ref({});
const showFilterbar = ref(false);
const showHistory = ref(false);
const showZoneSetup = ref(false);
const levelZoneSetupSettings = ref({});
const pointData = ref(null);
const chartMessageDialogInit = ref(false);
const showNewMessage = ref(false);
const sensorLoading = ref(false);
const sensors = ref([]);
const currentSensorIds = ref([]);
const sensorsReadyCount = ref(0);
const loadingQueue = ref([]);
const lubeCycleHighSpeed = ref(false);
const activeAxis = ref(1);
const sensorParamsForSetupProblems = ref([]);
const chartsWithOffAlarm = ref([]);
const chartsListWrappersReadyCount = ref(0);
const rpmOverlaySensorData = ref(null);
const overlaySensorLoading = ref(false);
const isOverlaySensorReady = ref(false);

const sensorData = computed(() => {
	if (allSensorsReady.value && dropdownFilterbarUpdated.value) {
		return cloneDeep(sensors.value[0]);
	}
	return null;
});

const { currentSensorType } = useSensorType({ currentSensorTypeData: sensorData });
const { Notify } = useNotify();

const sensorId = computed(() => route.params.sensorId || route.params.id);
const isCompare = computed(() => Boolean(route.query.compare) || sensorId.value === 'compare');
const equipmentData = computed(() => sensorData.value?.equipment || {});
const itemsName = computed(() => ({
	one: tt('PDM_Item'),
	mult: tt('PDM_Items'),
}));
const additionalProps = computed(() => Object.freeze({
	lube_cycle_high_speed: lubeCycleHighSpeed.value,
	isCompare: isCompare.value,
	showHistory: showHistory.value,
	statsThresholdsActive: statsThresholdsActive.value,
	accessToThresholds:
		authStore.hasAccessTo(['edit_dashboard']) &&
		!Object.values(joinChartsBy.value).some((value) => Boolean(value) && value !== 'split'),
	hcInstance: Highcharts,
	higchartInstances: {
		hcInstance: Highcharts,
		hcInstanceNew: Highcharts,
		stockInitNew: stockInit,
		boostNew: boost,
		stockInit,
		boost,
	},
}));
const isLubeMatrixV3 = computed(() => {
	const data = sensorData.value;
	return Boolean(data && (data.data_set === DATASET.LUBEMATRIX_V3 || data.lube_version === LUBE_VERSIONS.V3));
});
const enableFilterBlock = computed(() => {
	const type = currentSensorType.value || {};
	return Object.freeze({
		banner:
			isCompare.value ||
			type.isBanner ||
			type.isBannerCM1L ||
			type.isBannerExtraVibration ||
			type.isHumiditySensor ||
			type.isNCDTempVibe ||
			type.isNCDWiredTempVibe ||
			type.isNCDTempVibeCurr ||
			type.isNCDEnv ||
			type.isBannerTempVibe2 ||
			type.isBannerV2_1 ||
			type.isBannerM25,
		ultrasound:
			type.isUltrasound ||
			type.isSDTsensor ||
			type.isNCDSDT ||
			isLubeMatrixV3.value,
		customPDM:
			type.isCustomPDM ||
			type.isNCDPressure ||
			type.isBannerPressure ||
			type.isNCDCustom_4_20 ||
			type.isBannerV2Generic,
	});
});
const enableLubeTriggerButton = computed(() => {
	const type = currentSensorType.value || {};
	return Boolean((type.isBannerV2_1 || type.isBannerM25) && sensorData.value?.is_lube_mode);
});
const enableFFT = computed(() => {
	if (isCompare.value) return false;

	const type = currentSensorType.value || {};
	const bannerV2Subtype = sensorData.value?.bannerV2Subtype;
	return Boolean(
		authStore.hasAccessTo(['view_dashboard']) &&
		(
			enableAxisSelector.value ||
			type.isBannerV2_1 ||
			type.isBannerM25 ||
			(type.isBannerV2Generic && bannerV2Subtype?.is_fft_allowed)
		),
	);
});
const isNCDSensor = computed(() => {
	const type = currentSensorType.value || {};
	return Boolean(
		type.isNCDTempVibe ||
		type.isNCDWiredTempVibe ||
		type.isNCDTempVibeCurr ||
		type.isNCDSDT ||
		type.isNCDEnv,
	);
});
const splitChartsButtonEnabled = computed(() => isNCDSensor.value);
const enableProblemsBlock = computed(() => Boolean(
	sensorData.value &&
	!isCompare.value &&
	!currentSensorType.value.isSDTsensor &&
	!currentSensorType.value.isHumiditySensor,
));
const enableAxisSelector = computed(() => {
	const type = currentSensorType.value || {};
	return Boolean(
		!isCompare.value &&
		(
			type.isNCDTempVibe ||
			type.isNCDWiredTempVibe ||
			type.isNCDTempVibeCurr ||
			type.isBannerTempVibe2
		),
	);
});
const axisRadioBlockSettings = computed(() => Object.freeze({
	hideTitle: true,
	inline: true,
	buttonType: 'primary',
	className: 'inverted standard',
}));
const axisRadioButtonsList = computed(() => {
	const result = [];
	const data = sensorData.value;

	if (enableAxisSelector.value && data) {
		ncdAxisList.forEach((axis) => {
			if (data.ncd_active_vertical_axis === axis.id) {
				if (!data.is_hidden_ncd_active_vertical_axis) {
					result.push({ ...axis, name: `${axis.name} (V)` });
				}
			} else {
				result.push(axis);
			}
		});
	}

	return Object.freeze(result);
});
const rpmOverlayData = computed(() => {
	if (!equipmentData.value?.rpm_source_item) return null;
	if (equipmentData.value.linespeedSensor?.is_deleted) return null;

	const {
		rpm_source_item,
		rpmSources,
		rpm_external_node_parameter,
		rpm_external_node_id,
		rpm_formula,
		is_rpm_visible,
	} = equipmentData.value;
	const data = { is_rpm_visible };

	switch (rpm_source_item) {
		case ITEM_SPEED_OPTIONS.LINESPEED_RPM:
			if (equipmentData.value.prodline_rpm_source_type === RPM_SOURCES_TYPES.MANUAL) {
				data.rpm_value = rpmSources?.line_speed_rpm_evaluated;
			} else if (equipmentData.value.prodline_rpm_source_type === RPM_SOURCES_TYPES.EXTERNAL_INPUT) {
				data.rpm_request = {
					parameter: equipmentData.value.prodline_rpm_node_parameter,
					sensor_id: equipmentData.value.prodline_rpm_node_id,
				};
			}
			break;
		case ITEM_SPEED_OPTIONS.SPECIFICATION_RPM:
			data.rpm_value = rpmSources?.specification_rpm_evaluated;
			break;
		case ITEM_SPEED_OPTIONS.MANUAL_RPM:
			data.rpm_value = rpmSources?.manual_rpm_evaluated;
			break;
		case ITEM_SPEED_OPTIONS.MAX_PEAK_FREQUENCY:
			data.rpm_request = {
				parameter: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS,
			};
			data.isMaxPeakFrequency = true;
			break;
		case ITEM_SPEED_OPTIONS.EXTERNAL:
			data.rpm_request = {
				parameter: rpm_external_node_parameter,
				sensor_id: rpm_external_node_id,
			};
			break;
		default:
			break;
	}

	if (rpm_formula && data.rpm_request) {
		data.rpm_request.get_params = { unitExpression: rpm_formula };
	}

	return data;
});
const overlaySensorId = computed(() => {
	const request = rpmOverlayData.value?.rpm_request;
	return !isCompare.value && request?.sensor_id && request.sensor_id !== currentSensorIds.value[0]
		? request.sensor_id
		: null;
});
const linespeedOverlaySensorData = computed(() => {
	if (equipmentData.value?.linespeedSensor?.is_deleted) return null;
	if (rpmOverlayData.value?.rpm_request) {
		return rpmOverlayData.value.isMaxPeakFrequency
			? cloneDeep(sensorData.value)
			: cloneDeep(rpmOverlaySensorData.value);
	}
	return equipmentData.value?.linespeedSensor || null;
});
const allSensorsReady = computed(() => sensorsReadyCount.value === currentSensorIds.value.length);
const pickerOptions = computed(() => {
	const mainShortcuts = !isCompare.value
		? datePickerShortcuts()
		: datePickerShortcuts().filter((shortcut) => !shortcut.disabledForCompare);
	const timeRanges = ['1_hour', '3_hours', '12_hours'];
	const shortcuts = [...datePickerAdditionalShortcuts(), ...mainShortcuts].map((shortcut) => ({
		...shortcut,
		text: shortcut.rangeName === 'today' ? 'Today (Live)' : shortcut.text,
		onClick: (picker) => {
			rangeWithTime.value = timeRanges.some((rangeName) => rangeName === shortcut.rangeName);
			setTimeout(() => {
				isTodayRangeClicked.value = shortcut.rangeName === 'today';
				picker.$emit('pick', getDateRange(shortcut.rangeName));
			}, 100);
		},
	}));

	return Object.freeze({
		shortcuts,
		onPick(range) {
			isTodayRangeClicked.value = false;
			pickedRange.value = range;
		},
		disabledDate(date) {
			const { minDate } = pickedRange.value || {};
			if (minDate && isCompare.value) {
				const minDateMs = minDate.getTime();
				const dateMs = date.getTime();
				return dateMs < minDateMs - 604800000 || dateMs > minDateMs + 604800000;
			}
			return false;
		},
	});
});
const hasLubeZone = computed(() => {
	const data = sensorData.value;
	const type = currentSensorType.value || {};
	if (type.isUltrasound) return true;
	if (data?.levelZones && (type.isSDTsensor || type.isNCDSDT)) {
		return data.levelZones.some((zone) => zone.is_lube_zone_included);
	}
	return false;
});
const totalRuntime = computed(() => {
	const totalSeconds = sensorData.value?.total_runtime_seconds;
	if (!sensorData.value?.is_runtime_tracking || !totalSeconds) return '';
	let { total_hours, total_mins } = convertMsToHours(totalSeconds * 1000);
	total_mins = `${total_mins}`;
	const mins = total_mins !== '0' && total_mins.length === 1 ? `0${total_mins}` : total_mins;
	return `${total_hours}:${mins}`;
});
const legendList = computed(() => {
	const type = currentSensorType.value || {};
	const list = [];
	if (!sensors.value.length) return Object.freeze(list);

	if (
		type.isHumiditySensor ||
		type.isNCDEnv ||
		type.isNCDPressure ||
		type.isBannerPressure ||
		(type.isNCDCustom_4_20 && sensors.value[0].alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM)
	) {
		list.push(
			{ label: tt('phrases.High_Alarm'), className: 'alarm' },
			{ label: tt('phrases.Low_Alarm'), className: 'blue' },
		);
	} else {
		list.push(
			{ label: tt('constants.Alarm'), className: 'alarm' },
			{ label: tt('constants.Warning'), className: 'warning' },
		);
		if (hasLubeZone.value) {
			list.push({ label: tt('constants.Lubeline'), className: 'lubeline' });
		}
		list.push({ label: tt('constants.Good'), className: 'good' });
	}

	return Object.freeze(list);
});
const sensorTitle = computed(() => {
	if (isCompare.value) return tt('Compare');
	if (sensors.value.length) {
		const additionalSettings = [];
		if (
			currentSensorType.value.isNCDCustom_4_20 &&
			sensors.value[0].node_type === NCD_NODE_TYPES.POSITION_2
		) {
			additionalSettings.push({
				key: 'ncd_ultrasound_position',
				label: tt('position'),
			});
		}
		return getSensorTitle(sensors.value[0], {
			additional_settings: additionalSettings,
			boldLabels: true,
		});
	}
	return '';
});
const navbarSettings = computed(() => {
	const settings = {
		showStandardNavItem: true,
		pageTitle: '<span><b>PdM</b>Matrix<sup>TM</sup></span>',
	};
	if (!isCompare.value && sensorData.value?.controller?.plant) {
		settings.showPlantName = {
			name: sensorData.value.controller.plant.name,
		};
	}
	return Object.freeze(settings);
});
const enableCustomPDMChartFilters = computed(() => {
	const type = currentSensorType.value || {};
	return !type.isNCDPressure && !type.isBannerPressure && !type.isNCDCustom_4_20;
});
const hasOffAlarm = computed(() => Boolean(chartsWithOffAlarm.value.length));

const setChartsListWrapperRef = (el, idx) => {
	if (el) chartsListWrapperRefs.value[idx] = el;
};

const toggleV2_1View = () => {
	v21ViewActive.value = !v21ViewActive.value;
	if (!sensors.value[0]) return;
	sensors.value[0].data_set = v21ViewActive.value
		? DATASET.BANNER_TEMP_VIBE_V2_1
		: initialSensorDataSet.value;
	dropdownFilterbarUpdated.value += 1;
};

const toggleStatsThresholds = () => {
	statsThresholdsActive.value = !statsThresholdsActive.value;
};

const handleDaterange = (range) => {
	sensorsStore.set_statistics_filters({
		...filters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
		isLiveEnabled: isTodayRangeClicked.value,
	});

	const { dateStart, dateFinish, parameter, source } = route.query;
	if (dateStart || dateFinish) {
		router.replace({
			path: route.path,
			query: {
				...(parameter ? { parameter } : {}),
				...(source ? { source } : {}),
			},
		});
	}
};

const toggleFilterbar = (event) => {
	showFilterbar.value = !showFilterbar.value;
	dropdownFilterbarRef.value?.toggleFilterbar(event);
};

const updateSensor = ({ id, sensor }) => {
	const { item, index } = findItemBy('id', id, sensors.value, { returnIndex: true });
	if (item) {
		sensors.value[index] = sensor;
		lubeCycleHighSpeed.value = sensor.lube_cycle_high_speed;
		dropdownFilterbarUpdated.value += 1;
	}
};
const updateEquipment = (equipment) => {
	if (!equipment?.id) return;

	sensors.value = sensors.value.map((sensor) => {
		if (sensor.equipment?.id !== equipment.id) return sensor;

		return {
			...sensor,
			equipment: {
				...sensor.equipment,
				...equipment,
			},
		};
	});
	dropdownFilterbarUpdated.value += 1;
};

const initSensors = (items) => {
	if (items?.length) {
		sensors.value = cloneDeep(items);
		return;
	}
	sensors.value = [];
	loadingQueue.value = [];
	fetchSensors(currentSensorIds.value, 0);
};

const fetchSensors = (ids, sensorIdx = 0) => {
	sensorsReadyCount.value = 0;
	sensorLoading.value = true;
	fetchSensorsAction(ids, sensorIdx);
};

const fetchSensorsAction = (ids, sensorIdx) => {
	if (!ids.length) {
		sensorLoading.value = false;
		return;
	}

	fetchSensor({ itemId: ids[sensorIdx] })
		.then(({ value }) => {
			const dashboardSensors = equipmentData.value?.dashboardSensors || [];
			const sensorFromEquipment = cloneDeep(findItemBy('id', ids[sensorIdx], dashboardSensors)) || {};
			sensors.value.push({ ...sensorFromEquipment, ...value });
			initialSensorDataSet.value = sensors.value[0]?.data_set;
			sensorsReadyCount.value += 1;

			if (sensorIdx < ids.length - 1) {
				fetchSensorsAction(ids, sensorIdx + 1);
			} else {
				loadingQueue.value.push(1);
				sensorLoading.value = false;
			}
		})
		.catch((error) => {
			console.warn(error);
			if (error?.response?.status === 404) {
				changeRoute({ history: true, steps: -1 });
				setTimeout(() => {
					Notify({
						type: 'warning',
						title: 'Redirect',
						message: `${itemsName.value.one} with id: ${ids[sensorIdx]} - doesn't exists`
					});
				}, 200);
			}
			sensorLoading.value = false;
		});
};

const fetchOverlaySensor = (id) => {
	overlaySensorLoading.value = true;
	isOverlaySensorReady.value = false;
	fetchSensor({ itemId: id })
		.then(({ value }) => {
			rpmOverlaySensorData.value = value;
			isOverlaySensorReady.value = true;
		})
		.catch((error) => {
			console.warn(error);
		})
		.finally(() => {
			overlaySensorLoading.value = false;
		});
};

const toggleHistory = () => {
	showHistory.value = !showHistory.value;
};

const reloadChart = (chartId, settings = {}) => {
	const chartIds = chartId ? [chartId] : null;
	chartsListWrapperRefs.value.filter(Boolean).forEach((ref) => {
		ref.reloadChart?.(chartIds, settings);
	});
};

const callMethodInCharts = (settings) => {
	chartsListWrapperRefs.value.filter(Boolean).forEach((ref) => {
		ref.callMethodInAllCharts?.(settings);
	});
};

const getAllStatisticsData = (settings = {}) => {
	const { key, chart_ids } = settings;
	const allResultData = {};
	chartsListWrapperRefs.value.filter(Boolean).forEach((ref, idx) => {
		allResultData[idx] = ref.chartsListInstance?.getChartsStatistics?.({
			transformed: true,
			...settings,
		}) || [];
	});

	let result = key !== undefined ? allResultData[key] : allResultData;
	if (chart_ids && Array.isArray(result)) {
		result = result.filter((item) => chart_ids.includes(item.chart_id));
	}
	return result;
};

const handleChangeChartsListWrappersReadyCounter = ({ val, payload } = {}) => {
	chartsListWrappersReadyCount.value += val || 0;
	if (chartsListWrappersReadyCount.value === chartsListWrapperRefs.value.filter(Boolean).length) {
		handleAllChartsListWrappersReady(payload);
	}
};

const handleAllChartsListWrappersReady = (statisticsDataList = {}) => {
	if (isCompare.value) {
		const allResultData = getAllStatisticsData();
		const { maxStatisticsValueForAll } = findInStatistics(allResultData);
		chartsListWrapperRefs.value.filter(Boolean).forEach((ref) => {
			ref.chartsListInstance?.chartsInstancesList?.forEach((Chart) => {
				Chart.StatisticsTransformator.updateResultData({
					settingsList: [
						{
							accessor: 'chart_all_data_max_value',
							value: maxStatisticsValueForAll[Chart.chart_id],
						},
						{
							accessor: 'chart_points_max_value',
							value: maxStatisticsValueForAll[Chart.chart_id],
						},
					],
					additionalSettings: {
						callback: (resultData) => {
							Chart.assignDataToYAxis(resultData);
							Chart.emitChartOptionsReady();
						},
					},
				});
			});
		});
	} else {
		Object.values(statisticsDataList || {}).forEach((item) => {
			if (item.levelZoneData?.off_alarm_zone && !chartsWithOffAlarm.value.includes(item.chart_id)) {
				chartsWithOffAlarm.value.push(item.chart_id);
			}
		});
	}
};

const findInStatistics = (allResultData) => {
	const maxValues = {};
	Object.values(allResultData || {}).forEach((containerData) => {
		(containerData || []).forEach((chartResultData) => {
			const { chart_id, chart_all_data_max_value } = chartResultData;
			maxValues[chart_id] = maxValues[chart_id] || -9999999;
			if (chart_all_data_max_value > maxValues[chart_id]) {
				maxValues[chart_id] = chart_all_data_max_value;
			}
		});
	});
	return { maxStatisticsValueForAll: maxValues };
};

const handleChartsConfigsListReady = (configs = []) => {
	sensorParamsForSetupProblems.value = configs.flatMap((config) => config.requestsList || []);
};

const addNoteToChart = (data) => {
	pointData.value = setupPointData(data);
	chartMessageDialogInit.value = true;
	showNewMessage.value = true;
};

const setupPointData = ({ index, series } = {}) => {
	const data = series?.options?.data || [];
	const chartId = series?.chart?.userOptions?.chart_id;
	const point = data[index];
	if (!point) return null;

	if (point.id) {
		return {
			...point,
			graph_timestamp: localToUtcYmdHis(point.graph_timestamp),
			chartId,
		};
	}
	if (point[2]) {
		return {
			graph_timestamp: localToUtcYmdHis(point[2]),
			chartId,
			metric_type: series.userOptions?.customSettings?.metric_type,
		};
	}
	if (point.pointId) {
		return {
			metric_issue_alert_id: point.pointId,
			chartId,
			metric_type: series.chart?.options?.chart_parameter_id,
		};
	}
	return null;
};

const handleJoinCharts = (payload) => {
	const prop = typeof payload === 'string' ? payload : payload?.prop;
	splitNCDCharts.value = false;
	joinChartsBy.value = prop === joinChartsBy.value.prop ? { prop: '' } : { ...(payload || {}), prop };
};

const handleSplitNCDCharts = () => {
	splitNCDCharts.value = !splitNCDCharts.value;
	joinChartsBy.value = { prop: splitNCDCharts.value ? 'split' : null };
};

const handleSetupThresholds = ({ parameters, isOffAlarm } = {}) => {
	levelZoneSetupSettings.value = { isOffAlarm, parameters: parameters || [] };
	showZoneSetup.value = true;
};

const toggleOffAlarm = (enableOnParameters) => {
	if (enableOnParameters?.length) {
		const chartIds = enableOnParameters.map((paramId) => `chart-${paramId}`);
		const allResultData = getAllStatisticsData({
			key: 0,
			chart_ids: chartIds,
			statistics_result: 1,
			includeResources: 1,
		});

		const parameters = (allResultData || []).map((statisticsResult) => {
			const parameterItem = statisticsResult.resources?.chart_config?.requestsList?.[0];
			return {
				chart_id: statisticsResult.chart_id,
				parameterItem,
				levelZoneData: statisticsResult.levelZoneData,
				levelZones: statisticsResult.levelZones,
			};
		}).filter((item) => item.parameterItem);

		handleSetupThresholds({ isOffAlarm: true, parameters });
	} else if (chartsWithOffAlarm.value.length) {
		callMethodInCharts({
			ids: chartsWithOffAlarm.value,
			methodName: 'submitNewThresholdsAction',
			fromInstance: true,
			payload: {
				data: { off_alarm_zone: 0 },
			},
		});
	}
};

const closeLevelZoneSetup = () => {
	showZoneSetup.value = false;
	levelZoneSetupSettings.value = {};
};

const handleUnlockLube = ({ sensorId: lubeSensorId }) => {
	if (!lubeSensorId) return;
	sensorLoading.value = true;
	toggleUltrasoundCommand({
		url: `/ultrasound/commands/${lubeSensorId}/reset/cycle?resetLubeCycle=1`,
		resultMessage: { text: tt('phrases.lube_cycle_was_reset') },
	})
		.then(() => {
			initSensors();
		})
		.catch(() => {
			sensorLoading.value = false;
		});
};

const handleUnlockFFT = (payload) => {
	bannerFilterBlockRef.value?.handleUnlockFFT?.(payload);
};

const openFFTCharts = ({ payload, sensorType } = {}) => {
	const { id, sensor_id } = payload || {};
	if (!id || !sensor_id) return;
	const type = (sensorType?.isBannerTempVibe2 || sensorType?.isBannerV2_1 || sensorType?.isBannerM25)
		? 'banner'
		: 'ncd';
	window.open(`${window.location.origin}/${type}/${sensor_id}/fft/${id}`, '_blank');
};

const handleUnlockFFTSuccess = ({ fft_lock_item, sensorId: fftSensorId }) => {
	let { index } = findItemBy('id', fftSensorId, sensors.value, { returnIndex: true });
	index = index == null ? 0 : index;
	if (sensors.value[index]) {
		sensors.value[index].last_fft_lock = fft_lock_item;
		dropdownFilterbarUpdated.value += 1;
	}
};

const handleRedirectTo = (to) => {
	if (to) router.push(to);
};
const togglePreviewModal = (data) => {
	emit('event', {
		eventName: 'togglePreviewModal',
		data,
		onward: true,
	});
};

const { handleEvent } = useEventHandler({
	toggleV2_1View,
	toggleStatsThresholds,
	handleDaterange,
	toggleFilterbar,
	updateSensor,
	updateEquipment,
	togglePreviewModal,
	initSensors,
	toggleHistory,
	reloadChart,
	handleChangeChartsListWrappersReadyCounter,
	handleChartsConfigsListReady,
	addNoteToChart,
	handleJoinCharts,
	handleSplitNCDCharts,
	handleSetupThresholds,
	toggleOffAlarm,
	closeLevelZoneSetup,
	handleUnlockLube,
	handleUnlockFFT,
	openFFTCharts,
	handleUnlockFFTSuccess,
	handleRedirectTo,
}, null);

watch(overlaySensorId, (id) => {
	if (id) fetchOverlaySensor(id);
});

watch(sensorData, (data) => {
	if (!data?.controller) return;

	globalStore.setup_navbar(navbarSettings.value);
	const newMetric = data.controller.plant
		? data.controller.plant.metric_system_type
		: data.controller.metric_system_type;

	if (filters.value.measurement !== newMetric) {
		sensorsStore.set_statistics_filters({
			...filters.value,
			measurement: newMetric,
		});
	}

	if (data.is_hidden_ncd_active_vertical_axis && data.ncd_active_vertical_axis === 1) {
		activeAxis.value = 2;
	}
});

watch(
	() => route.fullPath,
	() => {
		setupPage();
	},
);

const setupPage = () => {
	chartsListWrapperRefs.value = [];
	chartsListWrappersReadyCount.value = 0;
	chartsWithOffAlarm.value = [];
	sensorParamsForSetupProblems.value = [];

	const queryCompareList = route.query.compare
		? `${route.query.compare}`.split(',').filter(Boolean)
		: [];
	splitNCDCharts.value = isCompare.value;
	currentSensorIds.value = isCompare.value
		? (queryCompareList.length ? queryCompareList : compareList.value)
		: [sensorId.value].filter(Boolean);
	initSensors();
};

onBeforeMount(() => {
	if (sensorsStore.prevent_drop_daterange) {
		sensorsStore.set_sensor_state({ stateProp: 'prevent_drop_daterange', value: false });
	}

	if (Highcharts && Lang.currentLangId === LANGUAGE_TYPES.SPANISH) {
		Highcharts.setOptions({
			lang: {
				months: Lang.translate(localeMonthsFull()),
				weekdays: Lang.translate(weekdays()),
				shortMonths: Lang.translate(localeMonths(true)),
			},
		});
	}
});

onMounted(() => {
	nextTick(setupPage);
});
</script>
