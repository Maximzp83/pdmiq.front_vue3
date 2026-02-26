import { ref, watch, onMounted, onUpdated, onBeforeUnmount, nextTick } from 'vue';
import { Droppable } from '@shopify/draggable';

export function useDragNdropDroppable({
	wrapperSelector,
	containersQuantity = 1,
	dragStartCallback,
	dropValidateCallback,
	dropCallback,
} = {}) {
	const draggingLocked = ref(false);
	const droppableInstance = ref(null);
	const draggableInitiated = ref(false);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const setupDraggable = () => {
		if (draggingLocked.value) {
			destroyDroppable();
			return;
		}
		if (draggableInitiated.value) return;

		const selector = resolve(wrapperSelector);
		if (!selector) return;

		const containers = document.querySelectorAll(`${selector} .drag-n-drop-list`);
		const qty = resolve(containersQuantity) || 1;

		if (containers.length && containers.length === qty) {
			initiateDraggable(containers);
		}
	};

	const destroyDroppable = () => {
		if (droppableInstance.value) {
			droppableInstance.value.destroy();
			droppableInstance.value = null;
			draggableInitiated.value = false;
		}
	};

	const initiateDraggable = (containers) => {
		const contentContainer = document.querySelector('.dashboard-content-container');

		const instance = new Droppable(containers, {
			draggable: '.drag-n-drop-item',
			dropzone: '.item-drop-zone',
			mirror: { constrainDimensions: true },
		});

		instance.on('drag:start', (evt) => {
			contentContainer?.classList.add('is-dragging');
			if (dragStartCallback) dragStartCallback(evt);
		});

		instance.on('droppable:dropped', (event) => {
			contentContainer?.classList.remove('is-dragging');
			if (dropValidateCallback) {
				dropValidateCallback(event) ? null : event.cancel();
			}
		});

		instance.on('droppable:stop', (event) => {
			contentContainer?.classList.remove('is-dragging');
			try {
				if (dropCallback) dropCallback(event);
			} catch (error) {
				console.log(error);
			}
		});

		droppableInstance.value = instance;
		draggableInitiated.value = true;
	};

	watch(draggingLocked, () => setupDraggable());

	onMounted(() => nextTick(setupDraggable));
	onUpdated(() => nextTick(setupDraggable));
	onBeforeUnmount(() => destroyDroppable());

	return {
		draggingLocked,
		setupDraggable,
		destroyDroppable,
	};
}
