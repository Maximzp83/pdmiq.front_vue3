<template>
	<div
		:class="[
			'edit-form-container maintenance-form',
			{ 'work-order-details-item card content-row': !fromModal }
		]"
	>
		<SimpleSpinner :active="processing" />

		<div class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
		</div>

		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<div :class="['card-content', { 'flex top': !fromModal }]">
			<div class="header-block flex align-center" v-if="!fromModal">
				<div class="step-number bold span-block">
					<span>{{ progress }}</span>
				</div>
			</div>

			<el-form
				:class="[
					'item-edit-form relative section-row',
					{ 'half-width': !fromModal }
				]"
				label-width="150px"
				ref="itemForm"
				:model="formData"
				:rules="rules"
				:label-position="isMobile || !fromModal ? 'top' : 'left'"
			>
				<el-form-item :label="tt('fab_plant')" prop="fabrication_plant_id">
					<CustomSelect
						filterable
						:optionsLoading="plantsLoading"
						:optionsList="plantsList"
						:placeholder="`${tt('Select')} ${tt('plant')}`"
						v-model="formData.fabrication_plant_id"
					/>
				</el-form-item>

				<el-form-item :label="tt('Category')" prop="category">
					<CustomSelect
						:optionsList="requisitionCategoriesList"
						:placeholder="`${tt('Select')} ${tt('category')}`"
						v-model="formData.category"
					/>
				</el-form-item>

				<el-form-item
					:label="tt('Work_Type')"
					prop="work_type"
					class="radio-inputs-inline"
				>
					<!-- @onChange="id => (formData.work_type = id)" -->
					<RadioButtonsBlock
						v-model="formData.work_type"
						:settings="workTypeRadioOptions"
						:optionsList="requisitionWorkTypesList"
					/>
					<!-- :value="formData.work_type" -->
				</el-form-item>

				<el-form-item
					prop="equipment_details"
					:label="`${tt('Equipment')} ${tt('Description')}`"
				>
					<el-input type="textarea" v-model="formData.equipment_details" rows="5" />
				</el-form-item>

				<el-form-item prop="requisition_details" :label="tt('Details')">
					<el-input
						type="textarea"
						v-model="formData.requisition_details"
						rows="5"
					/>
				</el-form-item>

				<el-form-item
					:label="tt('phrases.See_Visit_Required')"
					prop="site_visit"
					class="content-row"
				>
					<CustomSelect
						:optionsList="siteVisitOptionsList"
						:placeholder="`${tt('select')} ${tt('phrases.site_visit')}`"
						v-model="formData.site_visit"
					/>
				</el-form-item>

				<!-- <el-form-item class="" label="Date Created" prop="start_date"
					v-if="isOrder"
				>
					<div class="mcol-xs-6">
						<el-date-picker
							v-model="formData.start_date"
							:value-format="'yyyy-MM-dd'"
							type="date"
							:placeholder="`${tt('Select')} ${tt('date')}`"
						/>
					</div>				
				</el-form-item> -->

				<div class="content-row flex">
					<el-form-item
						:label="tt('Due_Date')"
						prop="complete_at"
						:class="['mcol-xs-7 inline-form-item', { 'inline-label': fromModal }]"
					>
						<Datepicker
							v-model="formData.complete_at"
							:placeholder="`${tt('Select')} ${tt('date')}`"
							:picker-options="pickerOptions"
						/>
					</el-form-item>

					<el-form-item
						:label="tt('Budget')"
						prop="proposed_cost"
						:class="['mcol-xs-5 inline-form-item', { 'inline-label': fromModal }]"
					>
						<CustomInput
							v-model="formData.proposed_cost"
							:placeholder="`${tt('input')} ${tt('cost')}`"
						/>
					</el-form-item>
				</div>

				<el-form-item
					:label="`${tt('Attachments')}:`"
					prop="attachments"
					class="content-row 1mcol-xs-8"
				>
					<FileUploadBlock
						ref="AttachmentsUploadBlock"
						uploadBlockType="files-list"
						multiple
						enableLinkToFile
						showDeleteButton
						:accept="' '"
						:buttonText="tt('phrases.upload_files')"
						:pictures="attachmentsList"
					/>
				</el-form-item>

				<div :class="[{ 'dialog-decorate-footer ': fromModal }, 'no-left-margin']">
					<FormOperationsButtons
						@onCancel="deleteRequisition"
						@onSave="validateForm"
					/>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script>
import { mapActions /*mapState*/ } from 'vuex';

import {
	PLANT_WORK_ORDER_TYPES,
	requisitionCategoriesList,
	requisitionWorkTypesList,
	siteVisitOptionsList
} from '@/constants/global';
// import { getTimeDifference } from '@/helpers';

import { required } from '@/constants/validation';
import {
	itemFormMixin,
	requestsListMixin,
	onSelectFileMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		onSelectFileMixin(),
		subItemsListMixin()
	],
	components: {
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		// FormulasRow: () => import('./FormulasRow.vue'),
		// ImgUploadBlock: () => import('@/components/form/ImgUploadBlock.vue')
	},
	props: {
		progress: Number,
		title: String
		// maintenanceType: Number
	},
	data() {
		return {
			plantsList: [],
			plantsLoading: false,

			processing: false,

			attachmentsList: [],

			formData: {
				fabrication_plant_id: null,
				requisition_details: '',
				complete_at: '',
				attachments: [],

				category: null,
				work_type: null,
				equipment_details: '',
				site_visit: null,
				proposed_cost: ''
			},

			rules: {
				fabrication_plant_id: required,
				requisition_details: required,
				complete_at: required,
				category: required,
				work_type: required,
				equipment_details: required,
				site_visit: required,
				proposed_cost: required
			}
		};
	},

	computed: {
		/*	...mapState({
			authUser: state => state.auth.authUser,
		}),*/
		subItemsSettings: () => Object.freeze([
			{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments' },
		]),

		requestsToDoList: that =>
			Object.freeze([
				{
					action: 'fetch_plants',
					payload: {
						params: {
							workOrderRole: PLANT_WORK_ORDER_TYPES.FABRICATION,
							companyId: that.authUser.company_id
						}
					},
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				}
			]),

		/*fabPlantsList: that =>
			that.plantsList.filter(
				pi => pi.work_order_role === PLANT_WORK_ORDER_TYPES.FABRICATION
			),*/

		pickerOptions: () =>
			Object.freeze({
				disabledDate(date) {
					const start = new Date();
					const today = start.getTime() - 3600000 * 24;
					const dateMs = date.getTime();

					return dateMs < today;
				}
			}),

		requisitionCategoriesList: () => Object.freeze(requisitionCategoriesList()),
		requisitionWorkTypesList: () => Object.freeze(requisitionWorkTypesList()),
		siteVisitOptionsList: () => siteVisitOptionsList,

		workTypeRadioOptions: () =>
			Object.freeze({
				className: 'radio-input',
				// group: true
				inline: true,
				isRadio: true
			})
	},

	methods: {
		...mapActions({
			save_item: 'plant_requisitions/save_requisition',
			fetch_plants: 'plants/fetch_plants'
		}),

		deleteRequisition() {
			// this.changeRoute({ path: '/requisitions' });
			if (this.itemData) {
				this.$emit('event', 'handleDeleteRequisition', this.itemData.id);
			} else {
				this.$emit('event', 'closeDialog');
			}
		},

		downloadFile(dataurl, filename) {
			/*fetch(dataurl)
			.then(response => response.blob())
			.then(blob => {
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.download = filename;
			      // link.click();
			      console.log(link)

			    })
			.catch(console.error);*/
			const link = document.createElement('a');
			link.href = 'data:png/image;base64,' + dataurl;
			link.download = filename;
			link.target = '_blank';
			link.click();

			// document.body.removeChild(link);
		},

		localSetupPage(item) {
			if (item) {
				if (item.newOrderAttachments && item.newOrderAttachments.length) {
					this.attachmentsList = item.newOrderAttachments.map(ai=>ai);
				}
			}
		},

		localSubmit(data) {
			let payload = {
				// itemId: this.itemData.id,
				data: data
				// method: 'PUT'
			};

			// delete payload.data.id;

			if (payload.data.attachments && payload.data.attachments.length) {
				payload.withFile = payload.data.attachments.some(ai => !!ai.file);
			}

			/*if (payload) {
				console.log(3, payload)
				return
			}*/
			this.processing = true;

			this.save_item(payload)
				.then(() => {
					// this.handleCancel();
					this.processing = false;
					this.$emit('event', 'successModalSubmit');
				})
				.catch(() => {
					this.processing = false;
				});
		}
	},

	watch: {}
};
</script>
