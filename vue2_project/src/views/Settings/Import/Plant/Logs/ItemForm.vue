<template>
	<div class="edit-form-container import-log-container">
		<!-- :validate="" -->
		<!-- <el-form-item :label="`${tt('application')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item> -->

		<!-- v-for="item in Rows" -->
		<LogRowItem
			@event="handleEventNew"
			ref="LogRowItem"
			v-for="item in itemRows"
			:key="`log-row-${item.id}-${item.row_number}`"
			:rowData="item"
			:equipmentTypesList="equipmentTypesList"
		/>

		<div v-if="!itemRows.length" class="text-center">
			Something Wrong. Error rows are empty...
		</div>
	</div>
</template>

<script>
// import { mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		LogRowItem: () => import('./LogRowItem.vue')
	},

	props: {
		fromAnotherInstance: Boolean,
		itemRows: {
			type: Array,
			default: () => []
		},
		equipmentTypesList: {
			type: Array,
			default: () => []
		},
		itemLoading: Boolean
	},

	/*data() {
		return {
			// plantsList: [],
			// plantsLoading: false,
		};
	},*/

	computed: {
		// Rows: that => that.itemData.rows.filter((row, idx) => idx < 3)
		/*logMock: () => Object.freeze(
			{
				"id": 179,
				"type": 1,
				"uploaded_file_name": "plant import - test1.xlsx",
				"import_file_name": "plant import - test1-2023-08-31-13-37-08.xlsx",
				"archives": null,
				"import_columns_name": {
					"types": [
						{
							"options": [
								{
									"id": 1610,
									"column_name": "motor_category"
								},
								{
									"id": 1613,
									"column_name": "voltage"
								},
								{
									"id": 1624,
									"column_name": "nominal_rpm"
								},
								{
									"id": 1835,
									"column_name": "hp_1"
								}
							],
							"type_id": 12,
							"brand_column_name": "motor_brand",
							"brand_model_column_name": "part_number",
							"equipment_picture_column_name": null,
							"equipment_nameplate_column_name": null
						},
						{
							"options": [{
								"id": 1608,
								"column_name": "gearbox_type"
							}],
							"type_id": 13,
							"brand_column_name": "gearbox_brand",
							"brand_model_column_name": "gearbox_part_number",
							"equipment_picture_column_name": null,
							"equipment_nameplate_column_name": null
						}
					],
					"file_name": "plant import - test1.xlsx",
					"asset_column_name": "im_asset",
					"plant_column_name": "plant_name",
					"types_column_name": "item_type",
					"company_column_name": "company_name",
					"machine_column_name": "machine_name",
					"location_column_name": "location",
					"machine_picture_name": null,
					"storeroom_column_name": "storeroom",
					"application_column_name": "application",
					"loc_on_machine_column_name": "loc_on_machine",
					"production_line_column_name": "production_line_name",
					"storeroom_location_column_name": "storeroom_location"
				},
				"total_rows": 2,
				"imported_rows": 2,
				"count_error": 0,
				"count_duplicate": 0,
				"count_success": 7,
				"process_upload_images": 0,
				"completed_upload_images": 0,
				"failed_upload_images": 0,
				"date_start": "2023-08-31T13:36:45.000000Z",
				"date_end": "2023-08-31T13:37:33.000000Z",
				"revert_start_date": null,
				"revert_end_date": null,
				"error": null,
				"processing": 0,

				"items": [
					{
						"id": 495,
						"log_id": 179,
						"row_number": 1,
						"column_name": "application",
						"imported_value": null,
						"existing_value": null,
						"error": "The application's name is empty"
					},
					{
						"id": 496,
						"log_id": 179,
						"row_number": 1,
						"column_name": "gearbox_part_number",
						"imported_value": null,
						"existing_value": null,
						"error": "The part number's name is empty"
					},
					{
						"id": 499,
						"log_id": 179,
						"row_number": 1,
						"column_name": "CT",
						"imported_value": "30",
						"existing_value": "20,25",
						"error": "The part number's name is empty"
					},
					{
						"id": 590,
						"log_id": 179,
						"row_number": 1,
						"column_name": "location",
						"imported_value": "Blending Room from import file",
						"existing_value": null,
						"error": "The cells of the storeroom - Storeroom and the location - Blending Room from import file are filled."
					},
					{
						"id": 591,
						"log_id": 179,
						"row_number": 1,
						"column_name": "hp_1",
						"imported_value": "0.85",
						"existing_value": "0.75",
						"error": "The HP import value is 0.85, exists value - 0.75"
					},
					{
						"id": 592,
						"log_id": 179,
						"row_number": 1,
						"column_name": "nominal_rpm",
						"imported_value": "3400",
						"existing_value": "3600, 3500",
						"error": "The Rpm Nominal import value is 3400, exists value - 3600"
					},
				],
				"rows": [
					{
						"id": 1,
						"log_id": 2,
						"row_number": 1,
						"values": {
							"storeroom": "Store test 1",
							"storeroom_location": "Blending Room",
							"application": null,

							"item_type": "Motor ",
							"loc_on_machine": null,
							"location": null,
							"machine_name": "000015 CALCIUM STEARATE",
							"production_line_name": "Hopper 5",
							// "motor_brand": "ABB",
							// "voltage": "220",
							// "CT": null
							"types": [
								{
									"type_id": 12,
									"motor_brand": "Baldor",
									"part_number": "CM3541",
									"options": {
										"hp_1": { "HP": "0.85"},
										"voltage": { "Voltage": "230/460"},
										"motor_category": { "Category": "General Purpose"},
										"nominal_rpm": { "Nominal Rpm": "3400"},
									},
								},
								{
									"type_id": 13,
									"gearbox_brand": "",
									// "gearbox_part_number": "E460/S09154581N",
									"gearbox_part_number": null,
									"options": {
										"Gearbox Type": { "Gearbox Type": "GWBP"}
									}
								}
							],
						}
					}
				],
				"duplicate_brand_models": []
			}
		),*/
		// requestsToDoList: () => [
		/*{
				action: 'fetch_plants',
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}*/
		// ]
	},

	methods: {}
};
</script>
