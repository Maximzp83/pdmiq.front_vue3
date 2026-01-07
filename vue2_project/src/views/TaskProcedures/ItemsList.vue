<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
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
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.task_procedures.filters,
			plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('Task_procedure'),
				mult: this.$t('Task_procedures'),
				instanceName: 'task_procedures'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_task_procedures']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_task_procedures']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_task_procedures']),

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
						sortable: true,
						min_width: 110
					},
					{
						prop: 'plant_id',
						label: 'Plant',
						sortable: true,
						min_width: 110,
						meta: {
							sortBy: 'plant_name',
							getItemValue: { prop: 'name', list: this.plantsList }
						}
					},
					{
						label: 'Processes',
						prop: 'processes',
						min_width: 110,
						meta: {
							fromArray: { subProp: 'name', delimeter: ', ' }
						}
					}
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'task_procedures/fetch_task_procedures',
			delete_item: 'task_procedures/delete_task_procedure',
			set_filters: 'task_procedures/set_task_procedures_filters'
		})
	}
};
</script>
