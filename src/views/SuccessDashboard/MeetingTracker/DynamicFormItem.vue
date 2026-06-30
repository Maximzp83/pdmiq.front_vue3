<template>
	<el-form ref="itemFormRef" class="special-decorated-form-item" :model="formData">
		<div :class="['form-items', { mrow: !showJustInfo }]">
			<el-form-item prop="description" class="mcol-xs-12 text-form-item">
				<CustomInput
					ref="descriptionRef"
					v-model="formData.description"
					:placeholder="tt('description')"
					type="textarea"
					elastic
					:disabled="showJustInfo"
				/>
			</el-form-item>

			<CustomInput
				v-if="showJustInfo && enableName"
				prefixIcon="icomoon icon-users"
				:model-value="usersNames"
				:placeholder="'-'"
				disabled
			/>

			<div v-else-if="enableName" class="pt-0 flex align-center mrow">
				<el-form-item prop="users_ids" class="small-form-item mcol-xs-6">
					<CustomSelectV2
						v-model="formData.users_ids"
						prefixIcon="icomoon icon-users"
						clearable
						multiple
						collapse-tags
						:optionsLoading="usersLoading"
						:optionsList="usersList"
						:placeholder="`${tt('Select')} ${tt('users')}`"
						labelKey="full_name"
					/>
				</el-form-item>

				<div class="mcol-xs-1 text-center">or</div>

				<el-form-item prop="users_name" class="small-form-item mcol-xs-6">
					<CustomInput
						v-model="formData.users_name"
						prefixIcon="icomoon icon-users"
						:placeholder="tt('names')"
					/>
				</el-form-item>
			</div>

			<div v-if="showJustInfo" class="pt-0 flex align-center mrow">
				<el-form-item prop="machine_id" class="small-form-item mcol-xs-6">
					<CustomInput
						prefixIcon="icomoon icon-machines"
						:model-value="machineName"
						:placeholder="'-'"
						disabled
					/>
				</el-form-item>

				<el-form-item prop="machine_id" class="small-form-item mcol-xs-6">
					<i class="input-prefix icomoon icon-sensor"></i>
					<span class="span-block" v-html="sensorsNames"></span>
				</el-form-item>
			</div>

			<div v-else class="pt-0 flex align-center mrow">
				<el-form-item prop="machine_id" class="small-form-item mcol-xs-6">
					<CustomSelectV2
						v-model="formData.machine_id"
						prefixIcon="icomoon icon-machines"
						clearable
						:optionsLoading="machinesLoading"
						:optionsList="machinesList"
						:placeholder="`${tt('select')} ${tt('machine')}`"
						@change="formData.sensor_ids = []"
					/>
				</el-form-item>

				<el-form-item prop="sensor_ids" class="small-form-item mcol-xs-6">
					<CustomSelectV2
						v-model="formData.sensor_ids"
						prefixIcon="icomoon icon-sensor"
						clearable
						multiple
						collapse-tags
						:optionsLoading="sensorsLoading"
						:optionsList="plantSensorsList"
						:placeholder="`${tt('select')} ${tt('sensors')}`"
						labelKey="location_in_equipment"
					/>
				</el-form-item>
			</div>
		</div>

		<div v-if="!showJustInfo" class="button-container">
			<el-button
				v-if="isLast"
				class="action-button create-button inverted"
				size="small"
				type="primary"
				native-type="button"
				@click="addItem"
			>
				<i class="icomoon icon-plus"></i>
			</el-button>

			<el-button
				v-else
				class="action-button remove-button"
				size="small"
				type="danger"
				native-type="button"
				@click="removeItem"
			>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardDynamicFormItem' });

const props = defineProps({
	modelValue: { type: Object, default: () => ({}) },
	itemData: { type: Object, default: null },
	itemIndex: Number,
	targetPropName: String,
	isLast: Boolean,
	enableName: Boolean,
	usersLoading: Boolean,
	usersList: { type: Array, default: () => [] },
	showJustInfo: Boolean,
	machinesLoading: Boolean,
	machinesList: { type: Array, default: () => [] },
	sensorsLoading: Boolean,
	sensorsList: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue', 'remove', 'onRemove', 'onCreate', 'ready']);

const itemFormRef = ref(null);
const descriptionRef = ref(null);
const formData = ref({
	description: '',
	users_name: '',
	users_ids: [],
	machine_id: null,
	sensor_ids: [],
});

const sourceData = computed(() => props.itemData || props.modelValue || {});
const usersNames = computed(() => {
	const { users_ids = [], users_name } = formData.value;
	let names = '';

	users_ids.forEach((id, idx) => {
		const user = findItemBy('id', id, props.usersList);
		if (user) {
			if (idx !== 0) names += ', ';
			names += `${user.full_name}`;
		}
	});

	names = names.length && users_name ? `${names}, ${users_name}` : names || users_name;
	return names || '-';
});
const machineName = computed(() => {
	const machine = findItemBy('id', formData.value.machine_id, props.machinesList);
	return machine?.name || '-';
});
const sensorsNames = computed(() => {
	let names = '';
	(formData.value.sensor_ids || []).forEach((id, idx) => {
		const sensor = findItemBy('id', id, props.sensorsList);
		if (sensor) {
			if (idx !== 0) names += '</br> ';
			names += `${sensor.location_in_equipment}`;
		}
	});
	return names || '-';
});
const plantSensorsList = computed(() => {
	if (formData.value.machine_id) {
		return props.sensorsList.filter(
			(sensor) =>
				(sensor.equipment && sensor.equipment.asset && sensor.equipment.asset.machine_id) ===
				formData.value.machine_id,
		);
	}
	return [];
});

const normalizeData = (data = {}) => ({
	description: data.description || '',
	users_name: data.users_name || '',
	users_ids: data.users_ids || [],
	machine_id: data.machine_id || null,
	sensor_ids: data.sensor_ids || (data.sensor_id ? [data.sensor_id] : []),
	id: data.id,
});
const getFormData = () => {
	const newData = { ...formData.value };

	if (props.enableName) {
		if (!newData.users_name) delete newData.users_name;
	} else {
		delete newData.users_name;
		delete newData.users_ids;
	}

	if (!newData.id) delete newData.id;
	return newData;
};
const syncToParent = () => {
	emit('update:modelValue', getFormData());
};
const addItem = () => emit('onCreate');
const removeItem = () => {
	emit('remove');
	emit('onRemove', sourceData.value.id ?? props.itemIndex);
};
const validateItemForm = () => true;
const focusField = (field) => {
	if (field === 'description') {
		nextTick(() => {
			descriptionRef.value?.focus?.();
		});
	}
};

watch(
	sourceData,
	(data) => {
		formData.value = normalizeData(data);
	},
	{ immediate: true, deep: true },
);
watch(formData, syncToParent, { deep: true });

nextTick(() => emit('ready'));

defineExpose({
	getFormData,
	validateItemForm,
	focusField,
});
</script>
