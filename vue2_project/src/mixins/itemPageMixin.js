import { checkUploadSettings } from '@/helpers/specialHelpers';

const itemPageMixin = {
	data: () => ({
		itemSaving: false
	}),

	computed: {
		authUser() {
			return this.$store.state.auth.authUser;
		}
	},

	methods: {
		handleSaveItem() {
			this.$refs.ItemFormComponent.validateForm();
		},

		handleSubmitForm(data) {
			let payload = {
				data: data,
				itemName: this.itemsName ? this.itemsName.one : ''
			};

			if (this.uploadSettings) {
				payload = checkUploadSettings(payload, this.uploadSettings);
			}

			if (this.preparePayload) {
				payload = this.preparePayload(payload);
			}

			/*if (process.env.NODE_ENV === 'development') {
				if (payload) {
					console.log(payload);
					return;
				}
			}*/

			if (this.localSubmit) {
				this.localSubmit(payload);
			} else {
				this.itemSaving = true;

				this.save_item(payload)
					.then(answer => {
						// const { data, updateRoute } = answer;
						this.changeRoute({ parent: true });

						if (this.successSubmitCallback) {
							this.successSubmitCallback(answer);
						}

						if (!answer.request_payload && !answer.request_payload.setToStore) {
							this.itemData = answer.data;
						}
						this.itemSaving = false;

						/*if (updateRoute) {
						// console.log(data)
						if (data && data.data.id) {
							this.changeRoute({ parent: true });
						}
					}*/
					})
					.catch(() => {
						this.itemSaving = false;
					});
			}
		},

		handleCloseButton() {
			/*if (this.authUser.type === USER_TYPES.PLANT_USER) {
				this.changeRoute({ path: '/dashboard' });
			} else {*/
			this.changeRoute({ history: true, steps: -1 });
			// this.changeRoute({ parent: true });
			// }
		}
	}
};

export default () => itemPageMixin;
