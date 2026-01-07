<template>
	<div
			:class="[
				'sensor-item multiview-item',
			]"
		>
			<div class="content-container sensor-main-block relative">
				<div class="semi-bold capitalize fluid">{{itemData.name}}</div> 
				
				<TableCell
					class="icon-item"
					@event="handleEventNew"
					v-for="(column, columnIdx) in iconsAndButtonsSettings"
					:key="`icon-${columnIdx}`"
					:rowData="itemData"
					:columnIdx="columnIdx"
					:column="column"
				/>
			</div>
		</div>
</template>

<script>
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	props: {
		itemData: { type: Object, required: true },
	},

	components: {
		TableCell: () => import('@/components/table/TableCell.vue')
	},

	/*data() {
		return {
			selected_id: null
		};
	},*/
	computed: {
		iconsAndButtonsSettings() {
			const { itemData } = this;

			return Object.freeze([
				{
					// -------Actions----
					show_anyway: true,
					meta: {
						additionalActions: [
							{
								linkSettings: {
									linkRoute: `equipments/${itemData.equipment_id}/details/multi-view/${itemData.id}`
								},
								// name: 'openSensorStatistics',
								tooltip_text: this.$t('phrases.Multi_view_Charts'),
								icon: 'icomoon icon-chart3'
							},
						]
					}
				}
			])
		}
	},

	methods: {
		
	}

};
</script>
