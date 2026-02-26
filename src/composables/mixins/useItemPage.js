import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import { checkUploadSettings } from '@/helpers/specialHelpers';

export function useItemPage({
	itemsName,
	uploadSettings,
	preparePayload,
	localSubmit,
	saveItem,
	changeRoute,
	successSubmitCallback,
	itemData,
	itemFormRef,
} = {}) {
	const authStore = useAuthStore();
	const itemSaving = ref(false);
	const authUser = computed(() => authStore.authUser);

	const handleSaveItem = () => {
		const form = itemFormRef?.value;
		if (form?.validateForm) {
			form.validateForm();
		}
	};

	const handleSubmitForm = (data) => {
		let payload = {
			data,
			itemName: itemsName ? itemsName.one : '',
		};

		if (uploadSettings) {
			payload = checkUploadSettings(payload, uploadSettings);
		}

		if (preparePayload) {
			payload = preparePayload(payload);
		}

		if (localSubmit) {
			localSubmit(payload);
		} else {
			itemSaving.value = true;

			if (typeof saveItem !== 'function') {
				console.warn('[useItemPage] saveItem is not a function');
				itemSaving.value = false;
				return;
			}

			saveItem(payload)
				.then((answer) => {
					if (changeRoute) {
						changeRoute({ parent: true });
					}

					if (successSubmitCallback) {
						successSubmitCallback(answer);
					}

					if (!answer.request_payload && !answer.request_payload.setToStore) {
						if (itemData && 'value' in itemData) {
							itemData.value = answer.data;
						}
					}
					itemSaving.value = false;
				})
				.catch(() => {
					itemSaving.value = false;
				});
		}
	};

	const handleCloseButton = () => {
		if (changeRoute) {
			changeRoute({ history: true, steps: -1 });
		}
	};

	return {
		itemSaving,
		authUser,
		handleSaveItem,
		handleSubmitForm,
		handleCloseButton,
	};
}
