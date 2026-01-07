<template>
	<div class="edit-form-container maintenance-form work-order-details-item card">
		<SimpleSpinner :active="processing" />

		<div class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
			<!-- <div class="ml-auto button-item" v-if="headerButtons.length">
				<el-button
					v-for="button in headerButtons"
					:key="`hbutton-${button.id}`"
					@click="eventNew(button.event, button.args)"
					native-type="button"
					type="primary"
					:class="['item-action-button', button.className]"
				>
					<i v-if="button.icon" :class="[button.icon]"></i>
					<span>{{ button.text }}</span>
				</el-button>
			</div> -->
		</div>

		<div class="card-content flex top">
			<el-form
				:class="[
					'item-edit-form relative section-row',
					{ showJustInfo: showJustInfo }
				]"
				label-width="150px"
				ref="itemForm"
				:model="formData"
				:rules="rules"
				:label-position="isMobile || !fromModal ? 'top' : 'left'"
			>
				<el-form-item prop="execution_times" class="">
					<div class="inline-form-items-list vertical-fluid">
						<ExecTimesItem
							ref="ExecTimesItem"
							v-for="(item, idx) in execTimesItemsList"
							:key="`exectimes_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onCreate="addFormItem('execTimesItemsList', 'et_i-')"
							@onRemove="id => removeFormItem(id, 'execTimesItemsList')"
							@calcTotalTime="calcTotalTime"
							:isLast="execTimesItemsList.length == idx + 1"
							:hideCreateButton="showJustInfo"
						/>
					</div>
				</el-form-item>

				<el-form-item label="Total Hours:" class="showJustInfo">
					<div class="el-form-item__content">
						<b>{{ local_execution_total_time }}</b>
					</div>
				</el-form-item>

				<el-form-item :label="tt('Attachments')" prop="attachments">
					<FileUploadBlock
						ref="AttachmentsUploadBlock"
						uploadBlockType="files-list"
						multiple
						enableLinkToFile
						showDeleteButton
						:accept="' '"
						:buttonText="tt('phrases.upload_files')"
						:pictures="attachmentsList"
					/>
				</el-form-item>

				<el-form-item prop="execution_report_details" :label="tt('Details')">
					<el-input
						type="textarea"
						v-model="formData.execution_report_details"
						rows="5"
					/>
				</el-form-item>

				<div class="no-left-margin FormOperationsButtons" v-if="!showJustInfo">
					<el-button
						@click="onSave(0)"
						native-type="button"
						class="item-action-button"
					>
						<span class="uppercase">{{ tt('COMPLETE') }}</span>
					</el-button>

					<el-button
						@click="onSave(1)"
						type="primary"
						native-type="button"
						class="item-action-button"
					>
						<span class="uppercase">{{ tt('phrases.SAVE_PROGRESS') }}</span>
					</el-button>
				</div>
			</el-form>
		</div>
		<!-- <div v-else class="card-content semi-bold">
			Requisitioner didn't approved this order yet
		</div> -->
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { formatTime, convertMsToHours } from '@/helpers';

import { required } from '@/constants/validation';
import {
	itemFormMixin,
	// onSelectFileMixin,
	actionButtonsMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		// onSelectFileMixin,
		itemFormMixin(),
		actionButtonsMixin(),
		subItemsListMixin()
	],
	components: {
		// ElTimeSelect: () =>
		// import(/* webpackChunkName: "ElTimePicker" */ 'element-ui/lib/time-select'),
		ExecTimesItem: () => import('./ExecTimesItem.vue'),
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
	},
	props: {
		progress: Number,
		// title: String,
		// headerButtons: Array,
		orderStatus: Object,
		isConcluded: Boolean,
		isFabManager: Boolean,
		technician: Object,
		orderData: Object
	},
	data() {
		return {
			processing: false,
			execTimesItemsList: [],
			local_execution_total_time: '',
			attachmentsList: [],

			formData: {
				// execution_start_time: '',
				// execution_finish_time: '',
				execution_times: [],
				execution_report_details: '',
				attachments: []
			},

			rules: {
				execution_report_details: required
				// execution_times: required,
				// execution_finish_time: required,
			}
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser
		}),

		isTechnician: that =>
			that.itemData.technician && that.authUser.id === that.itemData.technician.id,
		isSamePlantUser() {
			const { fabricationPlant } = this.orderData;
			return fabricationPlant && fabricationPlant.id === this.authUser.plant_id;
		},
		showAsForm: that =>
			that.isTechnician || that.isFabManager /*|| that.isSamePlantUser*/,
		showJustInfo: that => !that.showAsForm,

		/*attachmentsList() {
			return this.formData.attachments.map(ai => {
				var name = ai.file ? ai.file.name : (ai.file_path || ai.full_file_name || ai.name);
				return { ...ai, name };
			});
		},*/

		title: that =>
			that.itemData.technician
				? `${that.itemData.technician.full_name}`
				: 'Technician is missing',

		subItemsSettings: () => Object.freeze([
			{ 
				ref: 'ExecTimesItem', targetProp: 'execution_times',
				conditionSettings: {
					conditions: [
						{ prop: 'date', method: 'notEmpty' },
						{ prop: 'time', method: 'notEmpty' },
						{ prop: 'time', method: '!=', control_value: '00:00' }
					]
				},
			},
			{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments' },
		]),

		/*headerButtons() {
			const { orderStatus, isTechnician, isFabManager } = this;
			let buttons = [];

			if (orderStatus.isApproved && (isTechnician || isFabManager)) {
				buttons.push({ id: 1, text: 'Start Work Order', event: 'handleTakeInWork' });
			}
			return Object.freeze(buttons);
		},*/

		/*timePickerOptions: () => ({
			start: '00:00',
			step: '00:15',
			end: '23:45'
		}),*/

		/*endTimePickerOptions: that => ({
			...that.timePickerOptions,
			minTime: that.formData.execution_start_time
		}),*/
	},

	methods: {
		...mapActions({
			save_item: 'plant_requisitions/complete_requisition'
		}),

		calcTotalTime() {
			setTimeout(() => {
				let total_ms = 0;
				this.$refs['ExecTimesItem'].forEach(ti => {
					const { actual_hours, actual_minutes } = ti._data;
					total_ms +=
						Number(actual_hours) * 3600000 + Number(actual_minutes) * 60000;
				});

				// let total_time = total_ms / 3600000;
				// let total_hours = Math.floor(total_time);
				// let total_mins = Math.round((total_time % 1) * 60);

				const { total_hours, total_mins } = convertMsToHours(total_ms);

				this.local_execution_total_time = formatTime(
					`${total_hours}:${total_mins}`,
					'H:M'
				);
			}, 10);
		},

		onSave(keep) {
			this.confirmHelper({
				message: 'Are You sure?'
			})
				.then(() => {
					this.validateForm({ keep: keep });
				})
				.catch(() => {});
		},

		localSetupPage(item) {
			if (item) {
				const { total_hours, total_mins } = convertMsToHours(item.total_time * 1000);
				this.local_execution_total_time = formatTime(
					`${total_hours}:${total_mins}`,
					'H:M'
				);

				if (item.executionTimes && item.executionTimes.length) {
					this.execTimesItemsList = this.setupFormSubItemsList(
						item.executionTimes,
						'et_i'
					);
				} else {
					if (!this.execTimesItemsList.length) {
						this.addFormItem('execTimesItemsList', 'et_i-');
					}
				}

				if (item.attachments) {
					this.attachmentsList = item.attachments.map(ai => ai);
				}
			}
		},

		localSubmit(data, { keep }) {
			let payload = {
				itemId: this.itemData.id,
				data: { ...data, keep: keep },
				method: 'PUT'
			};

			delete payload.data.id;

			if (payload.data.attachments && payload.data.attachments.length) {
				payload.withFile = payload.data.attachments.some(ai => !!ai.file);
			}

			/*if (process.env.NODE_ENV === 'development') {
				if (payload) {
					console.log('2', payload)
					return
				}
			}*/

			this.processing = true;

			this.save_item(payload)
				.then(() => {
					this.$emit('event', {
						eventName: 'reloadPage',
						onward: true
					});
					this.handleCancel();
					this.processing = false;
				})
				.catch(() => {
					this.processing = false;
				});
		}
	},

	watch: {}
};
</script>
