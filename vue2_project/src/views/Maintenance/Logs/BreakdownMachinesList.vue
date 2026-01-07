<template>
	<div class="flex mrow wrap view-list-wrapper">
		<div class="mcol-xs-12 mcol-sm-8">
			<div class="card overflowHidden vertical-fluid">
				<div class="card-header filled_2 ">
					<div class="title semi-bold uppercase">{{ tt('BREAKDOWN_MACHINES') }}</div>
				</div>

				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideCreate
						hideDelete
						:perPageItems="perPageItems"
					>
						<template>
							<div class="filter-item text-right">
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

							<!-- <div class="filter-item export-buttons">
								<el-button-group>
									<el-button
										@click="handleExportList('excel')"
										type="success"
										icon="icomoon icon-doc_xls"
										class="inverted"
										size="mini"
										native-type="button"
										:loading="exportingInProgress"
									/>
								</el-button-group>
							</div> -->
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

		<div class="mcol-xs-12 mcol-sm-4">
			<div
				class="card overflowHidden statistic-block vertical-fluid maintenance-logs-chart"
			>
				<div class="card-header filled_2 ">
					<div class="title semi-bold">{{ tt('phrases.top_5_breakdowns') }}</div>
				</div>

				<div class="card-content relative">
					<SimpleSpinner :active="itemsLoading" />

					<CommonChartItemWrapper
						ref="CommonChartItemWrapper"
						chartFactoryContainerName="MaintenanceChartFactoryContainer"
						chartFactoryName="BreakdownMachinesChart"
						configsKey="maintenanceChartListsConfig"
						chartKey="main"
						:rootStatisticsData="statisticsData"
						:additionalProps="chartProps"
					>
						<template v-slot:custom_mock>
							<div class="text-center">
								{{ tt('phrases.Has_not_Statistics_for_this_range') }}...
							</div>
						</template>
					</CommonChartItemWrapper>
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
	getDateRange
} from '@/helpers';

import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
// import { datePickerShortcuts } from '@/constants/date_time';
// import { prepareParams, setupGetParamsStr } from '@/services/api/api_helpers';
// import axios from '@/services/api/axiosService';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		perPageItems: Array
	},

	data() {
		return {
			exportingInProgress: false
		};
	},

	computed: {
		...mapState({
			filters: state => state.maintenance.filters_breakdown,
			access_token: state => state.auth.access_token
			// plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.tt('Machine'),
				mult: this.tt('Machines'),
				instanceName: 'maintenance'
			};
		},

		predefinedFilters: that =>
			Object.freeze({
				totalBreakdown: 1,
				machineList: 1,
				plantId: that.globalFilters.plantId
				// orderByColumn: 'breakdown_total_time',
				// orderByMethod: 'asc'
			}),

		tableSettings() {
			return Object.freeze({
				rowIdKey: 'machine_id',
				columns: this.$translate([
					{
						prop: 'machine.name',
						label: 'phrases.Machine_Name'
						// sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'breakdown_total_time',
						label: 'phrases.Total_time',
						width: 120
					}
				])
			});
		},

		chartProps() {
			return Object.freeze({
				customMock: true,
				disablePreloader: true
			});
		},

		statisticsData() {
			if (this.itemsList.length) {
				return this.itemsList.slice(0, 5).map(li => {
					const timeArray = li.breakdown_total_time.split(' ');
					const d = Number(timeArray[0].split('d')[0]);
					const h = Number(timeArray[1].split('h')[0]);
					const m = Number(timeArray[2].split('m')[0]);
					const total_h = d * 24 + h + m / 60;
					// console.log(d, h, m, '=', total_h)
					return {
						name: li.machine ? li.machine.name : '',
						value: total_h
						// value: convertTimeToNumberValue(`${h}:${m}`)
					};
				});
			}

			return [];
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'maintenance/fetch_maintenance_logs',
			set_filters: 'maintenance/set_maintenance_logs_breakdown_filters'
		}),

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
					message: this.$t(`phrases.select_daterange_first`)
				});
			}
		},*/

		localBeforeMount() {
			// if (!this.filters.daterange) {
			this.preventFetch = true;
			this.setFilters({
				daterange: getDateRange('this_month', {
					getDateString: true
				})
			});
			// }
		}
	}
};
</script>
