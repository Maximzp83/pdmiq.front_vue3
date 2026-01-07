<template>
	<div class="edit-form-container ">
		<!-- <div class="title article-title capitalize">New message note</div> -->
		<el-form
			class="item-edit-form section-row"
			label-width="100px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
		>
			<el-form-item :label="tt('Machine')" prop="machine_id" class="">
				<CustomSelect
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('Select')} ${tt('machine')}`"
					v-model="formData.machine_id"
				/>
			</el-form-item>

			<el-form-item :label="tt('Fault')" prop="fault_id" class="">
				<CustomSelect
					filterable
					:optionsList="processData.faults"
					:placeholder="`${tt('Select')} ${tt('fault')}`"
					v-model="formData.fault_id"
				/>

				<!-- <el-select
					filterable
					:disabled="!processData.faults.length"
					v-model="formData.fault_id"
					:placeholder="`${tt('select')} ${tt('fault')}`"
				>
					<el-option
						v-for="item in processData.faults"
						:key="'fault_id-' + item.id"
						:label="item.title"
						:value="item.id"
					/>
				</el-select> -->
			</el-form-item>

			<el-form-item
				prop="finish_time"
				class="small-paddings-time"
				:label="tt('Break_time')"
			>
				<div class="flex mrow">
					<div class="mcol-xs-6">
						<el-time-select
							@blur="clearValidate"
							@change="setFinishTime"
							v-model="formData.new_start_time"
							value-format="HH:mm"
							:placeholder="tt('start')"
							:picker-options="startTimePickerOptions"
						/>
					</div>

					<div class="mcol-xs-6">
						<!-- @blur="clearValidate" -->
						<el-time-select
							disabled
							v-model="formData.new_finish_time"
							value-format="HH:mm"
							:placeholder="tt('finish')"
							:picker-options="endTimePickerOptions"
						/>
					</div>
				</div>
			</el-form-item>

			<el-form-item prop="cause_description" :label="tt('Description')">
				<CustomInput
					type="textarea"
					v-model="formData.cause_description"
					:placeholder="tt('comments')"
				/>
			</el-form-item>
		</el-form>

		<div class="dialog-footer section-row text-center">
			<!-- :loading="sensorJobSaving" -->
			<el-button type="primary" @click="() => validateForm()" class="uppercase">{{
				tt('SAVE')
			}}</el-button>
			<el-button @click="closeDialog">{{ tt('Cancel') }}</el-button>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { required } from '@/constants/validation';
import { getTimeDifference, getYmdDateString } from '@/helpers';

import { itemFormMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [itemFormMixin(), fetchItemsHelper()],
	props: {
		itemData: {
			type: Object,
			default: () => ({})
		},
		processData: { type: Object, default: () => ({}) },
		visible: Boolean
	},

	data() {
		return {
			machinesLoading: false,
			machinesList: [],
			// faultsList: [],

			formData: {
				cause_description: '',
				machine_id: null,
				fault_id: null,
				// conveyor_process_id: null,
				new_start_time: '',
				new_finish_time: ''
			},

			rules: {
				machine_id: required,
				fault_id: required,
				new_start_time: required,
				new_finish_time: required
			}
		};
	},

	computed: {
		cleanFormDataAfterClose: () => true,

		timePickerOptions: () => ({
			start: '00:00',
			step: '00:15',
			end: '23:45'
		}),

		startTimePickerOptions: that => ({
			...that.timePickerOptions,
			minTime: that.processData.start_work_day,
			maxTime: that.processData.finish_work_day
		}),
		endTimePickerOptions: that => ({
			...that.timePickerOptions,
			minTime: that.formData.new_start_time,
			maxTime: that.processData.finish_work_day
		})

		/*filteredLocationsList() {
			if (this.selectedMachine) {
				return this.selectedMachine.locations || [];
			}

			return [];
		}*/
	},

	methods: {
		...mapActions({
			fetch_machines: 'machines/fetch_machines',
			save_item: 'processes/change_process_break_time'
		}),

		fetchMachines(ids) {
			const payload = { params: { max: -1 } };

			if (ids.length) {
				payload.params.ids = ids;
			} else {
				payload.params.plantId = this.processData.plant_id;
			}

			this.doFetchAction(
				'fetch_machines',
				'machinesList',
				'machinesLoading',
				payload
			);
		},

		closeDialog() {
			this.$emit('closeDialog');
		},

		setFinishTime(new_start_time) {
			const new_start_ms = new Date(`01/01/2007 ${new_start_time}`).getTime();
			const new_finish_date = new Date(new_start_ms + this.initialDiff);

			const finish_time = getYmdDateString({
				dateObj: new_finish_date,
				withTime: true,
				timeOnly: true
			});

			this.formData.new_finish_time = finish_time
				.split(':')
				.slice(0, -1)
				.join(':');
		},

		setupFormData(isVisible) {
			if (!isVisible) {
				this.setupPage(null);
				this.machinesList = [];
			} else {
				this.setupPage(this.itemData);
			}
		},

		localSetupPage(item) {
			if (item) {
				const { machines_ids } = this.processData;
				this.fetchMachines(machines_ids);

				this.formData.new_start_time = item.start_time;
				this.formData.new_finish_time = item.finish_time;

				this.initialDiff = getTimeDifference({
					to: item.finish_time,
					from: item.start_time,
					timeOnly: true
				}).ms;
				// this.formData.conveyor_process_id = id;
			}
		},

		preparePayload(payload) {
			return { ...payload, itemId: this.itemData.id };
		},

		successSubmitCallback() {
			this.$emit('successSubmit');
		}

		/*submitForm() {
			const payload = {
				pointId: this.pointData ? this.pointData.id : null,
				data: this.formData
			};

			// console.log(payload)
			this.save_item(payload).then(() => {
				this.$emit('success', { parameter_type: this.parameter_type });
				this.closeDialog();
			});
		}*/
	},

	watch: {
		visible(isVisible) {
			this.setupFormData(isVisible);
		}
	}

	/*beforeMount() {
		// this.setupFormData(true);
		const { new_finish_time, new_start_time } = this.formData;
		this.initialDiff = getTimeDifference(new_finish_time, new_start_time)
		// console.log(initialDiff)
	}*/
};
</script>
