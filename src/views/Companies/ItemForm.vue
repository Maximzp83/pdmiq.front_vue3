<template>
	<div class="edit-form-container company-form">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<CustomTransition :startingElementIdx="startingElementIdx">
				<div
					v-show="!hideMainTab && activeTab?.prop === 'mainTab'"
					key="tab-0"
					class="tab-container standard-fade-250"
				>
					<div :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
						<el-form-item :label="`${tt('company')} ${tt('name')}`" prop="name">
							<CustomInput v-model="formData.name" :placeholder="tt('name')" />
						</el-form-item>

						<el-form-item :label="tt('Address')" prop="address">
							<CustomInput v-model="formData.address" :placeholder="tt('address')" />
						</el-form-item>

						<el-form-item :label="tt('Phone')" prop="phone_number">
							<CustomInput v-model="formData.phone_number" :placeholder="tt('phone')" />
						</el-form-item>

						<el-form-item :label="tt('Comments')" prop="comments">
							<CustomInput
								v-model="formData.comments"
								type="textarea"
								:placeholder="tt('comments')"
							/>
						</el-form-item>

						<el-form-item
							v-if="canArchiveCompanies"
							:label="tt('Archive')"
							prop="is_archived"
						>
							<el-switch v-model="formData.is_archived" :active-value="1" :inactive-value="0" />
						</el-form-item>
					</div>
				</div>

				<div
					v-show="activeTab?.prop === 'menuTab'"
					key="tab-1"
					class="tab-container standard-fade-250 menu-tab"
				>
					<div class="mrow flex wrap">
						<div
							v-for="category in menuCategories"
							:key="`category-${category.category_label}`"
							class="mcol-xs-12 mcol-sm-4"
						>
							<div class="category-name capitalize">{{ category.name }}</div>

							<div class="menu-list">
								<div
									v-for="(item, idx) in formData.menu_items"
									v-show="item.category_name === category.category_label"
									:key="`idx-${idx}_menu-${item.id}`"
									class="menu-item"
								>
									<el-checkbox v-model="item.on" class="capitalize">
										{{ item.label }}
									</el-checkbox>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					v-show="activeTab?.prop === 'SSOTab'"
					key="tab-2"
					class="tab-container standard-fade-250 width"
				>
					<div class="section-row">
						<div class="content-row article-title">
							<b>{{ tt('phrases.Add_IndustrialMatrix_to_Azure_AD') }}</b>
						</div>

						<div class="content-row flex">
							<div class="step-number bold span-block"><span>1</span></div>
							<div
								class="span-block"
								v-html="`${tt('phrases.Open_your_Azure_AD_administrator_account_and')} <b>${tt('phrases.create_a_new_non_gallery_app')}.</b>`"
							/>
						</div>

						<div class="content-row flex">
							<div class="step-number bold span-block"><span>2</span></div>
							<div class="span-block">
								{{ tt('Enable') }} <b>{{ tt('SAML') }}</b>
								{{ tt('phrases.for_the_new_application') }}.
							</div>
						</div>

						<div class="content-row flex">
							<div class="step-number bold span-block"><span>3</span></div>
							<div class="span-block">
								In the <b>{{ tt('phrases.Basic_SAML_Configuration') }}</b>
								{{ tt('phrases.section_enter_the_following_information') }}:
							</div>
						</div>

						<div class="content-row">
							<ul class="disc">
								<li>
									<b>{{ tt('phrases.identifier_object_id') }}</b>
									<span class="value-field bold">
										<SimpleSpinner :active="hostLoading" />
										<span>{{ identifierURL }}</span>
									</span>
									<i class="icomoon icon-copy" @click="handleCopy(identifierURL)" />
								</li>
								<li>
									<b>{{ tt('phrases.reply_url_claims_service_url') }}</b>
									<span class="value-field bold">
										<SimpleSpinner :active="hostLoading" />
										<span>{{ loginURL }}</span>
									</span>
									<i class="icomoon icon-copy" @click="handleCopy(loginURL)" />
								</li>
							</ul>
						</div>
					</div>

					<div
						class="section-row"
						:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
					>
						<div class="content-row article-title">
							<b>{{ tt('phrases.paste_parameters_from_azure_and_click_button_save') }}</b>
						</div>

						<el-form-item
							class="content-row"
							:label="tt('phrases.azure_ad_identifier')"
							prop="saml2_idp_entity_id"
						>
							<CustomInput
								v-model="formData.saml2_idp_entity_id"
								:placeholder="`${tt('entity')} ${tt('id')}`"
							/>
						</el-form-item>

						<el-form-item :label="`${tt('Login')} URL`" prop="saml2_idp_sso_url">
							<CustomInput v-model="formData.saml2_idp_sso_url" placeholder="sso url" />
						</el-form-item>

						<el-form-item :label="`${tt('Logout')} URL`" prop="saml2_idp_sl_url">
							<CustomInput v-model="formData.saml2_idp_sl_url" placeholder="sl url" />
						</el-form-item>

						<el-form-item
							:label="`${tt('Certificate')} (Base64)`"
							prop="saml2_idp_base64_certificate"
						>
							<FileUploadBlock
								ref="fileUploadBlockRef"
								uploadBlockType="files-list"
								hidePreview
								deleteFileId
								keepFilePath
								filePropName="saml2_idp_base64_certificate"
								accept=".cer"
								:buttonText="tt('phrases.upload_file')"
								:pictures="itemCertificateFile"
							/>
						</el-form-item>
					</div>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				v-if="!fromModal"
				:className="activeTab?.prop === 'menuTab' ? 'no-left-margin' : ''"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { menuItems } from '@/constants/menuItems';
import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useNotify } from '@/composables/useNotify';
import { useAuthStore } from '@/stores/AuthStore';

import CustomTransition from '@/components/common/CustomTransition.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
// import CustomInput from '@/components/form/CustomInput.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';

const { tt, translate } = Lang;
const { Notify } = useNotify();

defineOptions({
	name: 'CompaniesItemForm',
});

const props = defineProps(buildProps({
	activeTab: { type: Object, default: () => ({ prop: 'mainTab' }) },
	tabsList: { type: Array, default: () => [] },
	hideMainTab: Boolean,
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();

const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const hostLoading = ref(false);
const loginURL = ref('');
const identifierURL = ref('');
const startingElementIdx = ref(0);

const formData = ref({
	id: null,
	name: '',
	address: '',
	phone_number: '',
	comments: '',
	saml2_idp_host: '',
	saml2_idp_entity_id: '',
	saml2_idp_sso_url: '',
	saml2_idp_sl_url: '',
	saml2_idp_base64_certificate: undefined,
	menu_items: [],
	is_archived: 0,
});

const rules = {
	name: required,
	address: required,
	phone_number: required,
};

const canArchiveCompanies = computed(() => authStore.hasAccessTo(['archive_companies']));

const includedMenuItems = computed(() => {
	const result = [];

	menuItems().forEach((item) => {
		if (item.enableInCompanyMenuForm) {
			result.push(item);
			return;
		}

		if (item.children) {
			item.children.forEach((child) => {
				if (child.id && item.enableInCompanyMenuForm) {
					result.push({ ...child, belongs_to_label: item.belongs_to_label });
				}
			});
		}
	});

	return result;
});

const menuCategories = computed(() => translate(menuItems().filter((item) => item.category_label)));

const itemCertificateFile = computed(() => {
	if (props.itemData?.saml2_idp_base64_certificate) {
		return [{ full_file_name: props.itemData.saml2_idp_base64_certificate }];
	}

	return [];
});

const refsMap = computed(() => ({
	FileUploadBlock: fileUploadBlockRef.value,
}));

const {
	validateSubItemsForm,
	resetFormDataBySubItems,
	collectDataFromSubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'FileUploadBlock',
			targetProp: 'saml2_idp_base64_certificate',
			destructure: true,
		},
	])
);

const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'https://api.testmatrix.assetmatrix.com/api';

const syncSsoLinks = () => {
	if (!formData.value.saml2_idp_host) {
		identifierURL.value = '';
		loginURL.value = '';
		return;
	}

	const baseUrl = getApiBaseUrl();
	identifierURL.value = `${baseUrl}/saml2/${formData.value.saml2_idp_host}/metadata`;
	loginURL.value = `${baseUrl}/saml2/${formData.value.saml2_idp_host}/acs`;
};

const generateHost = async () => {
	hostLoading.value = true;

	try {
		const { value } = await api_request.post('/companies/saml2/idp-host', {
			notNotify: true,
		});

		if (value?.id) {
			formData.value.saml2_idp_host = value.id;
			syncSsoLinks();
		}
	} finally {
		hostLoading.value = false;
	}
};

const setupMenuItems = (item) => {
	formData.value.menu_items = translate(
		includedMenuItems.value.map((menuItem) => ({
			id: menuItem.id,
			label: menuItem.name,
			category_name: menuItem.belongs_to_label,
			on: false,
		}))
	);

	if (item?.menu_items?.length) {
		formData.value.menu_items.forEach((menuItem) => {
			const existingItem = findItemBy('id', menuItem.id, item.menu_items);
			if (existingItem) {
				menuItem.on = existingItem.on;
			}
		});
	}
};

const ensureSsoHost = () => {
	if (props.activeTab?.prop !== 'SSOTab') {
		return;
	}

	if (!formData.value.saml2_idp_host) {
		generateHost();
		return;
	}

	syncSsoLinks();
};

const localSetupPage = (item) => {
	setupMenuItems(item);
	ensureSsoHost();
};

const localPrepareSubmitData = (data) => ({
	...data,
	menu_items: (data.menu_items || []).map((item) => ({
		id: item.id,
		on: item.on,
	})),
});

const handleCopy = async (value) => {
	if (!value) return;

	try {
		if (navigator?.clipboard?.writeText) {
			await navigator.clipboard.writeText(value);
		} else {
			const input = document.createElement('textarea');
			input.value = value;
			input.setAttribute('readonly', '');
			input.style.position = 'absolute';
			input.style.left = '-9999px';
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
		}

		Notify({
			type: 'info',
			title: tt('Copied'),
			message: tt('phrases.copied_to_buffer'),
		});
	} catch {
		Notify({
			type: 'warning',
			title: tt('Warning'),
			message: tt('phrases.request_error'),
		});
	}
};

const syncStartingElementIdx = (tabProp) => {
	if (tabProp === 'SSOTab') {
		startingElementIdx.value = 2;
		return;
	}

	if (tabProp === 'menuTab') {
		startingElementIdx.value = 1;
		return;
	}

	startingElementIdx.value = 0;
};

watch(
	() => props.activeTab?.prop,
	(tabProp) => {
		syncStartingElementIdx(tabProp);
		if (tabProp === 'SSOTab') {
			ensureSsoHost();
		}
	},
	{ immediate: true }
);

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Companies',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	localSetupPage,
	subItemsSettings: subItemsSettings.value,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localPrepareSubmitData,
	emit,
});

defineExpose({
	validateForm,
});
</script>
