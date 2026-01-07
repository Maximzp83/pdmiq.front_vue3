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

			<el-form-item
				:label="`${tt('Parent')} ${tt('Item_type')}`"
				prop="parent_id"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal,
					'showJustInfo': newOptionsOnly
				}"
			>
				<CustomSelect
					clearable
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="filteredEquipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.parent_id"
				/>
			</el-form-item>

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
				<el-form-item :label="`${tt('Type')} ${tt('media')}`" prop="type_medias">
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
				<el-form-item :label="`${tt('Drive')} ${tt('Type')}`" prop="drives">
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
		TabsBar: () => import('@/components/common/TabsBar.vue'),

		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),

	},

	data() {
		return {
			equipmentTypesLoading: false,
			equipmentTypesList: [],
			typesItemsList: [],
			typesMediaList: [],
			drivesList: [],
			typesCategoriesList: [],
			typesCategoriesLoading: false,

			formData: {
				name: '',
				// file: null,
				img_rotate: 0,
				type_options: [],
				type_medias: [],
				drives: [],
				without_brand: 0,
				parent_id: null
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
					{ title: 'Drive_Type', prop: 'drivesTab' }
				])
			),

		uploadSettings: () => ({
			fileProp: 'file'
			// multiple: true
		}),

		filteredEquipmentTypesList: that =>
			that.itemData
				? that.equipmentTypesList.filter(it => it.id != that.itemData.id)
				: that.equipmentTypesList,

		requestsToDoList: () => [
			{
				action: 'fetch_equipment_types_categories',
				localProp: 'typesCategoriesList',
				localLoadProp: 'typesCategoriesLoading'
			},
			{
				action: 'fetch_equipment_types',
				localProp: 'equipmentTypesList',
				localLoadProp: 'equipmentTypesLoading'
			}
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
