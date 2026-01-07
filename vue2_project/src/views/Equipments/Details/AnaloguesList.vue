<template>
	<!-- <div class=""> -->
	<CustomDataListTable
		class="analogues-table"
		disableSelection
		ref="ItemsTableContainer"
		@event="handleEventNew"
		:tableData="itemsList"
		:tableSettings="tableSettings"
		:itemsName="itemsName"
	/>
	<!-- </div> -->
</template>

<script>
// import { mapState, mapActions } from 'vuex';
import { setupTableCellImage } from '@/helpers';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
	},

	props: {
		itemsList: {
			type: Array,
			default: null
		}
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('phrases.Request_for_quotation'),
				mult: this.$t('phrases.Request_for_quotations'),
				instanceName: 'analogues'
			};
		},

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'pictures',
						label: 'Image',
						width: 110,
						meta: {
							cell_class: 'table-cell-image',
							prepareValue: {
								localMethod: setupTableCellImage
							}
						}
					},
					{
						prop: 'asset.name',
						label: 'Asset'
						// width: '23%'
					},
					{
						prop: 'brand.name',
						label: 'Brand'
						// width: '23%'
					},
					{
						prop: 'model.name',
						label: 'Part_number'
						// width: '23%'
					}

					/*{
						prop: 'vendors',
						label: 'Vendors',
						meta: {
							fromArray: { subProp: 'name', delimeter: ', ', inline: true }
						}
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}*/
				]),

				expandedRowSettings: {
					componentPath: 'views/Equipments/Details/AnaloguesSubTypesList'
					// componentName: 'TableExpandedRow'
				},

				operations: {
					// width: '9%',
					actions: [
						{
							linkSettings: {
								linkRoute: 'equipments/:id/details/main'
								// target: '_blank'
							},
							className:
								'el-button action-button el-button--mini el-button--success',
							icon: 'icomoon icon-eye',
							forceRerender: 'viewContentComponentKey',
							tooltip_text: this.$t('Details')
						}
					]
				}
			});
		}
	}
};
</script>
