import loc_eng from './loc_eng';
// import { getObjectVal } from '@/helpers';

export const LANGUAGE_TYPES = {
	ENGLISH: 1,
	SPANISH: 2
};

export const languagesList = [
	{ id: LANGUAGE_TYPES.ENGLISH, name: 'English' },
	{ id: LANGUAGE_TYPES.SPANISH, name: 'Spanish' }
];

const localizationLib = {
	[LANGUAGE_TYPES.ENGLISH]: loc_eng,
};

let spanishLanguagePromise;

export const loadLanguage = async (langId) => {
	if (langId === LANGUAGE_TYPES.SPANISH && !localizationLib[langId]) {
		spanishLanguagePromise ||= import('./loc_spanish').then(({ default: language }) => {
			localizationLib[langId] = language;
			return language;
		});

		await spanishLanguagePromise;
	}

	return localizationLib[langId] || loc_eng;
};

const dispatchFile = langId => {
	// console.log(langId)
	return localizationLib[langId] || loc_eng;
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
