<template>
	<div class="edit-form-container multiview-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="content-row flex">
				<div class="article-title semi-bold capitalize">{{ viewName }}</div>

				<el-button
					class="ml-auto action-button remove-button"
					size="small"
					type="danger"
					@click="removeItem"
				>
					<i class="icomoon icon-cross"></i>
				</el-button>
			</div>

			<el-form-item
				class="content-row"
				required
				:label="`${tt('View')} ${tt('name')}`"
				prop="name"
				label-width="150px"
			>
				<CustomInput
					v-model="formData.name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item prop="multi_view_graphs">
				<div class="charts-form-container options-container filled_3">
					<div v-if="chartsItemsList.length" class="content-row">
						<ChartItem
							v-for="(item, idx) in chartsItemsList"
							:ref="(el) => setSubItemRef('ChartItem', el, idx)"
							:key="`chart_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="(id) => removeFormItem(id, chartsItemsList)"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="create-button content-row with-text small"
							size="small"
							type="success"
							@click="addFormItem(chartsItemsList, 'c_i-')"
						>
							<span class="capitalize">{{ `${tt('Add')} ${tt('Chart')}` }}</span>
							<i class="icomoon icon-plus"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import CustomInput from '@/components/form/CustomInput.vue';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import ChartItem from './ChartItem.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentMultiViewItemForm' });

const props = defineProps({
	equipmentData: { type: Object, default: () => ({}) },
	itemData: { type: Object, default: () => null },
	fromModal: Boolean,
	showSubmitButtons: Boolean,
	editInModal: Boolean,
	additionalSettings: { type: Object, default: () => ({}) },
	itemsName: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const refsMap = ref({});
const chartsItemsList = ref([]);
const formData = ref({
	id: null,
	name: '',
	multi_view_graphs: [],
});

const isNew = computed(() => props.itemData?.new);
const rules = Object.freeze({ name: required });
const subItemsSettings = Object.freeze([
	{ ref: 'ChartItem', targetProp: 'multi_view_graphs' },
]);
const viewName = computed(() => {
	if (isNew.value) {
		return `${tt('New')} ${tt('View')}`;
	}
	return formData.value.name;
});

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

const { isMobile, validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	deleteNewId: true,
	localSetupPageActions: (item) => {
		if (item) {
			chartsItemsList.value = setupFormSubItemsList(item.multi_view_graphs, 'c_i');
		}
	},
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
