<template>
	<div class="request-tab-container specifications-block-wrapper">
		<div class="mrow flex wrap big-padding">
			<div class="block-item images-block mcol-xs-12 mcol-sm-6 mcol-xlg-4">
				<div class="card">
					<div class="card-header">
						<div class="title semi-bold uppercase">{{ tt('IMAGE') }}</div>
					</div>
					<div class="card-content">
						<div class="imgWrapper">
							<img
								:src="getPictureUrlByType(EQUIPMENT_IMG_TYPES.EQUIPMENT)"
								alt="img error"
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="info-block mcol-xs-12 mcol-sm-6 mcol-xlg-3">
				<div class="mrow flex big-padding">
					<div class="block-item specifications-block">
						<div class="card">
							<div class="card-header">
								<div class="title semi-bold uppercase">
									{{ tt('SPECIFICATIONS') }}
								</div>
							</div>
							<div class="card-content">
								<ul class="info-list main">
									<li v-for="item in specificationsList" :key="`spec-${item.label}`">
										<span class="label" v-text="`${item.label}:`"></span>
										<span class="value" v-text="item.value"></span>
									</li>
								</ul>
							</div>
						</div>
					</div>

					<div class="block-item">
						<CrossoverBlock
							:crossoverList="crossoverList['mainType']"
							:crossoverLoading="crossoverLoading"
							:equipmentData="equipmentData"
							:equipmentTypeName="equipmentData.equipment_type_name"
						/>
					</div>

					<div class="block-item">
						<CrossoverBlock
							v-if="equipmentSubType"
							:crossoverList="crossoverList['subType']"
							:crossoverLoading="crossoverLoading"
							:equipmentData="equipmentData"
							:equipmentTypeName="equipmentSubType.name"
						/>
					</div>
				</div>
			</div>

			<div
				class="request-block mcol-xs-12 mcol-xlg-5"
				v-if="$hasAccessTo(['create_dashboard'])"
			>
				<div class="mrow flex wrap big-padding">
					<div class="block-item mcol-xs-12 mcol-sm-5 mcol-xlg-12">
						<div class="card">
							<div class="card-header">
								<div class="title semi-bold uppercase">
									{{ tt('phrases.ONE_CLICK_REQUEST') }}
								</div>
							</div>
							<div class="card-content relative">
								<VueElementLoading
									:active="itemSaving"
									spinner="ring"
									:text="` ${tt('saving')}...`"
									:background-color="'rgba(255, 255, 255, .85)'"
								/>

								<el-button
									@click="validateForm('one-click')"
									type="primary"
									native-type="button"
									class="item-action-button"
								>
									<span class="uppercase">{{
										tt('phrases.ONE_CLICK_REQUEST')
									}}</span>
								</el-button>
							</div>
						</div>
					</div>

					<div class="block-item mcol-xs-12 mcol-sm-7 mcol-xlg-12">
						<div class="card">
							<div class="card-header">
								<div class="title semi-bold uppercase">{{ requestTypeName }}</div>
							</div>

							<div class="card-content relative">
								<VueElementLoading
									:active="itemSaving"
									spinner="ring"
									:text="` ${tt('saving')}...`"
									:background-color="'rgba(255, 255, 255, .85)'"
								/>
								<!-- label-width="100px" -->
								<el-form
									:class="['item-edit-form']"
									ref="itemForm"
									:model="formData"
									:rules="rules"
									:label-position="'left'"
								>
									<el-form-item prop="vendor_ids" :label="tt('Vendors')">
										<div class="flex mrow">
											<div class="mcol-xs-10 relative">
												<SimpleSpinner :active="vendorsLoading" />
												<el-select
													multiple
													:disabled="!vendorsList.length"
													v-model="formData.vendor_ids"
													:placeholder="`${tt('Select')} ${tt('vendors')}`"
												>
													<el-option
														v-for="item in vendorsList"
														:key="'vendor_ids-' + item.id"
														:label="item.name"
														:value="item.id"
													/>
												</el-select>
											</div>
											<div
												class="mcol-xs-2"
												v-if="$hasAccessTo(['create_dashboard'])"
											>
												<el-button
													:class="'create-button'"
													@click="createVendor"
													size="mini"
													type="success"
													icon="icomoon icon-plus"
												/>
											</div>
										</div>
									</el-form-item>

									<el-form-item>
										<el-button
											@click="validateForm"
											type="primary"
											native-type="button"
											class="item-action-button"
										>
											<span class="uppercase">{{ tt('SUBMIT') }}</span>
										</el-button>
									</el-form-item>
								</el-form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { requestsListMixin } from '@/mixins';
import { findItemBy, prepareSubmitData /*getValues*/ } from '@/helpers';
// import { required /*number*/ } from '@/constants/validation';

import { EQUIPMENT_IMG_TYPES, rfqsTypesList, RFQS_TYPES } from '@/constants/global';

export default {
	mixins: [requestsListMixin()],
	// name: 'QuoteTab',
	components: {
		CrossoverBlock: () => import('./CrossoverBlock.vue')
		// EquipmentInfoBlock: () => import('./EquipmentInfoBlock.vue'),
	},

	props: {
		equipmentData: {
			type: Object,
			required: true
		},
		crossoverList: Object,
		crossoverLoading: Boolean
	},

	data() {
		return {
			sub_modal_init: false,

			vendorsLoading: false,
			vendorsList: [],

			itemSaving: false,

			formData: {
				// type: null,
				equipment_id: null,
				is_one_click: false,

				vendor_ids: []
			}
		};
	},

	computed: {
		equipmentSubType: that => Object.freeze(that.equipmentData.equipmentSubType),

		EQUIPMENT_IMG_TYPES: () => EQUIPMENT_IMG_TYPES,

		rules: () => ({
			// vendor_ids: required,
		}),

		specificationsItemsList: () => [
			{ label: 'Brand', prop: 'brand_name' },
			{ label: 'Part_number', prop: 'brand_model_name' },
			{ label: 'Location', prop: 'location_name' },
			{ label: 'Specs', prop: '' }
		],

		specificationsList() {
			const { equipmentData } = this;
			let list = this.specificationsItemsList.map(si => {
				const value = equipmentData[si.prop];
				if (value !== undefined) {
					return { label: si.label, value: value };
				}
				return false;
			});

			return this.$translate(list.filter(li => !!li));
		},

		request_type() {
			return this.$route.meta.request_type;
		},

		requestTypeName() {
			const item = findItemBy('id', this.request_type, rfqsTypesList());
			return item.id === RFQS_TYPES.FOR_BUY ? this.$t('QUOTE') : this.$t('SERVICE');
		},

		requestsToDoList: that => [
			{
				action: 'fetch_vendors',
				payload: { params: { plantId: that.equipmentData.plant_id } },
				localProp: 'vendorsList',
				localLoadProp: 'vendorsLoading'
			}
		]
	},

	methods: {
		...mapActions({
			fetch_vendors: 'plants_vendors/fetch_plants_vendors',
			show_edit_modal: 'show_edit_modal',
			save_rfq: 'rfqs/save_rfq'
		}),

		getPictureUrlByType(type) {
			if (this.equipmentData && this.equipmentData.pictures) {
				const pic = findItemBy('type', type, this.equipmentData.pictures);
				if (pic) {
					// return pic.full_file_name;
					return pic.full_thumb_file_name;
				}
				return '';
			}
		},

		fetchVendors() {
			// const payload = { params: { max: -1, plantId: this.equipmentData.plant_id } };

			this.operateRequestsList(this.requestsToDoList);

			this.show_edit_modal({ show: false });
		},

		createVendor() {
			const payload = {
				show: true,
				instanceName: 'PlantsVendors',
				itemName: 'Vendor',
				instanceData: null,
				callback: this.fetchVendors

				// ...this.additionalModalSettings
			};

			this.show_edit_modal(payload);
		},

		validateForm(method) {
			const ref = 'itemForm';
			this.$refs[ref].validate(valid => {
				// console.log(valid)
				if (valid) {
					if (method && method == 'one-click') {
						this.submitForm(method);
					} else if (this.formData.vendor_ids.length) {
						this.submitForm(method);
					} else {
						this.$notify({
							type: 'warning',
							title: '',
							message: this.$t(`phrases.there_are_no_vendors_for_request_selected`)
						});
						return false;
					}
				} else {
					this.$notify({
						type: 'warning',
						title: this.$t('phrases.form_isnt_ready'),
						message: this.$t(`phrases.Please_check_fields_errors_first`)
					});
					return false;
				}
			});
		},

		submitForm(method) {
			this.itemSaving = true;

			let data = {
				id: null,
				...this['formData'],
				type: this.request_type,
				equipment_id: this.equipmentData.id,
				is_one_click: method == 'one-click'
			};

			let payload = {
				data: { ...prepareSubmitData(data) },
				resultMessage: { text: this.$t('phrases.Quote_send') }
			};

			/*console.log(payload)
			if (payload) {
				return
			}*/

			this.save_rfq(payload)
				.then(() => {
					this.itemSaving = false;
					this.$emit('event', {
						eventName: 'rfqSuccess'
					});
				})
				.catch(() => {
					this.itemSaving = false;
				});
		}
	}
};
</script>
