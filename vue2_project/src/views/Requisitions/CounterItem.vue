<template>
	<div :class="['requisition-counter-item', { active: isActiveCard }]">
		<div class="card" @click="handleFilter">
			<SimpleSpinner :active="isLoading" />

			<div class="content-container">
				<div class="top-row">
					<span class="requisition-status-label">
						<i :style="{ backgroundColor: counterData.statusColor }"></i>
						<span class="title">{{ counterData.title }}</span>
					</span>
					<span class="count">{{ counterData.count }}</span>
				</div>

				<div class="bottom-row">
					<div class="row-item">
						<div class="label">{{ tt('Hours') }}</div>
						<div class="value">{{ counterData.hours || '-' }}</div>
					</div>
					<div class="row-item">
						<div class="label capitalize">{{ tt('Money') }}</div>
						<div class="value">{{ counterData.money || '-' }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';
// import { capitalizeFirstLetter } from '@/helpers';

export default {
	props: {
		counterData: {
			type: Object,
			required: true
			// default: () => ({})
		},
		additionalModalSettings: {
			type: Object,
			default: () => ({})
		},

		filters: Object,
		isLoading: Boolean
	},

	computed: {
		...mapState({
			// globalFilters: state => state.global.globalFilters,
			activeItemsTable: state => state.global.activeItemsTable
			// selectedCompany: state => state.global.selectedCompany,
			// authUser: state => state.auth.authUser
		}),

		isActiveCard() {
			const { filters, counterData } = this;
			if (counterData.status !== undefined) {
				return filters.status === counterData.status;
			}

			return filters.status === undefined;
		}
	},

	methods: {
		handleFilter() {
			if (!this.isActiveCard) {
				let status =
					this.counterData.status !== undefined
						? this.counterData.status
						: undefined;

				this.$emit('event', {
					eventName: 'setFilters',
					data: { status: status },
					onward: true
				});
			}
		}
	}
};
</script>
