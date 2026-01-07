<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="finish_time" class="small-paddings-time">
			<div class="flex mrow">
				<div class="mcol-xs-6">
					<el-time-select
						@blur="clearValidate"
						@change="formData.finish_time = ''"
						v-model="formData.start_time"
						value-format="HH:mm"
						:placeholder="tt('start')"
						:picker-options="startTimePickerOptions"
					/>
				</div>

				<div class="mcol-xs-6">
					<!-- @blur="clearValidate" -->
					<el-time-select
						:disabled="!formData.start_time"
						v-model="formData.finish_time"
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
		ElTimeSelect: () =>
			import(/* webpackChunkName: "ElTimePicker" */ 'element-ui/lib/time-select')
	},
	props: {
		timePickerOptions: Object,
		workTime: Object,
		hideRemove: Boolean
	},
	data() {
		return {
			formData: {
				id: null,
				start_time: '',
				finish_time: ''
			}
		};
	},

	computed: {
		rules: that => ({
			start_time: that.required ? required : null,
			finish_time: that.required ? required : null
		}),
		deleteNewId: () => true,

		startTimePickerOptions: that => ({
			...that.timePickerOptions,
			minTime: that.workTime.start_work_day,
			maxTime: that.workTime.finish_work_day
		}),
		endTimePickerOptions: that => ({
			...that.timePickerOptions,
			minTime: that.formData.start_time,
			maxTime: that.workTime.finish_work_day
		})
	},

	methods: {
		clearValidate() {
			this.$refs['itemForm'].clearValidate(['start_time', 'finish_time']);
		}
	}
};
</script>
