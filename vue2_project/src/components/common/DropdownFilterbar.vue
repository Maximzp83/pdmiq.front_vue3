<template>
	<div class="dropdown-filterbar-container">
		<div class="flex mrow wrap align-center layout-filterbar content-row">
			<div
				:class="[
					'action-buttons-container',
					actionButtonsClassName || 'mcol-xs-12 mcol-sm-auto'
				]"
				v-if="showCreateActions"
			>
				<el-button
					v-if="!hideCreate"
					@click="event('createItem')"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span class="capitalize">{{ `${tt('add')} ${itemsName.one || ''}` }}</span>
					<i class="icomoon icon-plus"></i>
				</el-button>

				<el-button
					v-if="!hideDelete"
					@click="event('handleDeleteItems')"
					type="primary"
					native-type="button"
					class="item-action-button delete-button inverted"
				>
					<span class="capitalize">{{ tt('delete') }}</span>
					<i class="icomoon icon-plus rotate"></i>
				</el-button>
			</div>

			<slot name="prefixFilters"></slot>

			<div
				class="ml-auto filter-item toggle-additional-filters"
				v-if="!hideToggleButton"
			>
				<el-button
					type="primary"
					native-type="button"
					:class="['action-button inverted', { active: showFilterbar }]"
					:icon="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"
					@click="e => toggleFilterbar(e)"
				/>
			</div>
		</div>

		<div
			:class="[
				{ 'triangle pos-top-right triangle-shadow': !disableTriangle },
				'content-row ',
				{ 'triangle-hide': !showFilterbar }
			]"
		>
			<div :id="filterbarDropdownId" class="hiddenContent height">
				<div class="filterbarDropdownWrapper">
					<div :class="['items-filter-container', { card: !disableCard }]">
						<div :class="['card-content']">
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
											@click="e => toggleAdditionalFilters(e)"
										></el-button>
									</div>
								</div>
							</div>

							<div
								id="additionalFiltersDropdown"
								class="content-row additional-container hiddenContent height"
								v-if="additionalFilters"
							>
								<div class="">
									<!-- <div class="title">This filters is under construction...</div> -->
									<div class="mrow flex filter-items-list ">
										<slot name="additionalFilters"></slot>
									</div>
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

<script>
import { dropDown } from '@/helpers/domHelpers';

export default {
	// functional: true,
	props: {
		filters: Object,
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
		actionButtonsClassName: String

		/*filterbarSettings: {
			type: Object,
			required: true
		}*/
	},

	data: () => ({
		showFilterbar: false,
		showAdditionalFilters: false
	}),

	computed: {},

	methods: {
		// handleChange() {},
		event(name, data) {
			this.$emit('event', name, data);
		},

		toggleFilterbar(e) {
			this.showFilterbar = !this.showFilterbar;

			dropDown(e, {
				target: this.filterbarDropdownId
				// recalculateHeight:true,
				// timeout: 300
			});
		},

		toggleAdditionalFilters(e) {
			this.showAdditionalFilters = !this.showAdditionalFilters;

			dropDown(e, {
				target: 'additionalFiltersDropdown',
				timeout: 300
			});
		}
	},

	watch: {
		secondaryFilters() {
			if (this.showFilterbar) {
				dropDown(null, {
					target: 'filterbarDropdown',
					recalculateHeight: true,
					timeout: 300
				});
			}
		}
	}
};
</script>
