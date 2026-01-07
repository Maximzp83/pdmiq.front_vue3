<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item class="small-paddings-time">
			<div class="flex mrow">
				<div class="mcol-xs-5">
					<Datepicker
						className=" "
						v-model="formData.date"
						:placeholder="`${tt('Select')} ${tt('date')}`"
					/>
					<!-- :picker-options="pickerOptions" -->
				</div>

				<div class="mcol-xs-4">
					<el-time-select
						@blur="clearValidate"
						@change="formData.finish_day = null"
						v-model="formData.start_day"
						value-format="HH:mm"
						:placeholder="tt('start')"
						:picker-options="startTimePickerOptions"
					/>
				</div>

				<div class="mcol-xs-4">
					<el-time-select
						:disabled="!formData.start_day"
						v-model="formData.finish_day"
						value-format="HH:mm"
						:placeholder="tt('finish')"
						:picker-options="endTimePickerOptions"
					/>
				</div>
			</div>
		</el-form-item>

		<div v-if="!hideRemove" class="action-buttons-container absolute">
			<el-button
				class="action-button remove-button "
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		ElTimeSelect: () =>
			import(/*webpackChunkName: "ElTimePicker"*/ 'element-ui/lib/time-select')
		/*ElTimePicker: () =>
			import( webpackChunkName: "ElTimePicker"  'element-ui/lib/time-picker')*/
	},
	props: {
		timePickerOptions: Object,
		hideRemove: Boolean
	},

	data() {
		return {
			formData: {
				id: null,
				date: '',
				start_day: '',
				finish_day: ''
			}
		};
	},

	computed: {
		rules: () => ({
			date: required
			// start_day: that.required ? required : null,
			// finish_day: that.required ? required : null
		}),
		deleteNewId: () => true,

		startTimePickerOptions: that => ({
			...that.timePickerOptions
			// minTime: that.workTime.start_work_day,
			// maxTime: that.workTime.finish_work_day
		}),
		endTimePickerOptions: that => ({
			...that.timePickerOptions,
			minTime: that.formData.start_day
			// maxTime: that.workTime.finish_work_day
		})
	},

	methods: {
		clearValidate() {
			this.$refs['itemForm'].clearValidate(['start_day', 'finish_day']);
		}
	}
};
</script>
