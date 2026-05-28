const RebaselineRequestMixin = {
	methods: {
		click_re_baseline() {
			const { tt } = this;
			const isRebaseline = this.sensorData.is_re_baseline_process;
			this.confirmHelper({
				message: `${tt('phrases.Do_you_really_want_to')}  <b>${
					isRebaseline ? tt('disable') + ' ' + tt('re_baseline') : tt('re_baseline')
				} </b>? ${tt('Continue')}?`,
				confirmButtonText: tt('Confirm')
			})
				.then(() => {
					this.submitRe_baseline();
				})
				.catch(() => {
					//
				});
		},

		submitRe_baseline() {
			const { tt } = this;
			const { id, is_re_baseline_process } = this.sensorData;

			const payload = {
				itemId: id,
				data: {
					enable: is_re_baseline_process ? 0 : 1
				},
				resultMessage: {
					text: `${tt('re_baseline')} ${
						is_re_baseline_process ? tt('disabled') : tt('performed')
					}`
				}
			};

			this.rebaselineLoading = true;
			// console.log(payload)
			this.sensor_rebase_line(payload).then(() => {
				this.event('initSensors');
				setTimeout(() => {
					this.rebaselineLoading = true;
				}, 1000);
			});
		}
	},

};

export default () => RebaselineRequestMixin;
