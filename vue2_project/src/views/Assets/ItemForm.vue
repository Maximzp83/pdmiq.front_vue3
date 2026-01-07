<template>
	<div
		class="edit-form-container "
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Asset')} ${tt('name')}`" prop="name">
				<CustomInput
					required
					v-model="formData.name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Machine')" prop="machine_id" class="">
				<CustomSelect
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('Select')} ${tt('machine')}`"
					v-model="formData.machine_id"
					@input="formData.location_id = null"
				/>
			</el-form-item>

			<el-form-item :label="tt('Location')" prop="location_id">
				<CustomSelect
					filterable
					:optionsLoading="machinesLoading"
					:optionsList="filteredLocationsList"
					:placeholder="`${tt('Select')} ${tt('Location')}`"
					v-model="formData.location_id"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Downtime')} ${tt('Cost')}`" prop="downtime_cost">
				<el-input v-model.number="formData.downtime_cost" />
			</el-form-item>

			<!-- <el-form-item label="Compose" prop="composed">
				<div class="options-container">
					<div v-if="composedItemsList.length" class="content-row">
						<ComposedItem
							ref="ComposedItem"
							v-for="(item, idx) in composedItemsList"
							:key="`composed_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							:equipmentTypesLoading="equipmentTypesLoading"
							:equipmentTypesList="equipmentTypesList"
							@onRemove="id => removeFormItem(id, 'composedItemsList')"
							@ready="blockReady"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="mini"
							type="success"
							icon="icomoon icon-cross"
							@click="addFormItem('composedItemsList', 'c_i-')"
						/>
					</div>
				</div>
			</el-form-item> -->

			<el-form-item :label="tt('Attachments')" prop="libraries">
				<div class="options-container">
					<div v-if="librariesItemsList.length" class="content-row">
						<AttachmentItem
							ref="AttachmentItem"
							v-for="(item, idx) in librariesItemsList"
							:key="`attach_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="id => removeFormItem(id, 'librariesItemsList')"
						/>
							<!-- @ready="blockReady" -->
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="mini"
							type="success"
							icon="icomoon icon-cross"
							@click="addFormItem('librariesItemsList', 'a_i-')"
						/>
					</div>
				</div>
			</el-form-item>

			<el-form-item :label="tt('Order')" v-if="itemData && itemData.id">
				<CustomSelect
					filterable
					:optionsLoading="assetsLoading"
					:optionsList="filteredAssetsList"
					:placeholder="
						`${tt('select')} ${tt('asset')} ${tt('phrases.whose_order_you_want')}`
					"
					v-model="desiredId"
				/>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { findItemBy } from '@/helpers';
import { required } from '@/constants/validation';
import {
	itemFormMixin,
	subItemsListMixin,
	requestsListMixin,
	multiformMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		subItemsListMixin(),
		requestsListMixin(),
		multiformMixin()
	],
	components: {
		//ComposedItem: () => import('./ComposedItem.vue'),
		AttachmentItem: () => import('../ProductionLines/AttachmentItem.vue')
	},

	data() {
		return {
			//composedItemsList: [],
			librariesItemsList: [],

			machinesLoading: false,
			machinesList: [],
			equipmentTypesLoading: false,
			equipmentTypesList: [],
			assetsList: [],
			assetsLoading: false,

			desiredId: null,

			formData: {
				name: '',
				machine_id: null,
				location_id: null,
				composed: [],
				downtime_cost: 0,
				libraries: []
			},

			rules: {
				name: required,
				location_id: null,
				machine_id: required
			}
		};
	},

	computed: {
		instanceName: () => 'Assets',

		subItemsSettings: () => Object.freeze([
			{ ref: 'AttachmentItem', targetProp:'libraries' },
		]),
		
		requestsToDoList: that => [
			{
				action: 'fetch_machines',
				payload: {
					params: {
						max: -1,
						plantId: that.globalFilters.plantId || that.showPlant.id
					}
				},
				bindTo: [
					{
						prop: 'multiFormFilters.productionLineId',
						clean_prop: 'formData.machine_id',
						param: 'productionLineId',
						fetchAnyWay: true
					}
				],
				localProp: 'machinesList',
				localLoadProp: 'machinesLoading'
			},
			{
				action: 'fetch_equipment_types',
				payload: {
					params: {
						max: -1,
						plantId: that.globalFilters.plantId || that.showPlant.id
					}
				},
				localProp: 'equipmentTypesList',
				localLoadProp: 'equipmentTypesLoading'
			},
			{
				action: 'fetch_assets',
				payload: {
					params: {
						max: -1,
						plantId: that.globalFilters.plantId || that.showPlant.id
					}
				},
				localProp: 'assetsList',
				localLoadProp: 'assetsLoading'
			}
		],

		selectedMachine() {
			const { formData, machinesList } = this;

			if (formData.machine_id && machinesList.length) {
				return findItemBy('id', formData.machine_id, machinesList);
			}
			return null;
		},

		filteredLocationsList() {
			if (this.selectedMachine) {
				return this.selectedMachine.locations || [];
			}

			return [];
		},

		filteredAssetsList() {
			if (this.itemData && this.assetsList.length) {
				return this.assetsList.filter(pl => pl.id !== this.itemData.id);
			}
			return [];
		},

		uploadSettings: () => Object.freeze([{ fileProp: 'libraries', multiple: true }])
	},

	methods: {
		...mapActions({
			fetch_machines: 'machines/fetch_machines',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			save_item: 'assets/save_asset',
			reorder_asset: 'assets/reorder_asset',
			fetch_assets: 'assets/fetch_assets'
		}),

		localSetupPage(item) {
			if (item) {
				//this.composedItemsList = this.setupFormSubItemsList(item.composed, 'c_i');
				this.librariesItemsList = this.setupFormSubItemsList(item.libraries, 'a_i');
			}

			this.setupByParentInstance(this.instancesItemsData, 'machine', 'machine_id');
		},

		localPrepareSubmitData(data) {
			if (!data.downtime_cost) {
				delete data.downtime_cost;
			}
			return data;
		},

		successSubmitCallback() {
			const { itemData, desiredId } = this;
			if (itemData && desiredId) {
				const payload = {
					notNotify: true,
					data: {
						currentId: +itemData.id,
						desiredId: +desiredId,
						className: itemData.className
					}
				};
				// console.log(payload);
				this.reorder_asset(payload);
			}
		}
	},

	watch: {
		'formData.machine_id'(id) {
			if (!this.isInitialSetup) {
				this.setMultiFormFilters({ machineId: id });
			}
		}
	}
};
</script>
