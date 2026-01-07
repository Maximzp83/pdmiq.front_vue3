<template>
	<div class="search-bar relative">
		<!-- <form class="relative" @submit.prevent="searchSubmit"> -->
		<!-- @blur="searchSubmit" -->
		<CustomInput
			@input="e => searchSubmit(e)"
			:value="query"
			:placeholder="`${tt('search')}...`"
			:prepend="options.prepend"
		/>

		<button
			type="button"
			v-show="clearable && query"
			class="resetButton"
			@click="resetSearch"
		>
			<i class="icomoon icon-cross" />
		</button>
		<!-- </form> -->
	</div>
</template>

<script>
export default {
	props: {
		clearable: Boolean,
		query: null,
		options: {
			type: Object,
			default: () => ({})
		}
	},

	data() {
		return {
			// searchQuery: ''
		};
	},
	methods: {
		searchSubmit(str) {
			if (str != this.query) {
				this.$emit('submit', { q: str, page: 1 });
			}
		},

		resetSearch() {
			// this.searchQuery = '';
			this.searchSubmit('');
		}
	}
};
</script>
