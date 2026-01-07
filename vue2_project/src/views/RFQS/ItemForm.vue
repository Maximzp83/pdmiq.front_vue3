<template>
	<div
		class="edit-form-container "
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			:class="['item-edit-form', { showJustInfo: showJustInfo }]"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Type')" prop="type">
				<el-select
					v-model="formData.type"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('type')}`"
				>
					<el-option
						class="capitalize"
						v-for="item in rfqsTypesList"
						:key="'rfq_type_id-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item
				:label="`${tt('Enable')} ${tt('one_click')}`"
				prop="is_one_click"
			>
				<el-switch v-model="formData.is_one_click" />
			</el-form-item>

			<el-form-item :label="tt('Equipment')" prop="equipment_id">
				<SimpleSpinner :active="equipmentsLoading" />
				<el-input :value="setupLabel(equipmentsList, equipmentLabelOptions)" />
				<!-- :filter-method="q => selectQuery(q, eqipQueryOptions)" -->
				<!-- <el-select
					filterable
					v-model="formData.equipment_id"
					placeholder="Type query ..."
				>
					<el-option
						v-for="(item, idx) in equipmentsList"
						:key="`equipment_id-${item.id}_index-${idx}`"
						:label="setupLabel(item, equipmentLabelOptions)"
						:value="item.id"
					/>
				</el-select> -->

				<!-- <el-select
					:disabled="!equipmentsList.length"
					v-model="formData.equipment_id"
					placeholder="Select equipment"
				>
					<el-option
						v-for="item in equipmentsList"
						:key="'equipment_id-' + item.id"
						:label="setupLabel(item, equipmentLabelOptions)"
						:value="item.id"
					/>
				</el-select> -->
			</el-form-item>

			<el-form-item prop="vendor_ids" :label="tt('Vendors')">
				<SimpleSpinner :active="vendorsLoading" />
				<el-select
					multiple
					:disabled="!vendorsList.length"
					v-model="formData.vendor_ids"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('vendors')}`"
				>
					<el-option
						v-for="item in vendorsList"
						:key="'vendor_ids-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { setupLabel, getValues } from '@/helpers';
import { required /*number*/ } from '@/constants/validation';
import { rfqsTypesList } from '@/constants/global';
import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],
	data() {
		return {
			vendorsLoading: false,
			vendorsList: [],
			equipmentsLoading: false,
			equipmentsList: [],

			formData: {
				type: null,
				equipment_id: null,
				is_one_click: false,

				vendor_ids: []
			}
		};
	},

	computed: {
		setupLabel: () => setupLabel,
		rfqsTypesList: () => Object.freeze(rfqsTypesList()),

		rules: that => ({
			type: that.showJustInfo ? null : required,
			equipment_id: that.showJustInfo ? null : required
		}),

		eqipQueryOptions() {
			return {
				fetchAction: 'fetch_equipments',
				loadingProp: 'equipmentsLoading',
				listProp: 'equipmentsList',
				params: { plantId: this.userPlantId }
			};
		},

		requestsToDoList() {
			let settings = [
				/*{
					action: 'fetch_equipments',
					payload: { params: { max: -1, plantId:  } },
				},*/
				{
					action: 'fetch_vendors',
					localProp: 'vendorsList',
					localLoadProp: 'vendorsLoading'
				},
				{ localProp: 'equipmentsList', localLoadProp: 'equipmentsLoading' }
			];

			if (this.itemData && this.itemData.equipment) {
				const { equipment } = this.itemData;
				/*let query =
					equipment.brand_name ||
					equipment.machine_name ||
					equipment.location_name ||
					equipment.sensor_location ||
					'';*/

				// console.log(equipment, query)

				// query = query.split(' ');
				// console.log(query)

				settings[1].action = 'fetch_equipment';
				settings[1].payload = {
					itemId: equipment.id,
					params: { max: null /*plantId: equipment.plant_id,*/ /* q: query*/ }
				};
			}

			return settings;
		},

		equipmentLabelOptions: () => ({
			accessors: [
				'brand_name',
				'machine_name',
				'production_line_name',
				'location_name'
			],
			delimeter: ','
		}),

		showJustInfo() {
			return this.settings && this.settings.showJustInfo;
		}
	},

	methods: {
		...mapActions({
			fetch_vendors: 'plants_vendors/fetch_plants_vendors',
			fetch_equipment: 'equipments/fetch_equipment'
			// save_item: 'rfqs/save_rfq'
		}),

		localSetupPage(item) {
			if (item) {
				this.formData.vendor_ids = getValues('id', item.vendors);
			}
		}
	}
};
</script>
