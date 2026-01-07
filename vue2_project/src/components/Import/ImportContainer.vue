<template>
	<div class="view-content-card card content-row connected-card master-upload-page">
		<div class="card-content">
			<div class="content-row">
				<Filterbar
					@event="handleEvent"
					:itemsLoading="isUploading"
					:itemsName="itemsName"
					hideCreate
					hideDelete
					hidePerPageFilter
					hideSearchbar
				>
					<!-- :actionButtons="actionButtons" -->
					<template v-slot:prefix-items>
						<ImportForm
							class="mcol-xs-12 mcol-sm-auto"
							ref="ImportForm"
							@event="handleEvent"
							showSubmitButtons
							showStart
							:showRevert="showRevert && isImportSuccess"
							:isProcessingRevert="isProcessingRevert"
							:submitActionProp="uploadSubmitActionProp"
							:isUploading="isUploading"
							:isImporting="isImporting"
							:uploadSettings="uploadSettings"
							:disableStart="!uploadedFileName"
						/>

						<div
							v-if="enableProgressbar && isImporting"
							class="mcol-xs-12 mcol-sm-1 progress-container"
						>
							<CustomProgressbar :progress="importProgress" />
						</div>
					</template>
				</Filterbar>
			</div>

			<div class="content-row drag-n-drop-wrapper">
				<div class="flex wrap mrow">
					<div class="downloaded-block mcol-xs-12 mcol-sm-8">
						<div class="card overflowHidden">
							<div class="card-header filled semi-bold uppercase">
								{{ tt('DOWNLOADED') }}
							</div>
							<div class="card-content relative no-paddings">
								<VueElementLoading
									class="section-block"
									:active="isUploading"
									spinner="line-scale"
									:text="`${tt('loading')}...`"
									:background-color="'rgba(255, 255, 255, .7)'"
								/>

								<div class="cells-list headings-list drag-n-drop-list can-drop">
									<div class="cell-item heading-item">
										<div class="medium">
											{{ tt('phrases.loaded_results_from_file') }}
										</div>
									</div>

									<div
										class="cell-item heading-item "
										v-for="(item, idx) in headingsList"
										:key="`heading-${item}-${idx}`"
										ref="DropZone"
									>
										<div :data-column-name="item" v-text="item"></div>
										<div class="item-drop-zone"></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="in-system-block mcol-xs-12 mcol-sm-4">
						<div class="card" v-if="activateContainer">
							<div class="card-header filled semi-bold">{{ tt('IN_SYSTEM') }}</div>

							<component
								ref="ImportOptionsContainer"
								@event="handleEventNew"
								:uploadedFileName="uploadedFileName"
								v-bind:is="componentFile"
								:plantId="plantId"
								:currentLogId="currentLogId"
							/>
						</div>
					</div>
				</div>
			</div>
			<!-- <button @click="refreshDropContainers">test</button> -->
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { findItemBy } from '@/helpers';
import { eventHandler, navigation, dragNdropDroppableMixin } from '@/mixins';

export default {
	mixins: [eventHandler(), navigation(), dragNdropDroppableMixin()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		ImportForm: () => import('./ImportForm.vue'),
		CustomProgressbar: () => import('@/components/common/CustomProgressbar.vue')
	},

	props: {
		componentPath: String,
		fromDashboard: {
			type: Boolean,
			default: true
		},
		showRevert: Boolean,
		revertAction: String,
		uploadSubmitActionProp: { type: String, default: 'upload_masterDB' },
		plantId: null,
		enableProgressbar: Boolean,
		afterImportRedirectTo: String
		// submitActionProp: { type: String, default: 'import_settings'}
	},

	data() {
		return {
			isUploading: false,
			isImporting: false,
			isImportSuccess: false,
			isProcessingRevert: false,
			importProgress: 0,
			currentLogId: null,
			// importProgressInterval: null,
			// importProgressTimer: 0,

			activateContainer: true,

			uploadedFileName: '',
			uploadedMainZIPFileName: '',
			uploadedDrawingZIPFileName: '',
			headingsList: []

			// openCreateForm: false,
			// collectedData: []
			/*itemsList: [
				{ id:1, errors: 123, created_at: '2021-09-10' },
				{ id:2, errors: 123, created_at: '2021-09-10' },
				{ id:3, errors: 123, created_at: '2021-09-10' },
			]*/
		};
	},

	computed: {
		componentFile() {
			const { componentPath } = this;
			// console.log(() => import(`@/${componentPath}.vue`))
			return () => import(`@/${componentPath}.vue`);
		},

		itemsName: that => ({
			one: that.$t('Log'),
			mult: that.$t('Logs')
		}),

		uploadSettings: () => ({
			fileProp: 'file'
		}),

		drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',
		drag_n_drop_containers_quantity: () => 2
	},

	methods: {
		...mapActions({
			set_import_state: 'testing/set_state_prop'

			// show_edit_modal: 'show_edit_modal',
			// maintenance_work_order_import: 'maintenance/import_work_order',
			// maintenance_work_order_revert: 'maintenance/revert_import_work_order',
			// delete_item: 'equipments/delete_equipments_faults',
		}),

		successModalSubmit({ value }) {
			//upload file success
			// console.log(value)
			this.uploadedFileName = value.file_name;
			this.uploadedMainZIPFileName = value.main_zip_file_name;
			this.uploadedDrawingZIPFileName = value.drawing_zip_file_name;
			this.headingsList = value.headings;
		},

		toggleSaving(isUploading) {
			this.isUploading = isUploading;
		},

		// ------Drop-----

		dragStartCallback(e) {
			// console.log(e.sensorEvent.data.target)
			if (!e.sensorEvent.target.classList.contains('drag-n-drop-item')) e.cancel();
			// this.droppableOrigin = e.originalSource.parentElement.dataset.dropzoneName;
		},

		dropValidateCallback(e) {
			// console.log(e.data.dragEvent.originalSource.dataset.itemName)
			return (
				e.dropzone.parentElement.classList.contains('heading-item') ||
				e.data.dragEvent.originalSource.dataset.itemName ==
					e.dropzone.dataset.dropzoneName
			);
		},

		onRevert() {
			this.$refs.ImportOptionsContainer.onRevert(this.revertAction);
		},

		onStart() {
			const ref = this.$refs.ImportOptionsContainer;
			// console.log(ref, ref.handleValidateRefsItems)
			if (ref) {
				if (ref.handleValidateRefsItems) {
					ref.handleValidateRefsItems();
				} else {
					ref.onStart();
				}
			}

			// this.isImporting = true;
			/*setTimeout(() => { this.importProgress = 20; }, 1000);
			setTimeout(() => { this.importProgress = 40; }, 2000);
			setTimeout(() => { this.importProgress = 60; }, 3000);
			setTimeout(() => { this.importProgress = 80; }, 4000);*/
			// let timer = null;
			/*const ping = () => {
				console.log(1)
				this.importProgressTimer += 1000;
			}

			this.importProgressInterval = setInterval(ping, 1000);*/

			/*setTimeout(() => {
				this.importProgress = 100;
				this.isImporting = false;
			}, 5000);*/
		},

		handleImportProcessing(isProcessing) {
			this.isImporting = isProcessing;
		},

		handleImportProgress(progress) {
			this.importProgress = progress;
		},

		setCurrentLog(id) {
			this.currentLogId = id;
		},

		handleImportReverting(isProcessing) {
			this.isProcessingRevert = isProcessing;
		},

		handleImportRevertingSuccess() {
			this.isImportSuccess = false;
		},

		handleImportSuccess({ notNotify }) {
			this.isImporting = false;
			this.isImportSuccess = true;
			this.clearImportData();
			if (!notNotify) {
				this.$notify({
					type: 'success',
					message: this.$t(`phrases.import_process_funished_successfully`)
				});
			}
		},

		clearImportData(response) {
			this.headingsList = [];
			this.uploadedFileName = '';
			this.$refs['ImportForm'].clearFiles();
			this.refreshDropContainers();
			this.importProgress = 0;
			this.isImporting = false;

			if (response) {
				this.importResponse = response;
			}
		},

		refreshDropContainers() {
			this.activateContainer = false;
			setTimeout(() => {
				this.activateContainer = true;
				this.destroyDroppable();
				setTimeout(() => {
					this.setupDraggable();
				}, 0);
			}, 0);
		}
	},

	mounted() {
		const content_container = document.querySelector(
			'.dashboard-content-container'
		);

		if (content_container) {
			content_container.classList.add('disable-transformZ');
		}
	},

	beforeDestroy() {
		const content_container = document.querySelector(
			'.dashboard-content-container'
		);

		if (content_container) {
			content_container.classList.remove('disable-transformZ');
		}
	}
};
</script>
