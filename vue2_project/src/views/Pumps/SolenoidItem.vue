<template>
	<el-form
		ref="itemForm"
		class="option-item-container solenoid-item-container"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="sensor_id">
			<label v-if="itemIndex == 0">{{ tt('Sensor') }}</label>
			<el-select
				:disabled="!sensorsList.length"
				v-model="formData.sensor_id"
				:placeholder="`${tt('select')} ${tt('sensor')}`"
			>
				<el-option
					v-for="item in sensorsList"
					:key="'solenoid_sensor_id-' + item.id"
					:label="setupLabel(item, sensorsLabelOptions)"
					:value="item.id"
				/>
			</el-select>
		</el-form-item>

		<el-form-item prop="position">
			<label v-if="itemIndex == 0">{{ tt('Position') }}</label>
			<el-input v-model="formData.position" />
		</el-form-item>

		<el-button
			class="action-button"
			size="mini"
			type="danger"
			icon="icomoon icon-cross"
			@click="removeItem"
		/>
	</el-form>
</template>

<script>
import { setupLabel } from '@/helpers';
import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		pump: {
			type: Object,
			default: () => null
		},

		sensorsList: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			formData: {
				pump_id: null,
				sensor_id: null,
				position: ''
			}
		};
	},

	computed: {
		rules: () => ({
			sensor_id: required,
			position: required
		}),

		sensorsLabelOptions: () => ({
			accessors: ['name', 'item_type', 'uuid'],
			delimeter: ','
		}),
		setupLabel: () => setupLabel,
	}
};
</script>
