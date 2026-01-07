<template>
	<div class="edit-form-container ">
		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<el-form
			:class="['item-edit-form']"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item
				:label="`${tt('Part_number')} ${tt('name')}`"
				prop="name"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
				<!-- <el-input v-model="formData.name" /> -->
			</el-form-item>

			<el-form-item
				:label="tt('item_type')"
				prop="type_id"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<CustomSelect
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.type_id"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Brand')"
				prop="brand_id"
				:class="{ 'mcol-xs-6': !fromModal }"
			>
				<FetchByQuerySelect
					clearable
					enableLoadmore
					v-model="formData.brand_id"
					:optionsLoading.sync="brandsLoading"
					:optionsList.sync="brandsList"
					:settings="brandQueryOptions"
					:placeholder="`${tt('Select')} ${tt('brand')}`"
				/>

				<!-- <CustomSelect
					filterable
					clearable
					:optionsLoading="brandsLoading"
					:optionsList="brandsList"
					:placeholder="`${tt('Select')} ${tt('brand')}`"
					v-model="formData.brand_id"
				/> -->
			</el-form-item>

			<el-form-item
				:label="tt('phrases.crossover_exluded')"
				prop="is_crossover_excluded"
				class="half-width"
			>
				<el-switch v-model="formData.is_crossover_excluded" />
			</el-form-item>

			<div class="el-form-item section-row">
				<TabsBar
					@switchTab="switchTab"
					:activeTab="activeTab"
					:tabsList="tabsList"
					:buttonsType="'primary inverted'"
				/>
			</div>

			<div
				v-show="activeTab.prop == 'optionsTab'"
				key="optionsTab"
				class="tab-container section-row"
			>
				<el-form-item
					v-if="equipmentType"
					:label="tt('phrases.Type_option_values')"
					prop="type_option_values"
					:class="['type-option-values', { 'mcol-xs-6': !isMobile && !fromModal }]"
				>
					<div class="options-container relative">
						<div class="content-row">
							<TypeOptionValueItem
								ref="TypeOptionValueItem"
								v-for="(item, idx) in equipmentType.type_options"
								:key="`types_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:currentDataList="(itemData && itemData.type_option_values) || []"
								:equipmentTypesLoading="equipmentTypesLoading"
							/>
							<!-- :typeOptionsList="(equipmentType && equipmentType.type_options) || []" -->
						</div>
					</div>
				</el-form-item>
			</div>

			<div
				v-show="activeTab.prop == 'mediaTab'"
				key="mediaTab"
				class="tab-container section-row"
			>
				<el-form-item
					v-if="equipmentType"
					:label="tt('phrases.Type_media_values')"
					prop="type_media_values"
					:class="['type-media-values']"
				>
					<div class="options-container relative">
						<div class="content-row">
							<TypeMediaValueItem
								ref="TypeMediaValueItem"
								v-for="(item, idx) in equipmentType.type_medias"
								:key="`media_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:currentDataList="(itemData && itemData.type_media_values) || []"
								:equipmentTypesLoading="equipmentTypesLoading"
							/>
						</div>
					</div>
				</el-form-item>
			</div>

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
	requestsListMixin,
	tabsMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		tabsMixin(),
		subItemsListMixin()
	],
	components: {
		TypeOptionValueItem: () => import('./TypeOptionValueItem.vue'),
		TypeMediaValueItem: () => import('./TypeMediaValueItem.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue')
	},
	data() {
		return {
			// typeOptionValuesItemsList: [],

			equipmentTypesLoading: false,
			equipmentTypesList: [],
			brandsLoading: false,
			brandsList: [],

			formData: {
				name: '',
				brand_id: null,
				type_id: null,
				is_crossover_excluded: false,
				type_option_values: [],
				type_media_values: []
			},

			rules: {
				name: required,
				brand_id: required,
				type_id: required
			}
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{
				ref: 'TypeOptionValueItem',
				targetProp: 'type_option_values',
				conditionSettings: {
					checkMethod: 'some',
					conditions: [
						{ prop: 'value', method: 'notEmpty' },
						{ prop: 'predefined_value_ids', method: 'notEmpty' }
					]
				},
			},			
			{
				ref: 'TypeMediaValueItem',
				targetProp: 'type_media_values',
				conditionSettings: {
					checkMethod: 'some',
					conditions: [
						{ prop: 'file', method: '!=', control_value: null },
						{ prop: 'id', method: '!=', control_value: null },
					]
				},
			},
		]),

		brandQueryOptions() {
			return Object.freeze({
				fetchAction: 'brands/fetch_brands',
				params: {
					orderByColumn: 'name',
					orderByMethod: 'asc',
					// equipmentTypeId: this.formData.type_id,
				}
				// params: { machineId: this.filters.machineId }
			});
		},

		requestsToDoList: that => [
			{
				action: 'fetch_equipment_types',
				localProp: 'equipmentTypesList',
				localLoadProp: 'equipmentTypesLoading'
			},
			{
				action: 'fetch_brands',
				payload: {
					params: {
						max: 30,
						orderByColumn: 'name',
						orderByMethod: 'asc'
					}
				},
				initialSetup:
					that.itemData && that.itemData.brand_id
						? {
								fetchById: {
									action: 'brands/fetch_brand',
									itemId: that.itemData.brand_id
								}
						  }
						: null,
				bindTo: [
					/*{
						prop: 'formData.type_id',
						clean_prop: 'formData.brand_id',
						param: 'equipmentTypeId',
						disableFetch: true //because loadmore is enabled
					}*/
				],
				localProp: 'brandsList',
				localLoadProp: 'brandsLoading'
			},
			/*{
				action: 'fetch_brands',
				payload: {
					params: {
						max: -1,
						orderByColumn: 'name',
						orderByMethod: 'asc'
					}
				},
				// bindTo: [{ prop: 'formData.type_id', param: 'equipmentTypeId' }],
				localProp: 'brandsList',
				localLoadProp: 'brandsLoading'
			}*/
			/*{
				action: 'fetch_site_areas',
				payload: { params: { max: -1 } },
				bindTo: { prop: 'formData.companies_ids', param: 'companies_ids' },
				clean_up: 'set_site_areas'
			}*/
		],

		equipmentType() {
			const { formData, equipmentTypesList } = this;
			if (equipmentTypesList && formData.type_id) {
				return findItemBy('id', formData.type_id, equipmentTypesList);
			}
			return null;
		},

		tabsList: that =>
			Object.freeze(
				that.$translate([
					{ title: 'option_values', prop: 'optionsTab' },
					{ title: 'media_values', prop: 'mediaTab' }
				])
			)
	},

	methods: {
		...mapActions({
			fetch_brands: 'brands/fetch_brands',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types'
		})

		/*localSetupPage(itemData) {
			if (itemData) {
				this.typeOptionValuesItemsList = this.setupFormSubItemsList(
					itemData.type_option_values || [],
					'to_i'
				);
			}
		}*/
	},

	watch: {
		equipmentType(type) {
			if (type && type.without_brand) {
				this.rules.brand_id = null;
			}
		}
	}
};
</script>
