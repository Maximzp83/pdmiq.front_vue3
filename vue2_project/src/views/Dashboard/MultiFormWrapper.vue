<template>
	<div class="form-items-list accordion-container">
		<div
			:class="['accordion-item', { active: isActive(instance.name) }]"
			v-for="instance in instancesList"
			:key="`instance-${instance.name}`"
		>
			<MultiFormItemWrapper
				@event="handleEvent"
				:instance="instance"
				:instancesData="instancesData"
				:instancesItemsData="instancesItemsData"
				:formSettings="editModal.formSettings"
				:is_active="isActive(instance.name)"
				:multiFormFilters="multiFormFilters"
			/>
			<!-- :instanceData="" -->
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { eventHandler, navigation } from '@/mixins';
// import { cleanValuesByList, findItemBy } from '@/helpers';

export default {
	mixins: [eventHandler(), navigation()],
	name: 'MultiFormWrapper',
	components: {
		MultiFormItemWrapper: () => import('./MultiFormItemWrapper.vue')
	},

	data() {
		return {
			currentInstanceName: '',
			instancesData: {},
			instancesItemsData: {},

			multiFormFilters: {
				plantId: null,
				machineId: null,
				assetId: null
			}
		};
	},

	computed: {
		...mapState({
			editModal: state => state.global.editModal
			// instanceName: state => state.global.instanceNameToEdit,
			// authUser: state => state.auth.authUser
		}),

		instancesList() {
			let prodLineItem = {
				name: 'ProductionLines',
				title: 'PRODUCTION_LINE',
				path: 'ProductionLines/ItemForm',
				fetch_action: 'fetch_production_line',
				idProp: 'production_line_id',
				instanceDataProp: 'productionLine'
			};

			if (this.editModal.instanceName == 'Utilities') {
				prodLineItem.name = 'Utilities';
				prodLineItem.title = 'UTILITY';
			}

			let list = [
				prodLineItem,
				{
					name: 'Machines',
					title: 'MACHINE',
					path: 'Machines/ItemForm',
					fetch_action: 'fetch_machine',
					idProp: 'machine_id',
					instanceDataProp: 'machine',
					relatedInstance: { related_id: 'production_line_id' }
				},
				{
					name: 'Assets',
					title: 'ASSET',
					path: 'Assets/ItemForm',
					fetch_action: 'fetch_asset',
					idProp: 'asset_id',
					instanceDataProp: 'asset',
					relatedInstance: { related_id: 'machine_id' }
				},
				{
					name: 'Equipments',
					title: 'ITEM',
					path: 'Equipments/ItemFormWrapper',
					fetch_action: 'fetch_equipment',
					idProp: 'equipment_id',
					instanceDataProp: 'equipment',
					relatedInstance: { related_id: 'asset_id' }
				}
			];

			return Object.freeze(list);
		}
	},

	methods: {
		...mapActions({
			fetch_asset: 'assets/fetch_asset',
			fetch_machine: 'machines/fetch_machine',
			fetch_production_line: 'production_lines/fetch_production_line',
			fetch_equipment: 'equipments/fetch_equipment'
			// set_global_state: 'set_global_state'
		}),

		isActive(name) {
			return this.currentInstanceName == name;
		},

		changeInstance({ name /*data*/ }) {
			this.currentInstanceName = name;
		},

		setupRelatedId({ prop, value }) {
			// console.log('setupRelatedId', prop, value)
			// this.instancesData[prop] = value
			this.$set(this.instancesData, prop, value);
		},

		setInstanceItemData({ prop, value }) {
			// console.log('setupRelatedId', prop, value);
			this.$set(this.instancesItemsData, prop, value);
		},

		setMultiFormFilters(filters) {
			this.multiFormFilters = filters;
		},

		saveModalItem({ name }) {
			// console.log(this.$refs.ItemFormComponent)
			this.$refs[`ItemFormComponent_${name}`].validateForm();
		},

		successModalSubmit(answer) {
			// console.log('successModalSubmit 4', this.editModal)

			if (this.editModal.callback) {
				this.editModal.callback(answer);
			}
		}
	},

	// watch: {},

	beforeMount() {
		// console.log('MultiFormWrapper', this.editModal)
		this.changeInstance({ name: this.editModal.instanceName });
	},
};
</script>
