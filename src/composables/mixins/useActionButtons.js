// import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus';
import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';

export function useActionButtons({ emit, methodsMap } = {}) {
	const callMethod = (method, payload) => {
		if (methodsMap && typeof methodsMap[method] === 'function') {
			methodsMap[method](payload);
		} else {
			console.warn(`[useActionButtons] Method "${method}" not found`);
		}
	};

	const confirmHelper = (settings = {}) => {
		const messagePostfix =
			Lang.currentLangId == LANGUAGE_TYPES.ENGLISH ? ' Action? Continue?' : '?';
		const message = `${Lang.tt('phrases.Do_you_really_want_to')} ${
			settings.insertToMessage || ''
		}${messagePostfix}`;

		return ElMessageBox({
			title: Lang.tt('Warning'),
			message,
			showCancelButton: true,
			confirmButtonText: settings.confirmButtonText || Lang.tt('Yes'),
			cancelButtonText: settings.cancelButtonText || Lang.tt('Cancel'),
			cancelButtonClass: settings.cancelButtonClass || '',
			distinguishCancelAndClose: settings.distinguishCancelAndClose,
			iconClass: 'icomoon icon-warning',
			type: 'warning',
			dangerouslyUseHTMLString: true,
			...settings,
		});
	};

	const event = (name, data) => {
		if (!emit) return;
		try {
			emit('event', name, data);
		} catch (err) {
			console.error('[useActionButtons] emit error:', err);
		}
	};

	const eventNew = (name, data, onward) => {
		if (!emit) return;
		try {
			emit('event', {
				eventName: name,
				data,
				onward: onward || true,
			});
		} catch (err) {
			console.error('[useActionButtons] emit error:', err);
		}
	};

	return { callMethod, confirmHelper, event, eventNew };
}
