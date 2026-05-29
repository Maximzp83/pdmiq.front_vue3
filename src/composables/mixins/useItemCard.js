import { setFiltersViaList } from '@/helpers/specialHelpers';

export const buildProps = (extra = {}) => ({
	cardData: { type: Object, default: () => ({}) },
	selectedIds: { type: Array, default: () => [] },
	operationsSettings: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	...extra,
});

export function useItemCard({ cardData, changeRoute, titleLinkRoute, resetPageFiltersList, emit } = {}) {
	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const togglePreviewModal = () => {
		const data = resolve(cardData);
		const { pictures, full_file_name } = data || {};
		const list =
			pictures || [
				{
					id: full_file_name,
					full_file_name,
				},
			];
		const id = list[0]?.id;

		const payload = {
			eventName: 'togglePreviewModal',
			data: {
				picturesList: list,
				pictureId: id,
			},
			onward: true,
		};
		if (emit) emit('event', payload);
	};

	const handleTitleClick = () => {
		if (changeRoute) changeRoute({ path: resolve(titleLinkRoute) });
		if (resetPageFiltersList) {
			setFiltersViaList(resetPageFiltersList);
		}
	};

	return { togglePreviewModal, handleTitleClick };
}
