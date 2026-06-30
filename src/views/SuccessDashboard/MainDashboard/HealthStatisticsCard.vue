<template>
	<div class="card block-item pdm-health_statistics-wrapper statistics-block vertical-fluid">
		<router-link
			v-if="authStore.hasAccessTo(['view_dashboard'])"
			:to="`/equipments/${healthData.id}/details`"
			class="absolute stretch link"
		/>

		<div class="card-header filled fluid">
			<el-tooltip effect="dark" :content="machineName" placement="top">
				<div class="muted ellipsis">{{ machineName }}</div>
			</el-tooltip>
			<el-tooltip effect="dark" placement="bottom">
				<template #content>{{ technology.str }}</template>
				<div class="semi-bold ellipsis" v-html="technology.html"></div>
			</el-tooltip>
		</div>

		<div class="relative small-padding chart-height-auto filled_2">
			<div class="statistics-container filled_2">
				<CommonChartItemWrapper
					chartFactoryContainerName="MaintenanceChartFactoryContainer"
					chartFactoryName="HealthCardChart"
					configsKey="maintenanceChartListsConfig"
					chartKey="main"
					:rootStatisticsData="statisticsData"
					:additionalProps="chartProps"
				/>
			</div>

			<div class="alarms-count-block card mt-auto">
				<div class="card-content">
					<div class="semi-bold">
						{{ tt('constants.alarm') }}
						<span class="alarm">{{ healthData.alarms_count }}</span>
					</div>
					<div class="semi-bold">
						{{ tt('constants.warning') }}
						<span class="warning">{{ healthData.warnings_count }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useSensorType } from '@/composables/mixins/useSensorType';

import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

defineOptions({ name: 'SuccessDashboardHealthStatisticsCard' });

const props = defineProps({
	healthData: { type: Object, default: () => ({}) },
});

const authStore = useAuthStore();
const { tt, translate } = Lang;
const { getType } = useSensorType();

const chartProps = computed(() =>
	Object.freeze({
		disablePreloader: true,
	}),
);
const sensorsData = computed(() => {
	const sensors = props.healthData?.sensors || [];
	return sensors.length ? sensors : null;
});
const statisticsData = computed(() => {
	if (!Object.keys(props.healthData || {}).length) return [];

	const { alarm_health, normal_health, warning_health } = props.healthData;
	const total = normal_health;

	return Object.freeze(
		translate([
			{
				name: 'constants.normal',
				value: normal_health,
				color: '#009C67',
				total,
			},
			{
				name: 'constants.warning',
				value: warning_health,
				color: '#FFA500',
				total,
			},
			{
				name: 'constants.alarm',
				value: alarm_health,
				color: '#F30606',
				total,
			},
		]),
	);
});
const machineName = computed(() => {
	const { asset } = props.healthData || {};
	let result = '';

	if (asset?.machine) {
		result += asset.machine.name;
	}

	return result || '-';
});
const technology = computed(() => {
	if (sensorsData.value?.length) {
		let html = '<div>';
		let str = '';

		sensorsData.value.forEach((sensor) => {
			const sensorType = getType(sensor);
			const technologyAbbr = sensorType.technology_abbr || '-';
			const location = sensor.location_in_equipment || '-';
			html += `<div>${technologyAbbr} (${location})</div>`;
			str += `${technologyAbbr} (${location}) `;
		});

		html += '</div>';

		return {
			html,
			str,
		};
	}

	return {
		html: '-',
		str: '-',
	};
});
</script>
