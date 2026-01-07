import { setFiltersViaList } from '@/helpers/specialHelpers';

const itemCardMixin = {
	props: {
		cardData: { type: Object, required: true },
		operationsSettings: { type: Object, default: () => ({}) },
		selectedIds: { type: Array, default: () => [] },
		additionalProps: { type: Object, default: () => ({}) }
	},

	/*computed: {
		// getCellValue: () => getCellValue,
		// getObjectVal: () => getObjectVal
	},*/

	methods: {
		togglePreviewModal() {
			const { pictures, full_file_name } = this.cardData;
			const list = pictures || [
				{
					id: full_file_name,
					full_file_name: full_file_name
				}
			];
			const id = list[0].id;

			const payload = {
				eventName: 'togglePreviewModal',
				data: {
					picturesList: list,
					pictureId: id
				},
				onward: true
			};
			this.$emit('event', payload);
		},

		setFiltersViaList(payload) {
			return setFiltersViaList(payload);
		},

		handleTitleClick() {
			this.changeRoute({ path: this.titleLinkRoute });
			if (this.resetPageFiltersList) {
				this.setFiltersViaList(this.resetPageFiltersList);
			}
		}
		/*handleSelectionChange(id) {
			this.$emit('event', 'handleSelectionChange', id );
		}*/
	}

	// beforeMount() {}
};

export default () => itemCardMixin;
