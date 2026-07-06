<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item required :label="`${tt('Machine')} ${tt('name')}`" prop="name" class="half-width">
				<CustomInput v-model="formData.name" :placeholder="`${tt('input')} ${tt('name')}`" />
			</el-form-item>

			<el-form-item :label="`${tt('Production_Line')} / ${tt('Utility')} ${tt('name')}`" prop="production_line_id" class="half-width">
				<CustomSelectV2
					v-model="formData.production_line_id"
					filterable
					:optionsLoading="productionLinesLoading"
					:optionsList="productionLinesList"
					:placeholder="tt('select')"
					:setupLabelMethod="getProdlineLabel"
					useHtml
				/>
			</el-form-item>

			<el-form-item :label="tt('Locations')" prop="location_ids" class="half-width">
				<CustomSelectV2
					v-model="formData.location_ids"
					filterable
					multiple
					:optionsLoading="locationsLoading"
					:optionsList="locationsList"
					:placeholder="`${tt('Select')} ${tt('locations')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Application')" prop="application_id" class="half-width">
				<div class="flex">
					<div class="relative mcol-xs-10 fluid span-block">
						<CustomSelectV2
							v-model="formData.application_id"
							filterable
							:optionsLoading="applicationsLoading"
							:optionsList="applicationsList"
							:placeholder="`${tt('Select')} ${tt('application')}`"
						/>
					</div>

					<el-button
						v-if="!fromAnotherInstance"
						:class="'create-button span-block'"
						size="small"
						type="danger"
						@click="createApplication"
					>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</el-form-item>

			<el-form-item :label="`${tt('Brand')} ${tt('name')}`" prop="brand_name" class="half-width">
				<CustomInput v-model="formData.brand_name" :placeholder="`${tt('input')} ${tt('name')}`" />
			</el-form-item>

			<el-form-item :label="`${tt('Part')} ${tt('Number')}`" prop="part_number" class="half-width">
				<CustomInput v-model="formData.part_number" :placeholder="tt('part_number')" />
			</el-form-item>

			<el-form-item :label="`${tt('Downtime')} ${tt('Cost')}`" prop="downtime_cost" class="half-width">
				<el-input v-model.number="formData.downtime_cost" />
			</el-form-item>

			<el-form-item :label="tt('phrases.installed_at')" prop="installed_at" class="half-width">
				<Datepicker v-model="formData.installed_at" :placeholder="`${tt('Select')} ${tt('date')}`" />
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

			<el-form-item :label="`${tt('Machine')} ${tt('image')}`" prop="pictures" class="upload-form-item">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					multiple
					rotate
					:pictures="itemPictures"
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
					:optionsLoading="machinesLoading"
					:optionsList="filteredMachinesList"
					:placeholder="`${tt('select')} ${tt('machine')} ${tt('phrases.whose_order_you_want')}`"
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
import { productionLineTypesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { cleanDateString, findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useMultiform } from '@/composables/mixins/useMultiform';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useMachines } from '@/composables/useMachines';

import Datepicker from '@/components/common/Datepicker.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import CharacterItem from './CharacterItem.vue';
import AttachmentItem from './AttachmentItem.vue';

const { tt } = Lang;

defineOptions({ name: 'MachineForm' });

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { reorderMachine } = useMachines();

const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const applicationsLoading = ref(false);
const applicationsList = shallowRef([]);
const productionLinesLoading = ref(false);
const productionLinesList = shallowRef([]);
const locationsList = shallowRef([]);
const locationsLoading = ref(false);
const machinesList = shallowRef([]);
const machinesLoading = ref(false);
const librariesItemsList = ref([]);
const charactersItemsList = ref([]);
const desiredId = ref(null);
const refsMap = ref({
	CharacterItem: [],
	AttachmentItem: [],
	FileUploadBlock: [fileUploadBlockRef],
});

const initialFormData = {
	name: '',
	application_id: null,
	production_line_id: null,
	location_ids: [],
	pictures: [],
	plant_id: null,
	brand_name: '',
	part_number: '',
	installed_at: '',
	characters: [],
	downtime_cost: 0,
	libraries: [],
	linespeed_sensor_id: null,
};
const formData = ref({ ...initialFormData });

const itemData = computed(() => props.itemData);
const showPlant = computed(() => globalStore.navbarSettings?.showPlantName || null);
const instancesItemsData = computed(() => props.instancesItemsData || null);
const itemPictures = computed(() => props.itemData?.pictures || []);
const filteredMachinesList = computed(() =>
	props.itemData?.id
		? machinesList.value.filter((item) => item.id !== props.itemData.id)
		: [],
);
const rules = {
	name: required,
	application_id: required,
};
const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'CharacterItem', targetProp: 'characters' },
		{ ref: 'AttachmentItem', targetProp: 'libraries', removeFilePropIfNull: true },
		{ ref: 'FileUploadBlock', targetProp: 'pictures' },
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
	fetch_applications: createGetRequest(ENTITIES.Applications.apiBase),
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_locations: createGetRequest(ENTITIES.Locations.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
};
const currentPlantId = () => globalFilters.value?.plantId || showPlant.value?.id || formData.value.plant_id;
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			actionName: 'fetch_production_lines',
			payload: { params: { max: -1, plantId: currentPlantId } },
			localProp: productionLinesList,
			localLoadProp: productionLinesLoading,
		},
		{
			actionName: 'fetch_locations',
			bindTo: [
				{
					getValue: () => formData.value.production_line_id,
					param: 'productionLineId',
					onTrigger: () => {
						if (!props.itemData?.id) formData.value.location_ids = [];
					},
				},
				{
					getValue: currentPlantId,
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
			actionName: 'fetch_applications',
			payload: { params: { max: -1, plantId: currentPlantId } },
			localProp: applicationsList,
			localLoadProp: applicationsLoading,
		},
		{
			actionName: 'fetch_machines',
			payload: { params: { max: -1, plantId: currentPlantId } },
			localProp: machinesList,
			localLoadProp: machinesLoading,
		},
	]),
);

const getProdlineLabel = (option) => {
	const type = findItemBy('id', option.type, productionLineTypesList);
	return Object.freeze({
		label: option.name,
		html: `<div class="flex"><span>${option.name}</span><span class="ml-auto gray-color">${type?.name || ''}</span></div>`,
	});
};
const localSetupPage = (item) => {
	if (item) {
		charactersItemsList.value = setupFormSubItemsList(item.characters, 'c_i');
		librariesItemsList.value = setupFormSubItemsList(item.libraries, 'a_i');
		return;
	}

	formData.value.plant_id = currentPlantId() || null;
	setupByParentInstance(instancesItemsData.value, 'productionLine', 'production_line_id');
	charactersItemsList.value = [];
	librariesItemsList.value = [];
};
const localPrepareSubmitData = (data) => {
	if (!data.plant_id) data.plant_id = currentPlantId();
	if (data.installed_at) {
		data.installed_at = cleanDateString(data.installed_at, { withoutTime: 1 });
	}
	return data;
};
const createApplication = () => {
	globalStore.show_edit_modal({
		editModalProp: 'editModalSecond',
		show: true,
		instanceName: 'Applications',
		instanceData: { plant_id: globalFilters.value?.plantId },
		settings: {
			fromAnotherInstance: true,
			disablePlant: true,
		},
		title: 'Create Application',
		successSubmitCallback: applicationCreated,
	});
};
const applicationCreated = ({ data } = {}) => {
	if (data?.data?.id) {
		formData.value.application_id = data.data.id;
	}
	globalStore.show_edit_modal({ show: false, editModalProp: 'editModalSecond' });
};
const successSubmitCallback = () => {
	if (props.itemData?.id && desiredId.value) {
		reorderMachine({
			notNotify: true,
			data: {
				currentId: +props.itemData.id,
				desiredId: +desiredId.value,
				className: props.itemData.className,
			},
		});
	}
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Machines',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	localPrepareSubmitData,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	uploadSettings: Object.freeze([
		{ fileProp: 'pictures', multiple: true },
		{ fileProp: 'libraries', multiple: true },
	]),
	successSubmitCallback,
	emit,
});

const { setupByParentInstance } = useMultiform({
	emit,
	formData,
	instancesItemsData,
	multiFormFilters: computed(() => props.multiFormFilters || null),
});

watch(
	() => formData.value.production_line_id,
	() => {
		if (!props.itemData?.id) formData.value.location_ids = [];
	},
);

useRequestsList({ methodsMap, requestsToDoList });

defineExpose({ validateForm });
</script>
