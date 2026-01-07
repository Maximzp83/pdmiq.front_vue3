<template>
	<div class="edit-form-container company-form">
		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<CustomTransition :startingElementIdx="startingElementIdx">
				<div
					v-show="!hideMainTab && activeTab.prop == 'mainTab'"
					class="tab-container"
					key="tab-0"
				>
					<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
					<div :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
						<el-form-item :label="`${tt('company')} ${tt('name')}`" prop="name">
							<CustomInput v-model="formData.name" :placeholder="tt('name')" />
						</el-form-item>

						<el-form-item :label="tt('Address')" prop="address">
							<CustomInput v-model="formData.address" :placeholder="tt('address')" />
						</el-form-item>

						<el-form-item :label="tt('Phone')" prop="phone_number">
							<CustomInput
								v-model="formData.phone_number"
								:placeholder="tt('phone')"
							/>
						</el-form-item>

						<el-form-item :label="tt('Comments')" prop="comments">
							<CustomInput
								type="textarea"
								v-model="formData.comments"
								:placeholder="tt('comments')"
							/>
						</el-form-item>

						<el-form-item
							v-if="$hasAccessTo(['archive_companies'])"
							:label="tt('Archive')"
							prop="is_archived"
						>
							<el-switch
								v-model="formData.is_archived"
								:active-value="1"
								:inactive-value="0"
							/>
						</el-form-item>
					</div>
				</div>

				<div
					v-show="activeTab.prop == 'menuTab'"
					class="tab-container menu-tab"
					key="tab-1"
				>
					<div class="mrow flex wrap">
						<div
							class="mcol-xs-12 mcol-sm-4"
							v-for="category in menuCategories"
							:key="`category-${category.category_label}`"
						>
							<div class="category-name capitalize">{{ category.name }}</div>

							<div class="menu-list">
								<div
									:class="['menu-item']"
									v-for="(item, idx) in formData.menu_items"
									:key="`idx-${idx}_menu-${item.id}`"
									v-show="item.category_name == category.category_label"
								>
									<el-checkbox
										class="capitalize"
										v-if="item.category_name == category.category_label"
										v-model="item.on"
										>{{ item.label }}</el-checkbox
									>
								</div>

								<!-- <MenuItem
									v-for="item in preparedMenuItems[category]"
									:key="`menu-${item.id}`"
									:itemData="item"
								/> -->
							</div>
						</div>
						<!-- <div class="mcol-xs-12 mcol-md-4">
							<el-form-item prop="menu_items">
								<el-checkbox 
									v-for="item in formData.menu_items"
									:key="`menu-${item.id}`"
									v-model="item.on">{{item.label}}</el-checkbox>
							</el-form-item>
						</div> -->
					</div>
				</div>

				<div
					v-show="activeTab.prop == 'SSOTab'"
					class="tab-container width"
					key="tab-2"
				>
					<div class="section-row">
						<div class="content-row article-title">
							<b>{{ tt('phrases.Add_IndustrialMatrix_to_Azure_AD') }}</b>
						</div>

						<div class="content-row flex">
							<div class="step-number bold span-block">
								<span>1</span>
							</div>
							<div
								class="span-block"
								v-html="
									`${tt(
										'phrases.Open_your_Azure_AD_administrator_account_and'
									)} <b>${tt('phrases.create_a_new_non_gallery_app')}.</b>`
								"
							></div>
						</div>

						<div class="content-row flex">
							<div class="step-number bold span-block">
								<span>2</span>
							</div>
							<div class="span-block">
								{{ tt('Enable') }} <b>{{ tt('SAML') }}</b>
								{{ tt('phrases.for_the_new_application') }}.
							</div>
						</div>

						<div class="content-row flex">
							<div class="step-number bold span-block">
								<span>3</span>
							</div>
							<div class="span-block">
								In the <b>{{ tt('phrases.Basic_SAML_Configuration') }}</b>
								{{ tt('phrases.section_enter_the_following_information') }}:
							</div>
						</div>

						<div class="content-row">
							<ul class="disc">
								<li>
									<b>{{ tt('phrases.identifier_object_id') }}</b>
									<span class="value-field bold">
										<SimpleSpinner :active="hostLoading" />
										<span>{{ IdentifierURL }}</span>
									</span>
									<i
										class="icomoon icon-copy"
										@click="copyToClipboard(IdentifierURL)"
									></i>
								</li>
								<li>
									<b>{{ tt('phrases.reply_url_claims_service_url') }}</b>
									<span class="value-field bold">
										<SimpleSpinner :active="hostLoading" />
										<span>{{ loginURL }}</span>
									</span>
									<i class="icomoon icon-copy" @click="copyToClipboard(loginURL)"></i>
								</li>
							</ul>
						</div>
					</div>

					<div
						class="section-row"
						:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
					>
						<div class="content-row article-title">
							<b>{{
								tt('phrases.paste_parameters_from_azure_and_click_button_save')
							}}</b>
						</div>
						<!-- <el-form-item label="SSO Company ID" prop="saml2_idp_host">
							<div class="flex mrow align-center">
								<div class="mcol-xs-8">
									<CustomInput v-model="formData.saml2_idp_host" placeholder="host"/>	
								</div>

								<div class="mcol-xs-4">
									<SimpleSpinner :active="hostLoading" />
									<el-button
										@click="generateHost"
										type="primary"
										native-type="button"
									>Generate</el-button>								
								</div>
							</div>
						</el-form-item> -->

						<el-form-item
							class="content-row"
							:label="tt('phrases.azure_ad_identifier')"
							prop="saml2_idp_entity_id"
						>
							<CustomInput
								v-model="formData.saml2_idp_entity_id"
								:placeholder="`${tt('entity')} ${tt('id')}`"
							/>
						</el-form-item>

						<el-form-item :label="`${tt('Login')} URL`" prop="saml2_idp_sso_url">
							<CustomInput
								v-model="formData.saml2_idp_sso_url"
								placeholder="sso url"
							/>
						</el-form-item>

						<el-form-item :label="`${tt('Logout')} URL`" prop="saml2_idp_sl_url">
							<CustomInput
								v-model="formData.saml2_idp_sl_url"
								placeholder="sl url"
							/>
						</el-form-item>

						<el-form-item
							:label="`${tt('Certificate')} (Base64)`"
							prop="saml2_idp_base64_certificate"
						>
							<!-- enableLinkToFile -->
							<!-- showDeleteButton -->
							<FileUploadBlock
								uploadBlockType="files-list"
								hidePreview
								deleteFileId
								ref="FileUploadBlock"
								keepFilePath
								filePropName="saml2_idp_base64_certificate"
								accept=".cer"
								:buttonText="tt('phrases.upload_file')"
								:pictures="itemCertificateFile"
							/>
						</el-form-item>
					</div>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				:className="activeTab.prop == 'menuTab' ? 'no-left-margin' : ''"
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>

		<!-- <div v-if="init_plant_modal">
			<el-dialog center title="New Plant" :append-to-body="true" :visible.sync="plantDialogVisible" :class="'small'">
				<div class="">
					<PlantsItemForm
						ref="PlantsItemForm"
						@submit="handlePlantSubmitForm"
						:itemData="{ company_id: itemId }"
						:hideCompanies="true"
						:fromAnotherInstance="true"
					/>
				</div>
		
				<span slot="footer" class="dialog-footer">
					<el-button type="primary" :loading="plantSaving" @click="handleSaveSubItem('PlantsItemForm')"
						>Save
					</el-button>
					<el-button @click="plantDialogVisible = false">Cancel</el-button>
				</span>
			</el-dialog>
		</div> -->
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import axios from '@/services/api/axiosService';

import { findItemBy } from '@/helpers';
import { required /*number*/ } from '@/constants/validation';
import { menuItems } from '@/constants/menuItems';
import { copyToClipboard } from '@/helpers/specialHelpers';

import { itemFormMixin, subItemsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), subItemsListMixin()],
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue')
		// PlantsItemForm: () => import('../Plants/ItemForm.vue')
	},

	props: {
		activeTab: {
			type: Object,
			required: true
		},
		tabsList: {
			type: Array,
			required: true
		},
		hideMainTab: Boolean
	},

	data() {
		return {
			hostLoading: false,

			loginURL: '',
			IdentifierURL: '',
			// plantsList: [],
			// plantSaving: false,

			formData: {
				id: null,
				name: '',
				address: '',
				phone_number: '',
				comments: '',

				saml2_idp_host: '',
				saml2_idp_entity_id: '',
				saml2_idp_sso_url: '',
				saml2_idp_sl_url: '',
				saml2_idp_base64_certificate: undefined,
				menu_items: [],

				is_archived: false
				// plants_ids: []
			}

			// init_plant_modal: false,
			// plantDialogVisible: false
		};
	},

	computed: {
		rules: () => ({
			name: required,
			address: required,
			phone_number: required
		}),
		instanceName: () => 'Companies',
		copyToClipboard: () => copyToClipboard,
		// includedMenuItems: () => menuItems().filter(mi =>	mi.id),

		includedMenuItems() {
			let result = [];

			menuItems().forEach(mi => {
				if (mi.enableInCompanyMenuForm) {
					result.push(mi);
				} else if (mi.children) {
					mi.children.forEach(child => {
						if (child.id && mi.enableInCompanyMenuForm) {
							result.push({ ...child, belongs_to_label: mi.belongs_to_label });
						}
					});
				}
			});
			return result;
		},

		menuCategories: that =>
			that.$translate(menuItems().filter(mi => mi.category_label)),

		/*preparedMenuItems() {
			const categories = menuItems.filter(mi => mi.category_label);
			// const included_items = menuItems.filter(mi => mi.id);
			let result = {};
			const { formData } = this;

			categories.forEach(cat => {
				let cat_items = this.includedMenuItems.filter(mi => 
					mi.belongs_to_label == cat.category_label
				);
				result[cat.name] = cat_items.map(ci => {
					return {
						id: ci.id,
						on: formData,
						label: ci.name
					}
				})
			})

			return Object.freeze(result);
		},*/

		subItemsSettings: () => Object.freeze([
			{ ref: 'FileUploadBlock' },
		]),

		itemCertificateFile() {
			const { itemData } = this;
			if (itemData && itemData.saml2_idp_base64_certificate) {
				return [
					{ full_file_name: itemData && itemData.saml2_idp_base64_certificate }
				];
			}

			return [];
		}
	},

	methods: {
		...mapActions({
			save_item: 'companies/save_company',
			generate_idp_host: 'companies/generate_idp_host'
			// fetch_plants: 'plants/fetch_plants',
			// save_plant: 'plants/save_plant'
		}),

		/*onBeforeEnter(e) {
			// console.log('onBeforeEnter', e)
			e.classList.add('display-none');
			e.classList.add('fade-in');
			setTimeout(function() {
				// console.log('onEnter', e)
				e.classList.remove('display-none');
			}, 250);
		},
		onEnter(e, done) {
			setTimeout(function() {
				e.classList.remove('fade-in');
				done();
			}, 250);
		},
		onLeave(e, done) {
			// console.log('onLeave', e)
			e.classList.add('fade-out');

			setTimeout(function() {
				e.classList.remove('fade-out');
				done();
			}, 250);
		},*/

		generateHost() {
			this.hostLoading = true;
			this.generate_idp_host()
				.then(({ value }) => {
					if (value) {
						// this.formData.saml2_idp_host = `${axios.defaults.baseURL}/saml2/${value.id}/metadata`;
						this.formData.saml2_idp_host = value.id;
						this.IdentifierURL = `${axios.defaults.baseURL}/saml2/${value.id}/metadata`;
						this.loginURL = `${axios.defaults.baseURL}/saml2/${value.id}/acs`;
					}
					this.hostLoading = false;
				})
				.catch(() => {
					this.hostLoading = false;
				});
		},

		/*copyToBuffer(string) {
			if (string) {
				var input = document.createElement('textarea');
				input.id = 'toBuffer';
				input.value = string;
				input.setAttribute('readonly', '');
				input.style.position = 'absolute';
				input.style.left = '-9999px';
				input.style.opacity = '0';
				input.style.zIndex = -1000;
				document.body.appendChild(input);
				input.focus();
				input.select();
				// console.log(document.getSelection())
				document.execCommand('copy');
				document.body.removeChild(input);
				this.$message({
					type: 'info',
					message: 'copied to buffer'
				});
			}
		},*/

		localSetupPage(item) {
			// console.log(axios.defaults.baseURL)
			if (this.activeTab.prop == 'SSOTab' && !this.formData.saml2_idp_host) {
				this.generateHost();
			} else {
				this.IdentifierURL = `${axios.defaults.baseURL}/saml2/${this.formData.saml2_idp_host}/metadata`;
				this.loginURL = `${axios.defaults.baseURL}/saml2/${this.formData.saml2_idp_host}/acs`;
			}

			this.formData.menu_items = this.$translate(
				this.includedMenuItems.map(mi => ({
					id: mi.id,
					label: mi.name,
					category_name: mi.belongs_to_label,
					on: false
				}))
			);

			if (item) {
				if (item.menu_items) {
					this.formData.menu_items.forEach(mi => {
						const menuItemInCompany = findItemBy('id', mi.id, item.menu_items);

						if (menuItemInCompany) {
							mi.on = menuItemInCompany.on;
						}
					});
				}
			}
		},

		localPrepareSubmitData(formData) {
			formData.menu_items = formData.menu_items.map(mi => ({
				id: mi.id,
				on: mi.on
			}));
			return formData;
		}

		/*handlePlantSubmitForm(formData) {
			const options = {
				action: 'save_plant',
				refreshAction: 'fetch_plants',
				mod_array: 'plants_ids',
				dialog: 'plantDialogVisible'
			};

			this.handleSubmitSubItemForm(formData, options);
		}*/
	},

	watch: {
		activeTab(tab) {
			if (tab.prop == 'SSOTab' && !this.formData.saml2_idp_host) {
				this.generateHost();
			}
		}
	},

	beforeMount() {
		const { prop } = this.activeTab;
		if (prop == 'SSOTab') {
			this.startingElementIdx = 2;
		} else if (prop == 'menuTab') {
			this.startingElementIdx = 1;
		} else {
			this.startingElementIdx = 0;
		}
	}
};
</script>
