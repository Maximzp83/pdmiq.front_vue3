// import { findItemBy } from '@/helpers';
import uniqid from 'uniqid';

const createFormItemMixin = {
	/*data() {
		return {
			// formItemsList: []
		};
	},*/

	computed: {
		validateSubItems: () => true
	},

	methods: {
		setupFormSubItemsList(dataList, uniqidPrefix) {
			const itemsList = [];
			// console.log(dataList)
			for (const item of dataList || []) {
				// console.log(item, typeof item)
				if (typeof item != 'object') {
					itemsList.push({ value: item, id: uniqid(`${uniqidPrefix}-`) });
				} else if (item) {
					itemsList.push({ ...item, id: item.id || uniqid(`${uniqidPrefix}-`) });
				}
			}
			// console.log(itemsList)
			return itemsList;
		},

		addFormItem(prop, uniqPrefix, settings = {}) {
			let { unshift, formData, focus } = settings;
			formData = formData || {};
			const method = unshift ? 'unshift' : 'push';
			// console.log(settings, formData)
			let newItem = {
				id: uniqid(uniqPrefix),
				new: true,
				focus: focus,
				...formData
			};
			// console.log(2, this, prop, this[prop], newItem)
			this[prop][method](newItem);
		},

		removeFormItem(id, listName) {
			this[listName] = this[listName].filter(o => o.id !== id);
		}
	}
};

export default () => createFormItemMixin;
