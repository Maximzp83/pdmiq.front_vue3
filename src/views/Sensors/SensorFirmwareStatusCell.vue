<template>
	<el-tooltip v-if="message" :content="message" placement="top">
		<span class="table-cell-icon sensor-firmware-status-icon">
			<i class="icomoon icon-warning"></i>
		</span>
	</el-tooltip>
	<span v-else>{{ value || '-' }}</span>
</template>

<script setup>
import { computed } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'SensorFirmwareStatusCell',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	value: { type: [String, Number], default: '' },
});

const message = computed(() => {
	const deviceData = props.itemData?.device_data;
	if (deviceData?.SenFwVer && props.itemData?.has_wrong_firmware_version) {
		return `${tt('phrases.Wrong_sensor_firmware_version')}: ${deviceData.SenFwVer}`;
	}
	return '';
});
</script>
