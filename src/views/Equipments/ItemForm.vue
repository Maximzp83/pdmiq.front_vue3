<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Status')" class="half-width">
				<CustomSelectV2
					v-model="statusId"
					:optionsList="statusesList"
					:placeholder="`${tt('select')} ${tt('status')}`"
					@update:model-value="handleStatusChange"
				/>
			</el-form-item>

			<el-form-item v-show="statusId === STATUSES_TYPES.ASSET" :label="tt('Asset')" prop="asset_id" class="half-width">
				<CustomSelectV2
					v-model="formData.asset_id"
					filterable
					clearable
					:optionsLoading="assetsLoading"
					:optionsList="assetsList"
					:placeholder="`${tt('select')} ${tt('asset')}`"
					@update:model-value="handleChangeAsset"
				/>
			</el-form-item>

			<el-form-item v-show="statusId === STATUSES_TYPES.STORE" :label="tt('Storeroom')" prop="store_room_id" class="half-width">
				<CustomSelectV2
					v-model="formData.store_room_id"
					filterable
					clearable
					:optionsLoading="storeRoomsLoading"
					:optionsList="storeRoomsList"
					:placeholder="`${tt('select')} ${tt('Storeroom')}`"
				/>
			</el-form-item>

			<el-form-item v-show="statusId === STATUSES_TYPES.STORE" :label="`${tt('Storeroom')} ${tt('location')}`" prop="store_room_location_id" class="half-width">
				<CustomSelectV2
					v-model="formData.store_room_location_id"
					filterable
					clearable
					:optionsList="storeRoomLocationsList"
					:placeholder="`${tt('select')} ${tt('location')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('item_type')" prop="equipment_type_id" class="half-width">
				<CustomSelectV2
					v-model="formData.equipment_type_id"
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Drive')} ${tt('Type')}`" prop="drive_type_id" class="half-width">
				<CustomSelectV2
					v-model="formData.drive_type_id"
					filterable
					clearable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="drivesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Brand')" prop="brand_id" class="half-width">
				<CustomSelectV2
					v-model="formData.brand_id"
					filterable
					clearable
					:optionsLoading="brandsLoading"
					:optionsList="brandsList"
					:placeholder="`${tt('select')} ${tt('brand')}`"
					@update:model-value="handleChangeBrand"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Part')} ${tt('Number')}`" prop="brand_model_id" class="half-width content-row">
				<CustomSelectV2
					v-model="formData.brand_model_id"
					filterable
					clearable
					:optionsLoading="brandModelsLoading"
					:optionsList="brandModelsList"
					:placeholder="`${tt('select')} ${tt('part_number')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('url')" prop="url">
				<el-input v-model="formData.url" />
			</el-form-item>

			<el-form-item :label="`${tt('Location')} ${tt('on')} ${tt('Machine')}`" prop="loc_on_machine">
				<CustomInput v-model="formData.loc_on_machine" />
			</el-form-item>

			<el-form-item :label="tt('phrases.is_limbo')" prop="is_limbo">
				<el-switch v-model="formData.is_limbo" />
			</el-form-item>

			<el-form-item :label="tt('StoreRoom')" prop="is_store_room">
				<el-switch v-model="formData.is_store_room" />
			</el-form-item>

			<el-form-item :label="tt('Pictures')" prop="pictures">
				<FileUploadBlock
					:ref="(el) => setSubItemRef('PicturesUploadBlock', el, 0)"
					:pictures="itemImagesList"
					multiple
				/>
			</el-form-item>

			<el-form-item :label="tt('Nameplate')" prop="pictures">
				<FileUploadBlock
					:ref="(el) => setSubItemRef('NameplateUploadBlock', el, 0)"
					:pictures="nameplateImagesList"
					multiple
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
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useMultiform } from '@/composables/mixins/useMultiform';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentItemForm' });

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const itemFormRef = ref(null);
const statusId = ref(null);
const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);
const brandsLoading = ref(false);
const brandsList = shallowRef([]);
const brandModelsLoading = ref(false);
const brandModelsList = shallowRef([]);
const storeRoomsLoading = ref(false);
const storeRoomsList = shallowRef([]);
const assetsLoading = ref(false);
const assetsList = shallowRef([]);
const itemImagesList = ref([]);
const nameplateImagesList = ref([]);
const refsMap = ref({
	PicturesUploadBlock: [],
	NameplateUploadBlock: [],
});

const STATUSES_TYPES = Object.freeze({ ASSET: 1, STORE: 2 });
const statusesList = computed(() =>
	Object.freeze([
		{ id: STATUSES_TYPES.ASSET, name: tt('Asset') },
		{ id: STATUSES_TYPES.STORE, name: tt('Storeroom') },
	]),
);
const initialFormData = {
	plant_id: null,
	asset_id: null,
	brand_id: null,
	brand_model_id: null,
	equipment_type_id: null,
	drive_type_id: null,
	is_limbo: false,
	loc_on_machine: '',
	url: '',
	is_store_room: false,
	store_room_id: null,
	store_room_location_id: null,
	libraries: [],
	pictures: [],
	rpm_formula: '{value}',
	vibration_analysis_rules: [],
	child_components: [],
};
const formData = ref({ ...initialFormData });
const instancesItemsData = computed(() => props.instancesItemsData || null);
const itemData = computed(() => props.itemData || {});
const currentPlantId = computed(() => formData.value.plant_id || globalFilters.value?.plantId || authStore.authUser?.plant_id);
const selectedEquipmentType = computed(() =>
	formData.value.equipment_type_id ? findItemBy('id', formData.value.equipment_type_id, equipmentTypesList.value) : null,
);
const drivesList = computed(() => selectedEquipmentType.value?.drive_types || []);
const selectedStoreroom = computed(() =>
	formData.value.store_room_id ? findItemBy('id', formData.value.store_room_id, storeRoomsList.value) : null,
);
const storeRoomLocationsList = computed(() => selectedStoreroom.value?.locations || []);
const rules = {
	plant_id: required,
	brand_id: required,
	brand_model_id: required,
	equipment_type_id: required,
	asset_id: null,
};
const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'PicturesUploadBlock', targetProp: 'pictures' },
		{ ref: 'NameplateUploadBlock', targetProp: 'pictures' },
	]),
);

const {
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({ formData, refsMap });

const methodsMap = {
	fetch_equipment_types: createGetRequest(ENTITIES.EquipmentTypes.apiBase),
	fetch_brands: createGetRequest(ENTITIES.Brands.apiBase),
	fetch_brand_models: createGetRequest(ENTITIES.BrandModels.apiBase),
	fetch_store_rooms: createGetRequest(ENTITIES.StoreRooms.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
};
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			actionName: 'fetch_equipment_types',
			payload: { params: { max: -1 } },
			localProp: equipmentTypesList,
			localLoadProp: equipmentTypesLoading,
		},
		{
			actionName: 'fetch_brands',
			payload: { params: { max: -1, equipmentTypeId: formData.value.equipment_type_id } },
			bindTo: [{ getValue: () => formData.value.equipment_type_id, param: 'equipmentTypeId' }],
			localProp: brandsList,
			localLoadProp: brandsLoading,
		},
		{
			actionName: 'fetch_brand_models',
			payload: { params: { max: 30, brandId: formData.value.brand_id, equipmentTypeId: formData.value.equipment_type_id } },
			bindTo: [
				{ getValue: () => formData.value.brand_id, param: 'brandId' },
				{ getValue: () => formData.value.equipment_type_id, param: 'equipmentTypeId' },
			],
			localProp: brandModelsList,
			localLoadProp: brandModelsLoading,
		},
		{
			actionName: 'fetch_store_rooms',
			payload: { params: { max: -1, plantId: currentPlantId.value } },
			bindTo: [{ getValue: () => currentPlantId.value, param: 'plantId' }],
			localProp: storeRoomsList,
			localLoadProp: storeRoomsLoading,
		},
		{
			actionName: 'fetch_assets',
			payload: { params: { max: -1, plantId: currentPlantId.value } },
			bindTo: [{ getValue: () => currentPlantId.value, param: 'plantId' }],
			localProp: assetsList,
			localLoadProp: assetsLoading,
		},
	]),
);

const localSetupPage = (item) => {
	if (item?.id) {
		statusId.value = item.store_room_id ? STATUSES_TYPES.STORE : STATUSES_TYPES.ASSET;
		itemImagesList.value = (item.pictures || []).filter((picture) => !picture.is_nameplate);
		nameplateImagesList.value = (item.pictures || []).filter((picture) => picture.is_nameplate);
		return;
	}
	statusId.value = props.editModal?.formSettings?.store_room_id ? STATUSES_TYPES.STORE : STATUSES_TYPES.ASSET;
	formData.value.plant_id = currentPlantId.value;
	if (props.editModal?.formSettings?.asset_id) {
		formData.value.asset_id = props.editModal.formSettings.asset_id;
	}
	setupByParentInstance(instancesItemsData.value, 'asset', 'asset_id');
};
const localPrepareSubmitData = (data) => {
	const nextData = { ...data, plant_id: data.plant_id || currentPlantId.value };
	if (statusId.value === STATUSES_TYPES.ASSET) {
		nextData.store_room_id = null;
		nextData.store_room_location_id = null;
		nextData.is_store_room = false;
	} else {
		nextData.asset_id = null;
		nextData.is_store_room = true;
	}
	return nextData;
};
const handleStatusChange = (value) => {
	statusId.value = value;
	if (value === STATUSES_TYPES.ASSET) {
		formData.value.store_room_id = null;
		formData.value.store_room_location_id = null;
	} else {
		formData.value.asset_id = null;
	}
};
const handleChangeAsset = (assetId) => {
	formData.value.asset_id = assetId;
};
const handleChangeBrand = () => {
	formData.value.brand_model_id = null;
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Equipments',
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
	uploadSettings: Object.freeze([{ fileProp: 'pictures', multiple: true }]),
	emit,
});

const { setupByParentInstance } = useMultiform({
	emit,
	formData,
	instancesItemsData,
	multiFormFilters: computed(() => props.multiFormFilters || null),
});

watch(
	() => formData.value.equipment_type_id,
	() => {
		formData.value.brand_id = null;
		formData.value.brand_model_id = null;
	},
);

useRequestsList({ methodsMap, requestsToDoList });

defineExpose({ validateForm });
</script>
