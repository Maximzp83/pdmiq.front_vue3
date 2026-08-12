<template>
	<div :class="{ js_hidden: editModal.hideModal }">
		<CoverOverlay
			:active="editModal.show"
			:z="1800"
			@onClick="handleCloseEditModal"
		/>

		<CustomModal
			:className="
				`dynamic-form-modal ${modalTypeClass} ${multiformClass} ${
					editModal.modalClassName || ''
				} ${modalSize}`
			"
			:headerClass="editModal.headerClass"
			:active="editModal.show"
			:title="modalTitle"
			:activeSpinner="modalSpinnerActive"
			:spinnerText="modalSpinnerText"
			:hideFooter="editModal.hideFooter || editModal.multiform"
			@onClose="handleCloseEditModal"
		>
			<component
				v-if="componentFile"
				:is="componentFile"
				ref="ItemFormComponent"
				:editModal="editModal"
				:itemData="editModal.instanceData"
				:fromModal="true"
				:settings="editModal.settings"
				:formSettings="editModal.formSettings"
				:additionalSettings="additionalSettings"
				@event="handleEvent"
				@vue:mounted="handleComponentMounted"
			/>

			<template #header>
				<div v-if="editModal.headerActions" class="header-actions">
					<TableAction
						v-for="(action, idx) in editModal.headerActions"
						:key="`header_action-${action.name}-${idx}`"
						class="borderless-button"
						:rowData="editModal.instanceData"
						:action="action"
						buttonSize="default"
						@event="handleAction"
					/>
				</div>
			</template>

			<template #footer>
				<ElButton
					v-if="!editModal.hideSubmitButtons"
					type="primary"
					native-type="button"
					class="item-action-button"
					@click="saveModalItem"
				>
					<span class="uppercase">{{ editModal.saveButtonText || tt('SAVE') }}</span>
				</ElButton>

				<div v-if="editModal.footerActions" class="footer-actions">
					<TableAction
						v-for="(action, idx) in editModal.footerActions"
						:key="`footer_action-${action.name}-${idx}`"
						:action="action"
						buttonSize="default"
						@event="handleAction"
					/>
				</div>
			</template>
		</CustomModal>
	</div>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue';
import { ElButton } from 'element-plus';
// import { storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores/GlobalStore';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import CoverOverlay from '@/components/common/CoverOverlay.vue';
import CustomModal from '@/components/common/CustomModal.vue';

const TableAction = defineAsyncComponent(
	() => import('@/components/table/TableAction.vue')
);

const props = defineProps({
	editModalProp: {
		type: String,
		default: 'editModal',
	},
});

const emit = defineEmits(['event']);

const globalStore = useGlobalStore();
const { show_edit_modal } = globalStore;

const isSaving = ref(false);
const isLoadingComponent = ref(false);
const ItemFormComponent = ref(null);

const tt = (key) => Lang.tt(key);

const editModal = computed(() => {
	const modalProp = props.editModalProp || 'editModal';
	return globalStore[modalProp];
});

/*const componentFile = computed(() => {
	const { formComponentFileLoader, multiform } = editModal.value;

	if (props.componentFileLoader) {
		return defineAsyncComponent(props.componentFileLoader);
	}
	return null;
});*/

const componentFile = computed(() => {
	const { componentFileLoader, formComponentFileLoader } = editModal.value;

	if (componentFileLoader) {
		return defineAsyncComponent(componentFileLoader);
	}
	if (formComponentFileLoader) {
		return defineAsyncComponent(formComponentFileLoader);
	}
	return null;
});

const additionalSettings = computed(() =>
	editModal.value.additionalSettings || editModal.value.additionalModalSettings || {}
);

const modalTitle = computed(() => {
	const modal = editModal.value;
	modal.itemName = modal.itemName || 'Item';

	if (modal.title) return modal.title;
	if (modal.instanceData) {
		return `${tt('Edit')} ${modal.itemName}`;
	}
	return `${tt('Create')} ${modal.itemName}`;
});

const modalTypeClass = computed(() => {
	const { editModalProp } = props;
	return editModalProp == 'editModalClassic' || editModalProp == 'editModalClassicSecond'
		? 'classic-modal'
		: 'editItem-dialog';
});

const modalSize = computed(() => {
	const modal = editModal.value;
	return modal.size || 'standard';
});

const modalSpinnerActive = computed(() => isSaving.value || isLoadingComponent.value);
const modalSpinnerText = computed(() =>
	editModal.value.spinnerText || `${editModal.value.itemName || ''} ${tt('saving')}...`.trim()
);

const multiformClass = computed(() => {
	const modal = editModal.value;
	return modal.multiform ? 'multiform' : '';
});

const toggleSaving = (saving) => {
	isSaving.value = saving;
};

const handleComponentMounted = () => {
	isLoadingComponent.value = false;
};

const handleCloseEditModal = () => {
	if (editModal.value.closeCallback) {
		editModal.value.closeCallback();
	} else {
		show_edit_modal({
			editModalProp: props.editModalProp,
			size: editModal.value.size,
			show: false,
		});
	}
};

const saveModalItem = () => {
	if (ItemFormComponent.value && ItemFormComponent.value.validateForm) {
		ItemFormComponent.value.validateForm({editModal: editModal.value});
	}
};

const handleAction = ({ data }) => {
	const { name, callInRoot } = data;

	if (name === 'handleCloseEditModal') {
		handleCloseEditModal();
	} else if (callInRoot) {
		if (typeof window[name] === 'function') {
			window[name](data);
		}
	} else if (
		ItemFormComponent.value &&
		typeof ItemFormComponent.value[name] === 'function'
	) {
		ItemFormComponent.value[name](data);
	} else {
		console.warn(`Action ${name} does not exist`);
	}
};

const successModalSubmit = (answer) => {
	if (editModal.value.successSubmitCallback) {
		editModal.value.successSubmitCallback(answer);
	}
};

const { handleEvent } = useEventHandler({
	toggleSaving,
	successModalSubmit,
	handleCloseEditModal,
}, emit);

watch(
	() => editModal.value.show,
	(show) => {
		isLoadingComponent.value = show ? !!editModal.value.activeSpinner : false;
		if (show !== undefined && !show) {
			setTimeout(() => {
				show_edit_modal({ editModalProp: props.editModalProp });
			}, 400);
		}
	}
);

defineExpose({
	toggleSaving,
	successModalSubmit,
});
</script>
