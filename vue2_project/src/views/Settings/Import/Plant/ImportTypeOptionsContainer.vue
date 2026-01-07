<template>
	<div class="">
		<div class="cell-item item-drop-zone bold flex align-center">
			<img :src="itemType.full_file_name" alt="" class="type-img div-block" />
			<span class="article-title uppercase div-block">{{ itemType.name }}</span>
		</div>

		<DragDropCellItem
			:equipmentTypeId="itemType.id"
			ref="DragDropCellItem"
			:itemData="{ name: 'QTY' }"
		/>

		<DragDropCellItem
			:equipmentTypeId="itemType.id"
			ref="DragDropCellItem"
			:itemData="{ name: 'Brand', required: !itemType.without_brand }"
		/>

		<DragDropCellItem
			:equipmentTypeId="itemType.id"
			ref="DragDropCellItem"
			:itemData="{ name: 'Part Number', required: true }"
		/>

		<div class="cells-block">
			<DragDropCellItem
				ref="DragDropCellItem"
				v-for="(item, idx) in itemType.type_options"
				:key="`type_option-${item.id}-${idx}`"
				:itemData="item"
				:optionId="item.id"
				:equipmentTypeId="itemType.id"
			/>
		</div>

		<div class="cell-item">
			<div>
				<!-- :disabled="!selectedItemType" -->
				<el-button
					class="action-button create-button with-text"
					size="mini"
					type="success"
					@click="addOption(itemType)"
				>
					<span>{{ `${tt('add')} ${tt('option')}` }}</span>
					<i class="icomoon icon-plus"></i>
				</el-button>
			</div>
		</div>

		<div class="cell-item item-drop-zone bold">Images:</div>

		<DragDropCellItem
			:equipmentTypeId="itemType.id"
			ref="DragDropCellItem"
			:itemData="{ name: `${itemType.name} Image` }"
		/>

		<DragDropCellItem
			:equipmentTypeId="itemType.id"
			ref="DragDropCellItem"
			:itemData="{ name: `Nameplate ${itemType.name} Image` }"
		/>
		<!-- <div class="cells-block" v-if="selectedItemType">
			<DragDropCellItem
				ref="DragDropCellItem"
				fileUpload
				v-for="(item, idx) in selectedItemType.type_medias"
				:key="`type_media-${item.id}-${idx}`"
				:itemData="item"
				:mediaId="item.id"
			/>
		</div> -->
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { findItemBy } from '@/helpers';

export default {
	components: {
		DragDropCellItem: () => import('@/components/Import/DragDropCellItem.vue')
	},

	props: {
		itemType: { type: Object, required: true }
	},

	data() {
		return {
			isValidMain: false
		};
	},

	computed: {
		predefined_type_options: that =>
			Object.freeze([
				{ id: 1, name: 'type', formKey: 'type_id', required: true },
				{ id: 6, name: 'QTY', formKey: 'qty' },
				{
					id: 2,
					name: 'Brand',
					formKey: 'brand_column_name',
					required: !that.itemType.without_brand
				},
				{
					id: 3,
					name: 'Part Number',
					formKey: 'brand_model_column_name',
					required: true
				},
				{
					id: 4,
					name: 'Storeroom location',
					formKey: 'equipment_picture_column_name'
				},
				{ id: 5, name: 'Location', formKey: 'equipment_nameplate_column_name' }
			])
	},

	methods: {
		...mapActions({
			show_edit_modal: 'show_edit_modal',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types'
		}),

		addOption(itemType) {
			let modalSettings = {
				show: true,
				instanceName: 'EquipmentTypes',
				instanceData: itemType,
				title: 'Add new Type options',
				settings: { createNewOptionsOnly: true },
				callback: this.updateEquipmentTypes
			};

			this.show_edit_modal(modalSettings);
		},

		updateEquipmentTypes() {
			this.$emit('event', 'updateEquipmentTypes');
		},

		prepareFormData() {
			const { itemType } = this;
			const droppedItems = document.querySelectorAll(
				`.headings-list  .drag-n-drop-item[data-equipment-type-id="${itemType.id}"]`
			);
			// const allItemsRefs = this.$refs.DragDropCellItem;

			let data = {
				type_id: itemType.id,
				qty: '',
				brand_column_name: '',
				brand_model_column_name: '',
				options: [],
				equipment_picture_column_name: '',
				equipment_nameplate_column_name: ''
				// medias: []
			};

			for (const nodeItem of droppedItems) {
				const { itemName, optionId } = nodeItem.dataset;

				const columnName = nodeItem.parentElement.parentElement.querySelector(
					'[data-column-name]'
				).dataset.columnName;

				// console.log(itemName, columnName)
				if (itemName == 'QTY') {
					data.qty = columnName;
				} else if (itemName == 'Brand') {
					data.brand_column_name = columnName;
				} else if (itemName == 'Part Number') {
					data.brand_model_column_name = columnName;
				} else if (itemName == `${itemType.name} Image`) {
					data.equipment_picture_column_name = columnName;
				} else if (itemName == `Nameplate ${itemType.name} Image`) {
					data.equipment_nameplate_column_name = columnName;
				} else if (optionId) {
					data.options.push({ id: +optionId, column_name: columnName });
				}
			}
			return data;
		},

		validateItemForm() {
			var requiredOptions = this.predefined_type_options.filter(oi => oi.required);

			var data = this.prepareFormData();

			return requiredOptions.every(ro => !!data[ro.formKey]);
		},

		getFormData() {
			var data = this.prepareFormData();
			
			/*this.isValidMain = Object.keys(data).every(key => {
				const val = data[key];
				if (key == 'medias') {
					if (val.length > 0) {
						mediasHasFiles = val.every(mi => mi.zip_file);
						return mediasHasFiles;
					}
					return true;
				}
				optionsHasValue = val instanceof Array ? val.length > 0 : !!val;
				return optionsHasValue;
			});*/

			for (const key in data) {
				if (!data[key]) {
					delete data[key];
				}
			}

			return data;
		},

		/*submitItemForm(data) {
			const payload = {
				data: data,
				formDataProp: 'types',
				isValid: this.isValidMain

				// withFile: mediasHasFiles
			};

			if (payload) {
				this.$emit('ready', payload);
			}
		}*/
	}
};
</script>
