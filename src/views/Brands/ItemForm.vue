<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Brand')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" />
			</el-form-item>

			<el-form-item
				:label="tt('phrases.crossover_exluded')"
				prop="is_crossover_excluded"
				class="half-width switcher"
			>
				<el-switch v-model="formData.is_crossover_excluded" />
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

// import { ENTITIES } from '@/config/entities';
// import { api_request } from '@/api/request_provider';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm } from '@/composables/mixins/useItemForm';

import CustomInput from '@/components/form/CustomInput.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'BrandsItemForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	editModal: { type: Object, default: null },
	fromAnotherInstance: Boolean,
	// editModal: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'onCancel', 'event']);

// const brandsEntity = ENTITIES.Brands;

const itemFormRef = ref(null);

const formData = ref({
	name: '',
	is_crossover_excluded: false,
});

// const formData = ref({ ...initialFormData });

const rules = {
	name: required,
};

/*const localSubmit = (data) => {
	if (props.fromModal) {
		emit('event', { eventName: 'toggleSaving', data: true, onward: true });

		const request = props.itemData?.id
			? api_request.put(`${brandsEntity.apiBase}/${props.itemData.id}`, {
					data,
					itemName: tt(brandsEntity.itemsName.one),
				})
			: api_request.post(brandsEntity.apiBase, {
					data,
					itemName: tt(brandsEntity.itemsName.one),
				});

		return request
			.then((answer) => {
				emit('event', { eventName: 'toggleSaving', data: false, onward: true });
				emit('event', {
					eventName: 'successModalSubmit',
					data: answer,
					onward: true,
				});
				return answer;
			})
			.catch((error) => {
				emit('event', { eventName: 'toggleSaving', data: false, onward: true });
				return Promise.reject(error);
			});
	}

	emit('submit', data);
	return Promise.resolve(data);
};*/

const { isMobile, validateForm, handleCancel } = useItemForm({
	// apiRoute: brandsEntity.apiBase,
	itemData: computed(() => props.itemData),
	formData,
	fromModal: props.fromModal,
	editModal: props.editModal,
	formRef: itemFormRef,
	emit,
	debug: true
	// localSubmit,
	// emit,
});

defineExpose({
	validateForm,
});
</script>
