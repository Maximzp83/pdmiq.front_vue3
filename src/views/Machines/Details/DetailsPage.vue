<template>
	<div class="details-page main-instance-item">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div v-if="loadContent" class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="nested-view-content-wrapper">
					<div class="view-content-card">
						<div class="section-row header-block">
							<div class="card">
								<div class="card-content flex">
									<Datepicker
										setupDaterangeFilter
										enableShortcuts
										:value="filters.daterange"
										clearingTo="last_7_days"
										type="daterange"
										@input="setFilters"
									/>

									<el-button
										type="tertiary"
										class="ml-auto action-button"
										icon="icomoon icon-pencil"
										@click="editItem"
									/>
								</div>
							</div>
						</div>

						<div class="section-row">
							<div class="mrow flex wrap big-padding">
								<div class="mcol-xs-12 mcol-lg-6">
									<ItemInfoBlock
										:blockTitle="`${tt('Machine')} ${tt('details')}`"
										dotsInText
										:itemData="itemData"
										:settingsList="mainInfoSettingsList"
										:countersSettings="countersSettings"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemImagesBlock
										:itemData="itemData"
										showMockSrc="/static/img/machine_mock.jpg"
										mockClass="machine"
										@event="handleEvent"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemPDMsStatisticBlock
										:itemData="itemData"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
										:chartLegendEvents="chartLegendEvents"
										@event="handleEvent"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemWOStatisticBlock
										:createWOButtonFormSetup="createWOButtonFormSetup"
										:itemData="itemData"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
										@event="handleEvent"
									/>
								</div>

							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useMachinesStore } from '@/stores/MachinesStore';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import ItemInfoBlock from '@/components/itemDetails/ItemInfoBlock.vue';
import ItemImagesBlock from '@/components/itemDetails/ItemImagesBlock.vue';
import ItemPDMsStatisticBlock from '@/components/itemDetails/ItemPDMsStatisticBlock.vue';
import ItemWOStatisticBlock from '@/components/itemDetails/ItemWOStatisticBlock.vue';

const { tt } = Lang;

defineOptions({
	name: 'MachineDetailsPage',
});

const route = useRoute();
const machinesStore = useMachinesStore();
const { statistics_filters: filters } = storeToRefs(machinesStore);
const { changeRoute } = useNavigation();

const itemData = ref({});
const itemLoading = ref(false);
const loadContent = ref(false);

const itemsName = computed(() => ({
	one: tt('Machine'),
	mult: tt('Machines'),
}));
const predefinedFilters = computed(() => Object.freeze({
	machineId: itemData.value.id,
	productionLineId: itemData.value.production_line_id,
	plantId: itemData.value.plant_id,
}));
const mainInfoSettingsList = computed(() => Object.freeze([
	{ prop: 'productionLine.name', label: tt('production_Line') },
	{
		prop: 'locations',
		label: tt('Locations'),
		meta: { fromArray: { subProp: 'name' } },
	},
	{ prop: 'application.name', label: tt('Application') },
]));
const countersSettings = computed(() => Object.freeze({
	filter: { key: 'machineId', valueProp: 'id' },
	items: [
		{
			title: tt('Assets'),
			count: 'assets_count',
			iconName: 'assets',
			sectionClass: '.assets-list',
		},
		{
			title: tt('Items'),
			count: 'equipments_count',
			iconName: 'equipments',
			sectionClass: '.equipments-layout',
		},
	],
}));
const createWOButtonFormSetup = Object.freeze([
	{ formKey: 'production_line_id', valKey: 'production_line_id' },
	{ formKey: 'machine_id', valKey: 'id' },
]);
const chartLegendEvents = Object.freeze({});
const setFilters = (range) => {
	machinesStore.set_value('statistics_filters', {
		...filters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
	}, {
		toLocalStorage: { prop: 'machines_statistics_filters' },
	});
};
const editItem = () => {
	if (itemData.value.id) {
		changeRoute({ path: `/machines/${itemData.value.id}` });
	}
};
const fetchItem = () => {
	itemLoading.value = true;
	api_request.get(`/machines/${route.params.id}`, { notNotify: true })
		.then(({ value }) => {
			itemData.value = value || {};
			loadContent.value = true;
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

const { handleEvent } = useEventHandler({}, null);

onMounted(fetchItem);
</script>
