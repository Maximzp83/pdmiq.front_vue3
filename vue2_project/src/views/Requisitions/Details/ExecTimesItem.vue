<template>
	<el-form
		ref="itemForm"
		:class="['flex mrow relative content-row']"
		:model="formData"
		:rules="rules"
		:label-position="fromModal ? 'left' : 'top'"
	>
		<el-form-item prop="date" class="mcol-xs-5 mini">
			<label v-if="!fromModal && itemIndex == 0">{{ tt('Date') }}</label>
			<Datepicker
				className="datepicker-container mini"
				v-model="formData.date"
				:placeholder="hideCreateButton ? '-' : `${tt('Select')} ${tt('date')}`"
				:picker-options="pickerOptions"
			/>
		</el-form-item>

		<el-form-item prop="time" class="mcol-xs-5 mini">
			<label v-if="!fromModal && itemIndex == 0">{{ tt('Hours') }}</label>
			<!-- v-model="formData.time" -->
			<div class="flex mrow small-input-paddings">
				<CustomInput
					class="mcol-xs-4 mini"
					className="text-center"
					:value="actual_hours"
					placeholder="00"
					@input="val => handleTimeInput(val, 'actual_hours')"
				/>
				<div>:</div>
				<CustomInput
					class="mcol-xs-4 mini"
					className="text-center"
					:value="actual_minutes"
					placeholder="00"
					@input="val => handleTimeInput(val, 'actual_minutes')"
				/>
			</div>
			<!-- <CustomInput
				:value="formData.time"
				placeholder="00"
				@input="handleTimeInput"
			/> -->
		</el-form-item>

		<div :class="['action-buttons-container', { 'flex bottom': !fromModal }]">
			<el-button
				v-if="!isLast && !hideCreateButton"
				class="action-button remove-button "
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>

			<el-button
				v-else-if="!hideCreateButton"
				class="action-button create-button"
				size="mini"
				type="success"
				icon="icomoon icon-cross"
				@click="addItem('execTimesItemsList', 'et_i-')"
			/>
		</div>
	</el-form>
</template>

<script>
import { required } from '@/constants/validation';
import { formatTime } from '@/helpers';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],

	props: {
		isLast: Boolean,
		// targetPropName: { type: String, required: true },
		fromModal: Boolean,
		hideCreateButton: Boolean
	},

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	data() {
		return {
			actual_hours: '',
			actual_minutes: '',

			formData: {
				id: null,
				date: '',
				time: ''
			},

			rules: {
				date: null,
				time: null
			}
		};
	},

	computed: {
		// targetPropName: () => 'proposed_materials',
		pickerOptions: () =>
			Object.freeze({
				disabledDate(date) {
					const start = new Date();
					const today = start.getTime();
					const dateMs = date.getTime();

					return dateMs > today;
				}
			}),
		deleteNewId: () => true
	},

	methods: {
		removeItem() {
			this.$emit('onRemove', this.itemId);
			this.$emit('calcTotalTime');
		},

		handleTimeInput(time, prop) {
			let value = '00';

			if (time && time.length) {
				value = time.length < 2 ? `0${time}` : time;
			}

			this[prop] = value;
			if (time) this.rules.date = required;
			else if (!this.actual_hours && !this.actual_minutes) this.rules.date = null;
			this.$emit('calcTotalTime');
		},

		localSetupPageActions(itemData) {
			if (itemData) {
				if (itemData.time) {
					this.formData.time = formatTime(itemData.time, 'H:M');
					let timeArray = this.formData.time.split(':');
					this.actual_hours = timeArray[0];
					this.actual_minutes = timeArray[1];
				}
			}
		},

		localGetFormDataCallback(formData) {
			if (this.actual_hours || this.actual_minutes) {
				formData.time = `${this.actual_hours || '00'}:${this.actual_minutes ||
					'00'}`;
			}
			// const { date, time } = formData;
			// if (!date || !time || time == '00:00') formData.skipItem = true;
			return formData;
		}
	},

	watch: {
		formData: {
			deep: true,
			handler(data) {
				if (!!data.date || !!this.actual_hours || this.actual_minutes) {
					this.rules = { date: required };
				} else {
					this.rules = { date: null, time: null };
				}
				setTimeout(() => {
					this.handleResetValidate();
				}, 10);
			}
		}
	}
};
</script>
