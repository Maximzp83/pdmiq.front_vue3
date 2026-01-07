import { toggleHeightBlock } from '@/helpers/specialHelpers';

const formOperationsInItemsListMixin = {
	methods: {
		closeCreateForm() {
			this.openCreateForm = false;
		},

		handleCreateItem() {
			this.openCreateForm = true;
		},

		closeFormFields() {
			this.$refs.ItemsTableContainer.activeRowIdx = null;
			this.openCreateForm = false;
		},

		handleSubmitForm(data) {
			// console.log(data)
			const payload = { data: data };
			this.save_item(payload).then(() => {
				this.fetchItems({ ...this.filters, ...this.globalFilters });
				this.closeFormFields();
			});
		},

		blockReady(payload) {
			this.collectedData.push(payload);
		},

		clearCollectedData() {
			this.collectedData = [];
		},

		setupPayload(dataArr) {
			let data = {};
			if (dataArr.length) {
				data.id = dataArr[0].itemId;

				for (let item of dataArr) {
					data = { ...data, ...item.data };
				}
			}
			// console.log(data)
			return data;
		}
	},

	watch: {
		openCreateForm(open) {
			this.$nextTick().then(() => {
				const target = document.getElementById('createItemForm');
				toggleHeightBlock(open, target);
			});
		},

		collectedData(dataArr) {
			if (Object.keys(dataArr).length == this.tableSettings.columns.length) {
				const isValid = dataArr.every(o => o.isValid);

				if (isValid) {
					let payload = this.setupPayload(dataArr);
					this.handleSubmitForm(payload);
				} else {
					setTimeout(() => {
						this.$notify({
							type: 'warning',
							title: this.tt('phrases.Validation_error'),
							message: this.tt('phrases.check_form_fields'),
							duration: 0
						});
					}, 10);
				}
			}
		}
	}
};

export default () => formOperationsInItemsListMixin;
