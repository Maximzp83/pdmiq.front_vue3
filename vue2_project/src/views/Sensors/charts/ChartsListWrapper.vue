<template>
	<div class="">
		<!-- <button @click="statistics_socketCallback(statisticsMockData)">update</button> -->
		<!-- <button @click="statistics_socketCallback(lubeStatisticsMockData)">update lube</button> -->
		<!-- <button @click="statistics_socketCallback(ajustementsStatisticsMockData)">update ajustement</button> -->

		<div class="charts-data-container">
			<!-- <div class="chart-container-wrapper"
				v-if="linespeedOverlaySensorData && !chartsListWrapperReady"
			>
				<div class="card">
					<VueElementLoadingWrapper
						:isLoading="overlayChartsListWrapperLoading"
						:itemsName="tt('chart')"
					/>
				</div>
			</div> -->

			<ChartsPreloader
				:showMock="
					!chartsListWrapperLoading && chartsListWrapperReady && !hasStatistics
				"
				:showPreloader="
					chartsListWrapperReady &&
						(chartsListWrapperLoading || overlayChartsListWrapperLoading) &&
						!hasStatistics
				"
			/>

			<div
				:class="['charts-list']"
				v-show="!(chartsListWrapperReady && !hasStatistics)"
			>
				<div
					:class="['chart-container-wrapper content-row']"
					v-for="(chart, idx) in chartsList"
					:key="`chart-${chart.chart_id}_idx-${idx}`"
				>
					<ChartItemContainer
						:key="updateChartsList"
						:ref="`chart_item-${chart.chart_id}`"
						@event="handleEventNew"
						:ChartInstance="chart"
						:rootFilters="rootFilters"
						:sensorData="sensorData"
						:additionalProps="additionalProps"
						:currentSensorType="currentSensorType"
						:forceLoading="overlayChartsListWrapperLoading"
						:chartsListWrapperReadyCounter="chartsListWrapperReadyCounter"
						:oneChartOnly="oneChartOnly"
					/>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="editThresholdsByStagesEnabled"
			append-to-body
			center
			class="small dialog-decorate-header thresholds-update-dialog"
			:title="tt('phrases.Unsaved_Thresholds')"
			:visible.sync="unsavedThresholdsDialogOpen"
		>
			<UpdateThresholdsDialog
				@event="handleEventNew"
				@onClose="updateThresholdsDialogOpen = false"
				:redirectTo="redirectTo"
			/>
		</el-dialog>
	</div>
</template>

<script>
import { isTodayRange, getValues } from '@/helpers';
// import { DXM_COMMANDS_REQUEST_STATUSES } from '@/constants/global';

import { mapActions } from 'vuex';
import { executeChartsListFactory } from '@/modules/charts_factory/index.js';
// import { WebSocketService } from '@/services/WebSocketService.js';

import { eventHandler, sensorTypeMixin, navigation, webSocketMixin } from '@/mixins';

export default {
	mixins: [eventHandler(), sensorTypeMixin(), navigation(), webSocketMixin()],
	components: {
		ChartsPreloader: () => import('@/components/charts/ChartsPreloader.vue'),
		ChartItemContainer: () => import('./ChartItemContainer.vue'),
		UpdateThresholdsDialog: () => import('./UpdateThresholdsDialog.vue')
	},
	props: {
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		sensorData: { type: Object, required: true },
		linespeedOverlaySensorData: { type: Object, default: null },
		rpmOverlayData: { type: Object, default: null },
		// loadingQueue: null,
		joinChartsBy: { type: Object, default: () => ({}) },
		additionalProps: { type: Object, default: () => ({}) },
		injectToChartOptions: { type: Object, default: () => ({}) },
		activeAxis: null,
		enableAxisSelector: Boolean,
		getParamsByIds: null,
		oneChartOnly: Boolean,
		chartsContainerIdx: Number,
		additionalChartPayload: { type: Object, default: () => ({}) },
	},

	data() {
		return {
			hasStatistics: false,
			overlayChartshasStatistics: false,

			chartsListWrapperReady: false,
			chartsListWrapperReadyCounter: 0,
			chartsListWrapperLoading: false,
			overlayChartsListWrapperLoading: false,

			updateChartsList: 0,
			chartsListInstancesInitialBuild: true,
			// chartsWrapperReadyCount: 0,
			// ---------------
			unsavedThresholdsDialogOpen: false,
			isRedirected: false,

			statistics_socket: null,
			statistics_socket_ready: false,

			dxm_socket: null,
			dxm_socket_ready: false,
			lubeShotDataFromSocket: {},

			lineSpeedOverlaySensorLoading: false
		};
	},

	computed: {
		y_filters: that => that.$store.state.sensors.charts_filters,
		redirectTo: that => that.$store.state.global.redirectTo,

		socketChannel() {
			const { sensorData } = this;

			if (sensorData) {
				return `sensor.${sensorData.uuid}`;
			}
			return null;
		},

		socketChannelDXM() {
			const { authUser } = this;

			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		},

		chartsListInstanceEventsList() {
			let events = {
				chartsListWrapperReady: hasStatistics => {
					this.hasStatistics = hasStatistics;
					this.chartsListWrapperReady = true;
					this.chartsListWrapperReadyCounter++;
				},
				chartsListWrapperLoading: val => {
					this.chartsListWrapperLoading = val;
				},
			};

			if (!this.oneChartOnly) {
				events.changeChartsListWrappersReadyCounter = (val, payload) =>
					this.handleChangeChartsListWrappersReadyCounter(val, payload);
			}
			// console.log('2',events)
			return Object.freeze(events);
		},

		overlayChartInstanceEventsList() {
			return Object.freeze({
				isLoading: value => (this.overlayChartsListWrapperLoading = value)
			});
		},

		OverlayChartsListInstance() {
			const { linespeedOverlaySensorData, sensorData, rpmOverlayData } = this;
			const {
				isNCDTempVibe,
				isNCDTempVibeCurr,
				isNCDWiredTempVibe,
				isNCDSDT,
				isNCDCustom_4_20,
				isBanner, isBannerTempVibe2,
				isBannerV2Generic, isBannerV2_1
			} = this.currentSensorType;

			const isValidNCD = isNCDTempVibe || isNCDTempVibeCurr ||
						isNCDWiredTempVibe || isNCDSDT || isNCDCustom_4_20;
			const isValidBanner =	
						isBanner || isBannerTempVibe2 || isBannerV2Generic || isBannerV2_1;
			
			// console.log('OverlayChartsListInstance', linespeedOverlaySensorData, rpmOverlayData)

			if (
					(linespeedOverlaySensorData && linespeedOverlaySensorData.id !== sensorData.id)
					|| (rpmOverlayData && rpmOverlayData.isMaxPeakFrequency)
			) {
				const sensorType = this.getType(linespeedOverlaySensorData);
				const chartSettingsKey = this.getChartSettingsKey(
					linespeedOverlaySensorData,
					sensorType
				);
				let next = (linespeedOverlaySensorData.is_linespeed_node && isValidNCD) || isValidBanner;

				var getParamsByIds;

				if (rpmOverlayData) {
					if (!rpmOverlayData.is_rpm_visible) return null;
					if (rpmOverlayData.rpm_request) {
						getParamsByIds = [rpmOverlayData.rpm_request.parameter];						
					}
				}

				if (next) {

					return executeChartsListFactory('sensorChartsListFactory', {
						settings: {
							events: {
								chartsListWrapperReady: hasStatistics => {
									this.handleOverlayChartWrapperReady({ hasStatistics });
								}
							},
							chartFactoryName: 'SensorOverlayChart',
							returnChartConfigByIdx: 0,
							setupChartsConfigsListSettings: {
								configsKey: 'sensorChartsListsConfig',
								chartKey: chartSettingsKey,
								getParamsByIds,
								returnChartConfigByIdxIfEmptyAfterFiltration: 0,
							}
						},
						payload_1: {
							sensorType: chartSettingsKey,
							sensorItem: linespeedOverlaySensorData,
							currentSensorType: sensorType,
							rpmOverlayRequest: rpmOverlayData && rpmOverlayData.rpm_request,
							isMaxPeakFrequency: rpmOverlayData && rpmOverlayData.isMaxPeakFrequency,
						}
					});
				}
			}

			return null;
		},

		/*buildOverlayChartSettings() {
			if (this.OverlayChartsListInstance) {			
				return Object.freeze({
					events: {
						chartOptionsInitiated: options =>
							this.handleOverlayChartOptionsInitiated(options)
					}
				});
			}
			return null;
		},*/

		ChartsListInstance() {
			// console.log('ChartsListInstance')
			// this.handleChartsListInstanceReady(Instance);
			const { injectToChartOptions } = this;

			return executeChartsListFactory('sensorChartsListFactory', {
				//1 level payload
				settings: {
					events: this.chartsListInstanceEventsList,
					settings_payload: {
						chartDataReadySettings: {
							useFirstStatisticsItemForAll: true
						},
						// inject_options: { chart: { animation: true} }
						inject_options: injectToChartOptions
						// disableNavigator: true
					},
					setupChartsConfigsListSettings: {
						// filterParamsBy: { prop: 'axis_id', value: this.activeAxis },
						// getParamsByIds: this.getParamsByIds,
					},
				},
				payload_1: {
					sensorType: this.currentChartSettingsKey,
					sensorItem: this.sensorData,
					currentSensorType: this.currentSensorType,
					// confirm: this.$confirm,
					enableAxisSelector: this.enableAxisSelector,
					editThresholdsByStagesEnabled: this.editThresholdsByStagesEnabled,
					oneChartOnly: this.oneChartOnly,
					// rpmOverlayValue: this.rpmOverlayData && this.rpmOverlayData.rpm_value,
					// setValue: ['chartTitle', 'title from payload 1'],
				}
			});
		},

		buildChartsSettings() {
			// console.log('buildChartsSettings')
			const {
				enableAxisSelector,
				activeAxis,
				joinChartsBy,
				getParamsByIds,
				oneChartOnly,
				currentChartSettingsKey
			} = this;
			// console.log('metric', this.metric)
			let settings = {
				chartFactoryName: 'SensorChart',
				// chart_instance_name: 'SensorChart',
				setupChartsConfigsListSettings: {
					configsKey: 'sensorChartsListsConfig',
					chartKey: currentChartSettingsKey,
					joinChartsBy,
					getParamsByIds,
					filterParamsBy: []
				}
			};

			if (oneChartOnly) {
				if (getParamsByIds.length > 1) {
					settings.setupChartsConfigsListSettings.getParamsByIdsFilterMethod = 'every';
				} else {
					settings.setupChartsConfigsListSettings.filterParamsBy.push(
						{ prop: 'skipTitle', method: '==', value: null },
					);
				}
			}

			if (
				enableAxisSelector &&
				joinChartsBy.prop !== 'axis' &&
				joinChartsBy.prop !== 'type' &&
				activeAxis
			) {
				const {
					ncd_active_vertical_axis,
					// ncd_active_axial_axis,
					is_hidden_ncd_active_vertical_axis
				} = this.sensorData;

				if (is_hidden_ncd_active_vertical_axis) {
					settings.setupChartsConfigsListSettings.filterParamsBy.push({
						prop: 'axis_id',
						method: '!=',
						value: ncd_active_vertical_axis
					});
				}

				if (joinChartsBy.prop) {
					settings.setupChartsConfigsListSettings.filterParamsBy.push({
						prop: 'axis_id',
						value: activeAxis,
						exceptCharts: ['displacement'],
						skipWithoutProp: true
					});
				}
			}

			if (this.currentSensorType.isNCDEnv && this.sensorData.is_iaq_disabled) {
				settings.setupChartsConfigsListSettings.filterParamsBy.push({
					prop: 'type',
					value: 'iaq',
					method: '!='
				});
			}

			if (this.currentSensorType.isBannerV2_1) {
				settings.parseChartsConfigsListForDuplicates = true;
			}

			return Object.freeze(settings);
		},

		chartsList: that =>
			that.updateChartsList ? that.ChartsListInstance.getCharts() : [],

		chartsConfigsFullList() {
			return this.chartsListInstancesInitialBuild
				? []
				: this.ChartsListInstance.chartsConfigsFullList
		},

		currentSensorTypeDataKey: () => 'sensorData',

		editThresholdsByStagesEnabled() {
			const {
				isBanner,
				isBannerCM1L,
				isNCDTempVibe,
				isNCDWiredTempVibe,
				isNCDTempVibeCurr,
				isBannerTempVibe2,
				isBannerV2_1,
				isBannerM25
			} = this.currentSensorType;
			return (
				isBanner ||
				isBannerCM1L ||
				isNCDTempVibe ||
				isNCDWiredTempVibe ||
				isNCDTempVibeCurr ||
				isBannerTempVibe2 ||
				isBannerV2_1 ||
				isBannerM25
			);
		},

		/*accessToken() {
			return this.$store.state.auth.access_token;
		}*/

		/*statisticsMockData: () =>
			Object.freeze({
				type: 'job',
				data: {
					id: "56dd83da-633b-428c-8588-ba9d9436c146",
					// imperial_unit_value: 10.46,
					// metric_unit_value: 10.46,
					unit: 0.09,
					parameter_type: 3,
					// register_value: 10.46,
					signal_date_at: "2024-11-12T15:24:14.000Z",
				}
			}),

		lubeStatisticsMockData: () =>
			Object.freeze({
				type: 'cycle',
				data: {
					id: 666644012334312,
					status: 2,
					lube_start_mode: 1,
					lube_cycle_position: 1,
					decibel_value: 0,
					created_at: '2024-06-06T10:53:59.000000Z'
					// signal_date_at: "2022-01-28T15:26:24.000000Z",
				}
			}),

		ajustementsStatisticsMockData: () =>
			Object.freeze({
				type: 'GainAdjustment',
				data: {
					action: 3,
					approved_commands_count: 3,
					created_at: '2024-04-17T06:42:12.000000Z',
					id: 861,
					is_all_commands_approved: true,
					responsibleUser: {
						company_ids: [],
						country_code: 1,
						daily_summary_notify_at: '09:30',
						email: 'peter@industrialmatrix.com',
						first_name: 'Peter',
						full_name: 'Stecyk Peter',
						hourly_rate: 0,
						id: 30,
						is_alarms_notes_notification: false,
						is_day_summary_notify: true,
						is_device_notifiable: false,
						is_mail_sensor_job_notify: true,
						is_real_time_notify: false,
						is_receive_sensors_anomaly_notification: true,
						is_sms_sensor_job_notify: false,
						language: 1,
						last_name: 'Stecyk',
						notifiable_plants: [],
						phone_number: '+19059994459',
						plants_ids: [],
						temp_type: null,
						type: 1,
						uuid: '7fd587aa-015c-4dd3-9edd-b92fe9b2f23c',
						work_order_requests_count: 0,
						work_order_role: 0
					},
					sensor_id: 358,
					sent_commands_at: '2024-04-17T06:42:12.000000Z',
					sent_commands_count: 3,
					status: 1
				}
			})
		*/
	},

	methods: {
		...mapActions({
			fetch_sensor: 'sensors/fetch_sensor',

			set_sensor_state: 'sensors/set_sensor_state',
			set_global_state: 'set_global_state',
			auth_set_redirect_to: 'auth/set_redirect_to',
		}),

		setupOverlayPlotlines(rpm_value) {
			this.callMethodInAllCharts({
				ids: getValues('chart_id', this.ChartsListInstance.getCharts()),
				methodName: 'setupOverlayPlotlines',
				payload: rpm_value,
				fromInstance: true,
			});
		},

		handleOverlayChartWrapperReady({ hasStatistics }) {
			// console.log('updateOverlayChartOptions')
			this.overlayChartshasStatistics = hasStatistics;
			this.overlayChartsListWrapperLoading = false;
			this.callMethodInAllCharts({
				ids: getValues('chart_id', this.ChartsListInstance.getCharts()),
				methodName: 'updateOverlayChartOptions',
				fromInstance: true,
				payload: this.OverlayChartsListInstance.chartsInstancesList[0].getChartOptions()
			});
		},

		buildOverlayCharts(data = {}) {
			var { settings, payload } = data;
			payload = payload || {};
			settings = settings || {};
			// console.log('buildOverlayCharts')

			this.OverlayChartsListInstance.buildCharts({
				settings,
				payload_1: { ...payload },
				filters: { ...this.rootFilters }
			});

			this.overlayChartsListWrapperLoading = true;
			if (this.OverlayChartsListInstance.chartsInstancesList) {
				this.OverlayChartsListInstance.chartsInstancesList.forEach(Chart => {
					Chart.injectProps('events', this.overlayChartInstanceEventsList);
					Chart.fetchChartData();
				});
			}

			if (window.location.origin === 'http://localhost:8080') {
				window[`OverlayChartsListInstance`] = this.OverlayChartsListInstance;
			}
		},

		buildCharts({ settings, payload }) {
			payload = payload || {};
			// console.log('buildCharts')
			this.ChartsListInstance.buildCharts({
				settings,
				payload_1: { ...payload, ...this.additionalChartPayload },
				filters: { ...this.rootFilters },
				y_filters: { ...this.y_filters }
			});


			if (this.chartsListInstancesInitialBuild) {
				this.chartsListInstancesInitialBuild = false;
			}

			this.updateChartsList++;

			var { rpmOverlayData } = this;
			
			if (rpmOverlayData && rpmOverlayData.is_rpm_visible && rpmOverlayData.rpm_value) {
				this.setupOverlayPlotlines(this.rpmOverlayData.rpm_value);
			}

			// if (window.location.origin === 'http://localhost:8080') {
				window[
					`ChartsListInstance_${this.chartsContainerIdx}`
				] = this.ChartsListInstance;
			// }
		},

		reloadChart(ids, settings={}) {
			this.ChartsListInstance.reloadCharts(ids, settings);
		},

		handleChangeChartsListWrappersReadyCounter(val, payload) {
			this.$emit('event', {
				eventName: 'handleChangeChartsListWrappersReadyCounter',
				data: { val, payload }
			});
		},

		// -----------
		callMethodInAllCharts({ methodName, fromInstance, payload, ids }) {
			// console.log('callMethodInAllCharts', this.chartsList)
			this.chartsList.forEach(Chart => {
				const isCall = ids ? ids.includes(Chart.chart_id) : true;
				if (isCall) {
					if (fromInstance) {
						Chart[methodName](payload);
					} else {
						this.$refs[`chart_item-${Chart.chart_id}`][0][methodName](payload);
					}
				}
			});
		},

		checkUnsavedThresholds({ to }) {
			this.auth_set_redirect_to(to.path);

			const hasUnsavedThresholds = this.chartsList.some(
				Chart => Object.keys(Chart.updateThresholdsData).length
			);

			if (hasUnsavedThresholds) {
				this.unsavedThresholdsDialogOpen = true;
			}
			return !hasUnsavedThresholds;
		},

		handleRedirectTo(to) {
			if (!this.isRedirected) {
				this.isRedirected = true;
				this.changeRoute({ path: to });
			}
		},

		// ------------------
		setupSocket() {
			if (
				!this.additionalProps.isCompare &&
				!this.oneChartOnly &&
				this.rootFilters.daterange &&
				isTodayRange(this.rootFilters.daterange) &&
				this.rootFilters.isLiveEnabled
			) {
				// console.log('setupSocket')
				// console.log(this.socketChannel);
				this.setupWebSocket({
					socketName: 'statistics_socket',
					socketNameReadyProp: 'statistics_socket_ready',
					socketChannel: this.socketChannel,
					socketCallback: (type, data) => this.statistics_socketCallback({type, data}),

					// resources: this.getSensorsIds(this.itemsList)
				});

				// console.log(WebSocketService)
				/*const wsConfig = {
				    wsUrl: 'WebSocket URL',
				    channelAuthConfig: {
				        headers: {'Authorization': `Bearer ${this.authToken}`}
				    }
				};
				this.statistics_socket = new WebSocketService(wsConfig);
				this.statistics_socket.*/

			} else if (this.statistics_socket) {
				// this.statistics_socket.disconnect();
				this.closeWebSocket({ socketName: 'statistics_socket' });
			}
		},

		/*setupDXMSocket() {
			if (
				!this.additionalProps.isCompare &&
				!this.oneChartOnly &&
				this.rootFilters.daterange &&
				isTodayRange(this.rootFilters.daterange) &&
				this.rootFilters.isLiveEnabled
			) {
				// console.log('setupSocket')
				// console.log(this.socketChannel);
				this.setupWebSocket({
					socketName: 'dxm_socket',
					socketNameReadyProp: 'dxm_socket_ready',
					socketChannel: this.socketChannelDXM,
					socketCallbackName: 'dxmCommand_socketCallback'
					// resources: this.getSensorsIds(this.itemsList)
				});
			} else if (this.dxm_socket) {
				this.closeWebSocket({ socketName: 'dxm_socket' });
			}
		},*/

		statistics_socketCallback(response = {}) {
			const { type, data } = response;
			const safeData = data.data || {};
			// console.log('statistics_socketCallback', response.data.parameter_type, this.socketChannel)
			try {
				if (type.toLowerCase() === 'job') {
					this.ChartsListInstance.callMethod('handlePointsLiveUpdate', safeData);
				} else if (type === 'sensor') {
					if (safeData) {
						const payload = {
							eventName: 'update_sensor',
							data: {
								id: this.sensorData.id,
								sensor: {
									...this.sensorData,
									lube_cycle_high_speed: safeData.lube_cycle_high_speed
								}
							}
						};
						this.$emit('event', payload);
					}
				} else if (type == 'GainAdjustment') {
					this.ChartsListInstance.callMethod('handleAdjustmentsLiveUpdate', {
						safeData,
						settings: {
							set_sensor_state: this.set_sensor_state,
							$notify: this.$notify
						}
					});
				}/* else if (type === 'cycle') {
					this.ChartsListInstance.callMethod('handleLubePointsLiveUpdate', data);
				}*/
				
			} catch (e) {
				console.error('statistics_socketCallback', e);
			}
		},

		handleUltrasoundWebSocketSuccess(lubeShotData) {
			if (
				!this.additionalProps.isCompare &&
				!this.oneChartOnly &&
				this.rootFilters.daterange &&
				isTodayRange(this.rootFilters.daterange) &&
				this.rootFilters.isLiveEnabled
			) {
				this.ChartsListInstance.callMethod('handleLubePointsLiveUpdate', lubeShotData);				
			}
		},

		/*dxmCommand_socketCallback(response = {}) {
			const { type, data } = response;
			const { tt } = this;

			if (type === 'LUBRICATION.SHOT') {
				this.lubeShotDataFromSocket[data.id] = data;
			} else if (type === 'DXM.COMMAND' && data.controller_id === this.controllerData.id) {
				if (data.status == DXM_COMMANDS_REQUEST_STATUSES.SUCCESS) {
					this.$notify({
						type: 'success',
						title: tt('constants.Success'),
						message: `DXM ${tt('requesting')} ${tt('Successfull')}`
					});

					const lubeShotData = this.lubeShotDataFromSocket[data.lube_shot_id];
					
					if (lubeShotData && data.type === 3) {
						this.ChartsListInstance.callMethod('handleLubePointsLiveUpdate', lubeShotData);
					}
				}

				if (data.status == DXM_COMMANDS_REQUEST_STATUSES.FAIL) {
					this.$notify({
						type: 'warning',
						title: tt('constants.Fail'),
						message: `${tt('Error')} - ${tt(
							'phrases.check_controller_connectivity'
						)}`,
						duration: 0
					});
				}
			}
		}*/
	},

	watch: {
		/*buildOverlayChartSettings(settings) {
			if (settings) {
				this.buildOverlayCharts({ settings });
			}
		},*/

		rpmOverlayData(data) {
			// console.log('watch rpmOverlayData', data)
			
			this.callMethodInAllCharts({
				ids: getValues('chart_id', this.ChartsListInstance.getCharts()),
				methodName: 'cleanOverlayChartData',
				fromInstance: true,
			});

			if (data.is_rpm_visible && data.rpm_value) {
				this.setupOverlayPlotlines(data.rpm_value);
			}
		},

		OverlayChartsListInstance(Instance) {
			// console.log('watch OverlayChartsListInstance', Instance)
			if (Instance) {
				this.buildOverlayCharts();
			}
		},

		buildChartsSettings(settings) {
			this.buildCharts({ settings });
		},

		chartsConfigsFullList(list) {
			if (!this.oneChartOnly) {
				this.$emit('event', {
					eventName: 'handleChartsConfigsListReady',
					data: list || []
				});
			}
		},

		rootFilters(filters) {
			if (this.OverlayChartsListInstance) {
				// console.log('setFiltersToCharts', filters)
				this.OverlayChartsListInstance.setFiltersToCharts(filters, {
					refetchData: true
				});
			}
			this.ChartsListInstance.setFiltersToCharts(filters, { refetchData: true });
			this.setupSocket();
		},

		y_filters(y_filters) {
			this.ChartsListInstance.setYFiltersToCharts(y_filters);
		},

		/*sensorData(x) {
			console.log(x)
		}*/
	},

	created() {
		if (this.OverlayChartsListInstance) {
			this.buildOverlayCharts();
		}

		this.buildCharts({ settings: this.buildChartsSettings });

		this.setupSocket();
		// this.setupDXMSocket();

		// console.time('render chart')
		// console.log('created')
	},

	mounted() {
		if (!this.oneChartOnly) {
			if (this.editThresholdsByStagesEnabled) {
				// console.log('set',this.checkUnsavedThresholds )
				this.set_global_state({
					stateProp: 'beforeEachHook',
					value: payload => this.checkUnsavedThresholds(payload)
				});
				// console.log('beforeEachHook', this.$store.state.global.beforeEachHook )
			}
		}
	},

	beforeDestroy() {
			// console.log('wrapper beforeDestroy', this.statistics_socket)
		if (this.statistics_socket) {
			this.closeWebSocket({ socketName: 'statistics_socket' });
		}

		if (this.dxm_socket) {
			this.closeWebSocket({ socketName: 'dxm_socket' });
		}
		if (this.editThresholdsByStagesEnabled) {
			this.set_global_state({ stateProp: 'beforeEachHook', value: null });
			this.auth_set_redirect_to(null);
		}
	}
};
</script>
