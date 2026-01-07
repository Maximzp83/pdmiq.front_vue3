<template>
	<div class="view-wrapper item-page-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card">
				<div class="card-content">
					<div class="import-log-list" v-if="lastImportLog">
						<div class="title article-title semi-bold">{{ tt('log') }}:</div>
						<div v-for="(value, key) in lastImportLog" :key="`key-${key}`">
							<div v-if="key == 'items'">
								<div class="title article-title semi-bold">
									{{ `${tt('Errors')}:` }}
								</div>
								<div v-for="errorItem in value" :key="`error-${errorItem.id}`">
									<div>
										<span class="label">{{ `${tt('Error')}:` }}</span>
										<span>{{ errorItem['error'] }}</span>
									</div>
									<div>
										<span class="label">row_number: </span>
										<span class="value">{{ errorItem['row_number'] }}: </span>
									</div>
								</div>
							</div>

							<div v-else>
								<span class="label">{{ key }}: </span>
								<span class="value">{{ value || 'null' }}</span>
							</div>
						</div>
					</div>

					<div class="text-center" v-else>
						{{ `${tt('import_log_is_empty')}` }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { findItemBy } from '@/helpers';

export default {
	components: {},

	data() {
		return {};
	},

	computed: {
		lastImportLog() {
			return this.$store.state.testing.lastImportLog;
			/*return Object.freeze({
				"id": 171,
				"type": 3,
				"uploaded_file_name": "edmonton_test2.csv",
				"import_file_name": "edmonton_test2-2023-08-23-11-47-06.csv",
				"archives": null,
				"total_rows": 9,
				"imported_rows": 9,
				"count_error": 13,
				"count_duplicate": 0,
				"count_success": 10,
				"process_upload_images": 27,
				"completed_upload_images": 21,
				"failed_upload_images": 0,
				"date_start": "2023-08-23T11:46:23.000000Z",
				"date_end": "2023-08-23T11:48:26.000000Z",
				"revert_start_date": null,
				"revert_end_date": null,
				"error": null,
				"processing": 0,
				"items": [
				{
					"id": 464,
					"log_id": 171,
					"row_number": 2,
					"error": "The application's name is empty"
				},
				{
					"id": 465,
					"log_id": 171,
					"row_number": 3,
					"error": "The cells of the storeroom - Store Test 1 and the location - Chiller Compressor Area are filled."
				},
				{
					"id": 466,
					"log_id": 171,
					"row_number": 3,
					"error": "The part number's name is empty"
				},
				{
					"id": 467,
					"log_id": 171,
					"row_number": 4,
					"error": "The cells of the storeroom -  and the location  are empty."
				},
				{
					"id": 468,
					"log_id": 171,
					"row_number": 4,
					"error": "The part number's name is empty"
				},
				{
					"id": 469,
					"log_id": 171,
					"row_number": 5,
					"error": "The Brand's name is empty"
				},
				{
					"id": 470,
					"log_id": 171,
					"row_number": 5,
					"error": "The part number's name is empty"
				},
				{
					"id": 471,
					"log_id": 171,
					"row_number": 6,
					"error": "The part number's name is empty"
				},
				{
					"id": 472,
					"log_id": 171,
					"row_number": 6,
					"error": "The part number's name is empty"
				},
				{
					"id": 473,
					"log_id": 171,
					"row_number": 7,
					"error": "The application's name is empty"
				},
				{
					"id": 474,
					"log_id": 171,
					"row_number": 9,
					"error": "The part number's name is empty"
				},
				{
					"id": 475,
					"log_id": 171,
					"row_number": 10,
					"error": "The application's name is empty"
				},
				{
					"id": 476,
					"log_id": 171,
					"row_number": 10,
					"error": "The part number's name is empty"
				}
				],
				"duplicate_brand_models": []
			})*/
		},

		navbarSettings: () => ({
			pageTitle: 'Import log',
			showFilter: true,
			showCreationMenu: true
		})
	},

	methods: {
		...mapActions({
			// show_edit_modal: 'show_edit_modal',
			// fetch_equipment_types: 'equipment_types/fetch_equipment_types'
		}),

		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		}

		/*getLogText(log)  {
			let text = '';
			
			for (const key in log) {
				if (key == 'items') {
					text += `<ul>Items:`;

					for (const item in log[key]) {
						const val = log[key][item];
						text += `<li>${item}: ${val}</li>`;
					}

					text += '</ul>'
				} else {
					text += `<div>${key}: ${log[key]}</div>`;
				}
			}

			return text;
		},*/
	},

	created() {
		this.setup_navbar(this.navbarSettings);
	}
};
</script>
