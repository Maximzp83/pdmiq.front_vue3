<template>
	<el-form
		ref="itemForm"
		class="option-item-container location-item-container"
		:model="formData"
		:rules="rules"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item prop="plants_ids" :label="tt('Plants')">
			<SimpleSpinner :active="plantsLoading"/>

			<el-select
				multiple
				collapse-tags
				:disabled="!plantsList.length"
				v-model="formData.plants_ids"
				:placeholder="`${tt('Select')} ${tt('plants')}`"
			>
				<el-option
					v-for="item in plantsList"
					:key="'plants_ids-' + item.id"
					:label="item.name"
					:value="item.id"
				/>
			</el-select>
		</el-form-item>

		<el-form-item prop="address" :label="tt('Address')">
			<el-input v-model="formData.address" />
		</el-form-item>

		<el-form-item prop="city" :label="tt('City')">
			<el-input v-model="formData.city" />
		</el-form-item>

		<el-form-item prop="state" :label="tt('State')">
			<el-input v-model="formData.state" />
		</el-form-item>

		<el-form-item prop="country" :label="tt('Country')">
			<el-input v-model="formData.country" />
		</el-form-item>

		<el-form-item label=" ">
			<el-button
				class="action-button create-button inverted with-text"
				size="mini"
				type="primary"
				@click="removeItem"
			>
				<!-- icon="icomoon icon-cross" -->
				<span>{{ `${tt('Remove')} ${tt('Location')}` }}</span>
				<i class="icomoon icon-cross remove-button"></i>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
// import { updateFormData } from '@/helpers';
import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		distributor: {
			type: Object,
			default: () => null
		},

		plantsList: {
			type: Array,
			default: () => []
		},
		plantsLoading: Boolean,
		isMobile: Boolean
	},

	data() {
		return {
			formData: {
				id: null,
				// distributor_id: null,
				plants_ids: null,
				country: '',
				state: '',
				city: '',
				address: ''
			}
		};
	},

	computed: {
		rules: () => ({
			plants_ids: required,
			country: required,
			state: required,
			city: required,
			address: required
			// position: required
		}),
		deleteNewId: () => true
	}
};
</script>
