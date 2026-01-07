<template>
	<div class="dialog-content-container">
		<div class="section-row" v-if="isBanner">
			<ul class="section-row errors-counters-list">
				<li
					v-for="item in finalCountersList"
					:key="`counter-${item.id}`"
					:class="item.className || ''"
				>
					{{ item.value }}
				</li>
			</ul>

			<div class="section-row">
				<div class="article-title bold">{{ tt('Faults') }}:</div>

				<div>
					<span
						v-for="(problem, idx) in possibleProblems"
						:key="`problem-${problem.id || idx}`"
					>
						{{ problem.title }}{{ idx == possibleProblems.length - 1 ? '' : ', ' }}
					</span>
				</div>
			</div>
		</div>

		<div class="section-row ultrasound-info-list" v-else-if="isUltrasound">
			<div class="info-row">
				<span class="label">{{ tt('Lube_Cycles') }}:</span>
				<span>
					auto
					<b
						:class="[{ black: !!sensorDataLubes.autoProcessCount }]"
						v-text="sensorDataLubes.autoProcessCount"
					/>
				</span>
				<span>
					manual
					<b
						:class="[{ black: !!sensorDataLubes.manualProcessCount }]"
						v-text="sensorDataLubes.manualProcessCount"
					/>
				</span>
			</div>

			<div class="info-row section-row">
				<span class="label capitalize">{{ tt('phrases.autolube_alarm') }}: </span>
				<b
					:class="[{ black: !!sensorDataLubes.alarmsCount }]"
					v-text="sensorDataLubes.alarmsCount"
				/>
			</div>

			<div class="section-row">
				<div class="info-row big">
					<span class="label capitalize">{{ tt('constants.alarm') }}: </span>
					<b
						:class="[{ alarm: !!sensorData.alarm_crashes_count }]"
						v-text="sensorData.alarm_crashes_count"
					/>
				</div>

				<div class="info-row big">
					<span class="label capitalize">{{ tt('phrases.critical_alarm') }}: </span>
					<b
						:class="[{ alarm: !!sensorData.critical_alarm_crashes_count }]"
						v-text="sensorData.critical_alarm_crashes_count"
					/>
				</div>

				<div class="info-row big">
					<span class="label capitalize"
						>{{ tt('phrases.custom_level_alarm') }}:
					</span>
					<b
						:class="[{ alarm: !!sensorData.custom_crashes_count }]"
						v-text="sensorData.custom_crashes_count"
					/>
				</div>
			</div>

			<div class="info-row section-row">
				<span class="label capitalize">{{ tt('phrases.Issues_Detected') }}: </span>
				<b
					:class="[{ warning: !!issuesDetectedCount }]"
					v-text="issuesDetectedCount"
				/>
			</div>

			<div class="info-row">
				<span class="label capitalize">{{ tt('phrases.Issues_Resolved') }}: </span>
				<b
					:class="[{ black: !!sensorDataLubes.successCyclesCount }]"
					v-text="sensorDataLubes.successCyclesCount"
				/>
			</div>

			<div class="info-row">
				<span class="label capitalize"
					>{{ tt('phrases.unsuccessful_autolube') }}:
				</span>
				<b
					:class="[{ black: !!sensorDataLubes.failuresCyclesCount }]"
					v-text="sensorDataLubes.failuresCyclesCount"
				/>
			</div>
		</div>

		<div class="section-row">
			<router-link
				:to="`/sensors/${sensorData.id}/statistics`"
				class="el-button el-button--primary link-button inverted"
			>
				<span class="capitalize">{{ tt('phrases.View_Graph') }}</span>
			</router-link>
		</div>
	</div>
</template>

<script>
// import { equipmentCardTitle } from '@/helpers/specialHelpers';
import { SENSOR_TYPES } from '@/constants/global';

export default {
	props: {
		data: { type: Object, required: true }
		// operationsSettings: {type: Object, default: () => ({})},
	},

	computed: {
		sensorData: that => that.data.sensorData,
		sensorDataLubes: that => that.sensorData.lubes,

		finalCountersList: that => that.data.finalCountersList,

		isBanner() {
			return this.sensorData.type === SENSOR_TYPES.BANNER;
		},
		isUltrasound() {
			return this.sensorData.type === SENSOR_TYPES.ULTRA_SOUND;
		},

		possibleProblems() {
			return this.sensorData.possibleProblems || [];
		},

		issuesDetectedCount() {
			const { sensorDataLubes } = this;

			if (sensorDataLubes) {
				return (
					sensorDataLubes.successCyclesCount + sensorDataLubes.failuresCyclesCount
				);
			}

			return '';
		}
	},

	methods: {}
};
</script>
