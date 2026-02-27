<template>
	<div :class="['filterbar-container', className]">
		<div :class="['mrow flex align-center', { wrap: !nowrap }]">
			<slot name="prefix-items"></slot>
			<div class="mcol-xs-12 mcol-sm-auto" v-if="actionButtons && actionButtons.length">
				<div class="mrow flex wrap action-buttons-container array">
					<div v-for="item in actionButtons" :key="`button-${item.id}`">
						<el-button
							:type="item.type || 'primary'"
							native-type="button"
							:class="[
								'item-action-button capitalize',
								{ 'delete-button inverted': item.isDelete },
								item.className
							]"
							@click="event(item.event, item.args)"
						>
							<span>{{ item.text }}</span>
							<i v-if="item.icon" :class="[`icomoon ${item.icon}`]"></i>
							<i v-else-if="item.without_icon"></i>
							<i v-else :class="['icomoon icon-plus', { rotate: item.isDelete }]" />
						</el-button>
					</div>
				</div>
			</div>

			<div
				:class="['action-buttons-container mcol-xs-12 mcol-sm-auto', { fluid: !disableMainButtonsFluid }]"
				v-else-if="!hideCreate || !hideDelete"
			>
				<el-button
					v-if="!hideCreate"
					:disabled="disableCreateButton"
					type="primary"
					native-type="button"
					class="item-action-button capitalize"
					@click="event('createItem')"
				>
					<span v-if="!hideAddButtonText">{{ tt('Add') }}</span>
					<i class="icomoon icon-plus"></i>
				</el-button>

				<el-button
					v-if="!hideDelete"
					type="primary"
					native-type="button"
					class="item-action-button delete-button inverted capitalize"
					@click="event('handleDeleteItems')"
				>
					<span v-if="!hideRemoveButtonText">{{ tt('Delete') }}</span>
					<i class="icomoon icon-plus rotate"></i>
				</el-button>
			</div>

			<slot></slot>

			<div
				:class="['search-block-wrapper relative', searchbarClass || 'mcol-xs-12 mcol-sm-3']"
				v-if="!hideSearchbar"
			>
				<SimpleSpinner :active="itemsLoading" />
				<SearchBar
					class="search-block"
					:options="searchbarOptions"
					:query="filters?.q"
					:clearable="true"
					@submit="(data) => event('setFilters', data)"
				/>
			</div>

			<slot name="middle"></slot>

			<div
				:class="['mcol-xs-3 mcol-sm-2 filter-item perPage-item ml-auto', perPageClassName || '']"
				v-if="!hidePerPageFilter"
			>
				<div class="item-container relative">
					<SimpleSpinner :active="itemsLoading" />
					<el-select
						:disabled="itemsLoading"
						:model-value="filters?.max"
						@change="(max) => event('setFilters', { max })"
					>
						<el-option
							v-for="max in perPageItems"
							:key="'filterByPerPage-' + max.label"
							:label="max.label"
							:value="max.value"
						/>
					</el-select>
				</div>
			</div>

			<slot name="last"></slot>

			<div class="mcol-xs-12" v-if="showNextRowHtml">
				<div class="flex mrow wrap">
					<slot name="next_row"></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { Lang } from '@/localization';
import SearchBar from '@/components/common/SearchBar.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'CommonFilterbar',
});

const props = defineProps({
	filters: { type: Object, default: () => ({}) },
	itemsLoading: Boolean,
	hidePerPageFilter: Boolean,
	hideSearchbar: Boolean,
	fromDashboard: Boolean,
	hideCreate: Boolean,
	hideDelete: Boolean,
	disableCreateButton: Boolean,
	nowrap: Boolean,
	hideAddButtonText: Boolean,
	hideRemoveButtonText: Boolean,
	className: String,
	searchbarClass: String,
	perPageClassName: String,
	disableMainButtonsFluid: Boolean,
	actionButtons: { type: Array, default: null },
	searchbarOptions: {
		type: Object,
		default: () => ({ prepend: true }),
	},
	itemsName: { type: Object, default: () => ({}) },
	perPageItems: {
		type: Array,
		default: () => [
			{ value: 5, label: '5' },
			{ value: 10, label: '10' },
			{ value: 20, label: '20' },
			{ value: 50, label: '50' },
			{ value: -1, label: 'all' },
		],
	},
});

const slots = defineSlots();
const emit = defineEmits(['event']);

const showNextRowHtml = computed(() => Boolean(slots.next_row));

const event = (name, data) => {
	emit('event', name, data);
};

void props;
</script>
