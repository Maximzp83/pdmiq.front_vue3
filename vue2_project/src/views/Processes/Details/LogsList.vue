<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->

			<div class="view-content-card card content-row">
				<div class="card-content">
					<!-- hideCreate -->
					<Filterbar
						hideDelete
						:hideCreate="!$hasAccessTo(['create_oee'])"
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
					/>

					<CustomDataListTable
						disableSelection
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/>

					<PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	requestsListMixin,
	eventHandler,
	navigation
} from '@/mixins';
import { cleanDateString } from '@/helpers';
import { setupLogTypeIcon } from '@/helpers/specialHelpers';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), requestsListMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	props: {
		processData: Object
	},

	computed: {
		...mapState({
			filters: state => state.processes.downtimes_filters,
			authUser: state => state.auth.authUser
		}),

		editInModal: () => true,

		localModalSettings: that =>
			Object.freeze({
				componentPath: 'Processes/Details/EventLogForm',
				single: true,
				hideFooter: true,
				settings: {
					processData: that.processData,
					submitActionProp: 'save_process_downtime'
				}
			}),

		/*formSettings() {
			return { processData: this.processData };
		},*/

		fetchItemsPayload: that => ({
			processId: that.processData.id
		}),

		// instanceName: () => 'ProductionLines',

		itemsName() {
			return {
				one: this.$t('Log'),
				mult: this.$t('Logs'),
				instanceName: 'processes',
				filtersName: 'downtimes_filters'
			};
		},

		tableSettings() {
			let settings = {
				columns: this.$translate([
					{
						prop: ' ',
						label: ' ',
						width: 43,
						meta: {
							cell_class: 'log-type-cell',
							prepareValue: {
								localMethod: setupLogTypeIcon,
								useAllInstanceData: true
							}
						}
					},
					{
						prop: 'start_time',
						label: 'Date_time',
						sortable: true,
						width: 170,
						meta: {
							prepareValue: {
								localMethod: cleanDateString
							}
						}
					},
					{
						prop: 'machine.name',
						label: 'Machine',
						sortable: true
					},
					{
						prop: 'fault.title',
						label: 'Fault',
						sortable: true
					},
					{
						prop: 'cause_description',
						label: 'Description',
						sortable: true
					}
				]),
				operations: {
					actions: []
				}
			};

			if (this.$hasAccessTo(['edit_oee'])) {
				settings.operations.actions.push(standardTableOperations.edit);
			}

			return Object.freeze(settings);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'processes/fetch_downtimes',

			set_filters: 'processes/set_downtimes_filters'
		}),

		createItem() {
			// const { path } = options;
			let modalSettings = {
				show: true,
				instanceName: this.instanceName,
				itemName: this.itemsName ? this.itemsName.one : '',
				...this.localModalSettings
			};

			this.show_edit_modal(modalSettings);
		}
	}
};
</script>
