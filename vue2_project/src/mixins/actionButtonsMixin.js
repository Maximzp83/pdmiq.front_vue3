import { LANGUAGE_TYPES } from '@/localization/utils';

const actionButtonsMixin = {
	computed: {
		// LANGUAGE_TYPES: () => LANGUAGE_TYPES,
	},

	methods: {
		callMethod(method, payload) {
			if (this[method]) {
				this[method](payload);
			}
		},

		confirmHelper(settings) {
			return new Promise((resolve, reject) => {
				const { tt, $Lang } = this;
				const messagePostfix =
					$Lang.currentLangId == LANGUAGE_TYPES.ENGLISH ? ' Action? Continue?' : '?';
				this.$confirm({
					title: tt('Warning'),
					message: `${tt('phrases.Do_you_really_want_to')} ${
						settings.insertToMessage
					}${messagePostfix}`,
					showCancelButton: true,
					confirmButtonText: settings.confirmButtonText || tt('Yes'),
					cancelButtonText: settings.cancelButtonText || tt('Cancel'),
					cancelButtonClass: settings.cancelButtonClass || '',
					distinguishCancelAndClose: settings.distinguishCancelAndClose,
					iconClass: 'icomoon icon-warning',
					type: 'warning',
					dangerouslyUseHTMLString: true,
					...settings
				})
					.then(() => {
						resolve();
					})
					.catch(e => {
						reject(e);
					});
			});
		},

		event(name, data) {
			this.$emit('event', name, data);
		},

		eventNew(name, data, onward) {
			this.$emit('event', {
				eventName: name,
				data: data,
				onward: onward || true
			});
		}
	}
};

export default () => actionButtonsMixin;
