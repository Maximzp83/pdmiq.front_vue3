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

			<!-- <div class="pagination content-row card" v-if="!ultrasound_radiosLoading">
			</div> -->
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
			filters: state => state.ultrasound_radios.filters
		}),

		itemsName() {
			return {
				one: this.$t('Radio_node'),
				mult: this.$t('Radio_nodes'),
				instanceName: 'ultrasound_radios'
			};
		},

		tableSettings() {
			return {
				columns: [
					{
						prop: 'position',
						label: `${this.tt('Node')} #`,
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}
					// { prop: 'address', label: 'Address', sortable: true },
				],
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
			fetch_items: 'ultrasound_radios/fetch_ultrasound_radios',
			delete_item: 'ultrasound_radios/delete_ultrasound_radio',

			set_filters: 'ultrasound_radios/set_ultrasound_radios_filters'
		})
	}

	/*beforeMount() {
		this.fetchItems(this.filters);
	},

	beforeDestroy() {
		this.set_items([]);
	}*/
};
</script>
