<template>
	<div class="pdm-button-item">
		<a
			:class="[
				'el-button el-button--primary',
				'inverted',
				{ active: currentPath === buttonPath },
			]"
			@click.prevent="linkClick"
		>
			<span v-if="isSensor" class="icons-list">
				<i
					v-for="icon in currentSensorType.icons"
					:key="`icon-${icon}`"
					:class="`icomoon icon-${icon}`"
				></i>
			</span>

			<b v-if="isSensor">{{ tt('PDM') }}</b>
			<b v-else-if="isMultiView">{{ tt('Multi_view') }}</b>
		</a>

		<div class="location">{{ locationInEquipment }}</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { Lang } from '@/localization';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useSensorType } from '@/composables/mixins/useSensorType';

const { tt } = Lang;

defineOptions({ name: 'EquipmentPdmButton' });

const props = defineProps({
	itemData: { type: Object, required: true },
	routeParamsId: { type: Number, default: null },
	isSensor: Boolean,
	buttonTextKey: { type: String, default: '' },
	isMultiView: Boolean,
});
const emit = defineEmits(['forceRerender']);

const route = useRoute();
const { changeRoute } = useNavigation();
const currentSensorTypeData = computed(() => (props.isSensor ? props.itemData : null));
const { currentSensorType } = useSensorType({ currentSensorTypeData });

const locationInEquipment = computed(() =>
	props.isSensor ? props.itemData.location_in_equipment : props.itemData[props.buttonTextKey],
);
const currentPath = computed(() => route.fullPath);
const buttonPath = computed(() => {
	if (props.isSensor) {
		return `/equipments/${props.routeParamsId}/details/pdm/${props.itemData.id}`;
	}
	if (props.isMultiView) {
		return `/equipments/${props.routeParamsId}/details/multi-view/${props.itemData.id}`;
	}
	return '';
});

const linkClick = () => {
	changeRoute({ path: buttonPath.value });
	emit('forceRerender');
};
</script>
