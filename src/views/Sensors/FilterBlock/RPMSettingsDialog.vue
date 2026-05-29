<template>
	<div class="rpm-settings-list">
		<div class="section-row">
			<div class="rpm-settings-grid">
				<div class="rpm-settings-grid__header">
					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--option"></div>
					<div class="bold rpm-settings-grid__cell rpm-settings-grid__cell--value">RPM</div>
					<div class="bold rpm-settings-grid__cell rpm-settings-grid__cell--value">Hz</div>
				</div>

				<div
					v-for="item in preparedItemSpeedOptionsList"
					:key="`rpm-source-${item.id}`"
					:class="['rpm-settings-grid__row', { 'is-active': isActive(item) }]"
					@click="handleSelect(item)"
				>
					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--option el-checkbox">
						<span :class="['el-checkbox__input', { 'is-checked': isActive(item) }]">
							<span class="el-checkbox__inner"></span>
						</span>
						<span class="rpm-settings-grid__label capitalize" v-html="item.name" />
					</div>

					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--value">
						<CustomInput
							v-if="item.hasInput && isActive(item)"
							v-model="rpmSourceItem.value"
							class="mini additional-input-cell"
							@click.stop
						/>
						<span v-else>{{ formatValue(getRpmValue(item)) }}</span>
					</div>

					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--value">
						<span>{{ formatValue(getHzValue(item), 2) }}</span>
					</div>
				</div>
			</div>
		</div>

		<div class="dialog-footer dialog-decorate-footer text-center">
			<el-button type="primary" class="uppercase semi-bold" @click="handleSave">
				{{ tt('Save') }}
			</el-button>

			<el-button class="uppercase semi-bold" @click="$emit('close')">
				{{ tt('Cancel') }}
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { Lang } from '@/localization';
import { setupItemSpeedOptionsList } from '@/helpers/specialHelpers';
import { itemSpeedOptionsList, ITEM_SPEED_OPTIONS } from '@/constants/global';

const { tt } = Lang;

defineOptions({
	name: 'RPMSettingsDialog',
});

const props = defineProps({
	sensorData: { type: Object, default: () => ({}) },
	rootFilters: { type: Object, default: () => ({}) },
	fftItem: { type: Object, default: null },
	currentRpmSource: { type: Object, default: null },
});

const emit = defineEmits(['save', 'close']);
const rpmSourceItem = ref({ ...(props.currentRpmSource || {}) });

const preparedItemSpeedOptionsList = computed(() =>
	setupItemSpeedOptionsList({
		sensorData: props.sensorData,
		itemSpeedOptionsList: itemSpeedOptionsList(),
		fftItem: props.fftItem,
		rootFilters: props.rootFilters,
	}),
);

const isActive = (item) => rpmSourceItem.value && rpmSourceItem.value.id === item.id;
const handleSelect = (item) => {
	rpmSourceItem.value = {
		id: item.id,
		value: getRpmValue(item),
	};
};
const getRpmValue = (item) => {
	if (isActive(item) && rpmSourceItem.value) return rpmSourceItem.value.value;
	return item.rpmValue != null ? item.rpmValue : item.value;
};
const getHzValue = (item) => {
	const rpmValue = getRpmValue(item);
	return rpmValue != null && rpmValue !== '' && !Number.isNaN(+rpmValue) ? +rpmValue / 60 : null;
};
const formatValue = (value, fixed = 0) => {
	if (value == null || value === '' || Number.isNaN(+value)) return '-';
	return (+value).toFixed(fixed);
};
const handleSave = () => {
	if (!rpmSourceItem.value?.id) return;

	const data = {
		rpm_source_item: rpmSourceItem.value.id,
	};

	if (rpmSourceItem.value.id === ITEM_SPEED_OPTIONS.MANUAL_RPM) {
		data.rpm_value = +rpmSourceItem.value.value;
	} else if (rpmSourceItem.value.id === 'fft-rpm') {
		data.rpm_value = +rpmSourceItem.value.value;
		data.isFFTRPM = true;
	}

	emit('save', data);
};

watch(
	() => props.currentRpmSource,
	(value) => {
		rpmSourceItem.value = { ...(value || {}) };
	},
	{ immediate: true },
);
</script>

<style lang="scss" scoped>
.rpm-settings-grid {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.rpm-settings-grid__header,
.rpm-settings-grid__row {
	display: grid;
	grid-template-columns: minmax(0, 1.5fr) minmax(90px, 120px) minmax(90px, 120px);
	gap: 12px;
	align-items: center;
}

.rpm-settings-grid__header {
	font-weight: 600;
}

.rpm-settings-grid__row {
	max-height: 35px;
	height: 35px;
	box-sizing: border-box;
	cursor: pointer;
}

.rpm-settings-grid__cell--option {
	display: flex;
	align-items: center;
	gap: 10px;
}

.rpm-settings-grid__cell--value {
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;

	.custom-input {
		width: 60px;
		margin: 0;

		:deep(input) {
			height: 24px;
			line-height: 24px;
			box-sizing: border-box;
			text-align: center;
			padding: 2px 4px !important;
		}
	}
}

.rpm-settings-grid__label {
	line-height: 1.3;
}
</style>
