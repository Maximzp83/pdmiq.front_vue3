<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemForm"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item v-if="!hideCompanies && isIndustrialMatrix" :label="tt('Company')" prop="company_id">
				<CustomSelect
					v-model="formData.company_id"
					filterable
					:optionsLoading="companiesLoading"
					:optionsList="companiesList"
					:placeholder="`${tt('Select')} ${tt('company')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Plant')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="tt('Region')" prop="region">
				<el-input v-model="formData.region" />
			</el-form-item>

			<el-form-item :label="tt('Address')" prop="address">
				<el-input v-model="formData.address" />
			</el-form-item>

			<el-form-item :label="tt('phrases.joined_at')" prop="joined_at" class="half-width">
				<Datepicker v-model="formData.joined_at" :placeholder="`${tt('Select')} ${tt('date')}`" />
			</el-form-item>

			<el-form-item :label="tt('time_zone')" prop="time_zone">
				<el-select v-model="formData.time_zone" filterable :placeholder="`${tt('select')} ${tt('time_zone')}`">
					<el-option
						v-for="item in timeZones"
						:key="`utc_id-${item.id}`"
						:label="item.label"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('Measurement')" prop="metric_system_type">
				<CustomSelect
					v-model="formData.metric_system_type"
					:optionsList="metricSystems"
					:placeholder="`${tt('select')} ${tt('system')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Locations')">
				<div class="options-container">
					<div class="content-row">
						<div v-for="(location, idx) in formData.locations" :key="`location-${idx}`" class="option-item-container mrow">
							<div class="name-input fluid">
								<CustomInput v-model="location.name" :placeholder="tt('name')" />
							</div>
							<el-button
								class="action-button remove-button"
								size="mini"
								type="danger"
								icon="icomoon icon-cross"
								@click="removeLocation(idx)"
							/>
						</div>
					</div>
					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="mini"
							type="success"
							icon="icomoon icon-cross"
							@click="addLocation"
						/>
					</div>
				</div>
			</el-form-item>

			<el-form-item :label="tt('Archive')" prop="is_archived">
				<el-switch v-model="formData.is_archived" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item :label="tt('Commissioning')" prop="is_commissioning">
				<el-switch v-model="formData.is_commissioning" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="emit('onCancel')" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { required } from '@/constants/validation';
import { timeZonesList } from '@/constants/date_time';
import { USER_ROLES_TYPES } from '@/constants/global';
import { metricSystemsList } from '@/modules/charts_factory/controllers/Sensor/enums';
import { Lang } from '@/localization';
import { api_request } from '@/api/request_provider';
import { useAuthStore } from '@/stores/AuthStore';

import CustomInput from '@/components/form/CustomInput.vue';
import CustomSelect from '@/components/form/CustomSelect.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

const props = defineProps({
	itemData: { type: Object, default: null },
	hideCompanies: Boolean,
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
});

const emit = defineEmits(['submit', 'onCancel']);

const authStore = useAuthStore();
const isIndustrialMatrix = computed(() => {
	const type = authStore.authUser?.role?.type;
	return type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX || type === USER_ROLES_TYPES.DEVELOPER;
});

const isMobile = ref(false);
const itemForm = ref(null);
const companiesLoading = ref(false);
const companiesList = ref([]);

const formData = ref({
	name: '',
	address: '',
	region: '',
	company_id: null,
	time_zone: 0,
	metric_system_type: null,
	locations: [],
	is_archived: 0,
	is_commissioning: 0,
	joined_at: '',
});

const rules = {
	name: required,
	address: required,
	region: required,
	company_id: required,
};

const timeZones = computed(() => Object.freeze(timeZonesList()));
const metricSystems = computed(() => Object.freeze(metricSystemsList()));

const setupFromItemData = (item) => {
	if (!item) return;
	formData.value = {
		...formData.value,
		...item,
		company_id: item.company_id ?? item.company?.id ?? formData.value.company_id,
		locations: Array.isArray(item.locations)
			? item.locations.map((l) => ({ id: l.id, name: l.name || '' }))
			: [],
	};
};

const fetchCompanies = async () => {
	if (props.hideCompanies || !isIndustrialMatrix.value) return;
	companiesLoading.value = true;
	try {
		const { value } = await api_request.get('/companies', {
			params: { max: -1, orderByColumn: 'name', orderByMethod: 'asc' },
			notNotify: true,
		});
		companiesList.value = Array.isArray(value) ? value : [];
	} catch (error) {
		console.warn(error);
	} finally {
		companiesLoading.value = false;
	}
};

const addLocation = () => {
	formData.value.locations.push({ id: null, name: '' });
};

const removeLocation = (idx) => {
	formData.value.locations.splice(idx, 1);
};

const validateForm = async () => {
	if (!itemForm.value) return;
	const valid = await itemForm.value.validate().catch(() => false);
	if (!valid) return;

	const payload = {
		...formData.value,
		locations: formData.value.locations.filter((l) => l?.name?.trim?.()),
	};
	emit('submit', payload);
};

watch(
	() => props.itemData,
	(item) => setupFromItemData(item),
	{ immediate: true }
);

onMounted(() => {
	isMobile.value = window.innerWidth < 768;
	fetchCompanies();
});

defineExpose({ validateForm });
</script>
