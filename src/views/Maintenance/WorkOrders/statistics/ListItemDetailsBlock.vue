<template>
	<div class="card overflowHidden details-block vertical-fluid">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">
				{{ `${tt('DETAILS')} ${tt('WORK_ORDER')}` }}
			</div>
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
				<div class="part-item data-part">
					<div class="data-item">
						<div class="data-value">{{ usedItemData.finish_date || '-' }}</div>
						<div class="data-label">{{ tt('Due_Date') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ usedItemData.id }}</div>
						<div class="data-label">{{ tt('WO') }}#</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ machineName }}</div>
						<div class="data-label">{{ tt('phrases.Machine_Name') }}</div>
					</div>
				</div>

				<div class="part-item data-part">
					<div class="data-item">
						<div class="data-value">{{ usedItemData.title }}</div>
						<div class="data-label">{{ tt('phrases.Work_Order_Name') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ woStatus }}</div>
						<div class="data-label">{{ tt('Status') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value" v-html="assignedUsers"></div>
						<div class="data-label">{{ tt('Technician') }}</div>
					</div>
				</div>

				<div class="progress-part">
					<div class="content-container">
						<div
							v-for="item in progressItems"
							:key="`progressi-${item.id}`"
							:class="[
								'progress-item',
								{ active: item.active },
								{ 'display-none': item.hide },
								{ 'red-status': item.redStatus },
							]"
						>
							<div class="circle">
								<i :class="['icomoon', item.active ? 'icon-check' : 'icon-cross']"></i>
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

import {
	WORK_ORDER_STATUSES_TYPES,
	factoryWallpaper,
	workOrdersStatusesList,
} from '@/constants/global';
import { findItemBy, getDateRange, getTimeDifference, setupAssignedUsers } from '@/helpers';
import { Lang } from '@/localization';

import CustomTransition from '@/components/common/CustomTransition.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'WorkOrdersStatisticsListItemDetailsBlock',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	usersList: { type: Array, default: () => [] },
});

const usedItemData = computed(() => props.itemData);
const machineName = computed(() => usedItemData.value?.machine?.name || '-');
const woStatus = computed(() => {
	const status = findItemBy('id', usedItemData.value?.status, workOrdersStatusesList());
	return status?.name || status?.label || '-';
});
const assignedUsers = computed(() =>
	usedItemData.value ? setupAssignedUsers(usedItemData.value, { usersList: props.usersList }) : '-',
);
const progressItems = computed(() => {
	const itemData = usedItemData.value;
	if (!itemData) return Object.freeze([]);

	const { days, lessZero } = getTimeDifference({
		from: new Date(),
		to:
			itemData.finish_date ||
			getDateRange('yesterday', {
				getDateString: true,
			})[0],
	});
	const isCompleted = itemData.status === WORK_ORDER_STATUSES_TYPES.COMPLETED;

	return Object.freeze(
		translate([
			{ id: 1, label: 'Created', active: true },
			{ id: 2, label: 'Due_this_week', active: days < 8 || isCompleted },
			{ id: 3, label: 'Due_Today', active: days <= 0 || isCompleted },
			{ id: 4, label: 'Late', hide: !lessZero, redStatus: true },
			{ id: 5, label: 'Complete', active: isCompleted },
		]),
	);
});
</script>
