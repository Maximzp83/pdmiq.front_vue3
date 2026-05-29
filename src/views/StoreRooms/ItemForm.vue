<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Storeroom')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelectV2
					v-model="formData.plant_id"
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Locations')" prop="locations">
				<div class="options-container">
					<div v-if="locationsItemsList.length" class="content-row">
						<LocationItem
							v-for="(item, idx) in locationsItemsList"
							:key="`location_item-${item.id}`"
							:ref="(el) => setSubItemRef('LocationItem', el, idx)"
							:item-data="item"
							:item-index="idx"
							@onRemove="(id) => removeFormItem(id, locationsItemsList)"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button inverted small with-text"
							size="small"
							type="primary"
							@click="addFormItem(locationsItemsList, 'l_i-')"
						>
							<span>{{ `${tt('Add')} ${tt('Location')}` }}</span>
							<i class="icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import LocationItem from './LocationItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'StoreRoomsItemForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const plantsList = shallowRef([]);
const plantsLoading = ref(false);
const locationsItemsList = ref([]);
const refsMap = ref({
	LocationItem: [],
});

const formData = ref({
	name: '',
	plant_id: null,
	locations: [],
});

const rules = {
	name: required,
	plant_id: required,
};

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'LocationItem', targetProp: 'locations' },
	])
);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const methodsMap = {
	fetch_plants: createGetRequest(ENTITIES.Plants.apiBase),
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_plants,
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
	])
);

const itemData = computed(() => props.itemData);

const localSetupPage = (item) => {
	if (item) {
		locationsItemsList.value = setupFormSubItemsList(item.locations, 'l_i');
		return;
	}

	locationsItemsList.value = [];
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'StoreRooms',
	itemData,
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
});
</script>
