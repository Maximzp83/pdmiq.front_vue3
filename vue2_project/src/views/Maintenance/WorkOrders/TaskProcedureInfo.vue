<template>
	<div class="card">
		<div class="card-header filled bold flex relative">
			<span class="uppercase">{{ tt('TASK_PROCEDURES') }}</span>
			<button
				v-if="showClose"
				class="ml-auto popupCloseButton"
				type="button"
				@click="closeDialog"
			>
				<i class="icomoon icon-plus"></i>
			</button>
		</div>
		<div class="card-content">
			<div class="content-row article-title bold">{{ taskProcedure.name }}</div>

			<div class=" card">
				<div class="card-content">
					<CustomDataListTable
						ref="ItemsTableContainer"
						disableSelection
						:itemsLoading="isLoading"
						:tableData="taskProcedure.processes"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	components: {
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
	},

	props: {
		taskProcedure: Object,
		isLoading: Boolean,
		showClose: Boolean
	},

	computed: {
		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						label: 'Name',
						prop: 'name'
					},
					{
						label: 'Notes',
						prop: 'notes'
					},
					{
						label: 'Expected_Time',
						prop: 'expected_time'
					},
					{
						label: 'Parts',
						prop: 'parts',
						meta: {
							fromArray: { subProp: 'stockPart.part_number', delimeter: ' ' }

							// cell_class: 'table-cell-image',
							/*prepareValue: {
								method: 'setupPartsList',
								args: {
									partsList: this.partsList
								}
							}*/
						}
					},
					{
						label: '',
						prop: 'parts',
						meta: {
							fromArray: { subProp: 'quantity', delimeter: ' ' }
						}
					}
				])
			});
		},
		itemsName() {
			return {
				one: this.$t('Process'),
				mult: this.$t('Processes')
			};
		}
	},

	methods: {
		closeDialog() {
			this.$emit('closeDialog');
		}
	}
};
</script>
