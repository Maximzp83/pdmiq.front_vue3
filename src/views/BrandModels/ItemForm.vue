<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item
				:label="`${tt('Part_number')} ${tt('name')}`"
				prop="name"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item
				:label="tt('item_type')"
				prop="type_id"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<CustomSelectV2
					v-model="formData.type_id"
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Brand')"
				prop="brand_id"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<FetchByQuerySelect
					v-model="formData.brand_id"
					clearable
					enableLoadmore
					:optionsLoading="brandsLoading"
					:optionsList="brandsList"
					:settings="brandQueryOptions"
					:placeholder="`${tt('Select')} ${tt('brand')}`"
					@update:optionsLoading="(value) => (brandsLoading = value)"
					@update:optionsList="(value) => (brandsList = value)"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('phrases.crossover_exluded')"
				prop="is_crossover_excluded"
				class="half-width switcher"
			>
				<el-switch v-model="formData.is_crossover_excluded" />
			</el-form-item>

			<div class="el-form-item section-row">
				<TabsBar
					:activeTab="activeTab"
					:tabsList="tabsList"
					buttonsType="primary"
					@switchTab="switchTab"
					buttonClass="inverted"
				/>
			</div>

			<div
				v-show="activeTab?.prop === 'optionsTab'"
				class="tab-container section-row"
			>
				<el-form-item
					v-if="equipmentType"
					:label="tt('phrases.Type_option_values')"
					prop="type_option_values"
					:class="['type-option-values', { 'mcol-xs-6': !isMobile && !fromModal }]"
				>
					<div class="options-container relative">
						<div class="content-row">
							<TypeOptionValueItem
								v-for="(item, idx) in equipmentType.type_options || []"
								:key="`types_item-${item.id}`"
								:ref="(el) => setSubItemRef('TypeOptionValueItem', el, idx)"
								:item-data="item"
								:item-index="idx"
								:currentDataList="itemData?.type_option_values || []"
								:equipmentTypesLoading="equipmentTypesLoading"
							/>
						</div>
					</div>
				</el-form-item>
			</div>

			<div
				v-show="activeTab?.prop === 'mediaTab'"
				class="tab-container section-row"
			>
				<el-form-item
					v-if="equipmentType"
					:label="tt('phrases.Type_media_values')"
					prop="type_media_values"
					class="type-media-values"
				>
					<div class="options-container relative">
						<div class="content-row">
							<TypeMediaValueItem
								v-for="(item, idx) in equipmentType.type_medias || []"
								:key="`media_item-${item.id}`"
								:ref="(el) => setSubItemRef('TypeMediaValueItem', el, idx)"
								:item-data="item"
								:item-index="idx"
								:currentDataList="itemData?.type_media_values || []"
								:equipmentTypesLoading="equipmentTypesLoading"
							/>
						</div>
					</div>
				</el-form-item>
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef, watch } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import TabsBar from '@/components/common/TabsBar.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import TypeOptionValueItem from './TypeOptionValueItem.vue';
import TypeMediaValueItem from './TypeMediaValueItem.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'BrandModelsItemForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);
const brandsEntity = ENTITIES.Brands;
const equipmentTypesEntity = ENTITIES.EquipmentTypes;

const itemFormRef = ref(null);
const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);
const brandsLoading = ref(false);
const brandsList = shallowRef([]);
const refsMap = ref({
	TypeOptionValueItem: [],
	TypeMediaValueItem: [],
});
const activeTab = ref({ title: tt('option_values'), prop: 'optionsTab' });

const formData = ref({
	name: '',
	brand_id: null,
	type_id: null,
	is_crossover_excluded: false,
	type_option_values: [],
	type_media_values: [],
});

const rules = ref({
	name: required,
	brand_id: required,
	type_id: required,
});

const itemData = computed(() => props.itemData);

const tabsList = computed(() =>
	Object.freeze(
		translate([
			{ title: 'option_values', prop: 'optionsTab' },
			{ title: 'media_values', prop: 'mediaTab' },
		]),
	),
);

const equipmentType = computed(() => {
	if (equipmentTypesList.value?.length && formData.value.type_id) {
		return findItemBy('id', formData.value.type_id, equipmentTypesList.value);
	}
	return null;
});

const brandQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brands,
		fetchByIdAction: methodsMap.fetch_brand,
		params: { orderByColumn: 'name', orderByMethod: 'asc' },
		bindTo: [{ getValue: () => formData.value.type_id, param: 'equipmentTypeId' }],
	}),
);

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_equipment_types,
			localProp: equipmentTypesList,
			localLoadProp: equipmentTypesLoading,
		},
	]),
);

const methodsMap = {
	fetch_brands: createGetRequest(brandsEntity.apiBase),
	fetch_brand: createGetByIdRequest(brandsEntity.apiBase),
	fetch_equipment_types: createGetRequest(equipmentTypesEntity.apiBase),
};

const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'TypeOptionValueItem',
			targetProp: 'type_option_values',
			conditionSettings: {
				checkMethod: 'some',
				conditions: [
					{ prop: 'value', method: 'notEmpty' },
					{ prop: 'predefined_value_ids', method: 'notEmpty' },
				],
			},
		},
		{
			ref: 'TypeMediaValueItem',
			targetProp: 'type_media_values',
			removeFilePropIfNull: true,
			fileProp: 'file',
			conditionSettings: {
				checkMethod: 'some',
				conditions: [
					{ prop: 'file', method: '!=', control_value: null },
					{ prop: 'id', method: '!=', control_value: null },
				],
			},
		},
	]),
);

const {
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const switchTab = (tab) => {
	activeTab.value = tab;
};

const setSubItemRef = (refName, el, idx) => {
	if (!refsMap.value[refName]) {
		refsMap.value[refName] = [];
	}

	if (el) {
		refsMap.value[refName][idx] = el;
		return;
	}

	if (refsMap.value[refName]?.length > idx) {
		refsMap.value[refName].splice(idx, 1);
	}
};

const {
	isMobile,
	validateForm,
	handleCancel,
} = useItemForm({
	entityKey: 'BrandModels',
	itemData,
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

watch(
	equipmentType,
	(type) => {
		rules.value.brand_id = type?.without_brand ? null : required;
	},
	{ immediate: true },
);

defineExpose({
	validateForm,
});
</script>
