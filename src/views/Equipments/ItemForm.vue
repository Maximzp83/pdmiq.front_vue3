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
				<FetchByQuerySelect
					v-model="formData.asset_id"
					enableLoadmore
					clearable
					:optionsLoading="assetsLoading"
					:optionsList="assetsList"
					:placeholder="`${tt('start')} ${tt('typing')} ${tt('asset')}`"
					:settings="assetQueryOptions"
					@change="handleChangeAsset"
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
					@change="handleEquipmentTypeChange"
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
				<FetchByQuerySelect
					v-model="formData.brand_id"
					clearable
					enableLoadmore
					:optionsLoading="brandsLoading"
					:optionsList="brandsList"
					:placeholder="`${tt('select')} ${tt('brand')}`"
					:settings="brandQueryOptions"
					@change="handleChangeBrand"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Part')} ${tt('Number')}`" prop="brand_model_id" class="half-width content-row">
				<FetchByQuerySelect
					v-model="formData.brand_model_id"
					clearable
					enableLoadmore
					loadmoreIsActive
					:optionsLoading="brandModelsLoading"
					:optionsList="brandModelsList"
					:placeholder="`${tt('select')} ${tt('part_number')}`"
					:settings="brandModelsQueryOptions"
					@change="handleChangeBrandModel"
				/>
			</el-form-item>

			<div
				v-if="selectedEquipmentType && formData.brand_model_id && preparedVibrationAnalysisItems.length"
				class="content-row"
			>
				<b>{{ tt('Vibration_Analysis') }}:</b>
			</div>

			<div
				v-if="selectedEquipmentType && formData.brand_model_id && preparedVibrationAnalysisItems.length"
				class="form-section paint_v2 type_2 content-row"
			>
				<AnalysisRuleItem
					v-for="(rule, idx) in preparedVibrationAnalysisItems"
					:key="`va-${rule.original_rule_id}`"
					:ref="(el) => setSubItemRef('AnalysisRuleItem', el, idx)"
					class="content-row"
					:item-data="rule"
					:item-index="idx"
					:equipmentTypeId="selectedEquipmentType.id"
					:brandModelId="formData.brand_model_id"
					:rpm_source_value="rpmSourceValue"
				/>
			</div>

			<!-- --------------- -->

			<div v-if="preparedChildComponentsItems.length" class="content-row">
				<b>{{ `${tt('Child')} ${tt('Components')}` }}:</b>
			</div>

			<div v-if="preparedChildComponentsItems.length" class="content-row paint">
				<ChildComponentItem
					v-for="(child, idx) in preparedChildComponentsItems"
					:key="`child_component-${child.id ? child.id : idx}`"
					:ref="(el) => setSubItemRef('ChildComponentItem', el, idx)"
					:item-data="child"
					:item-index="idx"
					:equipmentTypesList="equipmentTypesList"
					:equipmentTypesLoading="equipmentTypesLoading"
					:rpm_source_value="rpmSourceValue"
				/>
			</div>

			<!-- --------------- -->

			<div class="content-row">
				<b>RPM</b>
			</div>

			<div class="form-section paint_v2 type_2 content-row">
				<el-form-item
					:label="tt('Specification')"
					prop="rpm_option_value_id"
					class="half-width"
				>
					<CustomSelectV2
						v-model="formData.rpm_option_value_id"
						filterable
						clearable
						:optionsLoading="rpmOptionsLoading"
						:optionsList="rpmOptionsList"
						:placeholder="`${tt('Select')} ${tt('parameter')}`"
						:setupLabelSettings="rpmSpecLabelOptions"
					/>
				</el-form-item>

				<el-form-item
					:label="tt('constants.Manual')"
					class="half-width"
					prop="rpm_value"
				>
					<el-input
						v-model.number="formData.rpm_value"
						:placeholder="`${tt('input')} RPM`"
					/>
				</el-form-item>

				<el-form-item
					prop="rpm_external_node_id"
					class="half-width"
					:label="tt('constants.external_input_rpm')"
				>
					<SimpleSpinner :active="bannerV2GenericParametersLoading" />
					<CustomSelectV2
						v-model="formData.rpm_external_node_id"
						clearable
						:disabled="!bannerV2GenericParametersList.length"
						:optionsList="bannerV2GenericParametersList"
						:placeholder="`${tt('select')} ${tt('exteranal')}`"
						:setupLabelSettings="{ accessors: ['sensor.location_in_equipment'] }"
						valueKey="sensor_id"
						idKey="sensor_id"
						@update:model-value="handleChangeExternalRpmNode"
					/>
				</el-form-item>

				<el-form-item
					prop="rpm_source_item"
					class="half-width"
					:label="`${tt('Item')} ${tt('Speed')}`"
				>
					<CustomSelectV2
						v-model="formData.rpm_source_item"
						clearable
						:optionsList="itemSpeedOptionsListOptions"
						:placeholder="`${tt('select')} ${tt('Item')} ${tt('Speed')}`"
					/>
				</el-form-item>

				<el-form-item prop="rpm_formula">
					<template #label>
						<span class="span-block">{{ tt('formula') }}</span>
						<span class="span-block">
							<el-tooltip effect="dark" placement="bottom">
								<i class="el-icon-info"></i>
								<template #content>
									<div v-html="formulaTooltipContent"></div>
								</template>
							</el-tooltip>
						</span>
					</template>

					<CustomInput v-model="formData.rpm_formula" :placeholder="tt('input')" />
				</el-form-item>
			</div>

			<el-form-item :label="tt('phrases.loc_on_machine')" prop="loc_on_machine" class="content-row">
				<CustomInput v-model="formData.loc_on_machine" :placeholder="`${tt('input')} ${tt('location')}`"/>
			</el-form-item>

			<div class="content-row equipment-uploads-container relative">
				<el-form-item :label="`${tt('Item')} ${tt('images')}`"
					prop="pictures"
					class="upload-form-item"
				>
					<FileUploadBlock
						:ref="(el) => setSubItemRef('PicturesUploadBlock', el, 0)"
						:pictures="itemImagesList"
						multiple
						rotate
						showDeleteButton
						:enableReorderFiles="{ appendTo: 'body', formKey: 'display_order' }"
						:additionalFormData="{ type: EQUIPMENT_IMG_TYPES.EQUIPMENT }"
						:blockId="EQUIPMENT_IMG_TYPES.EQUIPMENT"
					/>
				</el-form-item>

				<el-form-item
					:label="`${tt('constants.Nameplate')} ${tt('images')}`"
					prop="pictures"
					class="upload-form-item"
				>
					<FileUploadBlock
						:ref="(el) => setSubItemRef('NameplateUploadBlock', el, 0)"
						:pictures="nameplateImagesList"
						multiple
						rotate
						showDeleteButton
						:enableReorderFiles="{ appendTo: 'body', formKey: 'display_order' }"
						:additionalFormData="{ type: EQUIPMENT_IMG_TYPES.NAMEPLATE }"
						:blockId="EQUIPMENT_IMG_TYPES.NAMEPLATE"
					/>
				</el-form-item>
			</div>

			<el-form-item :label="tt('Attachments')" prop="libraries" class="content-row">
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

			<el-form-item v-if="itemData && itemData.id" :label="tt('Order')">
				<FetchByQuerySelect
					v-model="desiredId"
					clearable
					enableLoadmore
					:optionsLoading="equipmentsLoading"
					:optionsList="equipmentsList"
					:placeholder="tt('phrases.select_equipment_whose_order_you_want_to_reset')"
					:settings="equipmentQueryOptions"
					:setupLabelSettings="equipmentLabelOptions"
				/>
			</el-form-item>

			<!-- <FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" /> -->
		</el-form>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	EQUIPMENT_IMG_TYPES,
	ITEM_SPEED_OPTIONS,
	RPM_SOURCES_TYPES,
	itemSpeedOptionsList,
} from '@/constants/global';
import { required } from '@/constants/validation';
import { findItemBy, prepareSubmitData, removeDuplicatesObjectsArray, sortArrayByKeyNumber } from '@/helpers';
import { checkUploadSettings } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useMultiform } from '@/composables/mixins/useMultiform';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useProductionLines } from '@/composables/useProductionLines';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
// import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const AnalysisRuleItem = defineAsyncComponent(() => import('./AnalysisRuleItem.vue'));
const ChildComponentItem = defineAsyncComponent(() => import('./ChildComponentItem.vue'));
const AttachmentItem = defineAsyncComponent(() => import('@/views/ProductionLines/AttachmentItem.vue'));

const { tt } = Lang;

defineOptions({ name: 'EquipmentItemForm' });

const props = defineProps(buildProps({
	propsSuccessSubmitCallback: Function,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { fetchProductionLineRpmNodes } = useProductionLines();
const itemFormRef = ref(null);
const statusId = ref(null);
const desiredId = ref(null);
const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);
const equipmentsLoading = ref(false);
const equipmentsList = shallowRef([]);
const brandsLoading = ref(false);
const brandsList = shallowRef([]);
const brandModelsLoading = ref(false);
const brandModelsList = shallowRef([]);
const storeRoomsLoading = ref(false);
const storeRoomsList = shallowRef([]);
const assetsLoading = ref(false);
const assetsList = shallowRef([]);
const rpmOptionsLoading = ref(false);
const rpmOptionsList = shallowRef([]);
const vibrationAnalysisLoading = ref(false);
const vibrationAnalysisList = shallowRef([]);
const bannerV2GenericParametersLoading = ref(false);
const bannerV2GenericParametersList = shallowRef([]);
const itemImagesList = ref([]);
const nameplateImagesList = ref([]);
const librariesItemsList = ref([]);
const refsMap = ref({
	PicturesUploadBlock: [],
	NameplateUploadBlock: [],
	AttachmentItem: [],
	AnalysisRuleItem: [],
	ChildComponentItem: [],
});

const STATUSES_TYPES = Object.freeze({ ASSET: 1, LIMBO: 2, STORE: 3 });
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
	equipment_subtype_id: null,
	subtype_brand_id: null,
	subtype_brand_model_id: null,
	rpm_formula: '{value}',
	rpm_value: '',
	rpm_option_value_id: null,
	rpm_external_node_id: null,
	rpm_external_node_parameter: null,
	rpm_external_source_type: RPM_SOURCES_TYPES.EXTERNAL_INPUT,
	rpm_source_item: null,
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
const drivesList = computed(() => selectedEquipmentType.value?.drives || []);
const selectedStoreroom = computed(() =>
	formData.value.store_room_id ? findItemBy('id', formData.value.store_room_id, storeRoomsList.value) : null,
);
const storeRoomLocationsList = computed(() => selectedStoreroom.value?.locations || []);
const itemSpeedOptionsListOptions = computed(() => Object.freeze(itemSpeedOptionsList()));
const rpmSpecLabelOptions = Object.freeze({
	accessors: ['option_name', 'value'],
});
const equipmentLabelOptions = Object.freeze({
	accessors: [
		'brand_name',
		'machine_name',
		'production_line_name',
		'location_name',
	],
	delimeter: ',',
});
const selectedExternalRpmItem = computed(() => {
	if (bannerV2GenericParametersList.value.length && formData.value.rpm_external_node_id) {
		return findItemBy(
			'sensor_id',
			formData.value.rpm_external_node_id,
			bannerV2GenericParametersList.value,
		);
	}
	return null;
});
const selectedAsset = computed(() => {
	if (assetsList.value.length && formData.value.asset_id) {
		return findItemBy('id', formData.value.asset_id, assetsList.value);
	}
	return null;
});
const isAssetProdlineHasRPM = computed(() => {
	const productionLine = selectedAsset.value?.machine?.productionLine;
	if (productionLine) {
		const { rpm_source_type, rpm_value, rpm_node_id } = productionLine;
		return !!(rpm_source_type || rpm_value || rpm_node_id);
	}
	return false;
});
const formulaTooltipContent = computed(() => tt('aliases.rpm_tooltip_prhrase'));
const rpmSourceValue = computed(() => itemData.value?.rpmSources?.rpm_source_value_evaluated || null);
const preparedVibrationAnalysisItems = computed(() =>
	vibrationAnalysisList.value.map((rule) => {
		if (itemData.value?.vibration_analysis_rules?.length) {
			const ruleItemInEquipment = findItemBy(
				'original_rule_id',
				rule.id,
				itemData.value.vibration_analysis_rules,
			);

			if (ruleItemInEquipment) {
				return ruleItemInEquipment;
			}
		}

		return {
			original_rule: { ...rule },
			id: null,
			original_rule_id: rule.id,
		};
	}),
);
const childComponentsForSelectedEquipmentType = computed(() => {
	if (selectedEquipmentType.value?.child_components) {
		return selectedEquipmentType.value.child_components.map((component) => ({
			original_component: { ...component },
			id: null,
			original_component_id: component.id,
		}));
	}
	return [];
});
const preparedChildComponentsItems = computed(() =>
	childComponentsForSelectedEquipmentType.value.map((component) => {
		if (itemData.value?.child_components?.length) {
			const equipmentChildComponentItem = findItemBy(
				'original_component_id',
				component.original_component.id,
				itemData.value.child_components,
			);

			if (equipmentChildComponentItem) {
				const childItem = findItemBy(
					'id',
					equipmentChildComponentItem.original_component?.child_id,
					equipmentTypesList.value,
				);
				const childs = [];
				const childIds =
					equipmentChildComponentItem.original_component?.child_ids ||
					equipmentChildComponentItem.original_component?.child_id ||
					[];

				(Array.isArray(childIds) ? childIds : [childIds]).forEach((childId) => {
					const item = findItemBy('id', childId, equipmentTypesList.value);
					if (item) childs.push({ ...item });
				});

				return {
					...equipmentChildComponentItem,
					original_component: {
						...equipmentChildComponentItem.original_component,
						child: childItem,
						childs,
					},
				};
			}
		}

		return component;
	}),
);
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
		{ ref: 'AttachmentItem', targetProp: 'libraries', removeFilePropIfNull: true },
		{ ref: 'AnalysisRuleItem', targetProp: 'vibration_analysis_rules' },
		{ ref: 'ChildComponentItem', targetProp: 'child_components' },
	]),
);
const uploadSettings = Object.freeze([
	{ fileProp: 'pictures', multiple: true },
	{ fileProp: 'libraries', multiple: true },
]);

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
	fetch_equipment_types: createGetRequest(ENTITIES.EquipmentTypes.apiBase),
	fetch_equipments: createGetRequest(ENTITIES.Equipments.apiBase),
	fetch_brands: createGetRequest(ENTITIES.Brands.apiBase),
	fetch_brand: createGetByIdRequest(ENTITIES.Brands.apiBase),
	fetch_brand_models: createGetRequest(ENTITIES.BrandModels.apiBase),
	fetch_brand_model: createGetByIdRequest(ENTITIES.BrandModels.apiBase),
	fetch_store_rooms: createGetRequest(ENTITIES.StoreRooms.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
	fetch_asset: createGetByIdRequest(ENTITIES.Assets.apiBase),
	fetch_rpm_options: createGetRequest(`${ENTITIES.Equipments.apiBase}/rpm-options`),
	fetch_vibration_analysis_rules: (payload = {}) => {
		const { equipmentTypeId, ...requestPayload } = payload;
		return createGetRequest(`${ENTITIES.Equipments.apiBase}/types/${equipmentTypeId}/vibration-analysis-rules`)(
			requestPayload,
		);
	},
	fetch_production_line_rpm_nodes: (payload = {}) => fetchProductionLineRpmNodes(payload.params || {}),
};
const assetQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_assets,
		fetchByIdAction: methodsMap.fetch_asset,
		payload: {
			params: {
				orderByColumn: 'name',
				orderByMethod: 'asc',
			},
		},
		bindTo: [
			{ getValue: () => currentPlantId.value, param: 'plantId', withoutClean: true },
			{
				getValue: () => props.multiFormFilters?.machineId || null,
				param: 'machineId',
			},
		],
		setToStore: true,
	}),
);
const equipmentQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_equipments,
		payload: {
			params: {
				plantId: currentPlantId.value,
			},
		},
		bindTo: [
			{ getValue: () => currentPlantId.value, param: 'plantId', withoutClean: true },
		],
	}),
);
const brandQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brands,
		fetchByIdAction: methodsMap.fetch_brand,
		payload: {
			params: {
				orderByColumn: 'name',
				orderByMethod: 'asc',
			},
		},
		bindTo: [
			{ getValue: () => formData.value.equipment_type_id, param: 'equipmentTypeId' },
			{
				getValue: () => props.multiFormFilters?.machineId || null,
				param: 'machineId',
				withoutClean: true,
			},
		],
	}),
);
const brandModelsQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brand_models,
		fetchByIdAction: methodsMap.fetch_brand_model,
		payload: {
			params: {
				equipmentTypeId: formData.value.equipment_type_id,
				brandId: formData.value.brand_id,
			},
		},
		bindTo: [
			{ getValue: () => formData.value.brand_id, param: 'brandId' },
			{
				getValue: () => formData.value.equipment_type_id,
				param: 'equipmentTypeId',
				withoutClean: true,
			},
		],
	}),
);
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			actionName: 'fetch_equipment_types',
			payload: { params: { max: -1 } },
			localProp: equipmentTypesList,
			localLoadProp: equipmentTypesLoading,
		},
		{
			actionName: 'fetch_store_rooms',
			payload: { params: { max: -1, plantId: currentPlantId.value } },
			bindTo: [{ getValue: () => currentPlantId.value, param: 'plantId' }],
			localProp: storeRoomsList,
			localLoadProp: storeRoomsLoading,
		},
		{
			actionName: 'fetch_production_line_rpm_nodes',
			payload: { params: { max: -1 } },
			localProp: bannerV2GenericParametersList,
			localLoadProp: bannerV2GenericParametersLoading,
		},
	]),
);

const localSetupPage = (item) => {
	if (item?.id) {
		if (item.is_limbo) {
			statusId.value = STATUSES_TYPES.LIMBO;
		} else if (item.is_store_room) {
			statusId.value = STATUSES_TYPES.STORE;
		} else {
			statusId.value = STATUSES_TYPES.ASSET;
		}
		itemImagesList.value = sortArrayByKeyNumber(
			(item.pictures || []).filter((picture) =>
				picture.type
					? picture.type === EQUIPMENT_IMG_TYPES.EQUIPMENT
					: !picture.is_nameplate
			),
			'display_order',
		);
		nameplateImagesList.value = sortArrayByKeyNumber(
			(item.pictures || []).filter((picture) =>
				picture.type
					? picture.type === EQUIPMENT_IMG_TYPES.NAMEPLATE
					: picture.is_nameplate
			),
			'display_order',
		);
		librariesItemsList.value = setupFormSubItemsList(item.libraries, 'a_i');
		if (item.brand_model_id && item.equipment_type_id) {
			fetchRpmOptions(item.equipment_type_id, item.brand_model_id);
		}
		return;
	}
	librariesItemsList.value = [];
	statusId.value = props.editModal?.formSettings?.store_room_id ? STATUSES_TYPES.STORE : STATUSES_TYPES.ASSET;
	formData.value.plant_id = currentPlantId.value;
	if (props.editModal?.formSettings?.asset_id) {
		formData.value.asset_id = props.editModal.formSettings.asset_id;
	}
	setupByParentInstance(instancesItemsData.value, 'asset', 'asset_id');
};
const localPrepareSubmitData = (data) => {
	const nextData = { ...data, plant_id: data.plant_id || currentPlantId.value };
	nextData.is_limbo = statusId.value === STATUSES_TYPES.LIMBO;
	nextData.is_store_room = statusId.value === STATUSES_TYPES.STORE ? 1 : 0;
	if (statusId.value === STATUSES_TYPES.ASSET) {
		nextData.store_room_id = null;
		nextData.store_room_location_id = null;
	} else if (statusId.value !== STATUSES_TYPES.STORE) {
		nextData.store_room_id = null;
		nextData.store_room_location_id = null;
	}
	if (statusId.value !== STATUSES_TYPES.ASSET) {
		nextData.asset_id = null;
	}
	nextData.child_components = (nextData.child_components || []).filter(
		(component) => component.brand_id && component.brand_model_id,
	);
	return nextData;
};
const validateItemForm = async () => {
	const validationResults = [];
	const form = itemFormRef.value;

	if (form?.validate) {
		try {
			await form.validate();
			validationResults.push(true);
		} catch {
			validationResults.push(false);
		}
	}

	validationResults.push(await validateSubItemsForm(subItemsSettings.value));
	return validationResults.every((item) => item);
};

const getFormData = () => {
	resetFormDataBySubItems(subItemsSettings.value);
	const data = {
		id: itemData.value?.id || null,
		...formData.value,
		...collectDataFromSubItems(subItemsSettings.value),
	};
	const preparedData = prepareSubmitData(localPrepareSubmitData(data));
	let payload = {
		equipmentForm: preparedData,
	};

	payload = checkUploadSettings(payload, uploadSettings, {
		dataKey: 'equipmentForm',
	});

	if (itemData.value?.id && desiredId.value) {
		payload.desiredId = desiredId.value;
		payload.className = itemData.value.className;
	}

	return payload;
};
const handleStatusChange = (value) => {
	statusId.value = value;
	if (value === STATUSES_TYPES.ASSET) {
		formData.value.store_room_id = null;
		formData.value.store_room_location_id = null;
	} else if (value === STATUSES_TYPES.STORE) {
		formData.value.asset_id = null;
	} else {
		formData.value.asset_id = null;
		formData.value.store_room_id = null;
		formData.value.store_room_location_id = null;
	}
	formData.value.is_limbo = value === STATUSES_TYPES.LIMBO;
	formData.value.is_store_room = value === STATUSES_TYPES.STORE ? 1 : 0;
};
const handleChangeAsset = (assetId) => {
	formData.value.asset_id = assetId;
	if (formData.value.rpm_source_item !== ITEM_SPEED_OPTIONS.EXTERNAL) {
		if (assetId && isAssetProdlineHasRPM.value) {
			formData.value.rpm_source_item = ITEM_SPEED_OPTIONS.LINESPEED_RPM;
		} else {
			handleChangeBrandModel(formData.value.brand_model_id);
		}
	}
};
const handleChangeBrand = () => {
	formData.value.brand_model_id = null;
	formData.value.rpm_option_value_id = null;
};
const handleChangeBrandModel = (brandModelId) => {
	formData.value.rpm_option_value_id = null;
	const { rpm_source_item, equipment_type_id } = formData.value;

	if (brandModelId && equipment_type_id) {
		fetchRpmOptions(equipment_type_id, brandModelId);
	}

	if (
		rpm_source_item !== ITEM_SPEED_OPTIONS.EXTERNAL &&
		rpm_source_item !== ITEM_SPEED_OPTIONS.LINESPEED_RPM
	) {
		formData.value.rpm_source_item = brandModelId
			? ITEM_SPEED_OPTIONS.SPECIFICATION_RPM
			: null;
	}
};
const handleChangeExternalRpmNode = (id) => {
	if (id) {
		formData.value.rpm_source_item = ITEM_SPEED_OPTIONS.EXTERNAL;
		return;
	}
	formData.value.rpm_source_item = null;
	handleChangeAsset(formData.value.asset_id);
};
const handleEquipmentTypeChange = () => {
	formData.value.equipment_subtype_id = null;
};
const fetchRpmOptions = (equipmentTypeId, brandModelId) => {
	doFetchAction(
		methodsMap.fetch_rpm_options,
		rpmOptionsList,
		rpmOptionsLoading,
		{ params: { equipment_type_id: equipmentTypeId, brand_model_id: brandModelId } },
	);
};
const fetchVibrationAnalysis = (equipmentTypeId) => {
	if (!equipmentTypeId) {
		vibrationAnalysisList.value = [];
		return;
	}

	doFetchAction(
		methodsMap.fetch_vibration_analysis_rules,
		vibrationAnalysisList,
		vibrationAnalysisLoading,
		{ equipmentTypeId },
	);
};
const submitReorder = () => {
	if (itemData.value?.id && desiredId.value) {
		return api_request.post(`${ENTITIES.Equipments.apiBase}/reorder`, {
			notNotify: true,
			data: {
				currentId: itemData.value.id,
				desiredId: desiredId.value,
				className: itemData.value.className,
			},
		});
	}
	return null;
};

const { isMobile, validateForm } = useItemForm({
	entityKey: 'Equipments',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	localPrepareSubmitData,
	successSubmitCallback: submitReorder,
	propsSuccessSubmitCallback: props.propsSuccessSubmitCallback,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	uploadSettings,
	emit,
});

const { setupByParentInstance } = useMultiform({
	emit,
	formData,
	instancesItemsData,
	multiFormFilters: computed(() => props.multiFormFilters || null),
});

const { doFetchAction } = useRequestsList({ methodsMap, requestsToDoList });

watch(selectedExternalRpmItem, (item) => {
	formData.value.rpm_external_node_parameter = item ? item.node_parameter : null;
});

watch(rpmOptionsList, (list) => {
	if (
		list.length &&
		formData.value.rpm_source_item === ITEM_SPEED_OPTIONS.SPECIFICATION_RPM
	) {
		formData.value.rpm_option_value_id = list[0].id;
	}
});

watch(
	() => formData.value.equipment_type_id,
	(equipmentTypeId) => {
		fetchVibrationAnalysis(equipmentTypeId);
	},
	{ immediate: true },
);

watch(selectedEquipmentType, (type) => {
	rules.brand_id = type?.without_brand ? null : required;

	if (itemData.value?.id) return;

	if (type?.default_brand_id && !formData.value.brand_id) {
		if (type.default_brand) {
			brandsList.value = removeDuplicatesObjectsArray([type.default_brand, ...brandsList.value], 'id');
		}
		formData.value.brand_id = type.default_brand_id;
	}

	if (type?.default_brand_model_id && !formData.value.brand_model_id) {
		if (type.default_brand_model) {
			brandModelsList.value = removeDuplicatesObjectsArray(
				[type.default_brand_model, ...brandModelsList.value],
				'id',
			);
		}
		formData.value.brand_model_id = type.default_brand_model_id;
	}
});

defineExpose({
	validateForm,
	validateItemForm,
	getFormData,
});
</script>
