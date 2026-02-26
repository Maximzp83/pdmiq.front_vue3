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

<script setup>
import { scrollToElement } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';

const { tt } = Lang;

const props = defineProps({
	itemsName: { type: Object, required: true },
	meta: { type: Object, required: true },
	filters: { type: Object, required: true },
	scrollTo: { type: String, default: '' },
	disableScroll: { type: Boolean, default: false },
	scrollToTimeout: { type: Number, default: 10 },
});

const emit = defineEmits(['setFilters']);

const setFilters = (page) => {
	emit('setFilters', { page }, [], { preventResetPage: true });

	if (props.disableScroll) return;

	setTimeout(() => {
		scrollToElement(props.scrollTo || '.view-list-wrapper');
	}, props.scrollToTimeout || 10);
};
</script>
