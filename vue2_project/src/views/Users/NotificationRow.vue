<template>
	<div :class="['checkboxes-matrix-row', rowData.className || '']">
		<div class="row-label label">{{ rowData.title }}</div>

		<div class="cell-item">
			<el-checkbox v-model="formData.is_email" :true-label="1" :false-label="0" />
		</div>

		<div class="cell-item">
			<el-checkbox v-model="formData.is_push" :true-label="1" :false-label="0" />
		</div>

		<div class="cell-item">
			<el-checkbox v-model="formData.is_sms" :true-label="1" :false-label="0" />
		</div>
	</div>
</template>

<script>
export default {
	props: {
		rowData: Object
	},

	data() {
		return {
			formData: {
				message_type: null,
				is_email: 0,
				is_sms: 0,
				is_push: 0
			}
		};
	},

	computed: {
		// checkedCount: that => Object.values(that.formData).filter(value => value).length,
	},

	methods: {
		setupFormData(data) {
			this.formData = { ...data };
		},

		getFormData() {
			return this.formData;
		},

		setFormData(key, value) {
			return (this.formData[key] = value);
		}
	},

	/*watch: {
		'formData.app_section'() {
			this.$emit('updateSelectedSections');
		}
	}*/

	created() {
		this.setupFormData(this.rowData.formData);
	}
};
</script>
