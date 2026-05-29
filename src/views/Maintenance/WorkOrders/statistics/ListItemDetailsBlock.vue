<template>
	<div class="card-content text-center gray-color">
		{{ tt('phrases.to_view_the_information_of_the_work_order_click_on_the_preview_button_from_the_list_of_work_orders') }}
	</div>
</template>

<script setup>
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'WorkOrdersStatisticsListItemDetailsBlock',
});
</script>
