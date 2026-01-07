<template>
	<div class="card-content no-paddings">
		<div class="cells-list drag-n-drop-list">
			<DragDropCellItem
				ref="DragDropCellItem"
				isCommon
				v-for="(item, idx) in predefined_type_options"
				:key="`predefined_type_option-${item.id}-${idx}`"
				:itemData="item"
			/>

			<div class="cell-item item-drop-zone bold">Select type:</div>

			<div class="cell-item el-form-item relative">
				<CustomSelect
					filterable
					multiple
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('select')} ${tt('item')} ${tt('types')}`"
					v-model="equipment_type_ids"
				/>
			</div>

			<ImportTypeOptionsContainer
				ref="ImportTypeOptionsContainer"
				v-for="itemType in selectedItemTypes"
				:key="`item-type-${itemType.id}`"
				:itemType="itemType"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { findItemBy } from '@/helpers';
import {
	eventHandler,
	requestsListMixin,
	subItemsListMixin,
	importMixin,
	navigation
} from '@/mixins';

export default {
	mixins: [
		eventHandler(),
		requestsListMixin(),
		subItemsListMixin(),
		importMixin(),
		navigation()
	],
	components: {
		DragDropCellItem: () => import('@/components/Import/DragDropCellItem.vue'),
		ImportTypeOptionsContainer: () => import('./ImportTypeOptionsContainer.vue')
	},

	data() {
		return {
			equipmentTypesLoading: false,
			equipmentTypesList: [],
			equipment_type_ids: []
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'ImportTypeOptionsContainer', returnArray: true }
		]),

		predefined_type_options: () =>
			Object.freeze([
				{ id: 1, name: 'Company', formKey: 'company_column_name', required: true },
				{ id: 2, name: 'Plant', formKey: 'plant_column_name', required: true },
				{ id: 3, name: 'Storeroom', formKey: 'storeroom_column_name' },
				{
					id: 4,
					name: 'Storeroom location',
					formKey: 'storeroom_location_column_name'
				},
				{ id: 5, name: 'Location', formKey: 'location_column_name', required: true },
				{ id: 6, name: 'Production Line', formKey: 'production_line_column_name' },
				{ id: 13, name: 'Utility', formKey: 'utility_column_name' },
				{ id: 7, name: 'Machine', formKey: 'machine_column_name', required: true },
				{ id: 8, name: 'Machine image', formKey: 'machine_picture_name' },
				{ id: 9, name: 'Loc on Machine', formKey: 'loc_on_machine_column_name' },
				{
					id: 10,
					name: 'Application',
					formKey: 'application_column_name',
					required: true
				},
				{ id: 11, name: 'IM Asset #', formKey: 'asset_column_name', required: true },
				{ id: 12, name: 'item_types', formKey: 'types_column_name', required: true }
			]),

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

		selectedItemTypes() {
			if (this.equipment_type_ids.length && this.equipmentTypesList.length) {
				return this.equipment_type_ids.map(id => {
					return findItemBy('id', id, this.equipmentTypesList);
				});
			}
			return [];
		}
	},

	methods: {
		...mapActions({
			import_motorIQ: 'testing/import_motorIQ',
			get_import_plant_progress: 'testing/get_import_plant_progress',
			fetch_log: 'testing/fetch_log',

			show_edit_modal: 'show_edit_modal',

			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			set_import_state: 'testing/set_state_prop'
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

		onStart() {
			if ( this.validateSubItemsForm(this.subItemsSettings) ) {
				this.handleSubmit(
					this.collectDataFromSubItems(this.subItemsSettings).result
				);
			} else {
				let message = 'Required Item Type options';
				/*if (!optionsValid) {
					message += 'Some of Item Type options';
				}*/
				/*if (data.medias.length && !mediasHasFiles) {
					message += ', ZIP files for medias';
				}*/

				this.$notify({
					type: 'warning',
					title: "Data isn't ready",
					message: `${message} should be assigned...`
				});
				return false;
			}
		},

		handleSubmit(subItemsData) {
			try {
				const droppedItems = document.querySelectorAll(
					'.headings-list .drag-n-drop-item.is-common'
				);
				const { uploadedFileName } = this;

				let data = {
					file_name: uploadedFileName,

					company_column_name: '',
					plant_column_name: '',
					storeroom_column_name: '',
					storeroom_location_column_name: '',
					location_column_name: '',
					production_line_column_name: '',
					utility_column_name: '',
					application_column_name: '',
					machine_column_name: '',
					machine_picture_name: '',
					asset_column_name: '',
					loc_on_machine_column_name: '',

					types_column_name: '',

					types: subItemsData || [],
				};
				// console.log('1', data)
				for (const nodeItem of droppedItems) {
					const { /*itemName,*/ itemFormKey } = nodeItem.dataset;

					const columnName = nodeItem.parentElement.parentElement.querySelector(
						'[data-column-name]'
					).dataset.columnName;

					data[itemFormKey] = columnName;
				}
				// console.log('data ', data)
				// let typesValid = data.types.length;

				const requiredOptions = this.predefined_type_options.filter(
					oi => oi.required
				);
				// console.log(requiredOptions)
				const isValid = requiredOptions.every(
					ro => !!data[ro.formKey]
				); /*&& typesValid*/

				if (isValid) {
					for (const key in data) {
						if (!data[key]) {
							delete data[key];
						}
					}

					const payload = {
						data: data,
						notNotify: true
						// withFile: mediasHasFiles
					};
					/*if (payload) {
						console.log(payload)
						return
					}*/

					this.$emit('event', {
						eventName: 'handleImportProcessing',
						data: true
					});

					this.import_motorIQ(payload)
						.then(({ value }) => {
							const { log } = value;

							this.getImportProgress({
								logId: log.id,
								progressAction: 'get_import_plant_progress'
							});
							/*this.$emit('event', {
								eventName: 'setCurrentLog',
								data: log.id
							});*/

							/*this.$notify({
								type: 'warning',
								title: "Import Log",
								message: this.getLogText(log),
								dangerouslyUseHTMLString: true,
								duration: 0
							})*/
							/*this.$emit('event', {
								eventName: 'handleImportSuccess'
								response: value
							});*/
						})
						.catch(error => {
							console.warn(error);
							this.$emit('event', {
								eventName: 'handleImportProcessing',
								data: false
							});
						});
					// console.log(response)
					// this.equipment_type_id = null;
				} else {
					// console.log(data)
					let message = '';
					if (!isValid) {
						message += 'Required options and some of Item Types';
					}
					/*if (data.medias.length && !mediasHasFiles) {
						message += ', ZIP files for medias';
					}*/

					this.$notify({
						type: 'warning',
						title: "Data isn't ready",
						message: `${message} should be assigned...`
					});
					return false;
				}
			} catch (e) {
				console.warn(e);
			}
		},

		successImportCallback({ logId }) {
			this.$notify({
				type: 'success',
				title: 'Import Complete',
				dangerouslyUseHTMLString: true,
				message: `<a href="${window.location.origin}/plant-import-logs/${logId}" target="_blank" class="primary-color semi-bold standard">Master Data Dashboard</a>`
			});

			/*this.fetch_log({ itemId: request_payload.itemId }).then(response => {
				this.set_import_state({
					stateProp: 'lastImportLog',
					value: response.value
				})
				// this.changeRoute({ path: '/import-log' });
			})*/

			// if (this.afterImportRedirectTo) {
			// }
		}
	}
};
</script>
