// import { getParentPageRoute } from '@/helpers';

const importMixin = {
	props: {
		uploadedFileName: String,
		currentLogId: null
	},

	data() {
		return {
			importProgress: 0,
			importProgressInterval: null,
			importProgressTimer: 0
		};
	},

	methods: {
		getImportProgress({ logId, progressAction }) {
			const ping = () => {
				this.importProgressTimer += 1000;

				this[progressAction]({ itemId: logId }).then(data => {
					// console.log('progress response', data)
					if (data) {
						const { progress } = data.value;
						this.$emit('event', {
							eventName: 'handleImportProgress',
							data: +progress * 100
						});

						if (+progress == 1) {
							this.resetProgressInterval();
							setTimeout(() => {
								this.$emit('event', {
									eventName: 'handleImportSuccess',
									data: { notNotify: !!this.successImportCallback }
									// data: data.request_payload
								});
								if (this.successImportCallback) {
									this.successImportCallback({ data, logId });
								}
							}, 400);
						}
					}
				});
			};

			this.importProgressInterval = setInterval(ping, 1000);

			/*setTimeout(() => {
				this.onRevert()
			}, 3000);*/
		},

		onRevert(revertAction) {
			this.resetProgressInterval();

			this.$emit('event', {
				eventName: 'handleImportReverting',
				data: true
			});

			this[revertAction]({
				itemId: this.currentLogId
			})
				.then(() => {
					this.$emit('event', { eventName: 'setCurrentLog', data: null });

					/*this.$emit('event', {
					eventName: 'clearImportData',
				});*/
					this.$emit('event', {
						eventName: 'handleImportRevertingSuccess',
						data: false
					});
				})
				.catch(error => {
					console.warn(error);
					this.$emit('event', {
						eventName: 'handleImportReverting',
						data: false
					});

					this.$notify({
						type: 'error',
						message: this.tt(`phrases.reverting_attempt_unsuccessfull`)
					});
				});
		},

		resetProgressInterval() {
			clearInterval(this.importProgressInterval);
			// console.log('revert', this.importProgressTimer);
			this.importProgressInterval = null;
			this.importProgressTimer = 0;
		}
	}
};

export default () => importMixin;
