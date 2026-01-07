<template>
	<div
		class="card block-item pdm-health_statistics-wrapper statistics-block vertical-fluid"
	>
		<router-link
			v-if="$hasAccessTo(['view_dashboard'])"
			:to="`/equipments/${healthData.id}/details`"
			class="absolute stretch link"
		/>

		<div class="card-header filled fluid">
			<el-tooltip class="" effect="dark" :content="machineName" placement="top">
				<div class="muted ellipsis">{{ machineName }}</div>
			</el-tooltip>
			<el-tooltip effect="dark" placement="bottom">
				<div slot="content">{{ technology.str }}</div>
				<div class="semi-bold ellipsis" v-html="technology.html"></div>
			</el-tooltip>
		</div>

		<div class="relative small-padding chart-height-auto filled_2">
			<div class="statistics-container filled_2">
				<CommonChartItemWrapper
					ref="CommonChartItemWrapper"
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
					<div class="semi-bold ">
						{{ $t('constants.alarm') }}
						<span class="alarm">{{ healthData.alarms_count }}</span>
					</div>
					<div class="semi-bold ">
						{{ $t('constants.warning') }}
						<span class="warning">{{ healthData.warnings_count }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { sensorTypeMixin } from '@/mixins';

export default {
	mixins: [sensorTypeMixin()],
	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		healthData: Object
	},

	computed: {
		currentSensorTypeDataKey: () => 'sensorsData',

		chartProps() {
			return Object.freeze({
				// nodataMock: true,
				disablePreloader: true
			});
		},

		sensorsData() {
			const { sensors } = this.healthData;

			if (sensors.length) {
				return sensors;
			}
			return null;
		},

		statisticsData() {
			if (Object.keys(this.healthData).length) {
				const { alarm_health, normal_health, warning_health } = this.healthData;
				let total = normal_health;

				return Object.freeze(
					this.$translate([
						{
							name: 'constants.normal',
							value: normal_health,
							color: '#009C67',
							total: total
						},
						{
							name: 'constants.warning',
							value: warning_health,
							color: '#FFA500',
							total: total
						},
						{
							name: 'constants.alarm',
							value: alarm_health,
							color: '#F30606',
							total: total
						}
					])
				);
			}

			return [];
		},

		machineName() {
			const { asset } = this.healthData;
			let result = '';

			if (asset) {
				if (asset.machine) {
					result += asset.machine.name;
				}
				// result.push(asset.name);
			}

			/*if (loc_on_machine) {
				result.push(loc_on_machine);
			}*/
			// const name = result.join(', ');

			return result || '-';
		},

		technology() {
			const { sensorsData } = this;
			// const { loc_on_machine } = this.sensorsData;

			if (sensorsData && sensorsData.length) {
				let html = '<div>',
					str = '';

				sensorsData.forEach(st => {
					const sensorType = this.getType(st);
					html += `<div>${sensorType.technology_abbr} (${st.location_in_equipment})</div>`;
					str += `${sensorType.technology_abbr} (${st.location_in_equipment}) `;
				});

				html += '</div>';

				return {
					html: html,
					str: str
				};
			}
			return {
				html: '-',
				str: '-'
			};
		}
	}
};
</script>
