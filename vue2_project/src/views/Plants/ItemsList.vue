<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="!hasAccesToCreate"
						:hideDelete="!hasAccesToDelete"
					>
						<!-- disableMainButtonsFluid -->
						<template v-if="$hasAccessTo(['archive_companies', 'archive_plants'], 'some')">
							<div class="filter-item checkbox-item ">
								<el-checkbox
									:value="filters.archived"
									:false-label="null"
									@change="val => setFilters({ archived: val })"
								>
									<span class="semi-bold">{{ $t('phrases.Show_Archived') }}</span>
								</el-checkbox>
							</div>
						</template>
					</Filterbar>

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
// console.log(itemsDataMixin)
export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	/*data: () => ({
		showTestChart: true
	}),*/

	computed: {
		...mapState({
			filters: state => state.plants.filters
			// authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Plant'),
				mult: this.$t('Plants'),
				instanceName: 'plants'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_plants']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_plants']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_plants']),
		hasAccesToView: that => that.$hasAccessTo(['view_plants']),

		tableSettings() {
			let actions = [];

			if (this.hasAccesToView) {
				actions.push({
					name: 'goToDashboard',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: 'Details'
				});
			}
			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return {
				columns: this.$translate([
					{ prop: 'name', label: 'Name', sortable: true, min_width: 150,
						meta: {
							prepareValue: {
								localMethod: this.setupPlantName,
								useAllInstanceData: true
							}
						}
					},
					{ prop: 'address', label: 'Address', sortable: true, min_width: 120 },
					{
						prop: 'company.name',
						label: 'Company',
						sortable: true,
						min_width: 130,
						meta: { sortBy: 'company' }
					}
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			};
		},

		excludeGetParams: () => ['plantId']
	},

	methods: {
		...mapActions({
			fetch_items: 'plants/fetch_plants',
			delete_item: 'plants/delete_plant',
			set_filters: 'plants/set_plants_filters',
			set_global_filters: 'set_global_filters'
		}),

		goToDashboard({ row }) {
			const newFilters = { ...this.globalFilters, plantId: row.id };
			this.set_global_filters(newFilters);
			this.changeRoute({ path: '/dashboard/plant' });
		},

		setupPlantName(plant) {
			let result = `<span class="div-block">${plant.name}</span>`;

			if (plant.company.is_archived || plant.is_archived) {
				result += `<span class="archived-label div-block">${this.$t('Archived')}</span>`;
			}

			return result;
		}
	}
};
</script>
