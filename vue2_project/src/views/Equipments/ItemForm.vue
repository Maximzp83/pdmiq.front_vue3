<template>
	<div class="edit-form-container">
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Status')" class="half-width">
				<CustomSelect
					:optionsList="statusesList"
					:placeholder="`${tt('select')} ${tt('status')}`"
					v-model="status_id"
					@change="handleStatusChange"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Asset')"
				prop="asset_id"
				class="half-width"
				v-show="status_id === STATUSES_TYPES.ASSET"
			>
				<FetchByQuerySelect
					@input="handleChangeAsset"
					enableLoadmore
					clearable
					:optionsLoading.sync="assetsLoading"
					:optionsList.sync="assetsList"
					:placeholder="`${tt('start')} ${tt('typing')} ${tt('asset')}`"
					v-model="formData.asset_id"
					:settings="assetQueryOptions"
				/>
			</el-form-item>

			<el-form-item
				v-show="status_id === STATUSES_TYPES.STORE"
				:label="tt('Storeroom')"
				prop="store_room_id"
				class="half-width"
			>
				<CustomSelect
					:optionsList="storeRoomsList"
					:placeholder="`${tt('start')} ${tt('storeroom')}`"
					v-model="formData.store_room_id"
				/>
			</el-form-item>

			<el-form-item
				v-show="status_id === STATUSES_TYPES.STORE"
				:label="`${tt('Storeroom')} ${tt('location')}`"
				prop="store_room_location_id"
				class="half-width"
			>
				<CustomSelect
					:optionsList="storeRoomLocationsList"
					:placeholder="`${tt('select')} ${tt('location')}`"
					v-model="formData.store_room_location_id"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('item_type')"
				prop="equipment_type_id"
				class="half-width"
			>
				<CustomSelect
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.equipment_type_id"
					@change="handleEquipmentTypeChange"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Drive')} ${tt('Type')}`"
				prop="drive_type_id"
				class="half-width"
			>
				<CustomSelect
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="drivesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.drive_type_id"
				/>
			</el-form-item>

			<el-form-item :label="tt('Brand')" prop="brand_id" class="half-width">
				<!-- :loadmoreIsActive="assetsLoadmoreIsActive" -->
				<FetchByQuerySelect
					@change="handleChangeBrand"
					clearable
					enableLoadmore
					v-model="formData.brand_id"
					:optionsLoading.sync="brandsLoading"
					:optionsList.sync="brandsList"
					:settings="brandQueryOptions"
					:placeholder="`${tt('select')} ${tt('brand')}`"
				/>

				<!-- <CustomSelect
					filterable
					:optionsLoading="brandsLoading"
					:optionsList="brandsList"
					:placeholder="`${tt('select')} ${tt('brand')}`"
					v-model="formData.brand_id"
				/> -->
			</el-form-item>

			<el-form-item
				:label="`${tt('Part')} ${tt('Number')}`"
				prop="brand_model_id"
				class="half-width content-row"
			>
					<!-- :loadmoreIsActive="!formData.brand_id || brandModelsList.length < 2" -->
				<FetchByQuerySelect
					@change="handleChangeBrandModel"
					clearable
					enableLoadmore
					loadmoreIsActive
					v-model="formData.brand_model_id"
					:optionsLoading.sync="brandModelsLoading"
					:optionsList.sync="brandModelsList"
					:settings="brandModelsQueryOptions"
					:placeholder="`${tt('select')} ${tt('part_number')}`"
				/>
			</el-form-item>

			<div class="content-row" v-if="selectedEquipmentType && formData.brand_model_id && preparedVibrationAnalysisItems.length">
				<b>{{tt('Vibration_Analysis')}}:</b>
			</div>

			<div class="form-section paint_v2 type_2 content-row"
				v-if="selectedEquipmentType && formData.brand_model_id && preparedVibrationAnalysisItems.length"
			>
				<AnalysisRuleItem
					class="el-form-item"
					ref="AnalysisRuleItem"
					v-for="(rule, idx) in preparedVibrationAnalysisItems"
					:key="`va-${rule.original_rule_id}`"
					:item-data="rule"
					:item-index="idx"
					:equipmentTypeId="selectedEquipmentType.id"
					:brandModelId="formData.brand_model_id"
					:rpm_source_value="rpm_source_value"
				/>
				<!-- <div class="text-center"></div> -->
			</div>

			<!-- --------------- -->
			<div class="content-row" v-if="preparedChildComponentsItems.length">
				<b>{{`${tt('Child')} ${tt('Components')}`}}:</b>
			</div>

			<div
				class="content-row paint"
				v-if="preparedChildComponentsItems.length"
			>
				<ChildComponentItem
					ref="ChildComponentItem"
					v-for="(child, idx) in preparedChildComponentsItems"
					:key="`child_component-${child.id ? child.id : idx}`"
					:item-data="child"
					:item-index="idx"
					:equipmentTypesList="equipmentTypesList"
					:rpm_source_value="rpm_source_value"
				/>
			</div>

			<!-- --------------- -->

			<div class="content-row">
				<b>RPM</b>
			</div>

			<div class="form-section paint_v2 type_2 content-row">
				<el-form-item
					:label="tt('Specification')"
					prop="rpm_option_value_id"
					class="half-width"
				>
					<CustomSelect
						filterable
						clearable
						:optionsLoading="rpmOptionsLoading"
						:optionsList="rpmOptionsList"
						:placeholder="`${tt('Select')} ${tt('parameter')}`"
						:setupLabelSettings="rpmSpecLabelOptions"
						v-model="formData.rpm_option_value_id"
					/>
				</el-form-item>

				<el-form-item 
					:label="`${tt('constants.Manual')}`"
					class="half-width"
					prop="rpm_value"
				>
					<el-input
						v-model.number="formData.rpm_value"
						:placeholder="`${tt('input')} RPM`"
					/>
				</el-form-item>

				<el-form-item
					prop="rpm_external_node_id"
					class="half-width"
					:label="`${tt('constants.external_input_rpm')}`"
				>
					<SimpleSpinner :active="bannerV2GenericParametersLoading" />
					<el-select
						@input="handleChangeExternalRpmNode"
						clearable
						:disabled="!bannerV2GenericParametersList.length"
						v-model="formData.rpm_external_node_id"
						:placeholder="`${tt('select')} ${tt('exteranal')}`"
					>
						<el-option
							v-for="item in bannerV2GenericParametersList"
							:key="'param_id-' + item.sensor_id"
							:label="item.sensor.location_in_equipment"
							:value="item.sensor_id"
						/>
					</el-select>

					<!-- <CustomSelect
						:optionsList="bannerV2GenericParametersList"
						:optionsLoading="bannerV2GenericParametersLoading"
						:placeholder="`${tt('select')} ${tt('exteranal')}`"
						v-model="formData.rpm_external_node_id"
						valueKey="sensor_id"
						idKey="sensor_id"
						:setupLabelSettings="rpmExternalLabelOptions"
					/> -->
						<!-- :setupLabelSettings="sensorLabelOptions" -->
				</el-form-item>

				<el-form-item
					prop="rpm_source_item"
					class="half-width"
					:label="`${tt('Item')} ${tt('Speed')}`"
				>
					<CustomSelect
						clearable
						:optionsList="itemSpeedOptionsList"
						:placeholder="`${tt('select')} ${tt('Item')} ${tt('Speed')}`"
						v-model="formData.rpm_source_item"
					/>
				</el-form-item>

				<el-form-item prop="rpm_formula">
					<template v-slot:label>
						<span class="span-block">{{ tt('formula') }}</span>
						<span class="span-block">
							<el-tooltip class="" effect="dark" placement="bottom">
								<i class="el-icon-info"></i>
								<div slot="content" v-html="formulaTooltipContent"></div>
							</el-tooltip>
						</span>
					</template>

					<CustomInput v-model="formData.rpm_formula" :placeholder="tt('input')" />
				</el-form-item>
			</div>

			<!-- <el-form-item label="Url" prop="url" class="half-width">
				<el-input v-model="formData.url" />
			</el-form-item> -->

			<el-form-item
				:label="tt('phrases.loc_on_machine')"
				prop="loc_on_machine"
				class="half-width content-row"
			>
				<CustomInput
					v-model="formData.loc_on_machine"
					:placeholder="`${tt('input')} ${tt('location')}`"
				/>
			</el-form-item>

			<!-- <el-form-item label="Is Limbo" prop="is_limbo" class="half-width">
				<el-switch v-model="formData.is_limbo" />
			</el-form-item> -->

			<!-- <el-form-item label="Is Storeroom" prop="is_store_room" class="half-width">
				<el-switch v-model="formData.is_store_room" />
			</el-form-item> -->

			<div class="el-form-item equipment-uploads-container">
					<!-- v-for="type in equipmentImgTypesList" -->
					<!-- :key="'equipment_img_type-' + type.id" -->
				<el-form-item
					:label="`${tt('Item')} ${tt('images')}`"
					prop="pictures"
					class="upload-form-item"
				>
					<FileUploadBlock
						ref="ItemImagesBlock"
						multiple
						rotate
						showDeleteButton
						:enableReorderFiles="{appendTo:'body', formKey:'display_order'}"
						:pictures="itemImagesList"
						:additionalFormData="{ type: EQUIPMENT_IMG_TYPES.EQUIPMENT }"
						:blockId="EQUIPMENT_IMG_TYPES.EQUIPMENT"
					/>
						<!-- @onUploadListRefLoaded="<tt></tt>" -->
						<!-- uploadListWapperClass="el-upload-list-wrapper drag-n-drop-list" -->
				</el-form-item>

				<el-form-item
					:label="`${tt('constants.Nameplate')} ${tt('images')}`"
					prop="pictures"
					class="upload-form-item"
				>
					<FileUploadBlock
						ref="nameplateImagesBlock"
						multiple
						rotate
						showDeleteButton
						:pictures="nameplateImagesList"
						:enableReorderFiles="{appendTo:'body', formKey:'display_order'}"
						:additionalFormData="{ type: EQUIPMENT_IMG_TYPES.NAMEPLATE }"
						:blockId="EQUIPMENT_IMG_TYPES.NAMEPLATE"
					/>
						<!-- :pictures="getPicturesByType(type.id)" -->
				</el-form-item>
			</div>

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
				<FetchByQuerySelect
					clearable
					enableLoadmore
					v-model="desiredId"
					:optionsLoading.sync="equipmentsLoading"
					:optionsList.sync="equipmentsList"
					:settings="equipmentQueryOptions"
					:setupLabelSettings="equipmentLabelOptions"
					:placeholder="tt('phrases.select_equipment_whose_order_you_want_to_reset')"
				/>

				<!-- <CustomSelect
					filterable
					:optionsLoading="equipmentsLoading"
					:optionsList="filteredEquipmentsList"
					:placeholder="tt('phrases.select_equipment_whose_order_you_want_to_reset')"
					v-model="desiredId"
				/> -->
			</el-form-item>

			<!-- <FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/> -->
		</el-form>

		<el-dialog
			center
			:title="tt('ANALOGUES')"
			:append-to-body="true"
			:visible.sync="analoguesDialogVisible"
			:class="'small'"
		>
			<div class="" v-if="analoguesList.length">
				<ul>
					<li
						v-for="(item, idx) in analoguesList"
						:key="`analogue-${item.id}`"
						v-text="
							`${idx}: ${item.brand_name}, ${item.item_type}, ${item.location_name}, ${item.part_number}`
						"
					></li>
				</ul>
			</div>
			<div v-else-if="analoguesLoading" class="text-center">
				Analogues is loading...
			</div>
			<div v-else class="text-center">Analogues not found</div>
		</el-dialog>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { findItemBy, cloneArr, sortArrayByKeyNumber } from '@/helpers';
import { checkUploadSettings } from '@/helpers/specialHelpers';

import { required } from '@/constants/validation';
import {
	// itemFormMixin,
	requestsListMixin,
	// fetchByQueryMixin,
	multiformMixin,
	subItemsListMixin,
	subItemMixin
} from '@/mixins';
import { 
	/*equipmentImgTypesList,*/ itemSpeedOptionsList, RPM_SOURCES_TYPES,
	ITEM_SPEED_OPTIONS, EQUIPMENT_IMG_TYPES
} from '@/constants/global';

export default {
	mixins: [
		// itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin(),
		subItemMixin(),
		//fetchByQueryMixin,
		multiformMixin(),
	],
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		// ImgUploadBlock: () => import('@/components/form/ImgUploadBlock.vue'),
		AttachmentItem: () => import('../ProductionLines/AttachmentItem.vue'),
		AnalysisRuleItem: () => import('./AnalysisRuleItem.vue'),
		ChildComponentItem: () => import('./ChildComponentItem.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
	},

	props: {
		fromMultiformModal: Boolean,

		// ---From FormItemMixin-------
		itemData: {	type: Object,	default: () => null },

		fromModal: Boolean,
		showSubmitButtons: Boolean,
		editInModal: Boolean,
		additionalSettings: { type: Object,	default: () => ({}) },
		itemsName: { type: Object, default: () => ({}) },
	},

	data() {
		return {
			draggingLocked: false,
			isMobile: false,

			analoguesDialogVisible: false,
			// selectedEquipmentType: null,
			librariesItemsList: [],

			status_id: null,

			assetsLoading: false,
			// assetsList: [],
			assetFetchedById: null,
			// firstEquipmentTypesFetch: true,
			skipBindingCleanProp: {},
			skipListCleanProp: {},

			brandsLoading: false,
			brandsList: [],
			subBrandsLoading: false,
			subBrandsList: [],
			brandModelsLoading: false,
			brandModelsList: [],
			subBrandModelsLoading: false,
			subBrandModelsList: [],
			equipmentTypesLoading: false,
			equipmentTypesList: [],
			storeRoomsLoading: false,
			storeRoomsList: [],
			analoguesLoading: false,
			analoguesList: [],
			equipmentsLoading: false,
			equipmentsList: [],
			rpmOptionsLoading: false,
			rpmOptionsList: [],

			// equipmentTypeHasChanged: false,
			childComponentsList: [],
			vibrationAnalysisLoading: false,
			vibrationAnalysisList: [],

			bannerV2GenericParametersList: [],
			bannerV2GenericParametersLoading: false,

			externalRpmItem: null,

			desiredId: null,

			isDropdownActive: {
				assets: false,
				brands: false,
				brandModels: false
			},

			formData: {
				plant_id: null,
				asset_id: null,
				brand_id: null,
				brand_model_id: null,
				equipment_type_id: null,
				drive_type_id: null,
				is_limbo: false,
				// url: '',
				loc_on_machine: '',
				is_store_room: 0,
				store_room_id: null,
				libraries: [],
				pictures: [],

				equipment_subtype_id: null,
				subtype_brand_id: null,
				subtype_brand_model_id: null,
				rpm_formula: '{value}',

				rpm_value: '',
				rpm_option_value_id: null,
				rpm_external_node_id: null,
				rpm_external_node_parameter: null,
				rpm_external_source_type: RPM_SOURCES_TYPES.EXTERNAL_INPUT,
				rpm_source_item: null,

				vibration_analysis_rules: [],
				child_components: []

			},

			rules: {
				// name: required,
				asset_id: null,
				plant_id: required,
				brand_id: required,
				brand_model_id: required,
				equipment_type_id: required
				// url: required,
			}
		};
	},

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			userPlantId: state => state.auth.authUser.plant_id,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,

			plantsList: state => state.global.globalPlantsList,

			assetsList: state => state.assets.itemsList
			// assetsLoading: state => state.assets.isLoading
		}),
		instanceName: () => 'Equipments',

		// equipmentImgTypesList: () => equipmentImgTypesList(),
		EQUIPMENT_IMG_TYPES: () => Object.freeze(EQUIPMENT_IMG_TYPES),
		itemSpeedOptionsList: () => Object.freeze(itemSpeedOptionsList()),

		STATUSES_TYPES: () => ({
			ASSET: 1,
			LIMBO: 2,
			STORE: 3
		}),

		statusesList: that => [
			{ id: that.STATUSES_TYPES.ASSET, name: 'Asset' },
			// { id: that.STATUSES_TYPES.LIMBO, name: 'Is limbo' },
			{ id: that.STATUSES_TYPES.STORE, name: 'Storeroom' }
		],

		currentEquipmentTypeItem: that =>
			that.itemData ? that.itemData.equipmentType : null,

		assetQueryOptions() {
			return Object.freeze({
				fetchAction: 'assets/fetch_assets',
				params: {
					plantId: this.globalFilters.plantId,
					machineId: this.multiFormFilters ? this.multiFormFilters.machineId : null
				},
				setToStore: 'assets/set_assets',
				loading: true
			});
		},

		brandQueryOptions() {
			return Object.freeze({
				fetchAction: 'brands/fetch_brands',
				params: {
					orderByColumn: 'name',
					orderByMethod: 'asc',
					equipmentTypeId: this.formData.equipment_type_id,
					machineId: this.multiFormFilters ? this.multiFormFilters.machineId : null
				}
			});
		},

		/*subBrandQueryOptions() {
			if (this.childEquipmentType) {
				return Object.freeze({
					fetchAction: 'brands/fetch_brands',
					params: {
						orderByColumn: 'name',
						orderByMethod: 'asc',
						equipmentTypeId: this.childEquipmentType.id,
						machineId: this.multiFormFilters ? this.multiFormFilters.machineId : null
					}
				});
			}
			return null;
		},
		*/

		brandModelsQueryOptions() {
			return Object.freeze({
				fetchAction: 'brand_models/fetch_brand_models',
				params: {
					equipmentTypeId: this.formData.equipment_type_id,
					brandId: this.formData.brand_id
				}
			});
		},

		subBrandModelsQueryOptions() {
			if (this.childEquipmentType) {
				return Object.freeze({
					fetchAction: 'brand_models/fetch_brand_models',
					params: {
						equipmentTypeId: this.childEquipmentType.id,
						brandId: this.formData.subtype_brand_id
					}
				});
			}
			return null;
		},

		requestsToDoList() {
			// console.log(this.itemData)
			let items = [
				{
					action: 'fetch_equipment_types',
					localProp: 'equipmentTypesList',
					localLoadProp: 'equipmentTypesLoading'
				},
				{
					action: 'fetch_brands',
					initialSetup:
						this.itemData && this.itemData.brand_id
							? {
									fetchById: {
										action: 'brands/fetch_brand',
										itemId: this.itemData.brand_id
									}
							  }
							: null,
					bindTo: [
						{
							prop: 'formData.equipment_type_id',
							clean_prop: 'formData.brand_id',
							param: 'equipmentTypeId',
							disableFetch: true //because loadmore is enabled
						}
					],
					localProp: 'brandsList',
					localLoadProp: 'brandsLoading'
				},
				{
					action: 'fetch_brands',
					initialSetup:
						this.itemData && this.itemData.subtype_brand_id
							? {
									fetchById: {
										action: 'brands/fetch_brand',
										itemId: this.itemData.subtype_brand_id
									}
							  }
							: null,
					bindTo: [
						{
							prop: 'formData.equipment_subtype_id',
							param: 'equipmentTypeId',
							clean_prop: 'formData.subtype_brand_id',
							disableFetch: true
						}
					],
					localProp: 'subBrandsList',
					localLoadProp: 'subBrandsLoading'
				},
				{
					action: 'fetch_brand_models',
					payload: { params: { max: 30 } },

					initialSetup:
						this.itemData && this.itemData.brand_model_id
							? {
									fetchById: {
										action: 'brand_models/fetch_brand_model',
										itemId: this.itemData.brand_model_id
									}
							  }
							: null,
					bindTo: [
						/*{
							prop: 'formData.equipment_type_id',
							param: 'equipmentTypeId',
							// noFetch: !this.formData.brand_model_id,
							// clean_prop: 'formData.brand_model_id',
							disableFetch: true
						},*/
						{
							prop: 'formData.brand_id',
							param: 'brandId',
							clean_prop: 'formData.brand_model_id',
							disableFetch: true
						}
					],
					localProp: 'brandModelsList',
					localLoadProp: 'brandModelsLoading'
				},
				{
					action: 'fetch_brand_models',
					initialSetup:
						this.itemData && this.itemData.subtype_brand_model_id
							? {
									fetchById: {
										action: 'brand_models/fetch_brand_model',
										itemId: this.itemData.subtype_brand_model_id
									}
							  }
							: null,
					bindTo: [
						{
							prop: 'formData.equipment_subtype_id',
							param: 'equipmentTypeId',
							clean_prop: 'formData.subtype_brand_model_id',
							disableFetch: true
						},
						{
							prop: 'formData.subtype_brand_id',
							param: 'brandId',
							clean_prop: 'formData.subtype_brand_model_id'
						}
					],
					localProp: 'subBrandModelsList',
					localLoadProp: 'subBrandModelsLoading'
				},
				{
					action: 'fetch_store_rooms',
					bindTo: [{ prop: 'formData.plant_id', param: 'plantId' }],
					localProp: 'storeRoomsList',
					localLoadProp: 'storeRoomsLoading'
				},
				{
					action: 'fetch_assets',
					blockInitialFetch: this.fromMultiformModal,
					payload: {
						setToStore: true
					},
					bindTo: [
						{
							prop: 'multiFormFilters.machineId',
							clean_prop: 'formData.asset_id',
							param: 'machineId',
							fetchById: {
								action: 'assets/fetch_asset',
								itemId: this.formData.asset_id
							}
						}
					],
					localProp: 'assetFetchedById',
					localLoadProp: 'assetsLoading'
				},
				{
					action: 'fetch_equipments',
					payload: { params: { max: -1 } },
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true }
					],
					localProp: 'equipmentsList',
					localLoadProp: 'equipmentsLoading'
				},
				{
					action: 'fetch_production_line_rpm_nodes',
					localProp: 'bannerV2GenericParametersList',
					localLoadProp: 'bannerV2GenericParametersLoading',
					payload: { params: { max: -1 } }
				}
			];

			/*if (this.itemData) {
				items.push({
					action: 'fetch_rpm_options',
					payload: { itemId: this.itemData.id, params: { max: -1 } },
					localProp: 'rpmOptionsList',
					localLoadProp: 'rpmOptionsLoading'
				})
			}*/

			return Object.freeze(items);
		},

		uploadSettings: () =>
			Object.freeze([
				{ fileProp: 'pictures', multiple: true },
				{ fileProp: 'libraries', multiple: true }
			]),

		selectedEquipmentType() {
			const { equipmentTypesList, formData } = this;
			if (equipmentTypesList.length && formData.equipment_type_id) {
				return findItemBy('id', formData.equipment_type_id, equipmentTypesList);
			}
			return null;
		},

		/*childEquipmentType() {
			const { selectedEquipmentType, equipmentTypesList } = this;
			if (equipmentTypesList.length && selectedEquipmentType) {
				return findItemBy('parent_id', selectedEquipmentType.id, equipmentTypesList);
			}
			return null;
		},*/

		childComponentsForSelectedEquipmentType() {
			const { selectedEquipmentType } = this;
			if (selectedEquipmentType && selectedEquipmentType.child_components) {
				// return selectedEquipmentType.child_components.map(ci => ci.child);
				// return selectedEquipmentType.child_components;
				return selectedEquipmentType.child_components.map(ci => ({
					original_component: { ...ci },
					id: null,
					original_component_id: ci.id,
				}));
			}
			return [];
		},

		drivesList() {
			if (this.selectedEquipmentType) {
				return this.selectedEquipmentType.drives || [];
			}

			return [];
		},

		selectedStoreroom() {
			const { storeRoomsList, formData } = this;
			if (storeRoomsList.length && formData.store_room_id) {
				return findItemBy('id', formData.store_room_id, storeRoomsList);
			}
			return null;
		},

		storeRoomLocationsList() {
			if (this.selectedStoreroom) {
				return this.selectedStoreroom.locations || [];
			}

			return [];
		},

		subItemsSettings: () => Object.freeze([
			// { ref: 'FileUploadBlock', targetProp: 'pictures' },
			{ ref: 'ItemImagesBlock', targetProp: 'pictures' },
			{ ref: 'nameplateImagesBlock', targetProp: 'pictures' },
			{ ref: 'AttachmentItem', targetProp: 'libraries' },			
			{ ref: 'AnalysisRuleItem', targetProp: 'vibration_analysis_rules' },
			{ ref: 'ChildComponentItem', targetProp: 'child_components' },
		]),

		itemImagesList() {
			return sortArrayByKeyNumber(
				this.getPicturesByType(EQUIPMENT_IMG_TYPES.EQUIPMENT),
				'display_order'
			);
		},

		nameplateImagesList() {
			return sortArrayByKeyNumber(
				this.getPicturesByType(EQUIPMENT_IMG_TYPES.NAMEPLATE),
				'display_order'
			);
		},

		// validateSubItems: () => true,

		/*preparedEquipmentTypesList() {
			if (this.equipmentTypesList.length) {
				if (this.selectedEquipmentType) {
					const newList = [].concat(
						this.equipmentTypesList,
						this.selectedEquipmentType
					);
					// console.log(newList, this.selectedEquipmentType)
					return Object.freeze(newList);
				} else {
					return Object.freeze(this.equipmentTypesList);
				}
			}

			return [];
		},*/

		/*selectedAsset() {
			return findItemBy('id', this.formData.asset_id, this.assetsList);
		},*/

		/*filteredEquipmentTypesList() {
			const { equipmentTypesList, status_id, STATUSES_TYPES, selectedAsset } = this;

			if (status_id === STATUSES_TYPES.ASSET) {
				if (selectedAsset && equipmentTypesList.length) {
					return this.filterEquipmentTypes(
						equipmentTypesList,
						selectedAsset.composed
					);
				}
			} else {
				return equipmentTypesList;
			}

			return [];
		},*/

		/*filteredBrandModelsList() {
			const { equipment_type_id, brand_id } = this.formData;
			const { brandModelsList } = this;

			if (brandModelsList.length && equipment_type_id && brand_id) {
				return this.filterBrandModels(brandModelsList, brand_id, equipment_type_id);
			}

			return [];
		},*/

		filteredEquipmentsList() {
			if (this.itemData && this.equipmentsList.length) {
				return this.equipmentsList.filter(pl => pl.id !== this.itemData.id);
			}
			return [];
		},

		equipmentQueryOptions() {
			return Object.freeze({
				fetchAction: 'equipments/fetch_equipments',
				params: { plantId: this.globalFilters.plantId }
			});
		},

		equipmentLabelOptions: () =>
			Object.freeze({
				accessors: [
					'brand_name',
					'machine_name',
					'production_line_name',
					'location_name'
				],
				delimeter: ','
			}),

		rpmSpecLabelOptions: () =>
			Object.freeze({
				accessors: [
					'option_name',
					'value',
				],
				// delimeter: ','
			}),

		/*rpmExternalLabelOptions: () =>
			Object.freeze({
				accessors: [
					'sensor.location_in_equipment',
				],
				// delimeter: ','
			}),*/

		selectedExternalRpmItem() {
			const { bannerV2GenericParametersList, formData } = this;
			if (bannerV2GenericParametersList.length && formData.rpm_external_node_id) {
				return findItemBy('sensor_id', formData.rpm_external_node_id, bannerV2GenericParametersList);
			}
			return null;
		},

		selectedAsset() {
			const { assetsList, formData } = this;
			if (assetsList.length && formData.asset_id) {
				return findItemBy('id', formData.asset_id, assetsList);
			}
			return null;
		},

		isAssetProdlineHasRPM() {
			if (this.selectedAsset && this.selectedAsset.machine && this.selectedAsset.machine.productionLine) {
				var {
					rpm_source_type, rpm_value, rpm_node_id
				} = this.selectedAsset.machine.productionLine;

				return !!(rpm_source_type || rpm_value || rpm_node_id)
			}
			return false;
		},

		formulaTooltipContent() {
			return this.$t('aliases.rpm_tooltip_prhrase');
		},

		// ------------------------------

		preparedChildComponentsItems() {
			// console.log(this.itemData)
			return this.childComponentsForSelectedEquipmentType.map(ci => {
				if (this.itemData) {
					const equipmentChildComponentItem = findItemBy('original_component_id', ci.original_component.id, this.itemData.child_components);

					if (equipmentChildComponentItem) {
						const childItem = findItemBy('id', equipmentChildComponentItem.original_component.child_id, this.equipmentTypesList);

						// --------------
						let childs = [];
						if (equipmentChildComponentItem.original_component.child_ids) {
							equipmentChildComponentItem.original_component.child_id.forEach(child_id => {
								const childItem = findItemBy('id', child_id, this.equipmentTypesList);
								if (childItem) {
									childs.push({...childItem});
								}
							})
						}
						
						return {
							...equipmentChildComponentItem,
							original_component: {
								...equipmentChildComponentItem.original_component,
								child: childItem,
								childs
							}
						};
					}
				}

				return ci;
			})
		},

		preparedVibrationAnalysisItems() {
			return this.vibrationAnalysisList.map(rule => {
				if (this.itemData) {
					const ruleItemInEquipment = findItemBy('original_rule_id', rule.id, this.itemData.vibration_analysis_rules);

					if (ruleItemInEquipment) {
						return ruleItemInEquipment;
					}
				}

				return {
					original_rule: {...rule},
					id: null,
					original_rule_id: rule.id
				};
			})		
		},

		rpm_source_value: that => that.itemData && that.itemData.rpmSources ? that.itemData.rpmSources.rpm_source_value_evaluated : null,

		/*preparedVibrationAnalysisItems2() {
			if (this.vibrationAnalysisList.length) {
				return this.vibrationAnalysisList.map(rule => ({
					original_rule: {...rule},
					id: null,
					original_rule_id: rule.id
				}))
			} else if (this.itemData && this.itemData.vibration_analysis_rules) {
				return this.itemData.vibration_analysis_rules;
			}
			return [];
		},*/
	},

	methods: {
		...mapActions({
			fetch_assets: 'assets/fetch_assets',
			set_assets: 'assets/set_assets',

			fetch_brands: 'brands/fetch_brands',
			fetch_brand_models: 'brand_models/fetch_brand_models',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			fetch_equipment_type: 'equipment_types/fetch_equipment_type',
			fetch_store_rooms: 'store_rooms/fetch_store_rooms',
			fetch_analogues: 'equipments/fetch_analogues',

			fetch_equipments: 'equipments/fetch_equipments',
			fetch_rpm_options: 'equipments/fetch_rpm_options',
			fetch_production_line_rpm_nodes: 'production_lines/fetch_production_line_rpm_nodes',
			fetch_vibration_analysis_rules: 'equipments/fetch_vibration_analysis_rules',
			// save_item: 'equipments/save_equipment'
		}),

		handleCancel() {
			this.$emit('onCancel');
		},

		// ------RPM----
		handleChangeExternalRpmNode(id) {
			if (id) {
				this.formData.rpm_source_item = ITEM_SPEED_OPTIONS.EXTERNAL;
			} else {
				this.formData.rpm_source_item = null;
				this.handleChangeAsset(this.formData.asset_id);
			}
		},

		handleChangeAsset(id) {
			if (this.formData.rpm_source_item !== ITEM_SPEED_OPTIONS.EXTERNAL) {
				if (id && this.isAssetProdlineHasRPM) {
					this.formData.rpm_source_item = ITEM_SPEED_OPTIONS.LINESPEED_RPM
				}	else {
					// this.formData.rpm_source_item = null;
					this.handleChangeBrandModel(this.formData.brand_model_id);
				}
			}
		},

		handleChangeBrandModel(id) {
			this.formData.rpm_option_value_id = null;
			var { rpm_source_item, equipment_type_id } = this.formData;

			if (id && equipment_type_id) {
				this.fetchRpmOptions(equipment_type_id, id);
			}

			if (rpm_source_item !== ITEM_SPEED_OPTIONS.EXTERNAL &&
					rpm_source_item !== ITEM_SPEED_OPTIONS.LINESPEED_RPM
			) {
				if (id) {
					this.formData.rpm_source_item = ITEM_SPEED_OPTIONS.SPECIFICATION_RPM;
				} else {
					this.formData.rpm_source_item = null;
				}
			}
		},

		handleChangeBrand() {
			this.formData.rpm_option_value_id = null;
		},

		// ---------------

		handleShowAnalogues() {
			this.analoguesDialogVisible = true;
			if (!this.analoguesList.length) {
				const payload = { itemId: this.itemData.id };
				this.startFetchAction({
					action: 'fetch_analogues',
					localProp: 'analoguesList',
					localLoadProp: 'analoguesLoading',
					payload: payload
				});
			}
		},

		fetchAssets(/*itemData*/) {
			const { instancesItemsData, globalFilters } = this;
			let payload = {
				setToStore: true,
				params: {
					// max: -1,
					plantId: globalFilters.plantId,
					q: instancesItemsData.asset ? instancesItemsData.asset.name : null
				}
			};

			/*if (itemData) {
				payload.params.q = itemData.asset_name
			} else {
				if (instancesItemsData && instancesItemsData.asset) {
					payload.params.q = instancesItemsData.asset.name
				}
			}*/
			// console.log(itemData, payload)
			this.startFetchAction({
				action: 'fetch_assets',
				// localProp: 'assetsList',
				// localLoadProp: 'assetsLoading',
				payload: payload
			});

			// this.fetch_assets(payload);
		},

		fetchRpmOptions(equipment_type_id, brand_model_id) {
			this.doFetchAction(
				'fetch_rpm_options',
				'rpmOptionsList',
				'rpmOptionsLoading',
				{params: { equipment_type_id, brand_model_id }},
			);
		},

		localSetupPageActions(item) {
			/*if (!this.assetsList.length) {
				this.fetchAssets(item);
			}*/

			if (item && Object.keys(item).length) {
				const { asset_id, is_limbo, is_store_room } = item;

				this.librariesItemsList = this.setupFormSubItemsList(item.libraries, 'a_i');

				// console.log(item)
				if (is_limbo) this.status_id = this.STATUSES_TYPES.LIMBO;
				else if (is_store_room) {
					this.status_id = this.STATUSES_TYPES.STORE;
					if (item.storeRooms.length) {
						this.formData.store_room_id = item.storeRooms[0].id;
					}
				} else if (asset_id) {
					this.status_id = this.STATUSES_TYPES.ASSET;
					this.rules.asset_id = required;

					if (this.fromMultiformModal) {
						this.fetchAssets();
					}
				}

				if (item.brand_model_id && item.equipment_type_id) {
					this.fetchRpmOptions(item.equipment_type_id, item.brand_model_id);
				}

				// -----------------------
				// console.log(item)
				/*if (
					(!item.vibration_analysis_rules || !item.vibration_analysis_rules.length) 
					&& item.equipment_type_id
				) {
					this.fetchVibrationAnalysis(item.equipment_type_id)
				}*/

			} else {
				if (this.multiFormFilters && this.multiFormFilters.plantId) {
					this.formData.plant_id = this.multiFormFilters.plantId;
				} else {
					this.formData.plant_id = this.showPlant
						? this.showPlant.id
						: this.globalFilters.plantId;
				}
				// console.log('setupByParentInstance')
				this.setupByParentInstance(this.instancesItemsData, 'asset', 'asset_id', {
					callback: this.fetchAssets
				});

				if (this.instancesItemsData && this.instancesItemsData.asset) {
					this.status_id = this.STATUSES_TYPES.ASSET;
					this.rules.asset_id = required;
				}
			}
		},

		getPicturesByType(type) {
			if (this.itemData && this.itemData.pictures) {
				return this.itemData.pictures.filter(p => p.type === type);
			}
			return [];
		},

		/*filterBrandModels(list, brand_id, equipment_type_id) {
			return list.filter(model => {
				return model.brand_id === brand_id && model.type_id === equipment_type_id;
			});
		},

		filterEquipmentTypes(list, composedList) {
			// console.log(list, composedList)
			return list.filter(e_type => {
				return composedList.some(ci => ci.equipment_type_id === e_type.id);
			});
		},*/

		handleStatusChange(id) {
			this.formData.is_limbo = false;
			this.formData.is_store_room = 0;
			this.rules.asset_id = null;

			if (id === this.STATUSES_TYPES.LIMBO) {
				this.formData.is_limbo = true;
				this.formData.asset_id = null;
			} else if (id === this.STATUSES_TYPES.STORE) {
				this.formData.is_store_room = 1;
			} else if (id === this.STATUSES_TYPES.ASSET) {
				this.rules.asset_id = required;
			}
		},

		handleEquipmentTypeChange() {
			this.formData.equipment_subtype_id = null;
			// -----------------
			// this.equipmentTypeHasChanged = true;
			// this.fetchVibrationAnalysis(id);
		},

		// ----------------------
		fetchVibrationAnalysis(equipmentTypeId) {
			const payload = { 
				equipmentTypeId,
				// params: { max: -1 }
			};

			this.doFetchAction(
				'fetch_vibration_analysis_rules',
				'vibrationAnalysisList',
				'vibrationAnalysisLoading',
				payload
			);
		},

		localGetFormDataCallback(data) {
			const { status_id, childEquipmentType } = this;
			const { subtype_brand_id, subtype_brand_model_id } = this.formData;

			if (status_id !== this.STATUSES_TYPES.ASSET) {
				data.asset_id = null;
			}
			if ((subtype_brand_id || subtype_brand_model_id) && childEquipmentType) {
				data.equipment_subtype_id = childEquipmentType.id;
			}

			data.child_components = data.child_components.filter(ci => {
				return ci.brand_id && ci.brand_model_id;
			});

			// if (!data.url) delete data.url;

			/*if (!data.plant_id) {
				data.plant_id = this.userPlantId
			}*/

			return data;
		},

		localGetFormData(formData) {
			let payload = {
				equipmentForm: {
					id: this.itemId,
					...formData,
				}
				// withFile: withFile
			};

			payload = checkUploadSettings(payload, this.uploadSettings, {
				dataKey: 'equipmentForm'
			});

			if (this.itemData && this.desiredId) {
				payload.desiredId = this.desiredId;
				payload.className = this.itemData.className;
			}

			return payload;
		},

		/*localSubmit(data) {
			let payload = {
				equipmentForm: data
				// withFile: withFile
			};

			payload = checkUploadSettings(payload, this.uploadSettings, {
				dataKey: 'equipmentForm'
			});

			if (this.itemData && this.desiredId) {
				payload.desiredId = this.desiredId;
				payload.className = this.itemData.className;
			}

			if (process.env.NODE_ENV === 'development') {
				if (payload) {
					console.log(payload)
					return;
				}
			}

			this.$emit('event', 'handleFormReady', payload);
		}*/
	},

	watch: {
		'formData.equipment_type_id'(id) {
				this.fetchVibrationAnalysis(id);
		},
		/*'formData.equipment_type_id'(id) {
			// console.log(id && this.equipmentTypesList.length)
			if (id && this.equipmentTypesList.length) {
				const item = findItemBy('id', id, this.equipmentTypesList);
				if (item) {
					// this.selectedEquipmentType = item;
				} else {
					const payload = { itemId: id };
					this.doFetchAction(
						'fetch_equipment_type',
						'selectedEquipmentType',
						'equipmentTypesLoading',
						payload
					);
					this.startFetchAction({
						action: 'fetch_equipment_type',
						localProp: 'selectedEquipmentType',
						localLoadProp: 'equipmentTypesLoading',
						payload: payload
					});
				}
			}
			// if (this.isInitialSetup) return;
			// this.formData.brand_id = null;
			// this.formData.brand_model_id = null;
		},*/

		/*'equipmentTypesList'(list) {
			const { equipment_type_id } = this.formData;
			if (list.length && equipment_type_id) {
				const item = findItemBy('id', equipment_type_id, list);
				if (item) {
					// this.selectedEquipmentType = item;
				} else {
					const payload = { itemId: this.formData.equipment_type_id };
					this.doFetchAction(
						'fetch_equipment_type',
						'selectedEquipmentType',
						'equipmentTypesLoading',
						payload
					);
				}
			}
		},*/

		'isIndustrialMatrix'(isAdmin) {
			if (this.userPlantId && !isAdmin) {
				this.formData.plant_id = this.userPlantId;
			}
		},
		'multiFormFilters.plantId'(id) {
			this.formData.plant_id = id;
		},

		'assetFetchedById'(asset) {
			if (asset.length) {
				let newList = cloneArr(this.assetsList);
				newList.splice(0, 0, asset[0]);
				this.set_assets(newList);
			}
		},

		/*'formData.equipment_type_id'() {
			console.log('formData.equipment_type_id')
			this.skipBindingCleanProp = 'formData.brand_id';
		},*/

		'selectedEquipmentType'(type) {
			if (type && type.without_brand) {
				this.rules.brand_id = null;
			}
			// console.log('selectedEquipmentType', type);

			if (!this.itemId) {
				if (type && type.default_brand_id && !this.formData.brand_id) {
					this.brandsList = [type.default_brand];
					this.skipBindingCleanProp['formData.brand_id'] = true;
					this.skipListCleanProp['brandsList'] = true;

					this.formData.brand_id = type.default_brand_id;
					// console.log('selectedEquipmentType', type, this.brandsList)
				}
				if (type && type.default_brand_model_id && !this.formData.brand_model_id) {
					this.brandModelsList = [type.default_brand_model];
					this.skipBindingCleanProp['formData.brand_model_id'] = true;
					this.skipListCleanProp['brandModelsList'] = true;

					this.formData.brand_model_id = type.default_brand_model_id;
					// console.log('selectedEquipmentType', this.brandModelsList)
				}
			}
		},

		'selectedExternalRpmItem'(item) {
			// this.formData.rpm_external_node_id = item ? item.sensor_id : null;
			this.formData.rpm_external_node_parameter = item ? item.node_parameter : null;
		},

		// ----RPM-----
		/*'formData.asset_id'(id) {
			// console.log(id, !this.itemId , !this.itemData.rpm_source_item)
			if (id && (this.formData.rpm_source_item !== ITEM_SPEED_OPTIONS.EXTERNAL)) {
				this.formData.rpm_source_item = this.isAssetProdlineHasRPM
					? ITEM_SPEED_OPTIONS.LINESPEED_RPM
					: null;
			}
		},*/

		/*'formData.brand_model_id'(id) {
			this.formData.rpm_option_value_id = null;
			if (id && this.formData.equipment_type_id) {
				this.fetchRpmOptions(this.formData.equipment_type_id, id);
			}
		},*/

		rpmOptionsList(list) {
			if (list.length) {
				if (this.formData.rpm_source_item === ITEM_SPEED_OPTIONS.SPECIFICATION_RPM) {
					this.formData.rpm_option_value_id = list[0].id;
				}
			}
		},

		/*'formData.rpm_external_node_id'(id) {
			if (id) {
				this.formData.rpm_source_item = ITEM_SPEED_OPTIONS.EXTERNAL;
			} else {

			}
		}*/

		// --------------

		/*externalRpmItem(item) {
			this.formData.rpm_external_node_id = item ? item.sensor_id : null;
			this.formData.rpm_external_node_parameter = item ? item.node_parameter : null;
		},*/

		/*bannerV2GenericParametersList(list) {
			console.log(list, this.formData.rpm_external_node_id)
			if (list.length && this.formData.rpm_external_node_id) {
				this.externalRpmItem = findItemBy('sensor_id', this.formData.rpm_external_node_id, list);				
			}
		},*/


		/*equipmentTypesList(list) {
			if (list.length && this.firstEquipmentTypesFetch && this.currentEquipmentTypeItem) {
				this.firstEquipmentTypesFetch = false;
				
				if ( !list.some(li => li.id == this.currentEquipmentTypeItem.id) ) {
					let newList = cloneArr(list);
					newList.splice(0, 0, this.currentEquipmentTypeItem);
					this.equipmentTypesList = newList;					
				}
			}
		}*/
	},

	/*beforeDestroy() {
		console.log('beforeDestroy')
	}*/

	beforeMount() {
		// this.draggingLocked = !this.enableReorder;

		this.isMobile = document.documentElement.clientWidth < 992;
	}
};
</script>
