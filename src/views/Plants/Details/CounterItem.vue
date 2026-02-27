<template>
	<div class="counter-item fluid">
		<div class="card relative">
			<div class="card-content">
				<div class="flex mrow align-center">
					<div>
						<div class="label uppercase semi-bold">{{ tt(counterData.title) }}</div>
						<div v-if="!disableViewAll" class="view-all-button" @click="handleViewAll">
							{{ tt('phrases.View_All') }}
						</div>
					</div>
					<div class="count">{{ counterData.count }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';

const { tt } = Lang;

const props = defineProps({
	counterData: { type: Object, required: true },
	countersLoading: Boolean,
	disableViewAll: Boolean,
});

const emit = defineEmits(['event']);

const handleViewAll = () => {
	emit('event', {
		eventName: 'viewTable',
		data: props.counterData,
		onward: true,
	});
};
</script>
