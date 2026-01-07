<template>
	<div class="pagination-container">
		<div class="mrow flex wrap align-center">
			<div class="mcol-xs-12 mcol-sm-4" v-if="meta.from">
				<div>
					{{
						`${tt('Showing')} ${meta.from} ${tt('to')} ${meta.to} ${tt('of')} ${
							meta.total
						}`
					}}
					<span class="capitalize"> {{ itemsName.mult }}</span>
				</div>
			</div>

			<div class="mcol-xs-12 mcol-sm-8 fluid text-right">
				<el-pagination
					@current-change="setFilters"
					background
					:current-page="filters.page"
					:page-size="meta.per_page"
					:pager-count="5"
					layout="prev, pager, next"
					:total="meta.total"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { scrollToElement } from '@/helpers/specialHelpers';

export default {
	props: {
		itemsName: { type: Object, required: true },
		meta: { type: Object, required: true },
		filters: { type: Object, required: true },
		scrollTo: String,
		disableScroll: Boolean,
		scrollToTimeout: null
	},

	methods: {
		setFilters(page) {
			this.$emit('setFilters', { page: page }, [], { preventResetPage: true });
			setTimeout(() => {
				scrollToElement(this.scrollTo || '.view-list-wrapper');
			}, this.scrollToTimeout || 10);
			/*document.querySelector('.view-list-wrapper').scroll({
				top: 0,
				left: 0,
				behavior: 'smooth'
			});*/
		}
	}
};
</script>
