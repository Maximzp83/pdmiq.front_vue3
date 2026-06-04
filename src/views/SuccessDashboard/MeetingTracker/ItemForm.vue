<template>
	<div class="edit-form-container success-dashboard-form">
		<el-form
			ref="itemFormRef"
			class="item-edit-form bolded-labels"
			label-position="top"
			:model="formData"
			:rules="rules"
		>
			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('Meeting_Tracker') }}</div>
				</div>

				<div class="card-content">
					<div class="mrow flex wrap">
						<el-form-item :label="tt('Plant')" prop="plant_id" class="mcol-xs-12 mcol-sm-4">
							<CustomInput :model-value="plantItem?.name || '-'" disabled />
						</el-form-item>

						<el-form-item :label="tt('last')" prop="last_tracker_created_at" class="mcol-xs-12 mcol-sm-3">
							<Datepicker v-model="formData.last_tracker_created_at" />
						</el-form-item>

						<el-form-item :label="tt('current')" prop="current_created_at" class="mcol-xs-12 mcol-sm-3">
							<Datepicker v-model="formData.current_created_at" />
						</el-form-item>

						<el-form-item :label="tt('phrases.next_launch_date')" prop="next_launch_date" class="mcol-xs-12 mcol-sm-2">
							<Datepicker v-model="formData.next_launch_date" />
						</el-form-item>
					</div>
				</div>
			</div>

			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('phrases.Customer_feedback') }}</div>
				</div>
				<div class="card-content">
					<DynamicFormItem
						v-for="(item, index) in formData.customer_feedback"
						:key="`feedback-${item._id}`"
						v-model="formData.customer_feedback[index]"
						:sensorsList="sensorsList"
						@remove="removeFormItem('customer_feedback', index)"
					/>
					<el-button type="primary" class="item-action-button" @click="addFormItem('customer_feedback')">
						<span>{{ tt('Add') }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</div>

			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('phrases.current_activities') }}</div>
				</div>
				<div class="card-content">
					<NextActivityFormItem
						v-for="(item, index) in formData.current_activities"
						:key="`current-${item._id}`"
						v-model="formData.current_activities[index]"
						:sensorsList="sensorsList"
						@remove="removeFormItem('current_activities', index)"
					/>
					<el-button type="primary" class="item-action-button" @click="addFormItem('current_activities')">
						<span>{{ tt('Add') }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</div>

			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('phrases.next_activities') }}</div>
				</div>
				<div class="card-content">
					<NextActivityFormItem
						v-for="(item, index) in formData.next_activities"
						:key="`next-${item._id}`"
						v-model="formData.next_activities[index]"
						:sensorsList="sensorsList"
						@remove="removeFormItem('next_activities', index)"
					/>
					<el-button type="primary" class="item-action-button" @click="addFormItem('next_activities')">
						<span>{{ tt('Add') }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</div>

			<div class="card content-row">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('phrases.data_driven_recommended_actions') }}</div>
				</div>
				<div class="card-content">
					<NextActivityFormItem
						v-for="(item, index) in formData.recommended_actions"
						:key="`recommended-${item._id}`"
						v-model="formData.recommended_actions[index]"
						:sensorsList="sensorsList"
						@remove="removeFormItem('recommended_actions', index)"
					/>
					<el-button type="primary" class="item-action-button" @click="addFormItem('recommended_actions')">
						<span>{{ tt('Add') }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</div>

			<FormOperationsButtons @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { cleanDateString } from '@/helpers';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';

import Datepicker from '@/components/common/Datepicker.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import DynamicFormItem from './DynamicFormItem.vue';
import NextActivityFormItem from './NextActivityFormItem.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessMeetingTrackerItemForm' });

const props = defineProps(buildProps({
	plantItem: { type: Object, default: () => ({}) },
	sensorsLoading: Boolean,
	sensorsList: { type: Array, default: () => [] },
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const makeRow = () => ({
	_id: `${Date.now()}-${Math.random()}`,
	description: '',
	sensor_id: null,
	machine_id: null,
	users_name: '',
});
const initialFormData = {
	plant_id: null,
	last_tracker_created_at: '',
	current_created_at: '',
	next_launch_date: '',
	roi_count: 0,
	roi_cost: 0,
	customer_feedback: [],
	current_activities: [],
	next_activities: [],
	recommended_actions: [],
	progress_activities: [],
	expansion_plans: [],
	recurring_issues: [],
};
const formData = ref({ ...initialFormData });
const rules = computed(() => ({
	plant_id: required,
	current_created_at: required,
}));
const itemData = computed(() => props.itemData);

const localSetupPage = (item = {}) => {
	formData.value = {
		...formData.value,
		...item,
		plant_id: item.plant_id || props.plantItem?.id || null,
		customer_feedback: setupRows(item.customer_feedback),
		current_activities: setupRows(item.current_activities),
		next_activities: setupRows(item.next_activities),
		recommended_actions: setupRows(item.recommended_actions),
		progress_activities: setupRows(item.progress_activities),
		expansion_plans: setupRows(item.expansion_plans),
		recurring_issues: setupRows(item.recurring_issues),
	};
};
const setupRows = (rows = []) => rows.map((row) => ({ ...makeRow(), ...row }));
const addFormItem = (key) => {
	formData.value[key] = [...(formData.value[key] || []), makeRow()];
};
const removeFormItem = (key, index) => {
	formData.value[key] = formData.value[key].filter((_, idx) => idx !== index);
};
const cleanRows = (rows = []) =>
	rows.map(({ _id, ...row }) => {
		const next = { ...row };
		if (!next.users_name) delete next.users_name;
		if (!next.machine_id) delete next.machine_id;
		return next;
	});
const localPrepareSubmitData = (data) => ({
	...data,
	current_created_at: data.current_created_at ? cleanDateString(data.current_created_at) : '',
	last_tracker_created_at: data.last_tracker_created_at ? cleanDateString(data.last_tracker_created_at) : '',
	next_launch_date: data.next_launch_date ? cleanDateString(data.next_launch_date) : '',
	customer_feedback: cleanRows(data.customer_feedback),
	current_activities: cleanRows(data.current_activities),
	next_activities: cleanRows(data.next_activities),
	recommended_actions: cleanRows(data.recommended_actions),
	progress_activities: cleanRows(data.progress_activities),
	expansion_plans: cleanRows(data.expansion_plans),
	recurring_issues: cleanRows(data.recurring_issues),
});

const { validateForm, handleCancel } = useItemForm({
	entityKey: 'MeetingTrackers',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	localSetupPage,
	localPrepareSubmitData,
	emit,
});

defineExpose({ validateForm });
</script>
