<template>
	<div>
		<div class="section-row card-content">
			<div class="el-form-item">
				<div class="flex mrow">
					<div>
						<div>{{ tt('last') }}</div>
						<Datepicker v-model="formData.last_tracker_created_at" class="mini" :placeholder="tt('date')" />
					</div>

					<div>
						<div>{{ tt('current') }}</div>
						<Datepicker v-model="formData.current_created_at" class="mini" :placeholder="tt('date')" />
					</div>
				</div>
			</div>

			<div class="el-form-item upload-form-item">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					accept=".pdf"
					:buttonText="tt('phrases.upload_file')"
					buttonIcon="icomoon icon-clip"
					@onSelectFile="handleSelectFile"
				/>
			</div>
		</div>

		<div class="section-row dialog-footer text-center">
			<el-button class="capitalize" @click="emit('close')">{{ tt('Cancel') }}</el-button>
			<el-button
				type="primary"
				class="capitalize"
				:disabled="processing"
				:loading="processing"
				@click="handleSubmit"
			>
				{{ tt('Submit') }}
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useNotify } from '@/composables/useNotify';
import { useSuccessDashboard } from '@/composables/useSuccessDashboard';

import Datepicker from '@/components/common/Datepicker.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardAddPdfFileForm' });

const props = defineProps({
	plantId: Number,
	visible: Boolean,
});
const emit = defineEmits(['success', 'close']);

const { Notify } = useNotify();
const { saveMeetingTracker } = useSuccessDashboard();
const fileUploadBlockRef = ref(null);
const processing = ref(false);
const initialFormData = {
	plant_id: props.plantId || null,
	pdf_file: null,
	last_tracker_created_at: '',
	current_created_at: '',
};
const formData = ref({ ...initialFormData });

const handleSelectFile = ({ raw }) => {
	formData.value.pdf_file = raw;
};

const resetForm = () => {
	fileUploadBlockRef.value?.resetFilesList?.();
	processing.value = false;
	formData.value = { ...initialFormData, plant_id: null };
};

const handleSubmit = async () => {
	if (!formData.value.pdf_file) {
		Notify({
			type: 'warning',
			message: `${tt('file')} ${tt('phrases.should_be_selected')}`,
		});
		return;
	}

	const data = {
		...formData.value,
		plant_id: props.plantId,
		current_created_at: formData.value.current_created_at
			? cleanDateString(formData.value.current_created_at)
			: '',
		last_tracker_created_at: formData.value.last_tracker_created_at
			? cleanDateString(formData.value.last_tracker_created_at)
			: '',
	};

	processing.value = true;
	try {
		await saveMeetingTracker({ withFile: true, data });
		emit('success');
	} finally {
		processing.value = false;
	}
};

watch(
	() => props.visible,
	(visible) => {
		if (visible) {
			formData.value.plant_id = props.plantId || null;
		} else {
			resetForm();
		}
	},
);
</script>
