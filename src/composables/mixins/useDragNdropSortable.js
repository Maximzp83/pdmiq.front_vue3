import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

export function useDragNdropSortable({
	wrapperSelector,
	draggingLockedProp,
	sortableSettings,
	reorderHandler,
	dragStartHandler,
} = {}) {
	const draggingLocked = ref(true);
	const sortableInstance = ref(null);
	const draggableInitiated = ref(false);
	const draggableInitiating = ref(false);
	const sortableLib = ref(null);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;
	const resolveSettings = (settings) => resolve(settings) || {};

	const draggingLockedFinal = computed(() => {
		if (draggingLockedProp !== undefined && draggingLockedProp !== null) {
			return resolve(draggingLockedProp);
		}
		return draggingLocked.value;
	});

	const loadSortable = async () => {
		if (sortableLib.value) return sortableLib.value;

		try {
			const mod = await import('@shopify/draggable');
			sortableLib.value = mod?.Sortable || null;
		} catch {
			console.warn('[useDragNdropSortable] @shopify/draggable is not available');
			sortableLib.value = null;
		}

		return sortableLib.value;
	};

	const setupDraggable = async (settings = sortableSettings) => {
		const finalSettings = resolveSettings(settings);
		if (!draggingLockedFinal.value) {
			if (!draggableInitiated.value && !draggableInitiating.value) {
				const selector = resolve(wrapperSelector);
				if (!selector) return;
				const lists = document.querySelectorAll(`${selector} .drag-n-drop-list`);
				if (lists.length) {
					await initiateDraggable(finalSettings);
				}
			}
		} else {
			destroySortable();
		}
	};

	const destroySortable = () => {
		const selector = resolve(wrapperSelector);
		if (sortableInstance.value) {
			sortableInstance.value.destroy();
			sortableInstance.value = null;
			draggableInitiated.value = false;
		}
		draggableInitiating.value = false;
		if (selector) {
			document.querySelectorAll(`${selector} .draggable-mirror`).forEach((node) => node.remove());
			document
				.querySelectorAll(`${selector} .draggable-source--is-dragging, ${selector} .draggable--over`)
				.forEach((node) => {
					node.classList.remove('draggable-source--is-dragging', 'draggable--over');
				});
			document.querySelector(selector)?.classList.remove('dragging');
		}
		document.querySelector('.dashboard-content-container')?.classList.remove('is-dragging');
	};

	const initiateDraggable = async (settings = {}) => {
		draggableInitiating.value = true;
		try {
			const Sortable = await loadSortable();
			if (!Sortable || draggingLockedFinal.value || sortableInstance.value) return;

			const selector = resolve(wrapperSelector);
			if (!selector) return;
			const contentContainer = document.querySelector('.dashboard-content-container');
			const wrapper = document.querySelector(selector);
			const containerSelector = `${selector} .drag-n-drop-list`;
			const allContainers = document.querySelectorAll(containerSelector);
			if (!allContainers.length) return;
			const instance = new Sortable(allContainers, {
				draggable: '.drag-n-drop-item',
				mirror: {
					appendTo: settings.appendTo || containerSelector,
					constrainDimensions: true,
				},
			});

			instance.on('drag:start', (event) => {
				contentContainer?.classList.add('is-dragging');
				let valid = true;
				if (dragStartHandler) {
					valid = dragStartHandler(event);
				}
				if (!valid) {
					event.cancel();
				} else {
					wrapper?.classList.add('dragging');
				}
			});

			instance.on('sortable:stop', (event) => {
				contentContainer?.classList.remove('is-dragging');
				nextTick(() => {
					try {
						if (reorderHandler) {
							reorderHandler(event);
						}
					} catch (error) {
						console.log(error);
					}
				});
			});

			instance.on('drag:stop', () => {
				wrapper?.classList.remove('dragging');
			});

			sortableInstance.value = instance;
			draggableInitiated.value = true;
		} finally {
			draggableInitiating.value = false;
		}
	};

	watch(draggingLockedFinal, () => setupDraggable());

	onMounted(() => setupDraggable());
	onBeforeUnmount(() => destroySortable());

	return {
		draggingLocked,
		draggingLockedFinal,
		setupDraggable,
		destroySortable,
	};
}
