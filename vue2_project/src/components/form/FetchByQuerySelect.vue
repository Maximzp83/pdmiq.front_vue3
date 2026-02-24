<template>
	<CustomSelect
		filterable
		:enabled="!disabled"
		:multiple="multiple"
		:className="`${className} ${enableLoadmore && 'enableLoadmore'}`"
		:disabled="disabled"
		:clearable="clearable"
		:filter-method="q => selectQuery(q)"
		:optionsLoading="optionsLoading"
		:optionsList="optionsList"
		:placeholder="placeholder"
		:labelKey="labelKey"
		:valueKey="valueKey"
		:idKey="idKey"
		@change="handleInput"
		@focus="handleFocus"
		@toggleDropdown="handleToggleDropdown"
		:value="value"
		:setupLabelSettings="setupLabelSettings"
		:setupLabelMethod="setupLabelMethod"
		v-el-select-loadmore="loadmore"
		:prefixIcon="prefixIcon"
	/>
	<!-- @blur="handleBlur" -->
	<!-- @clear="handleClear" -->
</template>

<script>
import { cleanValuesByList, mergeArrays } from '@/helpers';

export default {
	props: {
		clearable: Boolean,
		disabled: Boolean,
		multiple: Boolean,
		required: Boolean,
		optionsLoading: Boolean,
		enableLoadmore: Boolean,
		preventResetOptionsWhenQueryIsCleared: Boolean,

		loadmoreIsActive: { type: Boolean, default: true },
		placeholder: { type: String, default: 'select item' },
		labelKey: { type: String, default: 'name' },
		valueKey: { type: String, default: 'id' },
		idKey: { type: String, default: 'id' },
		// filterMethod: { type: Function, default: undefined },
		value: null,
		className: { type: String, default: '' },
		label: String,
		setupLabelSettings: null,
		setupLabelMethod: { type: Function, default: undefined },
		prefixIcon: String,
		minOptionsToFetch: null,

		optionsList: { type: Array, default: () => [] },
		settings: { type: Object, default: () => ({}) },
		fetchParams: { type: Object, default: () => ({}) }
	},

	directives: {
		'el-select-loadmore': {
			bind(el, binding) {
				const elSelect = el.querySelector('.el-select');
				if (elSelect.classList.contains('enableLoadmore')) {
					const SELECTWRAP_DOM = el.querySelector(
						'.el-select-dropdown .el-select-dropdown__wrap'
					);

					SELECTWRAP_DOM.addEventListener('scroll', function() {
						// console.log('binding', Math.floor(this.scrollHeight) , Math.ceil(this.scrollTop) , this.clientHeight)
						if (
							this.scrollHeight - Math.ceil(this.scrollTop) - 2 <=
							this.clientHeight
						) {
							// console.log('binding')
							binding.value();
						}
					});
				} else {
					return null;
				}
			}
		}
	},

	data() {
		return {
			timer: null,
			query: '',

			nextPage: 1,
			loadmoreIsActiveLocal: false,
			skipLoadmore: false,
			fetchNextTime: false,
			isDropdownOpen: false
		};
	},

	methods: {
		fetchItems({ type, params={} }) {
			try {
				let { fetchAction, setToStore, loading } = this.settings;
				let mergedParams = this.settings.params || {};
				mergedParams = { ...mergedParams, ...params };

				let payload = {
					params: {
						max: 30,
						q: this.query,
						page: this.nextPage,
						...mergedParams
					},
					// setToStore: setToStore,
					loading: loading
				};

				// if (!setToStore) {
				this.$emit('update:optionsLoading', true);
				// }
				// console.log(payload.params)
				this.$store
					.dispatch(fetchAction, payload)
					.then(response => {
						// if (!setToStore)
						this.fetchSuccessHandler({
							type: type,
							response: response,
							setToStore: setToStore
						});

						this.$emit('update:optionsLoading', false);
					})
					.catch(e => {
						// if (!setToStore) {
						this.$emit('update:optionsLoading', false);
						// }
						console.warn(e);
					});
			} catch (e) {
				console.warn(e);
			}
		},

		selectQuery(query) {
			let { minQueryLength, cleanValues, setToStore } = this.settings;
			minQueryLength = minQueryLength || 1;
			// console.log('selectQuery', query)
			this.query = query;
			this.nextPage = 1;
			// this.fetchNextTime = true;
			// this.skipLoadmore = true;

			if (query && query.length >= minQueryLength) {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.timer = setTimeout(() => {
					this.timer = null;

					if (cleanValues) cleanValuesByList(cleanValues, this);
					const params = {max: this.query.length ? -1 : 30};
					// console.log(1, this.query, params)
					this.fetchItems({params});
				}, 700);
			} else {
				if (!setToStore && !this.preventResetOptionsWhenQueryIsCleared) {
					this.$emit('update:optionsList', []);
				}
			}
		},

		handleInput(e) {
			this.$emit('input', e);
			this.$emit('change', e);
			// console.log(!e , this.query)
			if (!e && this.query) {
				this.query = '';
				this.fetchNextTime = true;
				this.loadmoreIsActiveLocal = true;
				this.$emit('update:optionsList', []);
				// this.nextPage = 1;
				// this.fetchItems();
			}
		},

		handleFocus(e) {
			// console.log('focus', e, this.optionsList.length)
			setTimeout(() => {
				this.$emit('focus', e);
			}, 10);
		},

		handleToggleDropdown(open) {
			this.isDropdownOpen = open;
			// if (!this.value) {
			// }
			const minOptionsToFetch = this.minOptionsToFetch || 2;

			if (open) {
				this.optionsList.length < minOptionsToFetch || this.fetchNextTime
					? this.loadmore({ isEmptyList: true })
					: null;

				this.fetchNextTime = false;
			} else {
				this.query = '';
			}
			// this.skipLoadmore = !open;
			// console.log('handleToggleDropdown', open)
		},

		/*handleBlur() {
			if (this.query) {
				// this.query = '';
			}
		},*/

		// ------------Loadmore----------
		loadmore(settings = {}) {
			if (this.optionsLoading) return;
			// console.log('skipLoadmore', this.skipLoadmore, !this.isDropdownOpen)
			if (!this.fetchNextTime && this.skipLoadmore) {
				this.skipLoadmore = false;
			} else {
				if (!this.isDropdownOpen) return;

				if (settings.isEmptyList) {
					this.nextPage = 1;
				}

				if (
					(this.loadmoreIsActiveLocal && this.loadmoreIsActive) ||
					(this.loadmoreIsActive && settings.isEmptyList)
				) {
					this.fetchItems({type:'loadmore'});
				}
			}
		},

		fetchSuccessHandler({ response, setToStore, type }) {
			const { value, fetchedMeta } = response;
			const { current_page, last_page } = fetchedMeta;
			let newList = [];
			if (type == 'loadmore') {
				// console.log(this.optionsList, value)
				newList = mergeArrays(this.optionsList, value, {
					duplicateCheckProp: 'id'
				});
			} else {
				newList = value;
			}

			if (setToStore) {
				this.$store.dispatch(setToStore, newList);
			} else {
				this.$emit('update:optionsList', newList);
			}

			this.nextPage = current_page < last_page ? current_page + 1 : last_page;
			// console.log('fetchSuccessHandler', current_page, last_page)
			this.loadmoreIsActiveLocal = current_page < last_page;
		}
	},

	created() {
		this.loadmoreIsActiveLocal = this.loadmoreIsActive;
	}
};
</script>
