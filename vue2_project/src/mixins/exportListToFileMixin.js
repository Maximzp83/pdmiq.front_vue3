import { generateUrl } from '@/services/api/api_helpers';
// import axios from '@/services/api/axiosService';
import { prepareRangeParams } from '@/helpers';

const exportListToFileMixin = {
	data() {
		return {
			exportingInProgress: false,

			// export_daterange: '',
			showExportDateRangeFilter: false
		};
	},

	computed: {
		access_token: that => that.$store.state.auth.access_token
	},

	methods: {
		/*handleExportList({ path, filters, skipDaterange }) {
			let newFilters = {
				...filters,
				max: -1,
				page: null
			};
			this.handleExportItem({ url: path, filters: newFilters, settings: { skipDaterange } });
		},*/

		handleExportItem({ url, filters, skipDaterange }) {
			let newFilters = { ...filters };
			if (
				!skipDaterange &&
				(!newFilters.daterange || !newFilters.daterange.length)
			) {
				this.$notify({
					type: 'warning',
					// title: "",
					message: this.tt(`phrases.select_daterange_first`)
				});
				return;
			}

			if (this.prepareFilters) {
				newFilters = this.prepareFilters(newFilters);
			} else if (newFilters.daterange) {
				if (newFilters.daterange.length) {
					newFilters = {
						...newFilters,
						...prepareRangeParams(newFilters.daterange)
					};
					delete newFilters.daterange;
				}
			}

			// console.log(1, newFilters)
			const finalUrl = generateUrl({ path: url, filters: newFilters });
			// console.log(2, finalUrl)

			this.generateDownloadLink(finalUrl);
		},

		generateDownloadLink(url) {
			const link = document.createElement('a');
			link.href = url;
			link.target = '_blank';

			link.click();
		}
	}
};

export default () => exportListToFileMixin;
