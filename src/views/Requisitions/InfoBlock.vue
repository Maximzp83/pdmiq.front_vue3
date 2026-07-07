<template>
	<div class="card overflowHidden info-block">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">{{ tt('INFORMATION') }}</div>
		</div>

		<div class="card-content">
			<div class="info-item">
				<div class="icon">
					<el-icon class="el-range__icon">
						<CalendarIcon />
					</el-icon>
				</div>
				<div class="value semi-bold">
					<div class="muted">{{ tt('phrases.Date_Sent') }}</div>
					<div class="semi-bold">{{ dateSent }}</div>
				</div>
			</div>

			<div class="info-item">
				<div class="icon"><i class="icomoon icon-docs"></i></div>
				<div class="value">
					<div class="muted">{{ tt('Work_Order') }} #</div>
					<div class="semi-bold">{{ itemData?.id || '-' }}</div>
				</div>
			</div>

			<div class="info-item">
				<div class="icon">
					<span class="requisition-status-label" :style="{ backgroundColor: statusItem.color }"></span>
				</div>
				<div class="value">
					<div class="muted">{{ tt('Status') }}</div>
					<div class="semi-bold">{{ statusItem.label || '-' }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar as CalendarIcon } from '@element-plus/icons-vue';

import { requisitionStatusesList } from '@/constants/global';
import { cleanDateString, findItemBy } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'RequisitionsInfoBlock' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
});

const statusItem = computed(() =>
	findItemBy('id', props.itemData?.status, requisitionStatusesList()) || {},
);
const dateSent = computed(() => cleanDateString(props.itemData?.created_at) || '-');
</script>
