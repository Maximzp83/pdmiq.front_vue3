<template>
	<div>
		<div class="title bold">{{ `${tt('Part')}: ${ equipmentTypeData.brand_model_name || '' }` }}</div>
		<ul class="info-list typeOptions">
			<InfoItem
				v-for="item in typeOptions"
				:key="`footer-${item.id}`"
				:settingItem="item"
				labelClassName="capitalize"
				:valueMethod="getTypeOptionValue"
				keyProp="name"
			/>
		</ul>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { Lang } from '@/localization';
import InfoItem from '@/components/itemDetails/InfoItem.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentCardTypeOptionBlock' });

const props = defineProps({
	equipmentTypeData: { type: Object, required: true },
});

const typeOptions = computed(() =>
	Object.freeze(
		(props.equipmentTypeData.typeOptions || []).filter(
			(option) => option.raw_values?.length && option.is_in_equipment_card,
		),
	),
);

const getTypeOptionValue = ({ raw_values = [] }) => raw_values.map((value) => ` ${value}`).join('');
</script>
