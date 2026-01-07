import uniqid from 'uniqid';
import { validateBySettings, /*cloneDeep*/ } from '@/helpers';
import isEmpty from 'lodash/isEmpty';

const subItemsListMixin = {
	methods: {
		// ----Create/Remove Sub Items------
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

			// console.log(2, prop, this[prop], newItem)
			this[prop][method](newItem);
			// this.refsUpdate++;
		},

		removeFormItem(id, listName) {
			this[listName] = this[listName].filter(o => o.id !== id);
			// this.refsUpdate++;
		},

		// ----Sub Items Form Operations------
		updateDataByRef({ Instance, settingsItem, collectedData }) {
			let {conditionSettings, callback, destructure, setIfEmpty, cleanIfEmpty} = settingsItem;
			const context = {
				collectedValue: Instance.getFormData(),
				settings: settingsItem,
				formData: this.formData,
				collectedData
			};

			let steps = [];
			if (conditionSettings) steps.push(this.applyCondition);
			if (callback) steps.push(this.applyCallback);
			if (destructure) {steps.push(this.applyDestructure);}
			steps.push(this.applyDataUpdate);
			if (setIfEmpty || cleanIfEmpty) steps.push(this.applyFlags);

			return this.runPipeline(steps, context);
		},

		runPipeline(steps, context) {
			for (const step of steps) {
				const collectedData = step(context);
				if (collectedData?.stop) break;
			}
			return context.collectedData;
		},

		applyCondition(context) {
			const { conditionSettings } = context.settings;
			const passed = validateBySettings({
				...conditionSettings,
				dataObj: context.collectedValue
			});
			if (!passed) return { stop: true };
		},

		applyCallback(context) {
			const { callback, payload } = context.settings;
			context.collectedData = callback(payload);
			return { stop: true };
		},

		applyDestructure(context) {
			context.collectedValue = this.destructure(context.collectedValue);
		},

		applyDataUpdate(context) {
			let { targetProp, returnArray, concatData, skipReturnData } = context.settings;
			let { collectedValue, collectedData, formData } = context;

			if (skipReturnData) return;
			
			if (returnArray) {
				// debugger
				const key = targetProp || 'result';
				collectedData[key] = collectedData[key] || [];
				if (concatData) {
					collectedData[key] = collectedData[key].concat(collectedValue);
				} else {
					collectedData[key].push(collectedValue);					
				}
				return;
			}

			if (!targetProp) {
				// Плоское слияние
				let list = Array.isArray(collectedValue) ? collectedValue : [collectedValue];
				list.forEach(item => Object.assign(collectedData, item));
				return;
			}

			// Если в formData поле — массив
			if ( Array.isArray(formData?.[targetProp]) ) {
				collectedData[targetProp] = collectedData[targetProp] || [];
				if (Array.isArray(collectedValue)) {
					collectedData[targetProp] = (collectedData[targetProp] || []).concat(collectedValue);
				} else {
					collectedData[targetProp].push(collectedValue);
				}
			} else {
				collectedData[targetProp] = collectedValue;
			}
		},

		applyFlags(context) {
			// console.log('applyFlags', context)
			let { setIfEmpty, cleanIfEmpty, targetProp } = context.settings;
			let target = targetProp ? context.collectedData[targetProp] : context.collectedValue;
			let hasNoValue = !target || (Array.isArray(target) && target.length === 0) || isEmpty(target);

			if (setIfEmpty) {
				context.collectedData[setIfEmpty.prop] = hasNoValue ? setIfEmpty.val : !setIfEmpty.val;
			}

			if (hasNoValue && cleanIfEmpty) {
				context.collectedData[cleanIfEmpty.prop] = cleanIfEmpty.val;
			}
		},

		destructure(val) {
			let finalValue = val instanceof Array ? val[0] : val;

			if (finalValue instanceof Array) {
				finalValue = this.destructure(finalValue);
			}
			return finalValue;
		},

		validateSubItemsForm(subItemsSettings) {
			let validationResults = [];
			subItemsSettings.forEach(settingsItem => {
				this.operateRefs({
					settingsItem,
					operation: Instance => { 
						if (Instance.validateItemForm) {
							validationResults.push(Instance.validateItemForm(settingsItem));
						}
					},
				})
			});
			// console.log('validateSubItemsForm', validationResults, this)
			return validationResults.every(item => item);			
		},

		resetFormDataBySubItems(subItemsSettings) {
			subItemsSettings.forEach(settingsItem => {
				if (settingsItem.targetProp && !settingsItem.keepOriginalData) {
					if (this.formData) {
						if (this.formData[settingsItem.targetProp] instanceof Array) {
							/*if (settingsItem.targetProp == 'type_medias' && this.formData[settingsItem.targetProp].length) {
								// debugger
							}*/
							this.formData[settingsItem.targetProp] = [];
						} else {
							this.formData[settingsItem.targetProp] = null;
						}
					}
				}
			});
		},

		collectDataFromSubItems(subItemsSettings, options = {}) {
			let collectedData = {};

			subItemsSettings.forEach(settingsItem => {
				this.operateRefs({
					settingsItem,
					operation: Instance => {
						if (settingsItem.submitInSubItem) {
							Instance.submitItemForm({settingsItem, options});
						} else if (settingsItem.localSubmitMethod) {
							Instance[settingsItem.localSubmitMethod]({ options, collectedData, settingsItem });
						} else {
							collectedData = this.updateDataByRef({ Instance, options, collectedData, settingsItem });
						}
					},
				})
				
				if (settingsItem.onCollect) {
					settingsItem.onCollect({settingsItem, collectedData});
				}
			});

			// console.log('collectedData', this, collectedData)
			return collectedData;
		},

		operateRefs({ settingsItem, operation }) {
			let refsList = this.$refs[settingsItem.ref];
			// console.log('operateRefs', refsList, settingsItem)
			if (refsList) {
				refsList = refsList instanceof Array ? refsList : [refsList];
				refsList.forEach(Instance => { operation(Instance); });
			} else {
				// console.warn(`Ref ${settingsItem.ref} not found`);
			}
		}
	},
};

export default () => subItemsListMixin;
