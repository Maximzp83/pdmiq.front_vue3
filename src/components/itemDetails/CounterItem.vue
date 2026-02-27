<template>
	<div :class="['counter-item mcol-xs-311 fluid pointer']" @click="scrollTo">
		<div class="card relative">
			<div class="card-content">
				<div class="flex align-center item-img">
					<i :class="['icomoon', `icon-${counterData.iconName}`]" />
				</div>
				<div class="label uppercase semi-bold">{{ counterData.title }}</div>
				<div class="count">{{ counterData.count }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { scrollToElement } from '@/helpers/specialHelpers';

defineOptions({
	name: 'CounterItem',
});

const props = defineProps({
	counterData: {
		type: Object,
		required: true,
	},
	countersLoading: Boolean,
});

const scrollTo = () => {
	scrollToElement(props.counterData.sectionClass);
};
</script>
