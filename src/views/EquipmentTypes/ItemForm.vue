<template>
	<div class="edit-form-container equipment-types">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			label-position="top"
		>
			<el-form-item
				:label="`${tt('Item_type')} ${tt('name')}`"
				prop="name"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					showJustInfo: newOptionsOnly,
				}"
			>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item prop="without_brand" :label="tt('phrases.without_brand')">
				<el-switch
					v-model="formData.without_brand"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Default')} ${tt('Brand')}`"
				prop="default_brand_id"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					showJustInfo: newOptionsOnly,
				}"
			>
				<FetchByQuerySelect
					v-model="formData.default_brand_id"
					clearable
					enableLoadmore
					:optionsLoading="brandsLoading"
					:optionsList="brandsList"
					:settings="brandQueryOptions"
					:placeholder="`${tt('select')} ${tt('brand')}`"
					@update:optionsLoading="(value) => (brandsLoading = value)"
					@update:optionsList="(value) => (brandsList = value)"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Default')} ${tt('part_number')}`"
				prop="default_brand_model_id"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					showJustInfo: newOptionsOnly,
				}"
			>
				<FetchByQuerySelect
					v-model="formData.default_brand_model_id"
					clearable
					enableLoadmore
					:optionsLoading="brandModelsLoading"
					:optionsList="brandModelsList"
					:settings="brandModelsQueryOptions"
					:placeholder="`${tt('select')} ${tt('part_number')}`"
					@update:optionsLoading="(value) => (brandModelsLoading = value)"
					@update:optionsList="(value) => (brandModelsList = value)"
				/>
			</el-form-item>

			<el-form-item prop="child_components">
				<div class="semi-bold article-title uppercase">
					{{ tt('Components') }}:
				</div>
				<div class="options-container wrapperBlock">
					<div v-if="childComponentsList.length" :class="['content-row', { fluid: fromModal }]">
						<ComponentItem
							v-for="(item, idx) in childComponentsList"
							:key="`ci-${item.id}`"
							:ref="(el) => setSubItemRef('ComponentItem', el, idx)"
							v-show="newOptionsOnly ? item.new : true"
							:item-data="item"
							:item-index="idx"
							:equipmentTypesList="filteredEquipmentTypesList"
							:equipmentTypesLoading="equipmentTypesLoading"
							@onRemove="(id) => removeFormItem(id, childComponentsList)"
						/>
					</div>

					<div class="margin-top-row button-row">
						<el-button
							class="action-button create-button small with-text"
							size="small"
							type="success"
							@click="addFormItem(childComponentsList, 'c_i-')"
						>
							<span class="capitalize">{{ `${tt('add')} ${tt('component')}` }}</span>
							<i class="suffix-icon icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>

			<el-form-item :label="`${tt('Type')} ${tt('image')}`" prop="file_name" class="section-row upload-form-item">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					rotate
					deleteFileId
					:pictures="itemPictures"
					class="equipment-types-upload-block"
				/>
			</el-form-item>

			<div class="section-row content-row underline-tabs full-width">
				<TabsBar
					:activeTab="activeTab"
					:tabsList="tabsList"
					buttonsType="primary"
					buttonsClass="text-center"
					@switchTab="switchTab"
				/>
			</div>

			<div v-show="activeTab?.prop === 'optionsTab'" class="content-row tab-container">
				<el-form-item prop="type_options">
					<div class="semi-bold article-title uppercase">
						{{ tt('TYPE_OPTIONS') }}
					</div>
					<div class="options-container flex wrap">
						<div v-if="typesItemsList.length" :class="['content-row', { fluid: fromModal }]">
							<TypeOptionItem
								v-for="(item, idx) in typesItemsList"
								:key="`types_item-${item.id}`"
								:ref="(el) => setSubItemRef('TypeOptionItem', el, idx)"
								v-show="newOptionsOnly ? item.new : true"
								:item-data="item"
								:item-index="idx"
								:fromModal="fromModal"
								:typesCategoriesList="typesCategoriesList"
								@onRemove="(id) => removeFormItem(id, typesItemsList)"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="small"
								type="success"
								@click="addFormItem(typesItemsList, 'to_i-')"
							>
								<span class="capitalize">{{ `${tt('add')} ${tt('option')}` }}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>

			<div v-show="activeTab?.prop === 'mediaTab'" class="content-row tab-container">
				<el-form-item prop="type_medias">
					<div class="semi-bold article-title uppercase">
						{{ `${tt('Type')} ${tt('media')}` }}
					</div>
					<div class="options-container wrapperBlock">
						<div v-if="typesMediaList.length" :class="['content-row', { fluid: fromModal }]">
							<TypeMediaItem
								v-for="(item, idx) in typesMediaList"
								:key="`types_media-${item.id}`"
								:ref="(el) => setSubItemRef('TypeMediaItem', el, idx)"
								v-show="newOptionsOnly ? item.new : true"
								:item-data="item"
								:item-index="idx"
								@onRemove="(id) => removeFormItem(id, typesMediaList)"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="small"
								type="success"
								@click="addFormItem(typesMediaList, 'tm_i-')"
							>
								<span class="capitalize">{{ `${tt('add')} ${tt('Media')}` }}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>

			<div v-show="activeTab?.prop === 'drivesTab'" class="content-row tab-container">
				<el-form-item prop="drives">
					<div class="semi-bold article-title uppercase">
						{{ `${tt('Drive')} ${tt('Type')}` }}
					</div>
					<div class="options-container wrapperBlock">
						<div v-if="drivesList.length" :class="['content-row', { fluid: fromModal }]">
							<DriveItem
								v-for="(item, idx) in drivesList"
								:key="`drive-${item.id}`"
								:ref="(el) => setSubItemRef('DriveItem', el, idx)"
								v-show="newOptionsOnly ? item.new : true"
								:item-data="item"
								:item-index="idx"
								@onRemove="(id) => removeFormItem(id, drivesList)"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="small"
								type="success"
								@click="addFormItem(drivesList, 'd_i-')"
							>
								<span class="capitalize">{{ `${tt('add')} ${tt('Drive_Type')}` }}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>

			<div v-show="activeTab?.prop === 'analysisTab'" class="content-row tab-container">
				<VibrationAnalysisItemsBlock
					v-if="itemId"
					ref="vibrationAnalysisItemsBlockRef"
					:equipmentTypeId="itemId"
				/>
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { buildProps, useItemForm } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import ComponentItem from './ComponentItem.vue';
import DriveItem from './DriveItem.vue';
import TypeOptionItem from './TypeOptionItem.vue';
import TypeMediaItem from './TypeMediaItem.vue';
import VibrationAnalysisItemsBlock from './VibrationAnalysisItemsBlock.vue';
import TabsBar from '@/components/common/TabsBar.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'EquipmentTypesItemForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const equipmentTypesEntity = ENTITIES.EquipmentTypes;
const equipmentTypesCategoriesEntity = ENTITIES.EquipmentTypesCategories;
const brandsEntity = ENTITIES.Brands;
const brandModelsEntity = ENTITIES.BrandModels;

const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const vibrationAnalysisItemsBlockRef = ref(null);
const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);
const typesCategoriesList = shallowRef([]);
const typesCategoriesLoading = ref(false);
const brandsList = shallowRef([]);
const brandsLoading = ref(false);
const brandModelsList = shallowRef([]);
const brandModelsLoading = ref(false);
const typesItemsList = ref([]);
const typesMediaList = ref([]);
const drivesList = ref([]);
const childComponentsList = ref([]);
const activeTab = ref({ title: 'options', prop: 'optionsTab' });
const refsMap = ref({
	FileUploadBlock: [],
	TypeOptionItem: [],
	TypeMediaItem: [],
	DriveItem: [],
	VibrationAnalysisItemsBlock: [],
	ComponentItem: [],
});

const formData = ref({
	name: '',
	img_rotate: 0,
	type_options: [],
	type_medias: [],
	drives: [],
	child_components: [],
	without_brand: 0,
	parent_id: null,
	default_brand_id: null,
	default_brand_model_id: null,
});

const rules = {
	name: required,
};

const itemData = computed(() => props.itemData);
const newOptionsOnly = computed(() => !!props.settings?.createNewOptionsOnly);

const itemPictures = computed(() => {
	if (props.itemData?.full_file_name) {
		return [{ full_file_name: props.itemData.full_file_name }];
	}
	return [];
});

const tabsList = computed(() =>
	Object.freeze(
		translate([
			{ title: 'options', prop: 'optionsTab' },
			{ title: 'media', prop: 'mediaTab' },
			{ title: 'Drive_Type', prop: 'drivesTab' },
			{ title: 'Vibration_Analysis', prop: 'analysisTab' },
		]),
	),
);

const filteredEquipmentTypesList = computed(() =>
	itemData.value
		? (equipmentTypesList.value || []).filter((item) => item.id !== itemData.value.id)
		: equipmentTypesList.value || []
);

const brandQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brands,
		fetchByIdAction: methodsMap.fetch_brand,
		params: {
			orderByColumn: 'name',
			orderByMethod: 'asc',
			equipmentTypeId: itemData.value?.id,
		},
	}),
);

const brandModelsQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brand_models,
		fetchByIdAction: methodsMap.fetch_brand_model,
		params: {
			equipmentTypeId: itemData.value?.id,
		},
		bindTo: [
			{
				param: 'brandId',
				getValue: () => formData.value.default_brand_id,
			},
		],
	}),
);

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_equipment_types_categories,
			localProp: typesCategoriesList,
			localLoadProp: typesCategoriesLoading,
		},
		{
			action: methodsMap.fetch_equipment_types,
			localProp: equipmentTypesList,
			localLoadProp: equipmentTypesLoading,
		},
	]),
);

const methodsMap = {
	fetch_equipment_types: createGetRequest(equipmentTypesEntity.apiBase),
	fetch_equipment_types_categories: createGetRequest(equipmentTypesCategoriesEntity.apiBase),
	fetch_brands: createGetRequest(brandsEntity.apiBase),
	fetch_brand: createGetByIdRequest(brandsEntity.apiBase),
	fetch_brand_models: createGetRequest(brandModelsEntity.apiBase),
	fetch_brand_model: createGetByIdRequest(brandModelsEntity.apiBase),
};

const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'FileUploadBlock',
			destructure: true,
			removeFilePropIfNull: true,
			fileProp: 'file',
		},
		{ ref: 'TypeOptionItem', targetProp: 'type_options' },
		{ ref: 'TypeMediaItem', targetProp: 'type_medias' },
		{ ref: 'DriveItem', targetProp: 'drives' },
		{ ref: 'VibrationAnalysisItemsBlock', submitInSubItem: true },
		{ ref: 'ComponentItem', targetProp: 'child_components' },
	]),
);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const localSetupPage = (item) => {
	if (!item) return;
	typesItemsList.value = setupFormSubItemsList(item.type_options || [], 'to_i');
	typesMediaList.value = setupFormSubItemsList(item.type_medias || [], 'tm_i');
	drivesList.value = setupFormSubItemsList(item.drives || [], 'd_i');
	childComponentsList.value = setupFormSubItemsList(item.child_components || [], 'c_i');
};

const switchTab = (tab) => {
	activeTab.value = tab;
};

const {
	isMobile,
	itemId,
	validateForm,
	handleCancel,
} = useItemForm({
	entityKey: 'EquipmentTypes',
	itemData,
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localSetupPage,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
});
</script>
