<template>
	<div class="view-list-wrapper">
		<PageMockImg :text="tt('phrases.no_data')" />
	</div>
</template>

<script setup>
import { Lang } from '@/localization';
import PageMockImg from '@/components/common/PageMockImg.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardROIAnalysisItemsList' });
</script>
