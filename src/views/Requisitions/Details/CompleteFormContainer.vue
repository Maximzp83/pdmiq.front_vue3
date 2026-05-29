<template>
	<div class="work-order-details-item card content-row">
		<div class="card-header filled_2 flex space-between align-center">
			<div class="semi-bold uppercase">{{ title }}</div>
			<el-button
				v-if="canTakeInWork"
				size="small"
				type="primary"
				class="action-button"
				@click="$emit('event', 'handleTakeInWork')"
			>
				{{ tt('Start') }}
			</el-button>
		</div>

		<div class="card-content flex top">
			<div class="header-block flex align-center">
				<div class="step-number bold span-block">
					<span>{{ progress || 4 }}</span>
				</div>
			</div>

			<CompleteForm
				v-if="canComplete"
				:itemData="itemData"
				@event="(name, data) => $emit('event', name, data)"
			/>

			<DetailsItem
				v-else
				:orderData="itemData"
				:settings="settings"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { REQUISITION_STATUSES_TYPES } from '@/constants/global';
import { formatTime } from '@/helpers';
import { Lang } from '@/localization';

import CompleteForm from './CompleteForm.vue';
import DetailsItem from './DetailsItem.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'RequisitionCompleteFormContainer' });

const props = defineProps({
	progress: Number,
	title: { type: String, default: '' },
	itemData: { type: Object, default: () => ({}) },
	orderStatus: { type: Object, default: () => ({}) },
	isFabManager: Boolean,
});
defineEmits(['event']);

const canTakeInWork = computed(() => props.itemData?.status === REQUISITION_STATUSES_TYPES.APPROVED);
const canComplete = computed(() => props.itemData?.status === REQUISITION_STATUSES_TYPES.IN_WORK);
const settings = computed(() =>
	Object.freeze(
		translate([
			{ id: 1, label: 'Total_Time', prop: 'execution_total_time', meta: { prepareValue: { localMethod: formatTime, args: 'h:m' } } },
			{ id: 2, label: 'Report', prop: 'execution_report_details' },
			{ id: 3, label: 'Attachments', prop: 'completedAttachments', meta: { isAttachment: true } },
		]),
	),
);
</script>
