<template>
	<el-form
		ref="itemFormRef"
		class="form-subitem-container io-parameter-item-container border-top-devider"
		:model="formData"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item :label="tt('parameter')" class="label_pt-5 mini showJustInfo">
			<div>{{ itemData.title }}</div>
		</el-form-item>

		<el-form-item :label="tt('name')" prop="name" class="mcol-xs-9 label_pt-5 mini">
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item :label="tt('units')" prop="units" class="mcol-xs-9 label_pt-5 mini">
			<CustomInput v-model="formData.units" :placeholder="tt('units')" />
		</el-form-item>

		<el-form-item prop="formula" class="mcol-xs-9 label_pt-5 mini">
			<template #label>
				<span class="span-block">{{ tt('formula') }}</span>
				<span class="span-block">
					<el-tooltip effect="dark" placement="bottom">
						<i class="el-icon-info"></i>
						<template #content>
							<div v-html="tooltipContent"></div>
						</template>
					</el-tooltip>
				</span>
			</template>

			<CustomInput v-model="formData.formula" :placeholder="tt('formula')" />
		</el-form-item>

		<el-form-item :label="`${tt('Chart')} ${tt('Type')}`" prop="graph_type" class="mcol-xs-9 label_pt-5 mini">
			<CustomSelectV2
				v-model="formData.graph_type"
				class="mini"
				:optionsList="chartTypes"
				:placeholder="`${tt('Select')} ${tt('type')}`"
			/>
		</el-form-item>

		<el-form-item :label="`${tt('line')} ${tt('speed')}`" prop="is_line_speed">
			<el-switch v-model="formData.is_line_speed" :active-value="1" :inactive-value="0" />
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { chartTypesList } from '@/constants/global';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'SubTypeParameterItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	fromModal: Boolean,
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const isMobile = ref(document.documentElement.clientWidth < 992);
const formData = ref({
	id: null,
	name: '',
	units: '',
	formula: '',
	graph_type: null,
	is_line_speed: false,
});

const chartTypes = computed(() => Object.freeze(chartTypesList()));
const tooltipContent = computed(() => tt('aliases.subtype_formula_tooltip'));

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
