<template>
	<div class="view-wrapper view-list-wrapper">
		<div :class="[{ mcontainer: !fromDetailsPage }]">
			<div :class="['card content-row', { 'view-content-card': !fromDetailsPage }]">
				<div v-if="showCardHeader" class="flex align-center card-header filled_2">
					<h1 class="title page-title outside-bg-addition uppercase">
						{{ tt('Location') }}
					</h1>
				</div>

				<div class="card-content">
					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:tableData="storeRoomsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						disableSelection
					/>

					<!-- <PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
					/> -->
				</div>
			</div>

			<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
// import { equipmentCardTitle } from '@/helpers/specialHelpers';
import { findItemBy } from '@/helpers';

import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
// import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		// Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
		// PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	props: {
		fromDetailsPage: Boolean,
		showCardHeader: Boolean
	},

	computed: {
		...mapState({
			filters: state => state.equipments.filters
			// plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('Storeroom'),
				mult: this.$t('Storerooms'),
				instanceName: 'Equipments'
			};
		},

		// excludeGetParams: () => Object.freeze(['hasSensors', 'daterange', 'storeroomId', 'dataSet', 'sensorType']),

		acceptedFilters: () => Object.freeze(['plantId', 'brandModelId']),

		editInModal: () => true,

		tableSettings() {
			return Object.freeze({
				columns: [
					{
						label: this.$t('Storerooms'),
						prop: 'name'
						/*meta: {
							prepareValue: {
								localMethod: this.setupStoreroomColumn,
							}
						}*/
					},
					{
						label: this.$t('Storeroom_location'),
						prop: 'storeroom_location.name'
					},
					{
						label: 'QNT',
						prop: ' ',
						meta: {
							emptyText: '1'
						}
					}
				],
				operations: {
					actions: [
						{
							name: 'handleShowInfo',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: this.$t('Details')
						},
						{
							name: 'handleMove',
							type: 'success',
							button_text: 'Move',
							className: 'width-auto paddings',
							tooltip_text: this.$t('Move_To_Storeroom')
						},
						{
							name: 'handleDeleteEquipment',
							type: 'danger',
							icon: 'icomoon icon-cross',
							tooltip_text: this.$t('Delete')
						}
					]
				}
			});
		},

		storeRoomsList() {
			let list = [];
			if (this.itemsList.length) {
				// const storeRooms = getValues('storeRooms', this.itemsList);
				this.itemsList.forEach(li => {
					li.storeRooms.forEach(storeroom => {
						let storeroom_location;
						const equipment_storeroom = findItemBy(
							'store_room_id',
							storeroom.id,
							li.equipmentStoreRooms
						);
						if (equipment_storeroom) {
							storeroom_location = equipment_storeroom.store_room_location;
						}
						list.push({
							equipment_id: li.id,
							...storeroom,
							storeroom_location: storeroom_location
						});
					});
				});
			}

			return Object.freeze(list);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'equipments/fetch_equipments',
			delete_item: 'equipments/delete_equipment',
			set_filters: 'equipments/set_equipments_filters'
		}),

		handleShowInfo({ row }) {
			this.changeRoute({ path: `/equipments/${row.equipment_id}/details` });
		},

		handleDeleteEquipment({ row }) {
			this.handleDeleteItems({
				row: { id: row.equipment_id }
			});
		},

		handleMove({ row }) {
			const payload = {
				row: row,
				modal_settings: {
					title: this.$t('Move_Item'),
					editModalProp: 'editModalClassic',
					componentPath: 'BrandModels/Details/MoveForm',
					// className: 'maintenance-modal',
					additionalModalSettings: {
						plantId: row.plant_id,
						equipmentId: row.equipment_id
					},
					modalClassName: 'fixed-header-footer small-header small-footer',
					callback: () => {
						this.refetchItemsList();
						this.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
					}
				}
			};
			// console.log(payload)
			this.editItem(payload);
		}

		/*setupStoreroomColumn(data) {
			const values = getValues('name', data);
			// console.log(values)
			let result = '<span>';
			values.forEach((vi, idx) => {
				if (idx) result += ', ';
				result += vi;
			})
			result += '</span>'
			return result;
		}*/
	}
};
</script>
