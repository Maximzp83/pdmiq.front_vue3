<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<h1 class="title page-title">{{ itemsName.mult }}</h1>
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
					/>

					<CustomDataListTable
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
			filters: state => state.solenoids.filters
		}),

		itemsName() {
			return {
				one: this.$t('Solenoid'),
				mult: this.$t('Solenoids'),
				instanceName: 'solenoids'
			};
		},

		tableSettings() {
			return {
				columns: this.$translate([
					{
						prop: 'gracoPump.lubricator_id',
						label: 'Lubricator',
						label_postfix: ' id',
						sortable: true,
						meta: {
							sortBy: 'lubricator_id'
						}
					},
					{
						prop: 'gracoPump.id',
						label: 'Graco_pump',
						label_postfix: ' id',
						sortable: true,
						meta: {
							sortBy: 'graco_pump_id'
						}
					},
					{
						prop: 'sensor.equipment_id',
						label: 'Sensor_equipment',
						label_postfix: ' id',
						sortable: true,
						meta: {
							sortBy: 'equipment_id'
						}
					},
					{ prop: 'position', label: 'Position', sortable: true }
				]),
				operations: {
					actions: this.$translate(
						[standardTableOperations.edit, standardTableOperations.delete],
						{ key: 'tooltip_text' }
					)
				}
			};
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'solenoids/fetch_solenoids',
			delete_item: 'solenoids/delete_solenoid',

			set_filters: 'solenoids/set_solenoids_filters'
		})
	}
};
</script>
