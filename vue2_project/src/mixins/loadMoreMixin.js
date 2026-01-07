import isEmpty from 'lodash/isEmpty';

const loadMoreMixin = {
	data() {
		return {
			isLoadMore: false
		};
	},

	methods: {
		loadMore(methodName) {
			this.isLoadMore = true;
			this[methodName]();
		},

		prepareLoadMorePayload(initialPayload, dataProp, concatList) {
			let payload = { ...initialPayload };

			if (!isEmpty(this[dataProp]) && this.isLoadMore) {
				payload.concatData = { props: concatList };
				this.isLoadMore = false;
			} else {
				payload.params.page = 1;
			}

			return payload;
		}
	}
};

export default () => loadMoreMixin;
