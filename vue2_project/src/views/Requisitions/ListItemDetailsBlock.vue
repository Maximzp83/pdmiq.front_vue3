<template>
	<div class="card overflowHidden details-block vertical-fluid">
		<div class="card-header filled_2 ">
			<div class="title semi-bold uppercase">
				{{ `${tt('DETAILS')} ${tt('WORK_ORDER')}` }}
			</div>
		</div>

		<CustomTransition mode="trigger" :trigger="itemData">
			<!-- <transition name="standard-fade" mode="out-in"> -->
			<div v-if="!usedItemData" :class="['card-content flex mrow align-center']">
				<div class="mcol-xs-5 text-part">
					<i class="icomoon icon-eye success-color"></i>
					<span class="semi-bold">{{
						tt(
							'phrases.to_view_the_information_of_the_work_order_click_on_the_preview_button_from_the_list_of_work_orders'
						)
					}}</span>
				</div>

				<div class="mcol-xs-7 image-part">
					<div class="imgWrapper factory-img">
						<img :src="factoryWallpaper" alt="img error" />
					</div>
				</div>
			</div>

			<div v-else :class="['details-data-container']">
				<div class="part-item top-part flex space-between">
					<div class="plant-info">
						<div class="imgWrapper" v-if="requisitionPlantData.image">
							<img src="" alt="" />
						</div>

						<div class="">
							<div class="uppercase semi-bold">{{ requisitionPlantData.name }}</div>
							<div class="muted">{{ tt('Requisition') }}</div>
						</div>
					</div>

					<div class="flex align-center" v-if="showDetailsButton">
						<el-button
							class="action-button"
							@click="handleShowDetails(usedItemData.id)"
							size="mini"
							type="success"
							icon="icomoon icon-docs"
						/>
					</div>
				</div>

				<div class="part-item data-part">
					<div class="data-item">
						<div class="data-value">{{ hours }}</div>
						<div class="data-label">{{ tt('Hours') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">${{ usedItemData.proposed_cost }}</div>
						<div class="data-label">{{ tt('Budget_Cost') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">${{ usedItemData.actual_cost }}</div>
						<div class="data-label">{{ tt('Fab_Shop_Budget') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">${{ usedItemData.execution_cost }}</div>
						<div class="data-label">{{ tt('Running_Total') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ timeLeft }}</div>
						<div class="data-label">{{ tt('Time_left') }}</div>
					</div>
					<!-- <div class="data-item">
						<div class="data-value">{{ usedItemData.shipping_method || '-' }}</div>
						<div class="data-label">Shipping method</div>
					</div> -->
				</div>

				<div :class="['progress-part', { denied: orderStatus.isDenied }]">
					<div class="content-container">
						<div
							:class="[
								'progress-item',
								{ active: item.active },
								{ 'red-status': item.redStatus }
							]"
							v-for="item in progressItems"
							:key="`progressi-${item.id}`"
						>
							<div :class="['circle']">
								<span>{{ item.id }}</span>
								<i
									:class="['icomoon', item.redStatus ? 'icon-cross' : 'icon-check']"
								></i>
							</div>

							<div class="label">{{ item.label }}</div>
						</div>
					</div>
				</div>
			</div>
			<!-- </transition> -->
		</CustomTransition>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

// import moment from 'moment';

/*Vue.use(require('vue-moment'), {
		moment
})
*/
import { findItemBy, formatTime, getTimeDifference } from '@/helpers';
// import { calcFabShopBudget } from '@/helpers/specialHelpers';

import { factoryWallpaper, REQUISITION_STATUSES_TYPES } from '@/constants/global';
import { navigation, requestsListMixin } from '@/mixins';

export default {
	mixins: [navigation(), requestsListMixin()],

	props: {
		itemData: null,
		// settings: { type: Array, required: true },
		progress: Number,
		title: String,
		showDetailsButton: Boolean,

		actionButtons: {
			type: Array,
			default: () => []
		},

		usersList: { type: Array, default: () => [] }
	},

	data() {
		return {
			plantsList: [],
			plantsLoading: false,

			usedItemData: null
		};
	},

	computed: {
		// getObjectVal: () => getObjectVal,
		factoryWallpaper: () => factoryWallpaper,

		requestsToDoList: () => [
			{
				action: 'fetch_plants',
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}
		],

		requisitionPlantData() {
			if (this.usedItemData) {
				return (
					findItemBy(
						'id',
						this.usedItemData.requisition_plant_id,
						this.plantsList
					) || {}
				);
			}
			return {};
		},

		orderStatus() {
			const { usedItemData } = this;

			return Object.freeze({
				isPending: usedItemData.status === REQUISITION_STATUSES_TYPES.PENDING,
				isApproved: usedItemData.status === REQUISITION_STATUSES_TYPES.APPROVED,
				isDenied: usedItemData.status === REQUISITION_STATUSES_TYPES.DENIED,
				isCompleted: usedItemData.status === REQUISITION_STATUSES_TYPES.COMPLETED,
				// isShipping: usedItemData.shipping_receive_date && usedItemData.status === REQUISITION_STATUSES_TYPES.APPROVED,
				isInWork: usedItemData.status === REQUISITION_STATUSES_TYPES.IN_WORK
			});
		},

		progressItems() {
			const {
				// isPending,
				isApproved,
				isCompleted,
				isInWork,
				/*isShipping,*/ isDenied
			} = this.orderStatus;
			const { $t } = this;

			return Object.freeze([
				{ id: 1, label: $t('Created'), active: true },
				{
					id: 2,
					label: isDenied ? $t('Denied') : $t('Approve'),
					active: isApproved || isDenied || isInWork || isCompleted,
					redStatus: isDenied
				},
				{ id: 3, label: $t('phrases.In_Work'), active: isInWork || isCompleted },
				{ id: 4, label: $t('Complete'), active: isCompleted }
			]);
		},

		hours() {
			if (this.usedItemData) {
				return formatTime(this.usedItemData.execution_total_time, 'h:m');
			}
			return '-';
		},

		timeLeft() {
			const { usedItemData } = this;
			let result = '-';

			if (usedItemData) {
				let { days, hours } = getTimeDifference({
					from: new Date(),
					to: usedItemData.complete_at
				});

				if (hours < 0 || days < 0) {
					result = '0h';
				} else {
					result = `${days}d ${hours}h`;
				}
			}

			return result;
		}

		/*fabShopBudget: that => that.itemData ? 
			calcFabShopBudget({
				cellValue: that.itemData,
				args: { usersList: that.usersList, emptyText: '0' }
			}) :
			'-',*/
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants'
		}),

		event(name, data) {
			this.$emit('event', name, data);
		},

		handleShowDetails(id) {
			this.changeRoute({
				path: `/requisitions/${id}`
			});
		}
	},

	watch: {
		itemData(data) {
			// console.log(data)
			// this.fadeOut = true;

			setTimeout(() => {
				this.usedItemData = data;
				// this.fadeOut = false;
			}, 250);
			// setTimeout(() => {this.usedItemData = data;}, 500);
		}
	},

	mounted() {
		this.usedItemData = this.itemData;

		// console.log(moment(new Date(),"DD/MM/YYYY HH:mm:ss"))
	}
};
</script>
