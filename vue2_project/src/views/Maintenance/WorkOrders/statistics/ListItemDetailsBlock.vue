<template>
	<div class="card overflowHidden details-block vertical-fluid">
		<div class="card-header filled_2 ">
			<div class="title semi-bold uppercase">
				{{ `${tt('DETAILS')} ${tt('WORK_ORDER')}` }}
			</div>
		</div>

		<CustomTransition mode="trigger" :trigger="itemData">
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
				<!-- <div class="part-item top-part flex space-between">
					<div class="plant-info">
						<div class="imgWrapper" v-if="requisitionPlantData.image">
							<img src="" alt="" />
						</div>

						<div class="">
							<div class="uppercase semi-bold">{{ requisitionPlantData.name }}</div>
							<div class="muted">Requisition</div>
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
				</div> -->

				<div class="part-item data-part">
					<div class="data-item">
						<div class="data-value">{{ usedItemData.finish_date || '-' }}</div>
						<div class="data-label">{{ tt('Due_Date') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ usedItemData.id }}</div>
						<div class="data-label">{{ tt('WO') }}#</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ machine_name }}</div>
						<div class="data-label">{{ tt('phrases.Machine_Name') }}</div>
					</div>
				</div>

				<div class="part-item data-part">
					<div class="data-item">
						<div class="data-value">{{ usedItemData.title }}</div>
						<div class="data-label">{{ tt('phrases.Work_Order_Name') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value">{{ woStatus }}</div>
						<div class="data-label">{{ tt('Status') }}</div>
					</div>
					<div class="data-item">
						<div class="data-value" v-html="assignedUsers"></div>
						<div class="data-label">{{ tt('Technician') }}</div>
					</div>
				</div>

				<div :class="['progress-part']">
					<div class="content-container">
						<div
							:class="[
								'progress-item',
								{ active: item.active },
								{ 'display-none': item.hide },
								{ 'red-status': item.redStatus }
							]"
							v-for="item in progressItems"
							:key="`progressi-${item.id}`"
						>
							<div :class="['circle']">
								<i
									:class="['icomoon', item.active ? 'icon-check' : 'icon-cross']"
								></i>
							</div>

							<div class="label">{{ item.label }}</div>
						</div>
					</div>
				</div>
			</div>
		</CustomTransition>
	</div>
</template>

<script>
// import { mapActions } from 'vuex';

import {
	findItemBy,
	setupAssignedUsers,
	getTimeDifference,
	getDateRange
} from '@/helpers';
// import { calcFabShopBudget } from '@/helpers/specialHelpers';

import {
	factoryWallpaper,
	workOrdersStatusesList,
	WORK_ORDER_STATUSES_TYPES
} from '@/constants/global';
import { navigation } from '@/mixins';

export default {
	mixins: [navigation()],

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
			// plantsList: [],
			// plantsLoading: false,
			usedItemData: null
		};
	},

	computed: {
		// getObjectVal: () => getObjectVal,
		machine_name: that =>
			that.usedItemData && that.usedItemData.machine
				? that.usedItemData.machine.name
				: '-',

		woStatus() {
			if (this.usedItemData) {
				const status = findItemBy(
					'id',
					this.usedItemData.status,
					workOrdersStatusesList()
				);
				return status.name;
			}
			return '';
		},

		assignedUsers() {
			return setupAssignedUsers(this.usedItemData, { usersList: this.usersList });
		},

		factoryWallpaper: () => factoryWallpaper,

		progressItems() {
			const { usedItemData } = this;

			const { days, lessZero } = getTimeDifference({
				from: new Date(),
				to:
					usedItemData.finish_date ||
					getDateRange('yesterday', {
						getDateString: true
					})[0]
			});

			// console.log(days, seconds_total )
			const isCompleted =
				usedItemData.status === WORK_ORDER_STATUSES_TYPES.COMPLETED;

			let progressList = [
				{ id: 1, label: 'Created', active: true },
				{ id: 2, label: 'Due_this_week', active: days < 8 || isCompleted },
				{ id: 3, label: 'Due_Today', active: days <= 0 || isCompleted },
				{ id: 4, label: 'Late', hide: !lessZero, redStatus: true },
				{ id: 5, label: 'Complete', active: isCompleted }
			];

			return Object.freeze(this.$translate(progressList));
		}
	},

	methods: {
		event(name, data) {
			this.$emit('event', name, data);
		}

		/*handleShowDetails(id) {
			this.changeRoute({
				path: `/requisitions/${id}`
			});
		}*/
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
