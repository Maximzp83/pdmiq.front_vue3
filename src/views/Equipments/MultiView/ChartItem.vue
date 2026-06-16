<template>
	<el-form ref="itemFormRef" :model="formData">
		<div class="content-row flex mrow bottom">
			<el-form-item
				prop="name"
				class="mcol-xs-10"
				:label="`${tt('Chart')} ${tt('name')}`"
			>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<div class="mcol-xs-auto ml-auto">
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

		<div class="content-row semi-bold">{{ tt('constants.Metric') }}</div>

		<el-form-item prop="graph_items">
			<div class="options-container filled_3">
				<div v-if="metricItemsList.length" class="content-row">
					<MetricItem
						v-for="(item, idx) in metricItemsList"
						:ref="(el) => setSubItemRef('MetricItem', el, idx)"
						:key="`metric_item-${item.id}`"
						:item-data="item"
						:item-index="idx"
						@onRemove="(id) => removeFormItem(id, metricItemsList)"
					/>
				</div>

				<div class="content-row margin-top-row">
					<el-button
						class="create-button small bold"
						size="small"
						type="success"
						@click="addFormItem(metricItemsList, 'm_i-')"
					>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</div>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import CustomInput from '@/components/form/CustomInput.vue';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import MetricItem from './MetricItem.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentMultiViewChartItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const refsMap = ref({});
const metricItemsList = ref([]);
const formData = ref({
	id: null,
	name: '',
	graph_items: [],
});

const subItemsSettings = Object.freeze([{ ref: 'MetricItem', targetProp: 'graph_items' }]);
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

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	deleteNewId: true,
	localSetupPageActions: (item) => {
		if (item) {
			metricItemsList.value = setupFormSubItemsList(item.graph_items, 'm_i');
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
