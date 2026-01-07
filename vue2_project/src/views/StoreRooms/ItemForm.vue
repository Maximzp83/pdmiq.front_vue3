<template>
	<div
		class="edit-form-container "
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
			<el-form-item :label="`${tt('Storeroom')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelect
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
					v-model="formData.plant_id"
				/>
			</el-form-item>

			<el-form-item :label="tt('Locations')" prop="locations">
				<div class="options-container">
					<div v-if="locationsItemsList.length" class="content-row">
						<LocationItem
							ref="LocationItem"
							v-for="(item, idx) in locationsItemsList"
							:key="`location_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="id => removeFormItem(id, 'locationsItemsList')"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="mini"
							type="success"
							icon="icomoon icon-cross"
							@click="addFormItem('locationsItemsList', 'l_i-')"
						/>
					</div>
				</div>
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
// import { updateFormData } from '@/helpers';
import { required } from '@/constants/validation';
import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin
} from '@/mixins';

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
			locationsItemsList: [],

			plantsLoading: false,
			plantsList: [],

			formData: {
				name: '',
				plant_id: null,
				locations: []
			}
		};
	},

	computed: {
		rules: () => ({
			name: required,
			plant_id: required
		}),

		requestsToDoList: () => [
			{
				action: 'fetch_plants',
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}
		],

		subItemsSettings: () => Object.freeze([
			{ ref: 'LocationItem', targetProp: 'locations' }
		]),
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants'
		}),

		localSetupPage(item) {
			if (item) {
				this.locationsItemsList = this.setupFormSubItemsList(item.locations, 'l_i');
			}
		}
	}
};
</script>
