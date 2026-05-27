<template>
	<div
		class="edit-form-container"
		:class="{ 'flex justify-center': !fromAnotherInstance && !isMobile }"
	>
		<el-form
			ref="itemFormRef"
			:class="['item-edit-form', { 'mcol-xs-8': !fromAnotherInstance && !isMobile }]"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('phrases.move_to')" prop="move_to" required>
				<CustomSelectV2
					v-model="formData.move_to"
					:optionsList="moveToList"
					:placeholder="`${tt('Select')} ${tt('to')}`"
					idKey="value"
					valueKey="value"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.move_to === 'storeroom'"
				:label="tt('Storeroom')"
				prop="store_room_id"
				required
			>
				<CustomSelectV2
					v-model="formData.store_room_id"
					filterable
					clearable
					:optionsLoading="storeRoomsLoading"
					:optionsList="storeRoomsList"
					:placeholder="`${tt('Select')} ${tt('storeroom')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.move_to === 'storeroom'"
				:label="tt('Storeroom')"
				prop="store_room_location_id"
			>
				<CustomSelectV2
					v-model="formData.store_room_location_id"
					filterable
					clearable
					:optionsList="storeRoomLocationsList"
					:placeholder="`${tt('storeroom')} ${tt('location')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.move_to === 'asset'"
				:label="tt('Asset')"
				prop="asset_id"
				required
			>
				<FetchByQuerySelect
					v-model="formData.asset_id"
					clearable
					filterable
					enableLoadmore
					loadmoreIsActive
					:optionsLoading="assetsLoading"
					:optionsList="assetsList"
					:settings="assetQueryOptions"
					:placeholder="tt('Asset')"
					@update:optionsLoading="(value) => (assetsLoading = value)"
					@update:optionsList="(value) => (assetsList = value)"
				/>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { api_request } from '@/api/request_provider';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'BrandModelsMoveForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const storeRoomsList = ref([]);
const storeRoomsLoading = ref(false);
const assetsList = ref([]);
const assetsLoading = ref(false);

const assetsEntity = ENTITIES.Assets;
const storeRoomsEntity = ENTITIES.StoreRooms;

const fetchStoreRooms = createGetRequest(storeRoomsEntity.apiBase);
const fetchAssets = createGetRequest(assetsEntity.apiBase);
const fetchAssetById = createGetByIdRequest(assetsEntity.apiBase);

const formData = ref({
	id: null,
	move_to: null,
	asset_id: null,
	store_room_id: null,
	store_room_location_id: null,
	is_store_room: false,
});

const rules = ref({
	move_to: required,
	store_room_id: required,
	asset_id: required,
});

const plantId = computed(() => props.additionalSettings?.plantId);
const equipmentId = computed(() => props.additionalSettings?.equipmentId);

const moveToList = Object.freeze([
	{ name: 'Storeroom', value: 'storeroom' },
	{ name: 'Asset', value: 'asset' },
]);

const selectedStoreroom = computed(() => {
	if (storeRoomsList.value.length && formData.value.store_room_id) {
		return findItemBy('id', formData.value.store_room_id, storeRoomsList.value);
	}
	return null;
});

const storeRoomLocationsList = computed(() =>
	selectedStoreroom.value?.locations ? selectedStoreroom.value.locations : [],
);

const assetQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: fetchAssets,
		fetchByIdAction: fetchAssetById,
		params: { plantId: plantId.value },
	}),
);

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: fetchStoreRooms,
			localProp: storeRoomsList,
			localLoadProp: storeRoomsLoading,
			payload: {
				params: {
					plantId: () => plantId.value,
				},
			},
		},
	]),
);

const localPrepareSubmitData = (data) => {
	const nextData = { ...data };
	delete nextData.id;
	delete nextData.move_to;
	return nextData;
};

const localSubmit = (preparedData) =>
	api_request(`/equipments/move/${equipmentId.value}`, {
		method: 'POST',
		data: preparedData,
	});

const { isMobile, handleCancel, validateForm } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	localPrepareSubmitData,
	localSubmit,
	emit,
});

useRequestsList({
	requestsToDoList,
});

watch(
	() => formData.value.move_to,
	(to) => {
		formData.value.is_store_room = to === 'storeroom';
		formData.value.store_room_id = null;
		formData.value.store_room_location_id = null;
		formData.value.asset_id = null;
	},
);
</script>
