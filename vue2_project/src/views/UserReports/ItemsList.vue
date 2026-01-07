<template>
	<div class="view-wrapper view-list-wrapper">
		<div :class="[{'mcontainer': !insideOtherPage}]">
			<div :class="[{'view-content-card card content-row': !insideOtherPage}]">
				<div :class="[{'card-content': !insideOtherPage}]">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideDelete
					/>
						<!-- :hideCreate="!hasAccesToCreate" -->
						<!-- :hideDelete="!hasAccesToDelete" -->
						<!-- :actionButtons="actionButtons" -->
						<!-- searchbarClass="ml-auto" -->

					<CustomDataListTable
						ref="ItemsTableContainer"
						disableSelection
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
import { weekdays } from '@/constants/date_time';
// import { userReportTypesList } from '@/constants/global';
import { itemsDataMixin, eventHandler, navigation, actionButtonsMixin } from '@/mixins';
import { standardTableOperations } from '@/constants/table';
// console.log(itemsDataMixin())
export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), actionButtonsMixin()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	props: {
		insideOtherPage: Boolean,
		userId: Number,
		isCSM: Boolean,
		enableBaselineReport: Boolean,

		sensorsListProps: {
			type: Array,
			default: () => []
		},
		plantsListProps: {
			type: Array,
			default: () => []
		},
		sensorsLoadingProps: Boolean,
	},

	computed: {
		...mapState({
			filters: state => state.users.reports_filters,
			// plantsList: state => state.global.globalPlantsList
		}),

		/*actionButtons() {
			// const { authUser } = this;
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push({
					id: 1,
					text: 'Add',
					event: 'createItem'
					// args: { path: '/new' }
				});
			}
			if (this.hasAccesToDelete) {
				actions.push({
					id: 2,
					text: 'Delete',
					isDelete: true,
					event: 'handleDeleteReports'
				});
			}

			return Object.freeze(this.$translate(actions, { key: 'text' }));
		},*/

		weekdays: () => Object.freeze(weekdays()),

		itemsName() {
			return {
				one: this.$t('Report'),
				mult: this.$t('Reports'),
				instanceName: 'users'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_users']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_users']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_users']),

		fetchItemsPayload: that => Object.freeze({userId: that.userId}),

		editInModal: () => true,

		localModalSettings() {
			return {
				componentPath: 'UserReports/ItemForm',
				single: true,
				additionalModalSettings: {
					fromReportsList: true,
					userId: this.userId,
					isCSM: this.isCSM,
					enableBaselineReport: this.enableBaselineReport,
					
					sensorsListProps: this.sensorsListProps,
					plantsListProps: this.plantsListProps
				},
				callback: () => {
					this.refetchItemsList();
					this.show_edit_modal({ show: false });
				}
			};
		},

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push({
					name: 'manualStartReport',
					type: 'success',
					icon: 'el-icon-caret-right',
					tooltip_text: 'phrases.Start_Report_manually',
					/*conditionSettings: {
						conditions: [
							{
								prop: 'lastWorkerFFTRequest.remaining_action_time',
								method: '<',
								control_value: 1
							}
						]
					}*/
				});
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: [
					{
						prop: 'name',
						label: this.$t('Name'),
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						label: this.$t('Launch_Time'),
						prop: 'launch_time',
						max_width: 150
						// sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						label: this.$t('days_range'),
						prop: 'report_for_range_days',
						max_width: 130
					},
					{
						label: this.$t('days'),
						prop: 'launch_on_weekdays',
						meta: {
							prepareValue: { localMethod: this.setupWeekdaysCell }
						}
					},
					/*{
						prop: 'plant_id',
						label: this.$t('Plant'),
						meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}
					}*/
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		},
	},

	methods: {
		...mapActions({
			fetch_items: 'users/fetch_reports',
			delete_item: 'users/delete_report',
			set_filters: 'users/set_reports_filters',
			start_report: 'users/start_report',
		}),

		manualStartReport({row}) {
			// console.log(row)
			const {tt} = this;
			this.confirmHelper({
				message: `${tt('Start')} ${tt('Report')} <b>${row.name}</b> - ${tt('manually')}?`
			}).then(() => {
				this.itemsLoading = true;
				this.start_report({	userId: this.userId, reportId: row.id }).then(() => {
					this.itemsLoading = false;
				}).catch(() => {
					this.itemsLoading = false;
				});
			})
			.catch(() => {});
		},

		deleteItem(data) {
			// console.log(data)
			this.delete_item({ data: {id:data.ids[0]}, userId: this.userId }).then(() => {
				this.refetchItemsList();
			});
		},

		setupWeekdaysCell(days) {
			// console.log(days, weekdays)
			if (!days || !days.length) return '';
			
			let result = '';
			days.forEach(day => {
				result += this.weekdays[day]+', ';
			});
			return result.slice(0, -2);
		}
	}
};
</script>
