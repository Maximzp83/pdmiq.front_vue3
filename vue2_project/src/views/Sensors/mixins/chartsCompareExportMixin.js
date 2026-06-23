import { prepareRangeParams } from '@/helpers';
import { generateUrl } from '@/services/api/api_helpers';
// import { exportListToFileMixin } from '@/mixins';

const chartsCompareExportMixin = {
	// mixins: [],
	props: {
		sensorsProp: Array,
		sensors: {
			type: Array,
			default: () => []
		},
		rootFilters: { type: Object, default: () => ({}) }
	},
	data() {
		return {
			pdfReportURL: '',

			pdf_report_requesting: false,
			pdf_report_processing: false,

			compare_pdf_socket: null,
			compare_pdf_socket_ready: false,
			exportingPdfSocketInterval: null
		};
	},

	computed: {
		authUser: that => that.$store.state.auth.authUser,
		filters: that => that.$store.state.sensors.statistics_filters,

		socketChannelCompareRequest() {
			const { authUser } = this;

			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		}
	},

	methods: {
		createExportWebSocket() {
			// console.log('createExportWebSocket')
			this.closeWebSocket({ socketName: 'compare_pdf_socket' });

			this.setupWebSocket({
				socketName: 'compare_pdf_socket',
				socketNameReadyProp: 'compare_pdf_socket_ready',
				socketChannel: this.socketChannelCompareRequest,
				socketCallback: (type, data) => this.compare_pdf_socketCallback({ type, data }),
				// resources: this.sensorData.id
			});
		},

		resetPdfSocketInterval() {
			clearInterval(this.exportingPdfSocketInterval);
			this.exportingPdfSocketInterval = null;
		},

		sendComparePDFreport(data) {
			// console.log('sendComparePDFreport', data)
			const { plantId, sensor_ids, daterange, successCallback } = data;
			const { sensors, rootFilters } = this;
			this.successCallback = successCallback;
			const sensorIds = sensor_ids.length ? sensor_ids : sensors.map(si => si.id);
			const daterangeFinal = daterange.length ? daterange : rootFilters.daterange;

			const payload = {
				plantId: plantId || sensors[0].equipment.plant_id,
				data: {
					sensor_ids: sensorIds,
					...prepareRangeParams(daterangeFinal, {
						dateStartKey: 'date_start',
						dateFinishKey: 'date_end'
					})
				}
			};

			// console.log(payload, rootFilters, daterangeFinal);

			if (!payload.data.date_end) {
				this.$notify({
					type: 'warning',
					message: this.tt(`phrases.select_daterange_first`)
				});
				return;
			}

			/*if (payload) {
				this.pdf_report_requesting = true;				
				this.pdf_report_processing = true;
				console.log(payload)
				return;
			}*/
			this.pdf_report_requesting = true;

			this.$store
				.dispatch('plants/plant_graphs_pdf_report', payload)
				.then(() => {
					this.pdf_report_requesting = false;
					this.pdf_report_processing = true;
					// console.log('processing', this.pdf_report_processing)
					this.createExportWebSocket();
					this.exportingPdfSocketInterval = setInterval(() => this.createExportWebSocket(), 600000);
					// console.log(this.exportingPdfSocketInterval)
					/*this.setupWebSocket({
						socketName: 'compare_pdf_socket',
						socketNameReadyProp: 'compare_pdf_socket_ready',
						socketChannel: this.socketChannelCompareRequest,
						socketCallbackName: 'compare_pdf_socketCallback'
						// resources: this.sensorData.id
					});*/
					// console.log(this.socketChannelCompareRequest)
				})
				.catch(() => {
					this.pdf_report_requesting = false;
				});
		},

		compare_pdf_socketCallback({ type, data }) {
			const safeData = data.data || {};
			// console.log('compare_pdf_socketCallback', type, data)
			if (type == 'REPORT.GRAPHICAL') {
				this.$notify({
					type: 'success',
					title: this.$t('Success')
				});

				this.pdfReportURL = generateUrl({
					path: `plants/${safeData.plant_id}/graphical-comparison-reports/${safeData.id}/pdf`
				});
				// console.log(this.pdfReportURL)

				this.pdf_report_processing = false;

				/*this.handleExportItem({
					url: `plants/${data.plant_id}/graphical-comparison-reports/${data.id}/pdf`
				});*/

				if (this.successCallback) {
					this.successCallback(this.pdfReportURL);
					this.successCallback = null;
				}

				this.resetPdfSocketInterval();
				this.closeWebSocket({ socketName: 'compare_pdf_socket' });
			}
		}
	},

	beforeDestroy() {
		this.resetPdfSocketInterval();
	}
};

export default () => chartsCompareExportMixin;
