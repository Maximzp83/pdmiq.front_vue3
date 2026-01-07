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
import {
	itemsDataMixin,
	eventHandler,
	navigation
	// additionalActionsMixin
} from '@/mixins';
import { updateFormData } from '@/helpers';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		navigation() /*additionalActionsMixin*/
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.ultrasound_pumps.filters
		}),

		itemsName() {
			return {
				one: this.$t('Pump'),
				mult: this.$t('Pumps'),
				instanceName: 'ultrasound_pumps'
			};
		},

		tableSettings() {
			return {
				columns: this.$translate([
					{ prop: 'position', label: 'Position', sortable: true },
					{
						prop: 'type',
						label: 'Type',
						sortable: true,
						meta: {
							getItemValue: { prop: 'name', listName: 'pumpTypesList' }
						}
					},
					{
						prop: 'radio.position',
						label: 'phrases.radio_node_position',
						sortable: true
					}
				]),
				operations: {
					actions: this.$translate(
						[
							{
								name: 'nullifyLubeCount',
								submit_action: 'submitPump',
								title: 'position',
								type: 'warning',
								icon: 'icomoon icon-fill'
							},
							standardTableOperations.edit,
							standardTableOperations.delete
						],
						{ key: 'tooltip_text' }
					)
				}
			};
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'ultrasound_pumps/fetch_ultrasound_pumps',
			delete_item: 'ultrasound_pumps/delete_ultrasound_pump',
			save_pump: 'ultrasound_pumps/save_ultrasound_pump',

			set_filters: 'ultrasound_pumps/set_ultrasound_pumps_filters'
		}),

		nullifyLubeCount(data) {
			this.additionalActionConfirm(data);
		},

		submitPump({ row }) {
			const pump = row;

			const formData = {
				id: null,
				type: null,
				sensor_id: null,
				radio_id: null,
				position: '',
				lube_cycle_max_count: 0,
				lube_cycle_warning_count: 0,
				lube_cycle_spent_count: 0,
				solenoids: []
			};

			let additional_parameter = { nullify_spent_lube_count: true },
				resultMessage = { text: 'clear lube count success' };

			const payload = {
				data: { ...updateFormData(pump, formData), ...additional_parameter },
				resultMessage: resultMessage
			};

			// console.log(payload);
			this.save_pump(payload);
		}
	}
};
</script>
