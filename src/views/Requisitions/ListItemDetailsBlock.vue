<template>
	<div class="card overflowHidden details-block vertical-fluid">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">{{ `${tt('DETAILS')} ${tt('WORK_ORDER')}` }}</div>
		</div>

		<CustomTransition mode="trigger" :trigger="usedItemData">
			<div v-if="!usedItemData" class="card-content flex mrow align-center">
				<div class="mcol-xs-5 text-part">
					<i class="icomoon icon-eye success-color"></i>
					<span class="semi-bold">
						{{ tt('phrases.to_view_the_information_of_the_work_order_click_on_the_preview_button_from_the_list_of_work_orders') }}
					</span>
				</div>
				<div class="mcol-xs-7 image-part">
					<div class="imgWrapper factory-img">
						<img :src="factoryWallpaper" alt="img error" />
					</div>
				</div>
			</div>

			<div v-else class="details-data-container">
				<div class="part-item top-part flex space-between">
					<div class="plant-info">
						<div>
							<div class="uppercase semi-bold">{{ usedItemData.requisitionPlant?.name || '-' }}</div>
							<div class="muted">{{ tt('Requisition') }}</div>
						</div>
					</div>

					<div v-if="showDetailsButton" class="flex align-center">
						<el-button
							class="action-button"
							size="small"
							type="success"
							@click="handleShowDetails"
						>
							<i class="icomoon icon-docs"></i>
						</el-button>
					</div>
				</div>

				<div class="part-item data-part">
					<div class="data-item">
						<div class="data-value">{{ hours }}</div>
						<div class="data-label">{{ tt('Hours') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">${{ usedItemData.proposed_cost || 0 }}</div>
						<div class="data-label">{{ tt('Budget_Cost') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">${{ usedItemData.actual_cost || 0 }}</div>
						<div class="data-label">{{ tt('Fab_Shop_Budget') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">${{ usedItemData.execution_cost || 0 }}</div>
						<div class="data-label">{{ tt('Running_Total') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ timeLeft }}</div>
						<div class="data-label">{{ tt('Time_left') }}</div>
					</div>
				</div>

				<div :class="['progress-part', { denied: orderStatus.isDenied }]">
					<div class="content-container">
						<div
							v-for="item in progressItems"
							:key="`progress-${item.id}`"
							:class="['progress-item', { active: item.active, 'red-status': item.redStatus }]"
						>
							<div class="circle">
								<span>{{ item.id }}</span>
								<i :class="['icomoon', item.redStatus ? 'icon-cross' : 'icon-check']"></i>
							</div>
							<div class="label">{{ item.label }}</div>
						</div>
					</div>
				</div>
			</div>
		</CustomTransition>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { factoryWallpaper, REQUISITION_STATUSES_TYPES } from '@/constants/global';
import { formatTime, getTimeDifference } from '@/helpers';
import { Lang } from '@/localization';
import { useNavigation } from '@/composables/mixins/useNavigation';

import CustomTransition from '@/components/common/CustomTransition.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionsListItemDetailsBlock' });

const props = defineProps({
	itemData: { type: Object, default: null },
	showDetailsButton: Boolean,
});

const { changeRoute } = useNavigation();
const usedItemData = computed(() => props.itemData);
const orderStatus = computed(() => {
	const status = usedItemData.value?.status;
	return Object.freeze({
		isApproved: status === REQUISITION_STATUSES_TYPES.APPROVED,
		isDenied: status === REQUISITION_STATUSES_TYPES.DENIED,
		isCompleted: status === REQUISITION_STATUSES_TYPES.COMPLETED,
		isInWork: status === REQUISITION_STATUSES_TYPES.IN_WORK,
	});
});
const progressItems = computed(() =>
	Object.freeze([
		{ id: 1, label: tt('Created'), active: true },
		{
			id: 2,
			label: orderStatus.value.isDenied ? tt('Denied') : tt('Approve'),
			active:
				orderStatus.value.isApproved ||
				orderStatus.value.isDenied ||
				orderStatus.value.isInWork ||
				orderStatus.value.isCompleted,
			redStatus: orderStatus.value.isDenied,
		},
		{ id: 3, label: tt('phrases.In_Work'), active: orderStatus.value.isInWork || orderStatus.value.isCompleted },
		{ id: 4, label: tt('Complete'), active: orderStatus.value.isCompleted },
	]),
);
const hours = computed(() => formatTime(usedItemData.value?.execution_total_time, 'h:m') || '-');
const timeLeft = computed(() => {
	if (!usedItemData.value?.complete_at) return '-';
	const { days, hours } = getTimeDifference({ from: new Date(), to: usedItemData.value.complete_at });
	return hours < 0 || days < 0 ? '0h' : `${days}d ${hours}h`;
});

const handleShowDetails = () => {
	if (usedItemData.value?.id) {
		changeRoute({ path: `/requisitions/${usedItemData.value.id}` });
	}
};
</script>
