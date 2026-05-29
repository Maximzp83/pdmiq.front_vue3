<template>
	<div v-if="fromFFTPage" class="child-component-item analysis-item">
		<div class="article-title">{{ childOriginalComponent.name }}</div>
		<div
			v-if="formData.brand_model_id"
			class="card filled_4 bordered pointer relative"
			@click="addChildComponentToSelected"
		>
			<div class="card-content">
				<div class="flex align-center">
					<div class="imgWrapper equipmentTypeImg div-block">
						<img :src="equipmentType && equipmentType.full_file_name" alt="" />
					</div>
					<div class="div-block text-values">
						<div v-if="brandName" class="semi-bold">{{ brandName }}</div>
						<div v-if="brandModelName" class="semi-bold">{{ brandModelName }}</div>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="bold">-</div>
	</div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';

defineOptions({
	name: 'SensorAnalysisChildComponentItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: Number,
	fromFFTPage: Boolean,
	rpm_source_value: null,
	savingInProgress: Boolean,
});

const emit = defineEmits(['event', 'save']);
const formData = reactive({
	id: null,
	child_component_id: null,
	child_equipment_type_id: null,
	brand_id: null,
	brand_model_id: null,
	vibration_analysis_rules: [],
});

const childOriginalComponent = computed(() => props.itemData.original_component || props.itemData);
const equipmentType = computed(() => props.itemData.equipmentType || props.itemData.equipment_type || {});
const brandName = computed(() => props.itemData.brand?.name || props.itemData.brand_name || '');
const brandModelName = computed(() => props.itemData.brandModel?.name || props.itemData.brand_model?.name || props.itemData.brand_model_name || '');

const setupPage = (item = {}) => {
	Object.assign(formData, {
		id: item.id || null,
		child_component_id: item.child_component_id || item.id || null,
		child_equipment_type_id: item.child_equipment_type_id || item.equipment_type_id || null,
		brand_id: item.brand_id || item.brand?.id || null,
		brand_model_id: item.brand_model_id || item.brandModel?.id || item.brand_model?.id || null,
		vibration_analysis_rules: item.vibration_analysis_rules || [],
	});
};

const collectData = () => ({ ...formData });
const validateForm = () => true;
const addChildComponentToSelected = () => {
	emit('event', {
		eventName: 'toggleFFTChildComponent',
		data: {
			item: props.itemData,
			formData: collectData(),
		},
		onward: true,
	});
};

watch(
	() => props.itemData,
	(item) => setupPage(item),
	{ immediate: true },
);

defineExpose({
	formData,
	collectData,
	validateForm,
});
</script>
