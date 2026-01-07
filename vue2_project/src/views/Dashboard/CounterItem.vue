<template>
	<div :class="['counter-item', { active: isActiveCard }]">
		<div class="card relative">
			<SimpleSpinner :active="countersLoading" />

			<div class="card-header flex align-center" v-if="!itemData.hideHeader">
				<div class="flex align-center item-img">
					<i :class="['icomoon', `icon-${itemData.iconName}`]" />
				</div>
				<div class="title uppercase">{{ itemData.title }}</div>
				<div class="ml-auto count">{{ itemData.count }}</div>
			</div>

			<div class="card-footer">
				<div class="card-footer-content">
					<el-popover
						v-if="$hasAccessTo(['create_dashboard'])"
						:disabled="!!globalFilters.plantId"
						:placement="'bottom'"
						popper-class="link-popover"
						:title="`${tt('Choose')} ${tt('Plant')}`"
						trigger="hover"
						width="120"
					>
						<span
							slot="reference"
							:class="['link', { 'is-disabled': !globalFilters.plantId }]"
							@click="() => editItem()"
							>{{ `${tt('Add')} ${itemData.itemName}` }}</span
						>
					</el-popover>

					<a
						@click.prevent="linkClick"
						:href="`/dashboard/${itemData.path}`"
						class="el-button el-button--success action-button"
						:class="{ active: isActiveCard }"
					>
						<span>{{ `${tt('View')} ${tt('All')}` }}</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
// import {  } from '@/helpers';
import { navigation } from '@/mixins';

export default {
	mixins: [navigation()],

	props: {
		itemData: {
			type: Object,
			required: true
			// default: () => ({})
		},
		additionalModalSettings: {
			type: Object,
			default: () => ({})
		},
		countersLoading: Boolean,
		index: Number
	},

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			activeItemsTable: state => state.global.activeItemsTable,
			selectedCompany: state => state.global.selectedCompany,
			authUser: state => state.auth.authUser
		}),

		isActiveCard() {
			const { activeItemsTable } = this;
			const { instance } = this.itemData;

			if (activeItemsTable) {
				return activeItemsTable.toLowerCase() == instance.toLowerCase();
			}
			return false;
		},

		/*isInfoVersion() {
			// return this.instanceName == 'Companies' && this.selectedCompany;
			return false;
		},*/

		canCreate() {
			// const { hasAccessMap } = this;
			// const { instance } = this.itemData;
			// return hasAccessMap['create_dashboard'];

			/*if (instance == 'Equipments') {
				return hasAccessMap['operate-equipments'];
			} else if (instance == 'Assets') {
				return hasAccessMap['operate-assets'];
			} else if (instance == 'ProductionLines') {
				return hasAccessMap['operate-p-lines'];
			} else if (instance == 'Machines') {
				// return hasAccessMap['operate-machines'];
				return hasAccessMap['operate-machines'];
			}*/

			return true;
		}
	},

	methods: {
		...mapActions({
			show_edit_modal: 'show_edit_modal',
			set_global_state: 'set_global_state'
		}),

		linkClick() {
			this.set_global_state({
				stateProp: 'nextActiveItemsTable',
				value: this.itemData.instance
			});

			this.changeRoute({ path: `/dashboard/${this.itemData.path}` });
		},

		editItem(item) {
			if (this.globalFilters.plantId) {
				const { instance, itemName } = this.itemData;
				const payload = {
					show: true,
					multiform: true,
					title: 'Create New',
					instanceName: instance,
					itemName: itemName,
					instanceData: item || null,
					componentPath: 'Dashboard/MultiFormWrapper',
					...this.additionalModalSettings
				};
				// console.log(payload)
				this.show_edit_modal(payload);
			}
		}
	}
};
</script>
