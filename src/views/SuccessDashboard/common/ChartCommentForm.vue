<template>
	<el-form ref="formRef" :model="formData" label-position="top">
		<el-form-item :label="tt('Comment')" prop="comment">
			<el-input v-model="formData.comment" type="textarea" :rows="4" />
		</el-form-item>

		<FormOperationsButtons @onCancel="emit('onCancel')" @onSave="validateForm" />
	</el-form>
</template>

<script setup>
import { ref } from 'vue';
import { Lang } from '@/localization';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardChartCommentForm' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['submit', 'onCancel']);

const formRef = ref(null);
const formData = ref({ comment: props.itemData?.comment || '' });
const validateForm = () => emit('submit', { ...formData.value });

defineExpose({ validateForm });
</script>
