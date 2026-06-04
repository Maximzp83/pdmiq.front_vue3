<template>
	<el-form
		ref="itemFormRef"
		class="form-subitem-container io-parameter-item-container border-top-devider"
		:model="formData"
		:rules="rules"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item :label="tt('name')" prop="name" :class="{ 'mcol-xs-6': !fromModal }">
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item :label="tt('units')" prop="units" :class="{ 'mcol-xs-6': !fromModal }">
			<CustomInput v-model="formData.units" :placeholder="tt('units')" />
		</el-form-item>

		<el-form-item :label="tt('formula')" prop="formula" :class="{ 'mcol-xs-6': !fromModal }">
			<CustomInput v-model="formData.formula" :placeholder="tt('formula')" />
		</el-form-item>

		<el-form-item :label="`${tt('constants.Alarm')} ${tt('Type')}`" prop="alarm_type" :class="{ 'mcol-xs-6': !fromModal }">
			<CustomSelectV2
				v-model="formData.alarm_type"
				:optionsList="ncdAlarmTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
			/>
		</el-form-item>

		<el-form-item :label="`${tt('Chart')} ${tt('Type')}`" prop="graph_type" :class="{ 'mcol-xs-6': !fromModal }">
			<CustomSelectV2
				v-model="formData.graph_type"
				:optionsList="chartTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
			/>
		</el-form-item>

		<el-form-item :label="tt('customizable')" prop="is_customizable">
			<el-switch v-model="formData.is_customizable" :active-value="1" :inactive-value="0" />
		</el-form-item>

		<el-form-item :label="tt('Signed')" prop="is_signed">
			<el-switch v-model="formData.is_signed" :active-value="1" :inactive-value="0" />
		</el-form-item>

		<el-form-item label=" ">
			<el-button
				class="ml-auto action-button remove-button"
				size="small"
				type="danger"
				@click="removeItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { chartTypesList as getChartTypesList, ncdAlarmTypesList as getNcdAlarmTypesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'BannerV2SubtypeIOParameterItem',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	itemIndex: Number,
	isMobile: Boolean,
	fromModal: Boolean,
});

const emit = defineEmits(['onRemove']);
const itemFormRef = ref(null);

const formData = ref({
	id: null,
	name: '',
	units: '',
	formula: '',
	alarm_type: null,
	graph_type: null,
	is_customizable: 0,
	is_signed: 0,
});

const rules = {
	name: required,
	formula: required,
	alarm_type: required,
};

const ncdAlarmTypesList = computed(() => Object.freeze(getNcdAlarmTypesList()));
const chartTypesList = computed(() => Object.freeze(getChartTypesList()));

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
});
</script>
