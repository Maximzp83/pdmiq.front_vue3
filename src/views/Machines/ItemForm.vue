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
					@change="formData.location_ids = []"
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
							:ref="(el) => setCharacterRef(el, idx)"
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
							icon="icomoon icon-cross"
							@click="addFormItem(charactersItemsList, 'c_i-')"
						/>
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
							:ref="(el) => setAttachmentRef(el, idx)"
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
							icon="icomoon icon-cross"
							@click="addFormItem(librariesItemsList, 'a_i-')"
						/>
					</div>
				</div>
			</el-form-item>

			<el-form-item v-if="itemData && itemData.id" :label="tt('Order')">
				<CustomSelectV2
					v-model="desiredId"
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="filteredMachinesList"
					:placeholder="`${tt('select')} ${tt('machine')} ${tt('phrases.whose_order_you_want')}`"
				/>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="$emit('onCancel')"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { findItemBy, cleanDateString } from '@/helpers';
import { required } from '@/constants/validation';
import { productionLineTypesList } from '@/constants/global';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import Datepicker from '@/components/common/Datepicker.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import CharacterItem from './CharacterItem.vue';
import AttachmentItem from './AttachmentItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'MachineForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
	itemsName: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'onCancel']);
const globalStore = useGlobalStore();

const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const desiredId = ref(null);
const isMobile = ref(false);
const applicationsLoading = ref(false);
const applicationsList = ref([]);
const productionLinesLoading = ref(false);
const productionLinesList = ref([]);
const locationsList = ref([]);
const locationsLoading = ref(false);
const machinesList = ref([]);
const machinesLoading = ref(false);
const librariesItemsList = ref([]);
const charactersItemsList = ref([]);
const characterRefs = ref([]);
const attachmentRefs = ref([]);

const formData = reactive({
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
});

const rules = {
	name: required,
	application_id: required,
};

const globalFilters = computed(() => globalStore.globalFilters || {});
const itemPictures = computed(() => props.itemData?.pictures || []);
const filteredMachinesList = computed(() => {
	if (props.itemData?.id && machinesList.value.length) {
		return machinesList.value.filter((item) => item.id !== props.itemData.id);
	}
	return machinesList.value;
});

const { addFormItem, removeFormItem, setupFormSubItemsList } = useSubItemsList();

const setCharacterRef = (el, idx) => {
	if (el) characterRefs.value[idx] = el;
};
const setAttachmentRef = (el, idx) => {
	if (el) attachmentRefs.value[idx] = el;
};
const getProdlineLabel = (option) => {
	const type = findItemBy('id', option.type, productionLineTypesList);
	return Object.freeze({
		label: option.name,
		html: `<div class="flex"><span>${option.name}</span><span class="ml-auto gray-color">${type?.name || ''}</span></div>`,
	});
};
const fetchList = ({ url, params, listRef, loadingRef }) => {
	loadingRef.value = true;
	return api_request.get(url, {
		params: { max: -1, ...(params || {}) },
		notNotify: true,
	})
		.then(({ value }) => {
			listRef.value = value || [];
		})
		.finally(() => {
			loadingRef.value = false;
		});
};
const fetchInitialLists = () => {
	const plantId = globalFilters.value.plantId || props.itemData?.plant_id;
	fetchList({ url: '/production-lines', params: { plantId }, listRef: productionLinesList, loadingRef: productionLinesLoading });
	fetchList({ url: '/applications', params: { plantId }, listRef: applicationsList, loadingRef: applicationsLoading });
	fetchList({ url: '/machines', params: { plantId }, listRef: machinesList, loadingRef: machinesLoading });
	if (formData.production_line_id || plantId) {
		fetchList({
			url: '/plants/locations',
			params: { productionLineId: formData.production_line_id, plantId },
			listRef: locationsList,
			loadingRef: locationsLoading,
		});
	}
};
const setupPage = (item = {}) => {
	Object.keys(formData).forEach((key) => {
		if (item[key] !== undefined) formData[key] = item[key];
	});
	charactersItemsList.value = setupFormSubItemsList(item.characters || [], 'c_i');
	librariesItemsList.value = setupFormSubItemsList(item.libraries || [], 'a_i');
};
const collectSubItems = () => {
	formData.characters = characterRefs.value.map((item) => item?.collectData?.()).filter(Boolean);
	formData.libraries = attachmentRefs.value.map((item) => item?.collectData?.()).filter(Boolean);
};
const prepareSubmitData = () => {
	collectSubItems();
	const data = { ...formData };
	if (!data.plant_id) data.plant_id = globalFilters.value.plantId || props.itemData?.plant_id;
	if (data.installed_at) {
		data.installed_at = cleanDateString(data.installed_at, { withoutTime: 1 });
	}
	if (props.itemData?.id) data.id = props.itemData.id;
	return data;
};
const validateForm = () => {
	itemFormRef.value?.validate((valid) => {
		if (valid) {
			emit('submit', {
				formData: prepareSubmitData(),
				desiredId: desiredId.value,
			});
		}
	});
};

watch(
	() => props.itemData,
	(item) => setupPage(item || {}),
	{ immediate: true },
);

watch(
	() => formData.production_line_id,
	() => {
		const plantId = globalFilters.value.plantId || props.itemData?.plant_id;
		formData.location_ids = [];
		fetchList({
			url: '/plants/locations',
			params: { productionLineId: formData.production_line_id, plantId },
			listRef: locationsList,
			loadingRef: locationsLoading,
		});
	},
);

onMounted(fetchInitialLists);

defineExpose({
	validateForm,
	formData,
});
</script>
