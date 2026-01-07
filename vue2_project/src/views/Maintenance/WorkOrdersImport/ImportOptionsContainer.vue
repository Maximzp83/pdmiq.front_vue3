<template>
	<div class="card-content no-paddings">
		<div class="cells-list drag-n-drop-list">
			<div class="cells-block">
				<DragDropCellItem
					ref="DragDropCellItem"
					v-for="(item, idx) in optionsList"
					:key="`option-${item.id}-${idx}`"
					:itemData="item"
					:itemName="item.name"
				/>
			</div>

			<!-- <div class="cell-item item-drop-zone bold">Media:</div>

			<div class="cells-block">
				<DragDropCellItem ref="DragDropCellItem"
					fileUpload
					v-for="(item, idx) in mediaList"
					:key="`media-${item.id}-${idx}`"
					:itemData="item"
					:itemName="item.name"
				/>
			</div> -->
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { findItemBy } from '@/helpers';
import { importMixin } from '@/mixins';

export default {
	mixins: [importMixin()],
	components: {
		DragDropCellItem: () => import('@/components/Import/DragDropCellItem.vue')
	},

	props: {
		plantId: { type: Number, required: true }
	},

	data() {
		return {};
	},

	computed: {
		optionsList: () =>
			Object.freeze([
				{ id: 1, name: 'Name', formKey: 'title' },
				{ id: 2, name: 'Created Date', formKey: 'created_date', required: true },
				{ id: 3, name: 'Description', formKey: 'description', required: true },
				{ id: 4, name: 'Machine Name', formKey: 'machine_name', required: true },
				{ id: 5, name: 'Production Line Name', formKey: 'production_line_name' },
				{ id: 6, name: 'Asset Name', formKey: 'asset_name' },
				{ id: 7, name: 'Work Order Type', formKey: 'category_name' },
				{ id: 8, name: 'Due Date', formKey: 'finish_date', required: true },
				{ id: 9, name: 'Equipment Type Name', formKey: 'equipment_type_name' },
				{ id: 10, name: 'Brand Name', formKey: 'brand_name' },
				{ id: 11, name: 'Part Number Name', formKey: 'brand_model_name' }
			])
		/*mediaList: () => Object.freeze([
			{ id: 1, name: 'Image' },
			{ id: 2, name: 'Attachment' },
		])*/
	},

	methods: {
		...mapActions({
			show_edit_modal: 'show_edit_modal',
			maintenance_work_order_import: 'maintenance/import_work_order',
			get_import_work_order_progress: 'maintenance/get_import_work_order_progress',
			maintenance_work_order_revert: 'maintenance/revert_import_work_order'
		}),

		onStart() {
			const droppedItems = document.querySelectorAll(
				'.headings-list .drag-n-drop-item'
			);
			const allItemsRefs = this.$refs.DragDropCellItem;
			const { uploadedFileName } = this;

			let data = {
				file_name: uploadedFileName,
				plant_id: this.plantId,
				images: [],
				attachments: []
			};

			for (const nodeItem of droppedItems) {
				const { itemName, itemFormKey } = nodeItem.dataset;

				const columnName = nodeItem.parentElement.parentElement.querySelector(
					'[data-column-name]'
				).dataset.columnName;

				if (itemName == 'Attachment') {
					const ref = findItemBy('itemName', itemName, allItemsRefs);
					const zip_file = ref.formData.zip_file;
					data.attachments.push({ column_name: columnName, zip_file: zip_file });
				} else if (itemName == 'Image') {
					const ref = findItemBy('itemName', itemName, allItemsRefs);
					const zip_file = ref.formData.zip_file;
					data.images.push({ column_name: columnName, zip_file: zip_file });
				} else {
					data[itemFormKey] = columnName;
				}
			}
			// console.log('data ', data)
			let attachmentsValid = data.attachments.length
				? data.attachments.every(mi => mi.zip_file)
				: true;

			let imagesValid = data.images.length
				? data.images.every(mi => mi.zip_file)
				: true;

			const requiredOptions = this.optionsList.filter(oi => oi.required);
			let optionsHasValue = requiredOptions.every(ro => !!data[ro.formKey]);

			const isValid = attachmentsValid && imagesValid && optionsHasValue;

			if (isValid) {
				const payload = {
					data: data,
					withFile: data.attachments.length || data.images.length
				};
				/*if (payload) {
					console.log(payload)
					return
				}*/
				this.$emit('event', {
					eventName: 'handleImportProcessing',
					data: true
				});

				this.maintenance_work_order_import(payload)
					.then(({ value }) => {
						const { id } = value.log;

						this.getImportProgress({
							logId: id,
							progressAction: 'get_import_work_order_progress'
						});

						this.$emit('event', {
							eventName: 'setCurrentLog',
							data: id
						});
					})
					.catch(error => {
						console.warn(error);
						this.$emit('event', {
							eventName: 'handleImportProcessing',
							data: false
						});
					});
			} else {
				let message = '';
				if (!optionsHasValue) {
					message += 'Required options';
				}
				if (data.attachments.length && !attachmentsValid) {
					message += ' ZIP files for attachments';
				}
				if (data.images.length && !imagesValid) {
					message += ' ZIP files for images';
				}

				this.$notify({
					type: 'warning',
					title: this.tt('phrases.data_isn_t_ready'),
					message: `${message} ${this.tt('phrases.should_be_assigned')}...`
				});
				return false;
			}
		}
	}
};
</script>
