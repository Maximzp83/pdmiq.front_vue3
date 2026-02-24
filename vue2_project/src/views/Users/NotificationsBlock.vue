<template>
	<div class="checkboxes-matrix-block">
		<div :class="['checkboxes-matrix-row']">
			<div class="row-label label semi-bold">{{ title }}</div>

			<div class="cell-item">
				<el-checkbox
					@change="handleCheckAllChange('is_email', 'emailChecksCount')"
					:value="all_email_checked"
					:indeterminate="email_is_indeterminate"
					:true-label="1"
					:false-label="0"
					>{{ tt('Email') }}</el-checkbox
				>
			</div>

			<div class="cell-item">
				<el-checkbox
					@change="handleCheckAllChange('is_push', 'pushChecksCount')"
					:value="all_push_checked"
					:indeterminate="push_is_indeterminate"
					:true-label="1"
					:false-label="0"
					>{{ tt('Push') }}</el-checkbox
				>
			</div>

			<div class="cell-item">
				<el-checkbox
					:disabled="!isPhoneVerified"
					@change="handleCheckAllChange('is_sms', 'smsChecksCount')"
					:value="all_sms_checked"
					:indeterminate="sms_is_indeterminate"
					:true-label="1"
					:false-label="0"
					>SMS</el-checkbox
				>
			</div>
		</div>

		<NotificationRow
			ref="NotificationRow"
			v-for="row in rows"
			:key="row.id"
			:rowData="row"
			:isPhoneVerified="isPhoneVerified"
		/>
	</div>
</template>

<script>
export default {
	// mixins: [dynamicItemFormMixin()],
	components: {
		NotificationRow: () => import('./NotificationRow.vue')
	},

	props: {
		title: String,
		rows: Array,
		isPhoneVerified: Boolean
	},

	data() {
		return {
			refsUpdate: 0
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'NotificationRow' },
		]),
		
		notificationRowRef() {
			if (this.refsUpdate) {
				return this.$refs['NotificationRow'];
			}
			return null;
		},
		// checkedCount: that => Object.values(that.formData).filter(value => value).length,
		emailChecksCount() {
			if (this.notificationRowRef) {
				return this.notificationRowRef
					.map(row => row.formData.is_email)
					.filter(value => value).length;
			}
			return 0;
		},
		all_email_checked: that => that.emailChecksCount === that.rows.length,

		pushChecksCount() {
			if (this.notificationRowRef) {
				return this.notificationRowRef
					.map(row => row.formData.is_push)
					.filter(value => value).length;
			}
			return 0;
		},
		all_push_checked: that => that.pushChecksCount === that.rows.length,

		smsChecksCount() {
			if (this.notificationRowRef) {
				return this.notificationRowRef
					.map(row => row.formData.is_sms)
					.filter(value => value).length;
			}
			return 0;
		},
		all_sms_checked: that => that.smsChecksCount === that.rows.length,

		email_is_indeterminate: that =>
			that.emailChecksCount > 0 && that.emailChecksCount < that.rows.length,
		push_is_indeterminate: that =>
			that.pushChecksCount > 0 && that.pushChecksCount < that.rows.length,
		sms_is_indeterminate: that =>
			that.smsChecksCount > 0 && that.smsChecksCount < that.rows.length
	},

	methods: {
		handleCheckAllChange(key, countKey) {
			let newValue =
				/*this[countKey] > 0 &&*/ this[countKey] < this.rows.length ? 1 : 0;

			this.notificationRowRef.forEach(row => {
				row.setFormData(key, newValue);
			});
		},

		getFormData() {
			return this.notificationRowRef.map(row => row.getFormData());
		}
	},

	mounted() {
		if (!this.refsUpdate && this.subItemsSettings.every(item => this.$refs[item.ref])) {
			this.refsUpdate++;
		}
	},

	updated() {
		if (!this.refsUpdate && this.subItemsSettings.every(item => this.$refs[item.ref])) {
			this.refsUpdate++;
		}
	}
};
</script>
