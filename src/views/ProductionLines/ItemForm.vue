<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="name" required>
				<CustomInput v-model="formData.name" :placeholder="`${tt('input')} ${tt('name')}`" />
			</el-form-item>

			<el-form-item :label="`${tt('Downtime')} ${tt('Cost')}`" prop="downtime_cost">
				<el-input v-model.number="formData.downtime_cost" />
			</el-form-item>

			<el-form-item :label="tt('Locations')" prop="location_ids">
				<CustomSelectV2
					v-model="formData.location_ids"
					filterable
					multiple
					className="multiple-select"
					:optionsLoading="locationsLoading"
					:optionsList="locationsList"
					:placeholder="`${tt('Select')} ${tt('locations')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Custom')} ${tt('Fields')}`" prop="characters">
				<div class="options-container">
					<div v-if="charactersItemsList.length" class="content-row">
						<CharacterItem
							v-for="(item, idx) in charactersItemsList"
							:key="`character_item-${item.id}`"
							:ref="(el) => setSubItemRef('CharacterItem', el, idx)"
							:item-data="item"
							:item-index="idx"
							@onRemove="(id) => removeFormItem(id, charactersItemsList)"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="small"
							type="success"
							@click="addFormItem(charactersItemsList, 'c_i-')"
						>
							<i class="icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>

			<el-form-item :label="tt('image')" prop="file_name" class="upload-form-item">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					rotate
					deleteFileId
					showDeleteButton
					:pictures="itemPictures"
				/>
			</el-form-item>

			<el-form-item prop="rpm_source_type" class="half-width" label="RPM">
				<CustomSelectV2
					v-model="formData.rpm_source_type"
					:optionsList="rpmSourcesTypesListOptions"
					:placeholder="`${tt('select')} RPM ${tt('source')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.rpm_source_type === RPM_SOURCES_TYPES.MANUAL"
				:label="`${tt('constants.Manual')} RPM`"
				class="mcol-xs-12 mcol-sm-8"
				prop="rpm_value"
			>
				<el-input v-model.number="formData.rpm_value" />
			</el-form-item>

			<el-form-item
				v-else-if="formData.rpm_source_type === RPM_SOURCES_TYPES.EXTERNAL_INPUT"
				prop="rpm_node_id"
				class="half-width"
				:label="tt('constants.external_input_rpm')"
			>
				<CustomSelectV2
					v-model="formData.rpm_node_id"
					:optionsLoading="bannerV2GenericParametersLoading"
					:optionsList="bannerV2GenericParametersList"
					:placeholder="`${tt('select')} ${tt('exteranal')}`"
					:setupLabelSettings="{ accessors: ['sensor.location_in_equipment'] }"
					valueKey="sensor_id"
				/>
			</el-form-item>

			<el-form-item :label="tt('phrases.silence_mode')" prop="is_silence_mode">
				<el-switch
					v-model="formData.is_silence_mode"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.is_silence_mode"
				:label="tt('phrases.silence_mode_until')"
				prop="silence_mode_until"
			>
				<Datepicker
					v-model="formData.silence_mode_until"
					:placeholder="`${tt('Select')} ${tt('date')}`"
					:pickerOptions="pickerOptions"
				/>
			</el-form-item>

			<el-form-item :label="tt('Attachments')" prop="libraries">
				<div class="options-container">
					<div v-if="librariesItemsList.length" class="content-row">
						<AttachmentItem
							v-for="(item, idx) in librariesItemsList"
							:key="`attach_item-${item.id}`"
							:ref="(el) => setSubItemRef('AttachmentItem', el, idx)"
							:item-data="item"
							:item-index="idx"
							@onRemove="(id) => removeFormItem(id, librariesItemsList)"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="small"
							type="success"
							@click="addFormItem(librariesItemsList, 'a_i-')"
						>
							<i class="icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>

			<el-form-item v-if="itemData?.id" :label="tt('Order')">
				<CustomSelectV2
					v-model="desiredId"
					filterable
					:optionsLoading="productionLinesLoading"
					:optionsList="filteredProductionLinesList"
					:placeholder="`${tt('select')} ${tt('production_line')} ${tt('phrases.whose_order_you_want')}`"
				/>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { PRODUCTION_LINES_TYPES, rpmSourcesTypesList, RPM_SOURCES_TYPES } from '@/constants/global';
import { required } from '@/constants/validation';
import { cleanDateString, findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useProductionLines } from '@/composables/useProductionLines';

import Datepicker from '@/components/common/Datepicker.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import AttachmentItem from './AttachmentItem.vue';
import CharacterItem from './CharacterItem.vue';

const { tt } = Lang;

defineOptions({ name: 'ProductionLinesItemForm' });

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { reorderProductionLine, fetchProductionLineRpmNodes } = useProductionLines();

const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const locationsList = shallowRef([]);
const locationsLoading = ref(false);
const productionLinesList = shallowRef([]);
const productionLinesLoading = ref(false);
const librariesItemsList = ref([]);
const charactersItemsList = ref([]);
const bannerV2GenericParametersList = shallowRef([]);
const bannerV2GenericParametersLoading = ref(false);
const desiredId = ref(null);
const refsMap = ref({
	CharacterItem: [],
	AttachmentItem: [],
	FileUploadBlock: [fileUploadBlockRef],
});

const initialFormData = {
	name: '',
	type: null,
	plant_id: null,
	location_ids: [],
	file: null,
	img_rotate: 0,
	characters: [],
	downtime_cost: 0,
	libraries: [],
	rpm_source_type: null,
	rpm_value: null,
	rpm_node_id: null,
	rpm_node_parameter: null,
	is_silence_mode: 0,
	silence_mode_until: '',
};
const formData = ref({ ...initialFormData });

const newItemType = computed(() =>
	props.editModal?.instanceName === 'Utilities'
		? PRODUCTION_LINES_TYPES.UTILITY
		: PRODUCTION_LINES_TYPES.PRODUCTION_LINE,
);
const itemData = computed(() => props.itemData);
const showPlant = computed(() => globalStore.navbarSettings?.showPlantName || null);
const rpmSourcesTypesListOptions = computed(() => Object.freeze(rpmSourcesTypesList()));
const itemPictures = computed(() =>
	props.itemData?.full_file_name ? [{ full_file_name: props.itemData.full_file_name }] : [],
);
const filteredProductionLinesList = computed(() =>
	props.itemData?.id
		? productionLinesList.value.filter((item) => item.id !== props.itemData.id)
		: [],
);
const rules = {
	name: required,
	plant_id: required,
};
const pickerOptions = Object.freeze({
	disabledDate(date) {
		const start = new Date();
		const today = start.getTime() - 3600000 * 24;
		const dateMs = date.getTime();

		return dateMs < today;
	},
});
const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'CharacterItem', targetProp: 'characters' },
		{ ref: 'AttachmentItem', targetProp: 'libraries', removeFilePropIfNull: true },
		{
			ref: 'FileUploadBlock',
			setIfEmpty: { prop: 'delete_file', val: 1 },
			cleanIfEmpty: { prop: 'file', val: null },
		},
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
} = useSubItemsList({ formData, refsMap });

const methodsMap = {
	fetch_locations: createGetRequest(ENTITIES.Locations.apiBase),
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_production_line_rpm_nodes: (payload = {}) => fetchProductionLineRpmNodes(payload.params || {}),
};
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_locations,
			bindTo: [
				{
					getValue: () => formData.value.plant_id,
					param: 'plantId',
					onTrigger: () => {
						if (!props.itemData?.id) formData.value.location_ids = [];
					},
				},
			],
			localProp: locationsList,
			localLoadProp: locationsLoading,
		},
		{
			action: methodsMap.fetch_production_lines,
			payload: {
				params: {
					max: -1,
					plantId: () => showPlant.value?.id || globalFilters.value?.plantId,
				},
			},
			localProp: productionLinesList,
			localLoadProp: productionLinesLoading,
		},
		{
			action: methodsMap.fetch_production_line_rpm_nodes,
			localProp: bannerV2GenericParametersList,
			localLoadProp: bannerV2GenericParametersLoading,
			payload: { params: { max: -1 } },
		},
	]),
);

const selectedExternalRpmItem = computed(() => {
	if (bannerV2GenericParametersList.value.length && formData.value.rpm_node_id) {
		return findItemBy('sensor_id', formData.value.rpm_node_id, bannerV2GenericParametersList.value);
	}
	return null;
});

const localSetupPage = (item) => {
	if (item) {
		charactersItemsList.value = setupFormSubItemsList(item.characters, 'c_i');
		librariesItemsList.value = setupFormSubItemsList(item.libraries, 'a_i');
		return;
	}

	formData.value.plant_id = showPlant.value?.id || globalFilters.value?.plantId || null;
	formData.value.type = newItemType.value;
	charactersItemsList.value = [];
	librariesItemsList.value = [];
};
const successSubmitCallback = () => {
	if (props.itemData?.id && desiredId.value) {
		reorderProductionLine({
			notNotify: true,
			data: {
				currentId: +props.itemData.id,
				desiredId: +desiredId.value,
				className: props.itemData.className,
			},
		});
	}
};
const localPrepareSubmitData = (data) => {
	if (!data.is_silence_mode) {
		data.silence_mode_until = null;
	}
	if (data.silence_mode_until) {
		data.silence_mode_until = cleanDateString(data.silence_mode_until, { withoutTime: 1 });
	}

	return data;
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'ProductionLines',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	new_item_type: newItemType.value,
	localSetupPage,
	localPrepareSubmitData,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	uploadSettings: Object.freeze([
		{ fileProp: 'file' },
		{ fileProp: 'libraries', multiple: true },
	]),
	successSubmitCallback,
	emit,
});

watch(selectedExternalRpmItem, (item) => {
	formData.value.rpm_node_parameter = item ? item.node_parameter : null;
});

useRequestsList({ methodsMap, requestsToDoList });

defineExpose({ validateForm });
</script>
