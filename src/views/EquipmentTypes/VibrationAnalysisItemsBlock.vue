<template>
	<div class="edit-form-container relative">
		<SimpleSpinner :active="isLoading" />

		<el-form
			ref="vibrationAnalysisFormRef"
			:class="['item-edit-form']"
			:model="formData"
			label-width="0px"
			label-position="left"
		>
			<el-form-item>
				<div class="semi-bold article-title uppercase">
					{{ `${tt('Analysis')} ${tt('Item')}` }}
				</div>

				<div class="options-container wrapperBlock">
					<div v-if="vibrationAnalysisItems.length" :class="['content-row', { fluid: fromModal }]">
						<AnalysisItem
							v-for="(item, idx) in vibrationAnalysisItems"
							:key="`va-${item.id}`"
							:ref="(el) => setSubItemRef('AnalysisItem', el, idx)"
							:item-data="item"
							:item-index="idx"
							@onRemove="(id) => removeFormItem(id, vibrationAnalysisItems)"
						/>
					</div>

					<div class="margin-top-row button-row">
						<el-button
							class="action-button create-button small with-text"
							size="small"
							type="success"
							@click="addFormItem(vibrationAnalysisItems, 'va_i-')"
						>
							<span class="capitalize">{{ `${tt('add')} ${tt('Analysis')}` }}</span>
							<i class="suffix-icon icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import AnalysisItem from './AnalysisItem.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'EquipmentTypesVibrationAnalysisItemsBlock',
});

const props = defineProps({
	equipmentTypeId: { type: [Number, String], default: null },
	fromModal: Boolean,
});

const vibrationAnalysisFormRef = ref(null);
const isLoading = ref(false);
const vibrationAnalysisItems = ref([]);
const refsMap = ref({
	AnalysisItem: [],
});
const formData = ref({
	data: [],
});

const subItemsSettings = ref([
	{ ref: 'AnalysisItem', targetProp: 'data' },
]);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const fetchVibrationAnalysis = async () => {
	if (!props.equipmentTypeId) return;

	isLoading.value = true;
	try {
		const answer = await api_request.get(
			`/equipments/types/${props.equipmentTypeId}/vibration-analysis-rules`,
			{ notNotify: true },
		);
		vibrationAnalysisItems.value = setupFormSubItemsList(answer?.value || [], 'va_i');
	} finally {
		isLoading.value = false;
	}
};

const validateItemForm = () => validateSubItemsForm(subItemsSettings.value);

const submitItemForm = async () => {
	if (!props.equipmentTypeId) return;
	if (!validateItemForm()) return;

	const data = collectDataFromSubItems(subItemsSettings.value);
	if (!data?.data) return;

	isLoading.value = true;
	try {
		await api_request.post(
			`/equipments/types/${props.equipmentTypeId}/vibration-analysis-rules`,
			{
				data,
				resultMessage: 'Vibration Analysis Rules Saved',
			},
		);
	} finally {
		isLoading.value = false;
	}
};

onMounted(() => {
	fetchVibrationAnalysis();
});

defineExpose({
	validateItemForm,
	submitItemForm,
});
</script>
