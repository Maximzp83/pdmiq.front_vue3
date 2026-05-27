<template>
	<div class="checkboxes-matrix-block">
		<div class="checkboxes-matrix-row">
			<div class="row-label label semi-bold">{{ title }}</div>

			<div class="cell-item">
				<el-checkbox
					:model-value="allEmailChecked"
					:indeterminate="emailIndeterminate"
					:true-value="1"
					:false-value="0"
					@change="() => handleCheckAllChange('is_email', emailChecksCount)"
				>
					{{ tt('Email') }}
				</el-checkbox>
			</div>

			<div class="cell-item">
				<el-checkbox
					:model-value="allPushChecked"
					:indeterminate="pushIndeterminate"
					:true-value="1"
					:false-value="0"
					@change="() => handleCheckAllChange('is_push', pushChecksCount)"
				>
					{{ tt('Push') }}
				</el-checkbox>
			</div>

			<div class="cell-item">
				<el-checkbox
					:model-value="allSmsChecked"
					:indeterminate="smsIndeterminate"
					:disabled="!isPhoneVerified"
					:true-value="1"
					:false-value="0"
					@change="() => handleCheckAllChange('is_sms', smsChecksCount)"
				>
					SMS
				</el-checkbox>
			</div>
		</div>

		<NotificationRow
			v-for="(row, idx) in rows"
			:key="row?.formData?.message_type || row?.title || idx"
			:ref="(el) => setRowRef(el, idx)"
			:rowData="row"
			:isPhoneVerified="isPhoneVerified"
		/>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import NotificationRow from './NotificationRow.vue';

const { tt } = Lang;

defineOptions({
	name: 'UsersNotificationsBlock',
});

const props = defineProps({
	title: { type: String, default: '' },
	rows: { type: Array, default: () => [] },
	isPhoneVerified: Boolean,
});

const rowRefs = ref([]);

const setRowRef = (el, idx) => {
	if (el) {
		rowRefs.value[idx] = el;
		return;
	}

	if (rowRefs.value.length > idx) {
		rowRefs.value.splice(idx, 1);
	}
};

const rowList = computed(() => rowRefs.value.filter(Boolean));

const emailChecksCount = computed(
	() => rowList.value.map((row) => row.getFormData().is_email).filter(Boolean).length,
);
const pushChecksCount = computed(
	() => rowList.value.map((row) => row.getFormData().is_push).filter(Boolean).length,
);
const smsChecksCount = computed(
	() => rowList.value.map((row) => row.getFormData().is_sms).filter(Boolean).length,
);

const allEmailChecked = computed(
	() => !!props.rows.length && emailChecksCount.value === props.rows.length,
);
const allPushChecked = computed(
	() => !!props.rows.length && pushChecksCount.value === props.rows.length,
);
const allSmsChecked = computed(
	() => !!props.rows.length && smsChecksCount.value === props.rows.length,
);

const emailIndeterminate = computed(
	() => emailChecksCount.value > 0 && emailChecksCount.value < props.rows.length,
);
const pushIndeterminate = computed(
	() => pushChecksCount.value > 0 && pushChecksCount.value < props.rows.length,
);
const smsIndeterminate = computed(
	() => smsChecksCount.value > 0 && smsChecksCount.value < props.rows.length,
);

const handleCheckAllChange = (key, checkedCount) => {
	const nextValue = checkedCount < props.rows.length ? 1 : 0;
	rowList.value.forEach((row) => row.setFormData(key, nextValue));
};

const getFormData = () => rowList.value.map((row) => row.getFormData());

defineExpose({
	getFormData,
});
</script>
