<template>
	<div v-if="fromFFTPage" :class="['analysis-item', { 'flex align-center': insideChartAnalysisRulesBar }]">
		<div :class="[insideChartAnalysisRulesBar ? 'semi-bold title-block' : 'article-title']">
			{{ originalRule.name }}
		</div>
		<div
			:class="[
				{ 'card filled_4 bordered': !insideChildComponentItem && !insideChartAnalysisRulesBar },
				{ 'ml-auto': insideChildComponentItem },
			]"
		>
			<div
				:class="[
					{ 'card-content': !insideChildComponentItem && !insideChartAnalysisRulesBar },
					{ 'data-block': insideChildComponentItem },
					{ 'flex align-center data-block': insideChartAnalysisRulesBar },
				]"
			>
				<SimpleSpinner :active="ruleOptionsLoading" />
				<div v-if="showRuleItemTextValue" class="value">{{ selectedRuleItemTextValue }}</div>
				<div class="unit">{{ originalRule.unit }}</div>
				<el-button
					native-type="button"
					class="action-button settings-button"
					icon="el-icon-setting"
					@click.stop="handleShowAnalysisRuleFormDialog"
				/>
			</div>
		</div>

		<el-dialog
			v-if="initiatedAnalysisRuleFormDialog"
			v-model="showAnalysisRuleFormDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-analysis-values-dialog"
			title="Settings"
		>
			<el-form
				ref="itemFormRef"
				class="option-item-container"
				:model="formData"
				:rules="formRules"
				label-width="200px"
				:label-position="isMobile ? 'top' : 'left'"
			>
				<el-form-item
					v-if="showFFTAnalysisHarmonicsSettings"
					:label="tt('harmonics')"
					prop="harmonics"
				>
					<CustomInput
						v-model="formData.harmonics"
						class="mcol-xs-11 span-block"
						:placeholder="tt('harmonics')"
					/>
				</el-form-item>

				<el-form-item v-else :label="originalRule.name" prop="option_value_id">
					<div class="flex align-center">
						<CustomInput
							v-if="itemData.custom_value && isCustomEnabled"
							v-model="formData.custom_value"
							class="mcol-xs-11 span-block"
							:placeholder="tt('Input')"
						/>
						<CustomSelectV2
							v-else
							v-model="formData.option_value_id"
							class="mcol-xs-11 span-block"
							filterable
							clearable
							allow-create
							:enabled="true"
							:optionsLoading="ruleOptionsLoading"
							:optionsList="ruleOptionsList"
							:placeholder="`${tt('Select')} ${tt('option')}`"
							labelKey="value"
						/>

						<span class="span-block mcol-xs-1">{{ originalRule.unit }}</span>
					</div>
				</el-form-item>
			</el-form>

			<div class="dialog-footer dialog-decorate-footer text-center">
				<el-button
					type="primary"
					:loading="savingInProgress"
					class="uppercase semi-bold"
					@click="handleSave"
				>
					{{ tt('Save') }}
				</el-button>

				<el-button class="uppercase semi-bold" @click="showAnalysisRuleFormDialog = false">
					{{ tt('Cancel') }}
				</el-button>
			</div>
		</el-dialog>
	</div>

	<el-form
		v-else
		ref="itemFormRef"
		class="option-item-container"
		:model="formData"
		:rules="formRules"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item :label="originalRule.name" prop="option_value_id">
			<div class="flex align-center">
				<CustomInput
					v-if="originalRule.is_editable && isCustomEnabled"
					v-model="formData.custom_value"
					class="mcol-xs-8"
					:placeholder="tt('Input')"
				/>

				<CustomSelectV2
					v-else
					v-model="formData.option_value_id"
					class="mcol-xs-8"
					filterable
					clearable
					:optionsLoading="ruleOptionsLoading"
					:optionsList="ruleOptionsList"
					:placeholder="`${tt('Select')} ${tt('option')}`"
					labelKey="value"
				/>

				<span class="mcol-xs-2 text-center">{{ originalRule.unit }}</span>

				<div
					v-if="originalRule.is_editable"
					class="pointer mcol-xs-2 ml-auto"
					@click="isCustomEnabled = !isCustomEnabled"
				>
					{{ isCustomEnabled ? 'Spec' : tt('Custom') }}
				</div>
			</div>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'EquipmentAnalysisRuleItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	equipmentTypeId: Number,
	brandModelId: Number,
	fromFFTPage: Boolean,
	insideChildComponentItem: Boolean,
	insideChartAnalysisRulesBar: Boolean,
	savingInProgress: Boolean,
	rpm_source_value: null,
	crossoverRulesList: { type: Array, default: null },
	showRuleItemTextValue: Boolean,
});

const emit = defineEmits(['save']);

const itemFormRef = ref(null);
const initiatedAnalysisRuleFormDialog = ref(false);
const showAnalysisRuleFormDialog = ref(false);
const ruleOptionsLoading = ref(false);
const localCrossoverOptionsList = ref([]);
const isCustomEnabled = ref(false);
const formData = ref({
	id: null,
	original_rule_id: null,
	option_value_id: null,
	harmonics: '',
	custom_value: null,
});

const originalRule = computed(() => props.itemData?.original_rule || {});
const showFFTAnalysisHarmonicsSettings = computed(() => props.fromFFTPage && props.insideChartAnalysisRulesBar);
const ruleOptionsList = computed(() => props.crossoverRulesList || localCrossoverOptionsList.value);
const selectedRuleItemTextValue = computed(() => {
	const { custom_value, option_value_id } = props.itemData || {};
	if (custom_value) return custom_value;
	if (option_value_id) {
		const item = ruleOptionsList.value.find((option) => option.id === option_value_id);
		return item ? item.vibration_analysis_value : '-';
	}
	return '-';
});
const formRules = computed(() => ({
	harmonics: [
		{
			validator: (rule, value, callback) => {
				if (!showFFTAnalysisHarmonicsSettings.value) {
					callback();
					return;
				}

				const normalizedValue = value == null ? '' : `${value}`.trim();
				if (!normalizedValue) {
					callback();
					return;
				}

				if (!/^[1-9]\d*$/.test(normalizedValue)) {
					callback(new Error('Harmonics must be a positive integer'));
					return;
				}

				callback();
			},
			trigger: ['blur', 'change'],
		},
	],
}));

const fetchAnalysisRuleCrossoverOptionsRequest = computed(() => {
	if (!props.equipmentTypeId || !props.itemData?.original_rule_id) return null;
	return createGetRequest(
		`/equipments/types/${props.equipmentTypeId}/vibration-analysis-rules/${props.itemData.original_rule_id}/crossover-options-values`,
	);
});

const fetchAnalysisRuleCrossoverOptions = () => {
	const request = fetchAnalysisRuleCrossoverOptionsRequest.value;
	if (!request || props.crossoverRulesList) return;

	ruleOptionsLoading.value = true;
	request({
		params: {
			brand_model_id: props.brandModelId,
			rpm: props.rpm_source_value,
		},
	})
		.then(({ value }) => {
			localCrossoverOptionsList.value = value || [];
		})
		.finally(() => {
			ruleOptionsLoading.value = false;
		});
};

const localSetupPageActions = (item = {}) => {
	isCustomEnabled.value = !!(originalRule.value.is_editable && item.custom_value);

	if (showFFTAnalysisHarmonicsSettings.value) {
		formData.value.harmonics = item.active_harmonics || originalRule.value.harmonics || '';
	}
};

const localGetFormDataCallback = (data) => {
	const nextData = { ...data };

	if (showFFTAnalysisHarmonicsSettings.value) {
		nextData.harmonics = nextData.harmonics == null ? '' : `${nextData.harmonics}`.trim();
		delete nextData.option_value_id;
		delete nextData.custom_value;
		return nextData;
	}

	if (isCustomEnabled.value) {
		nextData.option_value_id = null;
	} else {
		nextData.custom_value = null;
	}

	if (nextData.option_value_id == null) {
		delete nextData.option_value_id;
	}
	return nextData;
};

const {
	isMobile,
	validateItemForm,
	getFormData,
	setupPage,
} = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions,
	localGetFormDataCallback,
	deleteNewId: true,
	emit,
});

const collectData = getFormData;

const handleShowAnalysisRuleFormDialog = () => {
	initiatedAnalysisRuleFormDialog.value = true;
	showAnalysisRuleFormDialog.value = true;
	setupPage(props.itemData);
};

const handleSave = async () => {
	if (showFFTAnalysisHarmonicsSettings.value && !(await validateItemForm())) {
		return;
	}

	emit('save');
};

watch(
	() => [props.equipmentTypeId, props.brandModelId, props.itemData?.original_rule_id, props.rpm_source_value],
	() => fetchAnalysisRuleCrossoverOptions(),
	{ immediate: true },
);

defineExpose({
	formData,
	validateItemForm,
	getFormData,
	collectData,
});
</script>
