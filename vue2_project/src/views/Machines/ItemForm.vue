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
			<el-form-item
				required
				:label="`${tt('Machine')} ${tt('name')}`"
				prop="name"
				class="half-width"
			>
				<CustomInput
					v-model="formData.name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Production_Line')} / ${tt('Utility')} ${tt('name')}`"
				prop="production_line_id"
				class="half-width"
			>
				<CustomSelect
					filterable
					:optionsLoading="productionLinesLoading"
					:optionsList="productionLinesList"
					:placeholder="tt('select')"
					:setupLabelMethod="getProdlineLabel"
					useHtml
					v-model="formData.production_line_id"
					@change="formData.location_ids = []"
				/>
			</el-form-item>

			<el-form-item :label="tt('Locations')" prop="location_ids" class="half-width">
				<CustomSelect
					filterable
					multiple
					:optionsLoading="locationsLoading"
					:optionsList="locationsList"
					:placeholder="`${tt('Select')} ${tt('locations')}`"
					v-model="formData.location_ids"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Application')"
				prop="application_id"
				class="half-width"
			>
				<div class="flex">
					<div class="relative mcol-xs-10 fluid span-block">
						<CustomSelect
							filterable
							:optionsLoading="applicationsLoading"
							:optionsList="applicationsList"
							:placeholder="`${tt('Select')} ${tt('application')}`"
							v-model="formData.application_id"
						/>
					</div>

					<el-button
						v-if="!fromAnotherInstance"
						@click="createApplication"
						:class="'create-button span-block'"
						size="mini"
						type="danger"
						icon="icomoon icon-plus"
					/>
				</div>
			</el-form-item>

			<el-form-item
				:label="`${tt('Brand')} ${tt('name')}`"
				prop="brand_name"
				class="half-width"
			>
				<CustomInput
					v-model="formData.brand_name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Part')} ${tt('Number')}`"
				prop="part_number"
				class="half-width"
			>
				<CustomInput
					v-model="formData.part_number"
					:placeholder="tt('part_number')"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Downtime')} ${tt('Cost')}`"
				prop="downtime_cost"
				class="half-width"
			>
				<el-input v-model.number="formData.downtime_cost" />
			</el-form-item>

			<el-form-item
				:label="tt('phrases.installed_at')"
				prop="installed_at"
				class="half-width"
			>
				<Datepicker
					v-model="formData.installed_at"
					:placeholder="`${tt('Select')} ${tt('date')}`"
				/>
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
							<!-- @ready="blockReady" -->
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

			<el-form-item
				:label="`${tt('Machine')} ${tt('image')}`"
				prop="pictures"
				class="upload-form-item"
			>
					<!-- formPropName="pictures" -->
				<FileUploadBlock
					ref="FileUploadBlock"
					multiple
					rotate
					:pictures="itemPictures"
				/>
					<!-- @ready="blockReady" -->
				<!-- :replace-selected-file="true" -->
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
					:optionsLoading="machinesLoading"
					:optionsList="filteredMachinesList"
					:placeholder="
						`${tt('select')} ${tt('machine')} ${tt('phrases.whose_order_you_want')}`
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
import { findItemBy, cleanDateString } from '@/helpers';
import { required } from '@/constants/validation';
import { productionLineTypesList } from '@/constants/global';

import {
	itemFormMixin,
	requestsListMixin,
	multiformMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		multiformMixin(),
		subItemsListMixin(),
	],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		CharacterItem: () => import('./CharacterItem.vue'),
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),		
		AttachmentItem: () => import('../ProductionLines/AttachmentItem.vue')
	},

	data() {
		return {
			applicationsLoading: false,
			applicationsList: [],
			productionLinesLoading: false,
			productionLinesList: [],
			locationsList: [],
			locationsLoading: false,
			machinesList: [],
			machinesLoading: false,

			librariesItemsList: [],
			charactersItemsList: [],

			desiredId: null,

			formData: {
				name: '',
				application_id: null,
				production_line_id: null,
				location_ids: [],
				pictures: [],
				plant_id: null,

				brand_name: '',
				part_number: '',
				installed_at: '',
				characters: [],
				downtime_cost: 0,
				libraries: [],

				linespeed_sensor_id: null,
				is_silence_mode: 0,
				silence_mode_until: '',
			}
		};
	},

	computed: {
		rules: () => ({
			name: required,
			application_id: required
			// production_line_id: required
			// application_id: required
		}),

		pickerOptions: () =>
			Object.freeze({
				disabledDate(date) {
					const start = new Date();
					const today = start.getTime() - 3600000 * 24;
					const dateMs = date.getTime();

					return dateMs < today;
				}
			}),

		subItemsSettings: () => Object.freeze([
			{ ref: 'CharacterItem', targetProp: 'characters' },			
			{ ref: 'FileUploadBlock', targetProp: 'pictures' },
			{ ref: 'AttachmentItem', targetProp: 'libraries' },			
		]),

		itemPictures() {
			const { itemData } = this;
			if (itemData && itemData.pictures) {
				return itemData.pictures;
			}
			return [];
		},

		globalFilters() {
			return this.$store.state.global.globalFilters;
		},

		instanceName: () => 'Machines',

		requestsToDoList() {
			let list = [
				{
					action: 'fetch_production_lines',
					payload: {
						params: {
							max: -1,
							plantId: this.showPlant?.id ||  this.globalFilters.plantId
						}
					},
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_locations',
					bindTo: [
						{
							prop: 'formData.production_line_id',
							param: 'productionLineId',
							clean_prop: 'formData.location_ids'
						},
						{
							prop: 'globalFilters.plantId',
							param: 'plantId',
							clean_prop: 'formData.location_ids'
						}
					],
					localProp: 'locationsList',
					localLoadProp: 'locationsLoading'
				},
				{
					action: 'fetch_applications',
					payload: {
						params: {
							max: -1,
							plantId: this.showPlant?.id ||  this.globalFilters.plantId
						}
					},
					localProp: 'applicationsList',
					localLoadProp: 'applicationsLoading'
				},
				{
					action: 'fetch_machines',
					payload: {
						params: {
							max: -1,
							plantId: this.showPlant?.id ||  this.globalFilters.plantId
						}
					},
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				}
			];

			return Object.freeze(list);
		},

		/*uploadSettings: () => ({
			fileProp: 'pictures',
			multiple: true
		}),*/

		uploadSettings: () =>
			Object.freeze([
				{ fileProp: 'pictures', multiple: true },
				{ fileProp: 'libraries', multiple: true }
			]),

		filteredMachinesList() {
			if (this.itemData && this.machinesList.length) {
				return this.machinesList.filter(pl => pl.id !== this.itemData.id);
			}
			return [];
		}

		/*selectedProductionLine() {
			const { formData, productionLinesList } = this;

			if (formData.production_line_id && productionLinesList.length) {
				return findItemBy('id', formData.production_line_id, productionLinesList);
			}
			return null;
		},*/

		/*filteredLocationsList() {
			if (this.selectedProductionLine) {
				return this.selectedProductionLine.locations || [];
			}

			return [];
		}*/
	},

	watch: {
		'formData.production_line_id'(id) {
			if (!this.isInitialSetup) {
				this.setMultiFormFilters({ productionLineId: id });
			}
		}
	},

	methods: {
		...mapActions({
			fetch_applications: 'applications/fetch_applications',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_locations: 'plants/fetch_locations',
			fetch_machines: 'machines/fetch_machines',

			reorder_machine: 'machines/reorder_machine',
			save_item: 'machines/save_machine'
		}),

		getProdlineLabel(option) {
			const type = findItemBy('id', option.type, productionLineTypesList);
			return Object.freeze({
				label: option.name,
				html: `<div class="flex">
								<span>${option.name}</span>
								<span class="ml-auto gray-color">${type.name}</span>
							</div>`
			});
		},

		localSetupPage(item) {
			if (item) {
				this.charactersItemsList = this.setupFormSubItemsList(
					item.characters,
					'c_i'
				);
				this.librariesItemsList = this.setupFormSubItemsList(item.libraries, 'a_i');
			}

			this.setupByParentInstance(
				this.instancesItemsData,
				'productionLine',
				'production_line_id'
			);
		},

		localPrepareSubmitData(data) {
			if (!data.plant_id) {
				data.plant_id =  this.showPlant?.id || this.globalFilters.plantId;
			}

			if (data.installed_at) {
				data.installed_at = cleanDateString(data.installed_at, { withoutTime: 1 });
			}

			if (!data.is_silence_mode) {
				data.silence_mode_until = null;
			}

			if (data.silence_mode_until) {
				data.silence_mode_until = cleanDateString(data.silence_mode_until, { withoutTime: 1 });
			}

			return data;
		},

		createApplication() {
			let modalSettings = {
				editModalProp: 'editModalSecond',
				show: true,
				instanceName: 'Applications',
				instanceData: {
					plant_id: this.globalFilters.plantId
				},
				settings: {
					fromAnotherInstance: true,
					disablePlant: true
				},
				title: 'Create Application',
				callback: this.applicationCreated
				// closeCallback: this.applicationFormClose,
			};

			this.show_edit_modal(modalSettings);
		},

		applicationCreated({ data }) {
			this.startFetchAction(this.requestsToDoList[2]);

			if (data && data.data) {
				this.formData.application_id = data.data.id;
				/*this.set_global_state({ 
					stateProp: 'editModal.instanceData.application_id',
					value: data.data.id
				});	*/
			}
			this.show_edit_modal({ show: false, editModalProp: 'editModalSecond' });
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
				this.reorder_machine(payload);
			}
		}
	}

	/*created() {
		console.log('created')
	}*/
};
</script>
