<template>
	<div class="section-row view-list-wrapper">
		<div class="view-content-card card content-row">
			<div class="card-content">
				<Filterbar
					@event="handleEvent"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:perPageItems="perPageItems"
					hideCreate
					hideDelete
					hideSearchbar
				>
					<template>
						<div class="filter-item">
							<CustomSelect
								clearable
								:optionsList="sourceOptions"
								labelKey="label"
								valueKey="value"
								idKey="value"
								placeholder="Source"
								:value="filters.source"
								@change="handleSourceChange"
							/>
						</div>

						<div class="filter-item">
							<CustomSelect
								clearable
								filterable
								:optionsList="eventOptions"
								labelKey="label"
								valueKey="value"
								idKey="value"
								:value="filters.event"
								placeholder="Event"
								@change="value => setFilters({ event: value || null })"
							/>
						</div>

						<div class="filter-item">
							<CustomSelect
								clearable
								filterable
								:optionsLoading="usersLoading"
								:optionsList="usersList"
								labelKey="full_name"
								:value="filters.causer_id"
								placeholder="Causer ID"
								@change="value => setFilters({ causer_id: value || null })"
							/>
						</div>

						<div class="filter-item">
							<CustomSelect
								clearable
								filterable
								:optionsList="subjectTypeOptions"
								labelKey="label"
								valueKey="value"
								idKey="value"
								:value="filters.subject_type"
								placeholder="Subject Type"
								@change="value => setFilters({ subject_type: value || null })"
							/>
						</div>

						<div class="filter-item">
							<Datepicker
								clearable
								type="date"
								value-format="yyyy-MM-dd"
								placeholder="From"
								:value="filters.from"
								@input="value => setFilters({ from: value || null })"
							/>
						</div>

						<div class="filter-item">
							<Datepicker
								clearable
								type="date"
								value-format="yyyy-MM-dd"
								placeholder="To"
								:picker-options="pickerEndOptions"
								:value="filters.to"
								@input="value => setFilters({ to: value || null })"
							/>
						</div>
					</template>
				</Filterbar>

				<CustomDataListTable
					ref="ItemsTableContainer"
					disableSelection
					@event="handleEventNew"
					:itemsLoading="itemsLoading || measurementUnitsLoading || usersLoading"
					:tableData="itemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
				/>

				<PaginationContainer
					v-if="
						itemsList.length && activeSource === 'database' && meta.total != null
					"
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
				/>

				<div
					v-if="itemsList.length && activeSource === 'cloudwatch'"
					class="pagination-container"
				>
					<div class="mrow flex wrap align-center">
						<div class="mcol-xs-12 mcol-sm-8">
							<CustomInput
								clearable
								:value="filters.next_token"
								placeholder="Next Token"
								@input="value => setFilters({ next_token: value || null })"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import {
	itemsDataMixin,
	requestsListMixin,
	eventHandler,
	navigation
} from '@/mixins';
// import { cleanDateString, /*getObjectVal*/ } from '@/helpers';
// import { getEventLogCauserName } from '@/helpers/eventLogs';

export default {
	mixins: [itemsDataMixin(), requestsListMixin(), eventHandler(), navigation()],

	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomSelect: () => import('@/components/form/CustomSelect.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		propsFilters: {
			type: Object,
			default: () => ({})
		}
	},

	data: () => ({
		measurementUnitsList: [],
		measurementUnitsLoading: false,
		usersList: [],
		usersLoading: false
	}),

	computed: {
		...mapState({
			filters: state => state.event_logs.filters
		}),

		itemsName: () => ({
			one: 'Event Log',
			mult: 'Event Logs'
		}),

		perPageItems: () =>
			Object.freeze([
				{ value: 25, label: '25' },
				{ value: 50, label: '50' },
				{ value: 100, label: '100' }
			]),

		sourceOptions: () =>
			Object.freeze([
				{ value: 'database', label: 'Database' },
				{ value: 'cloudwatch', label: 'CloudWatch' }
			]),

		eventOptions: () =>
			Object.freeze([
				{ value: 'measurement_unit_created', label: 'measurement_unit_created' },
				{ value: 'measurement_unit_updated', label: 'measurement_unit_updated' },
				{ value: 'measurement_unit_deleted', label: 'measurement_unit_deleted' },
				{ value: 'measurement_unit_restored', label: 'measurement_unit_restored' },
				{
					value: 'measurement_unit_force_deleted',
					label: 'measurement_unit_force_deleted'
				}
			]),

		subjectTypeOptions: () =>
			Object.freeze([{ value: 'MeasurementUnit', label: 'MeasurementUnit' }]),

		activeSource() {
			return this.filters.source || 'database';
		},

		pickerEndOptions() {
			if (this.filters.from) {
				const start = new Date(this.filters.from).getTime();
				return Object.freeze({	
					disabledDate(date) {
						return date.getTime() < start;			
					}
				})
			}

			return null;
		},

		requestsToDoList() {
			return Object.freeze([
				/*{
					action: 'fetch_measurement_units',
					localProp: 'measurementUnitsList',
					localLoadProp: 'measurementUnitsLoading',
					payload: {
						params: {
							max: -1
						}
					}
				},*/
				{
					action: 'fetch_users',
					localProp: 'usersList',
					localLoadProp: 'usersLoading',
					payload: {
						params: {
							max: -1,
							orderByColumn: 'full_name',
							orderByMethod: 'asc'
						}
					}
				}
			]);
		},

		/*tableData() {
			return this.itemsList.map(log => {

				return {
					...log,
					subject_type: measurementUnit.metric_name || '-',
					imperial_name: measurementUnit.imperial_name || '-',
					to_imperial_formula: measurementUnit.to_imperial_formula || '-',
					to_metric_formula: measurementUnit.to_metric_formula || '-',
					created_by_name: getEventLogCauserName(log),
					created_at_display: log.logged_at ? cleanDateString(log.logged_at) : '-'
				};
			});
		},*/

		tableSettings() {
			return Object.freeze({
				columns: [
					{
						label: 'Subject Type',
						prop: 'subject_type',
						sortable: true
					},
					{
						label: 'Event',
						prop: 'event',
						sortable: true
					},
					{
						prop: 'created_by_name',
						label: 'Created By',
						meta: {
							cellComponent: {
								componentPath: 'views/Settings/MeasurementUnits/CreatedInfoTableCell'
							}
						}
					}
				],
				/*operations: {
					actions: []
				}*/
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'event_logs/fetch_event_logs',
			set_filters: 'event_logs/set_event_logs_filters',
			fetch_measurement_units: 'measurement_units/fetch_measurement_units',
			fetch_users: 'users/fetch_users'
		}),

		handleSourceChange(value) {
			this.setFilters({ source: value, next_token: null, page: null });
		},

		localPrepareFilters(filters) {
			const nextFilters = { ...filters };

			if (nextFilters.max != null) {
				nextFilters.per_page = nextFilters.max;
				delete nextFilters.max;
			}

			if (!nextFilters.source) {
				nextFilters.source = 'database';
			}

			if (nextFilters.source === 'cloudwatch') {
				delete nextFilters.page;
			} else {
				delete nextFilters.next_token;
			}

			return nextFilters;
		}
	}
};
</script>
