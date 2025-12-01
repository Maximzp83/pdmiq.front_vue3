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
      this[key] = value;
      // console.log('set_value', value, this[key])
      if (settings.toLocalStorage) {
        const { prop } = settings.toLocalStorage;
        localStorage.setItem(prop, JSON.stringify(value));
      }
    },
  },
  getters: {
    // totalItems: state => state.items.length,
  },
};