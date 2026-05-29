<template>
	<div class="work-order-for-print-container hidden-print-source">
		<div class="span-block semi-bold uppercase">{{ tt('Requisition') }} {{ tt('Plant') }} {{ tt('Details') }}</div>
		<div>{{ tt('Work_Order') }} #: {{ orderData?.id || '-' }}</div>
		<div>{{ tt('Requestor') }}: {{ orderData?.requisitionUser?.full_name || '-' }}</div>
		<div>{{ tt('Details') }}: {{ orderData?.requisition_details || '-' }}</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'RequisitionWorkOrderReportForPrint' });

defineProps({
	orderData: { type: Object, default: () => ({}) },
});
</script>
