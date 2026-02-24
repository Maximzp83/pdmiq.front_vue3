import { api_request } from '@/api/request_provider';

/**
 * Универсальный composable для fetch операций с автоматической обработкой loading состояния
 *
 * @example
 * const { doFetchAction } = useFetchAction();
 *
 * doFetchAction('/roles', {
 *   toList: userRolesList,
 *   loadingRef: userRolesLoading,
 *   isShallowRef: true,
 *   payload: {
 *     notNotify: true,
 *     params: { max: -1 },
 *   }
 * });
 */
export function useFetchAction() {
	const doFetchAction = (endpoint, options = {}) => {
		const {
			toList,              // массив/ref для результатов
			loadingRef,          // ref для loading state
			isShallowRef = false, // использовать shallowRef (по умолчанию false)
			payload = {},        // параметры для API запроса (notNotify, params и т.д.)
			method = 'get',      // HTTP метод (get, post, put, delete и т.д.)
			clearList = true,    // очищать ли список перед заполнением (по умолчанию true)
			onError,
			onSuccess			
		} = options;

		let newPayload = {
			notNotify: true,
			params: { max: -1 }
		};

		if (payload) {
			newPayload = {...newPayload, ...payload	};			
		}

		if (loadingRef) loadingRef.value = true;

		try {
			api_request[method](endpoint, newPayload)
				.then(({value}) => {
					if (isShallowRef) {
						if (clearList) toList.length = 0;
						Array.prototype.push.apply(toList, value);
					} else {
						toList.value = value;
					}

					// console.log(value, userRolesList)
					loadingRef.value = false;

					if (onSuccess) {
						onSuccess(value);
					}
				}).catch(() => {
					loadingRef.value = false;
					if (onError) {
						onError();
					}
				});
			
			// return response;
		} catch (error) {
			if (onError) {
				onError(error);
			} else {
				console.error(`[useFetchAction] Error fetching ${endpoint}:`, error);
			}
			throw error;
		}
	};

	return { doFetchAction };
}