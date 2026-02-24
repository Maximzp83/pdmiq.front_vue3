import { Sortable } from '@shopify/draggable';

const dragNdropSortableMixin = {
	props: {
		draggingLockedProp: null
	},
	data() {
		return {
			draggingLocked: true,
			// drug_n_dropListsReady: false,
			SortableInstance: null,
			draggableInitiated: false
		};
	},

	computed: {
		draggingLockedFinal() {
			if (this.draggingLockedProp !== undefined) {
				return this.draggingLockedProp;
			}

			return this.draggingLocked;
		}
	},

	methods: {
		setupDraggable(settings = {}) {
			// console.log('setupDraggable', settings, !this.draggingLockedFinal, !this.draggableInitiated)
			if (!this.draggingLockedFinal) {
				if (!this.draggableInitiated) {
					const lists = document.querySelectorAll(
						`${this.drag_n_drop_wrapper_selector} .drag-n-drop-list`
					);
					// console.log(`${this.drag_n_drop_wrapper_selector} .drag-n-drop-list`, lists);
					if (/*!this.drug_n_dropListsReady &&*/ lists.length) {
						// this.drug_n_dropListsReady = true;
						this.initiateDraggable(settings);
					}
				}
			} else {
				this.destroySortable();
			}
		},

		destroySortable() {
			if (this.SortableInstance) {
				this.SortableInstance.destroy();
				this.SortableInstance = null;
				this.draggableInitiated = false;
			}
		},

		initiateDraggable(settings = {}) {
			// console.log('initiateDraggable', settings)
			const content_container = document.querySelector('.dashboard-content-container');
			const wrapper = document.querySelector(this.drag_n_drop_wrapper_selector);
			const containerSelector = `${this.drag_n_drop_wrapper_selector} .drag-n-drop-list`;
			const allContainers = document.querySelectorAll(containerSelector);

			// console.log(wrapper, allContainers)

			// var containers = [];

			/*if (!this.hasAccess) {
				for (var i = 0; i < allContainers.length; i++) {
					if (!allContainers[i].dataset.isArchieved) {
						containers.push(allContainers[i])              
					}
				}
			} else {
				containers = allContainers
			}*/

			let SortableInstance = new Sortable(allContainers, {
				draggable: '.drag-n-drop-item',
				// droppable: '.item-drop-zone',
				mirror: {
					appendTo: settings.appendTo || containerSelector,
					// appendTo: 'body',
					constrainDimensions: true
				}
				// plugins: [Plugins.ResizeMirror],
			});

			SortableInstance.on('drag:start', event => {
				content_container.classList.add('is-dragging');
				// const currentTarget = event.sensorEvent.target;
				// let valid = currentTarget.classList.contains('drag-n-drop-zone');
				let valid = true;

				if (this.dragStartHandler) {
					valid = this.dragStartHandler(event);
				}
				// console.log('currentTarget: ', event);

				/*if (currentTarget) {
					// currentTarget.classList.add('isDragging');
					// if (this.hasClasses(currentTarget, exceptBlocks)) valid = false;
				}*/

				if (!valid) {
					event.cancel();
				} else {
					wrapper.classList.add('dragging');
				}
			});
			// SortableInstance.on('sortable:sort', (event) => console.log('sortable:sort', event))
			SortableInstance.on('sortable:stop', event => {
				// console.log('sortable:stop', event)
				content_container.classList.remove('is-dragging');

				this.$nextTick(() => {
					try {
						// let currentBlock = event.dragEvent.data.originalSource;

						// console.log('current: ', event )
						if (this.reorderHandler) {
							this.reorderHandler(event);
						}
					} catch (error) {
						console.log(error);
					}
				});
			});
			SortableInstance.on('drag:stop', () => {
				wrapper.classList.remove('dragging');
			});

			this.SortableInstance = SortableInstance;
			this.draggableInitiated = true;
		}
	},

	watch: {
		draggingLockedFinal() {
			this.setupDraggable();
		}
	},

	/*updated() {
		// this.setupDraggable();
		// console.log(document.querySelectorAll('.drag-n-drop-list'));
	},*/

	mounted() {
		this.setupDraggable();
		// setTimeout(() => {
		// }, 500);
	},

	beforeDestroy() {
		this.destroySortable();
	}
};

export default () => dragNdropSortableMixin;
