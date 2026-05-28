<template>
	<el-form
		ref="itemFormRef"
		class="option-item-container process-option-item"
		:model="formData"
	>
		<div class="main-row content-row">
			<div class="flex mrow wrap content-container vertical-margin align-center">
				<el-form-item class="mcol-xs-12 mcol-sm-4" prop="name">
					<label v-if="itemIndex === 0">{{ tt('name') }}</label>
					<CustomInput
						v-model="formData.name"
						required
						:placeholder="`${tt('process')} ${tt('name')}`"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-sm-3" prop="notes">
					<label v-if="itemIndex === 0">{{ tt('Notes') }}</label>
					<CustomInput
						v-model="formData.notes"
						:placeholder="`${tt('input')} ${tt('notes')}`"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-sm-3" prop="expected_time">
					<label v-if="itemIndex === 0">{{ tt('Expected_time') }}</label>
					<el-time-select
						v-model="formData.expected_time"
						:picker-options="timePickerOptions"
						:placeholder="`${tt('select')} ${tt('time')}`"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-sm-1 switchers-block" prop="parts">
					<label v-if="itemIndex === 0">{{ tt('Parts') }}</label>
					<el-switch v-model="hasParts" />
				</el-form-item>

				<div class="remove-button-container">
					<el-button
						class="action-button remove-button"
						size="small"
						type="danger"
						@click="removeItem"
					>
						<i class="icomoon icon-cross"></i>
					</el-button>
				</div>
			</div>
		</div>

		<div v-if="hasParts" class="content-row sub-items-section card no-shadow">
			<div class="card-content filled">
				<el-form-item prop="">
					<div class="options-container relative mcol-xs-12 mcol-sm-8">
						<div v-if="partsItemsList.length" class="part-item content-row">
							<PartItem
								v-for="(item, idx) in partsItemsList"
								:key="`pv_item-${item.id}`"
								:ref="(el) => setSubItemRef('PartItem', el, idx)"
								:item-data="item"
								:item-index="idx"
								:partsList="partsList"
								:isLast="partsItemsList.length === idx + 1"
								@onRemove="(id) => removeFormItem(id, partsItemsList)"
							/>
						</div>

						<div class="create-button-container">
							<el-button
								class="action-button create-button"
								size="small"
								type="success"
								@click="addFormItem(partsItemsList, 'p_i-')"
							>
								<i class="icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import PartItem from './PartItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'TaskProceduresProcessItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	partsLoading: Boolean,
	partsList: { type: Array, default: () => [] },
	showJustInfo: Boolean,
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const hasParts = ref(false);
const partsItemsList = ref([]);
const refsMap = ref({
	PartItem: [],
});
const formData = ref({
	id: null,
	name: '',
	notes: '',
	expected_time: '',
	parts: [],
});

const timePickerOptions = Object.freeze({
	start: '00:00',
	step: '00:15',
	end: '23:45',
});

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'PartItem', targetProp: 'parts' },
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

const filterEmptyItems = (list = []) => list.filter((item) => item.id || item.part_id || item.quantity);

const localSetupPageActions = (item) => {
	if (item) {
		partsItemsList.value = setupFormSubItemsList(item.parts, 'p_i');
		hasParts.value = !!partsItemsList.value.length;
	}

	if (!props.showJustInfo && !partsItemsList.value.length) {
		addFormItem(partsItemsList, 'p_i-');
	}
};

const localGetFormDataCallback = (data) => ({
	...data,
	parts: filterEmptyItems(data.parts),
});

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localSetupPageActions,
	localGetFormDataCallback,
	deleteNewId: true,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
