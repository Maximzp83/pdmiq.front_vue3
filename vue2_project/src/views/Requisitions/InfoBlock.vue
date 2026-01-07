<template>
	<div class="card overflowHidden info-block">
		<div class="card-header filled_2 ">
			<div class="title semi-bold">INFORMATION</div>
		</div>

		<div class="card-content ">
			<div class="info-item">
				<div class="icon">
					<i class="el-range__icon el-icon-date"></i>
				</div>

				<div class="value semi-bold">
					<div class="muted">Date Sent</div>
					<div class="semi-bold">{{ dateSent }}</div>
				</div>
			</div>

			<div class="info-item">
				<div class="icon">
					<i class="icomoon icon-docs"></i>
				</div>

				<div class="value">
					<div class="muted">Work Order #</div>
					<div class="semi-bold">{{ itemData.id }}</div>
				</div>
			</div>

			<div class="info-item">
				<div class="icon">
					<span
						class="requisition-status-label"
						:style="{ backgroundColor: statusItem.color }"
					></span>
				</div>

				<div class="value">
					<div class="muted">Status</div>
					<div class="semi-bold">{{ statusItem.label }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// import { mapActions } from 'vuex';

// import { eventHandler } from '@/mixins';
import { requisitionStatusesList } from '@/constants/global';
import { findItemBy, cleanDateString } from '@/helpers';

export default {
	// mixins: [eventHandler],
	components: {},

	props: {
		itemData: Object
	},

	computed: {
		statusItem() {
			return findItemBy('id', this.itemData.status, requisitionStatusesList());
		},

		dateSent: that => cleanDateString(that.itemData.created_at)
	}
};
</script>
