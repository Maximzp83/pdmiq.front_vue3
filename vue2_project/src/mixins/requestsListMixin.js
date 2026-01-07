import { getObjectVal, setObjectVal } from '@/helpers';

const requestsListMixin = {
	data: () => ({
		requestsListInitialSetup: true,
		initialSuccessResponsesQuantity: 0,
		initiateRequestsToDoList: true
	}),

	methods: {
		operateRequestsList(list) {
			for (const option of list) {
				this.startFetchAction(option);
			}
		},

		/*operateRequestOption(option) {
			if (option.bindTo) {
				this.setupBindTo(option);
			} else {
				if (!option.blockInitialFetch) {
					this.startFetchAction(option);
				}
			}
		},*/

		startFetchAction(option) {
			if (option.bindTo) {
				this.setupBindTo(option);
			} else {
				if (!option.blockInitialFetch) {
					const {
						action,
						localProp,
						localLoadProp,
						payload,
						callback,
						notFetch
					} = option;

					if (this[action]) {
						let newPayload = { params: { max: -1 } };

						if (payload)
							newPayload = {
								...payload,
								params: { max: -1, ...payload.params }
							};

						if (!notFetch) {
							this.doFetchAction(
								action,
								localProp,
								localLoadProp,
								newPayload,
								callback
							);
						}
					}
				}
			}
		},

		doFetchAction(action, localProp, localLoadProp, payload, callback) {
			if (localLoadProp) this[localLoadProp] = true;
			let isInitial = this.requestsListInitialSetup;
			// console.log('1', isInitial)

			this[action](payload)
				.then(({ value, request_payload, fetchedMeta }) => {
					if (callback) {
						callback({
							actionName: action,
							localProp: localProp,
							data: value,
							fetchedMeta: fetchedMeta
						});
					} else {
						if (!payload.setToStore && !request_payload.setToStore) {
							this[localProp] = value;
						}
					}

					if (localLoadProp) this[localLoadProp] = false;
					// console.log(this.requestsListInitialSetup/*{response, request_payload}*/)
					if (isInitial) {
						this.initialSuccessResponsesQuantity++;
					}
				})
				.catch(() => {
					if (localLoadProp) this[localLoadProp] = false;
				});
		},

		setupBindTo(option) {
			const {
				action,
				localProp,
				localLoadProp,
				bindTo,
				blockInitialFetch,
				initialSetup
			} = option;

			bindTo.forEach((item, idx) => {
				const { prop, alternate_prop } = item;

				const newOption = {
					action: action,
					localProp: localProp,
					localLoadProp: localLoadProp,
					payload: option.payload,
					mergeWith: bindTo.filter(bti => bti.prop !== prop),
					...item
				};

				/*if (action == 'fetch_assets') {
					console.log(item, newOption)
				}*/
				const alternateValue = alternate_prop
					? getObjectVal(this, alternate_prop, { withoutDeep: true })
					: null;

				if (this.requestsListInitialSetup && idx == bindTo.length - 1) {
					if (!blockInitialFetch && !initialSetup) {
						const bindingValue = getObjectVal(this, prop, { withoutDeep: true });
						// console.log('initial', action, item, newOption)
						this.watchHandler(bindingValue || alternateValue, newOption);
					}
				}

				this.$watch(prop, newVal => {
					if (!this.requestsListInitialSetup || idx == bindTo.length - 1) {
						// console.log('$watch',item, newOption, !this.requestsListInitialSetup , idx == bindTo.length - 1)
						this.watchHandler(newVal || alternateValue, newOption);
					}
				});
			});

			if (this.requestsListInitialSetup && initialSetup) {
				const { fetchById } = initialSetup;
				if (fetchById) {
					this.fetchById({ ...fetchById, localLoadProp, localProp });
				}
			}
		},

		watchHandler(value, option) {
			const {
				action,
				localProp,
				localLoadProp,
				withoutClean,
				param,
				clean_prop,
				mergeWith,
				fetchAnyWay,
				noFetch,
				fetchById,
				mainParam,
				disableFetch
			} = option;
			const payload = option.payload || {};

			if (clean_prop && !this.requestsListInitialSetup) {
				// console.log(getObjectVal(this, clean_prop, { withoutDeep: true }))
				getObjectVal(this, clean_prop, { withoutDeep: true }) instanceof Array
					? setObjectVal(this, clean_prop, [])
					: setObjectVal(this, clean_prop, null);
			}

			if (!withoutClean) this[localProp] = [];
			if (disableFetch) return;

			let newPayload = {
				...payload,
				params: {
					...payload.params,
					...this.mergedParams(mergeWith)
				}
			};

			if (param) newPayload.params[param] = value;
			if (mainParam) newPayload[mainParam] = value;
			// if (Object.keys(payload) ) newPayload.payload = value;
			// console.log(newPayload)
			/*if (action == 'fetch_assets') {
				console.log(param, newPayload, value, mergeWith)				
			}*/

			let isFetch;

			if (value instanceof Array) {
				isFetch = value.length > 0 && value[0] !== null;
			} else if (value || fetchAnyWay) {
				isFetch = true;
			} else {
				isFetch = mergeWith.some(mi => {
					if (!mi.noFetch && !mi.disableFetch) {
						const val = newPayload.params[mi.param];
						// console.log(mi, newPayload, val)
						return val instanceof Array
							? value.length > 0 && value[0] !== null
							: !!val;
					}
					return false;
				});

				/*if (action == 'fetch_assets') {
					console.log(2, isFetch)				
				}*/
			}
			// console.log(fetchById)
			if (!noFetch && isFetch) {
				const newOption = {
					action: action,
					localProp: localProp,
					localLoadProp: localLoadProp,
					payload: newPayload
				};
				// console.log('isFetch', newOption)

				this.startFetchAction(newOption);
			} else if (fetchById && fetchById.itemId) {
				this.fetchById({ ...fetchById, localProp, localLoadProp });
			}
		},

		fetchById({ action, itemId, localProp, localLoadProp, payload }) {
			if (localLoadProp) this[localLoadProp] = true;
			payload = payload || {};

			this.$store
				.dispatch(action, { itemId, ...payload })
				.then(response => {
					if (localProp) this[localProp] = response.value ? [response.value] : [];
					if (localLoadProp) this[localLoadProp] = false;
				})
				.catch(() => {
					if (localLoadProp) this[localLoadProp] = false;
				});
		},

		mergedParams(mergeWithItems = []) {
			let result = {};

			mergeWithItems.forEach(obj => {
				const { prop, param } = obj;
				const value = getObjectVal(this, prop, { withoutDeep: true });
				result[param] = value;
			});

			return result;
		}
	},

	watch: {
		initialSuccessResponsesQuantity(q) {
			// console.log(this.requestsToDoList.length, q)
			if (this.initialRequestsListResponsesReadyCallback) {
				if (this.requestsToDoList.length == q) {
					this.initialRequestsListResponsesReadyCallback();
				}
			}
		},

		initiateRequestsToDoList(init) {
			// console.log(init, this.requestsToDoList )
			if (init && this.requestsToDoList) {
				this.operateRequestsList(this.requestsToDoList);

				setTimeout(() => {
					this.requestsListInitialSetup = false;
				}, 50);
			}
		}
	},

	beforeMount() {
		// console.log(this.$watch);
		// console.log(1, 'requestsListMixin', this._data)
		if (this.localBeforeMountRequestsList) this.localBeforeMountRequestsList();

		const { initiateRequestsToDoList, requestsToDoList } = this;

		if (initiateRequestsToDoList && requestsToDoList) {
			this.operateRequestsList(requestsToDoList);
		}
	},

	mounted() {
		setTimeout(() => {
			if (this.initiateRequestsToDoList) {
				this.requestsListInitialSetup = false;
			}
		}, 0);
	}

	/*beforeDestroy() {
		const { initialSetFetchSettings } = this;

		if (initialSetFetchSettings && initialSetFetchSettings.length) {
			this.cleanLists(initialSetFetchSettings);
		}
	}*/
};

export default () => requestsListMixin;
