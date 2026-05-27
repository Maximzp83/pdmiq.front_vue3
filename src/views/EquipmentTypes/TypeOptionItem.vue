<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container type-option-item', { fromModal }]"
		:model="formData"
	>
		<div :class="['flex mrow content-container content-row', { wrap: fromModal }]">
			<el-form-item prop="category_ids" :class="[fromModal ? 'mcol-xs-4' : 'mcol-xs-2']">
				<label>{{ `${tt('Type')} ${tt('Category')}` }}</label>
				<CustomSelectV2
					v-model="formData.category_ids"
					className="mini"
					multiple
					collapse-tags
					:optionsList="typesCategoriesList"
					:placeholder="`${tt('Select')} ${tt('category')}`"
				/>
			</el-form-item>

			<el-form-item prop="name" :class="[fromModal ? 'mcol-xs-4' : 'mcol-xs-2']" required>
				<label>{{ tt('Name') }}</label>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item prop="crossover_rule_type" :class="[fromModal ? 'mcol-xs-4' : 'mcol-xs-2', 'relative']">
				<label>{{ tt('phrases.Crossover_Rule_Type') }}</label>
				<CustomSelectV2
					v-model="formData.crossover_rule_type"
					clearable
					:optionsList="crossoverRulesTypesOptions"
					:placeholder="`${tt('Select')} ${tt('type')}`"
				/>

				<div v-if="formData.crossover_rule_type === CROSSOVER_RULES_TYPES.RANGE" class="flex mrow wrap sub-row">
					<el-form-item class="mcol-xs-12" prop="range_type">
						<label>{{ `${tt('Range')} ${tt('type')}` }}</label>
						<CustomSelectV2
							v-model="formData.range_type"
							clearable
							:optionsList="crossoverRuleRangeTypesOptions"
							:placeholder="`${tt('Select')} ${tt('type')}`"
						/>
					</el-form-item>

					<el-form-item class="mcol-xs-6" prop="value_minus">
						<label>{{ tt('Minus') }}</label>
						<CustomInput v-model="formData.value_minus" :placeholder="tt('value')" />
					</el-form-item>

					<el-form-item class="mcol-xs-6" prop="value_plus">
						<label>{{ tt('Plus') }}</label>
						<CustomInput v-model="formData.value_plus" :placeholder="tt('value')" />
					</el-form-item>
				</div>
			</el-form-item>

			<el-form-item
				prop="has_predefined_values"
				:class="[fromModal ? 'mcol-xs-4' : 'mcol-xs-2', 'predefined-switch relative switchers-block']"
			>
				<label class="small-lh">{{ `${tt('has')} ${tt('predefined')}` }}</label>
				<el-switch
					v-model="formData.has_predefined_values"
					class="without-margin"
					:active-value="1"
					:inactive-value="0"
				/>

				<div v-if="formData.has_predefined_values" class="flex mrow wrap">
					<el-form-item prop="predefined_values" class="predefined-values">
						<div class="options-container relative">
							<div v-if="predefinedValuesItemsList.length" class="content-row">
								<PredefinedValueItem
									v-for="(item, idx) in predefinedValuesItemsList"
									:key="`pv_item-${item.id}`"
									:ref="(el) => setSubItemRef('PredefinedValueItem', el, idx)"
									:item-data="item"
									:item-index="idx"
									@onRemove="(id) => removeFormItem(id, predefinedValuesItemsList)"
								/>
							</div>

							<div class="create-button-container">
								<el-button
									:disabled="!formData.has_predefined_values"
									class="action-button create-button"
									size="small"
									type="success"
									@click="addFormItem(predefinedValuesItemsList, 'pv_i-')"
								>
									<i class="icomoon icon-cross"></i>
								</el-button>
							</div>
						</div>
					</el-form-item>
				</div>
			</el-form-item>

			<el-form-item prop="is_in_dashboard_view" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ `${tt('phrases.show_in_filter')}` }}</label>
				<el-switch
					v-model="formData.is_in_dashboard_view"
					class="without-margin"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="is_in_equipment_card" class="mcol-xs-1 switchers-block">
				<label>{{ `${tt('phrases.show_in_item')}` }}</label>
				<el-switch
					v-model="formData.is_in_equipment_card"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="is_visible_in_vibration_analysis" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ `${tt('phrases.show_in_Analysis')}` }}</label>
				<el-switch
					v-model="formData.is_visible_in_vibration_analysis"
					class="without-margin"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="convert_to_predefined_values" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ `${tt('phrases.convert_to_predefined')}` }}</label>
				<el-switch
					v-model="formData.convert_to_predefined_values"
					class="without-margin"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="is_rpm" class="mcol-xs-1 switchers-block">
				<label>{{ tt('Is_RPM') }}</label>
				<el-switch v-model="formData.is_rpm" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item prop="is_fla" class="mcol-xs-1 switchers-block">
				<label>{{ tt('Is_FLA') }}</label>
				<el-switch v-model="formData.is_fla" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<div>
				<el-button
					class="action-button remove-button"
					size="small"
					type="danger"
					@click="handleRemoveItem"
				>
					<i class="icomoon icon-cross"></i>
				</el-button>
			</div>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElMessageBox } from 'element-plus';

import {
	CROSSOVER_RULES_TYPES,
	crossoverRulesTypesList,
	crossoverRuleRangeTypesList,
} from '@/constants/global';
import { removeObjProps } from '@/helpers';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import PredefinedValueItem from './PredefinedValueItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'EquipmentTypesTypeOptionItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	typesCategoriesList: { type: Array, default: () => [] },
	fromModal: Boolean,
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const predefinedValuesItemsList = ref([]);
const refsMap = ref({
	PredefinedValueItem: [],
});
const formData = ref({
	id: null,
	category_ids: null,
	name: '',
	has_predefined_values: 0,
	predefined_values: [],
	crossover_rule_type: null,
	range_type: null,
	value_minus: '',
	value_plus: '',
	is_in_dashboard_view: 0,
	is_in_equipment_card: 0,
	is_visible_in_vibration_analysis: 0,
	is_rpm: 0,
	is_fla: 0,
	convert_to_predefined_values: 0,
});

const crossoverRulesTypesOptions = computed(() => Object.freeze(crossoverRulesTypesList()));
const crossoverRuleRangeTypesOptions = computed(() => Object.freeze(crossoverRuleRangeTypesList()));

const { setupFormSubItemsList, addFormItem, removeFormItem, collectDataFromSubItems, setSubItemRef } = useSubItemsList({
	formData,
	refsMap,
});

const localSetupPageActions = (itemData) => {
	if (itemData) {
		predefinedValuesItemsList.value = setupFormSubItemsList(itemData.predefined_values || [], 'pv_i');
	}
};

const localGetFormDataCallback = (data) => {
	const nextData = { ...data };
	const deleteProps = [];

	if (nextData.crossover_rule_type !== CROSSOVER_RULES_TYPES.RANGE) {
		deleteProps.push('range_type', 'value_minus', 'value_plus');
	} else {
		nextData.value_minus = nextData.value_minus ? `${nextData.value_minus}` : nextData.value_minus;
		nextData.value_plus = nextData.value_plus ? `${nextData.value_plus}` : nextData.value_plus;
	}

	if (nextData.has_predefined_values) {
		nextData.predefined_values = collectDataFromSubItems([
			{ ref: 'PredefinedValueItem', targetProp: 'predefined_values' },
		]).predefined_values || [];
	} else {
		deleteProps.push('predefined_values');
	}

	if (!nextData.crossover_rule_type) {
		deleteProps.push('crossover_rule_type');
	}

	return removeObjProps(nextData, deleteProps);
};

const subItemApi = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions,
	localGetFormDataCallback,
	deleteNewId: true,
	emit,
});

const { validateItemForm, getFormData, removeItem } = subItemApi;

const handleRemoveItem = async () => {
	try {
		await ElMessageBox.confirm(
			`${tt('phrases.Do_you_really_want_to')} ${tt('phrases.delete_this_option')}? ${tt('Continue')}?`,
			'Warning',
			{
				confirmButtonText: tt('Confirm'),
				cancelButtonText: tt('Cancel'),
				type: 'warning',
			},
		);
		removeItem();
	} catch (error) {
		void error;
	}
};

defineExpose({
	validateItemForm,
	getFormData,
	removeItem: handleRemoveItem,
});
</script>
