<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form locations-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Distributor')} ${tt('name')}`" prop="company_name">
				<CustomInput v-model="formData.company_name" />
			</el-form-item>

			<el-form-item :label="tt('Type')" prop="scope">
				<CustomSelectV2
					v-model="formData.scope"
					:optionsList="availableScopesList"
					:placeholder="`${tt('Select')} ${tt('scope')}`"
				/>
			</el-form-item>

			<div :label="tt('Locations')" prop="locations" class="el-form-item">
				<div class="title article-title">{{ tt('Locations') }}:</div>
				<div class="options-container locations-container">
					<div v-if="locationsItemsList.length" class="content-row">
						<LocationItem
							v-for="(item, idx) in locationsItemsList"
							:key="`location_item-${item.id}`"
							:ref="(el) => setSubItemRef('LocationItem', el, idx)"
							:plantsList="plantsList"
							:plantsLoading="plantsLoading"
							:item-data="item"
							:item-index="idx"
							:distributor="itemData"
							:isMobile="isMobile"
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
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { SCOPES, scopesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import LocationItem from './LocationItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'DistributorsItemForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);

const plantsEntity = ENTITIES.Plants;

const itemFormRef = ref(null);
const plantsList = shallowRef([]);
const plantsLoading = ref(false);
const locationsItemsList = ref([]);
const refsMap = ref({
	LocationItem: [],
});

const formData = ref({
	company_name: '',
	scope: null,
	locations: [],
});

const rules = {
	company_name: required,
	scope: required,
};

const availableScopesList = computed(() =>
	scopesList.map((item) => ({
		...item,
		disabled: item.id === SCOPES.ASSET_MATRIX || item.id === SCOPES.DRIVE_MATRIX,
	})),
);

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'LocationItem', targetProp: 'locations' },
	]),
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
	fetch_plants: createGetRequest(plantsEntity.apiBase),
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_plants,
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
	]),
);

const itemData = computed(() => props.itemData);

const localSetupPage = (item) => {
	if (item) {
		locationsItemsList.value = setupFormSubItemsList(item.locations, 'l_i');
	}
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Distributors',
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
