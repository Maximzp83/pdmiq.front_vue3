<template>
	<div class="isolated-select-container">
		<el-select
			:filterable="filterable"
			:disabled="disabled"
			v-model="value"
			:placeholder="`${tt('Select')} ${tt('external_sensor')}`"
		>
			<el-option
				v-for="item in itemsList"
				:key="'external_sensor_id-' + item.external_sensor_id"
				:value="item.external_sensor_id"
				:label="item.equipment.machine_name"
			>
				<span>{{ item.equipment.machine_name || item.external_sensor_id }}</span>
			</el-option>
		</el-select>
	</div>
</template>

<script>
export default {
	props: {
		filterable: Boolean,
		disabled: Boolean,
		multiple: Boolean,
		itemsList: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			value: null
		};
	}
};
</script>
