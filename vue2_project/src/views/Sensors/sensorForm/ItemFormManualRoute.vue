<template>
	<div class="edit-form-container">
		<el-form
			:class="['item-edit-form', { 'half-width': !fromModal }]"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Location')" prop="location_in_equipment" required>
				<CustomInput
					v-model="formData.location_in_equipment"
					:placeholder="`${tt('enter')} ${tt('location')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('data_set')" prop="data_set">
				<CustomSelect
					:optionsList="manualRouteDataSetsList"
					:placeholder="`${tt('Select')} ${tt('dataset')}`"
					v-model="formData.data_set"
					:setupLabelMethod="setupDataSetLabel"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { subItemMixin } from '@/mixins';
import { required } from '@/constants/validation';
import { DATASET, SENSOR_TYPES, dataSetsList } from '@/constants/global';

export default {
	mixins: [subItemMixin()],

	props: {
		equipmentData: {
			type: Object,
			default: () => ({})
		},
		isNew: Boolean,
		itemData: {
			type: Object,
			default: () => null
		},
		fromModal: Boolean,
		itemsName: {
			type: Object,
			default: () => ({})
		}
	},

	data() {
		return {
			formData: {
				equipment_id: null,
				location_in_equipment: '',
				data_set: DATASET.MANUAL_ROUTE_FFT
			},
			rules: {
				equipment_id: required,
				location_in_equipment: required,
				data_set: required
			}
		};
	},

	computed: {
		manualRouteDataSetsList: () =>
			Object.freeze(
				dataSetsList().filter(
					item => item.controller_type === SENSOR_TYPES.MANUAL_ROUTE
				)
			)
	},

	methods: {
		...mapActions({
			save_item: 'sensors/save_manual_route_sensor'
		}),

		setupDataSetLabel(item) {
			return `${item.label} ${item.alt_label ? '(' + item.alt_label + ')' : ''}`;
		},

		localSetupPageActions() {
			this.formData.equipment_id = this.equipmentData.id;
			this.formData.data_set = DATASET.MANUAL_ROUTE_FFT;
		},

		localGetFormData(data) {
			return {
				id: this.itemId,
				equipment_id: this.equipmentData.id,
				location_in_equipment: data.location_in_equipment,
				data_set: DATASET.MANUAL_ROUTE_FFT
			};
		},

		localSubmit(formData) {
			this.toggleSubmitRequestResult({ isLoading: true });

			this.save_item({
				data: formData,
				itemName: 'Sensor'
			})
				.then(answer => {
					if (answer.value) {
						this.itemId = answer.value.id;
					}
					this.toggleSubmitRequestResult({ isLoading: false, success: true });
				})
				.catch(() => {
					this.toggleSubmitRequestResult({ isLoading: false, success: false });
				});
		},

		toggleSubmitRequestResult({ isLoading, success }) {
			if (isLoading) {
				this.$emit('event', { eventName: 'toggleSpinner', data: true });
			} else {
				this.$emit('event', {
					eventName: 'handleFormSubmitFinish',
					data: { isLoading, success }
				});
			}
		}
	}
};
</script>
