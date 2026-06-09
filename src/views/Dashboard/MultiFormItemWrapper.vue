<template>
	<div class="content-container">
		<div class="item-header relative" @click="changeInstance">
			<SimpleSpinner :active="isLoading" />

			<div class="title">{{ instanceTitle }}</div>
			<div class="toggle-button">
				<i class="icomoon icon-path_2"></i>
			</div>
		</div>

		<div v-show="is_active" class="item-content">
			<VueElementLoadingWrapper :isLoading="isLoading" :isSaving="isSaving" />

			<component
				:is="componentFile"
				v-if="initFormComponent && componentFile"
				ref="itemFormComponent"
				fromModal
				fromMultiformModal
				:editModal="editModal"
				:itemData="itemData"
				:instancesItemsData="instancesItemsData"
				:multiFormFilters="multiFormFilters"
				@event="handleEvent"
			/>

			<div class="item-content-footer">
				<ElButton
					:loading="isSaving"
					type="primary"
					native-type="button"
					class="item-action-button"
					@click="saveItem"
				>
					<span class="uppercase">{{ `${tt('SAVE')} ${instanceTitle}` }}</span>
				</ElButton>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeMount, ref, watch } from 'vue';
import { ElButton } from 'element-plus';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

defineOptions({ name: 'MultiFormItemWrapper' });

const props = defineProps({
	instance: { type: Object, required: true },
	is_active: Boolean,
	editModal: { type: Object, default: () => ({}) },
	instancesData: { type: Object, required: true },
	instancesItemsData: { type: Object, default: null },
	multiFormFilters: { type: Object, default: null },
});
const emit = defineEmits(['event']);

const editModal = computed(() => props.editModal || {});
const initFormComponent = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const itemData = ref(null);
const itemFormComponent = ref(null);

const componentLoaders = {
	'ProductionLines/ItemForm': () => import('@/views/ProductionLines/ItemForm.vue'),
	'Machines/ItemForm': () => import('@/views/Machines/ItemForm.vue'),
	'Assets/ItemForm': () => import('@/views/Assets/ItemForm.vue'),
	'Equipments/ItemFormWrapper': () => import('@/views/Equipments/ItemFormWrapper.vue'),
};

const tt = (key) => Lang.tt(key);
const instanceTitle = computed(() => props.instance.title ? tt(props.instance.title) : '');
const componentFile = computed(() => {
	const loader = componentLoaders[props.instance.path];
	return loader ? defineAsyncComponent(loader) : null;
});

const emitEvent = (eventName, payload) => {
	emit('event', { eventName, payload, onward: true });
};
const changeInstance = () => {
	if (!props.is_active) {
		emitEvent('changeInstance', { name: props.instance.name });
	}
};
const setupRelatedData = (data) => {
	if (!props.instance.relatedInstance) return;
	const { related_id } = props.instance.relatedInstance;
	emitEvent('setupRelatedId', {
		prop: related_id,
		value: data?.[related_id] || null,
	});
};
const setupItemData = ({ id, data } = {}) => {
	if (id) {
		loadItemData(id);
		return;
	}
	if (data) {
		itemData.value = data;
		setupRelatedData(data);
	}
};
const loadItemData = (id) => {
	if (!id || !props.instance.apiRoute) return;

	isLoading.value = true;
	api_request.get(`${props.instance.apiRoute}/${id}`, {
		itemId: id,
		notNotify: true,
	})
		.then(({ value }) => setupItemData({ data: value }))
		.finally(() => {
			isLoading.value = false;
		});
};
const toggleSaving = (saving) => {
	isSaving.value = saving;
};
const saveItem = () => {
	itemFormComponent.value?.validateForm?.({ editModal: editModal.value });
};
const successModalSubmit = (answer) => {
	const savedItem = answer?.data?.data;
	if (savedItem) {
		setupItemData({ data: savedItem });
	}
	if (editModal.value?.callback) {
		editModal.value.callback(answer);
	}
};

const { handleEvent } = useEventHandler({
	toggleSaving,
	successModalSubmit,
	setMultiFormFilters: (filters) => emitEvent('setMultiFormFilters', filters),
}, emit);

watch(
	() => props.is_active,
	(active) => {
		if (active && !initFormComponent.value) {
			initFormComponent.value = true;
		}
	},
);

watch(
	() => props.instancesData,
	(data) => {
		const itemId = data?.[props.instance.idProp];
		if (itemId && (!itemData.value || itemData.value.id !== itemId)) {
			setupItemData({ id: itemId });
		}
	},
	{ deep: true },
);

watch(itemData, (data) => {
	if (data) {
		emitEvent('setInstanceItemData', {
			prop: props.instance.instanceDataProp,
			value: data,
		});
	}
});

onBeforeMount(() => {
	if (props.is_active && !initFormComponent.value) {
		initFormComponent.value = true;
	}

	if (editModal.value?.instanceData && props.instance.name === editModal.value.instanceName) {
		if (props.instance.forceFetchOnEdit && editModal.value.instanceData.id) {
			setupItemData({ id: editModal.value.instanceData.id });
		} else {
			setupItemData({ data: editModal.value.instanceData });
		}
	}
});
</script>
