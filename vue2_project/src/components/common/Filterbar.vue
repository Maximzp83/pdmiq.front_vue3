<template>
	<div :class="['filterbar-container', className]">
		<div :class="['mrow flex align-center', { wrap: !nowrap }]">
			<slot name="prefix-items"></slot>
			<div
				class="mcol-xs-12 mcol-sm-auto"
				v-if="actionButtons && actionButtons.length"
			>
				<div class="mrow flex wrap action-buttons-container array">
					<div class="" v-for="item in actionButtons" :key="`button-${item.id}`">
						<el-button
							@click="event(item.event, item.args)"
							:type="item.type || 'primary'"
							native-type="button"
							:class="[
								'item-action-button capitalize',
								{ 'delete-button inverted': item.isDelete },
								item.className
							]"
						>
							<span>{{ item.text }}</span>
							<i v-if="item.icon" :class="[`icomoon ${item.icon}`]"></i>
							<i v-else-if="item.without_icon"></i>
							<i
								v-else
								:class="['icomoon icon-plus', { rotate: item.isDelete }]"
							></i>
						</el-button>
					</div>
				</div>
			</div>

			<div
				:class="['action-buttons-container mcol-xs-12 mcol-sm-auto', {'fluid': !disableMainButtonsFluid}]"
				v-else-if="!hideCreate || !hideDelete"
			>
				<el-button
					v-if="!hideCreate"
					:disabled="disableCreateButton"
					@click="event('createItem')"
					type="primary"
					native-type="button"
					class="item-action-button capitalize"
				>
					<span v-if="!hideAddButtonText"
						>{{ tt('Add') }}
						<!-- {{ itemsName.one }} --></span
					>
					<i class="icomoon icon-plus"></i>
				</el-button>

				<el-button
					v-if="!hideDelete"
					@click="event('handleDeleteItems')"
					type="primary"
					native-type="button"
					class="item-action-button delete-button inverted capitalize"
				>
					<span v-if="!hideRemoveButtonText">{{ tt('Delete') }}</span>
					<i class="icomoon icon-plus rotate"></i>
				</el-button>
			</div>

			<slot></slot>

			<div
				:class="
					['search-block-wrapper relative ', searchbarClass ||
						'mcol-xs-12 mcol-sm-3']
				"
				v-if="!hideSearchbar"
			>
				<SimpleSpinner :active="itemsLoading" />
				<!-- v-if="navbarSettings.showSearchbar" -->
				<SearchBar
					class="search-block"
					@submit="data => event('setFilters', data)"
					:options="searchbarOptions"
					:query="filters.q"
					:clearable="true"
				/>
			</div>

			<slot name="middle"></slot>

			<div
				:class="[
					'mcol-xs-3 mcol-sm-2 filter-item perPage-item ml-auto',
					perPageClassName || ''
				]"
				v-if="!hidePerPageFilter"
			>
				<div class="item-container relative">
					<SimpleSpinner :active="itemsLoading" />
					<!-- @change="max => setFilters({ max: max })" -->
					<el-select
						:disabled="itemsLoading"
						@change="max => event('setFilters', { max: max })"
						:value="filters.max"
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

<script>
export default {
	// functional: true,
	props: {
		filters: Object,
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

		actionButtons: { type: Array },

		searchbarOptions: {
			type: Object,
			default: () => ({
				prepend: true
				// suffix: 'icomoon icon-search'
			})
		},
		itemsName: Object,
		perPageItems: {
			type: Array,
			default: () => [
				{ value: 5, label: '5' },
				{ value: 10, label: '10' },
				{ value: 20, label: '20' },
				{ value: 50, label: '50' },
				{ value: -1, label: 'all' }
			]
		}
	},

	computed: {
		showNextRowHtml: that => that.$slots.next_row && that.$slots.next_row.length
	},

	methods: {
		event(name, data) {
			this.$emit('event', name, data);
		}
	}
};
</script>
