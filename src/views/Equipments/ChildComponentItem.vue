<template>
	<div v-if="fromFFTPage" class="child-component-item analysis-item">
		<div class="article-title">{{ childOriginalComponent.name }}</div>
		<div
			v-if="formData.brand_model_id"
			class="card filled_4 bordered pointer relative"
			@click="addChildComponentToSelected"
		>
			<SimpleSpinner :active="ruleOptionsLoading" />
			<div class="card-content">
				<div class="flex align-center">
					<div class="imgWrapper equipmentTypeImg div-block">
						<img :src="equipmentType && equipmentType.full_file_name" alt="" />
					</div>
					<div class="div-block text-values">
						<div v-if="brandName" class="semi-bold">{{ brandName }}</div>
						<div v-if="brandModelName" class="semi-bold">{{ brandModelName }}</div>
					</div>

					<div class="div-block">
						<el-button
							:disabled="!preparedVibrationAnalysisItems.length"
							native-type="button"
							class="action-button settings-button"
							icon="el-icon-setting"
							@click.stop="handleShowAnalysisRuleFormDialog"
						/>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="bold">-</div>

		<el-dialog
			v-if="initiatedAnalysisRulesDialog"
			v-model="showAnalysisRulesDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-analysis-values-dialog"
			:title="tt('Vibration_Analysis')"
		>
			<div class="content-row brands-form-block">
				<div class="label">{{ tt('Brand') }}</div>
				<div class="form-item">
					<FetchByQuerySelect
						v-model="formData.brand_id"
						class="mcol-xs-8"
						clearable
						enableLoadmore
						:optionsLoading="brandsLoading"
						:optionsList="brandsList"
						:settings="brandQueryOptions"
						:placeholder="`${tt('select')} ${tt('brand')}`"
						@change="handleChangeBrand"
					/>
				</div>
			</div>

			<div class="section-row content-row brands-form-block">
				<div class="label">{{ tt('part_number') }}</div>
				<div class="form-item">
					<FetchByQuerySelect
						v-model="formData.brand_model_id"
						class="mcol-xs-8"
						clearable
						enableLoadmore
						:optionsLoading="brandModelsLoading"
						:optionsList="brandModelsList"
						:settings="brandModelsQueryOptions"
						:placeholder="`${tt('select')} ${tt('part_number')}`"
					/>

					<a
						v-if="selectedBrandModel"
						class="absolute primary-color line-height-normal"
						:href="`/brand-models/${selectedBrandModel.id}`"
						target="_blank"
					>
						{{ tt('phrases.Open_in_new_window') }}
					</a>
				</div>
			</div>

			<div v-if="preparedVibrationAnalysisItems.length && formData.brand_model_id" class="section-row">
				<AnalysisRuleItem
					v-for="(rule, idx) in preparedVibrationAnalysisItems"
					:key="`va-${rule.original_rule_id}`"
					:ref="(el) => setSubItemRef('AnalysisRuleItem', el, idx)"
					:crossoverRulesList="crossoverRulesStore[rule.original_rule_id]"
					class="inside-child-component"
					:item-data="rule"
					:item-index="idx"
					:equipmentTypeId="formData.child_equipment_type_id"
					:brandModelId="formData.brand_model_id"
					:rpm_source_value="rpm_source_value"
					:savingInProgress="savingInProgress"
				/>
			</div>

			<div class="dialog-footer dialog-decorate-footer text-center">
				<el-button
					type="primary"
					:loading="savingInProgress"
					class="uppercase semi-bold"
					@click="handleSave"
				>
					{{ tt('Save') }}
				</el-button>

				<el-button class="uppercase semi-bold" @click="showAnalysisRulesDialog = false">
					{{ tt('Cancel') }}
				</el-button>
			</div>
		</el-dialog>
	</div>

	<div v-else class="form-section type_2 paint_v2 content-row">
		<div class="content-row">
			<div class="flex mrow align-center">
				<b class="capitalize mcol-xs-auto">{{ childOriginalComponent.name }}</b>

				<CustomSelectV2
					v-model="formData.child_equipment_type_id"
					:class="['mcol-xs-4', { showJustInfo: childsEquipmentTypesList.length < 2 }]"
					className="mini"
					:optionsLoading="equipmentTypesLoading"
					:optionsList="childsEquipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					@change="handleChildEquipmentTypeChange"
				/>
			</div>
		</div>

		<el-form
			ref="itemFormRef"
			class="option-item-container content-row"
			:model="formData"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div>
				<el-form-item :label="tt('Brand')" prop="brand_id" class="half-width">
					<FetchByQuerySelect
						v-model="formData.brand_id"
						clearable
						enableLoadmore
						:optionsLoading="brandsLoading"
						:optionsList="brandsList"
						:settings="brandQueryOptions"
						:placeholder="`${tt('select')} ${tt('brand')}`"
						@change="handleChangeBrand"
					/>
				</el-form-item>

				<el-form-item :label="`${tt('Part')} ${tt('Number')}`" prop="brand_model_id" class="half-width relative">
					<FetchByQuerySelect
						v-model="formData.brand_model_id"
						clearable
						enableLoadmore
						:optionsLoading="brandModelsLoading"
						:optionsList="brandModelsList"
						:settings="brandModelsQueryOptions"
						:placeholder="`${tt('select')} ${tt('part_number')}`"
					/>

					<a
						v-if="selectedBrandModel"
						class="absolute primary-color line-height-normal"
						:href="`/brand-models/${selectedBrandModel.id}`"
						target="_blank"
					>
						{{ tt('phrases.Open_in_new_window') }}
					</a>
				</el-form-item>

				<div v-if="preparedVibrationAnalysisItems.length && formData.brand_model_id" class="el-form-item">
					<div class="content-row">
						<b>{{ tt('Vibration_Analysis') }}:</b>
					</div>

					<AnalysisRuleItem
						v-for="(rule, idx) in preparedVibrationAnalysisItems"
						:key="`va-${rule.original_rule_id}`"
						:ref="(el) => setSubItemRef('AnalysisRuleItem', el, idx)"
						:crossoverRulesList="crossoverRulesStore[rule.original_rule_id]"
						class="content-row"
						:item-data="rule"
						:item-index="idx"
						:equipmentTypeId="formData.child_equipment_type_id"
						:brandModelId="formData.brand_model_id"
						:rpm_source_value="rpm_source_value"
					/>
				</div>
			</div>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import { ENTITIES } from '@/config/entities';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import AnalysisRuleItem from './AnalysisRuleItem.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentChildComponentItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	fromFFTPage: Boolean,
	equipmentTypesList: { type: Array, default: () => [] },
	equipmentTypesLoading: Boolean,
	savingInProgress: Boolean,
	rpm_source_value: null,
});

const emit = defineEmits(['event', 'save']);

const itemFormRef = ref(null);
const refsMap = ref({ AnalysisRuleItem: [] });
const brandsLoading = ref(false);
const brandsList = ref([]);
const brandModelsLoading = ref(false);
const brandModelsList = ref([]);
const vibrationAnalysisLoading = ref(false);
const vibrationAnalysisList = ref([]);
const initiatedAnalysisRulesDialog = ref(false);
const showAnalysisRulesDialog = ref(false);
const ruleOptionsLoading = ref(false);
const crossoverRulesStore = ref({});
const formData = ref({
	id: null,
	original_component_id: null,
	brand_id: null,
	brand_model_id: null,
	vibration_analysis_rules: [],
	child_equipment_type_id: null,
});

const childOriginalComponent = computed(() => props.itemData.original_component || {});
const equipmentType = computed(() =>
	props.itemData.isParentComponent ? props.itemData : props.itemData.child_equipment_type,
);
const childsEquipmentTypesList = computed(() => childOriginalComponent.value.child_types || []);
const selectedBrandModel = computed(() =>
	formData.value.brand_model_id ? findItemBy('id', formData.value.brand_model_id, brandModelsList.value) : null,
);
const brandName = computed(() => {
	const item = formData.value.brand_id ? findItemBy('id', formData.value.brand_id, brandsList.value) : null;
	return item?.name || '';
});
const brandModelName = computed(() => selectedBrandModel.value?.name || '');
const selectedEquipmentTypeId = computed(() =>
	formData.value.child_equipment_type_id || props.itemData.original_component_id,
);
const brandQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brands,
		fetchByIdAction: methodsMap.fetch_brand,
		payload: {
			params: {
				orderByColumn: 'name',
				orderByMethod: 'asc',
				equipmentTypeId: selectedEquipmentTypeId.value,
			},
		},
		bindTo: [
			{ getValue: () => selectedEquipmentTypeId.value, param: 'equipmentTypeId', withoutClean: true },
		],
	}),
);
const brandModelsQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brand_models,
		fetchByIdAction: methodsMap.fetch_brand_model,
		payload: {
			params: {
				brandId: formData.value.brand_id,
				equipmentTypeId: selectedEquipmentTypeId.value,
			},
		},
		bindTo: [
			{ getValue: () => formData.value.brand_id, param: 'brandId' },
			{
				getValue: () => selectedEquipmentTypeId.value,
				param: 'equipmentTypeId',
				withoutClean: true,
			},
		],
	}),
);
const subItemsSettings = computed(() =>
	Object.freeze([{ ref: 'AnalysisRuleItem', targetProp: 'vibration_analysis_rules' }]),
);
const preparedVibrationAnalysisItems = computed(() =>
	vibrationAnalysisList.value.map((rule) => {
		const existingRule = findItemBy(
			'original_rule_id',
			rule.id,
			props.itemData.vibration_analysis_rules || [],
		);

		if (existingRule) {
			return { ...existingRule };
		}

		return {
			original_rule: { ...rule },
			id: null,
			original_rule_id: rule.id,
		};
	}),
);
const preparedVibrationAnalysisItemsWithCrossoverValue = computed(() =>
	preparedVibrationAnalysisItems.value.map((rule) => {
		const ruleOptionsList = crossoverRulesStore.value[rule.original_rule_id] || [];
		const item = ruleOptionsList.find((option) => option.id === rule.option_value_id);
		return {
			...rule,
			vibration_analysis_value: item ? item.vibration_analysis_value : null,
		};
	}),
);

const methodsMap = {
	fetch_brands: createGetRequest(ENTITIES.Brands.apiBase),
	fetch_brand: createGetByIdRequest(ENTITIES.Brands.apiBase),
	fetch_brand_models: createGetRequest(ENTITIES.BrandModels.apiBase),
	fetch_brand_model: createGetByIdRequest(ENTITIES.BrandModels.apiBase),
	fetch_vibration_analysis_rules: (payload = {}) => {
		const { equipmentTypeId, ...requestPayload } = payload;
		return createGetRequest(`${ENTITIES.Equipments.apiBase}/types/${equipmentTypeId}/vibration-analysis-rules`)(
			requestPayload,
		);
	},
	fetch_vibration_analysis_rule_crossover_options: (payload = {}) => {
		const { equipmentTypeId, ruleId, ...requestPayload } = payload;
		return createGetRequest(
			`${ENTITIES.Equipments.apiBase}/types/${equipmentTypeId}/vibration-analysis-rules/${ruleId}/crossover-options-values`,
		)(requestPayload);
	},
};

const { doFetchAction } = useRequestsList({ methodsMap });
const { validateSubItemsForm, collectDataFromSubItems, setSubItemRef } = useSubItemsList({
	formData,
	refsMap,
});

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

const fetchAnalysisRuleCrossoverOptions = ({ ruleId, equipmentTypeId }) => {
	ruleOptionsLoading.value = true;
	return methodsMap.fetch_vibration_analysis_rule_crossover_options({
		equipmentTypeId,
		ruleId,
		params: {
			brand_model_id: formData.value.brand_model_id,
			rpm: props.rpm_source_value,
		},
	}).then(({ value }) => {
		crossoverRulesStore.value[ruleId] = value || [];
	});
};

const fetchCrossoverAnalysisOptionsAndDoAction = (callback) => {
	if (!preparedVibrationAnalysisItems.value.length) {
		ruleOptionsLoading.value = false;
		callback();
		return;
	}

	let responses = 0;
	const completeOne = () => {
		responses += 1;
		if (responses >= preparedVibrationAnalysisItems.value.length) {
			ruleOptionsLoading.value = false;
			callback();
		}
	};

	preparedVibrationAnalysisItems.value.forEach((rule) => {
		if (crossoverRulesStore.value[rule.original_rule_id]) {
			completeOne();
			return;
		}

		fetchAnalysisRuleCrossoverOptions({
			ruleId: rule.original_rule_id,
			equipmentTypeId: selectedEquipmentTypeId.value,
		}).finally(completeOne);
	});
};

const handleChangeBrand = () => {
	formData.value.brand_model_id = null;
	brandModelsList.value = [];
};

const handleChildEquipmentTypeChange = () => {
	brandsList.value = [];
	formData.value.brand_id = null;
	brandModelsList.value = [];
	formData.value.brand_model_id = null;
};

const localSetupPageActions = (item = {}) => {
	if (item.brand) brandsList.value.push(item.brand);
	if (item.brand_model) brandModelsList.value.push(item.brand_model);

	if (!item.child_equipment_type_id && item.original_component?.child_type_ids?.length) {
		formData.value.child_equipment_type_id = item.original_component.child_type_ids[0];
	}
};

const localGetFormDataCallback = (data) => ({
	...data,
	isParentComponent: props.itemData.isParentComponent,
});

const {
	isMobile,
	validateItemForm,
	getFormData,
} = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions,
	localGetFormDataCallback,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	deleteNewId: true,
	emit,
});

const collectData = getFormData;

const handleSave = () => {
	emit('save');
};

const handleShowAnalysisRuleFormDialog = () => {
	fetchCrossoverAnalysisOptionsAndDoAction(() => {
		initiatedAnalysisRulesDialog.value = true;
		showAnalysisRulesDialog.value = true;
	});
};

const addChildComponentToSelected = () => {
	fetchCrossoverAnalysisOptionsAndDoAction(() => {
		emit('event', {
			eventName: 'addChildComponentToSelected',
			data: {
				...props.itemData,
				vibration_analysis_rules: preparedVibrationAnalysisItemsWithCrossoverValue.value,
				crossoverRulesStore: crossoverRulesStore.value || {},
			},
			onward: true,
		});
	});
};

watch(
	() => formData.value.child_equipment_type_id,
	(id) => {
		if (id) {
			fetchVibrationAnalysis(id);
		}
	},
	{ immediate: true },
);

watch(
	() => props.itemData,
	(item) => {
		if (item.child_equipment_type_id || item.isParentComponent) {
			fetchVibrationAnalysis(item.isParentComponent ? item.id : item.child_equipment_type_id);
		}
	},
	{ immediate: true },
);

defineExpose({
	formData,
	validateItemForm,
	getFormData,
	collectData,
});
</script>
