<template>
	<div class="edit-form-container ">
		<!-- <div class="title article-title capitalize">New message note</div> -->
		<el-form
			class="item-edit-form section-row"
			label-width="120px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
		>
			<el-form-item
				class="one-line-item"
				:label="`${tt('Date')}:`"
				prop="origin_type"
				v-if="downtimeDateRange"
			>
				<b class="" v-html="downtimeDateRange.date"></b>
			</el-form-item>

			<el-form-item
				:label="`${tt('timerange')}:`"
				prop="origin_type"
				v-if="downtimeDateRange"
				class="no-margin one-line-item"
			>
				<b class="" v-html="downtimeDateRange.time"></b>
			</el-form-item>

			<div
				class="el-form-item"
				v-if="settings.submitActionProp == 'save_process_downtime'"
			>
				<el-form-item :label="tt('origin_type')" prop="origin_type" class="">
					<CustomSelect
						:optionsList="downtimeOriginTypesList"
						:placeholder="`${tt('Select')} ${tt('type')}`"
						v-model="formData.origin_type"
						labelKey="label"
					/>
				</el-form-item>

				<el-form-item
					v-show="
						formData.origin_type === DOWNTIME_ORIGIN_TYPES.DEVIATION ||
							formData.origin_type === DOWNTIME_ORIGIN_TYPES.EXTREMAL_DEVIATION
					"
					:label="tt('Loss_count')"
					prop="loss_count"
				>
					<el-input-number v-model="formData.loss_count" :min="0" />
				</el-form-item>

				<el-form-item :label="tt('timerange')" prop="finish_time" class="mcol-xs-10">
					<Datepicker
						className=" "
						v-model="selected_date"
						type="datetimerange"
						format="yyyy/MM/dd HH:mm"
						value-format="yyyy-MM-dd HH:mm"
						:default-time="defaultTime"
					/>
					<!-- unlink-panels -->
					<!-- :picker-options="pickerOptions" -->
				</el-form-item>
			</div>

			<!-- -------------------- -->

			<el-form-item :label="tt('Machine')" prop="machine_id" class="">
				<CustomSelect
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('select')} ${tt('machine')}`"
					v-model="formData.machine_id"
				/>
			</el-form-item>

			<el-form-item :label="tt('Fault')" prop="fault_id" class="">
				<CustomSelect
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="processData.faults"
					:placeholder="`${tt('select')} ${tt('fault')}`"
					v-model="formData.fault_id"
					labelKey="title"
				/>
			</el-form-item>

			<el-form-item prop="cause_description" :label="tt('Description')">
				<CustomInput
					v-model="formData.cause_description"
					type="textarea"
					placeholder=" "
				/>
			</el-form-item>
		</el-form>

		<div class="dialog-footer section-row text-center" v-if="!hideSave">
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
import { DOWNTIME_ORIGIN_TYPES, downtimeOriginTypesList } from '@/constants/global';

import { cleanDateString, getYmdDateString, getTimeDifference } from '@/helpers';

import { itemFormMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [itemFormMixin(), fetchItemsHelper()],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},
	props: {
		itemData: {
			type: Object,
			default: () => ({})
		},
		processDataProp: { type: Object, default: () => ({}) },
		visible: Boolean
	},

	data() {
		return {
			machinesLoading: false,
			machinesList: [],
			// plantItem: null,
			// plantLoading: false,
			// faultsList: [],

			processData: null,
			selected_date: [],

			hideSave: false,

			formData: {
				id: null,
				cause_description: '',
				machine_id: null,
				fault_id: null,

				origin_type: null,
				start_time: '',
				finish_time: '',
				loss_count: null
			},

			rules: {
				origin_type: null
				// machine_id: required,
				// fault_id: required
			}
		};
	},

	computed: {
		cleanFormDataAfterClose: () => true,

		downtimeOriginTypesList: () => downtimeOriginTypesList(),
		DOWNTIME_ORIGIN_TYPES: () => DOWNTIME_ORIGIN_TYPES,

		defaultTime() {
			return [
				`${this.processData.start_work_day}:00`,
				`${this.processData.finish_work_day}:00`
			];
		},

		downtimeDateRange() {
			const { selected_date } = this;

			if (selected_date.length) {
				const start = cleanDateString(selected_date[0]);
				const finish = cleanDateString(selected_date[1]);
				const { minutes_total } = getTimeDifference({
					from: start,
					to: finish
					// timeOnly: true
				});

				return Object.freeze({
					date: getYmdDateString({ ms: start, format: 'localeStr' }),
					time: `${getYmdDateString({
						ms: start,
						withTime: true,
						timeOnly: true,
						withoutSeconds: true
					})} - ${getYmdDateString({
						ms: finish,
						withTime: true,
						timeOnly: true,
						withoutSeconds: true
					})} Total Time: ${minutes_total} Minutes
								`
				});
			}

			return '';
		}
	},

	methods: {
		...mapActions({
			fetch_machines: 'machines/fetch_machines',
			save_item: 'processes/close_process_downtime',
			save_process_downtime: 'processes/save_process_downtime'
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

		/*fetchPlant(plantId) {
			const payload = { itemId: plantId  };

			this.doFetchAction(
				'fetch_plant',
				'plantItem',
				'plantLoading',
				payload
			);
		},*/

		closeDialog() {
			if (this.showSubmitButtons) {
				this.$emit('closeDialog');
			} else {
				this.$emit('event', 'handleCloseEditModal');
			}
		},

		/*setupFormData(isVisible) {
			if (!isVisible) {
				this.setupPage(null);
				// this.faultsList = [];
				this.machinesList = [];
			} else {
				this.setupPage(this.itemData);
			}
		},*/

		localSetupPage(item) {
			this.processData = this.settings.processData;

			if (!this.processData) {
				this.processData = this.processDataProp;
			}

			const { machines_ids } = this.processData;
			// console.log(processData, machines_ids,  this.settings)
			this.fetchMachines(machines_ids);

			if (item && this.itemId) {
				/*this.hideSave =
					item.origin_type &&
					item.origin_type !== DOWNTIME_ORIGIN_TYPES.AUTO &&
					item.origin_type !== DOWNTIME_ORIGIN_TYPES.WORK_BREAK;*/

				// this.fetchPlant(item.plant_id);
				// console.log(item)
				this.selected_date[0] = cleanDateString(item.start_time);
				this.selected_date[1] = cleanDateString(item.finish_time);
			}

			if (this.settings.submitActionProp == 'save_process_downtime') {
				this.rules.origin_type = required;
			} else {
				this.rules.origin_type = null;
			}
		},

		localPrepareSubmitData(formData) {
			if (this.selected_date) {
				formData.start_time = this.selected_date[0];
				formData.finish_time = this.selected_date[1];
			}

			if (this.settings.submitActionProp !== 'save_process_downtime') {
				delete formData.origin_type;
				delete formData.start_time;
				delete formData.finish_time;
				delete formData.loss_count;
			}

			if (
				formData.origin_type !== DOWNTIME_ORIGIN_TYPES.DEVIATION &&
				formData.origin_type !== DOWNTIME_ORIGIN_TYPES.EXTREMAL_DEVIATION
			) {
				delete formData.loss_count;
			}
			return formData;
		},

		preparePayload(payload) {
			return {
				...payload,
				itemId: this.formData.id,
				processId: this.processData.id
			};
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
		/*'visible'(isVisible) {
			this.setupFormData(isVisible);
		},*/

		'formData.origin_type'(type) {
			if (
				type === DOWNTIME_ORIGIN_TYPES.DEVIATION ||
				type === DOWNTIME_ORIGIN_TYPES.EXTREMAL_DEVIATION
			) {
				this.rules.loss_count = required;
			} else {
				this.rules.loss_count = null;
			}
		}

		/*plantItem(item) {
			this.faultsList = item.faults;
		}*/
	}

	/*created() {
		this.setupFormData(true);
	}*/
};
</script>
