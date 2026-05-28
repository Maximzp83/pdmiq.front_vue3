<template>
	<el-form
		ref="itemFormRef"
		class="option-item-container location-item-container"
		:model="formData"
		:rules="rules"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item prop="plants_ids" :label="tt('Plants')">
			<SimpleSpinner :active="plantsLoading" />

			<CustomSelectV2
				v-model="formData.plants_ids"
				multiple
				collapse-tags
				:disabled="!plantsList.length"
				:optionsList="plantsList"
				:placeholder="`${tt('Select')} ${tt('plants')}`"
			/>
		</el-form-item>

		<el-form-item prop="address" :label="tt('Address')">
			<CustomInput v-model="formData.address" />
		</el-form-item>

		<el-form-item prop="city" :label="tt('City')">
			<CustomInput v-model="formData.city" />
		</el-form-item>

		<el-form-item prop="state" :label="tt('State')">
			<CustomInput v-model="formData.state" />
		</el-form-item>

		<el-form-item prop="country" :label="tt('Country')">
			<CustomInput v-model="formData.country" />
		</el-form-item>

		<el-form-item label=" ">
			<el-button
				class="action-button create-button inverted with-text"
				size="small"
				type="primary"
				@click="removeItem"
			>
				<span>{{ `${tt('Remove')} ${tt('Location')}` }}</span>
				<i class="icomoon icon-cross remove-button"></i>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'DistributorsLocationItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	distributor: { type: Object, default: null },
	plantsList: { type: Array, default: () => [] },
	plantsLoading: Boolean,
	isMobile: Boolean,
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	plants_ids: null,
	country: '',
	state: '',
	city: '',
	address: '',
});

const rules = {
	plants_ids: required,
	country: required,
	state: required,
	city: required,
	address: required,
};

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
