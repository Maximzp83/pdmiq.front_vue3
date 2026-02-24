<template>
	<div class="mrow flex wrap big-padding">
		<div class="flex align-center mcol-xs-12">
			<div
				class="mcol-xs-3 mcol-sm-6 page-title outside-bg-addition semi-bold uppercase"
			>
				{{ $t('phrases.All_Statistics') }}
			</div>

			<div class="mcol-xs-9 mcol-sm-6 ml-auto text-right">
				<Datepicker
					class="ml-auto"
					setupDaterangeFilter
					enableShortcuts
					@input="
						range =>
							set_statistics_filters({
								...equipments_statistics_filters,
								daterange: range,
								daterange_setted_at: Date.now()
							})
					"
					:value="equipments_statistics_filters.daterange"
					type="daterange"
					clearingTo="last_7_days"
				/>
			</div>
		</div>

		<div class="mcol-xs-12 section-row fluid">
			<div class="card block-item mcol-xs-12 vertical-fluid">
				<div class="card-header filled_2 flex align-center">
					<div class="semi-bold uppercase">
						{{ $t('phrases.asset_health_score') }}
					</div>

					<div class="ml-auto legend-container flex align-center">
						<span class="pre-label semi-bold">{{ $t('phrases.time_in') }}:</span>
						<div class="legend-list">
							<div class="item">
								<span class="label alarm"></span>
								<span>{{ $t('constants.Alarm') }}</span>
							</div>
							<div class="item">
								<span class="label warning"></span>
								<span>{{ $t('constants.Warning') }}</span>
							</div>
							<div class="item">
								<span class="label good"></span>
								<span>{{ $t('constants.Good') }}</span>
								<!-- <span v-if="currentSensorType.isUltrasound || currentSensorType.isSDTsensor">Baseline</span> -->
							</div>
						</div>
					</div>
				</div>

				<div class="card-content relative">
					<SimpleSpinner :active="healthStatisticsLoading" />

					<div class="mrow flex wrap">
						<div
							class="mcol-xs-12 mcol-sm-3 mcol-md-20"
							v-for="item in healthStatistics"
							:key="`health-${item.id}`"
						>
							<HealthStatisticsCard :healthData="item" />
						</div>
					</div>

					<div
						v-if="!healthStatisticsLoading && !healthStatistics.length"
						class="text-center"
					>
						{{ tt('phrases.Has_not_Statistics_for_this_range') }}...
					</div>
				</div>
			</div>
		</div>

		<!-- <div class="mcol-xs-12 mcol-lg-6 relative">
			<ProblemsStatisticsContainer
				title="Alarms"
				setupProblemsStatisticsProp="alarms_count"
				setupProblemsTimeStatisticsProp="alarms_duration"
				:statisticsLoading="problemsStatisticsLoading"
				:statisticsData="problemsStatistics"
			/>
		</div>

		<div class="mcol-xs-12 mcol-lg-6 relative">
			<ProblemsStatisticsContainer
				title="Warnings"
				setupProblemsStatisticsProp="warnings_count"
				setupProblemsTimeStatisticsProp="warnings_duration"
				:statisticsLoading="problemsStatisticsLoading"
				:statisticsData="problemsStatistics"
			/>
		</div> -->

		<div class="mcol-xs-12 mcol-lg-6 chart-height-auto">
			<div class="flex column big-padding vertical-fluid">
				<div class="section-row">
					<ItemWOStatisticBlock roundedIcon :predefinedFilters="woFilters" />
				</div>

				<div class="section-row fluid">
					<div class="card block-item mcol-xs-12 vertical-fluid">
						<div class="card-header filled_2">
							<div class="title semi-bold">{{ $t('phrases.TO_DO') }}</div>
						</div>

						<div class="card-content relative">
							<SimpleSpinner :active="meetingTrackerLoading" />

							<div
								v-if="
									meetingTrackerLast && meetingTrackerLast.next_activities.length
								"
							>
								<NextActivityFormItem
									@onSave="handleSaveNextActivities"
									ref="NextActivityFormItem"
									v-for="item in meetingTrackerLast.next_activities"
									:key="`info-${item.id}`"
									:item-data="item"
									isToDo
									:sensorsList="sensorsList"
									:showJustInfo="$hasAccessTo(['edit_customer_success'])"
									:showDeleteButton="$hasAccessTo(['delete_customer_success'])"
									@onRemove="
										handleDeleteNextActivities({
											key: 'next_activities',
											id: item.id
										})
									"
								/>

								<!-- <InfoCell
									v-for="item in meetingTrackerLast.next_activities"
									:key="`info-${item.id}`"
									labelDisabled
									:settingItem="{	prop: 'description'}"
									:itemData="item"
								/> -->

								<!-- <div class="">
									<el-button
										@click="handleSaveNextActivities"
										type="primary"
										native-type="button"
										class="item-action-button"
									>
										<span class="uppercase">{{tt('SAVE')}}</span>
									</el-button>
								</div> -->
							</div>
							<div class="page-title bold gray-color outside-bg-addition" v-else>
								{{ $t('phrases.no_data') }}
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
						:equipments_statistics_filters="equipments_statistics_filters"
					/>
				</div>
			</div>
		</div>

		<div class="mcol-xs-12">
			<div class="card block-item mcol-xs-12">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">
						{{ $t('phrases.data_driven_recommended_actions') }}
					</div>
				</div>

				<div class="card-content relative">
					<SimpleSpinner :active="meetingTrackerLoading" />

					<div
						v-if="
							meetingTrackerLast && meetingTrackerLast.recommended_actions.length
						"
					>
						<NextActivityFormItem
							@onSave="handleSaveNextActivities"
							ref="ReccommendedActionsFormItem"
							v-for="item in meetingTrackerLast.recommended_actions"
							:key="`info-${item.id}`"
							:item-data="item"
							:showJustInfo="!$hasAccessTo(['edit_customer_success'])"
							:showDeleteButton="$hasAccessTo(['delete_customer_success'])"
							:sensorsList="sensorsList"
							@onDelete="
								handleDeleteNextActivities({
									key: 'recommended_actions',
									id: item.id
								})
							"
						/>
					</div>
					<div class="page-title bold gray-color outside-bg-addition" v-else>
						{{ $t('phrases.no_data') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);
import { mapActions } from 'vuex';
import {
	getDateRange,
	prepareRangeParams,
	cleanDateString,
	cloneDeep
} from '@/helpers';
// import { required /*number*/ } from '@/constants/validation';
import { MAINTENANCE_TYPES } from '@/constants/global';

import { fetchItemsHelper, subItemsListMixin, actionButtonsMixin } from '@/mixins';

export default {
	mixins: [fetchItemsHelper(), subItemsListMixin(), actionButtonsMixin()],
	// name: 'QuoteTab',
	components: {
		// ProblemsStatisticsContainer: () => import('./ProblemsStatisticsContainer.vue'),
		ItemWOStatisticBlock: () =>
			import('@/components/itemDetails/ItemWOStatisticBlock.vue'),

		ROIStatisticsContainer: () => import('./ROIStatisticsContainer.vue'),
		HealthStatisticsCard: () => import('./HealthStatisticsCard.vue'),
		// InfoCell: () => import('@/components/itemDetails/InfoItem.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		NextActivityFormItem: () => import('../MeetingTracker/NextActivityFormItem.vue')
	},

	props: {
		plantItem: Object,
		sensorsList: Array
	},

	data() {
		return {
			problemsStatisticsLoading: false,
			problemsStatistics: [],
			// alarmsStatistics: [],
			// warningsStatistics: [],
			// alarmsTimeStatistics: [],
			// warningsTimeStatistics: [],

			healthStatisticsLoading: false,
			healthStatistics: [],

			meetingTrackerLoading: false,
			meetingTrackerLast: null,

			formData: {
				next_activities: [],
				recommended_actions: []				
			},

		};
	},

	computed: {
		authUser() {
			return this.$store.state.auth.authUser;
		},

		isIndustrialMatrix() {
			return this.$store.state.auth.isIndustrialMatrix;
		},

		equipments_statistics_filters() {
			return this.$store.state.equipments.statistics_filters;
		},
		woDaterange: () => [
			'2023-01-01',
			getDateRange('today', { getDateString: true })[1]
		],
		predefinedFilters: that =>
			Object.freeze({
				plantId: that.plantItem.id,
				daterange: that.woDaterange
			}),
		woFilters: that =>
			Object.freeze({
				...that.predefinedFilters,
				type: MAINTENANCE_TYPES.WORK_ORDER
			}),

		subItemsSettings: () => Object.freeze([
			{ ref: 'NextActivityFormItem', targetProp: 'next_activities' },
			{ ref: 'ReccommendedActionsFormItem', targetProp: 'recommended_actions' }
		]),
		/*refsList: () => ['NextActivityFormItem'],
		refsOperationsSettings: () => ({
			submitActionName: 'submitNextActivities',
			dataAsArray: true,
			itemSubmitMethod: 'validateItemForm'
		})*/
	},

	methods: {
		...mapActions({
			fetch_machines_alarms: 'machines/fetch_machines_alarms',
			fetch_meeting_tracker_last: 'meeting_trackers/fetch_meeting_tracker_last',
			fetch_health_statistics: 'equipments/fetch_health_statistics',
			set_statistics_filters: 'equipments/set_statistics_filters',

			save_meeting_tracker: 'meeting_trackers/save_meeting_tracker'
		}),

		prepareFilters(filters) {
			let newFilters = { ...filters };

			if (filters.daterange && filters.daterange.length) {
				newFilters = {
					...newFilters,
					...prepareRangeParams(filters.daterange)
				};

				delete newFilters.daterange;
			}

			delete newFilters.items_active_grid_type;

			return newFilters;
		},

		fetchLastMeetingTracker() {
			this.doFetchAction(
				'fetch_meeting_tracker_last',
				'meetingTrackerLast',
				'meetingTrackerLoading',
				{ params: { plantId: this.plantItem.id } }
			);
		},

		fetchHealthStatistics() {
			const payload = {
				params: {
					plantId: this.plantItem.id,
					...this.prepareFilters(this.equipments_statistics_filters)
				}
			};

			this.doFetchAction(
				'fetch_health_statistics',
				'healthStatistics',
				'healthStatisticsLoading',
				payload
			);
		},

		fetchProblemsStatistics() {
			// console.log(filters)
			this.problemsStatisticsLoading = true;

			// let payload = { params: this.prepareFilters(filters) };
			let payload = { params: { plantId: this.plantItem.id } };

			/*if (payload) {
				console.log(payload)
				return
			}*/

			this.fetch_machines_alarms(payload)
				.then(({ value }) => {
					this.problemsStatistics = value;
					this.problemsStatisticsLoading = false;
				})
				.catch(() => {
					this.problemsStatisticsLoading = false;
				});
		},

		handleSaveNextActivities() {
			this.resetFormDataBySubItems(this.subItemsSettings);
			this.formData = {
				...this.formData,
				...this.collectDataFromSubItems(this.subItemsSettings)
			};

			this.submitNextActivities();
			// this.handleValidateRefsItems();
		},

		handleDeleteNextActivities({ key, id }) {
			const { tt } = this;
			this.confirmHelper({
				message: `${tt('phrases.Do_you_really_want_to')} ${tt(
					'phrases.delete_this_activity'
				)}?`
			})
				.then(() => {
					let newMeetingTrackerLast = cloneDeep(this.meetingTrackerLast);
					newMeetingTrackerLast[key] = newMeetingTrackerLast[key].filter(
						ai => ai.id !== id
					);
					this.meetingTrackerLast = newMeetingTrackerLast;

					setTimeout(() => {
						this.handleSaveNextActivities();
					}, 10);
				})
				.catch(() => {});
		},

		submitNextActivities() {
			const { meetingTrackerLast } = this;
			// let { injectToBody } = options;
			// injectToBody = injectToBody || {};

			let payload = {
				notNotify: true,
				data: {
					...meetingTrackerLast,
					next_activities: meetingTrackerLast.next_activities.map(ca => {
						if (!ca.users_name) delete ca.users_name;
						if (!ca.machine_id) delete ca.machine_id;
						return ca;
					}),
					recommended_actions: meetingTrackerLast.recommended_actions.map(ca => {
						if (!ca.users_name) delete ca.users_name;
						if (!ca.machine_id) delete ca.machine_id;
						return ca;
					}),
					progress_activities: meetingTrackerLast.progress_activities.map(ca => {
						if (!ca.users_name) delete ca.users_name;
						if (!ca.machine_id) delete ca.machine_id;
						return ca;
					}),
					customer_feedback: meetingTrackerLast.customer_feedback.map(ca => {
						if (!ca.users_name) delete ca.users_name;
						if (!ca.machine_id) delete ca.machine_id;
						return ca;
					}),
					expansion_plans: meetingTrackerLast.expansion_plans.map(ca => {
						if (!ca.users_name) delete ca.users_name;
						if (!ca.machine_id) delete ca.machine_id;
						return ca;
					}),
					current_activities: meetingTrackerLast.current_activities.map(ca => {
						if (!ca.users_name) delete ca.users_name;
						if (!ca.machine_id) delete ca.machine_id;
						return ca;
					}),
					recurring_issues: meetingTrackerLast.recurring_issues.map(ca => {
						if (!ca.users_name) delete ca.users_name;
						if (!ca.machine_id) delete ca.machine_id;
						return ca;
					}),
					current_created_at: cleanDateString(meetingTrackerLast.current_created_at),
					last_tracker_created_at: cleanDateString(
						meetingTrackerLast.last_tracker_created_at
					),
					...this.formData
				}
			};

			if (payload) {
				console.log(payload)
				return
			}

			this.meetingTrackerLoading = true;

			this.save_meeting_tracker(payload)
				.then(() => {
					this.meetingTrackerLoading = false;
				})
				.catch(() => {
					this.meetingTrackerLoading = false;
				});

			// console.log(payload)
		}
	},

	watch: {
		equipments_statistics_filters() {
			this.fetchHealthStatistics();
		}
	},

	beforeMount() {
		// if (this.isAdminUser) {

		this.fetchLastMeetingTracker();
		// this.fetchProblemsStatistics();
		this.fetchHealthStatistics();
	}
};
</script>
