import { Droppable } from '@shopify/draggable';

const dragNdropDroppableMixin = {
	data() {
		return {
			draggingLocked: false,
			// drug_n_dropListsReady: false,
			DroppableInstance: null,
			draggableInitiated: false
		};
	},

	methods: {
		setupDraggable() {
			if (!this.draggingLocked) {
				// console.log(this.draggableInitiated)
				if (!this.draggableInitiated) {
					const containers = document.querySelectorAll(
						`${this.drag_n_drop_wrapper_selector} .drag-n-drop-list`
					);

					const drag_n_drop_containers_quantity =
						this.drag_n_drop_containers_quantity || 1;
					if (
						containers.length &&
						containers.length === drag_n_drop_containers_quantity
					) {
						// console.log(containers);
						// this.drug_n_dropcontainersReady = true;

						this.initiateDraggable(containers);
					}
				}
			} else {
				this.destroyDroppable();
			}
		},

		destroyDroppable() {
			if (this.DroppableInstance) {
				this.DroppableInstance.destroy();
				this.DroppableInstance = null;
				this.draggableInitiated = false;
			}
		},

		initiateDraggable(containers) {
			const content_container = document.querySelector(
				'.dashboard-content-container'
			);

			let DroppableInstance = new Droppable(containers, {
				draggable: '.drag-n-drop-item',
				dropzone: '.item-drop-zone',
				mirror: {
					constrainDimensions: true
				}
				// plugins: [Plugins.ResizeMirror],
			});

			// let droppableOrigin;

			DroppableInstance.on('drag:start', evt => {
				content_container.classList.add('is-dragging');

				if (this.dragStartCallback) this.dragStartCallback(evt);
				// console.log(evt.originalSource.parentElement.dataset)
				// droppableOrigin = evt.originalSource.parentElement.dataset.datadropzoneName;
			});

			DroppableInstance.on('droppable:dropped', event => {
				content_container.classList.remove('is-dragging');
				if (this.dropValidateCallback) {
					// console.log(this.dropValidateCallback(event))
					this.dropValidateCallback(event) ? null : event.cancel();
				}
			});
			// DroppableInstance.on('droppable:returned', () => console.log('droppable:returned'));
			DroppableInstance.on('droppable:stop', event => {
				content_container.classList.remove('is-dragging');

				try {
					// let currentBlock = event.dragEvent.data.originalSource;

					// console.log('current: ', event )
					if (this.dropCallback) {
						this.dropCallback(event);
					}
				} catch (error) {
					console.log(error);
				}
				/*this.$nextTick(() => {
				});*/
			});

			this.DroppableInstance = DroppableInstance;
			this.draggableInitiated = true;
		}
	},

	watch: {
		draggingLocked() {
			this.setupDraggable();
		}
	},

	updated() {
		this.$nextTick(() => {
			// console.log('updated', document.querySelectorAll('.drag-n-drop-list'));
			this.setupDraggable();
		});
	},

	beforeDestroy() {
		this.destroyDroppable();
	}
};

export default () => dragNdropDroppableMixin;
