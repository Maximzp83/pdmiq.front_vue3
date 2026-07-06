<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('name')" prop="name" :class="{ 'mcol-xs-6': !fromModal }">
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item :label="tt('Model_number')" prop="model_number" :class="{ 'mcol-xs-6': !fromModal }">
				<CustomInput v-model="formData.model_number" :placeholder="tt('model_number')" />
			</el-form-item>

			<el-form-item :label="tt('Part_number')" prop="part_number" :class="{ 'mcol-xs-6': !fromModal }">
				<CustomInput v-model="formData.part_number" :placeholder="tt('part_number')" />
			</el-form-item>

			<el-form-item prop="sensor_class" :label="tt('Tag')">
				<CustomSelectV2
					v-model="formData.sensor_class"
					clearable
					class="capitalize"
					optionClassName="capitalize"
					:optionsList="sensorClassesList"
					:placeholder="`${tt('Select')} ${tt('tag')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('default')" prop="is_default">
				<el-switch v-model="formData.is_default" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item :label="`${tt('Allow')} FFT`" prop="is_fft_allowed">
				<el-switch v-model="formData.is_fft_allowed" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<div :label="tt('IO_Parameters')" prop="parameters" class="mt-20">
				<div class="title article-title">{{ tt('IO_Parameters') }}:</div>
				<div class="form-subitems-wrapper">
					<div v-if="ioParametersItemsList.length" class="form-subitems-list content-row">
						<IOParameterItem
							v-for="(item, idx) in ioParametersItemsList"
							:ref="(el) => setSubItemRef('IOParameterItem', el, idx)"
							:key="`io_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							fromModal
							@onRemove="(id) => removeFormItem(id, ioParametersItemsList)"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="create-button content-row with-text small"
							size="small"
							type="success"
							@click="addFormItem(ioParametersItemsList, 'p_i-')"
						>
							<span class="capitalize" v-text="`${tt('Add')} ${tt('constants.Metric')}`"></span>
							<i class="icomoon icon-plus"></i>
						</el-button>
					</div>
				</div>
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

import { sensorClassesList as getSensorClassesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { buildProps, useItemForm } from '@/composables/mixins/useItemForm';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import IOParameterItem from './IOParameterItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'SettingsBannerV2SubtypeForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);
const itemFormRef = ref(null);
const refsMap = reactive({});
const ioParametersItemsList = ref([]);

const formData = ref({
	name: '',
	model_number: '',
	part_number: '',
	is_default: 0,
	parameters: [],
	sensor_class: null,
	is_fft_allowed: 0,
});

const rules = {
	name: required,
};

const sensorClassesList = computed(() => Object.freeze(getSensorClassesList()));
const subItemsSettings = computed(() => [{ ref: 'IOParameterItem', targetProp: 'parameters' }]);

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

const localSetupPage = (itemData) => {
	ioParametersItemsList.value = setupFormSubItemsList(itemData?.parameters || [], 'p_i');
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'BannerV2Subtypes',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	emit,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	prepareSubmitDataSettings: {
		skipValueValidationProps: ['sensor_class'],
	},
});

defineExpose({ validateForm });
</script>
