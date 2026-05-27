<template>
	<div class="details-page fix-height main-instance-item">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div v-if="loadContent" class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="nested-view-content-wrapper">
					<div class="view-content-card">
						<div class="section-row">
							<div class="mrow flex wrap big-padding">
								<div class="mcol-xs-12 mcol-lg-6">
									<ItemInfoBlock
										:blockTitle="`${tt('Part_Number')} ${tt('details')}`"
										dotsInText
										:itemData="itemData"
										:settingsList="mainInfoSettingsList"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemImagesBlock
										:itemData="itemData"
										imgObjFitContain
										@event="handleEvent"
									/>
								</div>

								<div class="mcol-xs-12">
									<LocationList
										preventSetNavbar
										fromDetailsPage
										showCardHeader
										:propsFilters="itemsListsFilters"
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
import { computed, ref, watch } from 'vue';

import { createGetByIdRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { setupTypeOptionsValuesList } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemImagesBlock from '@/components/itemDetails/ItemImagesBlock.vue';
import ItemInfoBlock from '@/components/itemDetails/ItemInfoBlock.vue';
import LocationList from './LocationList.vue';

const { tt } = Lang;

defineOptions({
	name: 'BrandModelDetailsPage',
});

const emit = defineEmits(['event']);

const globalStore = useGlobalStore();
const equipmentTypesEntity = ENTITIES.EquipmentTypes;

const equipmentTypeData = ref(null);

const localPageTitle = (item) => item?.name || tt('phrases.part_number_without_name');

const { itemData, itemLoading, loadContent, itemsName } = useItemPage({
	entityKey: 'BrandModels',
	localPageTitle,
});

const fetchEquipmentTypeById = createGetByIdRequest(equipmentTypesEntity.apiBase);

const itemsListsFilters = computed(() => {
	if (!loadContent.value || !itemData.value?.id) {
		return {};
	}

	return Object.freeze({
		isStoreroom: true,
		brandModelId: itemData.value.id,
		page: 1,
		max: -1,
	});
});

const currentDataList = computed(() =>
	Object.freeze(itemData.value?.type_option_values || []),
);

const typeOptionsValuesList = computed(() => {
	if (equipmentTypeData.value && currentDataList.value.length) {
		return Object.freeze(
			setupTypeOptionsValuesList(currentDataList.value, equipmentTypeData.value),
		);
	}

	return [];
});

const mainInfoSettingsList = computed(() => {
	let settings = [
		{ label: tt('Part_Number'), prop: 'name' },
		{ label: tt('Brand'), prop: 'brand.name' },
	];

	if (typeOptionsValuesList.value.length) {
		settings = settings.concat(typeOptionsValuesList.value);
	}

	return Object.freeze(settings);
});

const updateNavbar = (item) => {
	globalStore.setup_navbar({
		showStandardNavItem: true,
		pageTitle: item?.name || tt('phrases.part_number_without_name'),
		showPlantName: { name: item?.plant?.name || '' },
	});
};

watch(
	() => itemData.value,
	(item) => {
		if (!item) {
			return;
		}

		updateNavbar(item);

		if (item.type_id) {
			fetchEquipmentTypeById({
				itemId: item.type_id,
			}).then(({ value }) => {
				equipmentTypeData.value = value;
			});
		} else {
			equipmentTypeData.value = null;
		}
	},
	{ immediate: true },
);

const methodsMap = {};
const { handleEvent } = useEventHandler(methodsMap, emit);
</script>
