<template>
	<div class="charts-preloader">
		<VueElementLoadingWrapper
			v-if="showPreloader"
			:isLoading="showPreloader"
			:itemsName="tt('chart')"
		/>
		<div v-if="showMock" class="page-title bold gray-color outside-bg-addition">
			{{ tt('phrases.no_data') }}
		</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({
	name: 'ChartsPreloader',
});

defineProps({
	showMock: Boolean,
	showPreloader: Boolean,
});
</script>
