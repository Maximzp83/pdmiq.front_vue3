<template>
	<div
		class="edit-form-container maintenance-form work-order-details-item card content-row"
	>
		<div class="card-header filled_2 flex align-center">
			<div class="step-number bold span-block">
				<span>{{ progress }}</span>
			</div>

			<div class="span-block semi-bold uppercase">{{ title }}</div>

			<el-button
				v-if="orderStatus.isApproved && (isTechnician || isFabManager)"
				@click="handleTakeInWork"
				native-type="button"
				type="primary"
				:class="['ml-auto item-action-button']"
			>
				{{ tt('phrases.Start_Work_Order') }}
			</el-button>
		</div>

		<div class="card-content">
			<!-- <div class="header-block flex align-center">
				<div class="step-number bold span-block">
					<span>{{ progress }}</span>
				</div>
			</div> -->

			<div
				class="mrow flex wrap big-padding mcol-xs-12"
				v-if="
					orderStatus.isApproved ||
						orderStatus.isInWork ||
						(orderStatus.isCompleted && isFabManager)
				"
			>
				<div
					class="mcol-xs-12 mcol-sm-6"
					v-for="item in filteredTechnicalProcesses"
					:key="`proccess-${item.id}`"
				>
					<CompleteForm
						@event="handleEventNew"
						:itemData="item"
						:orderData="itemData"
						:isFabManager="isFabManager"
						:orderStatus="orderStatus"
					/>
				</div>
			</div>

			<!-- <div class="mrow flex mcol-xs-12 wrap big-padding"> -->
			<div
				class="mrow flex mcol-xs-12 big-padding wrap"
				v-else-if="orderStatus.isCompleted"
			>
				<div
					class="mcol-xs-12 mcol-sm-6"
					v-for="item in filteredTechnicalProcesses"
					:key="`technician-${item.id}`"
				>
					<DetailsItem
						:title="`Techinician: ${item.technician.full_name}`"
						@event="handleEventNew"
						:orderData="item"
						:settings="settingsStep4"
					/>
				</div>
			</div>
		</div>

		<!-- <div v-else class="card-content semi-bold">
			Requisitioner didn't approved this order yet
		</div> -->
	</div>
</template>

<script>
import { /*mapActions*/ mapState } from 'vuex';

import { formatTime, convertMsToHours } from '@/helpers';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		CompleteForm: () => import('./CompleteForm.vue'),
		DetailsItem: () => import('./DetailsItem.vue')
	},
	props: {
		progress: Number,
		title: String,
		// isInWork: Boolean,
		orderStatus: Object,
		isFabManager: Boolean,
		itemData: Object,
		technicalProcesses: Array
	},

	data() {
		return {};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser
		}),

		filteredTechnicalProcesses() {
			if (this.technicalProcesses.length) {
				return this.technicalProcesses.filter(tp => !!tp.technician);
			}
			return [];
		},

		settingsStep4: that =>
			Object.freeze([
				// { id: 1, label: 'Start Time', prop: 'execution_start_time', },
				// { id: 2, label: 'End Time', prop: 'execution_finish_time' },
				{
					id: 1,
					label: 'Execution Times',
					prop: 'executionTimes',
					meta: {
						isArray: [
							{ id: 11, label: 'Date', prop: 'date' },
							{ id: 12, label: 'Time', prop: 'time' }
						]
					}
				},
				{
					id: 3,
					label: 'Total Time',
					prop: 'total_time',
					meta: {
						prepareValue: {
							localMethod: that.setupTotalTime
							// useAllInstanceData: true
						}
					}
				},
				{
					id: 4,
					label: 'Attachments',
					prop: 'attachments',
					// prop: 'completedAttachments',
					buttonSettings: { action: 'downloadFile', className: 'link underline' },
					meta: { isAttachment: true }
				},
				{ id: 5, label: 'Work Order Report', prop: 'execution_report_details' }
			]),

		isTechnician() {
			const { authUser } = this;
			if (this.filteredTechnicalProcesses) {
				return this.filteredTechnicalProcesses.some(
					tpi => tpi.technician && tpi.technician.id === authUser.id
				);
			}
			return false;
		}
	},

	methods: {
		handleTakeInWork() {
			this.$emit('event', {
				eventName: 'handleTakeInWork',
				onward: true
			});
		},

		setupTotalTime(sec) {
			const { total_hours, total_mins } = convertMsToHours(sec * 1000);
			return formatTime(`${total_hours}:${total_mins}`, 'H:M');
		}
	}
};
</script>
