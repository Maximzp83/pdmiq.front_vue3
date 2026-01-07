<template>
	<div class="custom-select">
		<SimpleSpinner :active="optionsLoading" />
		<i v-if="prefixIcon" :class="['input-prefix', prefixIcon]"></i>
		<span v-if="prefixText" class="input-prefix prefix-text">{{ prefixText }}</span>

		<el-select
			:class="[
				{ 'multiple-select': multiple },
				className,
				{ 'has-prefix': prefixIcon },
				{ 'collapse-tags': collapseTags },
				{ mini: mini }
			]"
			@visible-change="handleToggleDropdown"
			:disabled="!enabled && (!optionsList.length || disabled)"
			:filterable="filterable"
			:clearable="clearable"
			:required="required"
			:multiple="multiple"
			:multiple-limit="multipleLimit"
			:filter-method="filterMethod"
			:placeholder="placeholder"
			@change="handleInput"
			:value="value"
			@focus="handleFocus"
			@blur="handleBlur"
			:collapse-tags="collapseTags"
		>
			<el-option
				:class="optionClassName"
				v-for="item in filteredList"
				:key="'select_id-' + item[idKey]"
				:value="item[valueKey]"
				:label="useHtml ? getLabel(item).label : getLabel(item)"
			>
				<div v-if="useHtml" v-html="getLabel(item).html"></div>
			</el-option>
		</el-select>
	</div>
</template>

<script>
import { setupLabel, findItemBy } from '@/helpers';

export default {
	props: {
		filterable: Boolean,
		clearable: Boolean,
		disabled: Boolean,
		multiple: Boolean,
		required: Boolean,
		optionsLoading: Boolean,
		enabled: Boolean,
		mini: Boolean,
		collapseTags: Boolean,
		prefixIcon: String,
		prefixText: String,
		optionClassName: { type: String, default: '' },

		placeholder: { type: String, default: 'select item' },
		labelKey: { type: String, default: 'name' },
		valueKey: { type: String, default: 'id' },
		idKey: { type: String, default: 'id' },
		filterMethod: { type: Function, default: undefined },
		value: null,
		className: { type: String, default: '' },
		label: String,
		setupLabelSettings: null,
		setupLabelMethod: { type: Function, default: undefined },
		useHtml: Boolean,
		multipleLimit: { type: Number, default: undefined },

		optionsList: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			// content: this.value
			isDropdownActive: false
		};
	},

	computed: {
		filteredList() {
			return Object.freeze(this.getFilteredList());
		}
	},

	methods: {
		handleToggleDropdown(val) {
			this.isDropdownActive = val;
			this.$emit('toggleDropdown', val);
		},

		getLabel(item /*isOption*/) {
			if (this.setupLabelSettings) {
				return setupLabel(item, this.setupLabelSettings);
			}
			if (/*isOption &&*/ this.setupLabelMethod) {
				return this.setupLabelMethod(item);
			}
			// if (this.label) return this.label;
			// console.log('1', item, this.labelKey, this.label || item[this.labelKey])
			return this.label || item[this.labelKey];
		},

		handleInput(e) {
			this.$emit('input', e);
			this.$emit('change', e);
		},

		handleFocus(e) {
			this.$emit('focus', e);
		},
		handleBlur(e) {
			this.$emit('blur', e);
		},

		getFilteredList() {
			const { value } = this;
			const origList = this.optionsList;
			if (origList.length) {
				if (this.isDropdownActive) {
					return origList;
				} else {
					if (value) {
						// console.log(origList)
						if (value instanceof Array) {
							let list = [];
							for (let i = 0; i < value.length; i++) {
								const item = findItemBy('id', value[i], origList);
								if (item) list.push(item);
							}
							return list;
						} else return origList.filter(pi => pi.id === value);
					} else {
						return [origList[0]];
					}
				}
			}
			return [];
		}
	}
};
</script>
