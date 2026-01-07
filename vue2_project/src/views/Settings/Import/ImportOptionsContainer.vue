<template>
	<div class="card-content no-paddings">
		<!-- <div class="" @click="test">test</div> -->
		<div class="cells-list drag-n-drop-list">
			<div class="cell-item el-form-item relative">
				<CustomSelect
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('select')} ${tt('item')} ${tt('type')}`"
					v-model="equipment_type_id"
				/>
			</div>

			<div class="cell-item item-drop-zone bold">Options:</div>

			<DragDropCellItem ref="DragDropCellItem" :itemData="{ name: 'Brand' }" />

			<DragDropCellItem ref="DragDropCellItem" :itemData="{ name: 'Part Number' }" />

			<div class="cells-block" v-if="selectedItemType">
				<DragDropCellItem
					ref="DragDropCellItem"
					v-for="(item, idx) in selectedItemType.type_options"
					:key="`type_option-${item.id}-${idx}`"
					:itemData="item"
					:optionId="item.id"
				/>
			</div>

			<div class="cell-item">
				<div>
					<el-button
						:disabled="!selectedItemType"
						class="action-button create-button with-text"
						size="mini"
						type="success"
						@click="addOption"
					>
						<span>{{ `${tt('add')} ${tt('option')}` }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</div>

			<div class="cell-item item-drop-zone bold">Medias:</div>

			<div class="cells-block" v-if="selectedItemType">
				<DragDropCellItem
					ref="DragDropCellItem"
					fileUpload
					v-for="(item, idx) in selectedItemType.type_medias"
					:key="`type_media-${item.id}-${idx}`"
					:itemData="item"
					:mediaId="item.id"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { findItemBy } from '@/helpers';
import {
	// eventHandler,
	requestsListMixin
	/*dragNdropSortableMixin*/
} from '@/mixins';

export default {
	mixins: [
		// eventHandler,
		requestsListMixin()
		/*dragNdropSortableMixin*/
	],
	components: {
		DragDropCellItem: () => import('@/components/Import/DragDropCellItem.vue')
	},

	props: {
		uploadedFileName: String
	},

	data() {
		return {
			equipmentTypesLoading: false,
			equipmentTypesList: [],
			equipment_type_id: null
		};
	},

	computed: {
		requestsToDoList() {
			let items = [
				{
					action: 'fetch_equipment_types',
					localProp: 'equipmentTypesList',
					localLoadProp: 'equipmentTypesLoading'
				}
			];
			return items;
		},

		selectedItemType() {
			if (this.equipment_type_id && this.equipmentTypesList.length) {
				return findItemBy('id', this.equipment_type_id, this.equipmentTypesList);
			}
			return null;
		}
	},

	methods: {
		...mapActions({
			import_masterDB: 'testing/import_masterDB',

			show_edit_modal: 'show_edit_modal',
			set_global_state: 'set_global_state',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types'
		}),

		addOption() {
			let modalSettings = {
				show: true,
				instanceName: 'EquipmentTypes',
				instanceData: this.selectedItemType,
				title: 'Add new Type options',
				settings: { createNewOptionsOnly: true },
				callback: this.updateEquipmentTypes
			};

			this.show_edit_modal(modalSettings);
		},

		updateEquipmentTypes() {
			this.equipmentTypesLoading = true;
			this.fetch_equipment_types({ params: { max: -1 } })
				.then(({ value }) => {
					this.equipmentTypesList = value;
					this.equipmentTypesLoading = false;
					this.$emit('event', 'refreshDropContainers');
					this.show_edit_modal({});
				})
				.catch(() => {
					this.equipmentTypesLoading = false;
				});
		},

		/*test() {
			this.set_global_state({
				stateProp: 'overlay',
				value: {
					text: "Dont close this window until import in process!",
					textStyle: {fontSize: '25px'}
				},
			});
			this.set_global_state({ stateProp: 'mainPreloader', value: true });
		},*/

		onStart() {
			console.log('onstart')
			const droppedItems = document.querySelectorAll(
				'.headings-list .drag-n-drop-item'
			);
			const allItemsRefs = this.$refs.DragDropCellItem;
			const { uploadedFileName } = this;

			let data = {
				file_name: uploadedFileName,
				type_id: this.equipment_type_id,
				brand_column_name: '',
				brand_model_column_name: '',
				options: [],
				medias: []
			};

			for (const nodeItem of droppedItems) {
				const { itemName, optionId, mediaId } = nodeItem.dataset;

				const columnName = nodeItem.parentElement.parentElement.querySelector(
					'[data-column-name]'
				).dataset.columnName;

				if (itemName == 'Brand') {
					data.brand_column_name = columnName;
				} else if (itemName == 'Part Number') {
					data.brand_model_column_name = columnName;
				} else if (optionId) {
					data.options.push({ id: +optionId, column_name: columnName });
				} else if (mediaId) {
					const ref = findItemBy('mediaId', +mediaId, allItemsRefs);
					const zip_file = ref.formData.zip_file;
					var mediaItem = {
						id: +mediaId,
						column_name: columnName,
					};
					if (zip_file) {
						mediaItem.zip_file = zip_file;
					}

					data.medias.push(mediaItem);
				}
			}
			// console.log('data ', data)
			let mediasHasFiles = false;
			let optionsHasValue = true;

			const isValid = Object.keys(data).every(key => {
				const val = data[key];
				if (key == 'medias') {
					if (val && val.length > 0) {
						mediasHasFiles = val.some(mi => mi.zip_file);
						// return mediasHasFiles;
					}
					return true;
				}
				// console.log('val', val, 'key', key)
				optionsHasValue = val instanceof Array ? val.length > 0 : !!val;
				return optionsHasValue;
			});
				// console.log(isValid, data.medias)

			if (!data.medias.length) {
				delete data.medias;
			}

			if (isValid) {
				const payload = {
					data: data,
					withFile: mediasHasFiles
				};
				/*if (payload) {
					console.log(payload)
					return
				}*/

				this.set_global_state({
					stateProp: 'overlay',
					value: {
						text: 'Dont close this window until import in process!',
						textStyle: { fontSize: '25px' }
					}
				});
				this.set_global_state({ stateProp: 'mainPreloader', value: true });

				this.import_masterDB(payload)
					.then(() => {
						// console.log(response)
						this.equipment_type_id = null;

						this.$emit('event', {
							eventName: 'handleImportSuccess',
							data: {}
							// response: value
						});

						this.set_global_state({ stateProp: 'mainPreloader', value: false });
						this.set_global_state({ stateProp: 'overlay', value: {} });
					})
					.catch(() => {
						this.set_global_state({ stateProp: 'mainPreloader', value: false });
						this.set_global_state({ stateProp: 'overlay', value: {} });
					});
			} else {
				let message = '';
				if (!optionsHasValue) {
					message += 'Item type, Brand, Part Number and some of type options';
				}
				/*if (data.medias.length && !mediasHasFiles) {
					message += ' ZIP files for medias';
				}*/

				this.$notify({
					type: 'warning',
					title: "Data isn't ready",
					message: `${message} should be assigned...`
				});
				return false;
			}
		}
	},

	/*created() {
		console.log('created')
	}*/
};
</script>
