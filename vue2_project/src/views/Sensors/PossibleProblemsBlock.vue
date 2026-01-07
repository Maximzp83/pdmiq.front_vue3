<template>
	<div class="possible-problems card section-row" v-if="filteredProblemsList.length">
		<div class="card-content">
			<div class="content-container flex wrap">
				<div class="img-part mcol-xs-12 mcol-sm-5">
					<div
						class="imgWrapper"
						v-if="currentSensor.equipment && currentSensor.equipment.equipmentType"
					>
						<img :src="background_img" class="background_img" alt="" />
						<img
							:class="[currentSensor.equipment.equipmentType.name, 'equipment_img']"
							:src="currentSensor.equipment.equipmentType.full_file_name"
							alt="equipment img"
						/>
						<div
							class="arrow x-axis"
							v-if="has_axis_problems && has_axis_problems.x.length"
						>
							<i class="icomoon icon-arrow" />
						</div>
						<div
							class="arrow z-axis"
							v-if="has_axis_problems && has_axis_problems.z.length"
						>
							<i class="icomoon icon-arrow" />
						</div>
						<div
							class="arrow y-axis"
							v-if="has_axis_problems && has_axis_problems.y.length"
						>
							<i class="icomoon icon-arrow" />
						</div>
					</div>
				</div>

				<div class="info-part mcol-xs-12 mcol-sm-7">
					<div class="title uppercase bold">
						{{ tt('phrases.Possible_problems') }}
					</div>
					<!-- <div class="" v-if="filteredProblemsList.length"> -->

					<!-- <h4 class="mcol-xs-2 group-title">X-axis:</h4> -->
					<div class="problems-list" v-if="filteredProblemsList.length">
						<span
							class="value"
							v-for="(item, idx) in filteredProblemsList"
							:key="`problem-${item.id || idx * 5}-${idx}`"
						>
							{{
								`${item.title}${idx != filteredProblemsList.length - 1 ? ', ' : ''}`
							}}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { alertRulesList, background_img } from '@/constants/global';
import { NCD_AXIS } from '@/modules/charts_factory/controllers/Sensor/enums';

// import isEmpty from 'lodash/isEmpty';
import {
	prepareRangeParams,
	findItemBy,
	removeDuplicatesFromArray
} from '@/helpers';
import { fetchItemsHelper } from '@/mixins';

export default {
	mixins: [fetchItemsHelper()],
	props: {
		currentSensor: { type: Object, required: true },
		sensorParamsForSetupProblems: {
			type: Array,
			default: () => []
		},
		daterange: { type: Array, default: () => [] },
		isNCDSensor: Boolean
	},

	data: () => ({
		problemsList: [],
		problemsLoading: false
	}),

	computed: {
		alertRulesList: that => that.$translate(alertRulesList()),

		background_img: () => background_img,

		has_axis_problems() {
			const {
				filteredProblemsList,
				sensorParamsForSetupProblems,
				isNCDSensor,
				currentSensor
			} = this;
			if (filteredProblemsList.length) {
				let result = {
					x: [],
					y: [], // H for NCD
					z: []
				};
				// console.log(filteredProblemsList)
				filteredProblemsList.forEach(problem => {
					problem.actual_sensor_parameter_types.forEach(pt => {
						const paramItem = findItemBy('id', pt, sensorParamsForSetupProblems);
						if (paramItem) {
							if (isNCDSensor) {
								const {
									ncd_active_axial_axis,
									ncd_active_vertical_axis
								} = currentSensor;

								if (paramItem.axis_id === ncd_active_vertical_axis) {
									result.z.push(1);
								} else if (paramItem.axis_id === ncd_active_axial_axis) {
									result.x.push(1);
								} else {
									// console.log('1')
									result.y.push(1);
								}
							} else {
								if (paramItem.axis_id === NCD_AXIS.X) {
									result.x.push(1);
								} else if (paramItem.axis_id === NCD_AXIS.Z) {
									result.z.push(1);
								}
							}
						}
					});
				});

				return result;
			}

			return null;
		},

		filteredProblemsList() {
			return removeDuplicatesFromArray(this.problemsList, 'id');
		}
	},

	methods: {
		...mapActions({
			fetch_sensor_problems: 'sensors/fetch_sensor_problems'
		}),

		fetchProblems({ params, daterange }) {
			this.doFetchAction(
				'fetch_sensor_problems',
				'problemsList',
				'problemsLoading',
				{
					sensorId: this.currentSensor.id,
					params: {
						parameters: params.map(pi => pi.id),
						...prepareRangeParams(daterange)
					}
				}
			);
		}
	},

	watch: {
		sensorParamsForSetupProblems(params) {
			if (this.daterange.length && params.length) {
				this.fetchProblems({ params, daterange: this.daterange });
			}
		},

		daterange(daterange) {
			if (daterange.length && this.sensorParamsForSetupProblems.length) {
				this.fetchProblems({ params: this.sensorParamsForSetupProblems, daterange });
			}
		}
	}
};
</script>
