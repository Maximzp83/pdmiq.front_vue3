<template>
	<div class="form-items-list accordion-container">
		<div
			v-for="instance in instancesList"
			:key="`instance-${instance.name}`"
			:class="['accordion-item', { active: isActive(instance.name) }]"
		>
			<MultiFormItemWrapper
				:instance="instance"
				:editModal="editModal"
				:instancesData="instancesData"
				:instancesItemsData="instancesItemsData"
				:formSettings="editModal.formSettings"
				:is_active="isActive(instance.name)"
				:multiFormFilters="multiFormFilters"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

import { useEventHandler } from '@/composables/mixins/useEmitter';

import MultiFormItemWrapper from './MultiFormItemWrapper.vue';

defineOptions({ name: 'MultiFormWrapper' });

const props = defineProps({
	editModal: { type: Object, default: () => ({}) },
});

const editModal = computed(() => props.editModal || {});
const currentInstanceName = ref('');
const instancesData = reactive({});
const instancesItemsData = reactive({});
const multiFormFilters = ref({
	plantId: null,
	machineId: null,
	assetId: null,
});

const instancesList = computed(() => {
	const productionLineItem = {
		name: 'ProductionLines',
		title: 'PRODUCTION_LINE',
		path: 'ProductionLines/ItemForm',
		apiRoute: '/production-lines',
		idProp: 'production_line_id',
		instanceDataProp: 'productionLine',
	};

	if (editModal.value?.instanceName === 'Utilities') {
		productionLineItem.name = 'Utilities';
		productionLineItem.title = 'UTILITY';
	}

	return Object.freeze([
		productionLineItem,
		{
			name: 'Machines',
			title: 'MACHINE',
			path: 'Machines/ItemForm',
			apiRoute: '/machines',
			idProp: 'machine_id',
			instanceDataProp: 'machine',
			relatedInstance: { related_id: 'production_line_id' },
		},
		{
			name: 'Assets',
			title: 'ASSET',
			path: 'Assets/ItemForm',
			apiRoute: '/assets',
			idProp: 'asset_id',
			instanceDataProp: 'asset',
			relatedInstance: { related_id: 'machine_id' },
		},
		{
			name: 'Equipments',
			title: 'ITEM',
			path: 'Equipments/ItemFormWrapper',
			apiRoute: '/equipments',
			idProp: 'equipment_id',
			instanceDataProp: 'equipment',
			relatedInstance: { related_id: 'asset_id' },
			forceFetchOnEdit: true,
		},
	]);
});

const isActive = (name) => currentInstanceName.value === name;
const changeInstance = ({ name }) => {
	currentInstanceName.value = name;
};
const setupRelatedId = ({ prop, value }) => {
	instancesData[prop] = value;
};
const setInstanceItemData = ({ prop, value }) => {
	instancesItemsData[prop] = value;
};
const setMultiFormFilters = (filters) => {
	multiFormFilters.value = filters || {};
};
const successModalSubmit = (answer) => {
	if (editModal.value?.callback) {
		editModal.value.callback(answer);
	}
};

const { handleEvent } = useEventHandler({
	changeInstance,
	setupRelatedId,
	setInstanceItemData,
	setMultiFormFilters,
	successModalSubmit,
});

currentInstanceName.value = editModal.value?.instanceName || 'ProductionLines';
</script>
