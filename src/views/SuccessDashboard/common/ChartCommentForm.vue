<template>
	<div>
		<el-form ref="itemFormRef" :model="formData" :rules="{}">
			<el-form-item prop="description" class="mcol-xs-auto text-form-item">
				<CustomInput
					v-model="formData.description"
					:placeholder="tt('comment')"
					type="textarea"
				/>
			</el-form-item>
		</el-form>

		<div class="flex justify-center">
			<el-button
				type="primary"
				native-type="button"
				class="item-action-button"
				@click="handleSaveComment"
			>
				<span class="uppercase">{{ tt('SAVE') }}</span>
			</el-button>

			<el-button
				type="primary"
				native-type="button"
				class="item-action-button inverted"
				@click="handleCancelComment"
			>
				<span class="uppercase">{{ tt('Cancel') }}</span>
			</el-button>

			<el-button
				v-if="itemData.description"
				type="primary"
				native-type="button"
				class="item-action-button inverted"
				@click="handleDeleteComment"
			>
				<span class="uppercase">{{ tt('Delete') }}</span>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { updateFormData } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardChartCommentForm' });

const props = defineProps({
	ChartInstance: { type: Object, required: true },
});

const itemFormRef = ref(null);
const itemData = computed(() => props.ChartInstance.selectionData || {});
const formData = ref(updateFormData(itemData.value, {
	date_start: '',
	date_finish: '',
	description: '',
}));

const handleSaveComment = () => {
	props.ChartInstance.handleSaveComment({
		formData: formData.value,
		isNew: !itemData.value.description,
	});
};
const handleCancelComment = () => {
	props.ChartInstance.handleCancelComment();
};
const handleDeleteComment = () => {
	props.ChartInstance.handleDeleteComment({
		formData: formData.value,
	});
};
</script>
