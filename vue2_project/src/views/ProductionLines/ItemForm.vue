<template>
	<div
		class="edit-form-container"
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
			<el-form-item :label="tt('Name')" prop="name" required>
				<CustomInput
					v-model="formData.name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Downtime')} ${tt('Cost')}`" prop="downtime_cost">
				<el-input v-model.number="formData.downtime_cost" />
			</el-form-item>

			<!-- <el-form-item :label="tt('plant')" prop="plant_id">
				<SimpleSpinner :active="plantsLoading" />
				<el-select
					:disabled="!plantsList.length"
					v-model="formData.plant_id"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				>
					<el-option
						v-for="item in plantsList"
						:key="'plant_id-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item> -->

			<!-- <el-form-item label="Locations old" prop="location_ids">
				<SimpleSpinner :active="locationsLoading" />
				<el-select
					multiple
					:disabled="!locationsList.length"
					v-model="formData.location_ids"
					:placeholder="`${tt('Select')} ${tt('locations')}`"
				>
					<el-option
						v-for="item in locationsList"
						:key="'loc_id-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item> -->

			<el-form-item :label="tt('Locations')" prop="location_ids">
				<CustomSelect
					filterable
					multiple
					className="multiple-select"
					:optionsLoading="locationsLoading"
					:optionsList="locationsList"
					:placeholder="`${tt('Select')} ${tt('locations')}`"
					v-model="formData.location_ids"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Custom')} ${tt('Fields')}`" prop="characters">
				<div class="options-container">
					<div v-if="charactersItemsList.length" class="content-row">
						<CharacterItem
							ref="CharacterItem"
							v-for="(item, idx) in charactersItemsList"
							:key="`character_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="id => removeFormItem(id, 'charactersItemsList')"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="mini"
							type="success"
							icon="icomoon icon-cross"
							@click="addFormItem('charactersItemsList', 'c_i-')"
						/>
					</div>
				</div>
			</el-form-item>

			<el-form-item :label="tt('image')" prop="file_name" class="upload-form-item">
				<FileUploadBlock
					ref="FileUploadBlock"
					rotate
					deleteFileId
					showDeleteButton
					:pictures="itemPictures"
				/>
			</el-form-item>

			<!-- <el-form-item :label="`${tt('Overlay')} ${tt('Linespeed')}`">
				<el-checkbox
					v-model="enable_linespeed_overlay"
					:disabled="!itemId"
					:true-label="1"
					:false-label="0"
				/>
			</el-form-item> -->

			<!-- <el-form-item
				v-if="enable_linespeed_overlay"
				prop="linespeed_sensor_id"
				class="half-width"
			>
				<CustomSelect
					filterable
					:optionsLoading="sensorsLoading"
					:optionsList="sensorsList"
					:placeholder="`${tt('select')} ${tt('sensor')}`"
					v-model="formData.linespeed_sensor_id"
					:setupLabelSettings="sensorLabelOptions"
				/>
			</el-form-item> -->

			<el-form-item
				prop="rpm_source_type"
				class="half-width"
				label="RPM"
			>
				<CustomSelect
					:optionsList="rpmSourcesTypesList"
					:placeholder="`${tt('select')} RPM ${tt('source')}`"
					v-model="formData.rpm_source_type"
				/>
					<!-- :setupLabelSettings="sensorLabelOptions" -->
			</el-form-item>

			<el-form-item 
				:label="`${tt('constants.Manual')} RPM`"
				class="mcol-xs-12 mcol-sm-8"
				prop="rpm_value"
				v-if="formData.rpm_source_type === RPM_SOURCES_TYPES.MANUAL"
			>
				<el-input v-model.number="formData.rpm_value" />
			</el-form-item>

			<el-form-item
				v-else-if="formData.rpm_source_type === RPM_SOURCES_TYPES.EXTERNAL_INPUT"
				prop="rpm_node_id"
				class="half-width"
				:label="`${tt('constants.external_input_rpm')}`"
			>
				<!-- <CustomSelect
					:optionsList="bannerV2GenericParametersList"
					:placeholder="`${tt('select')} ${tt('exteranal')}`"
					v-model="externalRpmItem"
				/> -->

				<SimpleSpinner :active="bannerV2GenericParametersLoading" />
				<el-select
					:disabled="!bannerV2GenericParametersList.length"
					v-model="formData.rpm_node_id"
					:placeholder="`${tt('select')} ${tt('exteranal')}`"
				>
					<el-option
						v-for="item in bannerV2GenericParametersList"
						:key="'param_id-' + item.sensor_id"
						:label="item.sensor.location_in_equipment"
						:value="item.sensor_id"
					/>
				</el-select>
					<!-- :setupLabelSettings="sensorLabelOptions" -->
			</el-form-item>

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

			<el-form-item
				:label="tt('phrases.Silence_Mode')"
				prop="is_silence_mode"
			>
				<el-switch
					v-model="formData.is_silence_mode"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="silence_mode_until"
				:label="tt('phrases.Silence_Mode_Until')"
				v-if="formData.is_silence_mode"
			>
				<Datepicker
					v-model="formData.silence_mode_until"
					:placeholder="tt('phrases.Select_date')"
					className=" "
					:pickerOptions="pickerOptions"
				/>
			</el-form-item>

			<el-form-item :label="tt('Order')" v-if="itemData && itemData.id">
				<CustomSelect
					filterable
					:optionsLoading="productionLinesLoading"
					:optionsList="filteredProductionLinesList"
					:placeholder="
						`${tt('select')} ${tt('production_line')} ${tt(
							'phrases.whose_order_you_want'
						)}`
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
import { required } from '@/constants/validation';
import { PRODUCTION_LINES_TYPES, rpmSourcesTypesList, RPM_SOURCES_TYPES } from '@/constants/global';
import { findItemBy, cleanDateString } from '@/helpers';

import {
	itemFormMixin,
	requestsListMixin,
	multiformMixin,
	eventHandler,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		multiformMixin(),
		eventHandler(),
		subItemsListMixin()
	],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		CharacterItem: () => import('../Machines/CharacterItem.vue'),
		AttachmentItem: () => import('./AttachmentItem.vue')
	},

	props: {
		editModal: Object
	},

	data() {
		return {
			// plantsList: [],
			// plantsLoading: false,
			locationsList: [],
			locationsLoading: false,
			productionLinesList: [],
			productionLinesLoading: false,
			sensorsList: [],
			sensorsLoading: false,

			librariesItemsList: [],
			charactersItemsList: [],

			bannerV2GenericParametersList: [],
			bannerV2GenericParametersLoading: false,
			externalRpmItem: null,

			desiredId: null,
			// enable_linespeed_overlay: false,

			formData: {
				name: '',
				type: null,
				plant_id: null,
				location_ids: [],
				file: null,
				img_rotate: 0,
				characters: [],
				downtime_cost: 0,
				libraries: [],
				// linespeed_sensor_id: null,

				rpm_source_type: null,
				rpm_value: null,
				rpm_node_id: null,
				rpm_node_parameter: null,
				is_silence_mode: 0,
				silence_mode_until: ''
			}
		};
	},

	computed: {
		/*editModal() {
			return this.$store.state.global.editModal;
		},*/
		subItemsSettings: () => Object.freeze([
			{ ref: 'CharacterItem', targetProp: 'characters' },
			{ ref: 'AttachmentItem', targetProp: 'libraries' },
			{ ref: 'FileUploadBlock', setIfEmpty: { prop:'delete_file', val: 1 }, cleanIfEmpty: { prop:'file', val: null } },
		]),

		pickerOptions: () =>
			Object.freeze({
				disabledDate(date) {
					const start = new Date();
					const today = start.getTime() - 3600000 * 24;
					const dateMs = date.getTime();

					return dateMs < today;
				}
			}),

		new_item_type: that =>
			that.editModal.instanceName == 'Utilities'
				? PRODUCTION_LINES_TYPES.UTILITY
				: PRODUCTION_LINES_TYPES.PRODUCTION_LINE,

		instanceName: () => 'ProductionLines',

		rpmSourcesTypesList: () => Object.freeze(rpmSourcesTypesList()),
		RPM_SOURCES_TYPES: () => Object.freeze(RPM_SOURCES_TYPES),

		sensorLabelOptions: () =>
			Object.freeze({
				accessors: [
					'equipment.asset.machine.productionLine.name',
					'equipment.asset.machine.name',
					'location_in_equipment'
				],
				/*useGetItemValue: [
					{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }
				],*/
				delimeter: ','
			}),

		itemPictures() {
			const { itemData } = this;
			if (itemData && itemData.full_file_name) {
				return [{ full_file_name: itemData && itemData.full_file_name }];
			}

			return [];
		},

		rules: () => ({
			name: required,
			plant_id: required
		}),

		filteredProductionLinesList() {
			if (this.itemData && this.productionLinesList.length) {
				return this.productionLinesList.filter(pl => pl.id !== this.itemData.id);
			}
			return [];
		},

		requestsToDoList() {
			return Object.freeze([
				{
					action: 'fetch_locations',
					bindTo: [
						{
							prop: 'formData.plant_id',
							param: 'plantId',
							clean_prop: 'formData.location_ids'
						}
					],
					localProp: 'locationsList',
					localLoadProp: 'locationsLoading'
				},
				{
					action: 'fetch_production_lines',
					payload: {
						params: {
							max: -1,
							plantId:
								this.globalFilters.plantId || (this.showPlant && this.showPlant.id)
						}
					},
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_production_line_rpm_nodes',
					localProp: 'bannerV2GenericParametersList',
					localLoadProp: 'bannerV2GenericParametersLoading',
					payload: { params: { max: -1 } }
				}
			]);
		},

		uploadSettings: () =>
			Object.freeze([
				{ fileProp: 'file' },
				{ fileProp: 'libraries', multiple: true }
			]),

		selectedExternalRpmItem() {
			const { bannerV2GenericParametersList, formData } = this;
			if (bannerV2GenericParametersList.length && formData.rpm_node_id) {
				return findItemBy('sensor_id', formData.rpm_node_id, bannerV2GenericParametersList);
			}
			return null;
		},
	},

	methods: {
		...mapActions({
			// fetch_plants: 'plants/fetch_plants',
			fetch_locations: 'plants/fetch_locations',
			save_item: 'production_lines/save_production_line',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			reorder_production_line: 'production_lines/reorder_production_line',
			fetch_production_line_rpm_nodes: 'production_lines/fetch_production_line_rpm_nodes',

			fetch_sensors: 'sensors/fetch_sensors'
		}),

		/*fetchBannerV2GenericParameters() {
			this.doFetchAction('fetch_production_line_rpm_nodes', 'bannerV2GenericParametersList', 'bannerV2GenericParametersLoading', {
				params: { max: -1 }
			});
		},*/

		fetchLineSpeedSensors() {
			const plantId = this.globalFilters ? this.globalFilters.plantId : null;
			this.doFetchAction('fetch_sensors', 'sensorsList', 'sensorsLoading', {
				params: { max: -1, plantId, linespeedNode: true }
			});
		},

		localSetupPage(item) {
			if (item) {
				this.charactersItemsList = this.setupFormSubItemsList(
					item.characters,
					'c_i'
				);
				this.librariesItemsList = this.setupFormSubItemsList(item.libraries, 'a_i');

				/*if (item.linespeed_sensor_id) {
					this.enable_linespeed_overlay = true;
				}*/
			} else {
				this.formData.plant_id = this.showPlant
					? this.showPlant.id
					: this.globalFilters.plantId;
			}
		},

		localPrepareSubmitData(data) {
			/*if (!this.enable_linespeed_overlay) {
				delete data.linespeed_sensor_id;
			}*/

			if (!data.is_silence_mode) {
				data.silence_mode_until = null;
			}

			if (data.silence_mode_until) {
				data.silence_mode_until = cleanDateString(data.silence_mode_until, { withoutTime: 1 });
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
				this.reorder_production_line(payload);
			}
		}
	},

	watch: {
		enable_linespeed_overlay(enable) {
			if (enable && !this.sensorsList.length) {
				this.fetchLineSpeedSensors();
			}
		},

		'selectedExternalRpmItem'(item) {
			// this.formData.rpm_external_node_id = item ? item.sensor_id : null;
			this.formData.rpm_node_parameter = item ? item.node_parameter : null;
		}

		/*'formData.rpm_source_type'(type) {
			if (type === RPM_SOURCES_TYPES.EXTERNAL_INPUT && !this.bannerV2GenericParametersList.length) {
				this.fetchBannerV2GenericParameters();
			}
		},*/

		/*externalRpmItem(item) {
			this.formData.rpm_node_id = item ? item.sensor_id : null;
			this.formData.rpm_node_parameter = item ? item.node_parameter : null;
		}*/


		/*'formData.plant_id'(id) {
			this.setMultiFormFilters({plantId: id});
		},*/
	}
};
</script>
