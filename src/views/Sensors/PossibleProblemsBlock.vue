<template>
	<div v-if="filteredProblemsList.length" class="possible-problems card section-row">
		<div class="card-content">
			<div class="content-container flex wrap">
				<div class="img-part mcol-xs-12 mcol-sm-5">
					<div v-if="currentSensor.equipment && currentSensor.equipment.equipmentType" class="imgWrapper">
						<img :src="background_img" class="background_img" alt="" />
						<img
							:class="[currentSensor.equipment.equipmentType.name, 'equipment_img']"
							:src="currentSensor.equipment.equipmentType.full_file_name"
							alt="equipment img"
						/>
						<div v-if="hasAxisProblems?.x.length" class="arrow x-axis">
							<i class="icomoon icon-arrow" />
						</div>
						<div v-if="hasAxisProblems?.z.length" class="arrow z-axis">
							<i class="icomoon icon-arrow" />
						</div>
						<div v-if="hasAxisProblems?.y.length" class="arrow y-axis">
							<i class="icomoon icon-arrow" />
						</div>
					</div>
				</div>

				<div class="info-part mcol-xs-12 mcol-sm-7">
					<div class="title uppercase bold">
						{{ tt('phrases.Possible_problems') }}
					</div>

					<div class="problems-list">
						<span
							v-for="(item, idx) in filteredProblemsList"
							:key="`problem-${item.id || idx * 5}-${idx}`"
							class="value"
						>
							{{ `${item.title}${idx !== filteredProblemsList.length - 1 ? ', ' : ''}` }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { Lang } from '@/localization';
import { background_img as backgroundImage } from '@/constants/global';
import { NCD_AXIS } from '@/modules/charts_factory/controllers/Sensor/enums';
import { findItemBy, prepareRangeParams, removeDuplicatesFromArray } from '@/helpers';
import { useSensors } from '@/composables/useSensors';

const { tt } = Lang;
const { fetchSensorProblems } = useSensors();

defineOptions({
	name: 'PossibleProblemsBlock',
});

const props = defineProps({
	currentSensor: { type: Object, required: true },
	sensorParamsForSetupProblems: { type: Array, default: () => [] },
	daterange: { type: Array, default: () => [] },
	isNCDSensor: Boolean,
});

const problemsList = ref([]);
const problemsLoading = ref(false);
const backgroundImg = backgroundImage;

const filteredProblemsList = computed(() => removeDuplicatesFromArray(problemsList.value, 'id'));
const background_img = computed(() => backgroundImg);
const hasAxisProblems = computed(() => {
	if (!filteredProblemsList.value.length) return null;

	const result = { x: [], y: [], z: [] };
	filteredProblemsList.value.forEach((problem) => {
		(problem.actual_sensor_parameter_types || []).forEach((parameterType) => {
			const paramItem = findItemBy('id', parameterType, props.sensorParamsForSetupProblems);
			if (!paramItem) return;

			if (props.isNCDSensor) {
				if (paramItem.axis_id === props.currentSensor.ncd_active_vertical_axis) {
					result.z.push(1);
				} else if (paramItem.axis_id === props.currentSensor.ncd_active_axial_axis) {
					result.x.push(1);
				} else {
					result.y.push(1);
				}
			} else if (paramItem.axis_id === NCD_AXIS.X) {
				result.x.push(1);
			} else if (paramItem.axis_id === NCD_AXIS.Z) {
				result.z.push(1);
			}
		});
	});

	return result;
});

const fetchProblems = ({ params, daterange }) => {
	if (!props.currentSensor.id) return Promise.resolve();
	problemsLoading.value = true;
	return fetchSensorProblems({
		sensorId: props.currentSensor.id,
		params: {
			parameters: params.map((item) => item.id),
			...prepareRangeParams(daterange),
		},
	})
		.then(({ value }) => {
			problemsList.value = value || [];
		})
		.finally(() => {
			problemsLoading.value = false;
		});
};

watch(
	() => props.sensorParamsForSetupProblems,
	(params) => {
		if (props.daterange.length && params.length) {
			fetchProblems({ params, daterange: props.daterange });
		}
	}
);

watch(
	() => props.daterange,
	(daterange) => {
		if (daterange.length && props.sensorParamsForSetupProblems.length) {
			fetchProblems({ params: props.sensorParamsForSetupProblems, daterange });
		}
	}
);
</script>
