<template>
	<div class="request-tab-container specifications-block-wrapper">
		<div class="mrow flex wrap big-padding">
			<div class="block-item images-block mcol-xs-12 mcol-sm-6 mcol-xlg-4">
				<div class="card">
					<div class="card-header">
						<div class="title semi-bold uppercase">{{ tt('IMAGE') }}</div>
					</div>
					<div class="card-content">
						<div class="imgWrapper">
							<img :src="pictureUrl || equipmentMockSrc" alt="img error" />
						</div>
					</div>
				</div>
			</div>

			<div class="info-block mcol-xs-12 mcol-sm-6 mcol-xlg-3">
				<div class="mrow flex big-padding">
					<div class="block-item specifications-block">
						<div class="card">
							<div class="card-header">
								<div class="title semi-bold uppercase">{{ tt('SPECIFICATIONS') }}</div>
							</div>
							<div class="card-content">
								<ul class="info-list main">
									<li v-for="item in specificationsList" :key="`spec-${item.label}`">
										<span class="label">{{ `${item.label}:` }}</span>
										<span class="value">{{ item.value }}</span>
									</li>
								</ul>
							</div>
						</div>
					</div>

					<div class="block-item">
						<CrossoverBlock
							:crossoverList="crossoverList.mainType"
							:crossoverLoading="crossoverLoading"
							:equipmentData="equipmentData"
							:equipmentTypeName="equipmentData.equipment_type_name"
						/>
					</div>

					<div v-if="equipmentSubType" class="block-item">
						<CrossoverBlock
							:crossoverList="crossoverList.subType"
							:crossoverLoading="crossoverLoading"
							:equipmentData="equipmentData"
							:equipmentTypeName="equipmentSubType.name"
						/>
					</div>
				</div>
			</div>

			<div v-if="canCreateDashboard" class="request-block mcol-xs-12 mcol-xlg-5">
				<div class="mrow flex wrap big-padding">
					<div class="block-item mcol-xs-12 mcol-sm-5 mcol-xlg-12">
						<div class="card">
							<div class="card-header">
								<div class="title semi-bold uppercase">
									{{ tt('phrases.ONE_CLICK_REQUEST') }}
								</div>
							</div>
							<div class="card-content relative">
								<VueElementLoading
									:active="itemSaving"
									spinner="ring"
									:text="` ${tt('saving')}...`"
									background-color="rgba(255, 255, 255, .85)"
								/>

								<el-button
									type="primary"
									native-type="button"
									class="item-action-button"
									@click="validateForm('one-click')"
								>
									<span class="uppercase">{{ tt('phrases.ONE_CLICK_REQUEST') }}</span>
								</el-button>
							</div>
						</div>
					</div>

					<div class="block-item mcol-xs-12 mcol-sm-7 mcol-xlg-12">
						<div class="card">
							<div class="card-header">
								<div class="title semi-bold uppercase">{{ requestTypeName }}</div>
							</div>

							<div class="card-content relative">
								<VueElementLoading
									:active="itemSaving"
									spinner="ring"
									:text="` ${tt('saving')}...`"
									background-color="rgba(255, 255, 255, .85)"
								/>
								<el-form
									ref="itemFormRef"
									class="item-edit-form"
									:model="formData"
									:rules="rules"
									label-position="left"
								>
									<el-form-item prop="vendor_ids" :label="tt('Vendors')">
										<div class="flex mrow">
											<div class="mcol-xs-10 relative">
												<SimpleSpinner :active="vendorsLoading" />
												<el-select
													v-model="formData.vendor_ids"
													multiple
													:disabled="!vendorsList.length"
													:placeholder="`${tt('Select')} ${tt('vendors')}`"
												>
													<el-option
														v-for="item in vendorsList"
														:key="`vendor_ids-${item.id}`"
														:label="item.name"
														:value="item.id"
													/>
												</el-select>
											</div>
											<div v-if="canCreateDashboard" class="mcol-xs-2">
												<el-button
													class="create-button"
													type="success"
													@click="createVendor"
												>
													<i class="icomoon icon-plus"></i>
												</el-button>
											</div>
										</div>
									</el-form-item>

									<el-form-item>
										<el-button
											type="primary"
											native-type="button"
											class="item-action-button"
											@click="validateForm"
										>
											<span class="uppercase">{{ tt('SUBMIT') }}</span>
										</el-button>
									</el-form-item>
								</el-form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElNotification } from 'element-plus';

import { api_request } from '@/api/request_provider';
import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { EQUIPMENT_IMG_TYPES, RFQS_TYPES, rfqsTypesList } from '@/constants/global';
import { findItemBy, prepareSubmitData } from '@/helpers';
import { Lang } from '@/localization';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import VueElementLoading from '@/components/common/VueElementLoading.vue';
import equipmentMockSrc from '@/assets/img/equipment_mock.jpg';
import CrossoverBlock from './CrossoverBlock.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'EquipmentQuoteTab' });

const props = defineProps({
	equipmentData: { type: Object, required: true },
	crossoverList: { type: Object, default: () => ({}) },
	crossoverLoading: Boolean,
});
const emit = defineEmits(['event']);

const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const itemFormRef = ref(null);
const vendorsLoading = ref(false);
const vendorsList = ref([]);
const itemSaving = ref(false);
const formData = reactive({
	equipment_id: null,
	is_one_click: false,
	vendor_ids: [],
});

const canCreateDashboard = computed(() => authStore.hasAccessTo(['create_dashboard']));
const equipmentSubType = computed(() => props.equipmentData.equipmentSubType || null);
const rules = Object.freeze({});
const specificationsItemsList = Object.freeze([
	{ label: 'Brand', prop: 'brand_name' },
	{ label: 'Part_number', prop: 'brand_model_name' },
	{ label: 'Location', prop: 'location_name' },
	{ label: 'Specs', prop: '' },
]);
const specificationsList = computed(() =>
	translate(
		specificationsItemsList
			.map((item) => {
				const value = props.equipmentData[item.prop];
				return value !== undefined ? { label: item.label, value } : false;
			})
			.filter(Boolean),
	),
);
const requestType = computed(() => route.meta.request_type);
const requestTypeName = computed(() => {
	const item = findItemBy('id', requestType.value, rfqsTypesList()) || {};
	return item.id === RFQS_TYPES.FOR_BUY ? tt('QUOTE') : tt('SERVICE');
});
const pictureUrl = computed(() => {
	const picture = findItemBy('type', EQUIPMENT_IMG_TYPES.EQUIPMENT, props.equipmentData.pictures || []);
	return picture?.full_thumb_file_name || picture?.full_file_name || '';
});

const fetchVendorsRequest = createGetRequest(ENTITIES.PlantsVendors.apiBase);
const requestsToDoList = computed(() => [
	{
		action: fetchVendorsRequest,
		payload: { params: { plantId: props.equipmentData.plant_id } },
		localProp: vendorsList,
		localLoadProp: vendorsLoading,
	},
]);
const { operateRequestsList } = useRequestsList({ requestsToDoList });

const fetchVendors = () => {
	operateRequestsList(requestsToDoList.value);
	globalStore.show_edit_modal({ show: false });
};
const createVendor = () => {
	globalStore.show_edit_modal({
		show: true,
		instanceName: 'PlantsVendors',
		itemName: 'Vendor',
		instanceData: null,
		callback: fetchVendors,
		formComponentFileLoader: () => import('@/views/PlantsVendors/ItemForm.vue'),
	});
};
const validateForm = (method) => {
	itemFormRef.value?.validate((valid) => {
		if (!valid) {
			ElNotification({
				type: 'warning',
				title: tt('phrases.form_isnt_ready'),
				message: tt('phrases.Please_check_fields_errors_first'),
			});
			return;
		}

		if (method === 'one-click' || formData.vendor_ids.length) {
			submitForm(method);
			return;
		}

		ElNotification({
			type: 'warning',
			title: '',
			message: tt('phrases.there_are_no_vendors_for_request_selected'),
		});
	});
};
const submitForm = (method) => {
	itemSaving.value = true;
	const data = {
		id: null,
		...formData,
		type: requestType.value,
		equipment_id: props.equipmentData.id,
		is_one_click: method === 'one-click',
	};

	api_request('/rfqs', {
		method: 'POST',
		data: prepareSubmitData(data),
		resultMessage: { text: tt('phrases.Quote_send') },
	})
		.then(() => {
			emit('event', { eventName: 'rfqSuccess' });
		})
		.finally(() => {
			itemSaving.value = false;
		});
};
</script>
