<template>
	<div class="view-wrapper view-list-wrapper">
		<div :class="[{ mcontainer: !fromCard }]">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div :class="['view-content-card1 content-row', { card: !fromCard }]">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="true"
						:hideDelete="true"
						searchbarClass="ml-auto"
					>
						<div class="mcol-xs-12 mcol-sm-4 radio-buttons-wrapper">
							<RadioButtonsBlock
								@onChange="handleRadioFilters"
								:settings="radioBlockOptions"
								:optionsList="filterButtonsList"
								:value="filters.type"
							/>
						</div>
					</Filterbar>

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
import { RFQS_TYPES } from '@/constants/global';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue')
	},

	props: {
		equipmentData: {
			type: Object,
			default: null
		},
		editInModal: Boolean,
		fromCard: Boolean
	},

	computed: {
		...mapState({
			filters: state => state.rfqs.filters,
			authUser: state => state.auth.authUser
		}),

		instanceName: () => 'RFQS',

		itemsName() {
			return {
				one: this.$t('phrases.Request_for_quotation'),
				mult: this.$t('phrases.Request_for_quotations'),
				instanceName: 'rfqs'
			};
		},

		predefinedFilters: that => ({
			userId: that.authUser.id,
			equipmentId: that.equipmentData ? that.equipmentData.id : null
		}),

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'type',
						label: 'Type',
						sortable: true,
						meta: {
							getItemValue: { prop: 'name', listName: 'rfqsTypesList' }
						}
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'vendors',
						label: 'Vendors',
						meta: {
							fromArray: { subProp: 'name', delimeter: ', ', inline: true }
						}
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}
					/*{
						prop: 'is_one_click',
						label: 'Is one click',
						meta: {
							boolean: {trueVal: 'Is one click',	falseVal: ''}
						}
					}*/
				]),
				operations: {
					actions: this.$translate(
						[
							/*{
							name: 'editItem',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: 'Details'
						},*/
							// standardTableOperations.edit,
							standardTableOperations.delete
						],
						{ key: 'tooltip_text' }
					)
				}
			});
		},

		radioBlockOptions: () =>
			Object.freeze({
				// title: 'Source type',
				hideTitle: true,
				buttonType: 'info',
				className: 'filled inverted',
				clearable: true
				// useValue: true
			}),

		filterButtonsList: () =>
			Object.freeze([
				{ id: RFQS_TYPES.FOR_BUY, title: "RFQ's" },
				{ id: RFQS_TYPES.FOR_SERVICE, title: 'Service History' }
			])
	},

	methods: {
		...mapActions({
			fetch_items: 'rfqs/fetch_rfqs',
			delete_item: 'rfqs/delete_rfq',
			set_filters: 'rfqs/set_rfqs_filters'
		}),

		handleRadioFilters(value) {
			// let newFilters = { ...newFilters, ...value };
			if (value === this.filters.type) {
				this.setFilters({ type: null });
			} else {
				this.setFilters({ type: value });
			}
		}
	}
};
</script>
