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
					background
					layout="prev, pager, next"
					:current-page="currentPage"
					@update:current-page="applyPage"
					:page-size="Number(meta?.per_page) || 10"
					@update:page-size="() => {}"
					:pager-count="5"
					:total="Number(meta?.total) || 0"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { scrollToElement } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { computed } from 'vue';

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

const applyPage = (page) => {
	emit('setFilters', { page }, { preventResetPage: true });

	if (props.disableScroll) return;

	setTimeout(() => {
		scrollToElement(props.scrollTo || '.view-list-wrapper');
	}, props.scrollToTimeout || 10);
};

const currentPage = computed({
	get: () => Number(props.filters?.page) || 1,
	/*set: (page) => {
		applyPage(page);
	},*/
});
</script>

<style lang="scss" scoped>
@use "@/assets/sass/variables" as *;

:deep(.el-pagination) {
	padding: 0;
	margin: 0 -5px;

	button,
	.el-pager > li {
		border-radius: 50% !important;
		height: 35px !important;
		width: 35px !important;
		line-height: 35px !important;
			// background-color: $primary-color !important;


		&:hover {
			&:not(.disabled):not(.is-active) {
				color: $primary-color !important;
			}
		}

		&:not(.disabled).is-active {
			background-color: $primary-color !important;
		}
	}

	button {
		> i {
			line-height: 35px;
			transition: none !important;
			text-align: center;

			svg {
				display: block;
				width: 100%;
			}
		}

		&[disabled='disabled'] {
			pointer-events: none;
		}

		&.btn-next {
			margin-right: 0 !important;
		}
	}
}

@media (min-width: 768px) {
	.pagination-container {
		:deep(.el-pagination) {
			text-align: right;
		}
	}
}
</style>
