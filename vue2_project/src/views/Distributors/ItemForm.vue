<template>
	<div
		class="edit-form-container"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form locations-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item
				:label="`${tt('Distributor')} ${tt('name')}`"
				prop="company_name"
			>
				<el-input v-model="formData.company_name" />
			</el-form-item>

			<el-form-item :label="tt('Type')" prop="scope">
				<el-select
					v-model="formData.scope"
					:placeholder="`${tt('Select')} ${tt('scope')}`"
				>
					<el-option
						v-for="item in scopesList"
						:key="'scope-' + item.id"
						:label="item.label"
						:value="item.id"
						:disabled="
							item.id == SCOPES.ASSET_MATRIX || item.id == SCOPES.DRIVE_MATRIX
						"
					/>
				</el-select>
			</el-form-item>

			<div :label="tt('Locations')" prop="locations" class="el-form-item">
				<div class="title article-title">{{ tt('Locations') }}:</div>
				<div class="options-container locations-container">
					<div v-if="locationsItemsList.length" class="content-row">
						<LocationItem
							ref="LocationItem"
							v-for="(item, idx) in locationsItemsList"
							:key="`location_item-${item.id}`"
							:plantsList="plantsList"
							:plantsLoading="plantsLoading"
							:item-data="item"
							:item-index="idx"
							:distributor="itemData"
							@onRemove="id => removeFormItem(id, 'locationsItemsList')"
							:isMobile="isMobile"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button inverted small with-text"
							size="mini"
							type="primary"
							@click="addFormItem('locationsItemsList', 'l_i-')"
						>
							<!-- icon="icomoon icon-cross" -->
							<span>{{ `${tt('Add')} ${tt('Location')}` }}</span>
							<i class="icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
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
	requestsListMixin,
	subItemsListMixin
} from '@/mixins';

import { SCOPES, scopesList } from '@/constants/global';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin()
	],
	components: {
		LocationItem: () => import('./LocationItem.vue')
	},

	data() {
		return {
			collectedData: [],
			locationsItemsList: [],

			plantsList: [],
			plantsLoading: false,

			formData: {
				company_name: '',
				scope: null,
				locations: []
			}
		};
	},

	computed: {
		SCOPES: () => SCOPES,
		scopesList: () => scopesList,

		subItemsSettings: () => Object.freeze([
			{ ref: 'LocationItem', targetProp: 'locations' },
		]),

		rules: () => ({
			company_name: required,
			scope: required
		}),

		requestsToDoList: () => Object.freeze([
			{
				action: 'fetch_plants',
				// bindTo: { prop: 'formData.companies_ids', param: 'companies_ids' },
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}
		])
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			set_plants: 'plants/set_plants'
		}),

		localSetupPage(itemData) {
			if (itemData) {
				this.locationsItemsList = this.setupFormSubItemsList(
					itemData.locations,
					'l_i'
				);
			}
		}
	}
};
</script>
