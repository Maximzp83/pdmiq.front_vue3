<template>
	<el-form
		ref="itemForm"
		:class="['relative']"
		:model="formData"
		:rules="rules"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<!-- <el-form-item class="content-row" prop="app_section" required>
			<CustomSelect
				filterable
				:optionsList="menuSectionsList"
				:placeholder="`${tt('Select')} ${tt('section')}`"
				v-model="formData.app_section"
			/>
		</el-form-item> -->

		<!-- <div class="content-row"> -->
		<div class="flex mrow align-center">
			<div class="el-form-item mcol-xs-12 mcol-sm-3 capitalize">
				{{ itemData.name }}
			</div>

			<el-form-item class="mcol-xs-12 mcol-sm-1" prop="is_viewing">
				<el-switch
					@change="handleIsView"
					v-model="formData.is_viewing"
					:active-value="1"
					:inactive-value="0"
				/>
				<!-- <el-checkbox v-model="formData.is_viewing">{{ tt('viewing') }}</el-checkbox> -->
			</el-form-item>

			<el-form-item
				v-if="formData.is_viewing && !isAPI"
				class="mcol-xs-12 mcol-sm-2"
				prop="is_creating"
			>
				<el-checkbox
					v-model="formData.is_creating"
					:true-label="1"
					:false-label="0"
					>{{ tt('creating') }}</el-checkbox
				>
			</el-form-item>

			<el-form-item
				v-if="formData.is_viewing && !isAPI"
				class="mcol-xs-12 mcol-sm-2"
				prop="is_updating"
			>
				<el-checkbox
					v-model="formData.is_updating"
					:true-label="1"
					:false-label="0"
					>{{ tt('updating') }}</el-checkbox
				>
			</el-form-item>

			<el-form-item
				v-if="formData.is_viewing && !isAPI"
				class="mcol-xs-12 mcol-sm-2"
				prop="is_deleting"
			>
				<el-checkbox
					v-model="formData.is_deleting"
					:true-label="1"
					:false-label="0"
					>{{ tt('deleting') }}</el-checkbox
				>
			</el-form-item>

			<!-- <el-form-item v-if="formData.is_viewing" class="mcol-xs-12 mcol-sm-2" prop="is_converting_maintenance_request">
				<el-checkbox
					v-model="formData.is_converting_maintenance_request"
					:true-label="1"
					:false-label="0"
				>{{ tt('phrases.converting_maintenance_request') }}</el-checkbox>
			</el-form-item> -->

			<el-form-item 
				v-if="formData.is_viewing && (isCompany || isPlant)"
				class="mcol-xs-12 mcol-sm-2" prop="is_archiving"
			>
				<el-checkbox
					v-model="formData.is_archiving"
					:true-label="1"
					:false-label="0"
				>{{ tt('archiving') }}</el-checkbox>
			</el-form-item>

			<!-- <el-form-item v-if="formData.is_viewing" class="mcol-xs-12 mcol-sm-2" prop="is_converting_maintenance_request">
				<el-checkbox
					v-model="formData.is_converting_maintenance_request"
					:true-label="1"
					:false-label="0"
				>{{ tt('phrases.converting_maintenance_request') }}</el-checkbox>
			</el-form-item> -->
		</div>
		<!-- </div> -->

		<!-- <div class="action-buttons-container absolute align-top">		
			<el-button
				:class="['action-button']"
				@click="removeItem"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
			/>
		</div> -->
	</el-form>
</template>

<script>
import { MENU_TYPES } from '@/constants/menuItems';
// import { required } from '@/constants/validation';

import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		isMobile: Boolean
		// selectedSections: Array
	},

	data() {
		return {
			// disableEdit: false,

			formData: {
				app_section: null,
				is_viewing: false,
				is_creating: false,
				is_updating: false,
				is_deleting: false,
				is_archiving: false
				// is_converting_maintenance_request: false
			}
		};
	},

	computed: {
		rules: () => ({
			// work_order: required,
			// report: required
		}),
		// MENU_TYPES: () => MENU_TYPES,
		isCompany: that => that.formData.app_section === MENU_TYPES.COMPANIES,
		isPlant: that => that.formData.app_section === MENU_TYPES.PLANTS,
		isAPI: that => that.formData.app_section === MENU_TYPES.CLIENT_API,
		// menuSectionsList: that => menuSectionsList().filter(si => !that.selectedSections.includes(si.id)),
	},

	methods: {
		handleIsView(val) {
			if (!val) {
				this.formData.is_creating = false;
				this.formData.is_updating = false;
				this.formData.is_deleting = false;
				this.formData.is_archiving = false;
			}
		}
	}

	/*watch: {
		'formData.app_section'() {
			this.$emit('updateSelectedSections');
		}
	}*/
};
</script>
