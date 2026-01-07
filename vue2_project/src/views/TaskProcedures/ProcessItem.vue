<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container process-option-item']"
		:model="formData"
	>
		<div class="main-row content-row">
			<div
				:class="['flex mrow wrap content-container vertical-margin align-center']"
			>
				<el-form-item class="mcol-xs-12 mcol-sm-4" prop="name">
					<label v-if="itemIndex == 0">{{ tt('name') }}</label>
					<CustomInput
						required
						v-model="formData.name"
						:placeholder="`${tt('process')} ${tt('name')}`"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-sm-3" prop="notes">
					<label v-if="itemIndex == 0">{{ tt('Notes') }}</label>
					<CustomInput
						v-model="formData.notes"
						:placeholder="`${tt('input')} ${tt('notes')}`"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-sm-3" prop="expected_time">
					<label v-if="itemIndex == 0">{{ tt('Expected_time') }}</label>
					<el-time-select
						v-model="formData.expected_time"
						:picker-options="{
							start: '00:00',
							step: '00:15',
							end: '23:45'
						}"
						:placeholder="`${tt('select')} ${tt('time')}`"
					>
					</el-time-select>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-sm-1 switchers-block" prop="parts">
					<label v-if="itemIndex == 0">{{ tt('Parts') }}</label>
					<el-switch v-model="has_parts" />
				</el-form-item>

				<!-- <el-form-item prop="equipment_type_id" class="mcol-xs-8">
					<label v-if="itemIndex == 0">Item Type</label>
					<CustomSelect
						:optionsLoading="equipmentTypesLoading"
						:optionsList="equipmentTypesList"
						:placeholder="`${tt('Select')} ${tt('type')}`"
						v-model="formData.equipment_type_id"
					/>
				</el-form-item> -->

				<!-- <el-form-item prop="count" class="mcol-xs-4">
					<label v-if="itemIndex == 0">Count</label>
					<CustomInput v-model="formData.count" placeholder="count" />
				</el-form-item> -->

				<div class="remove-button-container">
					<el-button
						class="action-button remove-button"
						size="mini"
						type="danger"
						icon="icomoon icon-cross"
						@click="removeItem"
					/>
				</div>
			</div>
		</div>

		<div class="content-row sub-items-section card no-shadow" v-if="has_parts">
			<div class="card-content filled">
				<el-form-item prop="" class="">
					<div class="options-container relative mcol-xs-12 mcol-sm-8">
						<div v-if="partsItemsList.length" class="part-item content-row">
							<PartItem
								ref="PartItem"
								v-for="(item, idx) in partsItemsList"
								:key="`pv_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:partsList="partsList"
								:isLast="partsItemsList.length == idx + 1"
								@onRemove="id => removeFormItem(id, 'partsItemsList')"
							/>
						</div>

						<div class="create-button-container">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								icon="icomoon icon-cross"
								@click="addFormItem('partsItemsList', 'p_i-')"
							/>
						</div>
					</div>
				</el-form-item>
			</div>
		</div>
	</el-form>
</template>

<script>
// import { required } from '@/constants/validation';
import {
	subItemMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [subItemMixin(), subItemsListMixin()],
	components: {
		PartItem: () => import('./PartItem.vue')
	},
	props: {
		partsLoading: Boolean,
		partsList: {
			type: Array,
			default: () => []
		},
		showJustInfo: Boolean
	},

	data() {
		return {
			has_parts: false,
			partsItemsList: [],

			formData: {
				id: null,
				name: '',
				notes: '',
				expected_time: '',
				parts: []
			}
		};
	},

	computed: {
		deleteNewId: () => true,

		subItemsSettings: () => Object.freeze([
			{ ref: 'PartItem', targetProp: 'parts' }
		]),
	},

	methods: {
		filterEmptyItems(list = []) {
			return list.filter(li => li.id || li.part_id || li.quantity);
		},

		localSetupPageActions(itemData) {
			if (itemData) {
				this.partsItemsList = this.setupFormSubItemsList(itemData.parts, 'p_i');

				this.has_parts = !!this.partsItemsList.length;
			}

			if (!this.showJustInfo) {
				if (!this.partsItemsList.length) {
					this.addFormItem('partsItemsList', 'p_i-');
				}
			}
		},

		localGetFormDataCallback(formData) {
			formData.parts = this.filterEmptyItems(formData.parts);

			return formData;
		}
	}
};
</script>
