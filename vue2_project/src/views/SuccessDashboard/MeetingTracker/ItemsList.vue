<template>
	<div class="view-list-wrapper">
		<div
			class="content-row"
			v-if="
				$hasAccessTo(['create_customer_success', 'edit_customer_success'], 'some')
			"
		>
			<!-- v-if="hasAccessMap[]" -->
			<el-button
				@click="createItem"
				type="primary"
				native-type="button"
				class="item-action-button"
			>
				<span class="capitalize">{{ $t('Add') }} </span>
				<i class="icomoon icon-plus"></i>
			</el-button>

			<el-button
				@click="addPdfDialogOpen = true"
				type="primary"
				native-type="button"
				class="item-action-button"
			>
				<span class="capitalize">{{ $t('Add') }} {{ $t('file') }} </span>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>

		<div class="content-row">
			<div class="card overflowHidden">
				<div class="card-header filled_2 ">
					<div class="title semi-bold uppercase">{{ $t('MEETING_TRACKER') }}</div>
				</div>

				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideCreate
						hideDelete
						hideSearchbar
						:perPageItems="perPageItems"
					>
						<!-- <template>
							<div class="ml-auto filter-item text-right">
								<Datepicker
									setupDaterangeFilter
									enableShortcuts
									@input="range => setFilters({ daterange: range })"
									:value="filters.daterange"
									type="daterange"
								/>
							</div>
						</template> -->
					</Filterbar>

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

		<el-dialog
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="`${tt('add')} PDF ${tt('file')}`"
			:visible.sync="addPdfDialogOpen"
		>
				<!-- v-if="addPdfDialogOpen" -->
			<AddPdfFileForm
				:visible="addPdfDialogOpen"
				:plantId="plantItem.id"
				@success="handlePDFSuccess"
				@close="addPdfDialogOpen = false"
			/>
		</el-dialog>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	// prepareRangeParams,
	cleanDateString
	// convertTimeToNumberValue,
	// getDateRange
} from '@/helpers';

import {
	itemsDataMixin,
	eventHandler,
	navigation,
	exportListToFileMixin
} from '@/mixins';
// import { datePickerShortcuts } from '@/constants/date_time';
// import { prepareParams, setupGetParamsStr } from '@/services/api/api_helpers';
// import { standardTableOperations } from '@/constants/table';

// import axios from '@/services/api/axiosService';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), exportListToFileMixin()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		AddPdfFileForm: () => import('./AddPdfFileForm.vue')
		// Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		perPageItems: Array,
		plantItem: Object
	},

	data() {
		return {
			exportingInProgress: false,
			addPdfDialogOpen: false
		};
	},

	computed: {
		...mapState({
			filters: state => state.meeting_trackers.filters,
			access_token: state => state.auth.access_token
			// plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('Meeting_Tracker'),
				mult: this.$t('Meeting_Trackers'),
				instanceName: 'meeting_trackers'
			};
		},

		predefinedFilters: that =>
			Object.freeze({
				plantId: that.plantItem.id
				// orderByColumn: 'breakdown_total_time',
				// orderByMethod: 'asc'
			}),

		tableSettings() {
			let settings = {
				// rowIdKey: 'machine_id',
				columns: this.$translate([
					{
						label: 'phrases.Created_at',
						prop: 'created_at',
						sortable: true,
						width: 120,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						label: 'Period',
						prop: 'mock',
						meta: {
							prepareValue: {
								localMethod: this.setupTrackerPeriod,
								useAllInstanceData: true
							}
						}
						/*conditionSettings: {
							conditions: [{ prop: 'pdf_file_url', method: 'empty' }]
						}*/
						// sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					/*{
						label: 'Renewal date',
						prop: 'renewal_date',
						// sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},*/
					{
						label: 'Creator',
						prop: 'creator.full_name'
						// width: 120
					},
					{
						label: 'phrases.next_launch_date',
						prop: 'next_launch_date'
					}
				]),
				operations: {
					// columnWidth: '177',
					actions: [
						// standardTableOperations.edit,
						// standardTableOperations.delete
					]
				}
			};

			if (this.$hasAccessTo(['edit_customer_success'])) {
				settings.operations.actions.push({
					name: 'editItem',
					type: 'success',
					icon: 'icomoon icon-pencil',
					query: 'edit=true',
					tooltip_text: 'Edit',
					conditionSettings: {
						conditions: [{ prop: 'pdf_file_url', method: 'empty' }]
					}
				});
			}

			settings.operations.actions.push(
				{
					name: 'exportToPDF',
					type: 'success',
					icon: 'icomoon icon-pdf',
					tooltip_text: 'phrases.Export_to_PDF'
				},
				{
					name: 'handleShowDetails',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: 'Details',
					conditionSettings: {
						conditions: [{ prop: 'pdf_file_url', method: 'empty' }]
					}
				}
			);
			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'tooltip_text'
			});

			return Object.freeze(settings);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'meeting_trackers/fetch_meeting_trackers',
			set_filters: 'meeting_trackers/set_meeting_trackers_filters'
		}),

		handlePDFSuccess() {
			this.addPdfDialogOpen = false;
			this.refetchItemsList();
		},

		setupTrackerPeriod(tracker) {
			// console.log(tracker)
			const last = cleanDateString(tracker.last_tracker_created_at, {
				withoutTime: true
			});
			const current = cleanDateString(tracker.current_created_at, {
				withoutTime: true
			});
			const delimeter = last && current ? '-' : '/';
			return `${last || '-'} ${delimeter} ${current || '-'}`;
		},

		/*handleExportList() {
			const { daterange } = this.filters;
			if (daterange && daterange.length) {
				let newFilters = {
					...this.globalFilters,
					...this.filters,
					...prepareRangeParams(daterange)
				};

				let params = prepareParams(this.prepareFilters(newFilters));
				params.token = this.access_token;

				const { baseURL } = axios.defaults;
				let url = `${baseURL}/plants/work-orders/export`;
				url = setupGetParamsStr(url, params);
				const link = document.createElement('a');
				link.href = url;
				link.target = '_blank';

				link.click();
			} else {
				this.$notify({
					type: 'warning',
					// title: "",
					message: this.tt(`phrases.select_daterange_first`)
				});
			}
		},*/

		handleShowDetails({ row }) {
			// console.log(row, options)
			this.changeRoute({
				path: `/success-dashboard/meeting-tracker/${row.id}`
			});
		},

		/*localBeforeMount() {
			if (!this.filters.daterange) {
				this.preventFetch = true;
				this.setFilters({
					daterange: getDateRange('this_month', {
						getDateString: true
					})
				});
			}
		},*/

		exportToPDF({ row }) {
			this.handleExportItem({
				url: `plants/meeting-trackers/${row.id}/report`,
				skipDaterange: true
			});
		}
	}
};
</script>
