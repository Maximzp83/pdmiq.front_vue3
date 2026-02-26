import { ref } from 'vue';
import isEmpty from 'lodash/isEmpty';

export function useLoadMore() {
	const isLoadMore = ref(false);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const loadMore = (method) => {
		if (typeof method !== 'function') {
			console.warn('[useLoadMore] method is not a function');
			return;
		}
		isLoadMore.value = true;
		method();
	};

	const prepareLoadMorePayload = (initialPayload, dataList, concatList) => {
		const payload = { ...initialPayload };
		const list = resolve(dataList);

		if (!isEmpty(list) && isLoadMore.value) {
			payload.concatData = { props: concatList };
			isLoadMore.value = false;
		} else if (payload.params) {
			payload.params.page = 1;
		}

		return payload;
	};

	return { isLoadMore, loadMore, prepareLoadMorePayload };
}
