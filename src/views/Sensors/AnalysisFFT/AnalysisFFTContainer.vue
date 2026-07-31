<template>
	<div class="vibration-analysis-block flex mrow">
		<div class="mcol-xs-12 mcol-sm-3 mcol-lg-auto part-number-options">
			<div class="flex filled_4">
				<ul class="div-block semi-bold">
					<li
						v-for="typeOption in brandModelTypeOptionValuesVisible"
						:key="`option-${typeOption.equipment_type_option_id}`"
						class="option-item flex mrow"
					>
						<div class="mcol-xs-5">{{ typeOption.name }}</div>
						<div class="mcol-xs-7" v-html="typeOption.value"></div>
					</li>
				</ul>

				<div class="div-block">
					<el-button
						native-type="button"
						class="action-button settings-button"
						@click="showOptionValues"
					>
						<el-icon><Setting /></el-icon>
					</el-button>
				</div>
			</div>

			<div v-if="metaDataEntries.length" class="meta-data-entries">
				<el-tooltip
					placement="bottom"
					popper-class="meta-data-entries-tooltip middle-width"
				>
					<span class="tooltip-container">
						<el-icon class="el-icon-info"><InfoFilled /></el-icon>
					</span>

					<template #content>
						<ul>
							<li
								v-for="entry in metaDataEntries"
								:key="entry.key"
								class="info-item"
							>
								<span class="key">{{ entry.key }}: </span>
								<span class="value">{{ entry.value }}</span>
							</li>
						</ul>
					</template>
				</el-tooltip>
			</div>
		</div>

		<div class="mcol-xs-12 mcol-sm-9 vibration-analysis-options">
			<div class="flex mrow wrap medium-padding">
				<div v-if="currentRpmSource" class="analysis-item mcol-xs-auto">
					<div class="article-title">{{ tt('Speed') }}</div>
					<div class="card filled_4 bordered">
						<div class="card-content">
							<el-icon class="el-icon-odometer"><Odometer /></el-icon>
							<div class="value">{{ currentRpmSource.value }} RPM</div>
							<el-button
								native-type="button"
								class="action-button settings-button"
								@click="showRpmSettings"
							>
								<el-icon><Setting /></el-icon>
							</el-button>
						</div>
					</div>
				</div>

				<div v-if="preparedChildComponentsItems.length" class="content-row paint child-components-wrapper">
					<div class="flex mrow wrap medium-padding">
							<ChildComponentItem
								v-for="(child, idx) in preparedChildComponentsItems"
								:key="`child_component-${child.id}`"
								:ref="(el) => setSubItemRef('ChildComponentItem', el, idx)"
								:class="['mcol-xs-auto', { isActive: selectedChildComponentIds?.some((id) => id === child.id) }]"
								:item-data="child"
								:item-index="idx"
								fromFFTPage
								:equipmentTypesList="equipmentTypesList"
								:equipmentTypesLoading="equipmentTypesLoading"
								:rpm_source_value="currentRpmSource && currentRpmSource.value"
								:savingInProgress="savingInProgress"
								@event="handleEvent"
							@save="handleSaveForm({ clearSelectedChildComponentsOnCharts: true })"
						/>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="initiatedOptionValuesDialog"
			v-model="showOptionValuesDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-analysis-values-dialog"
			title="Characteristics"
		>
			<div class="options-container">
				<div v-if="preparedTypeOptionValueItems.length" class="content-row">
						<TypeOptionValueItem
							v-for="(option, idx) in preparedTypeOptionValueItems"
							:key="`va-${option.equipment_type_option_id}`"
							:ref="(el) => setSubItemRef('TypeOptionValueItem', el, idx)"
							:item-data="option"
							:item-index="idx"
						/>
				</div>
			</div>
			<div class="dialog-footer dialog-decorate-footer text-center">
				<el-button type="primary" class="uppercase semi-bold" @click="handleSaveForm">
					{{ tt('Save') }}
				</el-button>

				<el-button class="uppercase semi-bold" @click="showOptionValuesDialog = false">
					{{ tt('Cancel') }}
				</el-button>
			</div>
		</el-dialog>

		<el-dialog
			v-if="initiatedRPMDialog"
			v-model="showRpmSettingsDialog"
			append-to-body
			top
			class="tiny dialog-decorate-header title-center rpm-settings-dialog"
			:title="`${tt('Machine')} ${tt('speed')}`"
		>
			<SimpleSpinner :active="loadingRPM" />

			<RPMSettingsDialog
				v-if="showRpmSettingsDialog"
				:sensorData="sensorData"
				:currentRpmSource="currentRpmSource"
				:fftItem="fftItem"
				:rootFilters="rootFilters"
				@save="saveRpmParams"
				@close="showRpmSettingsDialog = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref, toRef, watch } from 'vue';
import { InfoFilled, Odometer, Setting } from '@element-plus/icons-vue';

import { api_request } from '@/api/request_provider';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { Lang } from '@/localization';
import { findItemBy } from '@/helpers';
import { getCurrentRpmSource } from '@/helpers/specialHelpers';
import { ITEM_SPEED_OPTIONS } from '@/constants/global';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemForm } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useSaveRPMParams } from '@/views/Sensors/mixins/useSaveRPMParams';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import ChildComponentItem from '@/views/Equipments/ChildComponentItem.vue';
import RPMSettingsDialog from '@/views/Sensors/FilterBlock/RPMSettingsDialog.vue';
import TypeOptionValueItem from './TypeOptionValueItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'AnalysisFFTContainer',
});

const props = defineProps({
	fftItem: { type: Object, required: true },
	itemData: { type: Object, required: true },
	sensorData: { type: Object, required: true },
	selectedChildComponentIds: { type: Array, default: () => [] },
	rootFilters: { type: Object, default: () => ({}) },
	metaDataEntries: { type: Array, default: () => [] },
});

const emit = defineEmits(['event', 'save']);
const showRpmSettingsDialog = ref(false);
const initiatedRPMDialog = ref(false);
const loadingRPM = ref(false);
const initiatedOptionValuesDialog = ref(false);
const showOptionValuesDialog = ref(false);
const savingInProgress = ref(false);
const brandModel = ref(null);
const brandModelLoading = ref(false);
const equipmentTypesList = ref([]);
const equipmentTypesLoading = ref(false);
const refsMap = ref({
	ChildComponentItem: [],
	TypeOptionValueItem: [],
});
const initialFormData = {
	id: null,
	plant_id: null,
	asset_id: null,
	brand_id: null,
	brand_model_id: null,
	equipment_type_id: null,
	drive_type_id: null,
	is_limbo: false,
	loc_on_machine: '',
	is_store_room: 0,
	store_room_id: null,
	libraries: [],
	pictures: [],
	equipment_subtype_id: null,
	subtype_brand_id: null,
	subtype_brand_model_id: null,
	rpm_formula: '',
	rpm_value: '',
	rpm_option_value_id: null,
	rpm_external_node_id: null,
	rpm_external_node_parameter: null,
	rpm_external_source_type: null,
	rpm_source_item: null,
	vibration_analysis_rules: [],
	child_components: [],
	option_values: [],
};
const formData = ref({ ...initialFormData });

const currentRpmSource = computed(() =>
	getCurrentRpmSource({
		fftItem: props.fftItem,
		sensorData: props.sensorData,
		rpm_source_item: formData.value.rpm_source_item,
		rootFilters: props.rootFilters,
	}),
);
const defaultRpmSourceItem = computed(() => {
	const sources = props.sensorData?.rpmSources;
	if (!sources) return null;

	if (sources.external_rpm_evaluated) return ITEM_SPEED_OPTIONS.EXTERNAL;
	if (sources.line_speed_rpm_evaluated) return ITEM_SPEED_OPTIONS.LINESPEED_RPM;
	if (sources.specification_rpm_evaluated) return ITEM_SPEED_OPTIONS.SPECIFICATION_RPM;
	return null;
});
const selectedEquipmentType = computed(() => {
	if (equipmentTypesList.value.length && formData.value.equipment_type_id) {
		return findItemBy('id', formData.value.equipment_type_id, equipmentTypesList.value);
	}
	return null;
});
const brandModelTypeOptionValues = computed(() => {
	if (brandModel.value && selectedEquipmentType.value) {
		return (brandModel.value.type_option_values || []).map((item) => {
			const optionItem = { ...item };
			if (!optionItem.value && optionItem.predefined_value_ids?.length) {
				const option = findItemBy(
					'id',
					optionItem.equipment_type_option_id,
					selectedEquipmentType.value.type_options || [],
				);
				if (option) {
					optionItem.value = optionItem.predefined_value_ids
						.map((id) => findItemBy('id', id, option.predefined_values || [])?.value)
						.filter(Boolean)
						.map((value) => `<div>${value}</div>`)
						.join('');
				}
			}
			return optionItem;
		});
	}
	return [];
});
const brandModelTypeOptionValuesVisible = computed(() =>
	preparedTypeOptionValueItems.value.filter((item) => item.is_visible_in_vibration_analysis),
);
const preparedTypeOptionValueItems = computed(() =>
	brandModelTypeOptionValues.value.map((item) => {
		const { equipment_type_option_id, option, value } = item;
		const equipmentOption = findItemBy(
			'equipment_type_option_id',
			equipment_type_option_id,
			formData.value.option_values || [],
		);

		return {
			equipment_type_option_id,
			name: item.name || option?.name || '',
			value,
			is_visible_in_vibration_analysis: equipmentOption
				? equipmentOption.is_visible_in_vibration_analysis
				: option?.is_visible_in_vibration_analysis || 0,
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

const preparedChildComponentsItems = computed(() => {
	if (!selectedEquipmentType.value) return [];

	const { itemData: equipmentData } = props;
	// console.log('equipmentData', equipmentData);
	const parentComponent = {
		id: selectedEquipmentType.value.id,
		isParentComponent: true,
		original_component_id: selectedEquipmentType.value.id,
		brand: equipmentData.brand,
		brand_model: equipmentData.brand_model,
		brand_id: equipmentData.brand_id,
		brand_model_id: equipmentData.brand_model_id,
		full_file_name: selectedEquipmentType.value.full_file_name,
		vibration_analysis_rules: equipmentData.vibration_analysis_rules,
		original_component: {
			...selectedEquipmentType.value,
			original_component_id: selectedEquipmentType.value.id,
			child_components: [],
		},
	};

	if (equipmentData.child_components?.length) {
		if (!equipmentTypesList.value.length) return [];
		return [parentComponent].concat(
			equipmentData.child_components.map((component) => {
				const childItem = findItemBy(
					'id',
					component.original_component?.child_id,
					equipmentTypesList.value,
				);
				return {
					...component,
					original_component: {
						...component.original_component,
						child: childItem,
					},
				};
			}),
		);
	}

	return [parentComponent].concat(childComponentsForSelectedEquipmentType.value);
});
const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'ChildComponentItem',
			targetProp: 'child_components',
			onCollectDataCallback: collectChildComponentsData,
		},
		{ ref: 'TypeOptionValueItem', targetProp: 'option_values' },
	]),
);
const methodsMap = {
	fetch_equipment_types: createGetRequest(ENTITIES.EquipmentTypes.apiBase),
	fetch_brand_model: createGetByIdRequest(ENTITIES.BrandModels.apiBase),
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
			actionName: 'fetch_brand_model',
			payload: { itemId: props.itemData.brand_model_id },
			localProp: brandModel,
			localLoadProp: brandModelLoading,
			notFetch: !props.itemData.brand_model_id,
		},
	]),
);

const { doFetchAction } = useRequestsList({ methodsMap, requestsToDoList });
const {
	collectDataFromSubItems,
	resetFormDataBySubItems,
	setSubItemRef,
	validateSubItemsForm,
} = useSubItemsList({ formData, refsMap });

const showOptionValues = () => {
	initiatedOptionValuesDialog.value = true;
	showOptionValuesDialog.value = true;
};
const showRpmSettings = () => {
	initiatedRPMDialog.value = true;
	showRpmSettingsDialog.value = true;
};
const collectChildComponentsData = (context) => {
	if (context.collectedValue?.isParentComponent) {
		context.itemIsReady = true;
		context.collectedData.brand_id = context.collectedValue.brand_id;
		context.collectedData.brand_model_id = context.collectedValue.brand_model_id;
		context.collectedData.vibration_analysis_rules = context.collectedValue.vibration_analysis_rules;
	}

	return context;
};
const handleSaveForm = (options = {}) => {
	handleValidationResult([], options);
};
const closeChildComponentDialogs = () => {
	(refsMap.value.ChildComponentItem || []).filter(Boolean).forEach((refItem) => {
		if ('showAnalysisRulesDialog' in refItem) {
			refItem.showAnalysisRulesDialog = false;
		}
	});
};
const localSubmit = (data, options = {}) => {
	const method = data.id ? 'put' : 'post';
	const url = data.id ? `${ENTITIES.Equipments.apiBase}/${data.id}` : ENTITIES.Equipments.apiBase;

	savingInProgress.value = true;
	emit('event', { eventName: 'toggleEquipmentSaving', data: true, onward: true });

	api_request[method](url, {
		data,
		itemName: tt('Item'),
	})
		.then(({ value }) => {
			showOptionValuesDialog.value = false;
			closeChildComponentDialogs();
			if (options.clearSelectedChildComponentsOnCharts) {
				emit('event', {
					eventName: 'clearSelectedChildComponentsOnCharts',
					onward: true,
				});
			}
			if (value) {
				emit('event', {
					eventName: 'updateEquipmentAndFFT',
					data: { equipmentItem: value },
					onward: true,
				});
			}
		})
		.finally(() => {
			emit('event', { eventName: 'toggleEquipmentSaving', data: false, onward: true });
			savingInProgress.value = false;
		});
};
const { handleValidationResult } = useItemForm({
	itemData: toRef(props, 'itemData'),
	formData,
	initialFormData,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localSubmit,
	emit,
});
const successRpmSaveCallback = (payload) => {
	emit('event', {
		eventName: 'updateEquipmentAndFFT',
		data: payload,
		onward: true,
	});
};
const { saveRpmParams } = useSaveRPMParams({
	sensorData: toRef(props, 'sensorData'),
	fftItem: toRef(props, 'fftItem'),
	itemData: toRef(props, 'itemData'),
	loadingRPM,
	showRpmSettingsDialog,
	defaultRpmSourceItem,
	successRpmSaveCallback,
});

watch(
	() => props.itemData?.brand_model_id,
	(brandModelId) => {
		if (brandModelId) {
			doFetchAction(methodsMap.fetch_brand_model, brandModel, brandModelLoading, {
				itemId: brandModelId,
			});
			return;
		}

		brandModel.value = null;
	},
);

defineExpose({
	saveRpmParams,
});

const { handleEvent } = useEventHandler({}, emit);
</script>

<style lang="scss">
.meta-data-entries {
	.el-icon-info {
		font-size: 24px;
		color: #4a90e2;
	}

	.info-item {
		font-size: 14px;
	}
}
</style>
