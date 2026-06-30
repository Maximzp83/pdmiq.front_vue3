<template>
	<el-form
		ref="itemFormRef"
		class="special-decorated-form-item"
		:model="formData"
		:rules="{}"
	>
		<div class="form-items">
			<el-form-item prop="description" class="mcol-xs-auto text-form-item">
				<CustomInput
					v-model="formData.description"
					:placeholder="tt('notes')"
					type="textarea"
					elastic
				/>
			</el-form-item>

			<div v-if="!showJustInfo" class="el-form-item flex mrow wrap check-boxes">
				<el-form-item prop="is_add_to_recommended_actions" class="mcol-xs-12 mcol-sm-4">
					<el-checkbox
						v-model="formData.is_add_to_recommended_actions"
						:true-value="1"
						:false-value="0"
					>
						{{ tt('phrases.Add_to_Recommended_Actions') }}
					</el-checkbox>
				</el-form-item>

				<el-form-item prop="is_add_to_next_activities" class="mcol-xs-12 mcol-sm-5">
					<el-checkbox
						v-model="formData.is_add_to_next_activities"
						:true-value="1"
						:false-value="0"
					>
						{{ tt('phrases.add_to_activities_planned_for_next_week_period') }}
					</el-checkbox>
				</el-form-item>

				<el-form-item prop="is_add_to_current_activities" class="mcol-xs-12 mcol-sm-3">
					<el-checkbox
						v-model="formData.is_add_to_current_activities"
						:true-value="1"
						:false-value="0"
					>
						{{ tt('phrases.Add_to_Completed_this_week') }}
					</el-checkbox>
				</el-form-item>
			</div>
		</div>

		<div v-if="!showJustInfo" class="button-container">
			<el-button
				v-if="isLast"
				class="action-button create-button inverted"
				size="small"
				type="primary"
				@click="emit('onCreate')"
			>
				<i class="icomoon icon-plus"></i>
			</el-button>

			<el-button
				v-else
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="emit('onRemove', itemId)"
			>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { ref } from 'vue';
import { updateFormData } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardNotesItem' });

const props = defineProps({
	itemIndex: Number,
	itemData: { type: Object, required: true },
	isLast: Boolean,
	showJustInfo: Boolean,
});
const emit = defineEmits(['onCreate', 'onRemove']);

const itemFormRef = ref(null);
const itemId = ref(null);
const formData = ref({
	id: null,
	description: '',
	is_add_to_recommended_actions: false,
	is_add_to_next_activities: false,
	is_add_to_current_activities: false,
	is_add_to_recommended_actions_initial: false,
	is_add_to_next_activities_initial: false,
	is_add_to_current_activities_initial: false,
});

const setupPage = (item) => {
	itemId.value = item.id;
	formData.value = updateFormData(item, formData.value);
	formData.value.is_add_to_recommended_actions_initial = !item.is_add_to_recommended_actions;
	formData.value.is_add_to_next_activities_initial = !item.is_add_to_next_activities;
	formData.value.is_add_to_current_activities_initial = !item.is_add_to_current_activities;
};
const getFormData = () => {
	const data = { ...formData.value };
	delete data.id;
	return data;
};

setupPage(props.itemData);

defineExpose({ getFormData });
</script>
