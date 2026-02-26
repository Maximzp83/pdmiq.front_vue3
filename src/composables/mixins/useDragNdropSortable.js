import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Sortable } from '@shopify/draggable';

export function useDragNdropSortable({
	wrapperSelector,
	draggingLockedProp,
	reorderHandler,
	dragStartHandler,
} = {}) {
	const draggingLocked = ref(true);
	const sortableInstance = ref(null);
	const draggableInitiated = ref(false);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const draggingLockedFinal = computed(() => {
		if (draggingLockedProp !== undefined && draggingLockedProp !== null) {
			return resolve(draggingLockedProp);
		}
		return draggingLocked.value;
	});

	const setupDraggable = (settings = {}) => {
		if (!draggingLockedFinal.value) {
			if (!draggableInitiated.value) {
				const selector = resolve(wrapperSelector);
				if (!selector) return;
				const lists = document.querySelectorAll(`${selector} .drag-n-drop-list`);
				if (lists.length) {
					initiateDraggable(settings);
				}
			}
		} else {
			destroySortable();
		}
	};

	const destroySortable = () => {
		if (sortableInstance.value) {
			sortableInstance.value.destroy();
			sortableInstance.value = null;
			draggableInitiated.value = false;
		}
	};

	const initiateDraggable = (settings = {}) => {
		const selector = resolve(wrapperSelector);
		if (!selector) return;
		const contentContainer = document.querySelector('.dashboard-content-container');
		const wrapper = document.querySelector(selector);
		const containerSelector = `${selector} .drag-n-drop-list`;
		const allContainers = document.querySelectorAll(containerSelector);

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
