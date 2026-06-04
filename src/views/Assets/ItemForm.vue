<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Asset')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" required :placeholder="`${tt('input')} ${tt('name')}`" />
			</el-form-item>

			<el-form-item :label="tt('Machine')" prop="machine_id">
				<CustomSelectV2
					v-model="formData.machine_id"
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('Select')} ${tt('machine')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Location')" prop="location_id">
				<CustomSelectV2
					v-model="formData.location_id"
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="filteredLocationsList"
					:placeholder="`${tt('Select')} ${tt('Location')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Downtime')} ${tt('Cost')}`" prop="downtime_cost">
				<el-input v-model.number="formData.downtime_cost" />
			</el-form-item>

			<el-form-item :label="tt('Attachments')" prop="libraries">
				<div class="options-container">
					<div v-if="librariesItemsList.length" class="content-row">
						<AttachmentItem
							v-for="(item, idx) in librariesItemsList"
							:key="`attach_item-${item.id}`"
							:ref="(el) => setSubItemRef('AttachmentItem', el, idx)"
							:item-data="item"
							:item-index="idx"
							@onRemove="(id) => removeFormItem(id, librariesItemsList)"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="small"
							type="success"
							@click="addFormItem(librariesItemsList, 'a_i-')"
						>
							<i class="icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>

			<el-form-item v-if="itemData?.id" :label="tt('Order')">
				<CustomSelectV2
					v-model="desiredId"
					filterable
					:optionsLoading="assetsLoading"
					:optionsList="filteredAssetsList"
					:placeholder="`${tt('select')} ${tt('asset')} ${tt('phrases.whose_order_you_want')}`"
				/>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useAssets } from '@/composables/useAssets';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import AttachmentItem from './AttachmentItem.vue';

const { tt } = Lang;

defineOptions({ name: 'AssetForm' });

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { reorderAsset } = useAssets();

const itemFormRef = ref(null);
const machinesLoading = ref(false);
const machinesList = shallowRef([]);
const assetsLoading = ref(false);
const assetsList = shallowRef([]);
const librariesItemsList = ref([]);
const desiredId = ref(null);
const refsMap = ref({
	AttachmentItem: [],
});

const initialFormData = {
	name: '',
	machine_id: null,
	location_id: null,
	composed: [],
	downtime_cost: 0,
	libraries: [],
};
const formData = ref({ ...initialFormData });

const itemData = computed(() => props.itemData);
const showPlant = computed(() => globalStore.navbarSettings?.showPlantName || null);
const currentPlantId = () => globalFilters.value?.plantId || showPlant.value?.id || props.itemData?.plant_id;
const selectedMachine = computed(() =>
	formData.value.machine_id && machinesList.value.length
		? findItemBy('id', formData.value.machine_id, machinesList.value)
		: null,
);
const filteredLocationsList = computed(() => selectedMachine.value?.locations || []);
const filteredAssetsList = computed(() =>
	props.itemData?.id
		? assetsList.value.filter((item) => item.id !== props.itemData.id)
		: [],
);
const rules = {
	name: required,
	location_id: null,
	machine_id: required,
};
const subItemsSettings = computed(() =>
	Object.freeze([{ ref: 'AttachmentItem', targetProp: 'libraries', removeFilePropIfNull: true }]),
);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({ formData, refsMap });

const methodsMap = {
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
};
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			actionName: 'fetch_machines',
			payload: { params: { max: -1, plantId: currentPlantId } },
			bindTo: [
				{
					getValue: () => props.editModal?.formSettings?.productionLineId,
					param: 'productionLineId',
					fetchAnyWay: true,
				},
			],
			localProp: machinesList,
			localLoadProp: machinesLoading,
		},
		{
			actionName: 'fetch_assets',
			payload: { params: { max: -1, plantId: currentPlantId } },
			localProp: assetsList,
			localLoadProp: assetsLoading,
		},
	]),
);

const localSetupPage = (item) => {
	if (item) {
		librariesItemsList.value = setupFormSubItemsList(item.libraries, 'a_i');
		return;
	}

	librariesItemsList.value = [];
	if (props.editModal?.formSettings?.machineId) {
		formData.value.machine_id = props.editModal.formSettings.machineId;
	}
};
const localPrepareSubmitData = (data) => {
	if (!data.downtime_cost) {
		delete data.downtime_cost;
	}
	return data;
};
const successSubmitCallback = () => {
	if (props.itemData?.id && desiredId.value) {
		reorderAsset({
			notNotify: true,
			data: {
				currentId: +props.itemData.id,
				desiredId: +desiredId.value,
				className: props.itemData.className,
			},
		});
	}
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Assets',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	localPrepareSubmitData,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	uploadSettings: Object.freeze([{ fileProp: 'libraries', multiple: true }]),
	successSubmitCallback,
	emit,
});

watch(
	() => formData.value.machine_id,
	() => {
		if (!props.itemData?.id) formData.value.location_id = null;
	},
);

useRequestsList({ methodsMap, requestsToDoList });

defineExpose({ validateForm });
</script>
