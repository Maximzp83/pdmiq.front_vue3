<template>
	<CustomSelect
		v-el-select-loadmore="loadmore"
		filterable
		:enabled="!disabled"
		:multiple="multiple"
		:className="`${className} ${enableLoadmore && 'enableLoadmore'}`"
		:disabled="disabled"
		:clearable="clearable"
		:filter-method="(q) => selectQuery(q)"
		:optionsLoading="optionsLoading"
		:optionsList="optionsList"
		:placeholder="placeholder"
		:labelKey="labelKey"
		:valueKey="valueKey"
		:idKey="idKey"
		:value="value"
		:setupLabelSettings="setupLabelSettings"
		:setupLabelMethod="setupLabelMethod"
		:prefixIcon="prefixIcon"
		@change="handleInput"
		@focus="handleFocus"
		@toggleDropdown="handleToggleDropdown"
	/>
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
		value: null,
		className: { type: String, default: '' },
		label: String,
		setupLabelSettings: null,
		setupLabelMethod: { type: Function, default: undefined },
		prefixIcon: String,
		minOptionsToFetch: null,
		optionsList: { type: Array, default: () => [] },
		settings: { type: Object, default: () => ({}) },
		fetchParams: { type: Object, default: () => ({}) },
	},

	directives: {
		elSelectLoadmore: {
			mounted(el, binding) {
				const elSelect = el.querySelector('.el-select');
				if (!elSelect || !elSelect.classList.contains('enableLoadmore')) {
					return;
				}

				const wrap = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
				if (!wrap) return;

				const onScroll = function () {
					if (this.scrollHeight - Math.ceil(this.scrollTop) - 2 <= this.clientHeight) {
						binding.value();
					}
				};

				wrap.addEventListener('scroll', onScroll);
				el.__loadmoreWrap = wrap;
				el.__loadmoreHandler = onScroll;
			},
			unmounted(el) {
				if (el.__loadmoreWrap && el.__loadmoreHandler) {
					el.__loadmoreWrap.removeEventListener('scroll', el.__loadmoreHandler);
				}
			},
		},
	},

	emits: [
		'input',
		'change',
		'focus',
		'update:optionsLoading',
		'update:optionsList',
	],

	data() {
		return {
			timer: null,
			query: '',
			nextPage: 1,
			loadmoreIsActiveLocal: false,
			skipLoadmore: false,
			fetchNextTime: false,
			isDropdownOpen: false,
		};
	},

	methods: {
		fetchItems({ type, params = {} }) {
			try {
				let { fetchAction, setToStore, loading } = this.settings;
				let mergedParams = this.settings.params || {};
				mergedParams = { ...mergedParams, ...params };

				const payload = {
					params: {
						max: 30,
						q: this.query,
						page: this.nextPage,
						...mergedParams,
					},
					loading,
				};

				this.$emit('update:optionsLoading', true);

				const run =
					typeof fetchAction === 'function'
						? fetchAction(payload)
						: this.$store && typeof this.$store.dispatch === 'function'
							? this.$store.dispatch(fetchAction, payload)
							: Promise.reject(new Error('fetchAction is not configured'));

				run
					.then((response) => {
						this.fetchSuccessHandler({
							type,
							response,
							setToStore,
						});
						this.$emit('update:optionsLoading', false);
					})
					.catch((error) => {
						this.$emit('update:optionsLoading', false);
						console.warn(error);
					});
			} catch (error) {
				console.warn(error);
			}
		},

		selectQuery(query) {
			let { minQueryLength, cleanValues, setToStore } = this.settings;
			minQueryLength = minQueryLength || 1;
			this.query = query;
			this.nextPage = 1;

			if (query && query.length >= minQueryLength) {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.timer = setTimeout(() => {
					this.timer = null;

					if (cleanValues) cleanValuesByList(cleanValues, this);
					const params = { max: this.query.length ? -1 : 30 };
					this.fetchItems({ params });
				}, 700);
			} else if (!setToStore && !this.preventResetOptionsWhenQueryIsCleared) {
				this.$emit('update:optionsList', []);
			}
		},

		handleInput(value) {
			this.$emit('input', value);
			this.$emit('change', value);

			if (!value && this.query) {
				this.query = '';
				this.fetchNextTime = true;
				this.loadmoreIsActiveLocal = true;
				this.$emit('update:optionsList', []);
			}
		},

		handleFocus(event) {
			setTimeout(() => {
				this.$emit('focus', event);
			}, 10);
		},

		handleToggleDropdown(open) {
			this.isDropdownOpen = open;
			const minOptionsToFetch = this.minOptionsToFetch || 2;

			if (open) {
				if (this.optionsList.length < minOptionsToFetch || this.fetchNextTime) {
					this.loadmore({ isEmptyList: true });
				}
				this.fetchNextTime = false;
			} else {
				this.query = '';
			}
		},

		loadmore(settings = {}) {
			if (this.optionsLoading) return;

			if (!this.fetchNextTime && this.skipLoadmore) {
				this.skipLoadmore = false;
				return;
			}

			if (!this.isDropdownOpen) return;

			if (settings.isEmptyList) {
				this.nextPage = 1;
			}

			if (
				(this.loadmoreIsActiveLocal && this.loadmoreIsActive) ||
				(this.loadmoreIsActive && settings.isEmptyList)
			) {
				this.fetchItems({ type: 'loadmore' });
			}
		},

		fetchSuccessHandler({ response, setToStore, type }) {
			const { value, fetchedMeta } = response;
			const { current_page: currentPage, last_page: lastPage } = fetchedMeta;
			let newList = [];

			if (type === 'loadmore') {
				newList = mergeArrays(this.optionsList, value, {
					duplicateCheckProp: 'id',
				});
			} else {
				newList = value;
			}

			if (setToStore && this.$store && typeof this.$store.dispatch === 'function') {
				this.$store.dispatch(setToStore, newList);
			} else {
				this.$emit('update:optionsList', newList);
			}

			this.nextPage = currentPage < lastPage ? currentPage + 1 : lastPage;
			this.loadmoreIsActiveLocal = currentPage < lastPage;
		},
	},

	created() {
		this.loadmoreIsActiveLocal = this.loadmoreIsActive;
	},
};
</script>
