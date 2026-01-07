<template>
	<div
		class="edit-form-container"
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
			<el-form-item label="Graco-pump" prop="graco_pump_id">
				<SimpleSpinner :active="graco_pumpsLoading" />
				<el-select
					:disabled="!graco_pumpsList.length"
					v-model="formData.graco_pump_id"
					:placeholder="`${tt('select')} ${tt('graco_pump')}`"
				>
					<el-option
						v-for="item in graco_pumpsList"
						:key="'graco_pump_id-' + item.id"
						:label="setupLabel(item, graco_pumpLabelOptions)"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('Sensor')" prop="sensor_id">
				<SimpleSpinner :active="sensorsLoading" />
				<el-select
					:disabled="!sensorsList.length"
					v-model="formData.sensor_id"
					:placeholder="`${tt('select')} ${tt('sensor')}`"
				>
					<el-option
						v-for="item in sensorsList"
						:key="'sensor_id-' + item.id"
						:label="setupLabel(item, sensorsLabelOptions)"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('Position')" prop="position">
				<el-input v-model="formData.position" />
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
import { mapState, mapActions } from 'vuex';
import { required } from '@/constants/validation';
import { setupLabel } from '@/helpers';

import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],

	props: {
		itemData: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			itemId: null,

			formData: {
				graco_pump_id: null,
				sensor_id: null,
				position: null
			},

			rules: {
				graco_pump_id: required,
				sensor_id: required,
				position: required
			}
		};
	},

	computed: {
		...mapState({
			graco_pumpsLoading: state => state.graco_pumps.isLoading,
			graco_pumpsList: state => state.graco_pumps.itemsList,
			sensorsLoading: state => state.sensors.isLoading,
			sensorsList: state => state.sensors.itemsList
		}),
		setupLabel: () => setupLabel,

		graco_pumpLabelOptions: () => ({
			accessors: ['id', 'lubricator.site_id'],
			delimeter: ','
		}),
		sensorsLabelOptions: () => ({
			accessors: ['equipment.asset_number', 'equipment.machine_name'],
			delimeter: '-'
		})
	},

	methods: {
		...mapActions({
			fetch_graco_pumps: 'graco_pumps/fetch_graco_pumps',
			set_graco_pumps: 'graco_pumps/set_graco_pumps',
			fetch_sensors: 'sensors/fetch_sensors',
			set_sensors: 'sensors/set_sensors'
		})
	},

	created() {
		const actions = ['fetch_graco_pumps', 'fetch_sensors'];
		this.operateRequestsList({ actions: actions, params: { max: -1 } });
	},

	beforeDestroy() {
		this.cleanLists(['set_graco_pumps', 'set_sensors']);
	}
};
</script>
