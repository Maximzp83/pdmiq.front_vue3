import { ref } from 'vue';
import { generateUrl } from '@/utils/url-helpers';
import { prepareRangeParams } from '@/helpers';
import { useNotify } from '@/composables/useNotify';
import { Lang } from '@/localization';

export function useExportListToFile({ prepareFilters } = {}) {
	const { Notify } = useNotify();
	const exportingInProgress = ref(false);
	const showExportDateRangeFilter = ref(false);

	const handleExportItem = ({ url, filters, skipDaterange, prepareFilters: localPrepare }) => {
		let newFilters = { ...filters };

		if (!skipDaterange && (!newFilters.daterange || !newFilters.daterange.length)) {
			Notify({
				type: 'warning',
				message: Lang.tt('phrases.select_daterange_first'),
			});
			return;
		}

		const effectivePrepare = localPrepare || prepareFilters;
		if (effectivePrepare) {
			newFilters = effectivePrepare(newFilters);
		} else if (newFilters.daterange && newFilters.daterange.length) {
			newFilters = {
				...newFilters,
				...prepareRangeParams(newFilters.daterange),
			};
			delete newFilters.daterange;
		}

		const finalUrl = generateUrl({ path: url, filters: newFilters });
		// console.log(finalUrl);
		generateDownloadLink(finalUrl);
	};

	const generateDownloadLink = (url) => {
		const link = document.createElement('a');
		link.href = url;
		link.target = '_blank';
		link.click();
	};

	return {
		exportingInProgress,
		showExportDateRangeFilter,
		handleExportItem,
		generateDownloadLink,
	};
}
