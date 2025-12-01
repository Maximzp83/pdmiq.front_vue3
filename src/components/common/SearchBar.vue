<template>
	<div class="search-bar relative">
		<CustomInput
			@input="searchSubmit"
			:value="query"
			:placeholder="`${tt('search')}...`"
			prefixIcon="icomoon icon-search"
		/>

		<button
			type="button"
			v-show="clearable && query"
			class="resetButton"
			@click="resetSearch"
		>
			<i class="icomoon icon-cross" />
		</button>
	</div>
</template>

<script setup>
	import { Lang } from '@/localization';
	const { tt } = Lang;
	
	import CustomInput from '@/components/form/CustomInput.vue';

	const props = defineProps({
		clearable: { type: Boolean, default: false },
		query: { type: [String, Number, null], default: '' },
		options: { type: Object, default: () => ({}) }
	});

	const emit = defineEmits(['submit']);

	const searchSubmit = str => {
		if (str !== props.query) {
			emit('submit', { q: str, page: 1 });
		}
	};

	const resetSearch = () => {
		searchSubmit('');
	};
</script>
