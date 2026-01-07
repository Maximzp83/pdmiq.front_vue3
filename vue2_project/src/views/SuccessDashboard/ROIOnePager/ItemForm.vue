<template>
	<div class="edit-form-container success-dashboard-form normal-font-weight">
		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<el-form
			:class="['item-edit-form']"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="'top'"
		>
			<div class="title flex" v-if="showJustInfo || itemData">
				<div class="section-title uppercase semi-bold" v-if="showJustInfo">
					{{ $t('Asset') }}:
					{{ itemData.asset ? itemData.asset.name : $t('phrases.name_is_missing') }}
				</div>

				<div class="ml-auto" v-if="itemData">
					<span
						class="info-color pointer semi-bold"
						@click="showHistory = !showHistory"
						>{{ tt('History') }}</span
					>
				</div>
			</div>

			<div :class="[{ card: !showJustInfo }]">
				<div :class="[{ 'card-content': !showJustInfo }]">
					<div class="mcol-xs-auto">
						<TabsBar
							@switchTab="switchTab"
							:activeTab="activeTab"
							:tabsList="tabsList"
							buttonsType="primary"
							buttonsClass="inverted"
						/>
					</div>

					<div class="flex mrow wrap big-padding">
						<div class="mcol-xs-12 mt-15">
							<el-form-item label="" prop="name" required>
								<CustomInput
									v-model="formData.name"
									:placeholder="`${tt('Name')} ${tt('ROI_One_Pager')}`"
								/>
							</el-form-item>
						</div>

						<div :class="['mcol-xs-12']" v-if="!showJustInfo">
							<el-form-item :label="''" prop="asset_id">
								<FetchByQuerySelect
									enableLoadmore
									:optionsLoading.sync="assetsLoading"
									:optionsList.sync="assetsList"
									:placeholder="`${tt('select')} ${tt('asset')}`"
									v-model="formData.asset_id"
									:settings="assetQueryOptions"
								/>
							</el-form-item>
						</div>

						<div :class="['mcol-xs-12']" v-if="!showJustInfo">
							<el-form-item :label="''" prop="sensor_id">
								<FetchByQuerySelect
									:disabled="!formData.asset_id"
									enableLoadmore
									clearable
									:optionsLoading.sync="sensorsLoading"
									:optionsList.sync="sensorsList"
									:placeholder="`${tt('select')} ${tt('sensor')}`"
									v-model="formData.sensor_id"
									:settings="sensorQueryOptions"
									:setupLabelMethod="setupSensorLabelMethod"									
								/>
							</el-form-item>
						</div>

						<div class="mcol-xs-12 mcol-lg-6">
							<div class="mrow flex column">
								<div class="mcol-xs-12">
									<div class="card 1vertical-fluid">
										<div class="card-header filled_2">
											<div
												class="semi-bold uppercase"
												v-text="isFileTabActive ? tt('FILE') : tt('IMAGES')"
											></div>
										</div>

										<div class="card-content">
											<transition name="standard-fade" mode="out-in">
												<el-form-item
													prop="pictures"
													class="upload-form-item"
													v-if="!isFileTabActive"
												>
													<FileUploadBlock
														:key="imgUploadUpdated"
														@onImgClick="togglePreviewModal"
														ref="ImgUploadBlock"
														uploadBlockType="standard-images big-images rounded"
														multiple
														rotate
														showImageClickOverlay
														imgItemClass="xs-show-inline"
														:disabled="showJustInfo"
														:pictures="itemPictures"
													/>
												</el-form-item>

												<el-form-item
													prop="file"
													class="upload-form-item"
													v-if="isFileTabActive"
												>
													<FileUploadBlock
														ref="FileUploadBlock"
														:key="imgUploadUpdated"
														injectDataToRoot
														uploadBlockType="files-list"
														:accept="' '"
														:showDeleteButton="!showJustInfo"
														deleteFileId
														enableLinkToFile
														:disabled="showJustInfo"
														:pictures="itemPictures"
														:buttonText="tt('phrases.Upload_File')"
														buttonIcon="icomoon icon-clip"
													/>
												</el-form-item>
											</transition>
										</div>
									</div>
								</div>

								<div class="mcol-xs-12" v-if="showJustInfo">
									<div class="card roi-green-bar">
										<div class="card-content flex">
											<div class="page-title semi-bold">{{ tt('ROI') }}</div>
											<div class="ml-auto page-title semi-bold">
												$ {{ formData.final_roi }}
											</div>
										</div>
									</div>
								</div>

								<div v-else class="mcol-xs-12">
									<div class="card">
										<div class="card-header filled_2">
											<div class="semi-bold uppercase">
												{{ tt('ROI_FINAL') }} ($)
											</div>
										</div>

										<div class="card-content">
											<el-form-item prop="final_roi" class="mcol-xs-6" required>
												<el-input
													v-model.number="formData.final_roi"
													placeholder="$"
												/>
											</el-form-item>
										</div>
									</div>
								</div>
							</div>
						</div>

						<transition name="standard-fade" mode="out-in">
							<div
								:class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]"
								v-if="!isFileTabActive"
							>
								<div class="mrow flex column equalize-cards-height-16">
									<div class="mcol-xs-12">
										<div class="card vertical-fluid">
											<div class="card-header filled_2">
												<div class="semi-bold uppercase">
													{{ $t('phrases.findings_issue_detection_action_plan') }}
												</div>
											</div>

											<div class="card-content special-decorated-form striped">
												<el-form-item prop="issues">
													<div v-if="issuesItemsList.length" class="content-row">
														<DynamicFormItem
															ref="IssuesFormItem"
															v-for="(item, idx) in issuesItemsList"
															:key="`form_item-${item.id}`"
															:item-data="item"
															:item-index="idx"
															:isLast="idx == issuesItemsList.length - 1"
															@onCreate="
																addFormItem('issuesItemsList', 'f_i-', {
																	focus: 'title'
																})
															"
															@onRemove="id => removeFormItem(id, 'issuesItemsList')"
														/>
															<!-- @ready="blockReady" -->
													</div>
													<div v-else>-</div>
												</el-form-item>
											</div>
										</div>
									</div>

									<div class="mcol-xs-12">
										<div class="card vertical-fluid">
											<div class="card-header filled_2">
												<div class="semi-bold uppercase">
													{{ tt('phrases.roi_cost_avoidance') }}
												</div>
											</div>

											<div class="card-content special-decorated-form striped">
												<el-form-item prop="cost_avoidance_plan">
													<div
														v-if="costAvoidanceItemsList.length"
														class="content-row"
													>
														<DynamicFormItem
															ref="CostAvoidanceFormItem"
															v-for="(item, idx) in costAvoidanceItemsList"
															:key="`form_item-${item.id}`"
															:item-data="item"
															:item-index="idx"
															:isLast="idx == costAvoidanceItemsList.length - 1"
															@onCreate="
																addFormItem('costAvoidanceItemsList', 'ca_i-', {
																	focus: 'title'
																})
															"
															@onRemove="
																id => removeFormItem(id, 'costAvoidanceItemsList')
															"
														/>
															<!-- @ready="blockReady" -->
													</div>
													<div v-else>-</div>
												</el-form-item>
											</div>
										</div>
									</div>
								</div>
							</div>
						</transition>

						<!-- <div v-if="!showJustInfo" :class="['mcol-xs-12 mcol-lg-6']">
							<div class="card">
								<div class="card-header filled_2">
									<div class="semi-bold">ROI FINAL ($)</div>
								</div>

								<div class="card-content">
									<el-form-item prop="final_roi" class="mcol-xs-6">
										<el-input v-model.number="formData.final_roi" placeholder="$" />
									</el-form-item>
								</div>
							</div>
						</div> -->

						<div class="mcol-xs-12" v-if="!isFileTabActive">
							<div class="card">
								<div class="card-header filled_2 flex align-center">
									<div class="semi-bold uppercase">
										{{ tt('phrases.pdm_data_screenshot') }}
									</div>
									<!-- <Datepicker
										v-if="!showJustInfo"
										class="ml-auto"
										setupDaterangeFilter
										enableShortcuts
										v-model="graphs_period"
										type="daterange"
									/> -->
								</div>

								<div class="card-content">
									<SensorsAlarmsContainer
										@event="handleEventNew"
										v-if="
											formData.graphs && formData.graphs.length && sensorsList.length
										"
										ref="SensorsAlarmsContainer"
										:sensorsAlarms="formData.graphs"
										:itemData="itemData"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:measurement="plantItem.metric_system_type"
										:additionalProps="additionalPropsForCharts"
									/>

									<div class="page-title bold gray-color outside-bg-addition" v-else>
										{{ $t('phrases.no_data') }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="el-form-item FormOperationsButtons" v-if="!showJustInfo">
				<el-button
					@click="validateForm"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span class="uppercase">{{ $t('SAVE') }}</span>
				</el-button>
			</div>
		</el-form>

		<el-dialog
			:title="$t('phrases.history_roi_one_pager')"
			center
			:append-to-body="true"
			:visible.sync="showHistory"
			class="tiny dialog-decorate-header filled-header rounded top"
			v-if="itemData"
		>
			<ROIsHistory
				@closeDialog="showHistory = false"
				:itemData="itemData"
				showClose
			/>
		</el-dialog>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { cloneDeep, setupLabel } from '@/helpers';
import { required /*number*/ } from '@/constants/validation';
// const testImgSrc = '/static/img/email/pulsar.png';
import { DATASET } from '@/constants/global';

import {
	itemFormMixin,
	fetchItemsHelper,
	subItemsListMixin,
	eventHandler,
	requestsListMixin,
	navigation,
	tabsMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		fetchItemsHelper(),
		subItemsListMixin(),
		eventHandler(),
		requestsListMixin(),
		navigation(),
		tabsMixin()
	],
	components: {
		// InfoItem: () => import('@/components/itemDetails/InfoItem.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),

		DynamicFormItem: () => import('./DynamicFormItem.vue'),
		SensorsAlarmsContainer: () => import('../common/SensorsAlarmsContainer.vue'),
		ROIsHistory: () => import('../common/ROIsHistory.vue')
		// Datepicker: () => import('@/components/common/Datepicker.vue'),
	},

	props: {
		plantItem: Object
	},

	data() {
		return {
			showHistory: false,
			imgUploadUpdated: 0,

			issuesItemsList: [],
			costAvoidanceItemsList: [],

			assetsList: [],
			assetsLoading: false,
			sensorsList: [],
			sensorsLoading: false,

			graphs_period: [],

			selectedAsset: null,
			assetLoading: false,

			switchTabTo: null,

			formData: {
				name: '',
				asset_id: null,
				sensor_id: null,
				pictures: [],
				file: null,
				// full_file_name: '',
				graphs: [],

				issues: [],
				cost_avoidance_plan: [],
				final_roi: '',
				sensors_alarms: []
			}
		};
	},

	computed: {
		additionalPropsForCharts: that =>
			Object.freeze({
				showDisableChartButton: !that.showJustInfo,
				showDatePicker: !that.showJustInfo
			}),

		// chartsRange: that => ({ daterange: that.graphs_period }),

		isFileTabActive() {
			const { activeTab, tabsList } = this;

			return activeTab.prop == tabsList[1].prop;
		},

		tabsList: that =>
			Object.freeze(
				that.$translate([
					{ title: 'Form', prop: 'formTabActive' },
					{ title: 'File', prop: 'fileTabActive' }
				])
			),

		routeQuery() {
			const { query } = this.$route;

			return Object.keys(query).length ? query : null;
		},

		showJustInfo: that =>
			!that.$hasAccessTo(['edit_customer_success']) ||
			(that.itemData &&
				that.itemData.id &&
				(!that.routeQuery || !that.routeQuery.edit)),

		imagesMock: () => [
			/*{
				equipment_id:10874,
				file_name:"164406585661fe7440d8a4f4.73517094.jpg",
				full_file_name:"https://api.testmatrix.assetmatrix.com/storage/equipment/164406585661fe7440d8a4f4.73517094.jpg",
				full_thumb_file_name:"https://api.testmatrix.assetmatrix.com/storage/equipment/thumb_164406585661fe7440d8a4f4.73517094.jpg",
				id:2738,
				thumb_file_name:"thumb_164406585661fe7440d8a4f4.73517094.jpg",
				type:1,
			},
			{
				equipment_id:10874,
				file_name:"164431374962023c95d78e52.59424378.jpg",
				full_file_name:"https://api.testmatrix.assetmatrix.com/storage/equipment/164431374962023c95d78e52.59424378.jpg",
				full_thumb_file_name:"https://api.testmatrix.assetmatrix.com/storage/equipment/thumb_164431374962023c95d78e52.59424378.jpg",
				id:26915,
				thumb_file_name:"thumb_164431374962023c95d78e52.59424378.jpg",
				type:2,
			}*/
		],

		rules: () => ({
			asset_id: required
			// email: required,
			// plant_id: required,
		}),

		assetQueryOptions() {
			return Object.freeze({
				fetchAction: 'assets/fetch_assets',
				params: { plantId: this.globalFilters.plantId }
				// setToStore: true,
				// loading: true
			});
		},

		sensorQueryOptions() {
			return Object.freeze({
				fetchAction: 'sensors/fetch_sensors',
				params: { 
					max: 30,
					assetId: this.formData.asset_id,
					// plantId: this.plantId || this.globalFilters.plantId
				},

				// params: { plantId: this.plantId || this.globalFilters.plantId }
			});
		},

		sensorLabelOptions: () =>
			Object.freeze({
				accessors: ['asset_numbers', 'data_set', 'controller.name', 'port_number'],
				useGetItemValue: [
					{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }
				],
				delimeter: ','
			}),

		requestsToDoList: that =>
			Object.freeze([
				{
					action: 'fetch_assets',
					// payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{
							prop: 'globalFilters.plantId',
							param: 'plantId',
							noFetch: true,
							fetchById: {
								action: 'assets/fetch_asset',
								itemId: that.formData.asset_id
							}
						}
					],
					localProp: 'assetsList',
					localLoadProp: 'assetsLoading'
				}
			]),

		subItemsSettings: () => Object.freeze([
			{ ref: 'IssuesFormItem', targetProp: 'issues' },
			{ ref: 'CostAvoidanceFormItem', targetProp: 'cost_avoidance_plan' },
			{ ref: 'FileUploadBlock', cleanIfEmpty: { prop:'file', val: null } },
			{ ref: 'ImgUploadBlock', targetProp: 'pictures', },
		]),

		itemPictures() {
			const { itemData, isFileTabActive } = this;

			if (isFileTabActive) {
				if (itemData && itemData.full_file_name) {
					return [{ full_file_name: itemData.full_file_name }];
				}
			} else {
				if (itemData && itemData.pictures.length) {
					return itemData.pictures;
				}
			}

			return [];
		},

		assetSensorsData() {
			return Object.freeze(this.sensorsList.map(si => ({ sensor_id: si.id })));
		}
	},

	methods: {
		...mapActions({
			fetch_sensors: 'sensors/fetch_sensors',
			fetch_asset: 'assets/fetch_asset'
			// set_meeting_tracker_state: 'meeting_trackers/set_state_prop'
		}),

		filterEmptyItems(list) {
			return list.filter(li => li.id || li.title);
		},

		togglePreviewModal(data) {
			this.$emit('event', {
				eventName: 'togglePreviewModal',
				data: data,
				onward: true
			});
		},

		fetchAsset(asset_id) {
			const payload = { itemId: asset_id, notNotify: true };

			this.doFetchAction('fetch_asset', 'selectedAsset', 'assetLoading', payload);
		},

		fetchAssetSensors(asset_id) {
			const payload = { params: { assetId: asset_id, max: 30 } };

			this.doFetchAction('fetch_sensors', 'sensorsList', 'sensorsLoading', payload);
		},

		setupSensorLabelMethod(sensor) {
			const {data_set, device_address_id, controller, fft_sensor_id} = sensor;

			if (data_set === DATASET.BANNER_TEMP_VIBE_V2 || data_set === DATASET.BANNER_V2_GENERIC) {
				return `${controller.name}, D${device_address_id}, S${fft_sensor_id}`;
			} else {
				return setupLabel(sensor, this.sensorLabelOptions);
			}
		},

		localSetupPage(item) {
			if (item) {
				if (this.routeQuery && this.routeQuery.edit && item.full_file_name) {
					this.switchTabTo = { key: 'prop', value: 'fileTabActive' };
				}

				this.fetchAssetSensors(item.asset_id);

				this.issuesItemsList = this.setupFormSubItemsList(item.issues, 'f_i');
				this.costAvoidanceItemsList = this.setupFormSubItemsList(
					item.cost_avoidance_plan,
					'ca_i'
				);
			}

			if (!this.showJustInfo) {
				if (!this.issuesItemsList.length) {
					this.addFormItem('issuesItemsList', 'f_i-');
				}
				if (!this.costAvoidanceItemsList.length) {
					this.addFormItem('costAvoidanceItemsList', 'ca_i-');
				}
			}
		},

		localPrepareSubmitData(formData) {
			formData.issues = this.filterEmptyItems(formData.issues);
			formData.cost_avoidance_plan = this.filterEmptyItems(
				formData.cost_avoidance_plan
			);

			if (this.activeTab.prop == 'fileTabActive') {
				formData.issues = [];
				formData.cost_avoidance_plan = [];
			}

			if (!formData.sensor_id) {
				delete formData.sensor_id;
			}

			delete formData.sensors_alarms;
			return formData;
		},

		localValidationHook(options) {
			if (!this.isFileTabActive) {
				// this.$refs['SensorsAlarmsContainer'].saveSensorsAlarmsChartsForms();
			}
			// this.handleValidateRefsItems(options);
			this.submitForm(options);			
		},

		updateFormDataGraphs({ graphs }) {
			this.formData.graphs = graphs;
		},

		localPreSubmitHook(formData) {
			const { file } = formData;

			if (
				this.activeTab.prop == 'fileTabActive' &&
				!file &&
				(!this.itemData || !this.itemData.full_file_name)
			) {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.file_is_required`)
				});
				return { next: false };
			}
			// console.log(formData.final_roi, isNaN(formData.final_roi))
			if (isNaN(formData.final_roi)) {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.roi_final_should_be_a_number`)
				});
				return { next: false };
			}

			return { next: true };
		}
	},

	watch: {
		'formData.asset_id'(id) {
			// console.log(this.isInitialSetup, id)
			if (!this.isInitialSetup) {
				this.fetchAsset(id);
				this.fetchAssetSensors(id);
			}
		},
		'selectedAsset'(asset) {
			if (asset) {
				this.formData.graphs = cloneDeep(asset.graphs);
			}
		},
		isFileTabActive() {
			this.imgUploadUpdated++;
		}
	},

	created() {
		// console.log(this.plantItem.id, this.itemData.plant_id)
		if (this.itemData) {
			if (this.plantItem.id !== this.itemData.plant_id) {
				this.changeRoute({ path: '/success-dashboard/roi-one-pager' });
			}
		}
	}
};
</script>
