<template>
	<component :is="tag" v-if="hasValue">
		<span
			v-if="labelPosition == 'inline'"
			:class="['key', labelClassName]"
			v-html="label"
		></span>
		<div v-else :class="['key', labelClassName]" v-html="label"></div>

		<span v-if="settingItem.prefix_icon" class="content-with-prefix">
			<i :class="['prefix icon', settingItem.prefix_icon]" />

			<span :class="['value', valueClassName]" v-html="value"></span>
		</span>

		<span
			v-else-if="settingItem.event"
			@click="e => executeEvent(e)"
			:class="['value', valueClassName]"
			v-html="value"
		></span>
		<span v-else :class="['value', valueClassName]" v-html="value"></span>
	</component>
	<!-- <component :is="tag" v-else> -->
	<!-- <span v-else class="value">-</span> -->
</template>

<script>
// import { equipmentCardTitle } from '@/helpers/specialHelpers';
import { getCellValue, validateBySettings } from '@/helpers';

export default {
	props: {
		itemData: { type: Object, default: () => ({}) },
		settingItem: { type: Object, required: true },
		labelClassName: String,
		valueClassName: String,
		keyProp: { type: String, default: 'label' },
		valueProp: null,
		valueMethod: Function,
		labelMethod: Function,
		labelDisabled: Boolean,
		labelPosition: { type: String, default: 'inline' },
		tag: { type: String, default: 'li' },
		emptyText: String
	},

	computed: {
		label() {
			const { labelMethod, keyProp, settingItem, itemData } = this;
			if (labelMethod) {
				return `${labelMethod(settingItem, itemData)}: `;
			}

			if (!this.labelDisabled) {
				return `${settingItem[keyProp]}: `;
			}
			// console.log(valueMethod, settingItem)
			return '';
		},

		value() {
			const { valueMethod, valueProp, settingItem, itemData, emptyText } = this;
			let settingItemCopy = { ...settingItem };

			if (emptyText) {
				settingItemCopy.meta = settingItemCopy.meta || {};
				settingItemCopy = {
					...settingItemCopy,
					meta: {
						...settingItemCopy.meta,
						emptyText: emptyText
					}
				};
			}

			if (settingItemCopy.value) {
				const getValue = settingItemCopy.predefinedValue ? false : true;

				if (getValue) {
					return getCellValue(settingItemCopy.value, settingItemCopy);
				} else {
					return settingItemCopy.value;
				}
			}

			if (valueMethod) {
				return valueMethod(settingItemCopy, itemData);
			}

			if (valueProp) {
				return settingItemCopy[valueProp];
			}
			// console.log(valueMethod, settingItemCopy)
			return getCellValue(itemData, settingItemCopy);
		},

		hasValue() {
			const { value, itemData, settingItem } = this;

			if (settingItem.conditionSettings) {
				return validateBySettings({
					...settingItem.conditionSettings,
					// data_value: value,
					dataObj: itemData
				});
			}
			// console.log(value)
			return (!!value || value === 0) && value !== ' ';
		}
	},

	methods: {
		executeEvent(e) {
			const { itemData, settingItem } = this;
			const data = {
				...settingItem,
				row: itemData,
				native_event: e
				// payload: payload
			};

			// console.log(name)

			// if (this.validateOnClickSettings(row, onClickSettings)) {
			this.$emit('event', {
				eventName: settingItem.event.name,
				data: data,
				onward: true
			});
			// }
		}
	}
};
</script>
