<template>
	<div class="edit-form-container">
		<!-- :validate="" -->
		<el-form
			class="item-edit-form relative section-row half-width"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="custom-form-item el-form-item" v-if="itemId">
				<div class="el-form-item__label">{{ tt('Controller') }} id</div>
				<div
					class="value-instead-input el-form-item__content bold"
					v-text="itemId"
				></div>
			</div>

			<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item
				:label="tt('Company')"
				prop="company_id"
				v-if="!hideCompanies && isIndustrialMatrix"
			>
				<SimpleSpinner :active="companiesLoading" />
				<el-select
					:disabled="!companiesList.length"
					v-model="formData.company_id"
					:placeholder="`${tt('Select')} ${tt('company')}`"
				>
					<el-option
						v-for="item in companiesList"
						:key="'company_id-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id" v-if="!hidePlants">
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
			</el-form-item>

			<el-form-item :label="tt('time_zone')" prop="time_zone">
				<el-select
					v-model="formData.time_zone"
					:placeholder="`${tt('select')} ${tt('time_zone')}`"
				>
					<el-option
						v-for="item in timeZonesList"
						:key="'utc_id-' + item.id"
						:label="item.label"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="`${tt('Cofigure')} ${tt('file')}`" prop="configure_file">
				<el-upload
					ref="uploadContainer"
					:on-change="onSelectFile"
					action="#"
					class="upload-container"
					:auto-upload="false"
					accept=".xml"
				>
					<el-button size="small" type="primary">{{
						tt('phrases.click_to_upload')
					}}</el-button>
					<!-- list-type="picture" -->
					<!-- :file-list="fileList" -->
					<!-- <div class="remove-button-container">
								<el-button
									class="action-button"
									size="mini"
									type="danger"
									icon="icomoon icon-cross"
									@click="handleDeleteFile({ uid: file.uid, id: file.id })"
								/>
							</div> -->
				</el-upload>

				<FormOperationsButtons
					v-if="!fromModal"
					@onCancel="handleCancel"
					@onSave="validateForm"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { SCOPES } from '@/constants/global';
import { timeZonesList } from '@/constants/date_time';

import { required } from '@/constants/validation';
import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],
	components: {
		ElUpload: () =>
			import(/* webpackChunkName: "ElUpload" */ 'element-ui/lib/upload')
	},
	props: {
		hideCompanies: Boolean,
		hidePlants: Boolean,

		new_item_type: Number
	},

	data() {
		return {
			itemId: null,
			companyPlantsList: [],
			collectedData: [],

			companiesLoading: false,
			companiesList: [],
			plantsLoading: false,
			plantsList: [],

			formData: {
				type: null,
				name: '',
				plant_id: null,
				company_id: null,
				// range_sensor_notify_minutes: 5,
				time_zone: 0,
				configure_file: null
			}
		};
	},

	computed: {
		...mapState({
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix
		}),

		SCOPES: () => SCOPES,

		timeZonesList: () => timeZonesList,

		requestsToDoList: () => [
			{
				action: 'fetch_companies',
				localProp: 'companiesList',
				localLoadProp: 'companiesLoading'
			},
			{
				action: 'fetch_plants',
				bindTo: [{ prop: 'formData.company_id', param: 'companyId' }],
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}
		],

		rules: () => ({
			name: required,
			// company_id: required,
			plant_id: required
		})
	},

	methods: {
		...mapActions({
			fetch_companies: 'companies/fetch_companies',
			fetch_plants: 'plants/fetch_plants'
		}),

		// -------------
		onSelectFile({ raw }) {
			// console.log(file)
			this.formData.configure_file = raw;
		},

		// -----------

		localPrepareSubmitData(data) {
			if (!data.configure_file) {
				delete data.configure_file;
			}
			return data;
		}
	}
};
</script>
