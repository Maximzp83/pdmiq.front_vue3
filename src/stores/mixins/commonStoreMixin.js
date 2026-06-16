export const commonStoreMixin = {
  state: { 
    items: [],
    filters: {
      max: 10,
      page: 1,
      orderByColumn: '',
      orderByMethod: ''
    },
    fetchedMeta: {}
  },
  actions: {
    set_value(key, value, settings = {}) {
      // console.log('set_value', key, value, settings)
      this[key] = value;
      if (settings.toLocalStorage) {
        const { prop } = settings.toLocalStorage;
        localStorage.setItem(prop, JSON.stringify(value));
      }
    },
    set_filters(prefix, filters, settings = {}) {
      const stateProp = settings.stateProp || 'filters';
      const value = filters || { ...commonStoreMixin.state.filters };
      this.set_value(stateProp, value, {
        toLocalStorage: { prop: `${prefix}_filters` },
      });
    },
  },
  getters: {
    // totalItems: state => state.items.length,
  },
};
