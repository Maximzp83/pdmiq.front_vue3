<template>
	<div class="edit-form-container graph-thresholds-form-container">
		<SimpleSpinner :active="isSaving" />

		<div class="section-row">
			<div v-if="graphThresholdsItemsList.length" class="content-row">
				<ThresholdItem
					v-for="(item, idx) in graphThresholdsItemsList"
					:key="`thresold_item-${item.id}`"
					:ref="(el) => setSubItemRef('ThresholdItem', el, idx)"
					class="threshold-item"
					:item-data="item"
					:item-index="idx"
					:metricItemsList="metricItemsList"
					:requestsList="requestsList"
					@onRemove="(id) => removeFormItem(id, graphThresholdsItemsList)"
				/>
			</div>

			<div class="margin-top-row flex">
				<el-button
					class="div-block create-button with-text inverted small"
					type="primary"
					@click="addFormItem(graphThresholdsItemsList, 't_i-', { formData: { type: MULTIVIEW_ALARM_TYPES.COMPARE } })"
				>
					<span class="span-block capitalize text-middle">{{ `${tt('Add')} ${tt('Compare')}` }}</span>
					<i class="span-block icomoon icon-plus text-middle"></i>
				</el-button>

				<el-button
					class="div-block create-button with-text inverted small"
					type="primary"
					@click="addFormItem(graphThresholdsItemsList, 't_i-', { formData: { type: MULTIVIEW_ALARM_TYPES.STANDARD_WARNING_ALARM } })"
				>
					<span class="span-block capitalize text-middle">{{ `${tt('Add')} ${tt('Alarm')}/${tt('Warning')}` }}</span>
					<i class="span-block icomoon icon-plus text-middle"></i>
				</el-button>

				<el-button
					class="div-block create-button with-text inverted small"
					type="primary"
					@click="addFormItem(graphThresholdsItemsList, 't_i-', { formData: { type: MULTIVIEW_ALARM_TYPES.STANDARD_LOW_HIGH } })"
				>
					<span class="span-block capitalize text-middle">{{ `${tt('Add')} ${tt('Low')}/${tt('High')}` }}</span>
					<i class="span-block icomoon icon-plus text-middle"></i>
				</el-button>
			</div>
		</div>

		<div class="dialog-decorate-footer dialog-footer section-row text-center">
			<el-button type="primary" :loading="isSaving" class="uppercase" @click="validateForm">
				{{ tt('SAVE') }}
			</el-button>
			<el-button @click="closeDialog">{{ tt('Cancel') }}</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { MULTIVIEW_ALARM_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useNotify } from '@/composables/useNotify';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import ThresholdItem from './ThresholdItem.vue';

const { tt } = Lang;
const { Notify } = useNotify();

defineOptions({
	name: 'GraphThresholdsFormWrapper',
});

const props = defineProps({
	thresholdsSetupData: { type: Object, default: () => ({}) },
	visible: Boolean,
	multiViewData: { type: Object, required: true },
});

const emit = defineEmits(['event', 'closeDialog']);

const refsMap = reactive({});
const isSaving = ref(false);
const graphThresholdsItemsList = ref([]);
const formData = ref({});

const graphItemData = computed(() => props.thresholdsSetupData.graphItemData);
const requestsList = computed(() => props.thresholdsSetupData.requestsList || []);
const metricItemsList = computed(() => graphItemData.value?.graph_items || []);
const subItemsSettings = computed(() =>
	Object.freeze([{ ref: 'ThresholdItem', targetProp: 'thresholdsItems', returnArray: true }]),
);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({ formData, refsMap });

const closeDialog = () => {
	emit('closeDialog');
};

const validateForm = async () => {
	if (await validateSubItemsForm(subItemsSettings.value)) {
		resetFormDataBySubItems(subItemsSettings.value);
		const { thresholdsItems } = collectDataFromSubItems(subItemsSettings.value);
		submitGraphThresholds(thresholdsItems);
		return;
	}

	Notify({
		type: 'warning',
		title: tt('phrases.form_isnt_ready'),
		message: tt('phrases.Please_check_fields_errors_first'),
	});
};

const submitGraphThresholds = (thresholdsItems) => {
	isSaving.value = true;
	api_request.post(`/equipments/metric-multi-views/${props.multiViewData.id}/graphs/${graphItemData.value.id}/thresholds`, {
		data: { data: thresholdsItems || [] },
		itemName: 'Graph Thresholds',
	})
		.then(() => {
			emit('event', {
				eventName: 'fetchMultiViews',
				data: props.multiViewData.equipment_id,
				onward: true,
			});
			closeDialog();
		})
		.finally(() => {
			isSaving.value = false;
		});
};

watch(
	() => props.visible,
	(visible) => {
		if (visible) {
			graphThresholdsItemsList.value = setupFormSubItemsList(graphItemData.value?.graph_thresholds, 't_i');
		} else {
			graphThresholdsItemsList.value = [];
		}
	},
	{ immediate: true },
);
</script>
