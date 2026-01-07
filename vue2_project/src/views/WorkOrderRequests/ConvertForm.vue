<template>
	<div
		class="edit-form-container maintenance-form"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<el-form
			:class="['item-edit-form relative section-row bolded-labels']"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="{}"
			label-position="top"
		>
			<div :class="['el-form-item flex mrow wrap', { showJustInfo: showJustInfo }]">
				<div class="mcol-xs-12 mcol-sm-6">
					<div class="el-form-item">
						<div class="mrow flex bottom">
							<el-form-item
								:label="tt('Due_Date')"
								prop="finish_date"
								class="mcol-xs-6"
								required
							>
								<Datepicker
									v-model="formData.finish_date"
									:placeholder="`${tt('Select')} ${tt('date')}`"
									className=" "
								/>
							</el-form-item>
						</div>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item :label="tt('Status')" prop="status" required>
						<CustomSelect
							:optionsList="workOrdersStatusesList"
							:placeholder="`${tt('select')} ${tt('status')}`"
							v-model="formData.status"
						/>
					</el-form-item>
				</div>
			</div>

			<!-- <FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/> -->
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { workOrdersStatusesList } from '@/constants/global';

import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		// new_item_type: Number,
		// plantId: Number,
	},
	data() {
		return {
			formData: {
				id: null,
				finish_date: '',
				status: null
			}
		};
	},

	computed: {
		workOrdersStatusesList: () => Object.freeze(workOrdersStatusesList()),

		showJustInfo: that => that.settings && that.settings.showJustInfo
	},

	methods: {
		...mapActions({
			// convert_item: 'maintenance/convert_maintenance_request',
			save_item: 'maintenance/convert_maintenance_request',
			reject_item: 'maintenance/reject_maintenance_request'
		}),

		preparePayload(payload) {
			return {
				...payload,
				itemId: this.itemData.id
			};
		}
	}
};
</script>
