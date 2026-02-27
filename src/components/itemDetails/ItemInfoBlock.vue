<template>
	<div class="card block-item">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase" v-text="blockTitle"></div>
		</div>

		<div class="card-content flex column">
			<ul
				:class="[
					'section-row info-list',
					infoListClassName,
					{ 'dots-in-text': dotsInText }
				]"
			>
				<InfoItem
					v-for="item in settingsList"
					:key="`info-${item.label}`"
					:settingItem="item"
					:itemData="itemData"
				/>

				<template v-if="additionalInfoItems">
					<InfoItem
						v-for="secItem in additionalInfoItems.settingsList"
						:key="`info-${secItem.label}`"
						:settingItem="
							additionalInfoItems.constSettingItem
								? additionalInfoItems.constSettingItem
								: secItem
						"
						:itemData="additionalInfoItems.constSettingItem ? secItem : itemData"
					/>
				</template>
			</ul>

			<div v-if="usedCountersList.length" class="section-row relative counters-list">
				<SimpleSpinner :active="countersLoading" />
				<div class="mrow flex">
					<CounterItem
						v-for="item in usedCountersList"
						:key="`counter-${item.title}`"
						:counterData="item"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import CounterItem from './CounterItem.vue';
import InfoItem from './InfoItem.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

defineOptions({
	name: 'ItemInfoBlock',
});

const props = defineProps({
	itemData: {
		type: Object,
		required: true,
	},
	blockTitle: {
		type: String,
		default: '',
	},
	settingsList: {
		type: Array,
		default: () => [],
	},
	countersSettings: {
		type: Object,
		default: null,
	},
	infoListClassName: {
		type: String,
		default: '',
	},
	dotsInText: Boolean,
	additionalInfoItems: {
		type: Object,
		default: null,
	},
});

const countersLoading = ref(false);

const usedCountersList = computed(() => {
	if (!props.countersSettings) {
		return [];
	}

	const { items = [] } = props.countersSettings;
	return items.map((item) => ({ ...item, count: props.itemData[item.count] }));
});
</script>
