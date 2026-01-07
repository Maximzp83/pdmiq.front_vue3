const multiformMixin = {
	props: {
		instancesItemsData: { type: Object },
		multiFormFilters: { type: Object }
	},
	methods: {
		setMultiFormFilters(filters) {
			if (this.instancesItemsData) {
				let newFilters = { ...this.multiFormFilters, ...filters };
				this.$emit('event', 'setMultiFormFilters', newFilters);
			}
		},

		setupByParentInstance(
			instancesItemsData,
			instanceProp,
			formDataProp,
			settings = {}
		) {
			// const { instancesItemsData } = this;
			// console.log(instancesItemsData.productionLine)
			if (instancesItemsData && instancesItemsData[instanceProp]) {
				this.formData[formDataProp] = instancesItemsData[instanceProp].id;
				// console.log(settings.callback);
				if (settings.callback) {
					settings.callback();
				}
			}
		}
	}
};

export default () => multiformMixin;
