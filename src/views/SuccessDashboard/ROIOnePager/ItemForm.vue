<template>
	<div class="edit-form-container success-dashboard-form normal-font-weight">
		<el-form
			ref="itemFormRef"
			class="item-edit-form bolded-labels"
			label-position="top"
			:model="formData"
			:rules="rules"
		>
			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('ROI_One_Pager') }}</div>
				</div>

				<div class="card-content">
					<div class="mrow flex wrap">
						<el-form-item :label="tt('Name')" prop="name" required class="mcol-xs-12 mcol-sm-6">
							<CustomInput v-model="formData.name" />
						</el-form-item>

						<el-form-item :label="tt('Asset')" prop="asset_id" required class="mcol-xs-12 mcol-sm-6">
							<FetchByQuerySelect
								v-model="formData.asset_id"
								clearable
								enableLoadmore
								:settings="assetQueryOptions"
								:placeholder="`${tt('Select')} ${tt('asset')}`"
								@change="handleAssetChange"
							/>
						</el-form-item>

						<el-form-item :label="tt('Sensor')" prop="sensor_id" class="mcol-xs-12 mcol-sm-6">
							<FetchByQuerySelect
								v-model="formData.sensor_id"
								clearable
								enableLoadmore
								:settings="sensorQueryOptions"
								:placeholder="`${tt('Select')} ${tt('Sensor')}`"
							/>
						</el-form-item>

						<el-form-item :label="tt('Started_at')" prop="started_at" class="mcol-xs-12 mcol-sm-3">
							<Datepicker v-model="formData.started_at" />
						</el-form-item>

						<el-form-item :label="tt('Finished_at')" prop="finished_at" class="mcol-xs-12 mcol-sm-3">
							<Datepicker v-model="formData.finished_at" />
						</el-form-item>

						<el-form-item :label="tt('phrases.roi_ca_$')" prop="final_roi" required class="mcol-xs-12 mcol-sm-3">
							<CustomInput v-model.number="formData.final_roi" placeholder="$" />
						</el-form-item>

						<el-form-item :label="tt('phrases.roi_cost_avoidance')" prop="cost_avoidance" class="mcol-xs-12 mcol-sm-3">
							<CustomInput v-model.number="formData.cost_avoidance" placeholder="$" />
						</el-form-item>
					</div>
				</div>
			</div>

			<div class="card content-row roi-green-bar">
				<div class="card-content flex align-center">
					<div class="page-title semi-bold">{{ tt('phrases.roi_value_creation_summary') }}</div>
					<div class="ml-auto page-title semi-bold">$ {{ formData.final_roi || 0 }}</div>
				</div>
			</div>

			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('Description') }}</div>
				</div>
				<div class="card-content">
					<el-form-item prop="description">
						<el-input v-model="formData.description" type="textarea" :rows="6" />
					</el-form-item>
				</div>
			</div>

			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('Images') }}</div>
				</div>
				<div class="card-content">
					<FileUploadBlock
						ref="picturesUploadRef"
						multiple
						keepFilePath
						showImageClickOverlay
						showDeleteButton
						:pictures="picturesList"
					/>
				</div>
			</div>

			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('file') }}</div>
				</div>
				<div class="card-content">
					<FileUploadBlock
						ref="fileUploadRef"
						accept=".pdf"
						keepFilePath
						showLinkToFileButton
						showDeleteButton
						:pictures="fileList"
						:buttonText="tt('phrases.upload_file')"
						buttonIcon="icomoon icon-clip"
					/>
				</div>
			</div>

			<ROIsHistory v-if="historyList.length" :itemsList="historyList" />

			<FormOperationsButtons @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';
import { api_request } from '@/api/request_provider';
import { cleanDateString } from '@/helpers';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useNotify } from '@/composables/useNotify';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';

import Datepicker from '@/components/common/Datepicker.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import ROIsHistory from '../common/ROIsHistory.vue';

const { tt } = Lang;

defineOptions({ name: 'ROIOnePagerItemForm' });

const props = defineProps(buildProps({
	plantItem: { type: Object, default: () => ({}) },
	sensorsList: { type: Array, default: () => [] },
	sensorsLoading: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const { Notify } = useNotify();
const itemFormRef = ref(null);
const picturesUploadRef = ref(null);
const fileUploadRef = ref(null);
const selectedAsset = shallowRef(null);
const historyList = shallowRef([]);
const initialFormData = {
	plant_id: null,
	name: '',
	asset_id: null,
	sensor_id: null,
	started_at: '',
	finished_at: '',
	final_roi: '',
	cost_avoidance: '',
	description: '',
	pictures: [],
	file: null,
};
const formData = ref({ ...initialFormData });
const rules = computed(() => ({
	name: required,
	asset_id: required,
	final_roi: required,
}));
const itemData = computed(() => props.itemData);
const picturesList = computed(() => props.itemData?.pictures || []);
const fileList = computed(() => (props.itemData?.full_file_name ? [props.itemData] : []));
const assetQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: (payload) => api_request.get('/assets', payload),
		fetchByIdAction: ({ itemId }) => api_request.get(`/assets/${itemId}`, { itemId, notNotify: true }),
		params: { plantId: props.plantItem?.id },
	}),
);
const sensorQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: (payload) => api_request.get('/sensors', payload),
		fetchByIdAction: ({ itemId }) => api_request.get(`/sensors/${itemId}`, { itemId, notNotify: true }),
		params: { plantId: props.plantItem?.id, assetId: formData.value.asset_id },
	}),
);

const handleAssetChange = async (assetId) => {
	selectedAsset.value = null;
	if (!assetId) return;
	const { value } = await api_request.get(`/assets/${assetId}`, { itemId: assetId, notNotify: true });
	selectedAsset.value = value;
};
const localSetupPage = (item = {}) => {
	formData.value = {
		...formData.value,
		...item,
		plant_id: item.plant_id || props.plantItem?.id || null,
		asset_id: item.asset_id || item.asset?.id || null,
		sensor_id: item.sensor_id || item.sensor?.id || null,
	};
	historyList.value = item.histories || item.history || [];
	if (formData.value.asset_id) handleAssetChange(formData.value.asset_id);
};
const localPrepareSubmitData = (data) => {
	const finalRoi = Number(data.final_roi);
	if (Number.isNaN(finalRoi)) {
		Notify({ type: 'warning', message: tt('phrases.roi_final_should_be_a_number') });
		return null;
	}

	const pictures = picturesUploadRef.value?.getFormData?.() || [];
	const files = fileUploadRef.value?.getFormData?.() || [];
	return {
		...data,
		final_roi: finalRoi,
		started_at: data.started_at ? cleanDateString(data.started_at) : '',
		finished_at: data.finished_at ? cleanDateString(data.finished_at) : '',
		pictures,
		file: files[0]?.file || files[0]?.raw || files[0]?.formData?.raw || null,
	};
};

const { validateForm, handleCancel } = useItemForm({
	entityKey: 'RoiOnePagers',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	localSetupPage,
	localPrepareSubmitData,
	uploadSettings: Object.freeze([{ fileProp: 'pictures', multiple: true }, { fileProp: 'file' }]),
	emit,
});

defineExpose({ validateForm });
</script>
