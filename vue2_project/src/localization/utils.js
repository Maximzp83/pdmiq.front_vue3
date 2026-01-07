import loc_eng from './loc_eng';
import loc_spanish from './loc_spanish';
// import { getObjectVal } from '@/helpers';

export const LANGUAGE_TYPES = {
	ENGLISH: 1,
	SPANISH: 2
};

export const languagesList = [
	{ id: LANGUAGE_TYPES.ENGLISH, name: 'English' },
	{ id: LANGUAGE_TYPES.SPANISH, name: 'Spanish' }
];

const localization_lib = {
	[LANGUAGE_TYPES.ENGLISH]: () => loc_eng,
	[LANGUAGE_TYPES.SPANISH]: () => loc_spanish
};

const dispatchFile = langId => {
	// console.log(langId)
	return langId ? localization_lib[langId]() : {};
};

export const getText = (langId, accessor) => {
	if (accessor) {
		const parts = accessor.toLowerCase().split('.');
		let result = '';
		if (parts.length == 2) {
			result = dispatchFile(langId)[parts[0]][parts[1]];
		} else if (parts.length == 1) {
			result = dispatchFile(langId)['common'][parts[0]];
		} else {
			return '';
		}

		// accessor = accessor.toLowerCase();

		// return getObjectVal(dispatchFile(langId), accessor.toLowerCase()) || accessor;
		return result || `${accessor} - text missing`;
	}
	return;
};
