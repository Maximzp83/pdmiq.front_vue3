<template>
	<div class="">
		<div class="section-row card-content">
			<div class="el-form-item flex mrow">
				<div class="mcol-xs-6">
					<!-- :multipleLimit="5" -->
					<CustomSelect
						filterable
						multiple
						:optionsLoading="sensorsLoading"
						:optionsList="sensorsList"
						:placeholder="`${tt('Select')} ${tt('sensors')}`"
						v-model="formData.report_by_sensor_ids"
						prefixIcon="icomoon icon-sensor"
						:setupLabelSettings="sensorLabelOptions"
					/>
				</div>

				<div class="mcol-xs-6">
					<Datepicker
						className=""
						v-model="selectedRange"
						type="datetimerange"
						format="yyyy/MM/dd HH:mm"
						value-format="yyyy-MM-dd HH:mm:ss"
						:default-time="['00:00:00', '23:59:59']"
						:picker-options="pickerOptions"
						setupDaterangeFilter
					/>
				</div>
			</div>
		</div>

		<div
			class="section-row dialog-footer section-row text-center flex mrow justify-center charts-page-operations"
		>
			<div class="button-item">
				<el-button class="capitalize" @click="close">{{ tt('Cancel') }}</el-button>
			</div>

			<!-- <PDFandFFTrequestsBlock
				class=""
				:sensorData="sensorData"
				:currentSensorType="currentSensorType"
			/> -->

			<div :class="['button-item pdf-item relative']">
				<SimpleSpinner :active="pdf_report_processing || pdf_report_requesting" />

				<el-button
					v-if="!pdfReportURL"
					@click="startPDFreportRequest"
					:disabled="pdf_report_processing || pdf_report_requesting"
					type="primary"
					native-type="button"
					class="inverted report-button"
				>
					<i
						class="icomoon icon-pdf"
						v-show="!pdf_report_processing || !pdf_report_requesting"
					></i>
					<span class="text">{{
						pdf_report_processing ? `${tt('Processing')}...` : tt('Export')
					}}</span>
				</el-button>

				<a
					v-else
					:href="pdfReportURL"
					target="_blank"
					@click="pdfReportURL = ''"
					class="el-button el-button--primary inverted report-button"
				>
					<span>
						<i class="icomoon icon-upload"></i>
						<span class="text">{{ tt('Download') }}</span>
					</span>
				</a>

				<div class="process-description" v-show="pdf_report_processing">
					{{ tt('phrases.it_will_take_some_time') }}
				</div>
			</div>

			<!-- <el-button
				type="primary"
				@click="handleExport"
				class="capitalize"
				:disabled="pdf_report_processing || pdf_report_requesting"
				:loading="pdf_report_processing || pdf_report_requesting"
				>{{ tt('export') }}</el-button
			> -->
			<div class="button-item">
				<el-button
					type="primary"
					@click="handleLastExport"
					class="capitalize"
					:disabled="pdf_report_processing || pdf_report_requesting"
					:loading="pdf_report_processing || pdf_report_requesting"
					>{{ tt('phrases.load_last_export') }}</el-button
				>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

// import { updateFormData } from '@/helpers';
import {
	datePickerShortcuts,
	datePickerAdditionalShortcuts
} from '@/constants/date_time';
import {
	getDateRange
	// cleanDateString
	// getYmdDateString,
	// getTimeDifference
} from '@/helpers';

import {
	fetchItemsHelper,
	// webSocketMixin,
	chartsCompareExportMixin
} from '@/mixins';

export default {
	mixins: [fetchItemsHelper(), chartsCompareExportMixin()],

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue')
		// PDFandFFTrequestsBlock: () => import('./PDFandFFTrequestsBlock.vue')
	},

	props: {
		plantId: Number
		// showJustInfo: Boolean,
		// itemData: Object
	},

	data() {
		return {
			sensorsList: [],
			sensorsLoading: false,
			pickedRange: {},
			selectedRange: [],

			formData: {
				report_by_sensor_ids: []
				// date_start: '',
				// date_finish: '',
				// description: ''
			}
		};
	},

	computed: {
		pickerOptions: that => {
			const mainShortcuts = datePickerShortcuts().filter(
				sc => !sc.disabledForCompare
			);

			let shortcuts = [].concat(datePickerAdditionalShortcuts(), mainShortcuts);
			const timeRanges = ['1_hour', '3_hours', '12_hours'];

			shortcuts = shortcuts.map(sc => {
				let newSc = {
					...sc,
					onClick: picker => {
						that.rangeWithTime = timeRanges.some(r => r == sc.rangeName);
						setTimeout(() => {
							picker.$emit('pick', getDateRange(sc.rangeName));
							// console.log('click ', sc.rangeName, getDateRange(sc.rangeName), picker)
						}, 100);
					}
				};

				if (sc.rangeName == 'today') newSc.text = 'Today (Live)';

				return newSc;
			});

			return Object.freeze({
				shortcuts: shortcuts,
				onPick(range) {
					that.pickedRange = range;
				},

				disabledDate(date) {
					const { minDate } = that.pickedRange;

					if (minDate) {
						const minDateMs = minDate.getTime();
						const dateMs = date.getTime();
						// 604800000 = 3600 * 1000 * 24 * 7  ( 7 days );

						if (dateMs < minDateMs - 604800000 || dateMs > minDateMs + 604800000) {
							return true;
						}
					}

					return false;
				}
			});
		},

		sensorLabelOptions: () =>
			Object.freeze({
				accessors: [
					'equipment.asset.machine.name',
					'equipment.asset.name',
					'location_in_equipment'
				],
				/*useGetItemValue: [
					{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }
				],*/
				delimeter: ','
			})
	},

	methods: {
		...mapActions({
			fetch_sensors: 'sensors/fetch_sensors',
			fetch_last_export: 'plants/fetch_plant_graphs_pdf_report_last'
		}),

		fetchSensors(plantId) {
			const payload = { params: { max: -1, plantId: plantId } };

			this.doFetchAction('fetch_sensors', 'sensorsList', 'sensorsLoading', payload);
		},

		close() {
			this.$emit('close');
		},

		startPDFreportRequest() {
			if (this.formData.report_by_sensor_ids.length) {
				this.sendComparePDFreport({
					plantId: this.plantId,
					sensor_ids: this.formData.report_by_sensor_ids,
					daterange: this.selectedRange
					// successCallback: this.close
				});
			} else {
				this.$notify({
					type: 'warning',
					message: this.tt('phrases.sensors_should_be_selected')
				});
			}
		},

		handleLastExport() {
			this.pdf_report_processing = true;

			this.fetch_last_export({ plantId: this.plantId })
				.then(({ value }) => {
					if (value) {
						this.formData.report_by_sensor_ids = value.report_by_sensor_ids;
						this.pdf_report_processing = false;
					}
				})
				.catch(() => {
					this.pdf_report_processing = false;
				});
		}
	},

	created() {
		this.fetchSensors(this.plantId);
		// this.formData = updateFormData(this.itemData, this.formData);
	}
};
</script>
