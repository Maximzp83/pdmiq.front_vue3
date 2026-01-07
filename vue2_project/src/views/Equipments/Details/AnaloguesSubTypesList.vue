<template>
	<CustomDataListTable
		class="analogues-subtype-row-table"
		v-if="brand"
		hideHeader
		disableSelection
		ref="ItemsTableContainer"
		@event="handleEventNew"
		:tableData="itemsList"
		:tableSettings="tableSettings"
		:itemsName="itemsName"
	/>
</template>

<script>
// import { findItemBy } from '@/helpers';
import { eventHandler } from '@/mixins';
import { setupTableCellImage } from '@/helpers';

export default {
	mixins: [eventHandler()],

	components: {
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
	},

	props: {
		propsData: Object
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('phrases.Request_for_quotation'),
				mult: this.$t('phrases.Request_for_quotations'),
				instanceName: 'analogues'
			};
		},

		brand: that => that.propsData.subTypeBrand,

		itemsList() {
			return Object.freeze([
				{
					asset: this.propsData.asset,
					brand: this.brand,
					model: this.propsData.subTypeModel
				}
			]);
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
						label: 'Asset',
						prop: 'asset.name'
						// width: '23%'
					},
					{
						label: 'Brand',
						prop: 'brand.name'
						// width: '23%'
					},
					{
						label: 'Part_number',
						prop: 'model.name'
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

				operations: {
					// width: '3%',
					actions: [
						/*{
							linkSettings: {
								linkRoute: 'equipments/:id/details/main'
								// target: '_blank'
							},
							className:
								'el-button action-button el-button--mini el-button--success',
							icon: 'icomoon icon-eye',
							forceRerender: 'viewContentComponentKey',
							tooltip_text: this.$t('Details')
						}*/
					]
				}
			});
		}
		// dashboardSensors: that => that.propsData.dashboardSensors
	}
};
</script>
