<template>
	<div class="edit-form-container equipment-types">
		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<el-form
			class="item-edit-form "
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="'top'"
		>
			<el-form-item
				:label="`${tt('Item_type')} ${tt('name')}`"
				prop="name"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					'showJustInfo': newOptionsOnly
				}"
			>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<!-- <el-form-item
				:label="`${tt('Childs')} ${tt('Item_type')}`"
				prop="child_ids"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					'showJustInfo': newOptionsOnly
				}"
			>
				<CustomSelect
					clearable
					filterable
					multiple
					:optionsLoading="equipmentTypesLoading"
					:optionsList="filteredEquipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.child_ids"
				/>
			</el-form-item> -->

			<el-form-item
				prop="without_brand"
				class=""
				:label="tt('phrases.without_brand')"
			>
				<!-- <label class="small-lh">Without Brand</label> -->
				<el-switch
					v-model="formData.without_brand"
					:active-value="1"
					:inactive-value="0"
				/>
				<!-- <el-checkbox v-model="formData.is_in_dashboard_view" /> -->
			</el-form-item>

			<el-form-item :label="`${tt('Default')} ${tt('Brand')}`" prop="default_brand_id"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					'showJustInfo': newOptionsOnly
				}"
			>
				<!-- :loadmoreIsActive="assetsLoadmoreIsActive" -->
				<FetchByQuerySelect
					clearable
					enableLoadmore
					v-model="formData.default_brand_id"
					:optionsLoading.sync="brandsLoading"
					:optionsList.sync="brandsList"
					:settings="brandQueryOptions"
					:placeholder="`${tt('select')} ${tt('brand')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Default')} ${tt('part_number')}`" prop="default_brand_model_id"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					'showJustInfo': newOptionsOnly
				}"
			>
				<!-- :loadmoreIsActive="assetsLoadmoreIsActive" -->
				<FetchByQuerySelect
					clearable
					enableLoadmore
					v-model="formData.default_brand_model_id"
					:optionsLoading.sync="brandModelsLoading"
					:optionsList.sync="brandModelsList"
					:settings="brandModelsQueryOptions"
					:placeholder="`${tt('select')} ${tt('part_number')}`"
				/>
			</el-form-item>
			
			<el-form-item prop="child_components">
				<div class="semi-bold article-title uppercase">
					{{ tt('Components') }}:
				</div>
				<div class="options-container  wrapperBlock">
					<div
						v-if="childComponentsList.length"
						:class="['content-row', { fluid: fromModal }]"
					>
						<ComponentItem
							v-show="newOptionsOnly ? item.new : true"
							ref="ComponentItem"
							v-for="(item, idx) in childComponentsList"
							:key="`ci-${item.id}`"
							:item-data="item"
							:item-index="idx"
							:showLabelsIndex="showLabelsIndex"
							:equipmentTypesList="filteredEquipmentTypesList"
							:equipmentTypesLoading="equipmentTypesLoading"
							@onRemove="id => removeFormItem(id, 'childComponentsList')"
						/>
					</div>

					<div class="margin-top-row button-row">
						<el-button
							class="action-button create-button small with-text"
							size="mini"
							type="success"
							@click="addFormItem('childComponentsList', 'c_i-')"
						>
							<span class="capitalize">{{
								`${tt('add')} ${tt('component')}`
							}}</span>
							<i class="suffix-icon icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>

			<el-form-item
				:label="`${tt('Type')} ${tt('image')}`"
				prop="file_name"
				class="section-row upload-form-item"
			>
				<FileUploadBlock
					ref="FileUploadBlock"
					rotate
					deleteFileId
					:pictures="itemPictures"
					class="equipment-types-upload-block"
				/>
			</el-form-item>

			<div class="section-row content-row underline-tabs full-width">
				<TabsBar
					@switchTab="switchTab"
					:activeTab="activeTab"
					:tabsList="tabsList"
					:buttonsType="'primary'"
					buttonsClass="text-center"
				/>
			</div>

			<div
				v-show="activeTab.prop == 'optionsTab'"
				key="optionsTab"
				class="content-row tab-container"
			>
				<el-form-item prop="type_options">
					<div class="semi-bold article-title uppercase">
						{{ tt('TYPE_OPTIONS') }}
					</div>
					<div class="options-container flex wrap">
						<div
							v-if="typesItemsList.length"
							:class="['content-row', { fluid: fromModal }]"
						>
							<TypeOptionItem
								v-show="newOptionsOnly ? item.new : true"
								ref="TypeOptionItem"
								v-for="(item, idx) in typesItemsList"
								:key="`types_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:fromModal="fromModal"
								:showLabelsIndex="showLabelsIndex"
								@onRemove="id => removeFormItem(id, 'typesItemsList')"
								:typesCategoriesList="typesCategoriesList"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="mini"
								type="success"
								@click="addFormItem('typesItemsList', 'to_i-')"
							>
								<span class="capitalize">{{ `${tt('add')} ${tt('option')}` }}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>

			<div
				v-show="activeTab.prop == 'mediaTab'"
				key="mediaTab"
				class="content-row tab-container"
			>
				<el-form-item prop="type_medias">
					<div class="semi-bold article-title uppercase">
						{{ `${tt('Type')} ${tt('media')}` }}
					</div>
					<div class="options-container wrapperBlock">
						<div
							v-if="typesMediaList.length"
							:class="['content-row', { fluid: fromModal }]"
						>
							<TypeMediaItem
								v-show="newOptionsOnly ? item.new : true"
								ref="TypeMediaItem"
								v-for="(item, idx) in typesMediaList"
								:key="`types_media-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:showLabelsIndex="showLabelsIndex"
								@onRemove="id => removeFormItem(id, 'typesMediaList')"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="mini"
								type="success"
								@click="addFormItem('typesMediaList', 'tm_i-')"
							>
								<span class="capitalize">{{ `${tt('add')} ${tt('Media')}` }}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>

			<div
				v-show="activeTab.prop == 'drivesTab'"
				key="drivesTab"
				class="content-row tab-container"
			>
				<el-form-item prop="drives">
					<div class="semi-bold article-title uppercase">
						{{ `${tt('Drive')} ${tt('Type')}` }}
					</div>
					<div class="options-container  wrapperBlock">
						<div
							v-if="drivesList.length"
							:class="['content-row', { fluid: fromModal }]"
						>
							<DriveItem
								v-show="newOptionsOnly ? item.new : true"
								ref="DriveItem"
								v-for="(item, idx) in drivesList"
								:key="`drive-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:showLabelsIndex="showLabelsIndex"
								@onRemove="id => removeFormItem(id, 'drivesList')"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="mini"
								type="success"
								@click="addFormItem('drivesList', 'd_i-')"
							>
								<span class="capitalize">{{
									`${tt('add')} ${tt('Drive_Type')}`
								}}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>

			<div
				v-show="activeTab.prop == 'analysisTab'"
				key="analysisTab"
				class="content-row tab-container"
			>
				<VibrationAnalysisItemsBlock
					ref="VibrationAnalysisItemsBlock"
					v-if="itemId"
					:equipmentTypeId="itemId"
				/>
				<!-- <el-form-item prop="vibration_analysis">
					<div class="semi-bold article-title uppercase">
						{{ `${tt('Analysis')} ${tt('Item')}` }}
					</div>
					<div class="options-container  wrapperBlock">
						<div
							v-if="vibrationAnalysisList.length"
							:class="['content-row', { fluid: fromModal }]"
						>
							<AnalysisItem
								v-show="newOptionsOnly ? item.new : true"
								ref="AnalysisItem"
								v-for="(item, idx) in vibrationAnalysisList"
								:key="`va-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:showLabelsIndex="showLabelsIndex"
								@onRemove="id => removeFormItem(id, 'vibrationAnalysisList')"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="mini"
								type="success"
								@click="addFormItem('vibrationAnalysisList', 'va_i-')"
							>
								<span class="capitalize">{{
									`${tt('add')} ${tt('Analysis')}`
								}}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item> -->
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
import { required } from '@/constants/validation';
import {
	itemFormMixin,
	subItemsListMixin,
	tabsMixin,
	requestsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		subItemsListMixin(),
		tabsMixin(),
		requestsListMixin()
	],
	components: {
		TypeOptionItem: () => import('./TypeOptionItem.vue'),
		TypeMediaItem: () => import('./TypeMediaItem.vue'),
		DriveItem: () => import('./DriveItem.vue'),
		VibrationAnalysisItemsBlock: () => import('./VibrationAnalysisItemsBlock.vue'),
		// AnalysisItem: () => import('./AnalysisItem.vue'),
		ComponentItem: () => import('./ComponentItem.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue'),

		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue')
	},

	data() {
		return {
			equipmentTypesLoading: false,
			equipmentTypesList: [],
			typesItemsList: [],
			typesMediaList: [],
			drivesList: [],
			
			childComponentsList: [],
			typesCategoriesList: [],
			typesCategoriesLoading: false,
			brandsList: [],
			brandsLoading: false,
			brandModelsList: [],
			brandModelsLoading: false,

			formData: {
				name: '',
				// file: null,
				img_rotate: 0,
				type_options: [],
				type_medias: [],
				drives: [],
				child_components: [],
				// vibration_analysis: [],
				without_brand: 0,
				parent_id: null,

				default_brand_id: null,
				default_brand_model_id: null
			},

			rules: {
				name: required
			}
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'FileUploadBlock' },
			{ ref: 'TypeOptionItem', targetProp: 'type_options' },			
			{ ref: 'TypeMediaItem', targetProp: 'type_medias' },			
			{ ref: 'DriveItem', targetProp: 'drives' },			
			{ ref: 'VibrationAnalysisItemsBlock',
				skipReturnData:1,
				// callMethod: { name: '' }
			},			
			{ ref: 'ComponentItem', targetProp: 'child_components' },			
		]),

		itemPictures() {
			const { itemData } = this;
			if (itemData && itemData.full_file_name) {
				return [{ full_file_name: itemData.full_file_name }];
			}

			return [];
		},

		newOptionsOnly: that => that.settings && that.settings.createNewOptionsOnly,

		showLabelsIndex() {
			if (this.newOptionsOnly) {
				return this.typesItemsList.filter(it => !it.new).length;
			}
			return 0;
		},

		tabsList: that =>
			Object.freeze(
				that.$translate([
					{ title: 'options', prop: 'optionsTab' },
					{ title: 'media', prop: 'mediaTab' },
					{ title: 'Drive_Type', prop: 'drivesTab' },
					{ title: 'Vibration_Analysis', prop: 'analysisTab' }
				])
			),

		uploadSettings: () => ({
			fileProp: 'file'
			// multiple: true
		}),

		brandQueryOptions() {
			return Object.freeze({
				fetchAction: 'brands/fetch_brands',
				params: {
					orderByColumn: 'name',
					orderByMethod: 'asc',
					equipmentTypeId: this.itemData && this.itemData.id,
				}
			});
		},

		brandModelsQueryOptions() {
			return Object.freeze({
				fetchAction: 'brand_models/fetch_brand_models',
				params: {
					equipmentTypeId: this.itemData && this.itemData.id,
					brandId: this.formData.default_brand_id
				}
			});
		},

		filteredEquipmentTypesList: that =>
			that.itemData
				? that.equipmentTypesList.filter(it => it.id != that.itemData.id)
				: that.equipmentTypesList,

		requestsToDoList: that => [
			{
				action: 'fetch_equipment_types_categories',
				localProp: 'typesCategoriesList',
				localLoadProp: 'typesCategoriesLoading'
			},
			{
				action: 'fetch_equipment_types',
				localProp: 'equipmentTypesList',
				localLoadProp: 'equipmentTypesLoading'
			},
			{
				action: 'fetch_brands',
				bindTo: [],
				initialSetup:
					that.itemData && that.itemData.default_brand_id
						? {
								fetchById: {
									action: 'brands/fetch_brand',
									itemId: that.itemData.default_brand_id
								}
						  }
						: null,
				localProp: 'brandsList',
				localLoadProp: 'brandsLoading'
			},
			{
				action: 'fetch_brand_models',
				bindTo: [],
				initialSetup:
					that.itemData && that.itemData.default_brand_model_id
						? {
								fetchById: {
									action: 'brand_models/fetch_brand_model',
									itemId: that.itemData.default_brand_model_id
								}
						  }
						: null,
				localProp: 'brandModelsList',
				localLoadProp: 'brandModelsLoading'
			},
		]
	},

	methods: {
		...mapActions({
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			fetch_equipment_types_categories:
				'equipment_types_categories/fetch_equipment_types_categories',
			save_item: 'equipment_types/save_equipment_type'
		}),

		localSetupPage(item) {
			if (item) {
				this.typesItemsList = this.setupFormSubItemsList(item.type_options, 'to_i');
				this.typesMediaList = this.setupFormSubItemsList(item.type_medias, 'tm_i');
				this.drivesList = this.setupFormSubItemsList(item.drives, 'd_i');
				// this.vibrationAnalysisList = this.setupFormSubItemsList(item.vibration_analysis, 'va_i');
				this.childComponentsList = this.setupFormSubItemsList(item.child_components, 'c_i');

			}
		}

		/*handleMounted() {
			this.count++;
			if (this.count == this.typesItemsList.length) {
				window.testTimeEnd = () => console.timeEnd('load')
				window.testTimeEnd()
			}
		}*/
	}
};
</script>
