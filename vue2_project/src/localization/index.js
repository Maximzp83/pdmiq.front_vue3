// import { storeGetter } from '@/store';
import { findItemBy } from '@/helpers';
import { getText, languagesList } from './utils.js';

const translate = (data, method, currentLangId, settings) => {
	if (data instanceof Array) {
		return data.map(di => {
			if (di.skipTranslate) return di;
			let key = '';
			if (settings.key) key = settings.key;
			else if (di.label) key = 'label';
			else if (di.name) key = 'name';
			else if (di.title) key = 'title';
			// console.log(key, di[key])
			if (di[key]) {
				return { ...di, [key]: method(di[key], currentLangId) };
			}
			return di;
		});
	} else if (typeof data === 'object') {
		let key = '';
		// debugger
		if (settings.key) key = settings.key;
		else if (data.label) key = 'label';
		else if (data.name) key = 'name';
		else if (data.title) key = 'title';

		if (key) {
			data[key] = method(data[key], currentLangId);
			return data;
		}
	}
	return data;
};

// ==========================
class Lang1 {
	constructor() {
		this.currentLangId = 1;
	}

	tt(accessor, currentLangId) {
		// console.log(accessor, this)
		return getText(currentLangId || this.currentLangId, accessor);
	}

	translate(data, settings = {}) {
		return translate(data, this.tt, this.currentLangId, settings);
	}

	set(id) {
		this.currentLangId = id;
	}
	current() {
		return findItemBy('id', this.currentLangId, languagesList);
	}
}

const LangInstance = new Lang1();
export const Lang = LangInstance;
