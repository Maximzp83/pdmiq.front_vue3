<template>
	<div class="section-row view-list-wrapper">
		<div class="view-content-card card content-row">
			<div class="card-content">
				<Filterbar
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:hideCreate="!hasAccesToCreate"
					:hideDelete="!hasAccesToDelete"
				/>

				<CustomDataListTable
					ref="ItemsTableContainer"
					@event="handleEventNew"
					:disableSelection="!hasAccesToDelete"
					:itemsLoading="itemsLoading"
					:tableData="itemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
				/>

				<PaginationContainer
					v-if="itemsList.length"
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
} from '@/mixins';
// import { FAULTS_TYPES } from '@/constants/global';

import { standardTableOperations } from '@/constants/table';
// import { findItemBy } from '@/helpers';

// import tableSettings from './tableSettings';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
		// CreateItemForm: () => import('./CreateItemForm.vue')
	},

	props: {
		editInModal: {
			type: Boolean,
			default: true
		}
	},

	data() {
		return {
		};
	},

	computed: {
		...mapState({
			filters: state => state.banner_v2_subtypes.filters
		}),

		hasAccesToCreate: that => that.$hasAccessTo(['create_settings']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_settings']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_settings']),

		itemsName: that => ({
			one: that.$t('phrases.Banner_V2_subtype'),
			mult: that.$t('phrases.Banner_V2_subtypes'),
			instanceName: 'banner_v2_subtypes'
		}),

		/*navbarSettings: () => ({
			// showCreateButtonForTableForm: true,
			showDeleteButton: true,
			showFilter: true,
			pageTitle: 'Settings'
		}),*/

		instanceName: () => 'BannerV2Subtype',
		// tableSettings: () => Object.freeze(tableSettings),

		// predefinedFilters: () => Object.freeze({ max: -1 }),
	
		localModalSettings() {
			return Object.freeze({
				componentPath: 'Settings/BannerV2Subtype/ItemForm',
				single: true,
				callback: () => {
					this.refetchItemsList();
					this.show_edit_modal({ show: false });
				}
			});
		},

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: this.$translate([
					{
						label: 'Name',
						prop: 'name',
						sortable: true
					},
					{
						label: 'Model_number',
						prop: 'model_number',
						sortable: true
					},
					{
						label: 'Part_number',
						prop: 'part_number',
						sortable: true
					},
					/*{
						prop: 'sensor_parameter_types',
						label: 'Parameters',
						meta: {
							prepareValue: { localMethod: this.setupParametersCell }
						}
					},*/
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		},
	},

	methods: {
		...mapActions({
			forceRerender: 'forceRerender',

			fetch_items: 'banner_v2_subtypes/fetch_subtypes',
			save_item: 'banner_v2_subtypes/save_subtype',
			delete_item: 'banner_v2_subtypes/delete_subtype',

			set_filters: 'banner_v2_subtypes/set_subtypes_filters'
		}),
	},
};
</script>
