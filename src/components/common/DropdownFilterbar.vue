<template>
	<div class="dropdown-filterbar-container">
		<div class="flex mrow wrap align-center layout-filterbar content-row">
			<div
				:class="['action-buttons-container', actionButtonsClassName || 'mcol-xs-12 mcol-sm-auto']"
				v-if="showCreateActions"
			>
				<el-button
					v-if="!hideCreate"
					type="primary"
					native-type="button"
					class="item-action-button"
					@click="event('createItem')"
				>
					<span class="capitalize">{{ `${tt('add')} ${itemsName.one || ''}` }}</span>
					<i class="icomoon icon-plus"></i>
				</el-button>

				<el-button
					v-if="!hideDelete"
					type="primary"
					native-type="button"
					class="item-action-button delete-button inverted"
					@click="event('handleDeleteItems')"
				>
					<span class="capitalize">{{ tt('delete') }}</span>
					<i class="icomoon icon-plus rotate"></i>
				</el-button>
			</div>

			<slot name="prefixFilters"></slot>

			<div class="ml-auto filter-item toggle-additional-filters" v-if="!hideToggleButton">
				<el-button
					type="primary"
					native-type="button"
					:class="['action-button inverted', { active: showFilterbar }]"
					:icon="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"
					@click="toggleFilterbar"
				/>
			</div>
		</div>

		<div
			:class="[
				{ 'triangle pos-top-right triangle-shadow': !disableTriangle },
				'content-row',
				{ 'triangle-hide': !showFilterbar }
			]"
		>
			<div :id="filterbarDropdownId" class="hiddenContent height">
				<div class="filterbarDropdownWrapper">
					<div :class="['items-filter-container', { card: !disableCard }]">
						<div class="card-content">
							<div class="content-row">
								<div class="mrow flex primary-container">
									<slot></slot>

									<div class="toggle-additional-filters" v-if="additionalFilters">
										<el-button
											:disabled="disableToggleButton"
											type="primary"
											native-type="button"
											:class="['inverted', { active: showAdditionalFilters }]"
											icon="icomoon icon-settings"
											@click="toggleAdditionalFilters"
										/>
									</div>
								</div>
							</div>

							<div
								id="additionalFiltersDropdown"
								class="content-row additional-container hiddenContent height"
								v-if="additionalFilters"
							>
								<div class="mrow flex filter-items-list">
									<slot name="additionalFilters"></slot>
								</div>
							</div>

							<div class="content-row additional-container" v-if="secondaryFilters">
								<div class="mrow flex filter-items-list">
									<slot name="secondaryFilters"></slot>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { watch, ref } from 'vue';

import { Lang } from '@/localization';
import { dropDown } from '@/helpers/domHelpers';

const { tt } = Lang;

defineOptions({
	name: 'DropdownFilterbar',
});

const props = defineProps({
	filters: { type: Object, default: () => ({}) },
	itemsLoading: Boolean,
	additionalFilters: Boolean,
	secondaryFilters: Boolean,
	disableToggleButton: Boolean,
	showCreateActions: Boolean,
	itemsName: { type: Object, default: () => ({}) },
	hideCreate: Boolean,
	hideDelete: Boolean,
	hideToggleButton: Boolean,
	disableTriangle: Boolean,
	disableCard: Boolean,
	filterbarDropdownId: { type: String, default: 'filterbarDropdown' },
	actionButtonsClassName: String,
});

const emit = defineEmits(['event']);

const showFilterbar = ref(false);
const showAdditionalFilters = ref(false);

const event = (name, data) => {
	emit('event', name, data);
};

const toggleFilterbar = (e) => {
	showFilterbar.value = !showFilterbar.value;
	dropDown(e, { target: props.filterbarDropdownId });
};

const toggleAdditionalFilters = (e) => {
	showAdditionalFilters.value = !showAdditionalFilters.value;
	dropDown(e, { target: 'additionalFiltersDropdown', timeout: 300 });
};

watch(
	() => props.secondaryFilters,
	() => {
		if (showFilterbar.value) {
			dropDown(null, {
				target: props.filterbarDropdownId,
				recalculateHeight: true,
				timeout: 300,
			});
		}
	}
);
</script>
