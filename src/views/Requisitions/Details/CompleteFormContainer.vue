<template>
	<div class="edit-form-container maintenance-form work-order-details-item card content-row">
		<div class="card-header filled_2 flex align-center">
			<div class="step-number bold span-block">
				<span>{{ progress }}</span>
			</div>

			<div class="span-block semi-bold uppercase">{{ title }}</div>

			<el-button
				v-if="orderStatus.isApproved && (isTechnician || isFabManager)"
				type="primary"
				class="ml-auto item-action-button"
				native-type="button"
				@click="$emit('event', 'handleTakeInWork')"
			>
				{{ tt('phrases.Start_Work_Order') }}
			</el-button>
		</div>

		<div class="card-content">
			<div
				v-if="orderStatus.isApproved || orderStatus.isInWork || (orderStatus.isCompleted && isFabManager)"
				class="mrow flex wrap big-padding mcol-xs-12"
			>
				<div
					v-for="item in filteredTechnicalProcesses"
					:key="`process-${item.id}`"
					class="mcol-xs-12 mcol-sm-6"
				>
					<CompleteForm
						:itemData="item"
						:orderData="itemData"
						:isFabManager="isFabManager"
						:orderStatus="orderStatus"
						@event="(name, data) => $emit('event', name, data)"
					/>
				</div>
			</div>

			<div
				v-else-if="orderStatus.isCompleted"
				class="mrow flex mcol-xs-12 big-padding wrap"
			>
				<div
					v-for="item in filteredTechnicalProcesses"
					:key="`technician-${item.id}`"
					class="mcol-xs-12 mcol-sm-6"
				>
					<DetailsItem
						:title="`Techinician: ${item.technician.full_name}`"
						:orderData="item"
						:settings="settingsStep4"
						@event="(name, data) => $emit('event', name, data)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { convertMsToHours, formatTime } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';

import CompleteForm from './CompleteForm.vue';
import DetailsItem from './DetailsItem.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionCompleteFormContainer' });

const props = defineProps({
	progress: Number,
	title: { type: String, default: '' },
	itemData: { type: Object, default: () => ({}) },
	orderStatus: { type: Object, default: () => ({}) },
	isFabManager: Boolean,
	technicalProcesses: { type: Array, default: () => [] },
});
defineEmits(['event']);

const authStore = useAuthStore();
const authUser = computed(() => authStore.authUser || {});
const filteredTechnicalProcesses = computed(() =>
	(props.technicalProcesses || []).filter((item) => !!item?.technician),
);
const isTechnician = computed(() =>
	filteredTechnicalProcesses.value.some((item) => item.technician?.id === authUser.value.id),
);
const setupTotalTime = (seconds) => {
	const { total_hours, total_mins } = convertMsToHours((Number(seconds) || 0) * 1000);
	return formatTime(`${total_hours}:${total_mins}`, 'H:M');
};
const settingsStep4 = computed(() =>
	Object.freeze([
		{
			id: 1,
			label: 'Execution Times',
			prop: 'executionTimes',
			meta: {
				isArray: [
					{ id: 11, label: 'Date', prop: 'date' },
					{ id: 12, label: 'Time', prop: 'time' },
				],
			},
		},
		{
			id: 3,
			label: 'Total Time',
			prop: 'total_time',
			meta: { prepareValue: { localMethod: setupTotalTime } },
		},
		{
			id: 4,
			label: 'Attachments',
			prop: 'attachments',
			buttonSettings: { action: 'downloadFile', className: 'link underline' },
			meta: { isAttachment: true },
		},
		{ id: 5, label: 'Work Order Report', prop: 'execution_report_details' },
	]),
);
</script>
