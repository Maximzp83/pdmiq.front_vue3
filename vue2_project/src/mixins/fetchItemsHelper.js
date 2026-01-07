const fetchItemsHelper = {
	methods: {
		doFetchAction(action, localProp, localLoadProp, payload, options = {}) {
			const { data_obj } = options;
			let obj;

			if (data_obj) {
				obj = data_obj;
			} else {
				obj = this;
			}

			obj[localLoadProp] = true;

			this[action](payload)
				.then(({ value }) => {
					obj[localProp] = value;
					obj[localLoadProp] = false;
				})
				.catch(e => {
					obj[localLoadProp] = false;
					console.log(e.message);
				});
		}
	}
};

export default () => fetchItemsHelper;
