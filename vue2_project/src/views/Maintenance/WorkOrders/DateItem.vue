<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container flex align-center']"
		:model="formData"
	>
		<el-form-item prop="date" class="mcol-xs-6 span-block">
			<Datepicker
				v-model="formData.date"
				:placeholder="tt('phrases.Select_date')"
				className=" "
				:pickerOptions="pickerOptions"
			/>
		</el-form-item>

		<div class="span-block">
			<el-button
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
// import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		pickerOptions: { type: Object, default: () => ({}) }
	},

	data() {
		return {
			formData: {
				date: ''
			}
		};
	},

	computed: {
		deleteId: () => true
	},

	methods: {
		localSetupPageActions(item) {
			if (item && item.value) {
				this.formData.date = item.value;
			}
		},

		localGetFormDataCallback(data) {
			data = data.date;
			return data;
		}
	}
};
</script>
