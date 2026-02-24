<template>
	<div class="add-to-favorites-button-content">
		<el-popover
			placement="bottom"
			popper-class="favorites-popover"
			trigger="hover"
			:close-delay="100"
			:tabindex="-1"
		>
			<div class="favorites-options" tabindex="-1">
				<div
					v-for="option in availableOptions"
					:key="option.id"
					class="favorites-option"
					@click="handleFavoriteClick(option.id)"
				>
					<i :style="`color: ${option.color}`" :class="getOptionIcon(option.id)"></i>
					<span>{{ option.alt_label }}</span>
				</div>
			</div>

			<div slot="reference" class="favorites-icon-wrapper">
				<i v-if="isFavorite" :style="`color: ${buttonIconColor}`" class="el-icon-star-on"></i>
				<i v-else class="el-icon-star-off"></i>
			</div>
		</el-popover>
	</div>
</template>

<script>
import { SUBJECT_TYPES, subjectTypesList } from '@/constants/global';
import { findItemBy } from '@/helpers';

export default {
	props: {
		propsData: { type: Object, required: true },
	},

	computed: {
		SUBJECT_TYPES: () => SUBJECT_TYPES,

		isFavorite() {
			return this.propsData.is_my_favorite || this.propsData.is_company_favorite;
		},

		buttonIconColor() {
			if (this.isFavorite) {
				let subject;

				if (this.propsData.is_my_favorite) {
					subject = SUBJECT_TYPES.USER;
				}
				if (this.propsData.is_company_favorite) {
					subject = SUBJECT_TYPES.COMPANY;					
				}
				return findItemBy('id', subject, subjectTypesList()).color;	
			}
			return '';
		},

		canAddCompanyFavorite() {
			return this.$hasAccessTo(['edit_plants', 'create_plants'], 'some');
		},

		availableOptions() {
			return subjectTypesList().filter(option => {
				if (option.id === SUBJECT_TYPES.COMPANY) {
					return this.canAddCompanyFavorite;
				}
				return true;
			});
		}
	},

	methods: {
		getOptionIcon(subjectType) {
			const isFavorite = subjectType === SUBJECT_TYPES.USER
				? this.propsData.is_my_favorite
				: this.propsData.is_company_favorite;

			return isFavorite ? 'el-icon-star-on' : 'el-icon-star-off';
		},

		handleFavoriteClick(subjectType) {
			this.$emit('event', {
				eventName: 'handleAddToFavorites',
				data: {
					row: this.propsData,
					subjectType
				},
				onward: true
			});
		}
	}
};
</script>

<style lang="scss">
.favorites-popover {
	min-width: 120px !important;
	padding: 8px 0 !important;

	.favorites-options {
		.favorites-option {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px 16px;
			cursor: pointer;
			transition: background-color 0.2s;

			&:hover {
				background-color: #f5f7fa;
			}

			.el-icon-star-on {
				font-size: 22px;
			}

			i {
				font-size: 18px;
				color: #f7ba2a;
			}

			span {
				text-transform: capitalize;
				font-size: 14px;
				color: #606266;
			}
		}
	}
}

.add-to-favorites-button-content {
	.favorites-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>
