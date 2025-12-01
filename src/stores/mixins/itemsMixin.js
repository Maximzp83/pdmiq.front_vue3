export const itemsMixin = {
  state: { items: [] },
  actions: {
    clearItem(name) {
      this.items = this.items.filter(i => i.name !== name)
    },
  },
  getters: {
    totalItems: state => state.items.length,
  },
};