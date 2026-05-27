<template>
	<div :class="['notification-column', columnData.className || '']">
		<div class="cell-item">
			<span v-if="columnData.title" class="cell-label label semi-bold">
				{{ columnData.title }}
			</span>
			<el-checkbox :model-value="checkAll" @change="handleCheckAllChange">
				{{ columnData.label }}
			</el-checkbox>
		</div>

		<div v-for="cellData in columnData.cells || []" :key="cellData.key" class="cell-item">
			<span v-if="cellData.title" class="cell-label label">{{ cellData.title }}</span>

			<el-checkbox
				v-model="formData[cellData.key]"
				:true-value="1"
				:false-value="0"
				@change="() => handleChecked({ key: cellData.key })"
			>
				{{ cellData.label || '' }}
			</el-checkbox>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

defineOptions({
	name: 'UsersNotificationsColumn',
});

const props = defineProps({
	columnData: { type: Object, default: () => ({}) },
});

const formData = ref({});

const checkedCount = computed(() => Object.values(formData.value).filter(Boolean).length);
const checkAll = computed(
	() => checkedCount.value === Object.keys(formData.value || {}).length && checkedCount.value > 0,
);

const setupFormData = (data) => {
	const next = {};
	(data?.cells || []).forEach((cellData) => {
		next[cellData.key] = cellData.value || 0;
	});
	formData.value = next;
};

const handleChecked = () => {
	return checkAll.value;
};

const handleCheckAllChange = () => {
	const keys = Object.keys(formData.value || {});
	const newValue = checkedCount.value < keys.length ? 1 : 0;
	keys.forEach((key) => {
		formData.value[key] = newValue;
	});
};

const getFormData = () => formData.value;

watch(
	() => props.columnData,
	(value) => {
		setupFormData(value);
	},
	{ immediate: true, deep: true },
);

defineExpose({
	getFormData,
});
</script>
