import { setFiltersViaList } from '@/helpers/specialHelpers';
import { useNavigation } from '@/composables/mixins/useNavigation';

export const buildProps = (extra = {}) => ({
	cardData: { type: Object, default: () => ({}) },
	selectedIds: { type: Array, default: () => [] },
	operationsSettings: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	...extra,
});

export function useItemCard({ cardData, changeRoute, titleLinkRoute, resetPageFiltersList, emit } = {}) {
	const { changeRoute: defaultChangeRoute } = useNavigation();
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
		const navigate = changeRoute || defaultChangeRoute;
		if (navigate) navigate({ path: resolve(titleLinkRoute) });
		if (resetPageFiltersList) {
			try {
				setFiltersViaList(resolve(resetPageFiltersList));
			} catch (error) {
				console.warn('[useItemCard] resetPageFiltersList is not available in the current store setup', error);
			}
		}
	};

	return { togglePreviewModal, handleTitleClick };
}
