<template>
	<div class="add-to-favorites-button-content" @click.stop>
		<ElPopover
			placement="bottom"
			popper-class="favorites-popover"
			trigger="hover"
			:close-delay="100"
			:tabindex="-1"
		>
			<template #default>
				<div class="favorites-options" tabindex="-1">
					<div
						v-for="option in availableOptions"
						:key="option.id"
						class="favorites-option"
						@click.stop="handleFavoriteClick(option.id)"
					>
						<ElIcon :style="{ color: option.color }">
							<component :is="getOptionIcon(option.id)" />
						</ElIcon>
						<span>{{ option.alt_label }}</span>
					</div>
				</div>
			</template>

			<template #reference>
				<div class="favorites-icon-wrapper">
					<ElIcon :style="{ color: buttonIconColor }">
						<StarFilled v-if="isFavorite" />
						<Star v-else />
					</ElIcon>
				</div>
			</template>
		</ElPopover>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { ElIcon, ElPopover } from 'element-plus';
import { Star, StarFilled } from '@element-plus/icons-vue';

import { SUBJECT_TYPES, subjectTypesList } from '@/constants/global';
import { findItemBy } from '@/helpers';
import { useAuthStore } from '@/stores/AuthStore';

defineOptions({ name: 'AddToFavoriteButton' });

const props = defineProps({
	propsData: { type: Object, required: true },
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();

const isFavorite = computed(() => props.propsData.is_my_favorite || props.propsData.is_company_favorite);
const buttonIconColor = computed(() => {
	if (isFavorite.value) {
		let subject;

		if (props.propsData.is_my_favorite) {
			subject = SUBJECT_TYPES.USER;
		}
		if (props.propsData.is_company_favorite) {
			subject = SUBJECT_TYPES.COMPANY;
		}
		return findItemBy('id', subject, subjectTypesList())?.color || '';
	}
	return '';
});
const canAddCompanyFavorite = computed(() => authStore.hasAccessTo(['edit_plants', 'create_plants'], 'some'));
const availableOptions = computed(() =>
	subjectTypesList().filter((option) => {
		if (option.id === SUBJECT_TYPES.COMPANY) {
			return canAddCompanyFavorite.value;
		}
		return true;
	}),
);

const getOptionIcon = (subjectType) => {
	const optionIsFavorite =
		subjectType === SUBJECT_TYPES.USER
			? props.propsData.is_my_favorite
			: props.propsData.is_company_favorite;

	return optionIsFavorite ? StarFilled : Star;
};

const handleFavoriteClick = (subjectType) => {
	emit('event', {
		eventName: 'handleAddToFavorites',
		data: {
			row: props.propsData,
			subjectType,
		},
		onward: true,
	});
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

			.el-icon {
				font-size: 18px;
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

		.el-icon {
			font-size: 18px;
		}
	}
}
</style>
