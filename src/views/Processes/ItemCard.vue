<template>
	<div class="item-card-container">
		<div class="data-content-wrapper">
			<div class="card-header">
				<el-checkbox
					v-if="operationsSettings.allowDelete"
					:model-value="isChecked"
					@change="handleChecked"
				/>
				<div class="semi-bold" v-text="cardTitle"></div>

				<div v-if="cardData.is_offline" class="ml-auto icons-block">
					<img :src="not_wifi_icon" alt="offline" />
				</div>

				<div class="actions-block ml-auto">
					<template v-if="operationsSettings.actions">
						<ButtonWithPopover
							v-for="action in operationsSettings.actions"
							:key="`action-${action.name}`"
							:title="action.tooltip_text"
							:disabled="!action.tooltip_text"
							:settings="popoverSettings"
							:buttonType="action.type"
							:buttonIcon="action.icon"
							:buttonClass="['action-button', action.className]"
							@onClick="handleAction(action)"
						/>
					</template>
				</div>
			</div>

			<div class="card-content">
				<div class="data-section colored-counters">
					<div class="flex mrow">
						<div class="info-part mcol-xs-7">
							<ul class="info-list">
								<li v-for="item in mainInfoList" :key="`info-${item.label}`">
									<span class="key">{{ item.label }}: </span>
									<span
										:class="[item.className || '', 'value']"
										v-html="getCellValue(cardData, item)"
									></span>
								</li>
							</ul>
						</div>

						<div class="images-part mcol-xs-5">
							<div v-if="mainImage" class="imgWrapper">
								<img :src="mainImage.full_thumb_file_name" alt="img error" />
							</div>
						</div>
					</div>
				</div>

				<div class="data-section">
					<div class="info-part">
						<ul class="info-list">
							<li>
								<span class="key">Work Time</span>
								<span class="value">
									{{ cardData.start_work_day }} - {{ cardData.finish_work_day }}
								</span>
							</li>
							<li>
								<span class="key">Break Time</span>
								<span class="values-list">
									<span
										v-for="(item, idx) in cardData.work_breaks || []"
										:key="`break-${item.id || idx}`"
										class="value"
									>
										{{ item.start_time }} - {{ item.finish_time }}{{ idx !== (cardData.work_breaks || []).length - 1 ? ',' : '' }}
									</span>
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div v-if="totalDowntimes" class="data-section">
					<div class="downtimes-counters">
						<span class="label semi-bold">Accumulative Downtime: </span>
						<span class="value">{{ totalDowntimes.total_count_hours }}</span>
						<span class="label">h</span>
						<span class="value">{{ totalDowntimes.total_count_minutes }}</span>
						<span class="label">m</span>
						<span class="value">{{ totalDowntimes.total_count_seconds }}</span>
						<span class="label">s</span>
					</div>

					<div class="downtimes-counters">
						<span class="label semi-bold">Loss count: </span>
						<span class="value">{{ cardData.loss_count }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { getCellValue } from '@/helpers';
import { not_wifi_icon } from '@/constants/global';

import ButtonWithPopover from '@/components/common/ButtonWithPopover.vue';

defineOptions({
	name: 'ProcessItemCard',
});

const props = defineProps({
	cardData: { type: Object, required: true },
	selectedIds: { type: Array, default: () => [] },
	operationsSettings: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);

const sortByDisplayOrder = (items = []) =>
	[...items].sort((a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0));

const cardTitle = computed(() => props.cardData.name);
const totalDowntimes = computed(() => props.cardData.totalDowntimes);
const isChecked = computed(() => props.selectedIds.indexOf(props.cardData.id) !== -1);
const mainImage = computed(() =>
	props.cardData?.pictures?.length ? sortByDisplayOrder(props.cardData.pictures)[0] : null
);

const mainInfoList = computed(() =>
	Object.freeze([
		{ prop: 'max_capacity', label: 'Maximum capacity', className: 'max' },
		{ prop: 'real_capacity', label: 'Real capacity', className: 'real' },
		{ prop: 'production_hourly_rate', label: 'Run rate', className: 'runrate' },
		{ prop: 'actual_capacity', label: 'Running total', className: 'actual' },
	])
);

const popoverSettings = computed(() =>
	Object.freeze({
		popperClass: 'button-popover',
		width: '90',
		buttonSize: 'small',
	})
);

const handleChecked = () => {
	emit('event', {
		eventName: 'handleSelectionChange',
		data: props.cardData.id,
		onward: true,
	});
};

const handleAction = ({ name }) => {
	emit('event', {
		eventName: name,
		data: { row: props.cardData },
		onward: true,
	});
};
</script>
