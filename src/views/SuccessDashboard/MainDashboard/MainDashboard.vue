<template>
	<div class="mrow flex wrap big-padding">
		<div class="flex align-center mcol-xs-12">
			<div class="mcol-xs-3 mcol-sm-6 page-title outside-bg-addition semi-bold uppercase">
				{{ tt('phrases.All_Statistics') }}
			</div>

			<div class="mcol-xs-9 mcol-sm-6 ml-auto text-right">
				<Datepicker
					class="ml-auto"
					setupDaterangeFilter
					:pickerOptions="datepickerOptions"
					:value="statisticsFilters.daterange"
					type="daterange"
					clearingTo="last_7_days"
					@input="(range) => statisticsFilters = { ...statisticsFilters, daterange: range }"
				/>
			</div>
		</div>

		<div class="mcol-xs-12 section-row fluid">
			<div class="card block-item mcol-xs-12 vertical-fluid">
				<div class="card-header filled_2 flex align-center">
					<div class="semi-bold uppercase">{{ tt('phrases.asset_health_score') }}</div>
					<div class="ml-auto legend-container flex align-center">
						<span class="pre-label semi-bold">{{ tt('phrases.time_in') }}:</span>
						<div class="legend-list">
							<div class="item"><span class="label alarm"></span><span>{{ tt('constants.Alarm') }}</span></div>
							<div class="item"><span class="label warning"></span><span>{{ tt('constants.Warning') }}</span></div>
							<div class="item"><span class="label good"></span><span>{{ tt('constants.Good') }}</span></div>
						</div>
					</div>
				</div>

				<div class="card-content relative">
					<SimpleSpinner :active="healthStatisticsLoading" />
					<div class="mrow flex wrap">
						<div
							v-for="item in healthStatistics"
							:key="`health-${item.id}`"
							class="mcol-xs-12 mcol-sm-3 mcol-md-20"
						>
							<HealthStatisticsCard :healthData="item" />
						</div>
					</div>
					<div v-if="!healthStatisticsLoading && !healthStatistics.length" class="text-center">
						{{ tt('phrases.Has_not_Statistics_for_this_range') }}...
					</div>
				</div>
			</div>
		</div>

		<div class="mcol-xs-12 mcol-lg-6 chart-height-auto">
			<div class="flex column big-padding vertical-fluid">
				<div class="section-row">
					<ItemWOStatisticBlock roundedIcon :predefinedFilters="woFilters" />
				</div>

				<div class="section-row fluid">
					<div class="card block-item mcol-xs-12 vertical-fluid">
						<div class="card-header filled_2">
							<div class="title semi-bold">{{ tt('phrases.TO_DO') }}</div>
						</div>
						<div class="card-content relative">
							<SimpleSpinner :active="meetingTrackerLoading" />
							<div v-if="meetingTrackerLast?.next_activities?.length">
								<NextActivityFormItem
									v-for="item in meetingTrackerLast.next_activities"
									:key="`info-${item.id}`"
									:item-data="item"
									isToDo
									:sensorsList="sensorsList"
									:showJustInfo="true"
									:showDeleteButton="false"
								/>
							</div>
							<div v-else class="page-title bold gray-color outside-bg-addition">
								{{ tt('phrases.no_data') }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="mcol-xs-12 mcol-lg-6 roi-charts-wrapper">
			<div class="mrow flex column big-padding equalize-cards-height-20">
				<div class="mcol-xs-12 fluid">
					<ROIStatisticsContainer
						:plantItem="plantItem"
						:predefinedFilters="predefinedFilters"
						:equipments_statistics_filters="statisticsFilters"
						:prorateBillingCost="!!plantItem?.id"
					/>
				</div>
			</div>
		</div>

		<div class="mcol-xs-12">
			<div class="card block-item mcol-xs-12">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('phrases.data_driven_recommended_actions') }}</div>
				</div>
				<div class="card-content relative">
					<SimpleSpinner :active="meetingTrackerLoading" />
					<div v-if="meetingTrackerLast?.recommended_actions?.length">
						<NextActivityFormItem
							v-for="item in meetingTrackerLast.recommended_actions"
							:key="`recommended-${item.id}`"
							:item-data="item"
							:sensorsList="sensorsList"
							:showJustInfo="true"
							:showDeleteButton="false"
						/>
					</div>
					<div v-else class="page-title bold gray-color outside-bg-addition">
						{{ tt('phrases.no_data') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { getDateRange, prepareRangeParams } from '@/helpers';
import { datePickerAllTimeShortcut, datePickerCorporateShortcuts } from '@/constants/date_time';
import { MAINTENANCE_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useSuccessDashboard } from '@/composables/useSuccessDashboard';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import ItemWOStatisticBlock from '@/components/itemDetails/ItemWOStatisticBlock.vue';
import HealthStatisticsCard from './HealthStatisticsCard.vue';
import ROIStatisticsContainer from './ROIStatisticsContainer.vue';
import NextActivityFormItem from '../MeetingTracker/NextActivityFormItem.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccesMainDashboard' });

const props = defineProps({
	plantItem: { type: Object, default: () => ({}) },
	sensorsList: { type: Array, default: () => [] },
});

const { fetchLastMeetingTracker, fetchHealthStatistics } = useSuccessDashboard();
const statisticsFilters = ref({
	daterange: getDateRange('last_7_days', { getDateString: true }),
});
const healthStatisticsLoading = ref(false);
const healthStatistics = ref([]);
const meetingTrackerLoading = ref(false);
const meetingTrackerLast = ref(null);
const woDaterange = computed(() => ['2023-01-01', getDateRange('today', { getDateString: true })[1]]);
// "All Time" starts when this plant joined, matching the corporate dashboard.
const plantJoinedDate = computed(() => {
	const date = props.plantItem?.joined_at && new Date(props.plantItem.joined_at);
	return date instanceof Date && !isNaN(date.getTime()) ? date : null;
});
const datepickerOptions = computed(() => ({
	shortcuts: [
		...datePickerCorporateShortcuts(plantJoinedDate.value),
		...(plantJoinedDate.value ? [datePickerAllTimeShortcut(plantJoinedDate.value)] : []),
	],
}));
const predefinedFilters = computed(() =>
	Object.freeze({
		plantId: props.plantItem?.id,
		daterange: woDaterange.value,
	}),
);
const woFilters = computed(() =>
	Object.freeze({
		...predefinedFilters.value,
		type: MAINTENANCE_TYPES.WORK_ORDER,
	}),
);

const prepareFilters = (filters) => {
	let newFilters = { ...filters };
	if (newFilters.daterange?.length) {
		newFilters = { ...newFilters, ...prepareRangeParams(newFilters.daterange) };
		delete newFilters.daterange;
	}
	delete newFilters.items_active_grid_type;
	return newFilters;
};
const loadMeetingTracker = async () => {
	if (!props.plantItem?.id) return;
	meetingTrackerLoading.value = true;
	try {
		const { value } = await fetchLastMeetingTracker({ plantId: props.plantItem.id });
		meetingTrackerLast.value = value;
	} finally {
		meetingTrackerLoading.value = false;
	}
};
const loadHealthStatistics = async () => {
	if (!props.plantItem?.id) return;
	healthStatisticsLoading.value = true;
	try {
		const { value } = await fetchHealthStatistics({
			plantId: props.plantItem.id,
			...prepareFilters(statisticsFilters.value),
		});
		healthStatistics.value = value || [];
	} finally {
		healthStatisticsLoading.value = false;
	}
};

watch(statisticsFilters, loadHealthStatistics, { deep: true });

onBeforeMount(() => {
	loadMeetingTracker();
	loadHealthStatistics();
});
</script>
