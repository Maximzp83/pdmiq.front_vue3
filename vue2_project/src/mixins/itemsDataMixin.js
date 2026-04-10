import { /*findItemBy,*/ prepareRangeParams } from '@/helpers';
import { setFiltersViaList } from '@/helpers/specialHelpers';

const itemsDataMixin = {
	props: {
		fromDashboard: Boolean,
		// preventDestroyNavbar: Boolean,
		preventSetNavbar: Boolean,
		propsNavbarSettings: null,
		additionalModalSettings: {
			type: Object,
			default: () => ({})
		},

		propsFilters: Object,
		watchPropsFiltersOnly: Boolean
		// filtersSettings: null
	},

	data: () => ({
		preventFetch: false,

		itemData: null,
		itemsList: [],
		itemsLoading: false,
		meta: {}
	}),

	computed: {
		navbarSettings: that => ({
			showCreateButton: true,
			showDeleteButton: true,
			showFilter: true,
			pageTitle: that.itemsName ? that.itemsName.mult : ''
		}),
		editModal() {
			return this.$store.state.global.editModal;
		},
		globalFilters() {
			return this.$store.state.global.globalFilters;
		},
		updateItemsList() {
			return this.$store.state.global.updateItemsList;
		},

		routeMeta() {
			return this.$route.meta;
		},

		routeQuery() {
			const { query } = this.$route;
			return Object.keys(query).length ? query : null;
		},

		preventedFilters() {
			let filters = {};
			if (this.routeMeta.preventFilterBy) {
				this.routeMeta.preventFilterBy.forEach(f => (filters[f] = null));
			}
			return filters;
		},

		showClearFilters() {
			const { filters, clearableFiltersList } = this;
			if (clearableFiltersList) {
				return clearableFiltersList.some(f_prop => !!filters[f_prop]);
			}
			return false;
		}
	},
	methods: {
		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		},
		set_global_state(payload) {
			this.$store.dispatch('set_global_state', payload);
		},
		show_edit_modal(data) {
			this.$store.dispatch('show_edit_modal', data);
		},

		cleanRouteQuery() {
			if (this.routeQuery) {
				this.$router.replace(this.$route.path);
			}
			// console.log(this.$route)
		},

		setFiltersViaList(payload) {
			return setFiltersViaList(payload);
		},

		handleShowNextInstanceItem({
			row,
			options,
			path,
			filterAction,
			filterParam,
			itemId,
			filtersState,
			setFilters
			// nextInstanceName
		}) {
			itemId = itemId || row.id;
			// console.log(itemId)
			let final_path;

			if (row && options) {
				final_path = `${options.page_path}=${row.id}`;
			} else if (path) {
				final_path = path;
			}
			if (filterAction) {
				// console.log(filterAction, this.$store.state[filtersState].filters)
				this.$store.dispatch(filterAction, {
					...this.$store.state[filtersState].filters,
					[filterParam]: itemId
				});
			}

			if (setFilters) {
				this.setFiltersViaList({ filters: setFilters, value: itemId });
			}

			/*if (nextInstanceName) {
				// console.log(1, nextInstanceName)
				this.set_global_state({
					stateProp: 'nextActiveItemsTable',
					value: nextInstanceName
				});
			}*/
			// console.log(final_path)
			this.changeRoute({ path: final_path });

			setTimeout(() => {
				this.set_global_state({
					stateProp: 'disposableHistoryButton',
					value: true
				});
			}, 10);
		},

		prepareFilters(filters) {
			let newFilters = {};
			if (this.excludeGetParams) {
				for (let key in filters) {
					if (!this.excludeGetParams.some(p => p == key)) {
						newFilters[key] = filters[key];
					}
				}
			} else if (this.acceptedFilters) {
				for (let key in filters) {
					if (this.acceptedFilters.indexOf(key) !== -1) {
						newFilters[key] = filters[key];
					}
				}

				/*newFilters = newFilters.filter(param => {
					return this.acceptedFilters.indexOf(param) !== -1;
				});*/
			} else {
				newFilters = { ...filters };
			}

			if (this.predefinedFilters) {
				// console.log(newFilters, this.predefinedFilters)
				newFilters = { ...newFilters, ...this.predefinedFilters };
			}

			if (this.propsFilters) {
				newFilters = { ...newFilters, ...this.propsFilters };
			}
			if (this.localPrepareFilters) {
				newFilters = this.localPrepareFilters(newFilters);
			}

			if (newFilters.daterange && newFilters.daterange.length) {
				newFilters = {
					...newFilters,
					...prepareRangeParams(newFilters.daterange)
				};
				delete newFilters.daterange;
			}

			delete newFilters.items_active_grid_type;
			delete newFilters.isShowList;
			delete newFilters.isShowListRefreshed;
			delete newFilters.isShowListRefreshed2;
			delete newFilters.daterange_setted_at;

			/*if (filters.daterange && filters.daterange.length) {
				newFilters = {
					...newFilters,
					...prepareRangeParams(filters.daterange)
				}

				delete newFilters.daterange
			}*/
			// console.log(newFilters)
			return newFilters;
		},

		refetchItemsList() {
			// console.log('refetchItemsList')
			this.fetchItems({
				...this.globalFilters,
				...this.filters,
				...this.preventedFilters
			});
		},

		fetchItems(filters) {
			if (this.showToggleListButton ? this.filters.isShowList : true) {
				this.itemsLoading = true;

				let payload = { params: this.prepareFilters(filters) };
				// console.log(filters, payload.params, this.filters.page)
				if (this.fetchItemsPayload)
					payload = { ...payload, ...this.fetchItemsPayload };
				this.fetch_items(payload)
					.then(({ value, request_payload, fetchedMeta }) => {
						if (!request_payload.setToStore) {
							this.itemsList = value;
							// console.log(value.map(vi => vi.is_closed))
							if (fetchedMeta) this.meta = fetchedMeta;
						}
						this.itemsLoading = false;

						if (this.secondaryItemsSettings) {
							this.fetchSecondaryItems({
								...this.secondaryItemsSettings,
								main_payload: payload
							});
						}
					})
					.catch(e => {
						if (this.localFetchItemsCatch) {
							this.localFetchItemsCatch(e);
						}
						this.itemsLoading = false;
					});
			}
		},

		fetchSecondaryItems({
			loadingProp,
			dataProp,
			payload,
			main_payload,
			actionName
		}) {
			// console.log(filters)
			payload = payload || {};
			const params = payload.params || {};

			let newPayload = {
				...main_payload,
				...payload,
				params: { ...main_payload.params, ...params }
			};

			this[loadingProp] = true;

			this[actionName](newPayload)
				.then(({ value, request_payload, fetchedMeta }) => {
					if (!request_payload.setToStore) {
						this[dataProp] = value;
						if (fetchedMeta) this.meta = fetchedMeta;
						this[loadingProp] = false;
					}
				})
				.catch(() => {
					this[loadingProp] = false;
				});
		},

		createItem(options = {}) {
			let { path, modal_settings } = options;
			modal_settings = modal_settings || {};
			// console.log(this.fromDashboard || this.editInModal)
			if (this.fromDashboard || this.editInModal) {
				let modalSettings = {
					show: true,
					instanceName: this.instanceName,
					itemName: this.itemsName ? this.itemsName.one : '',
					settings: this.settings || null,
					formSettings: this.formSettings || null,
					...this.additionalModalSettings
				};

				if (this.localModalSettings) {
					modalSettings = { ...modalSettings, ...this.localModalSettings };
				}
				modalSettings = { ...modalSettings, ...modal_settings };

				if (this.localModalSettingsHook) {
					modalSettings = this.localModalSettingsHook({
						itemData: null,
						modalSettings: modalSettings
					});
				}

				// console.log('modalSettings', modalSettings);
				this.show_edit_modal(modalSettings);
			} else {
				if (this.changeRoute) {
					this.changeRoute({ path: path || '/new', addToCurrent: true });
				}
			}
		},

		editItem({ row, rowData, query, modal_settings }) {
			// console.log(row, modal_settings)
			const itemData = row || rowData;
			if (this.fromDashboard || this.editInModal) {
				this.itemData = itemData;
				modal_settings = modal_settings || {};

				let modalSettings = {
					show: true,
					instanceData: itemData,
					instanceName: this.instanceName || this.itemsName.mult,
					itemName: this.itemsName ? this.itemsName.one : '',
					settings: this.settings || null,
					formSettings: this.formSettings || null,
					...this.additionalModalSettings
				};

				if (this.localModalSettings) {
					modalSettings = { ...modalSettings, ...this.localModalSettings };
					// console.log('1', modalSettings, this.localModalSettings)
				}

				modalSettings = { ...modalSettings, ...modal_settings };
				// console.log('2', modalSettings, modal_settings)

				if (this.localModalSettingsHook) {
					modalSettings = this.localModalSettingsHook({
						itemData: itemData,
						modalSettings: modalSettings
					});
				}
				// console.log(modalSettings);
				this.show_edit_modal(modalSettings);
			} else {
				let route = `${this.$route.path}/${itemData.id}`;
				if (query) route += `?${query}`;
				// console.log(this.$route, route)
				this.$router.push(route);
			}
		},

		handleDeleteItems(data, settings = {}) {
			let ids;
			if (data) {
				ids = [data.row.id];
			} else {
				const refName = this.tableRefName || 'ItemsTableContainer';
				ids = this.$refs[refName].selectedIds;
			}

			/*if (this.preDeleteItemsHook) {
				ids = this.preDeleteItemsHook({ data, ids });
			}*/

			const confirmButtonText = settings.confirmButtonText || this.tt('Delete');
			const methodName = settings.methodName || 'deleteItem';
			const payload = settings.payload || {};
			/*if (ids) {
				console.log('delete list', ids, payload)
				return;
			}*/

			if (ids.length) {
				const prop = ids.length > 1 ? 'mult' : 'one';
				const { tt } = this;
				const confirmMessage =
					settings.confirmMessage ||
					`${tt('phrases.this_will_permanently_delete_selected')} ${
						this.itemsName[prop]
					}. ${tt('Continue')}?`;
				// let isValidCheck = true;
				// if (isValidCheck) {
				this.$confirm({
					title: tt('Warning'),
					message: confirmMessage,
					confirmButtonText: confirmButtonText,
					showCancelButton: true,
					cancelButtonText: tt('Cancel'),
					iconClass: 'icomoon icon-warning',
					type: 'warning'
				}).then(() => {
					this[methodName]({ ids: ids, ...payload });
				});
				/*.catch(() => {
						this.$message({
							type: 'info',
							message: 'canceled'
						});
					});*/
				/*} else {
					let message = "Can't proceed? because some validations fails";
					if (this.canDeleteSettings) {
						const { notifyFails } = this.canDeleteSettings;
						if (notifyFails) {
							message = notifyFails.message;
						}
					}

					this.$notify({
						type: 'warning',
						title: '',
						message: message
					});
				}*/
			} else {
				this.$message({
					type: 'info',
					message: 'Select items first'
				});
			}
		},

		deleteItem(data) {
			/*if (data) {
				console.log(data)
				return				
			}*/
			this.delete_item({ data: data }).then(() => {
				if (this.fromDashboard) {
					this.set_global_state({ stateProp: 'updateCounters', value: true });
				}
				this.refetchItemsList();
			});
		},

		setFilters(filters, bindedFilters = [], settings = {}) {
			for (let item in filters) {
				// console.log( item, filters[item], typeof item, filters[item] instanceof Array )
				if (filters[item] instanceof Array) {
					//
				} else {
					if (typeof filters[item] != 'boolean') {
						const new_value = filters[item] ? +filters[item] : filters[item];
						// console.log(new_value, filters[item])
						filters[item] =
							!!new_value && !Number.isNaN(new_value) ? new_value : filters[item];
					}
				}
			}

			let newFilters = { ...this.filters, ...filters };
			// console.log('setFilters Mixin', filters, newFilters, settings)
			// console.log('filters',this.filters.page, newFilters.page, settings.preventResetPage)
			if (!settings.preventResetPage) {
				newFilters.page = 1;
			}
			if (bindedFilters.length) {
				for (const prop of bindedFilters) {
					if (!Object.keys(filters).some(k => k == prop)) {
						if (newFilters[prop]) {
							newFilters[prop] = null;
						}
					}
				}
			}
			// console.log(newFilters)
			this.set_filters(newFilters);
		}

		/*clearFilters(filtersList) {
			let newFilters = { ...this.filters };

			for (const prop of filtersList) {
				if (this.filters[prop]) {
					newFilters[prop] = null;
				}
			}
		}*/
	},

	watch: {
		filters(filters) {
			// console.log(filters, this.filters)
			if (this.localFiltersWatch) {
				this.localFiltersWatch(filters);
			} else if (!this.watchPropsFiltersOnly) {
				if (this.preventFetch) {
					this.preventFetch = false;
				} else {
					this.fetchItems({
						...this.globalFilters,
						...filters,
						...this.preventedFilters
					});
				}
			}
		},

		globalFilters: function(globalFilters, old_filters) {
			let nextStep = true;
			// console.log(nextStep)

			if (this.localGlobalFiltersWatch) {
				this.localGlobalFiltersWatch(globalFilters, old_filters);
			}

			if (this.excludeGlobFilters) {
				this.excludeGlobFilters.forEach(gf => {
					if (globalFilters[gf] !== old_filters[gf]) nextStep = false;
				});
			}

			if (!nextStep) return;
			// console.log('globalFilters Mixin', globalFilters, old_filters)

			const { preventedFilters } = this;
			this.preventFetch = true;
			this.setFilters({ page: 1 });
			// console.log('globalFilters')
			this.fetchItems({
				...this.filters,
				...globalFilters,
				...preventedFilters
			});
		},
		updateItemsList(isUpdate) {
			if (isUpdate) {
				// console.log('updateItemsList')
				this.refetchItemsList();
				this.set_global_state({ stateProp: 'updateItemsList', value: false });
			}
		},

		propsFilters() {
			// console.log('propsFilters')
			if (this.preventFetch) {
				this.preventFetch = false;
			} else {
				this.refetchItemsList();
			}
		}
	},

	/*created() {
		if (this.fromDashboard || this.fromDetailsPage) {
			this.preventFetch = true;
			this.setFilters({ page: 1 });
		}
	},*/

	beforeMount() {
		if (this.localBeforeMount) this.localBeforeMount();
		if (this.gridViewBeforeMount) this.gridViewBeforeMount();

		const {
			hideActiveItemsTable,
			instanceName,
			itemsName,
			routeMeta,
			stopFetch,
			watchPropsFiltersOnly,
			navbarSettings,
			propsNavbarSettings
		} = this;

		if (!hideActiveItemsTable) {
			this.set_global_state({
				stateProp: 'activeItemsTable',
				value: instanceName || itemsName.mult
			});
		}
		if (routeMeta && routeMeta.filtersSettings) {
			this.preventFetch = true;
			this.setFilters(routeMeta.filtersSettings);
		}

		if (this.routeQuery) {
			if (this.localRouteQueryHandler) {
				this.localRouteQueryHandler(this.routeQuery);
			} else {
				this.preventFetch = true;
				this.setFilters(this.routeQuery, this.bindedFilters);
			}
			// console.log(this.routeQuery)
		}

		if (!this.preventSetNavbar) {
			this.setup_navbar(propsNavbarSettings || navbarSettings);
		}
		// console.log('beforeMount', stopFetch, watchPropsFiltersOnly)

		if (!stopFetch) {
			// console.log('beforeMount')
			if (watchPropsFiltersOnly) {
				this.fetchItems({ ...this.propsFilters });
			} else {
				this.fetchItems({
					...this.filters,
					...this.globalFilters,
					...this.preventedFilters
				});
			}
		}
	},

	beforeDestroy() {
		// this.set_global_state({ stateProp: 'activeItemsTable', value: null });
		// this.set_items([]);
		if (!this.preventSetNavbar) {
			this.setup_navbar({});
		}
		/*if (!this.preventResetPage) {
			// console.log(this.preventResetPage, this._data, this.filters)
			this.setFilters({ page: 1 });
		}*/
	}
};

export default () => itemsDataMixin;
