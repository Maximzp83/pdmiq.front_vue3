import { ref } from 'vue';
import { useNotify } from '@/composables/useNotify';
import { Lang } from '@/localization';

export function useImport({ emit, currentLogId, successImportCallback } = {}) {
	const { Notify } = useNotify();
	const importProgress = ref(0);
	const importProgressInterval = ref(null);
	const importProgressTimer = ref(0);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const getImportProgress = ({ logId, progressAction }) => {
		const ping = () => {
			importProgressTimer.value += 1000;

			progressAction({ itemId: logId }).then((data) => {
				if (data) {
					const { progress } = data.value;
					if (emit) {
						emit('event', {
							eventName: 'handleImportProgress',
							data: +progress * 100,
						});
					}

					if (+progress === 1) {
						resetProgressInterval();
						setTimeout(() => {
							if (emit) {
								emit('event', {
									eventName: 'handleImportSuccess',
									data: { notNotify: !!successImportCallback },
								});
							}
							if (successImportCallback) {
								successImportCallback({ data, logId });
							}
						}, 400);
					}
				}
			});
		};

		importProgressInterval.value = setInterval(ping, 1000);
	};

	const onRevert = (revertAction) => {
		resetProgressInterval();

		if (emit) {
			emit('event', {
				eventName: 'handleImportReverting',
				data: true,
			});
		}

		revertAction({ itemId: resolve(currentLogId) })
			.then(() => {
				if (emit) {
					emit('event', { eventName: 'setCurrentLog', data: null });
					emit('event', {
						eventName: 'handleImportRevertingSuccess',
						data: false,
					});
				}
			})
			.catch((error) => {
				console.warn(error);
				if (emit) {
					emit('event', {
						eventName: 'handleImportReverting',
						data: false,
					});
				}
				Notify({
					type: 'error',
					message: Lang.tt('phrases.reverting_attempt_unsuccessfull'),
				});
			});
	};

	const resetProgressInterval = () => {
		clearInterval(importProgressInterval.value);
		importProgressInterval.value = null;
		importProgressTimer.value = 0;
	};

	return {
		importProgress,
		importProgressInterval,
		importProgressTimer,
		getImportProgress,
		onRevert,
		resetProgressInterval,
	};
}
