<template>
	<div class="view-content-card card content-row connected-card master-upload-page">
		<div class="card-content">
			<div class="content-row">
				<Filterbar
					:itemsLoading="isUploading"
					:itemsName="itemsName"
					hideCreate
					hideDelete
					hidePerPageFilter
					hideSearchbar
					@event="handleEvent"
				>
					<template #prefix-items>
						<ImportForm
							ref="importFormRef"
							class="mcol-xs-12 mcol-sm-auto"
							showSubmitButtons
							showStart
							:showRevert="showRevert && isImportSuccess"
							:isProcessingRevert="isProcessingRevert"
							:submitActionProp="uploadSubmitActionProp"
							:isUploading="isUploading"
							:isImporting="isImporting"
							:disableStart="!uploadedFileName"
							@event="handleEvent"
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
									background-color="rgba(255, 255, 255, .7)"
								/>

								<div class="cells-list headings-list drag-n-drop-list can-drop">
									<div class="cell-item heading-item">
										<div class="medium">
											{{ tt('phrases.loaded_results_from_file') }}
										</div>
									</div>

									<div
										v-for="(item, idx) in headingsList"
										ref="dropZoneRefs"
										:key="`heading-${item}-${idx}`"
										class="cell-item heading-item"
									>
										<div :data-column-name="item" v-text="item"></div>
										<div class="item-drop-zone"></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="in-system-block mcol-xs-12 mcol-sm-4">
						<div v-if="activateContainer" class="card">
							<div class="card-header filled semi-bold">{{ tt('IN_SYSTEM') }}</div>

							<component
								:is="componentFile"
								ref="importOptionsContainerRef"
								:uploadedFileName="uploadedFileName"
								:plantId="plantId"
								:currentLogId="currentLogId"
								@event="handleEvent"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import { Lang } from '@/localization';
import { useNotify } from '@/composables/useNotify';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useDragNdropDroppable } from '@/composables/mixins/useDragNdropDroppable';

import Filterbar from '@/components/common/Filterbar.vue';
import VueElementLoading from '@/components/common/VueElementLoading.vue';
import ImportForm from './ImportForm.vue';
import CustomProgressbar from '@/components/common/CustomProgressbar.vue';

const { tt } = Lang;

defineOptions({ name: 'ImportContainer' });

const props = defineProps({
	componentFileLoader: Function,
	showRevert: Boolean,
	revertAction: Function,
	uploadSubmitActionProp: { type: String, default: 'upload_masterDB' },
	plantId: null,
	enableProgressbar: Boolean,
});

const importFormRef = ref(null);
const { Notify } = useNotify();
const importOptionsContainerRef = ref(null);
const isUploading = ref(false);
const isImporting = ref(false);
const isImportSuccess = ref(false);
const isProcessingRevert = ref(false);
const importProgress = ref(0);
const currentLogId = ref(null);
const activateContainer = ref(true);
const uploadedFileName = ref('');
const uploadedMainZIPFileName = ref('');
const uploadedDrawingZIPFileName = ref('');
const headingsList = ref([]);
const dropZoneRefs = ref([]);

const componentFile = computed(() =>
	props.componentFileLoader ? defineAsyncComponent(props.componentFileLoader) : null,
);
const itemsName = computed(() => Object.freeze({
	one: tt('Log'),
	mult: tt('Logs'),
}));

const { setupDraggable, destroyDroppable } = useDragNdropDroppable({
	wrapperSelector: '.drag-n-drop-wrapper',
	containersQuantity: 2,
	dragStartCallback: (event) => {
		if (!event.sensorEvent.target.classList.contains('drag-n-drop-item')) event.cancel();
	},
	dropValidateCallback: (event) =>
		event.dropzone.parentElement.classList.contains('heading-item') ||
		event.data.dragEvent.originalSource.dataset.itemName === event.dropzone.dataset.dropzoneName,
});

const refreshDropContainers = () => {
	activateContainer.value = false;
	nextTick(() => {
		activateContainer.value = true;
		destroyDroppable();
		nextTick(setupDraggable);
	});
};
const successModalSubmit = ({ value } = {}) => {
	uploadedFileName.value = value?.file_name || '';
	uploadedMainZIPFileName.value = value?.main_zip_file_name || '';
	uploadedDrawingZIPFileName.value = value?.drawing_zip_file_name || '';
	headingsList.value = value?.headings || [];
	nextTick(setupDraggable);
};
const toggleSaving = (value) => {
	isUploading.value = value;
};
const onRevert = () => {
	importOptionsContainerRef.value?.onRevert?.(props.revertAction);
};
const onStart = () => {
	const ref = importOptionsContainerRef.value;
	if (!ref) return;
	if (ref.handleValidateRefsItems) {
		ref.handleValidateRefsItems();
		return;
	}
	ref.onStart?.();
};
const handleImportProcessing = (isProcessing) => {
	isImporting.value = isProcessing;
};
const handleImportProgress = (progress) => {
	importProgress.value = progress;
};
const setCurrentLog = (id) => {
	currentLogId.value = id;
};
const handleImportReverting = (isProcessing) => {
	isProcessingRevert.value = isProcessing;
};
const handleImportRevertingSuccess = () => {
	isImportSuccess.value = false;
};
const clearImportData = (response) => {
	headingsList.value = [];
	uploadedFileName.value = '';
	importFormRef.value?.clearFiles?.();
	refreshDropContainers();
	importProgress.value = 0;
	isImporting.value = false;
	if (response) {
		// Kept for parity with Vue2 callback surface.
	}
};
const handleImportSuccess = ({ notNotify } = {}) => {
	isImporting.value = false;
	isImportSuccess.value = true;
	clearImportData();
	if (!notNotify) {
		Notify({
			type: 'success',
			message: tt('phrases.import_process_funished_successfully'),
		});
	}
};

const { handleEvent } = useEventHandler({
	successModalSubmit,
	toggleSaving,
	onStart,
	onRevert,
	handleImportProcessing,
	handleImportProgress,
	setCurrentLog,
	handleImportReverting,
	handleImportRevertingSuccess,
	handleImportSuccess,
	clearImportData,
	refreshDropContainers,
});

onMounted(() => {
	document.querySelector('.dashboard-content-container')?.classList.add('disable-transformZ');
});

onBeforeUnmount(() => {
	document.querySelector('.dashboard-content-container')?.classList.remove('disable-transformZ');
});
</script>
