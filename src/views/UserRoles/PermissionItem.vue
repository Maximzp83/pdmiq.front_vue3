<template>
	<el-form
		ref="itemFormRef"
		class="relative"
		:model="formData"
		:rules="rules"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<div class="flex mrow align-center">
			<div class="el-form-item mcol-xs-12 mcol-sm-3 capitalize">
				{{ itemData.name }}
			</div>

			<el-form-item class="mcol-xs-12 mcol-sm-1" prop="is_viewing">
				<el-switch
					v-model="formData.is_viewing"
					:active-value="1"
					:inactive-value="0"
					@change="handleIsView"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.is_viewing && !isAPI"
				class="mcol-xs-12 mcol-sm-2"
				prop="is_creating"
			>
				<el-checkbox v-model="formData.is_creating" :true-value="1" :false-value="0">
					{{ tt('creating') }}
				</el-checkbox>
			</el-form-item>

			<el-form-item
				v-if="formData.is_viewing && !isAPI"
				class="mcol-xs-12 mcol-sm-2"
				prop="is_updating"
			>
				<el-checkbox v-model="formData.is_updating" :true-value="1" :false-value="0">
					{{ tt('updating') }}
				</el-checkbox>
			</el-form-item>

			<el-form-item
				v-if="formData.is_viewing && !isAPI"
				class="mcol-xs-12 mcol-sm-2"
				prop="is_deleting"
			>
				<el-checkbox v-model="formData.is_deleting" :true-value="1" :false-value="0">
					{{ tt('deleting') }}
				</el-checkbox>
			</el-form-item>

			<el-form-item
				v-if="formData.is_viewing && (isCompany || isPlant)"
				class="mcol-xs-12 mcol-sm-2"
				prop="is_archiving"
			>
				<el-checkbox v-model="formData.is_archiving" :true-value="1" :false-value="0">
					{{ tt('archiving') }}
				</el-checkbox>
			</el-form-item>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { MENU_TYPES } from '@/constants/menuItems';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'UserRolePermissionItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	app_section: null,
	is_viewing: 0,
	is_creating: 0,
	is_updating: 0,
	is_deleting: 0,
	is_archiving: 0,
});

const rules = Object.freeze({});
const isCompany = computed(() => formData.value.app_section === MENU_TYPES.COMPANIES);
const isPlant = computed(() => formData.value.app_section === MENU_TYPES.PLANTS);
const isAPI = computed(() => formData.value.app_section === MENU_TYPES.CLIENT_API);

const handleIsView = (val) => {
	if (!val) {
		formData.value.is_creating = 0;
		formData.value.is_updating = 0;
		formData.value.is_deleting = 0;
		formData.value.is_archiving = 0;
	}
};

const { isMobile, validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
