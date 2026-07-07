<template>
	<div class="work-order-for-print-container">
		<div class="mcontainer">
			<div class="title page-title semi-bold">Work Order #{{ orderData.id }}</div>

			<div class="work-order-details-item card content-row">
				<div class="card-header filled_2 flex align-center">
					<div class="step-number bold span-block">
						<span>1</span>
					</div>

					<div class="span-block semi-bold uppercase">Requisition Plant Details</div>
				</div>

				<div class="card-content">
					<div class="content-row content-block columns_2">
						<div
							v-for="item in infoItemsList1"
							:key="`item-${item.label}`"
							class="details-row"
						>
							<ReportValueCell :itemData="orderData" :cellSettings="item" />
						</div>
					</div>
				</div>
			</div>

			<div class="work-order-details-item card content-row">
				<div class="card-header filled_2 flex align-center">
					<div class="step-number bold span-block">
						<span>2</span>
					</div>

					<div class="span-block semi-bold uppercase">Fab Plant Details</div>
				</div>

				<div class="card-content">
					<div class="mrow flex">
						<div class="mcol-xs-6 content-block">
							<div
								v-for="item in infoItemsList2"
								:key="`item-${item.label}`"
								class="details-row"
							>
								<ReportValueCell :itemData="orderData" :cellSettings="item" />
							</div>
						</div>

						<div class="mcol-xs-6">
							<div class="card">
								<div class="card-header">
									<div class="title semi-bold capitalize">
										{{ tt('Actual_Cost') }}
									</div>
								</div>

								<div class="card-content main filled">
									<ul class="dots-in-text">
										<li v-for="item in orderData.actualMaterials || []" :key="`acm-${item.id}`">
											<span class="label">{{ item.name }}</span>
											<span class="value">${{ item.price }}</span>
										</li>
									</ul>
								</div>

								<div class="card-content filled">
									<ul class="dots-in-text bold">
										<li>
											<span class="label capitalize">{{ tt('Actual_Cost') }}</span>
											<span class="value">{{ orderData.execution_cost }}$</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import {
	REQUISITION_STATUSES_TYPES,
	requisitionCategoriesList,
	requisitionWorkTypesList,
	siteVisitOptionsList,
} from '@/constants/global';
import { cleanDateString, formatTime } from '@/helpers';
import { Lang } from '@/localization';

import ReportValueCell from './ReportValueCell.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionWorkOrderReportForPrint' });

defineProps({
	orderData: { type: Object, default: () => ({}) },
});

const infoItemsList1 = computed(() =>
	Object.freeze([
		{
			prop: 'complete_at',
			label: 'Requested Date',
			icon: 'el-icon-date',
			meta: { prepareValue: { localMethod: cleanDateString } },
		},
		{
			label: 'Requestor',
			prop: 'requisitionUser.full_name',
			icon: 'icomoon icon-jam_tools',
		},
		{
			label: 'Requestor Plant',
			prop: 'requisitionPlant.name',
			icon: 'icomoon icon-factory',
		},
		{
			label: 'Category',
			prop: 'category',
			icon: 'icomoon icon-category',
			meta: { getItemValue: { prop: 'name', list: requisitionCategoriesList() } },
		},
		{
			label: 'Work Type',
			prop: 'work_type',
			icon: 'icomoon icon-work_type',
			meta: { getItemValue: { prop: 'name', list: requisitionWorkTypesList() } },
		},
		{
			label: 'Equipment Details',
			prop: 'equipment_details',
			icon: 'el-icon-setting',
		},
		{
			label: 'Site Visit Required?',
			prop: 'site_visit',
			icon: 'icomoon icon-world',
			meta: { getItemValue: { prop: 'name', list: siteVisitOptionsList } },
		},
		{
			label: 'Budget',
			prop: 'proposed_cost',
			valuePrefix: '$',
			icon: 'icomoon icon-money',
		},
		{
			label: 'Details',
			prop: 'requisition_details',
			icon: 'icomoon icon-doc_2',
		},
		{
			label: 'Attachments',
			prop: 'newOrderAttachments',
			icon: 'icomoon icon-clip',
			meta: { fromArray: { subProp: 'full_file_name', delimeter: ', ' } },
		},
	]),
);

const infoItemsList2 = computed(() =>
	Object.freeze([
		{
			label: 'Hours',
			prop: 'actual_time',
			icon: 'icomoon icon-clock_2',
			meta: { prepareValue: { localMethod: formatTime, args: 'h:m' } },
			conditionSettings: {
				conditions: [
					{
						prop: 'status',
						array_method: 'some',
						method: '==',
						control_value: [
							REQUISITION_STATUSES_TYPES.COMPLETED,
							REQUISITION_STATUSES_TYPES.APPROVED,
							REQUISITION_STATUSES_TYPES.IN_WORK,
						],
						falseValue: '-',
					},
				],
			},
		},
		{
			label: 'Additional Work Order Details',
			prop: 'fab_shop_manager_notes',
			icon: 'icomoon icon-doc_2',
		},
	]),
);
</script>
