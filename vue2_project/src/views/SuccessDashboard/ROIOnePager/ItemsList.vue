<template>
	<div class="view-list-wrapper">
		<div
			class="content-row"
			v-if="
				$hasAccessTo(['create_customer_success', 'edit_customer_success'], 'some')
			"
		>
			<el-button
				@click="createItem"
				type="primary"
				native-type="button"
				class="item-action-button"
			>
				<span class="capitalize">{{ $t('add') }}</span>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>

		<div class="content-row">
			<div class="card overflowHidden">
				<div class="card-header filled_2 ">
					<div class="title semi-bold uppercase">{{ itemsName.one }}</div>
				</div>

				<div class="card-content">
					<Filterbar
						className="searchbar-first"
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideCreate
						hideDelete
						:perPageItems="perPageItems"
						searchbarClass="ml-auto"
					>
						<template>
							<div class="filter-item ml-auto">
								<el-button
									v-show="showClearFilters"
									class="small"
									type="primary"
									native-type="button"
									@click="setFilters({}, clearableFiltersList)"
									v-text="$t('phrases.clear_filters')"
								/>
							</div>

							<div class="filter-item mcol-xs-6 mcol-sm-2">
								<CustomSelect
									filterable
									clearable
									:optionsLoading="productionLinesLoading"
									:optionsList="productionLinesList"
									:placeholder="$t('production_line')"
									:value="filters.productionLineId"
									@change="
										id =>
											setFilters({ productionLineId: id }, ['machineId', 'assetId'])
									"
								/>
							</div>

							<div class="filter-item mcol-xs-6 mcol-sm-2">
								<CustomSelect
									filterable
									clearable
									:optionsLoading="machinesLoading"
									:optionsList="machinesList"
									:placeholder="$t('machine')"
									:value="filters.machineId"
									@change="id => setFilters({ machineId: id }, ['assetId'])"
								/>
							</div>

							<div class="filter-item">
								<FetchByQuerySelect
									clearable
									enableLoadmore
									:loadmoreIsActive="assetsLoadmoreIsActive"
									@input="id => setFilters({ assetId: id })"
									:value="filters.assetId"
									:optionsLoading.sync="assetsLoading"
									:optionsList.sync="assetsList"
									:settings="assetQueryOptions"
									:placeholder="$t('asset')"
								/>
							</div>

							<div class="ml-auto mcol-xs-9 mcol-sm-auto filter-item text-right">
								<Datepicker
									setupDaterangeFilter
									enableShortcuts
									@input="
										range =>
											setFilters({
												daterange: range,
												daterange_setted_at: Date.now()
											})
									"
									:value="filters.daterange"
									type="daterange"
								/>
							</div>
						</template>
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
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	// prepareRangeParams,
	// convertTimeToNumberValue,
	cleanDateString,
	getDateRange
} from '@/helpers';

import {
	itemsDataMixin,
	eventHandler,
	navigation,
	exportListToFileMixin,
	requestsListMixin
} from '@/mixins';

import { standardTableOperations } from '@/constants/table';
// import { datePickerShortcuts } from '@/constants/date_time';
// import { prepareParams, setupGetParamsStr } from '@/services/api/api_helpers';
// import axios from '@/services/api/axiosService';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		navigation(),
		exportListToFileMixin(),
		requestsListMixin()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue')
	},

	props: {
		perPageItems: Array,
		plantItem: Object
	},

	data() {
		return {
			exportingInProgress: false,

			productionLinesLoading: false,
			productionLinesList: [],
			machinesLoading: false,
			machinesList: [],
			assetsList: [],
			assetsLoading: false
		};
	},

	computed: {
		...mapState({
			filters: state => state.roi_one_pagers.filters,
			access_token: state => state.auth.access_token
			// plantsList: state => state.global.globalPlantsList
		}),

		clearableFiltersList: () =>
			Object.freeze(['productionLineId', 'machineId', 'assetId']),

		itemsName() {
			return {
				one: this.$t('ROI_One_Pager'),
				mult: this.$t('ROI_One_Pagers'),
				instanceName: 'roi_one_pagers'
			};
		},

		assetQueryOptions() {
			return Object.freeze({
				fetchAction: 'assets/fetch_assets',
				params: { plantId: this.globalFilters.plantId }
			});
		},

		assetsLoadmoreIsActive() {
			let { machineId /*, assetId*/ } = this.filters;
			return !machineId /*&& !assetId*/;
		},

		predefinedFilters: that =>
			Object.freeze({
				// totalBreakdown: 1,
				// machineList: 1,
				plantId: that.plantItem.id
				// orderByColumn: 'breakdown_total_time',
				// orderByMethod: 'asc'
			}),

		tableSettings() {
			let settings = {
				// rowIdKey: 'machine_id',
				columns: this.$translate([
					{
						label: 'Name',
						prop: 'name',
						min_width: 100
					},
					{
						label: 'phrases.Production_Line_name',
						prop: 'asset.machine.productionLine.name',
						min_width: 100
					},
					{
						label: 'phrases.Machine_name',
						prop: 'asset.machine.name',
						min_width: 100
					},
					{
						label: 'phrases.Asset_name',
						prop: 'asset.name',
						min_width: 100
					},
					{
						label: 'Started_at',
						prop: 'started_at',
						sortable: true,
						min_width: 120,
						// width: 120,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						label: 'phrases.roi_ca_$',
						prop: 'final_roi',
						width: 120
						/*meta: {
							cell_class: 'text-right'
						}*/
					}
				]),
				operations: {
					// columnWidth: '177',
					actions: [
						{
							name: 'openPDF',
							type: 'success',
							icon: 'icomoon icon-pdf',
							tooltip_text: 'phrases.Open_PDF_file',
							conditionSettings: {
								conditions: [{ prop: 'full_file_name', method: 'notEmpty' }]
							}
						},
						{
							name: 'exportToPDF',
							type: 'success',
							icon: 'icomoon icon-pdf',
							tooltip_text: 'phrases.export_to_pdf',
							conditionSettings: {
								conditions: [{ prop: 'full_file_name', method: 'empty' }]
							}
						},
						{
							name: 'handleShowDetails',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: 'Details'
						}
					]
				}
			};

			if (this.$hasAccessTo(['edit_customer_success'])) {
				settings.alwaysShowOperations = true;
				settings.operations.actions.push({
					name: 'editItem',
					type: 'success',
					icon: 'icomoon icon-pencil',
					query: 'edit=true',
					tooltip_text: 'Edit'
				});
			}

			if (this.$hasAccessTo(['delete_customer_success'])) {
				settings.operations.actions.push(standardTableOperations.delete);
			}

			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'tooltip_text'
			});
			return Object.freeze(settings);
		},

		requestsToDoList: that =>
			Object.freeze([
				{
					action: 'fetch_production_lines',
					bindTo: [
						{
							prop: 'globalFilters.plantId',
							param: 'plantId',
							fetchById: {
								action: 'production_lines/fetch_production_line',
								itemId: that.filters.productionLineId
							}
						}
					],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_machines',
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId' },
						{ prop: 'filters.productionLineId', param: 'productionLineId' }
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				},
				{
					action: 'fetch_assets',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true },
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						},
						{
							prop: 'filters.machineId',
							param: 'machineId',
							fetchById: {
								action: 'assets/fetch_asset',
								itemId: that.filters.assetId
							}
						}
					],
					localProp: 'assetsList',
					localLoadProp: 'assetsLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_items: 'roi_one_pagers/fetch_roi_one_pagers',
			delete_item: 'roi_one_pagers/delete_roi_one_pager',
			set_filters: 'roi_one_pagers/set_roi_one_pagers_filters',

			fetch_machines: 'machines/fetch_machines',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_assets: 'assets/fetch_assets'
		}),

		handleShowDetails({ row }) {
			// console.log(row, options)
			this.changeRoute({
				path: `/success-dashboard/roi-one-pager/${row.id}`
			});
		},

		exportToPDF({ row }) {
			this.handleExportItem({
				url: `plants/roi/one-pagers/${row.id}/report`
			});
		},

		openPDF({ row }) {
			this.generateDownloadLink(row.full_file_name);
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
				// console.log(this.export_daterange,  url)

				link.click();
			} else {
				this.$notify({
					type: 'warning',
					// title: "",
					message: `select daterange first`
				});
			}
		},*/

		localBeforeMount() {
			// if (!this.filters.daterange) {
			if (!this.filters.daterange) {
				this.preventFetch = true;
				this.setFilters({
					daterange: getDateRange('this_month', {
						getDateString: true
					})
				});
			}
			// }
		}
	}
};
</script>
