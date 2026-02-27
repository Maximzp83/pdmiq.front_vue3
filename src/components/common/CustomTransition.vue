<template>
	<div
		v-if="mode === 'trigger'"
		:class="['custom-transition-container trigger-mode', { 'fade-out': fadeOut }, name]"
	>
		<slot></slot>
	</div>

	<transition-group
		v-else
		class="custom-transition-container"
		:name="name"
		:tag="tag"
		:css="false"
		@before-enter="onBeforeEnter"
		@enter="onEnter"
		@leave="onLeave"
	>
		<slot></slot>
	</transition-group>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
	name: { type: String, default: 'standard-fade-250' },
	tag: { type: String, default: 'div' },
	mode: { type: String, default: 'group' },
	trigger: { type: null, default: null },
	startingElementIdx: { type: null, default: null },
});

const fadeOut = ref(false);
const rootEl = ref(null);

const duration = computed(() => {
	const parts = props.name.split('-');
	const value = Number(parts[parts.length - 1]);
	return Number.isNaN(value) ? 250 : value;
});

const onBeforeEnter = (el) => {
	el.classList.add('display-none');
};

const onEnter = (el, done) => {
	setTimeout(() => {
		el.classList.remove('display-none');
		done();
	}, duration.value);

	setTimeout(() => {
		el.classList.add('fade-in');
	}, duration.value + 25);
};

const onLeave = (el, done) => {
	el.classList.remove('fade-in');
	setTimeout(() => {
		done();
	}, duration.value);
};

watch(
	() => props.trigger,
	() => {
		fadeOut.value = true;
		setTimeout(() => {
			fadeOut.value = false;
		}, duration.value);
	}
);

onMounted(() => {
	if (props.mode !== 'group') {
		return;
	}

	nextTick(() => {
		setTimeout(() => {
			if (!rootEl.value) return;
			const startIdx = props.startingElementIdx || 0;
			for (let i = 0; i < rootEl.value.children.length; i++) {
				const el = rootEl.value.children[i];
				el.classList.add(props.name);
				if (startIdx === i) {
					el.classList.add('fade-in');
				}
			}
		}, 200);
	});
});
</script>
